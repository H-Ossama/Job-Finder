/**
 * Job Search API Endpoint
 * GET /api/jobs/search
 * 
 * Aggregates jobs from multiple sources (RemoteOK, Adzuna, JSearch, The Muse)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { searchJobs, getAvailableProviders } from '@/utils/jobs';
import { cacheJobsBatch } from '@/utils/jobs/cache';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        
        const params = {
            query: searchParams.get('q') || searchParams.get('query') || '',
            location: searchParams.get('location') || '',
            country: searchParams.get('country') || '',
            jobType: searchParams.get('jobType') || searchParams.get('job_type') || '',
            experienceLevel: searchParams.get('experienceLevel') || searchParams.get('experience') || '',
            salaryMin: parseInt(searchParams.get('salaryMin') || '0', 10),
            salaryMax: parseInt(searchParams.get('salaryMax') || '0', 10),
            remote: searchParams.get('remote') === 'true',
            page: parseInt(searchParams.get('page') || '1', 10),
            limit: Math.min(parseInt(searchParams.get('limit') || '20', 10), 50), // Max 50 per page
            sources: searchParams.get('sources')?.split(',').filter(Boolean) || null,
            useCache: searchParams.get('cache') !== 'false',
        };

        // Search for jobs
        const results = await searchJobs(params);

        // Cache jobs to database in background (don't await)
        if (results.jobs && results.jobs.length > 0 && !results.cached) {
            cacheJobsBatch(results.jobs).catch(err => 
                console.error('Background cache error:', err)
            );
        }

        // Log search for analytics (if user is authenticated)
        try {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                await supabase.from('job_searches').insert({
                    user_id: user.id,
                    query: params.query,
                    location: params.location,
                    country: params.country,
                    filters: {
                        jobType: params.jobType,
                        experienceLevel: params.experienceLevel,
                        salaryMin: params.salaryMin,
                        salaryMax: params.salaryMax,
                        remote: params.remote,
                    },
                    results_count: results.total,
                    sources_used: results.sources,
                }).catch(() => {}); // Don't fail if logging fails
            }
        } catch (error) {
            // Ignore auth errors for unauthenticated users
        }

        return NextResponse.json({
            success: true,
            data: {
                jobs: results.jobs,
                pagination: {
                    page: results.page,
                    limit: results.limit,
                    total: results.total,
                    totalPages: results.totalPages || Math.ceil(results.total / results.limit),
                },
                sources: results.sources,
                cached: results.cached,
            },
        });

    } catch (error) {
        console.error('Job search API error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to search jobs',
            message: error.message,
        }, { status: 500 });
    }
}

/**
 * Get available job search providers
 * GET /api/jobs/search/providers
 */
export async function HEAD(request) {
    const providers = getAvailableProviders();
    
    return NextResponse.json({
        success: true,
        providers,
    });
}
