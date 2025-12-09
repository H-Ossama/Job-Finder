/**
 * Adzuna Job Provider
 * Free API with registration - https://developer.adzuna.com/
 * Provides jobs from UK, US, AU, and other countries
 */

const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

// Supported countries - Expanded for more global coverage
const COUNTRY_CODES = {
    // North America
    'united states': 'us',
    'usa': 'us',
    'us': 'us',
    'canada': 'ca',
    'ca': 'ca',
    'mexico': 'mx',
    'mx': 'mx',
    
    // Europe - Western
    'united kingdom': 'gb',
    'uk': 'gb',
    'gb': 'gb',
    'germany': 'de',
    'de': 'de',
    'deutschland': 'de',
    'france': 'fr',
    'fr': 'fr',
    'netherlands': 'nl',
    'nl': 'nl',
    'holland': 'nl',
    'belgium': 'be',
    'be': 'be',
    'austria': 'at',
    'at': 'at',
    'switzerland': 'ch',
    'ch': 'ch',
    'ireland': 'ie',
    'ie': 'ie',
    'luxembourg': 'lu',
    'lu': 'lu',
    
    // Europe - Southern
    'spain': 'es',
    'es': 'es',
    'italy': 'it',
    'it': 'it',
    'portugal': 'pt',
    'pt': 'pt',
    'greece': 'gr',
    'gr': 'gr',
    
    // Europe - Northern
    'sweden': 'se',
    'se': 'se',
    'norway': 'no',
    'no': 'no',
    'denmark': 'dk',
    'dk': 'dk',
    'finland': 'fi',
    'fi': 'fi',
    
    // Europe - Eastern
    'poland': 'pl',
    'pl': 'pl',
    'czech republic': 'cz',
    'czechia': 'cz',
    'cz': 'cz',
    'hungary': 'hu',
    'hu': 'hu',
    'romania': 'ro',
    'ro': 'ro',
    'bulgaria': 'bg',
    'bg': 'bg',
    'croatia': 'hr',
    'hr': 'hr',
    'slovakia': 'sk',
    'sk': 'sk',
    'slovenia': 'si',
    'si': 'si',
    'ukraine': 'ua',
    'ua': 'ua',
    'russia': 'ru',
    'ru': 'ru',
    
    // Baltic States
    'lithuania': 'lt',
    'lt': 'lt',
    'latvia': 'lv',
    'lv': 'lv',
    'estonia': 'ee',
    'ee': 'ee',
    
    // Middle East
    'united arab emirates': 'ae',
    'uae': 'ae',
    'ae': 'ae',
    'saudi arabia': 'sa',
    'sa': 'sa',
    'qatar': 'qa',
    'qa': 'qa',
    'israel': 'il',
    'il': 'il',
    'turkey': 'tr',
    'tr': 'tr',
    
    // North Africa
    'morocco': 'ma',
    'ma': 'ma',
    'egypt': 'eg',
    'eg': 'eg',
    'algeria': 'dz',
    'dz': 'dz',
    'tunisia': 'tn',
    'tn': 'tn',
    'libya': 'ly',
    'ly': 'ly',
    
    // Sub-Saharan Africa
    'south africa': 'za',
    'za': 'za',
    'nigeria': 'ng',
    'ng': 'ng',
    'kenya': 'ke',
    'ke': 'ke',
    'ghana': 'gh',
    'gh': 'gh',
    
    // Asia
    'india': 'in',
    'in': 'in',
    'china': 'cn',
    'cn': 'cn',
    'japan': 'jp',
    'jp': 'jp',
    'south korea': 'kr',
    'korea': 'kr',
    'kr': 'kr',
    'singapore': 'sg',
    'sg': 'sg',
    'hong kong': 'hk',
    'hk': 'hk',
    'taiwan': 'tw',
    'tw': 'tw',
    'malaysia': 'my',
    'my': 'my',
    'indonesia': 'id',
    'id': 'id',
    'thailand': 'th',
    'th': 'th',
    'vietnam': 'vn',
    'vn': 'vn',
    'philippines': 'ph',
    'ph': 'ph',
    'pakistan': 'pk',
    'pk': 'pk',
    
    // Oceania
    'australia': 'au',
    'au': 'au',
    'new zealand': 'nz',
    'nz': 'nz',
    
    // South America
    'brazil': 'br',
    'br': 'br',
    'argentina': 'ar',
    'ar': 'ar',
    'chile': 'cl',
    'cl': 'cl',
    'colombia': 'co',
    'co': 'co',
    'peru': 'pe',
    'pe': 'pe',
};

