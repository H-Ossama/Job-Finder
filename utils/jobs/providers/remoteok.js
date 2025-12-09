/**
 * RemoteOK Job Provider
 * Free API - No API key required
 * Docs: https://remoteok.com/api
 */

const BASE_URL = 'https://remoteok.com/api';

/**
 * Search for remote jobs on RemoteOK
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchRemoteOK(params = {}) {
    const {
        query = '',
        limit = 100,
        tags = [],
    } = params;

    try {
        // RemoteOK has a simple JSON API
        const response = await fetch(`${BASE_URL}?api=1`, {
            headers: {
                'User-Agent': 'CareerForge/1.0 (job-search-aggregator)',
                'Accept': 'application/json',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error(`RemoteOK API error: ${response.status}`);
        }

        const data = await response.json();
        
        // First item is legal notice, skip it
        let jobs = Array.isArray(data) ? data.slice(1) : [];
        
        // Filter by query if provided
        if (query) {
            const queryLower = query.toLowerCase();
            jobs = jobs.filter(job => {
                const position = (job.position || '').toLowerCase();
                const company = (job.company || '').toLowerCase();
                const description = (job.description || '').toLowerCase();
                const jobTags = (job.tags || []).map(t => t.toLowerCase());
                
                return position.includes(queryLower) ||
                       company.includes(queryLower) ||
                       description.includes(queryLower) ||
                       jobTags.some(t => t.includes(queryLower));
            });
        }

        // Filter by tags if provided
        if (tags.length > 0) {
            const tagsLower = tags.map(t => t.toLowerCase());
            jobs = jobs.filter(job => {
                const jobTags = (job.tags || []).map(t => t.toLowerCase());
                return tagsLower.some(tag => jobTags.includes(tag));
            });
        }

        // Limit results
        jobs = jobs.slice(0, limit);

        return {
            jobs,
            total: jobs.length,
            source: 'remoteok',
        };
    } catch (error) {
        console.log(`❌ RemoteOK: ${error.message}`);
        return {
            jobs: [],
            total: 0,
            source: 'remoteok',
            error: error.message,
        };
    }
}

/**
 * Get a specific job by ID from RemoteOK
 * Note: RemoteOK doesn't have a single job endpoint, so we fetch all and filter
 * @param {string} jobId - Job ID
 * @returns {Promise<Object|null>} - Job data or null
 */
export async function getRemoteOKJob(jobId) {
    try {
        const { jobs } = await searchRemoteOK({ limit: 200 });
        return jobs.find(job => String(job.id) === String(jobId)) || null;
    } catch (error) {
        console.error('RemoteOK get job error:', error);
        return null;
    }
}
