/**
 * Job Search Service
 * Main aggregator for fetching jobs from multiple sources
 */

import { searchRemoteOK } from './providers/remoteok';
import { searchAdzuna } from './providers/adzuna';
import { searchJSearch } from './providers/jsearch';
import { searchTheMuse } from './providers/themuse';
import { searchAusbildung, extractAusbildungDetails, AUSBILDUNG_FIELDS, GERMAN_STATES, GERMAN_CITIES } from './providers/ausbildung';
import { searchMoroccoJobs, getMoroccoSourcesInfo, MOROCCO_SOURCES, MOROCCO_CITIES, MOROCCO_SECTORS } from './providers/morocco';
import { normalizeJob } from './normalizer';
import { getCachedJobs, cacheJobs } from './cache';

// Country name mappings for filtering
const COUNTRY_MAPPINGS = {
    'us': ['united states', 'usa', 'u.s.', 'u.s.a'],
    'usa': ['united states', 'usa', 'u.s.', 'u.s.a'],
    'united states': ['united states', 'usa', 'u.s.', 'u.s.a'],
    'uk': ['united kingdom', 'uk', 'u.k.', 'england', 'britain', 'gb', 'great britain'],
    'gb': ['united kingdom', 'uk', 'u.k.', 'england', 'britain', 'gb', 'great britain'],
    'united kingdom': ['united kingdom', 'uk', 'u.k.', 'england', 'britain', 'gb', 'great britain'],
    'germany': ['germany', 'deutschland', 'de'],
    'de': ['germany', 'deutschland', 'de'],
    'canada': ['canada', 'ca'],
    'ca': ['canada', 'ca'],
    'australia': ['australia', 'au'],
    'au': ['australia', 'au'],
    'france': ['france', 'fr'],
    'fr': ['france', 'fr'],
    'netherlands': ['netherlands', 'holland', 'nl'],
    'nl': ['netherlands', 'holland', 'nl'],
    'spain': ['spain', 'españa', 'es'],
    'es': ['spain', 'españa', 'es'],
    'italy': ['italy', 'italia', 'it'],
    'it': ['italy', 'italia', 'it'],
    'india': ['india', 'in'],
    'in': ['india', 'in'],
    'brazil': ['brazil', 'brasil', 'br'],
    'br': ['brazil', 'brasil', 'br'],
    'singapore': ['singapore', 'sg'],
    'sg': ['singapore', 'sg'],
    'japan': ['japan', 'jp'],
    'jp': ['japan', 'jp'],
    'ireland': ['ireland', 'ie'],
    'ie': ['ireland', 'ie'],
    'sweden': ['sweden', 'se'],
    'se': ['sweden', 'se'],
    'switzerland': ['switzerland', 'ch', 'schweiz', 'suisse'],
    'ch': ['switzerland', 'ch', 'schweiz', 'suisse'],
    'poland': ['poland', 'pl', 'polska'],
    'pl': ['poland', 'pl', 'polska'],
    'austria': ['austria', 'at', 'österreich'],
    'at': ['austria', 'at', 'österreich'],
    'belgium': ['belgium', 'be', 'belgique'],
    'be': ['belgium', 'be', 'belgique'],
    'portugal': ['portugal', 'pt'],
    'pt': ['portugal', 'pt'],
    'mexico': ['mexico', 'méxico', 'mx'],
    'mx': ['mexico', 'méxico', 'mx'],
    'argentina': ['argentina', 'ar'],
    'ar': ['argentina', 'ar'],
    'chile': ['chile', 'cl'],
    'cl': ['chile', 'cl'],
    'colombia': ['colombia', 'co'],
    'co': ['colombia', 'co'],
    'new zealand': ['new zealand', 'nz'],
    'nz': ['new zealand', 'nz'],
    'denmark': ['denmark', 'dk'],
    'dk': ['denmark', 'dk'],
    'finland': ['finland', 'fi'],
    'fi': ['finland', 'fi'],
    'norway': ['norway', 'no'],
    'no': ['norway', 'no'],
    'czech republic': ['czech republic', 'czechia', 'cz'],
    'cz': ['czech republic', 'czechia', 'cz'],
    'israel': ['israel', 'il'],
    'il': ['israel', 'il'],
    'south africa': ['south africa', 'za'],
    'za': ['south africa', 'za'],
    'uae': ['united arab emirates', 'uae', 'dubai', 'ae'],
    'ae': ['united arab emirates', 'uae', 'dubai', 'ae'],
    'saudi arabia': ['saudi arabia', 'sa'],
    'sa': ['saudi arabia', 'sa'],
    'egypt': ['egypt', 'eg'],
    'eg': ['egypt', 'eg'],
    'qatar': ['qatar', 'qa'],
    'qa': ['qatar', 'qa'],
    'kuwait': ['kuwait', 'kw'],
    'kw': ['kuwait', 'kw'],
    // Morocco mappings
    'morocco': ['morocco', 'maroc', 'ma', 'المغرب'],
    'ma': ['morocco', 'maroc', 'ma', 'المغرب'],
    'maroc': ['morocco', 'maroc', 'ma', 'المغرب'],
    'remote': ['remote', 'worldwide', 'anywhere', 'global'],
};

