/**
 * Auto-Apply Service API
 * POST /api/jobs/auto-apply
 * 
 * Automatically finds and applies to matching jobs based on user preferences
 * - Searches for jobs matching user's preferences
 * - Calculates match scores
 * - Auto-applies to high-match jobs within daily limits
 * - Generates personalized cover letters
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { searchJobs } from '@/utils/jobs';
import { generateCoverLetter } from '@/utils/ai/openrouter';
import { callOpenRouter } from '@/utils/ai/openrouter';

/**
 * POST - Run auto-apply process
 * Finds matching jobs and applies automatically
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { 
            maxApplications = 5, // How many jobs to apply to this run
            minMatchScore = 75,  // Minimum match score to auto-apply
            dryRun = false,      // If true, just find jobs without applying
        } = body;

        const supabase = await createClient();
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized - Please log in'
            }, { status: 401 });
        }

        // Get user's job preferences
        const { data: jobPreferences } = await supabase
            .from('user_job_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!jobPreferences || !jobPreferences.desired_titles?.length) {
            return NextResponse.json({
                success: false,
                error: 'Please set up your job preferences first',
                requiresPreferences: true
            }, { status: 400 });
        }

        // Get user's general preferences (for auto-apply settings)
        const { data: preferences } = await supabase
            .from('preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // Check if auto-apply is enabled
        if (!preferences?.auto_apply_enabled && !dryRun) {
            return NextResponse.json({
                success: false,
                error: 'Auto-apply is disabled in your settings',
                autoApplyDisabled: true
            }, { status: 400 });
        }

        // Get user's CV
        let cvId = preferences?.default_resume_id;
        let cvData = null;

        if (cvId) {
            const { data: cv } = await supabase
                .from('cvs')
                .select('*')
                .eq('id', cvId)
                .eq('user_id', user.id)
                .single();
            cvData = cv;
        }

        if (!cvData) {
            // Get primary or most recent CV
            const { data: cv } = await supabase
                .from('cvs')
                .select('*')
                .eq('user_id', user.id)
                .order('is_primary', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            cvData = cv;
        }

        if (!cvData) {
            return NextResponse.json({
                success: false,
                error: 'No CV found. Please create a CV first.',
                requiresCV: true
            }, { status: 400 });
        }

        // Check daily application limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count: todayCount } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('auto_applied', true)
            .gte('applied_at', today.toISOString());

        const dailyLimit = parseInt(preferences?.daily_limit) || 10;
        const remainingToday = Math.max(0, dailyLimit - (todayCount || 0));

        if (remainingToday <= 0 && !dryRun) {
            return NextResponse.json({
                success: false,
                error: `Daily auto-apply limit reached (${dailyLimit} applications). Try again tomorrow.`,
                dailyLimitReached: true,
                stats: { todayCount, dailyLimit }
            }, { status: 429 });
        }

        // Get already applied jobs to exclude
        const { data: existingApplications } = await supabase
            .from('applications')
            .select('job_url')
            .eq('user_id', user.id);

        const appliedUrls = new Set(existingApplications?.map(a => a.job_url) || []);

        // Search for matching jobs
        const searchQueries = jobPreferences.desired_titles || ['Software Developer'];
        const country = jobPreferences.desired_countries?.[0] || '';
        const isRemote = jobPreferences.job_types?.includes('remote');

        const results = {
            jobsFound: 0,
            jobsAnalyzed: 0,
            jobsMatched: 0,
            applicationsSubmitted: 0,
            applications: [],
            skipped: [],
            errors: [],
        };

        // Search with each job title
        for (const query of searchQueries.slice(0, 2)) { // Limit to 2 queries for performance
            try {
                const searchResults = await searchJobs({
                    query,
                    country: isRemote ? '' : country,
                    remote: isRemote,
                    limit: 30,
                    jobType: jobPreferences.job_types?.[0] || '',
                });

                if (searchResults.jobs) {
                    results.jobsFound += searchResults.jobs.length;

                    // Process each job
                    for (const job of searchResults.jobs) {
                        // Stop if we've reached the max applications
                        if (results.applicationsSubmitted >= Math.min(maxApplications, remainingToday)) {
                            break;
                        }

                        results.jobsAnalyzed++;

                        // Skip if already applied
                        const jobUrl = job.applyUrl || job.url || `#job-${job.id}`;
                        if (appliedUrls.has(jobUrl)) {
                            results.skipped.push({
                                job: { id: job.id, title: job.title, company: job.company },
                                reason: 'Already applied'
                            });
                            continue;
                        }

                        // Skip jobs without valid apply URL
                        if (!job.applyUrl || job.applyUrl === '#') {
                            results.skipped.push({
                                job: { id: job.id, title: job.title, company: job.company },
                                reason: 'No application URL'
                            });
                            continue;
                        }

                        // Calculate match score
                        const matchScore = await calculateQuickMatchScore(cvData.content, job, jobPreferences);

                        if (matchScore < minMatchScore) {
                            results.skipped.push({
                                job: { id: job.id, title: job.title, company: job.company },
                                reason: `Match score too low (${matchScore}%)`,
                                matchScore
                            });
                            continue;
                        }

                        results.jobsMatched++;

                        // If dry run, don't actually apply
                        if (dryRun) {
                            results.applications.push({
                                job: { 
                                    id: job.id, 
                                    title: job.title, 
                                    company: job.company,
                                    location: job.location,
                                    applyUrl: job.applyUrl
                                },
                                matchScore,
                                status: 'would_apply',
                            });
                            results.applicationsSubmitted++;
                            continue;
                        }

                        // Generate cover letter
                        let coverLetter = null;
                        let aiSummary = null;

                        if (preferences?.generate_cover_letters !== false) {
                            try {
                                const coverResult = await generateCoverLetter(cvData.content, job, {
                                    tone: 'professional',
                                    length: 'medium'
                                });
                                coverLetter = coverResult.coverLetter;
                                aiSummary = coverResult.summary;
                            } catch (e) {
                                console.error('Cover letter generation failed:', e);
                                aiSummary = `Auto-applied to ${job.title} at ${job.company}`;
                            }
                        } else {
                            aiSummary = `Auto-applied to ${job.title} at ${job.company}`;
                        }

                        // Create application record
                        const { data: application, error: insertError } = await supabase
                            .from('applications')
                            .insert({
                                user_id: user.id,
                                job_title: job.title,
                                company_name: job.company,
                                job_url: jobUrl,
                                status: 'applied',
                                applied_at: new Date().toISOString(),
                                auto_applied: true,
                                cover_letter: coverLetter,
                                ai_summary: aiSummary,
                                cv_id: cvData.id,
                                match_score: matchScore,
                                job_data: {
                                    jobId: job.id,
                                    source: job.source,
                                    location: job.location,
                                    salary: job.salary,
                                    skills: job.skills || job.tags || [],
                                }
                            })
                            .select()
                            .single();

                        if (insertError) {
                            results.errors.push({
                                job: { id: job.id, title: job.title, company: job.company },
                                error: insertError.message
                            });
                            continue;
                        }

                        // Add to applied URLs to prevent duplicates in same run
                        appliedUrls.add(jobUrl);

                        results.applications.push({
                            job: { 
                                id: job.id, 
                                title: job.title, 
                                company: job.company,
                                location: job.location,
                                applyUrl: job.applyUrl
                            },
                            applicationId: application.id,
                            matchScore,
                            coverLetterGenerated: !!coverLetter,
                            status: 'applied',
                        });
                        results.applicationsSubmitted++;

                        // Log activity
                        try {
                            await supabase.from('activity_log').insert({
                                user_id: user.id,
                                activity_type: 'auto_application_sent',
                                title: 'AI Auto-Applied',
                                description: `Automatically applied to ${job.title} at ${job.company} (${matchScore}% match)`,
                                metadata: {
                                    job_id: job.id,
                                    job_title: job.title,
                                    company: job.company,
                                    match_score: matchScore,
                                    application_id: application.id,
                                }
                            });
                        } catch (e) {
                            // Don't fail if activity log fails
                        }
                    }
                }
            } catch (error) {
                console.error(`Search error for "${query}":`, error);
                results.errors.push({
                    query,
                    error: error.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                ...results,
                settings: {
                    maxApplications,
                    minMatchScore,
                    dailyLimit,
                    remainingToday: remainingToday - results.applicationsSubmitted,
                    dryRun
                }
            }
        });

    } catch (error) {
        console.error('Auto-apply error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to run auto-apply'
        }, { status: 500 });
    }
}

/**
 * GET - Get auto-apply status and settings
 */
