/**
 * Morocco Job Providers Aggregator
 * Combines multiple Moroccan job sources for comprehensive coverage
 * 
 * Supported Sources:
 * - Emploi.ma - Oldest job board (2002), generalist
 * - Dreamjob.ma - Popular job board, all sectors + internships
 * - Rekrute.com - Major recruitment platform
 * - MarocAnnonces - Classifieds with job section
 * - Alwadifa-Maroc.com - Public sector and concours
 * - Emploi-Public.ma - Government jobs portal
 * - Stagiaires.ma - Internship platform
 * 
 * Note: Due to most Moroccan job sites not having public APIs,
 * we use a combination of:
 * 1. RSS feeds where available
 * 2. Structured data parsing
 * 3. Adzuna Morocco (via France/EU fallback)
 */

import { searchEmploi } from './emploi';
import { searchDreamjob } from './dreamjob';
import { searchRekrute } from './rekrute';
import { searchMarocAnnonces } from './marocannonces';
import { searchAlwadifa } from './alwadifa';
import { searchEmploiPublic } from './emploipublic';
import { searchStagiaires } from './stagiaires';

// Morocco-specific cities for filtering
export const MOROCCO_CITIES = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 
    'Meknès', 'Oujda', 'Kenitra', 'Tétouan', 'Safi', 'El Jadida',
    'Nador', 'Beni Mellal', 'Khouribga', 'Taza', 'Mohammedia',
    'Essaouira', 'Settat', 'Ksar El Kebir', 'Larache', 'Salé',
    'Temara', 'Kénitra', 'Errachidia', 'Ouarzazate', 'Berkane'
];

// Morocco job sectors/categories
export const MOROCCO_SECTORS = [
    { id: 'informatique', name: 'Informatique / IT', nameEn: 'IT / Technology' },
    { id: 'commercial', name: 'Commercial / Vente', nameEn: 'Sales / Business' },
    { id: 'marketing', name: 'Marketing / Communication', nameEn: 'Marketing / Communication' },
    { id: 'finance', name: 'Finance / Comptabilité', nameEn: 'Finance / Accounting' },
    { id: 'rh', name: 'Ressources Humaines', nameEn: 'Human Resources' },
    { id: 'ingenierie', name: 'Ingénierie / Technique', nameEn: 'Engineering / Technical' },
    { id: 'sante', name: 'Santé / Médical', nameEn: 'Healthcare / Medical' },
    { id: 'education', name: 'Éducation / Formation', nameEn: 'Education / Training' },
    { id: 'hotellerie', name: 'Hôtellerie / Tourisme', nameEn: 'Hospitality / Tourism' },
    { id: 'logistique', name: 'Logistique / Transport', nameEn: 'Logistics / Transport' },
    { id: 'industrie', name: 'Industrie / Production', nameEn: 'Industry / Manufacturing' },
    { id: 'btp', name: 'BTP / Construction', nameEn: 'Construction' },
    { id: 'banque', name: 'Banque / Assurance', nameEn: 'Banking / Insurance' },
    { id: 'juridique', name: 'Juridique / Droit', nameEn: 'Legal' },
    { id: 'agriculture', name: 'Agriculture / Agroalimentaire', nameEn: 'Agriculture / Food' },
];