// Experience level keywords for filtering
const EXPERIENCE_PATTERNS = {
    'entry': {
        keywords: ['entry level', 'entry-level', 'junior', 'graduate', 'intern', 'trainee', 'fresher', 'no experience', '0-1 year', '0-2 year', 'beginner', 'associate'],
        maxYears: 2,
    },
    'mid': {
        keywords: ['mid level', 'mid-level', 'intermediate', '2-5 year', '3-5 year', '2-4 year', '3+ year'],
        minYears: 2,
        maxYears: 5,
    },
    'senior': {
        keywords: ['senior', 'lead', 'principal', 'staff', 'architect', 'manager', 'director', '5+ year', '6+ year', '7+ year', '8+ year', '10+ year'],
        minYears: 5,
    },
};

/**
 * Filter jobs by country
 * @param {Object} job - Job object
 * @param {string} country - Country to filter by
 * @returns {boolean} - Whether the job matches the country
 */
function matchesCountry(job, country) {
    if (!country || country === 'all' || country === '') return true;
    
    const countryLower = country.toLowerCase().trim();
    const locationLower = (job.location || '').toLowerCase();
    
    // Handle remote jobs - they match any country filter unless specifically filtering for a country
    if (job.remote && (locationLower.includes('remote') || locationLower.includes('worldwide') || locationLower.includes('anywhere'))) {
        // If filtering for remote specifically, include remote jobs
        if (countryLower === 'remote') return true;
        // Remote jobs should still appear when filtering by country
        return true;
    }
    
    // Get country variations
    const countryVariations = COUNTRY_MAPPINGS[countryLower] || [countryLower];
    
    // Check if job location contains any country variation
    for (const variation of countryVariations) {
        if (locationLower.includes(variation)) return true;
    }
    
    // Also check job's country field if available
    if (job.country) {
        const jobCountryLower = job.country.toLowerCase();
        for (const variation of countryVariations) {
            if (jobCountryLower.includes(variation) || variation.includes(jobCountryLower)) return true;
        }
    }
    
    return false;
}

/**
 * Filter jobs by experience level
 * @param {Object} job - Job object
 * @param {string} experienceLevel - Experience level to filter by (entry, mid, senior)
 * @returns {boolean} - Whether the job matches the experience level
 */
function matchesExperienceLevel(job, experienceLevel) {
    if (!experienceLevel || experienceLevel === 'all' || experienceLevel === '') return true;
    
    const levelLower = experienceLevel.toLowerCase().trim();
    const pattern = EXPERIENCE_PATTERNS[levelLower];
    if (!pattern) return true; // Unknown level, don't filter
    
    // Check job's experienceLevel field
    const jobExpLevel = (job.experienceLevel || '').toLowerCase();
    if (jobExpLevel) {
        // Direct match
        if (levelLower === 'entry' && (jobExpLevel.includes('entry') || jobExpLevel.includes('junior') || jobExpLevel.includes('intern'))) return true;
        if (levelLower === 'mid' && (jobExpLevel.includes('mid') || jobExpLevel.includes('intermediate'))) return true;
        if (levelLower === 'senior' && (jobExpLevel.includes('senior') || jobExpLevel.includes('lead') || jobExpLevel.includes('principal'))) return true;
    }
    
    // Check title and description for keywords
    const textToCheck = `${job.title || ''} ${job.description || ''}`.toLowerCase();
    
    // Check for experience keywords
    for (const keyword of pattern.keywords) {
        if (textToCheck.includes(keyword)) return true;
    }
    
    // Extract years from title/description
    const yearsMatch = textToCheck.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
    if (yearsMatch) {
        const years = parseInt(yearsMatch[1], 10);
        
        if (levelLower === 'entry' && years <= (pattern.maxYears || 2)) return true;
        if (levelLower === 'mid' && years >= (pattern.minYears || 2) && years <= (pattern.maxYears || 5)) return true;
        if (levelLower === 'senior' && years >= (pattern.minYears || 5)) return true;
        
        // If years specified but doesn't match, exclude
        return false;
    }
    
    // If no experience info found, be permissive for entry level
    if (levelLower === 'entry') {
        // Exclude if title clearly indicates senior
        if (textToCheck.includes('senior') || textToCheck.includes('lead') || textToCheck.includes('principal') || textToCheck.includes('staff') || textToCheck.includes('director')) {
            return false;
        }
        return true;
    }
    
    // For mid/senior, be more restrictive
    return false;
}

