/**
 * Job Cache Utilities
 * In-memory and database caching for job search results
 */

import { createClient } from '@/utils/supabase/server';

// In-memory cache (for serverless environments)
const memoryCache = new Map();
const MEMORY_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const DB_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Get cached jobs from memory or database
 * @param {string} cacheKey - Cache key
 * @returns {Promise<Object|null>} - Cached data or null
 */
export async function getCachedJobs(cacheKey) {
    // Check memory cache first
    const memoryCached = getFromMemoryCache(cacheKey);
    if (memoryCached) {
        return memoryCached;
    }

    // Check database cache
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('job_search_cache')
            .select('*')
            .eq('cache_key', cacheKey)
            .single();

        if (error || !data) return null;

        // Check if cache is still valid
        const cacheAge = Date.now() - new Date(data.created_at).getTime();
        if (cacheAge > DB_CACHE_TTL) {
            // Cache expired, delete it
            await supabase
                .from('job_search_cache')
                .delete()
                .eq('cache_key', cacheKey);
            return null;
        }

        // Store in memory cache for faster subsequent access
        setInMemoryCache(cacheKey, data.results);
        
        return data.results;
    } catch (error) {
        console.error('Error getting cached jobs:', error);
        return null;
    }
}

/**
 * Cache job search results
 * @param {string} cacheKey - Cache key
 * @param {Object} data - Data to cache
 */
export async function cacheJobs(cacheKey, data) {
    // Store in memory cache
    setInMemoryCache(cacheKey, data);

    // Store in database cache (async, don't wait)
    try {
        const supabase = await createClient();
        
        // Upsert to handle both insert and update
        await supabase
            .from('job_search_cache')
            .upsert({
                cache_key: cacheKey,
                results: data,
                created_at: new Date().toISOString(),
            }, {
                onConflict: 'cache_key',
            });
    } catch (error) {
        // Don't throw, caching failure shouldn't break the app
        console.error('Error caching jobs:', error);
    }
}

/**
 * Cache individual job in the jobs_cache table
 * @param {Object} job - Normalized job data
 */
export async function cacheJob(job) {
    try {
        const supabase = await createClient();
        
        await supabase
            .from('jobs_cache')
            .upsert({
                external_id: job.externalId,
                source: job.source,
                title: job.title,
                company: job.company,
                company_logo: job.companyLogo,
                location: job.location,
                location_type: job.locationType,
                country: job.country,
                city: job.city,
                salary_min: job.salaryMin,
                salary_max: job.salaryMax,
                salary_currency: job.salaryCurrency,
                job_type: job.jobType,
                experience_level: job.experienceLevel,
                description: job.description,
                requirements: job.requirements,
                benefits: job.benefits,
                skills: job.skills,
                apply_url: job.applyUrl,
                posted_at: job.postedAt,
                expires_at: job.expiresAt,
                raw_data: job.rawData,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'external_id,source',
            });
    } catch (error) {
        console.error('Error caching individual job:', error);
    }
}

/**
 * Cache multiple jobs at once
 * @param {Array} jobs - Array of normalized job data
 */
export async function cacheJobsBatch(jobs) {
    if (!jobs || jobs.length === 0) return;
    
    try {
        const supabase = await createClient();
        
        const jobRecords = jobs.map(job => ({
            external_id: job.externalId,
            source: job.source,
            title: job.title,
            company: job.company,
            company_logo: job.companyLogo,
            location: job.location,
            location_type: job.locationType,
            country: job.country,
            city: job.city,
            salary_min: job.salaryMin,
            salary_max: job.salaryMax,
            salary_currency: job.salaryCurrency,
            job_type: job.jobType,
            experience_level: job.experienceLevel,
            description: job.description,
            requirements: job.requirements,
            benefits: job.benefits,
            skills: job.skills,
            apply_url: job.applyUrl,
            posted_at: job.postedAt,
            expires_at: job.expiresAt,
            raw_data: job.rawData,
            updated_at: new Date().toISOString(),
        }));
        
        // Use upsert to handle duplicates
        await supabase
            .from('jobs_cache')
            .upsert(jobRecords, {
                onConflict: 'external_id,source',
                ignoreDuplicates: false,
            });
    } catch (error) {
        console.error('Error batch caching jobs:', error);
    }
}

/**
 * Get a cached job by ID from database
 * @param {string} jobId - Job ID (format: source_externalId)
 * @returns {Promise<Object|null>} - Job data or null
 */
export async function getCachedJobById(jobId) {
    const [source, externalId] = jobId.split('_');
    
    if (!source || !externalId) return null;
    
    try {
        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from('jobs_cache')
            .select('*')
            .eq('source', source)
            .eq('external_id', externalId)
            .single();
        
        if (error || !data) return null;
        
        // Convert database record back to normalized format
        return {
            id: `${data.source}_${data.external_id}`,
            externalId: data.external_id,
            source: data.source,
            title: data.title,
            company: data.company,
            companyLogo: data.company_logo,
            location: data.location,
            locationType: data.location_type,
            country: data.country,
            city: data.city,
            salary: formatSalaryFromCache(data),
            salaryMin: data.salary_min,
            salaryMax: data.salary_max,
            salaryCurrency: data.salary_currency,
            jobType: data.job_type,
            experienceLevel: data.experience_level,
            description: data.description,
            requirements: data.requirements || [],
            benefits: data.benefits || [],
            skills: data.skills || [],
            applyUrl: data.apply_url,
            postedAt: data.posted_at,
            expiresAt: data.expires_at,
            tags: generateTagsFromCache(data),
            rawData: data.raw_data,
        };
    } catch (error) {
        console.error('Error getting cached job by ID:', error);
        return null;
    }
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache() {
    try {
        const supabase = await createClient();
        const expiredBefore = new Date(Date.now() - DB_CACHE_TTL).toISOString();
        
        await supabase
            .from('job_search_cache')
            .delete()
            .lt('created_at', expiredBefore);
    } catch (error) {
        console.error('Error clearing expired cache:', error);
    }
}

// Memory cache helpers

function getFromMemoryCache(key) {
    const cached = memoryCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > MEMORY_CACHE_TTL) {
        memoryCache.delete(key);
        return null;
    }
    
    return cached.data;
}

function setInMemoryCache(key, data) {
    // Limit cache size
    if (memoryCache.size > 100) {
        // Remove oldest entries
        const keysToDelete = Array.from(memoryCache.keys()).slice(0, 20);
        keysToDelete.forEach(k => memoryCache.delete(k));
    }
    
    memoryCache.set(key, {
        data,
        timestamp: Date.now(),
    });
}

// Helper functions

function formatSalaryFromCache(data) {
    if (!data.salary_min && !data.salary_max) return '';
    
    const symbol = data.salary_currency === 'USD' ? '$' : 
                   data.salary_currency === 'EUR' ? '€' : 
                   data.salary_currency === 'GBP' ? '£' : '';
    
    if (data.salary_min && data.salary_max) {
        return `${symbol}${formatNumber(data.salary_min)} - ${symbol}${formatNumber(data.salary_max)}`;
    }
    if (data.salary_min) return `From ${symbol}${formatNumber(data.salary_min)}`;
    if (data.salary_max) return `Up to ${symbol}${formatNumber(data.salary_max)}`;
    return '';
}

function formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${Math.round(num / 1000)}k`;
    return num.toString();
}

function generateTagsFromCache(data) {
    const tags = [];
    if (data.job_type) tags.push(data.job_type);
    if (data.location_type === 'remote') tags.push('Remote');
    if (data.salary_min && data.salary_min >= 100000) tags.push('$100k+');
    return tags;
}
