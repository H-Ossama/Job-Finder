/**
 * Save/Bookmark Job API Endpoint
 * POST /api/jobs/save - Save a job
 * DELETE /api/jobs/save - Remove saved job
 * GET /api/jobs/save - Get user's saved jobs
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
    try {
        const supabase = await createClient();
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized',
            }, { status: 401 });
        }

        // Get saved jobs with job details
        const { data: savedJobs, error } = await supabase
            .from('saved_jobs')
            .select(`
                id,
                notes,
                created_at,
                jobs_cache (
                    id,
                    external_id,
                    source,
                    title,
                    company,
                    company_logo,
                    location,
                    location_type,
                    salary_min,
                    salary_max,
                    salary_currency,
                    job_type,
                    description,
                    skills,
                    apply_url,
                    posted_at
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Transform the data
        const jobs = savedJobs.map(saved => ({
            savedId: saved.id,
            savedAt: saved.created_at,
            notes: saved.notes,
            ...transformJobFromCache(saved.jobs_cache),
        })).filter(job => job.id); // Filter out jobs where cache entry was deleted

        return NextResponse.json({
            success: true,
            data: {
                jobs,
                total: jobs.length,
            },
        });

    } catch (error) {
        console.error('Get saved jobs error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to get saved jobs',
            message: error.message,
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const supabase = await createClient();
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized',
            }, { status: 401 });
        }

        const body = await request.json();
        const { jobId, notes = '' } = body;

        if (!jobId) {
            return NextResponse.json({
                success: false,
                error: 'Job ID is required',
            }, { status: 400 });
        }

        // Parse job ID to get source and external ID
        const [source, externalId] = jobId.split('_');
        
        if (!source || !externalId) {
            return NextResponse.json({
                success: false,
                error: 'Invalid job ID format',
            }, { status: 400 });
        }

        // Find the job in cache
        const { data: cachedJob, error: cacheError } = await supabase
            .from('jobs_cache')
            .select('id')
            .eq('source', source)
            .eq('external_id', externalId)
            .single();

        if (cacheError || !cachedJob) {
            return NextResponse.json({
                success: false,
                error: 'Job not found in cache. Please search for the job again.',
            }, { status: 404 });
        }

        // Save the job
        const { data: savedJob, error: saveError } = await supabase
            .from('saved_jobs')
            .insert({
                user_id: user.id,
                job_id: cachedJob.id,
                notes,
            })
            .select()
            .single();

        if (saveError) {
            // Check if already saved (unique constraint violation)
            if (saveError.code === '23505') {
                return NextResponse.json({
                    success: false,
                    error: 'Job already saved',
                }, { status: 409 });
            }
            throw saveError;
        }

        // Log activity
        await supabase.from('activity_log').insert({
            user_id: user.id,
            activity_type: 'job_saved',
            title: 'Saved a job',
            metadata: { job_id: jobId },
        }).catch(() => {});

        return NextResponse.json({
            success: true,
            data: {
                id: savedJob.id,
                jobId,
                savedAt: savedJob.created_at,
            },
        });

    } catch (error) {
        console.error('Save job error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to save job',
            message: error.message,
        }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const supabase = await createClient();
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized',
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');
        const savedId = searchParams.get('savedId');

        if (!jobId && !savedId) {
            return NextResponse.json({
                success: false,
                error: 'Job ID or saved ID is required',
            }, { status: 400 });
        }

        let query = supabase
            .from('saved_jobs')
            .delete()
            .eq('user_id', user.id);

        if (savedId) {
            query = query.eq('id', savedId);
        } else {
            // Find by job external ID
            const [source, externalId] = jobId.split('_');
            
            const { data: cachedJob } = await supabase
                .from('jobs_cache')
                .select('id')
                .eq('source', source)
                .eq('external_id', externalId)
                .single();

            if (cachedJob) {
                query = query.eq('job_id', cachedJob.id);
            } else {
                return NextResponse.json({
                    success: false,
                    error: 'Job not found',
                }, { status: 404 });
            }
        }

        const { error: deleteError } = await query;

        if (deleteError) {
            throw deleteError;
        }

        return NextResponse.json({
            success: true,
            message: 'Job unsaved successfully',
        });

    } catch (error) {
        console.error('Unsave job error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to unsave job',
            message: error.message,
        }, { status: 500 });
    }
}

// Helper to transform cached job data
function transformJobFromCache(cachedJob) {
    if (!cachedJob) return {};
    
    return {
        id: `${cachedJob.source}_${cachedJob.external_id}`,
        externalId: cachedJob.external_id,
        source: cachedJob.source,
        title: cachedJob.title,
        company: cachedJob.company,
        companyLogo: cachedJob.company_logo,
        location: cachedJob.location,
        locationType: cachedJob.location_type,
        salary: formatSalary(cachedJob),
        salaryMin: cachedJob.salary_min,
        salaryMax: cachedJob.salary_max,
        jobType: cachedJob.job_type,
        description: cachedJob.description,
        skills: cachedJob.skills || [],
        applyUrl: cachedJob.apply_url,
        postedAt: cachedJob.posted_at,
    };
}

function formatSalary(job) {
    if (!job.salary_min && !job.salary_max) return '';
    
    const currency = job.salary_currency || 'USD';
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '';
    
    const formatNum = (num) => {
        if (num >= 1000) return `${Math.round(num / 1000)}k`;
        return num.toString();
    };
    
    if (job.salary_min && job.salary_max) {
        return `${symbol}${formatNum(job.salary_min)} - ${symbol}${formatNum(job.salary_max)}`;
    }
    if (job.salary_min) return `From ${symbol}${formatNum(job.salary_min)}`;
    if (job.salary_max) return `Up to ${symbol}${formatNum(job.salary_max)}`;
    return '';
}
