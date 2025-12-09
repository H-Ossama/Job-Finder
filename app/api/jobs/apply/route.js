/**
 * Job Application API
 * POST /api/jobs/apply
 * 
 * Handles job applications - both manual and auto-apply
 * - Generates AI-powered cover letters
 * - Tracks application status
 * - Opens application page in background (for manual apply) or records auto-application
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateCoverLetter, tailorCVForJob } from '@/utils/ai/openrouter';

export async function POST(request) {
    try {
        const body = await request.json();
        const { 
            jobId,
            jobData,          // Job details (title, company, description, applyUrl, etc.)
            autoApply = false, // Is this an auto-application?
            generateCover = true, // Generate AI cover letter?
            cvId = null,      // Specific CV to use (null = primary CV)
        } = body;

        if (!jobId || !jobData) {
            return NextResponse.json({
                success: false,
                error: 'Job ID and job data are required'
            }, { status: 400 });
        }

        const supabase = await createClient();
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized - Please log in to apply'
            }, { status: 401 });
        }

        // Check if already applied to this job
        const { data: existingApplication } = await supabase
            .from('applications')
            .select('id')
            .eq('user_id', user.id)
            .eq('job_url', jobData.applyUrl || jobData.url || jobId)
            .single();

        if (existingApplication) {
            return NextResponse.json({
                success: false,
                error: 'You have already applied to this job',
                alreadyApplied: true
            }, { status: 400 });
        }

        // Get user's CV for cover letter generation
        let cvData = null;
        if (cvId) {
            const { data: cv } = await supabase
                .from('cvs')
                .select('*')
                .eq('id', cvId)
                .eq('user_id', user.id)
                .single();
            cvData = cv;
        } else {
            // Get primary CV or most recent
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
                error: 'No CV found. Please create a CV first to apply.',
                requiresCV: true
            }, { status: 400 });
        }

        // Get user's preferences for cover letter personalization
        const { data: preferences } = await supabase
            .from('preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // Generate AI cover letter if enabled
        let coverLetter = null;
        let aiSummary = null;
        
        if (generateCover) {
            try {
                const coverLetterResult = await generateCoverLetter(
                    cvData.content,
                    jobData,
                    {
                        tone: preferences?.cover_letter_tone || 'professional',
                        length: preferences?.cover_letter_length || 'medium',
                    }
                );
                coverLetter = coverLetterResult.coverLetter;
                aiSummary = coverLetterResult.summary;
            } catch (error) {
                console.error('Cover letter generation failed:', error);
                // Continue without cover letter - don't fail the application
            }
        }

        // Create application record
        const applicationData = {
            user_id: user.id,
            job_title: jobData.title || 'Unknown Position',
            company_name: jobData.company || 'Unknown Company',
            job_url: jobData.applyUrl || jobData.url || `#job-${jobId}`,
            status: 'applied',
            applied_at: new Date().toISOString(),
            auto_applied: autoApply,
            cover_letter: coverLetter,
            ai_summary: aiSummary,
            cv_id: cvData.id,
            job_data: {
                jobId,
                source: jobData.source,
                location: jobData.location,
                salary: jobData.salary,
                skills: jobData.skills || jobData.tags || [],
                description: jobData.description?.substring(0, 1000),
            }
        };

        const { data: application, error: insertError } = await supabase
            .from('applications')
            .insert(applicationData)
            .select()
            .single();

        if (insertError) {
            console.error('Application insert error:', insertError);
            return NextResponse.json({
                success: false,
                error: 'Failed to record application'
            }, { status: 500 });
        }

        // Log activity
        try {
            await supabase.from('activity_log').insert({
                user_id: user.id,
                activity_type: autoApply ? 'auto_application_sent' : 'application_sent',
                title: autoApply ? 'AI Auto-Applied' : 'Applied to Job',
                description: `${autoApply ? 'AI automatically applied' : 'Applied'} to ${jobData.title} at ${jobData.company}`,
                metadata: {
                    job_id: jobId,
                    job_title: jobData.title,
                    company: jobData.company,
                    application_id: application.id,
                }
            });
        } catch (e) {
            // Don't fail if activity log fails
        }

        return NextResponse.json({
            success: true,
            data: {
                applicationId: application.id,
                coverLetter,
                aiSummary,
                applyUrl: jobData.applyUrl || jobData.url,
                autoApplied: autoApply,
                message: autoApply 
                    ? 'Application submitted successfully via AI auto-apply'
                    : 'Application recorded - please complete on company site'
            }
        });

    } catch (error) {
        console.error('Application API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process application'
        }, { status: 500 });
    }
}

/**
 * GET /api/jobs/apply
 * Get user's application history and stats
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

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter'); // 'auto', 'manual', 'all'
        const status = searchParams.get('status'); // 'applied', 'interview', etc.

        let query = supabase
            .from('applications')
            .select('*')
            .eq('user_id', user.id)
            .order('applied_at', { ascending: false });

        if (filter === 'auto') {
            query = query.eq('auto_applied', true);
        } else if (filter === 'manual') {
            query = query.eq('auto_applied', false);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data: applications, error } = await query;

        if (error) {
            throw error;
        }

        // Calculate stats
        const stats = {
            total: applications?.length || 0,
            autoApplied: applications?.filter(a => a.auto_applied).length || 0,
            manual: applications?.filter(a => !a.auto_applied).length || 0,
            interviews: applications?.filter(a => a.status === 'interview' || a.status === 'interviewing').length || 0,
            offers: applications?.filter(a => a.status === 'offer').length || 0,
            rejected: applications?.filter(a => a.status === 'rejected').length || 0,
        };

        return NextResponse.json({
            success: true,
            data: {
                applications,
                stats
            }
        });

    } catch (error) {
        console.error('Get applications error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to get applications'
        }, { status: 500 });
    }
}