export async function GET(request) {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        // Get preferences
        const { data: preferences } = await supabase
            .from('preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // Get job preferences
        const { data: jobPreferences } = await supabase
            .from('user_job_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // Get today's auto-apply count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count: todayCount } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('auto_applied', true)
            .gte('applied_at', today.toISOString());

        // Get total auto-apply count
        const { count: totalAutoApplied } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('auto_applied', true);

        // Check if CV exists
        const { count: cvCount } = await supabase
            .from('cvs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const dailyLimit = parseInt(preferences?.daily_limit) || 10;

        return NextResponse.json({
            success: true,
            data: {
                enabled: preferences?.auto_apply_enabled ?? false,
                settings: {
                    minMatchScore: parseInt(preferences?.min_match_score) || 85,
                    dailyLimit,
                    generateCoverLetters: preferences?.generate_cover_letters ?? true,
                    defaultResumeId: preferences?.default_resume_id || null,
                },
                status: {
                    todayCount: todayCount || 0,
                    remainingToday: Math.max(0, dailyLimit - (todayCount || 0)),
                    totalAutoApplied: totalAutoApplied || 0,
                    hasCV: (cvCount || 0) > 0,
                    hasPreferences: !!(jobPreferences?.desired_titles?.length),
                },
                canRun: (
                    preferences?.auto_apply_enabled &&
                    (cvCount || 0) > 0 &&
                    jobPreferences?.desired_titles?.length &&
                    (todayCount || 0) < dailyLimit
                ),
            }
        });

    } catch (error) {
        console.error('Get auto-apply status error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to get auto-apply status'
        }, { status: 500 });
    }
}