// Adzuna API actually available countries (verified working endpoints)
// Reference: https://api.adzuna.com/v1/doc/search
const ADZUNA_AVAILABLE_COUNTRIES = [
    'at',  // Austria
    'au',  // Australia
    'be',  // Belgium
    'br',  // Brazil
    'ca',  // Canada
    'ch',  // Switzerland
    'de',  // Germany
    'es',  // Spain
    'fr',  // France
    'gb',  // United Kingdom
    'in',  // India
    'it',  // Italy
    'mx',  // Mexico
    'nl',  // Netherlands
    'nz',  // New Zealand
    'pl',  // Poland
    'sg',  // Singapore
    'us',  // United States
    'za',  // South Africa
];

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
        const normalizedCountry = country.toLowerCase().trim();
        let countryCode = COUNTRY_CODES[normalizedCountry] || normalizedCountry;
        
        // IMPORTANT: Check if country is actually available in Adzuna API
        // If not, find a suitable fallback country
        const originalCountry = countryCode;
        if (!ADZUNA_AVAILABLE_COUNTRIES.includes(countryCode)) {
            // North Africa - fallback to France (French-speaking) or UK
            if (['ma', 'dz', 'tn', 'ly', 'eg', 'sd', 'mr'].includes(countryCode)) {
                countryCode = 'fr';
            }
            // Middle East - fallback to UK
            else if (['tr', 'ae', 'sa', 'qa', 'il', 'jo', 'lb', 'kw', 'bh', 'om', 'iq', 'ir', 'sy', 'ye', 'ps'].includes(countryCode)) {
                countryCode = 'gb';
            }
            // Eastern Europe - fallback to Poland or Germany
            else if (['ua', 'ro', 'bg', 'hr', 'sk', 'si', 'hu', 'cz', 'lt', 'lv', 'ee', 'rs', 'ba', 'me', 'mk', 'al', 'xk', 'by', 'md'].includes(countryCode)) {
                countryCode = 'pl';
            }
            // Nordic countries - fallback to Germany or UK
            else if (['se', 'no', 'dk', 'fi', 'is'].includes(countryCode)) {
                countryCode = 'de';
            }
            // Asia (excluding supported) - fallback to Singapore or India
            else if (['jp', 'kr', 'hk', 'tw', 'my', 'id', 'th', 'vn', 'ph', 'pk', 'cn', 'bd', 'lk', 'np', 'mm', 'kh', 'la', 'bn', 'mn'].includes(countryCode)) {
                countryCode = 'sg';
            }
            // Sub-Saharan Africa - fallback to South Africa
            else if (['ng', 'ke', 'gh', 'et', 'tz', 'ug', 'rw', 'sn', 'ci', 'cm', 'ao', 'zw', 'bw', 'na', 'mu'].includes(countryCode)) {
                countryCode = 'za';
            }
            // South America (excluding supported) - fallback to Brazil
            else if (['ar', 'cl', 'co', 'pe', 've', 'ec', 'uy', 'py', 'bo', 'gy', 'sr'].includes(countryCode)) {
                countryCode = 'br';
            }
            // Central America & Caribbean - fallback to Mexico or US
            else if (['pa', 'cr', 'gt', 'hn', 'sv', 'ni', 'bz', 'pr', 'jm', 'do', 'cu', 'ht', 'tt', 'bs', 'bb'].includes(countryCode)) {
                countryCode = 'mx';
            }
            // Western Europe (not in list) - fallback to UK or Germany
            else if (['lu', 'ie', 'pt', 'gr'].includes(countryCode)) {
                countryCode = 'gb';
            }
            // Default fallback
            else {
                countryCode = 'us';
            }
        }
        
        // Final safety check - if still not in available countries, use US
        if (!ADZUNA_AVAILABLE_COUNTRIES.includes(countryCode)) {
            countryCode = 'us';
        }
        
        // Build query parameters
        const queryParams = new URLSearchParams({
            app_id: appId,
            app_key: appKey,
            results_per_page: String(limit),
            page: String(page),
        });

        // Add search query - Adzuna requires 'what' parameter
        // Use 'jobs' as default to get all job listings
        queryParams.set('what', query || 'jobs');

        // Add location - use original location name for better results
        // But don't pass country name as location (e.g., 'Germany') when we already have the country code
        if (location) {
            const locationLower = location.toLowerCase().trim();
            // Don't pass country names as 'where' parameter - Adzuna expects cities/regions
            const countryNames = ['germany', 'deutschland', 'united states', 'usa', 'uk', 'united kingdom', 
                'france', 'spain', 'italy', 'netherlands', 'austria', 'switzerland', 'poland',
                'australia', 'canada', 'brazil', 'india', 'south africa', 'new zealand', 'singapore', 'mexico'];
            if (!countryNames.includes(locationLower)) {
                queryParams.set('where', location);
            }
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

        const url = `${BASE_URL}/${countryCode}/search/${page}?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            const errorText = await response.text();
            // Check if it's an HTML error page (Adzuna sometimes returns these)
            if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
                console.log(`⚠️ Adzuna: unavailable for ${originalCountry !== countryCode ? `${originalCountry} (tried ${countryCode})` : countryCode}`);
                // Return empty results instead of throwing
                return {
                    jobs: [],
                    total: 0,
                    source: 'adzuna',
                    error: `Adzuna unavailable for: ${countryCode}`,
                };
            }
            throw new Error(`Adzuna API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        return {
            jobs: data.results || [],
            total: data.count || 0,
            source: 'adzuna',
        };
    } catch (error) {
        console.log(`❌ Adzuna: ${error.message}`);
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
        'internship': 'contract',
        'ausbildung': 'permanent', // German apprenticeships
        'apprenticeship': 'permanent',
    };
    return mapping[jobType.toLowerCase()] || null;
}

export { COUNTRY_CODES, ADZUNA_AVAILABLE_COUNTRIES };