/**
 * Filter jobs by job type
 * @param {Object} job - Job object  
 * @param {string} jobType - Job type to filter by
 * @returns {boolean} - Whether the job matches the job type
 */
function matchesJobType(job, jobType) {
    if (!jobType || jobType === 'all' || jobType === '') return true;
    
    const typeLower = jobType.toLowerCase().trim();
    const jobTypeLower = (job.jobType || job.employmentType || '').toLowerCase();
    const titleLower = (job.title || '').toLowerCase();
    const descLower = (job.description || '').toLowerCase();
    
    const textToCheck = `${jobTypeLower} ${titleLower} ${descLower}`;
    
    switch (typeLower) {
        case 'full-time':
        case 'fulltime':
            return textToCheck.includes('full-time') || textToCheck.includes('fulltime') || textToCheck.includes('full time') || 
                   jobTypeLower === 'permanent' || (!textToCheck.includes('part-time') && !textToCheck.includes('contract') && !textToCheck.includes('freelance'));
        case 'part-time':
        case 'parttime':
            return textToCheck.includes('part-time') || textToCheck.includes('parttime') || textToCheck.includes('part time');
        case 'contract':
            return textToCheck.includes('contract') || textToCheck.includes('contractor') || textToCheck.includes('freelance');
        case 'internship':
        case 'intern':
            return textToCheck.includes('intern') || textToCheck.includes('internship');
        case 'ausbildung':
            return textToCheck.includes('ausbildung') || textToCheck.includes('azubi') || textToCheck.includes('apprentice');
        default:
            return true;
    }
}

/**
 * Filter jobs by remote preference
 * @param {Object} job - Job object
 * @param {boolean} remoteOnly - Whether to filter for remote jobs only
 * @returns {boolean} - Whether the job matches the remote preference  
 */
function matchesRemote(job, remoteOnly) {
    if (!remoteOnly) return true;
    
    const locationLower = (job.location || '').toLowerCase();
    return job.remote === true || 
           locationLower.includes('remote') || 
           locationLower.includes('worldwide') || 
           locationLower.includes('anywhere') ||
           locationLower.includes('work from home');
}

/**
 * Post-filter aggregated results based on user's selected filters
 * This ensures results match filters even when providers don't support them
 * @param {Array} jobs - Array of job objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered jobs
 */
function filterResults(jobs, filters) {
    const { country, experienceLevel, jobType, remote } = filters;
    
    // If no filters applied, return all jobs
    if (!country && !experienceLevel && !jobType && !remote) {
        return jobs;
    }
    
    return jobs.filter(job => {
        // Apply country filter
        if (!matchesCountry(job, country)) return false;
        
        // Apply experience level filter
        if (!matchesExperienceLevel(job, experienceLevel)) return false;
        
        // Apply job type filter
        if (!matchesJobType(job, jobType)) return false;
        
        // Apply remote filter
        if (!matchesRemote(job, remote)) return false;
        
        return true;
    });
}

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
        // Only enable if both APP_ID and APP_KEY are set and not empty placeholder values
        enabled: !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY && 
                   process.env.ADZUNA_APP_ID !== 'your_adzuna_app_id' &&
                   process.env.ADZUNA_APP_KEY !== 'your_adzuna_app_key'),
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
    ausbildung: {
        name: 'Ausbildung (Germany)',
        search: searchAusbildung,
        enabled: !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY && 
                   process.env.ADZUNA_APP_ID !== 'your_adzuna_app_id' &&
                   process.env.ADZUNA_APP_KEY !== 'your_adzuna_app_key'),
        priority: 5,
        rateLimit: 500,
        // Only used when explicitly searching for Ausbildung
        requiresExplicit: true,
    },
};