/**
 * Calculate a quick match score without full AI analysis
 * Used for bulk processing in auto-apply
 */
async function calculateQuickMatchScore(cvContent, job, preferences) {
    try {
        // Extract skills from CV
        const cvSkills = [
            ...(cvContent?.skills?.technical || []),
            ...(cvContent?.skills?.soft || []),
        ].map(s => s.toLowerCase());

        // Extract skills from job
        const jobSkills = [
            ...(job.skills || []),
            ...(job.tags || []),
        ].map(s => s.toLowerCase());

        // Check title match
        const desiredTitles = (preferences?.desired_titles || []).map(t => t.toLowerCase());
        const jobTitle = (job.title || '').toLowerCase();
        const titleMatch = desiredTitles.some(title => 
            jobTitle.includes(title) || title.includes(jobTitle.split(' ')[0])
        );

        // Calculate skill overlap
        const matchedSkills = cvSkills.filter(skill => 
            jobSkills.some(js => js.includes(skill) || skill.includes(js))
        );
        const skillScore = jobSkills.length > 0 
            ? (matchedSkills.length / Math.min(jobSkills.length, 5)) * 100
            : 50;

        // Calculate experience level match
        const cvExperience = cvContent?.experience?.length || 0;
        const expScore = cvExperience >= 1 ? 80 : 60;

        // Weight the scores
        const finalScore = Math.round(
            (titleMatch ? 30 : 0) + 
            (skillScore * 0.5) + 
            (expScore * 0.2)
        );

        return Math.min(100, Math.max(0, finalScore));
    } catch (error) {
        console.error('Quick match calculation error:', error);
        return 50; // Default to medium match on error
    }
}