// Morocco job source configurations
export const MOROCCO_SOURCES = {
    emploi: {
        id: 'emploi',
        name: 'Emploi.ma',
        nameAr: 'إمبلوي.ما',
        url: 'https://www.emploi.ma',
        description: 'Site généraliste, très ancien (2002), large choix d\'annonces',
        descriptionEn: 'Oldest generalist job board (2002), wide selection',
        color: '#0066cc',
        icon: '💼',
        enabled: true,
        priority: 1,
        search: searchEmploi,
        hasAPI: false,
        rateLimit: 2000, // 2 seconds between requests
    },
    dreamjob: {
        id: 'dreamjob',
        name: 'Dreamjob.ma',
        nameAr: 'دريم جوب',
        url: 'https://www.dreamjob.ma',
        description: 'Job-board populaire : emplois tous secteurs + stages',
        descriptionEn: 'Popular job board: all sectors + internships',
        color: '#ff6b35',
        icon: '⭐',
        enabled: true,
        priority: 2,
        search: searchDreamjob,
        hasAPI: false,
        rateLimit: 2000,
    },
    rekrute: {
        id: 'rekrute',
        name: 'Rekrute.com',
        nameAr: 'ريكروت',
        url: 'https://www.rekrute.com',
        description: 'Plateforme majeure de recrutement au Maroc',
        descriptionEn: 'Major recruitment platform in Morocco',
        color: '#e31937',
        icon: '🎯',
        enabled: true,
        priority: 3,
        search: searchRekrute,
        hasAPI: false,
        rateLimit: 2000,
    },
    marocannonces: {
        id: 'marocannonces',
        name: 'MarocAnnonces',
        nameAr: 'ماروك أنونس',
        url: 'https://www.marocannonces.com',
        description: 'Portail d\'annonces avec section emploi',
        descriptionEn: 'Classifieds portal with job section',
        color: '#28a745',
        icon: '📋',
        enabled: true,
        priority: 4,
        search: searchMarocAnnonces,
        hasAPI: false,
        rateLimit: 2000,
    },
    alwadifa: {
        id: 'alwadifa',
        name: 'Alwadifa-Maroc',
        nameAr: 'الوظيفة المغرب',
        url: 'https://alwadifa-maroc.com',
        description: 'Concours et emplois du secteur public',
        descriptionEn: 'Public sector jobs and competitive exams (concours)',
        color: '#1e3a5f',
        icon: '🏛️',
        enabled: true,
        priority: 5,
        search: searchAlwadifa,
        hasAPI: false,
        rateLimit: 2000,
        category: 'public',
    },
    emploipublic: {
        id: 'emploipublic',
        name: 'Emploi-Public.ma',
        nameAr: 'التوظيف العمومي',
        url: 'https://www.emploi-public.ma',
        description: 'Portail officiel des emplois publics',
        descriptionEn: 'Official public sector employment portal',
        color: '#c41e3a',
        icon: '🇲🇦',
        enabled: true,
        priority: 6,
        search: searchEmploiPublic,
        hasAPI: false,
        rateLimit: 2000,
        category: 'public',
    },
    stagiaires: {
        id: 'stagiaires',
        name: 'Stagiaires.ma',
        nameAr: 'المتدربين',
        url: 'https://www.stagiaires.ma',
        description: 'Plateforme spécialisée pour les stages',
        descriptionEn: 'Specialized internship platform for students',
        color: '#6b46c1',
        icon: '🎓',
        enabled: true,
        priority: 7,
        search: searchStagiaires,
        hasAPI: false,
        rateLimit: 2000,
        category: 'internship',
    },
};

// Get enabled Morocco sources
export function getEnabledMoroccoSources() {
    return Object.values(MOROCCO_SOURCES)
        .filter(source => source.enabled)
        .sort((a, b) => a.priority - b.priority);
}

// Get source by ID
export function getMoroccoSourceById(id) {
    return MOROCCO_SOURCES[id] || null;
}

/**
 * Search all Morocco job sources
 * @param {Object} params - Search parameters
 * @param {string} params.query - Job title or keywords
 * @param {string} params.city - City in Morocco
 * @param {string} params.sector - Job sector/category
 * @param {string} params.jobType - Contract type (CDI, CDD, Stage, etc.)
 * @param {string[]} params.sources - Specific sources to search (optional)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Results per page
 * @param {boolean} params.useScraper - Use Puppeteer scraper (default: false for performance)
 * @returns {Promise<Object>} - Combined search results
 */