/**
 * Search for jobs across all enabled providers
 * @param {Object} params - Search parameters
 * @param {string} params.query - Job title or keywords
 * @param {string} params.location - City, state, or country
 * @param {string} params.country - Country code (e.g., 'us', 'uk')
 * @param {string} params.jobType - 'full-time', 'part-time', 'contract', 'ausbildung', etc.
 * @param {string} params.experienceLevel - 'entry', 'mid', 'senior', etc.
 * @param {number} params.salaryMin - Minimum salary
 * @param {number} params.salaryMax - Maximum salary
 * @param {boolean} params.remote - Remote jobs only
 * @param {boolean} params.isAusbildung - Search for Ausbildung (German apprenticeships)
 * @param {string} params.ausbildungField - Specific Ausbildung field
 * @param {string} params.startYear - Ausbildung start year (2025, 2026)
 * @param {boolean} params.isMorocco - Search specifically for Morocco jobs
 * @param {string[]} params.moroccoSources - Specific Morocco sources to search
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
        isAusbildung = false,
        ausbildungField = '',
        startYear = '',
        isMorocco = false,
        moroccoSources = null,
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

    // Check if this is an Ausbildung search
    const searchingAusbildung = isAusbildung || 
        jobType === 'ausbildung' || 
        query.toLowerCase().includes('ausbildung') ||
        query.toLowerCase().includes('azubi');

    // Check if this is a Morocco-specific search
    const searchingMorocco = isMorocco || 
        country.toLowerCase() === 'ma' || 
        country.toLowerCase() === 'morocco' ||
        country.toLowerCase() === 'maroc';

    // If searching Morocco, use Morocco providers
    if (searchingMorocco) {
        try {
            const moroccoResults = await searchMoroccoJobs({
                query,
                city: location,
                sector: '', // Can be extended later
                jobType,
                experienceLevel,
                sources: moroccoSources,
                page,
                limit,
            });

            // Also search global providers if user didn't specifically select Morocco-only
            // This provides a fallback and more results
            let globalJobs = [];
            let globalSources = [];
            
            // Search Adzuna with France fallback for Morocco (they often have some listings)
            if (!moroccoSources || moroccoSources.length === 0) {
                try {
                    const adzunaResults = await searchAdzuna({
                        query,
                        location,
                        country: 'ma',
                        jobType,
                        page,
                        limit: 20,
                    });
                    
                    if (adzunaResults.jobs && adzunaResults.jobs.length > 0) {
                        globalJobs = adzunaResults.jobs.map(job => normalizeJob(job, 'adzuna'));
                        globalSources.push('adzuna');
                    }
                } catch (e) {
                    // Adzuna failed, continue without it
                }
            }

            // Combine Morocco-specific and global results
            const allMoroccoJobs = [...moroccoResults.jobs, ...globalJobs];
            
            // Deduplicate
            const seenJobs = new Set();
            const uniqueJobs = allMoroccoJobs.filter(job => {
                const key = `${(job.title || '').toLowerCase()}-${(job.company || '').toLowerCase()}`;
                if (seenJobs.has(key)) return false;
                seenJobs.add(key);
                return true;
            });

            // Sort by date
            uniqueJobs.sort((a, b) => {
                const dateA = new Date(a.postedAt || 0);
                const dateB = new Date(b.postedAt || 0);
                return dateB - dateA;
            });

            // Paginate
            const startIndex = (page - 1) * limit;
            const paginatedJobs = uniqueJobs.slice(startIndex, startIndex + limit);

            // Cache results
            if (useCache && uniqueJobs.length > 0) {
                await cacheJobs(cacheKey, {
                    jobs: uniqueJobs,
                    total: uniqueJobs.length,
                    sources: [...moroccoResults.sources, ...globalSources],
                });
            }

            console.log(`🇲🇦 Morocco Search: "${query || 'all'}"${location ? ` in ${location}` : ''} → ${uniqueJobs.length} jobs [Morocco: ${moroccoResults.sources.join(', ')}${globalSources.length ? `, Global: ${globalSources.join(', ')}` : ''}]`);

            return {
                jobs: paginatedJobs,
                total: uniqueJobs.length,
                page,
                limit,
                totalPages: Math.ceil(uniqueJobs.length / limit),
                sources: [...moroccoResults.sources.map(s => `morocco_${s}`), ...globalSources],
                cached: false,
                isMoroccoSearch: true,
            };
        } catch (error) {
            console.error('Morocco search error:', error);
            // Fall through to regular search as fallback
        }
    }

    // Determine which providers to use
    const activeProviders = Object.entries(PROVIDERS)
        .filter(([key, provider]) => {
            if (!provider.enabled) return false;
            if (sources && !sources.includes(key)) return false;
            
            // Handle Ausbildung-specific provider
            if (key === 'ausbildung') {
                return searchingAusbildung;
            }
            
            // Skip Ausbildung provider for regular searches
            if (provider.requiresExplicit && !searchingAusbildung) {
                return false;
            }
            
            return true;
        })
        .sort((a, b) => a[1].priority - b[1].priority);

    // Fetch from all providers in parallel
    const searchPromises = activeProviders.map(async ([key, provider]) => {
        try {
            // Build provider-specific params
            const providerParams = {
                query,
                location,
                country,
                jobType,
                experienceLevel,
                salaryMin,
                salaryMax,
                remote,
                page,
                limit: Math.max(limit, 30), // Request at least 30 jobs from each provider
            };
            
            // Add Ausbildung-specific params
            if (key === 'ausbildung') {
                providerParams.field = ausbildungField;
                providerParams.startYear = startYear;
            }
            
            const results = await provider.search(providerParams);
            
            return {
                source: key,
                jobs: results.jobs.map(job => {
                    const normalized = normalizeJob(job, key);
                    
                    // Add Ausbildung-specific details
                    if (key === 'ausbildung' || job.isAusbildung) {
                        normalized.isAusbildung = true;
                        normalized.ausbildungDetails = extractAusbildungDetails(job);
                    }
                    
                    return normalized;
                }),
                total: results.total || results.jobs.length,
                error: null,
            };
        } catch (error) {
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
    const sourcesUsed = [];
    const providerStats = [];

    for (const result of results) {
        const jobCount = result.jobs?.length || 0;
        
        if (result.error) {
            providerStats.push(`${result.source}:0`);
            continue;
        }
        
        providerStats.push(`${result.source}:${jobCount}`);
        sourcesUsed.push(result.source);
        
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

    // Apply post-filtering to ensure results match user's selected filters
    // This is necessary because not all providers support all filters
    const filteredJobs = filterResults(allJobs, {
        country,
        experienceLevel,
        jobType,
        remote,
    });

    // Paginate filtered results
    const startIndex = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limit);

    // Use actual filtered job count for total
    const totalCount = filteredJobs.length;

    // Log clean search summary with provider breakdown
    const filters = [country, experienceLevel, jobType, remote && 'remote'].filter(Boolean);
    const filterStr = filters.length ? ` | Filters: ${filters.join(', ')}` : '';
    const filterNote = allJobs.length !== filteredJobs.length ? ` (${allJobs.length} before filters)` : '';
    console.log(`🔍 Search: "${query || 'all'}"${location ? ` in ${location}` : ''} → ${totalCount} jobs${filterNote} [${providerStats.join(', ')}]${filterStr}`);

    // Cache results
    if (useCache && filteredJobs.length > 0) {
        await cacheJobs(cacheKey, {
            jobs: filteredJobs,
            total: totalCount,
            sources: sourcesUsed,
        });
    }

    return {
        jobs: paginatedJobs,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(filteredJobs.length / limit),
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
    // Split only on first underscore
    const underscoreIndex = jobId.indexOf('_');
    if (underscoreIndex === -1) return null;
    
    const source = jobId.substring(0, underscoreIndex);
    const externalId = jobId.substring(underscoreIndex + 1);
    
    if (!source || !externalId) {
        return null;
    }

    const provider = PROVIDERS[source];
    if (!provider || !provider.enabled) {
        // Provider not available, return a basic job object from the ID
        return null;
    }

    try {
        // Try to get job from specific provider if they support direct lookup
        if (source === 'themuse') {
            const { getTheMuseJob } = await import('./providers/themuse');
            const job = await getTheMuseJob(externalId);
            if (job) {
                return normalizeJob(job, source);
            }
        }
        
        // For other providers, we'd need to implement specific lookups
        // For now, return null and let the cache handle it
    } catch (error) {
        console.error(`Error fetching job ${jobId}:`, error.message);
    }

    return null;
}

/**
 * Fetch a job directly from the source provider
 * This is a fallback when cache misses and getJobById doesn't have a direct API
 * @param {string} jobId - Job ID (format: source_externalId)
 * @returns {Promise<Object|null>} - Job details or null
 */
