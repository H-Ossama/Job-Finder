/**
 * Job Cache Utilities
 * In-memory and database caching for job search results
 */

import { createClient } from '@/utils/supabase/server';

// In-memory cache (for serverless environments)
const memoryCache = new Map();
const jobMemoryCache = new Map(); // Cache for individual jobs by ID
const MEMORY_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const JOB_MEMORY_CACHE_TTL = 60 * 60 * 1000; // 1 hour for individual jobs
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

    // Check database cache (wrapped in try-catch for resilience)
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('job_search_cache')
            .select('*')
            .eq('cache_key', cacheKey)
            .single();

        // Handle errors gracefully - table might not exist
        if (error) {
            // PGRST116 = no rows, PGRST205 = table doesn't exist - both are OK
            return null;
        }

        if (!data) return null;

        // Check if cache is still valid
        const cacheAge = Date.now() - new Date(data.created_at).getTime();
        if (cacheAge > DB_CACHE_TTL) {
            // Cache expired, delete it (don't await)
            supabase
                .from('job_search_cache')
                .delete()
                .eq('cache_key', cacheKey)
                .then(() => {})
                .catch(() => {});
            return null;
        }

        // Store in memory cache for faster subsequent access
        setInMemoryCache(cacheKey, data.results);
        
        return data.results;
    } catch (error) {
        // Database errors shouldn't break the app
        return null;
    }
}

/**
 * Cache job search results
 * @param {string} cacheKey - Cache key
 * @param {Object} data - Data to cache
 */
export async function cacheJobs(cacheKey, data) {
    // Store in memory cache (always works)
    setInMemoryCache(cacheKey, data);

    // Store in database cache (async, don't wait, may fail if table doesn't exist)
    try {
        const supabase = await createClient();
        
        // Upsert to handle both insert and update
        const { error } = await supabase
            .from('job_search_cache')
            .upsert({
                cache_key: cacheKey,
                results: data,
                created_at: new Date().toISOString(),
            }, {
                onConflict: 'cache_key',
            });
        
        if (error && error.code !== 'PGRST205') {
            // Only log non-table-missing errors
        }
    } catch (error) {
        // Don't throw, caching failure shouldn't break the app
        // Memory cache is still working
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
    
    // Always cache in memory first (this is fast and reliable)
    for (const job of jobs) {
        if (job.id) {
            cacheJobInMemory(job.id, job);
        }
    }
    
    // Then try to cache in database (may fail if table doesn't exist)
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
        // Database caching failed, but memory cache is still good
        console.error('Error batch caching jobs to DB:', error.message);
    }
}

/**
 * Cache a single job in memory
 * @param {string} jobId - Job ID
 * @param {Object} job - Job data
 */
export function cacheJobInMemory(jobId, job) {
    // Limit cache size
    if (jobMemoryCache.size > 500) {
        // Remove oldest entries
        const keysToDelete = Array.from(jobMemoryCache.keys()).slice(0, 100);
        keysToDelete.forEach(k => jobMemoryCache.delete(k));
    }
    
    jobMemoryCache.set(jobId, {
        data: job,
        timestamp: Date.now(),
    });
}

/**
 * Get a job from memory cache
 * @param {string} jobId - Job ID
 * @returns {Object|null} - Job data or null
 */
export function getJobFromMemoryCache(jobId) {
    const cached = jobMemoryCache.get(jobId);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > JOB_MEMORY_CACHE_TTL) {
        jobMemoryCache.delete(jobId);
        return null;
    }
    
    return cached.data;
}

/**
 * Get a cached job by ID from database
 * @param {string} jobId - Job ID (format: source_externalId or morocco_source_hash)
 * @returns {Promise<Object|null>} - Job data or null
 */
export async function getCachedJobById(jobId) {
    // Check memory cache first (fastest)
    const memoryCached = getJobFromMemoryCache(jobId);
    if (memoryCached) {
        return memoryCached;
    }
    
    // Handle Morocco jobs specially - they have format: morocco_source_hash
    // e.g., morocco_emploi_abc123, morocco_rekrute_xyz789
    let source, externalId;
    
    if (jobId.startsWith('morocco_')) {
        // For Morocco jobs: morocco_source_hash
        // source = "morocco_source" (e.g., "morocco_emploi")
        // externalId = hash part
        const parts = jobId.split('_');
        if (parts.length >= 3) {
            source = `${parts[0]}_${parts[1]}`; // e.g., "morocco_emploi"
            externalId = parts.slice(2).join('_'); // The hash part
        } else {
            return null;
        }
    } else {
        // Standard format: source_externalId
        const underscoreIndex = jobId.indexOf('_');
        if (underscoreIndex === -1) return null;
        
        source = jobId.substring(0, underscoreIndex);
        externalId = jobId.substring(underscoreIndex + 1);
    }
    
    if (!source || !externalId) return null;
    
    try {
        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from('jobs_cache')
            .select('*')
            .eq('source', source)
            .eq('external_id', externalId)
            .single();
        
        if (error) {
            // PGRST116 = no rows, PGRST205 = table doesn't exist - both are OK
            return null;
        }
        
        if (!data) return null;
        
        // Convert database record back to normalized format
        const job = {
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
            url: data.apply_url, // Alias for applyUrl
            postedAt: data.posted_at,
            expiresAt: data.expires_at,
            tags: generateTagsFromCache(data),
            rawData: data.raw_data,
        };
        
        // Store in memory cache for faster subsequent access
        cacheJobInMemory(jobId, job);
        
        return job;
    } catch (error) {
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

/**
 * Clear all search cache (both memory and database)
 * @returns {Promise<Object>} - Result of cache clearing
 */
export async function clearAllSearchCache() {
    const results = {
        memoryCleared: false,
        dbCleared: false,
        memoryCacheSize: memoryCache.size,
        jobMemoryCacheSize: jobMemoryCache.size,
    };
    
    try {
        // Clear memory caches
        memoryCache.clear();
        results.memoryCleared = true;
        
        // Clear database cache
        const supabase = await createClient();
        const { error } = await supabase
            .from('job_search_cache')
            .delete()
            .neq('cache_key', ''); // Delete all rows
        
        if (!error) {
            results.dbCleared = true;
        }
    } catch (error) {
        console.error('Error clearing all cache:', error);
    }
    
    return results;
}

/**
 * Clear job memory cache only
 */
export function clearJobMemoryCache() {
    const size = jobMemoryCache.size;
    jobMemoryCache.clear();
    return { cleared: true, entriesRemoved: size };
}

/**
 * Clear search memory cache only  
 */
export function clearSearchMemoryCache() {
    const size = memoryCache.size;
    memoryCache.clear();
    return { cleared: true, entriesRemoved: size };
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
