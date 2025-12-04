/**
 * JSearch Job Provider (RapidAPI)
 * Aggregates jobs from LinkedIn, Indeed, Glassdoor, and more
 * Docs: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
 */

const BASE_URL = 'https://jsearch.p.rapidapi.com';

/**
 * Search for jobs using JSearch API
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchJSearch(params = {}) {
    const {
        query = 'developer',
        location = '',
        country = '',
        remote = false,
        jobType = '',
        experienceLevel = '',
        datePosted = 'all', // 'all', 'today', '3days', 'week', 'month'
        page = 1,
        limit = 20,
    } = params;

    const apiKey = process.env.JSEARCH_API_KEY;

    if (!apiKey) {
        console.warn('JSearch API key not configured');
        return { jobs: [], total: 0, source: 'jsearch' };
    }

    try {
        // Build search query
        let searchQuery = query;
        if (location) {
            searchQuery += ` in ${location}`;
        }
        if (country) {
            searchQuery += ` ${country}`;
        }

        // Build query parameters
        const queryParams = new URLSearchParams({
            query: searchQuery,
            page: String(page),
            num_pages: '1',
        });

        // Add remote filter
        if (remote) {
            queryParams.set('remote_jobs_only', 'true');
        }

        // Add date posted filter
        if (datePosted && datePosted !== 'all') {
            queryParams.set('date_posted', datePosted);
        }

        // Add employment type filter
        if (jobType) {
            const employmentType = mapJobType(jobType);
            if (employmentType) {
                queryParams.set('employment_types', employmentType);
            }
        }

        // Add experience level filter
        if (experienceLevel) {
            const requirements = mapExperienceLevel(experienceLevel);
            if (requirements) {
                queryParams.set('job_requirements', requirements);
            }
        }

        const url = `${BASE_URL}/search?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`JSearch API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        return {
            jobs: data.data || [],
            total: data.data?.length || 0,
            source: 'jsearch',
        };
    } catch (error) {
        console.error('JSearch search error:', error);
        return {
            jobs: [],
            total: 0,
            source: 'jsearch',
            error: error.message,
        };
    }
}

/**
 * Get job details by job ID
 * @param {string} jobId - JSearch job ID
 * @returns {Promise<Object|null>} - Job details or null
 */
export async function getJSearchJobDetails(jobId) {
    const apiKey = process.env.JSEARCH_API_KEY;

    if (!apiKey) {
        return null;
    }

    try {
        const url = `${BASE_URL}/job-details?job_id=${encodeURIComponent(jobId)}`;
        
        const response = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`JSearch details error: ${response.status}`);
        }

        const data = await response.json();
        return data.data?.[0] || null;
    } catch (error) {
        console.error('JSearch job details error:', error);
        return null;
    }
}

/**
 * Get estimated salary for a job title/location
 * @param {Object} params - Query parameters
 * @returns {Promise<Object|null>} - Salary data or null
 */
export async function getJSearchSalary(params = {}) {
    const { title = '', location = '' } = params;
    const apiKey = process.env.JSEARCH_API_KEY;

    if (!apiKey) {
        return null;
    }

    try {
        const queryParams = new URLSearchParams({
            job_title: title,
            location: location || 'United States',
        });

        const url = `${BASE_URL}/estimated-salary?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
            },
            next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (!response.ok) {
            throw new Error(`JSearch salary error: ${response.status}`);
        }

        const data = await response.json();
        return data.data?.[0] || null;
    } catch (error) {
        console.error('JSearch salary error:', error);
        return null;
    }
}

// Helper to map job types to JSearch employment types
function mapJobType(jobType) {
    const mapping = {
        'full-time': 'FULLTIME',
        'part-time': 'PARTTIME',
        'contract': 'CONTRACTOR',
        'internship': 'INTERN',
    };
    return mapping[jobType.toLowerCase()] || null;
}

// Helper to map experience levels to JSearch requirements
function mapExperienceLevel(level) {
    const mapping = {
        'entry': 'no_experience',
        'intern': 'no_experience',
        'mid': 'under_3_years_experience',
        'senior': 'more_than_3_years_experience',
    };
    return mapping[level.toLowerCase()] || null;
}