export async function fetchJobDirectly(jobId) {
    const underscoreIndex = jobId.indexOf('_');
    if (underscoreIndex === -1) return null;
    
    const source = jobId.substring(0, underscoreIndex);
    const externalId = jobId.substring(underscoreIndex + 1);
    
    if (!source || !externalId) return null;

    try {
        // Handle different sources
        switch (source) {
            case 'themuse': {
                const { getTheMuseJob } = await import('./providers/themuse');
                const job = await getTheMuseJob(externalId);
                if (job) {
                    return normalizeJob(job, source);
                }
                break;
            }
            
            case 'remoteok': {
                // Remote OK jobs are fetched as a list, try to fetch the full list
                // and find the specific job (inefficient but works as fallback)
                const { searchRemoteOK } = await import('./providers/remoteok');
                const results = await searchRemoteOK({ limit: 100 });
                const job = results.jobs.find(j => 
                    String(j.id) === externalId || 
                    String(j.slug) === externalId ||
                    `${j.id}` === externalId
                );
                if (job) {
                    return normalizeJob(job, source);
                }
                break;
            }
            
            case 'adzuna': {
                // Adzuna doesn't support single job lookup directly
                // Return null to trigger 404
                break;
            }
            
            case 'jsearch': {
                // JSearch has a job details endpoint
                const { getJSearchJobDetails } = await import('./providers/jsearch');
                const job = await getJSearchJobDetails(externalId);
                if (job) {
                    return normalizeJob(job, source);
                }
                break;
            }
            
            case 'ausbildung': {
                // Ausbildung uses Adzuna Germany, same limitation
                break;
            }
            
            case 'morocco': {
                // Morocco jobs are scraped and don't have a direct API
                // The job data was in the original search results
                // We can't re-scrape individual jobs - they need to be cached
                // Return null - the job may have expired or cache was cleared
                console.log(`Morocco job ${jobId} not found in cache - these jobs are scraped and cannot be fetched individually`);
                break;
            }
            
            default:
                console.log(`Unknown job source: ${source}`);
        }
    } catch (error) {
        console.error(`Error fetching job directly from ${source}:`, error.message);
    }

    return null;
}