export async function searchMoroccoJobs(params = {}) {
    const {
        query = '',
        city = '',
        sector = '',
        jobType = '',
        experienceLevel = '',
        sources = null, // null = all enabled sources
        page = 1,
        limit = 20,
        timeout = 10000, // 10 second timeout per source
        useScraper = false, // Puppeteer scraping (disabled by default for performance)
    } = params;

    // Try Puppeteer scraper if enabled
    if (useScraper) {
        try {
            const { searchMoroccoWithScraper } = await import('../../scraper/search.js');
            const scraperResults = await searchMoroccoWithScraper({
                query,
                city,
                sources,
                limit: limit * 2,
                useScraper: true,
            });
            
            if (scraperResults.jobs && scraperResults.jobs.length > 0) {
                // Paginate
                const startIndex = (page - 1) * limit;
                const paginatedJobs = scraperResults.jobs.slice(startIndex, startIndex + limit);
                
                return {
                    jobs: paginatedJobs,
                    total: scraperResults.total,
                    page,
                    limit,
                    totalPages: Math.ceil(scraperResults.total / limit),
                    sources: scraperResults.sources,
                    method: 'scraper',
                };
            }
        } catch (error) {
            console.warn('Puppeteer scraper not available, using fetch fallback:', error.message);
        }
    }

    // Determine which sources to search
    const enabledSources = getEnabledMoroccoSources();
    const sourcesToSearch = sources 
        ? enabledSources.filter(s => sources.includes(s.id))
        : enabledSources;

    if (sourcesToSearch.length === 0) {
        return {
            jobs: [],
            total: 0,
            sources: [],
            errors: ['No Morocco sources enabled or selected'],
        };
    }

    // Create search promises with timeout
    const searchPromises = sourcesToSearch.map(async (source) => {
        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Timeout searching ${source.name}`)), timeout);
            });

            // Create the search promise
            const searchPromise = source.search({
                query,
                city,
                sector,
                jobType,
                experienceLevel,
                page,
                limit: Math.max(limit, 30), // Request more to have buffer for deduplication
            });

            // Race between search and timeout
            const result = await Promise.race([searchPromise, timeoutPromise]);

            return {
                source: source.id,
                sourceName: source.name,
                jobs: result.jobs || [],
                total: result.total || 0,
                error: null,
            };
        } catch (error) {
            console.log(`⚠️ Morocco [${source.name}]: ${error.message}`);
            return {
                source: source.id,
                sourceName: source.name,
                jobs: [],
                total: 0,
                error: error.message,
            };
        }
    });

    // Wait for all searches (with individual timeouts)
    const results = await Promise.all(searchPromises);

    // Combine and deduplicate results
    const allJobs = [];
    const seenJobs = new Set();
    const sourcesUsed = [];
    const errors = [];
    const providerStats = [];

    for (const result of results) {
        if (result.error) {
            errors.push(`${result.sourceName}: ${result.error}`);
            providerStats.push(`${result.source}:0`);
            continue;
        }

        const jobCount = result.jobs?.length || 0;
        providerStats.push(`${result.source}:${jobCount}`);

        if (jobCount > 0) {
            sourcesUsed.push(result.source);
        }

        for (const job of result.jobs) {
            // Deduplicate by title + company combination
            const jobKey = `${(job.title || '').toLowerCase()}-${(job.company || '').toLowerCase()}`;
            if (!seenJobs.has(jobKey)) {
                seenJobs.add(jobKey);
                allJobs.push({
                    ...job,
                    source: `morocco_${result.source}`,
                    sourceInfo: {
                        id: result.source,
                        name: result.sourceName,
                        country: 'MA',
                    },
                });
            }
        }
    }

    // Sort by posted date (newest first)
    allJobs.sort((a, b) => {
        const dateA = new Date(a.postedAt || 0);
        const dateB = new Date(b.postedAt || 0);
        return dateB - dateA;
    });

    // Apply city filter if specified
    let filteredJobs = allJobs;
    if (city) {
        const cityLower = city.toLowerCase();
        filteredJobs = allJobs.filter(job => {
            const locationLower = (job.location || '').toLowerCase();
            return locationLower.includes(cityLower) || 
                   locationLower.includes('maroc') ||
                   locationLower.includes('morocco') ||
                   !job.location; // Include jobs without location
        });
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limit);

    // Log search summary
    console.log(`🇲🇦 Morocco Search: "${query || 'all'}"${city ? ` in ${city}` : ''} → ${filteredJobs.length} jobs [${providerStats.join(', ')}]`);

    return {
        jobs: paginatedJobs,
        total: filteredJobs.length,
        page,
        limit,
        totalPages: Math.ceil(filteredJobs.length / limit),
        sources: sourcesUsed,
        errors: errors.length > 0 ? errors : null,
    };
}

/**
 * Get available Morocco job sources with their status
 */
export function getMoroccoSourcesInfo() {
    return Object.values(MOROCCO_SOURCES).map(source => ({
        id: source.id,
        name: source.name,
        nameAr: source.nameAr,
        url: source.url,
        description: source.description,
        descriptionEn: source.descriptionEn,
        color: source.color,
        icon: source.icon,
        enabled: source.enabled,
    }));
}

export default searchMoroccoJobs;
