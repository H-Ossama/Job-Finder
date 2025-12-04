/**
 * The Muse Job Provider
 * Free API - No API key required for basic access
 * Docs: https://www.themuse.com/developers/api/v2
 */

const BASE_URL = 'https://www.themuse.com/api/public/jobs';

// The Muse categories
const CATEGORIES = [
    'Account Management',
    'Business & Strategy',
    'Creative & Design',
    'Customer Service',
    'Data Science',
    'Editorial',
    'Education',
    'Engineering',
    'Finance',
    'Fundraising & Development',
    'Healthcare & Medicine',
    'HR & Recruiting',
    'Legal',
    'Marketing & PR',
    'Operations',
    'Product',
    'Project & Program Management',
    'Retail',
    'Sales',
    'Social Media & Community',
];

// The Muse experience levels
const EXPERIENCE_LEVELS = [
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Internship',
];

/**
 * Search for jobs on The Muse
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchTheMuse(params = {}) {
    const {
        query = '',
        location = '',
        category = '',
        experienceLevel = '',
        page = 1,
        limit = 20,
    } = params;

    try {
        // Build query parameters
        const queryParams = new URLSearchParams({
            page: String(page - 1), // The Muse uses 0-based pagination
        });

        // Add category filter
        if (category && CATEGORIES.includes(category)) {
            queryParams.set('category', category);
        }

        // Add experience level filter
        if (experienceLevel) {
            const level = mapExperienceLevel(experienceLevel);
            if (level) {
                queryParams.set('level', level);
            }
        }

        // Add location filter
        if (location) {
            queryParams.set('location', location);
        }

        const url = `${BASE_URL}?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error(`The Muse API error: ${response.status}`);
        }

        const data = await response.json();
        
        let jobs = data.results || [];
        
        // Filter by search query if provided (The Muse doesn't have a search param)
        if (query) {
            const queryLower = query.toLowerCase();
            jobs = jobs.filter(job => {
                const name = (job.name || '').toLowerCase();
                const company = (job.company?.name || '').toLowerCase();
                const contents = (job.contents || '').toLowerCase();
                
                return name.includes(queryLower) ||
                       company.includes(queryLower) ||
                       contents.includes(queryLower);
            });
        }

        // Limit results
        jobs = jobs.slice(0, limit);

        return {
            jobs,
            total: data.total || jobs.length,
            pageCount: data.page_count || 1,
            source: 'themuse',
        };
    } catch (error) {
        console.error('The Muse search error:', error);
        return {
            jobs: [],
            total: 0,
            source: 'themuse',
            error: error.message,
        };
    }
}

/**
 * Get a specific job by ID from The Muse
 * @param {string} jobId - Job ID
 * @returns {Promise<Object|null>} - Job data or null
 */
export async function getTheMuseJob(jobId) {
    try {
        const url = `${BASE_URL}/${jobId}`;
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`The Muse job error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('The Muse get job error:', error);
        return null;
    }
}

/**
 * Get companies from The Muse
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} - List of companies
 */
export async function getTheMuseCompanies(params = {}) {
    const { page = 1, industry = '' } = params;
    
    try {
        const queryParams = new URLSearchParams({
            page: String(page - 1),
        });

        if (industry) {
            queryParams.set('industry', industry);
        }

        const url = `https://www.themuse.com/api/public/companies?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (!response.ok) {
            throw new Error(`The Muse companies error: ${response.status}`);
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('The Muse companies error:', error);
        return [];
    }
}

// Helper to map experience levels
function mapExperienceLevel(level) {
    const mapping = {
        'entry': 'Entry Level',
        'intern': 'Internship',
        'mid': 'Mid Level',
        'senior': 'Senior Level',
    };
    return mapping[level.toLowerCase()] || null;
}

export { CATEGORIES, EXPERIENCE_LEVELS };
