/**
 * Job Search Service
 * Main aggregator for fetching jobs from multiple sources
 */

import { searchRemoteOK } from './providers/remoteok';
import { searchAdzuna } from './providers/adzuna';
import { searchJSearch } from './providers/jsearch';
import { searchTheMuse } from './providers/themuse';
import { normalizeJob } from './normalizer';
import { getCachedJobs, cacheJobs } from './cache';

// Provider configurations
const PROVIDERS = {
    remoteok: {
        name: 'Remote OK',
        search: searchRemoteOK,
        enabled: true,
        priority: 1, // Higher priority = fetched first
        rateLimit: 1000, // ms between requests
    },
    adzuna: {
        name: 'Adzuna',
        search: searchAdzuna,
        enabled: !!process.env.ADZUNA_APP_ID,
        priority: 2,
        rateLimit: 500,
    },
    jsearch: {
        name: 'JSearch',
        search: searchJSearch,
        enabled: !!process.env.JSEARCH_API_KEY,
        priority: 3,
        rateLimit: 1000,
    },
    themuse: {
        name: 'The Muse',
        search: searchTheMuse,
        enabled: true,
        priority: 4,
        rateLimit: 500,
    },
};

/**
 * Search for jobs across all enabled providers
 * @param {Object} params - Search parameters
 * @param {string} params.query - Job title or keywords
 * @param {string} params.location - City, state, or country
 * @param {string} params.country - Country code (e.g., 'us', 'uk')
 * @param {string} params.jobType - 'full-time', 'part-time', 'contract', etc.
 * @param {string} params.experienceLevel - 'entry', 'mid', 'senior', etc.
 * @param {number} params.salaryMin - Minimum salary
 * @param {number} params.salaryMax - Maximum salary
 * @param {boolean} params.remote - Remote jobs only
 * @param {number} params.page - Page number (1-based)
 * @param {number} params.limit - Results per page
 * @param {string[]} params.sources - Specific sources to search (optional)
 * @returns {Promise<Object>} - Search results
 */
export async function searchJobs(params = {}) {
    const {
        query = '',
        location = '',
        country = '',
        jobType = '',
        experienceLevel = '',
        salaryMin = 0,
        salaryMax = 0,
        remote = false,
        page = 1,
        limit = 20,
        sources = null, // null = all enabled sources
        useCache = true,
    } = params;

    // Generate cache key
    const cacheKey = generateCacheKey(params);
    
    // Check cache first
    if (useCache) {
        const cached = await getCachedJobs(cacheKey);
        if (cached) {
            return {
                jobs: cached.jobs,
                total: cached.total,
                page,
                limit,
                sources: cached.sources,
                cached: true,
            };
        }
    }

    // Determine which providers to use
    const activeProviders = Object.entries(PROVIDERS)
        .filter(([key, provider]) => {
            if (!provider.enabled) return false;
            if (sources && !sources.includes(key)) return false;
            return true;
        })
        .sort((a, b) => a[1].priority - b[1].priority);

    // Fetch from all providers in parallel
    const searchPromises = activeProviders.map(async ([key, provider]) => {
        try {
            const results = await provider.search({
                query,
                location,
                country,
                jobType,
                experienceLevel,
                salaryMin,
                salaryMax,
                remote,
                page,
                limit: Math.ceil(limit / activeProviders.length) + 5, // Get extra to filter
            });
            
            return {
                source: key,
                jobs: results.jobs.map(job => normalizeJob(job, key)),
                total: results.total || results.jobs.length,
                error: null,
            };
        } catch (error) {
            console.error(`Error fetching from ${provider.name}:`, error.message);
            return {
                source: key,
                jobs: [],
                total: 0,
                error: error.message,
            };
        }
    });

    const results = await Promise.all(searchPromises);

    // Combine and deduplicate results
    const allJobs = [];
    const seenJobs = new Set();
    let totalCount = 0;
    const sourcesUsed = [];

    for (const result of results) {
        if (result.error) continue;
        
        sourcesUsed.push(result.source);
        totalCount += result.total;
        
        for (const job of result.jobs) {
            // Deduplicate by title + company combination
            const jobKey = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
            if (!seenJobs.has(jobKey)) {
                seenJobs.add(jobKey);
                allJobs.push(job);
            }
        }
    }

    // Sort by posted date (newest first)
    allJobs.sort((a, b) => {
        const dateA = new Date(a.postedAt || 0);
        const dateB = new Date(b.postedAt || 0);
        return dateB - dateA;
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedJobs = allJobs.slice(startIndex, startIndex + limit);

    // Cache results
    if (useCache && paginatedJobs.length > 0) {
        await cacheJobs(cacheKey, {
            jobs: allJobs,
            total: totalCount,
            sources: sourcesUsed,
        });
    }

    return {
        jobs: paginatedJobs,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(allJobs.length / limit),
        sources: sourcesUsed,
        cached: false,
    };
}

/**
 * Get a single job by ID
 * @param {string} jobId - Job ID (format: source_externalId)
 * @returns {Promise<Object|null>} - Job details or null
 */
export async function getJobById(jobId) {
    const [source, externalId] = jobId.split('_');
    
    if (!source || !externalId) {
        return null;
    }

    const provider = PROVIDERS[source];
    if (!provider || !provider.enabled) {
        return null;
    }

    try {
        // For now, we'll search and find the job
        // In production, some APIs support direct job fetch
        const results = await provider.search({ 
            jobId: externalId,
            limit: 1 
        });
        
        if (results.jobs && results.jobs.length > 0) {
            return normalizeJob(results.jobs[0], source);
        }
    } catch (error) {
        console.error(`Error fetching job ${jobId}:`, error.message);
    }

    return null;
}

/**
 * Generate a cache key from search parameters
 */
function generateCacheKey(params) {
    const { query, location, country, jobType, experienceLevel, remote, page, limit } = params;
    return `jobs:${query}:${location}:${country}:${jobType}:${experienceLevel}:${remote}:${page}:${limit}`.toLowerCase();
}

/**
 * Get list of available/enabled providers
 */
export function getAvailableProviders() {
    return Object.entries(PROVIDERS)
        .filter(([, provider]) => provider.enabled)
        .map(([key, provider]) => ({
            id: key,
            name: provider.name,
        }));
}

export { PROVIDERS };
