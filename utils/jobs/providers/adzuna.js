/**
 * Adzuna Job Provider
 * Free API with registration - https://developer.adzuna.com/
 * Provides jobs from UK, US, AU, and other countries
 */

const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

// Supported countries
const COUNTRY_CODES = {
    'united states': 'us',
    'usa': 'us',
    'us': 'us',
    'united kingdom': 'gb',
    'uk': 'gb',
    'gb': 'gb',
    'australia': 'au',
    'au': 'au',
    'germany': 'de',
    'de': 'de',
    'france': 'fr',
    'fr': 'fr',
    'canada': 'ca',
    'ca': 'ca',
    'netherlands': 'nl',
    'nl': 'nl',
    'india': 'in',
    'in': 'in',
    'brazil': 'br',
    'br': 'br',
};

/**
 * Search for jobs on Adzuna
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchAdzuna(params = {}) {
    const {
        query = '',
        location = '',
        country = 'us',
        jobType = '',
        salaryMin = 0,
        salaryMax = 0,
        page = 1,
        limit = 20,
    } = params;

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
        console.warn('Adzuna API credentials not configured');
        return { jobs: [], total: 0, source: 'adzuna' };
    }

    try {
        // Normalize country code
        const countryCode = COUNTRY_CODES[country.toLowerCase()] || 'us';
        
        // Build query parameters
        const queryParams = new URLSearchParams({
            app_id: appId,
            app_key: appKey,
            results_per_page: String(limit),
            page: String(page),
        });

        // Add search query
        if (query) {
            queryParams.set('what', query);
        }

        // Add location
        if (location) {
            queryParams.set('where', location);
        }

        // Add job type filter
        if (jobType) {
            const contractType = mapJobType(jobType);
            if (contractType) {
                queryParams.set('contract_type', contractType);
            }
        }

        // Add salary filters
        if (salaryMin > 0) {
            queryParams.set('salary_min', String(salaryMin));
        }
        if (salaryMax > 0) {
            queryParams.set('salary_max', String(salaryMax));
        }

        // Sort by date
        queryParams.set('sort_by', 'date');

        const url = `${BASE_URL}/${countryCode}/search/1?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Adzuna API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        return {
            jobs: data.results || [],
            total: data.count || 0,
            source: 'adzuna',
        };
    } catch (error) {
        console.error('Adzuna search error:', error);
        return {
            jobs: [],
            total: 0,
            source: 'adzuna',
            error: error.message,
        };
    }
}

/**
 * Get available categories from Adzuna
 * @param {string} country - Country code
 * @returns {Promise<Array>} - List of categories
 */
export async function getAdzunaCategories(country = 'us') {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
        return [];
    }

    try {
        const countryCode = COUNTRY_CODES[country.toLowerCase()] || 'us';
        const url = `${BASE_URL}/${countryCode}/categories?app_id=${appId}&app_key=${appKey}`;
        
        const response = await fetch(url, {
            next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (!response.ok) {
            throw new Error(`Adzuna categories error: ${response.status}`);
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Adzuna categories error:', error);
        return [];
    }
}

/**
 * Get salary histogram for a job query
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Salary data
 */
export async function getAdzunaSalaryData(params = {}) {
    const { query = '', location = '', country = 'us' } = params;
    
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
        return null;
    }

    try {
        const countryCode = COUNTRY_CODES[country.toLowerCase()] || 'us';
        const queryParams = new URLSearchParams({
            app_id: appId,
            app_key: appKey,
        });

        if (query) queryParams.set('what', query);
        if (location) queryParams.set('where', location);

        const url = `${BASE_URL}/${countryCode}/history?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (!response.ok) {
            throw new Error(`Adzuna salary error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Adzuna salary data error:', error);
        return null;
    }
}

// Helper to map job types to Adzuna contract types
function mapJobType(jobType) {
    const mapping = {
        'full-time': 'permanent',
        'part-time': 'part_time',
        'contract': 'contract',
        'temporary': 'temporary',
    };
    return mapping[jobType.toLowerCase()] || null;
}

export { COUNTRY_CODES };