/**
 * Generate a cache key from search parameters
 */
function generateCacheKey(params) {
    const { query, location, country, jobType, experienceLevel, remote, page, limit, isAusbildung, ausbildungField, isMorocco, moroccoSources } = params;
    const moroccoKey = isMorocco ? `:morocco:${(moroccoSources || []).join(',')}` : '';
    return `jobs:${query}:${location}:${country}:${jobType}:${experienceLevel}:${remote}:${page}:${limit}:${isAusbildung || ''}:${ausbildungField || ''}${moroccoKey}`.toLowerCase();
}

/**
 * Get list of available/enabled providers
 */
export function getAvailableProviders() {
    return Object.entries(PROVIDERS)
        .filter(([, provider]) => provider.enabled && !provider.requiresExplicit)
        .map(([key, provider]) => ({
            id: key,
            name: provider.name,
        }));
}

/**
 * Get Ausbildung-specific data
 */
export function getAusbildungData() {
    return {
        fields: AUSBILDUNG_FIELDS,
        states: GERMAN_STATES,
        cities: GERMAN_CITIES,
    };
}

/**
 * Get Morocco-specific data and sources
 */
export function getMoroccoData() {
    return {
        sources: getMoroccoSourcesInfo(),
        cities: MOROCCO_CITIES,
        sectors: MOROCCO_SECTORS,
    };
}

/**
 * Check if a country is Morocco
 */
export function isMoroccoCountry(country) {
    if (!country) return false;
    const c = country.toLowerCase();
    return c === 'ma' || c === 'morocco' || c === 'maroc';
}

export { PROVIDERS, extractAusbildungDetails, MOROCCO_SOURCES, MOROCCO_CITIES, MOROCCO_SECTORS };
