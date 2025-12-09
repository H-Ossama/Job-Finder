/**
 * Morocco Job Search with Puppeteer Scraping
 * 
 * This module provides a unified interface for searching Morocco job sites
 * using browser automation (Puppeteer) with graceful fallback to mock data.
 * 
 * Usage:
 *   import { searchMoroccoWithScraper } from '@/utils/jobs/scraper/search';
 *   const results = await searchMoroccoWithScraper({ query: 'developer', city: 'Casablanca' });
 */

import { normalizeJobFromMorocco } from '../providers/morocco/normalizer.js';

// Dynamic import for Puppeteer (only load when needed)
let scraperModule = null;

async function getScraperModule() {
    if (!scraperModule) {
        try {
            scraperModule = await import('./morocco.js');
        } catch (error) {
            console.warn('Puppeteer scraper not available:', error.message);
            scraperModule = null;
        }
    }
    return scraperModule;
}

/**
 * Check if Puppeteer is available
 */
export async function isScraperAvailable() {
    try {
        const puppeteer = await import('puppeteer');
        return !!puppeteer;
    } catch {
        return false;
    }
}

/**
 * Search Morocco job sites with Puppeteer scraping
 * Falls back to mock data if scraping fails or is unavailable
 * 
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchMoroccoWithScraper(params = {}) {
    const {
        query = '',
        city = '',
        sources = null,
        limit = 20,
        useScraper = true,
    } = params;

    // Try Puppeteer scraping first if enabled
    if (useScraper) {
        try {
            const scraper = await getScraperModule();
            if (scraper) {
                const results = await scraper.scrapeAllMoroccoSites(
                    { query, city, limit },
                    sources
                );
                
                if (results.jobs && results.jobs.length > 0) {
                    console.log(`✅ Scraper success: ${results.jobs.length} jobs from ${results.sources.join(', ')}`);
                    return {
                        ...results,
                        method: 'scraper',
                    };
                }
            }
        } catch (error) {
            console.warn('Scraper failed, falling back to mock data:', error.message);
        }
    }

    // Fallback to mock data
    console.log('📦 Using mock data for Morocco jobs');
    return {
        jobs: getMockMoroccoJobs(query, city, limit),
        total: 30,
        sources: ['mock'],
        method: 'mock',
    };
}

/**
 * Search a single Morocco site with scraping
 */
export async function searchSingleSiteWithScraper(siteId, params = {}) {
    const { query = '', city = '', limit = 20 } = params;

    try {
        const scraper = await getScraperModule();
        if (scraper) {
            return await scraper.scrapeMoroccoSite(siteId, { query, city, limit });
        }
    } catch (error) {
        console.warn(`Scraper failed for ${siteId}:`, error.message);
    }

    // Return mock data for the specific site
    return {
        jobs: getMockJobsForSite(siteId, query, city, limit),
        total: 5,
        source: siteId,
        method: 'mock',
    };
}

/**
 * Get mock jobs for all Morocco sites
 */
function getMockMoroccoJobs(query, city, limit) {
    const allMockJobs = [
        // Tech jobs
        ...generateMockJobs('tech', query, city),
        // Business jobs
        ...generateMockJobs('business', query, city),
        // Public sector jobs
        ...generateMockJobs('public', query, city),
        // Internships
        ...generateMockJobs('internship', query, city),
    ];

    // Filter by query if provided
    let filtered = allMockJobs;
    if (query) {
        const queryLower = query.toLowerCase();
        filtered = allMockJobs.filter(job =>
            job.title.toLowerCase().includes(queryLower) ||
            job.description?.toLowerCase().includes(queryLower) ||
            job.company.toLowerCase().includes(queryLower)
        );
    }

    // Filter by city if provided
    if (city) {
        const cityLower = city.toLowerCase();
        filtered = filtered.filter(job =>
            job.location.toLowerCase().includes(cityLower)
        );
    }

    return filtered.slice(0, limit);
}

/**
 * Generate mock jobs by category
 */
function generateMockJobs(category, query, city) {
    const cities = city ? [city] : ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Fès'];
    const now = Date.now();

    const templates = {
        tech: [
            { title: 'Développeur Full Stack', company: 'Tech Maroc Solutions', jobType: 'CDI', source: 'emploi' },
            { title: 'Ingénieur DevOps', company: 'CloudTech MA', jobType: 'CDI', source: 'rekrute' },
            { title: 'Data Scientist', company: 'DataLab Maroc', jobType: 'CDI', source: 'dreamjob' },
            { title: 'Développeur Mobile', company: 'AppFactory', jobType: 'CDI', source: 'emploi' },
            { title: 'Architecte Cloud', company: 'Enterprise IT', jobType: 'CDI', source: 'rekrute' },
            { title: 'Ingénieur Cybersécurité', company: 'SecureNet MA', jobType: 'CDI', source: 'dreamjob' },
        ],
        business: [
            { title: 'Chef de Projet', company: 'Consulting Group MA', jobType: 'CDI', source: 'emploi' },
            { title: 'Responsable Marketing', company: 'Marketing Plus', jobType: 'CDI', source: 'rekrute' },
            { title: 'Commercial B2B', company: 'Sales Force MA', jobType: 'CDI', source: 'marocannonces' },
            { title: 'Directeur Financier', company: 'Finance Corp', jobType: 'CDI', source: 'rekrute' },
            { title: 'Responsable RH', company: 'HR Solutions', jobType: 'CDI', source: 'emploi' },
        ],
        public: [
            { title: 'Concours Ministère des Finances', company: 'Ministère des Finances', jobType: 'Concours', source: 'alwadifa' },
            { title: 'Recrutement ANAPEC', company: 'ANAPEC', jobType: 'Emploi Public', source: 'emploipublic' },
            { title: 'Concours Collectivités Territoriales', company: 'Collectivités Territoriales', jobType: 'Concours', source: 'alwadifa' },
            { title: 'Ingénieurs Ministère de l\'Équipement', company: 'Ministère de l\'Équipement', jobType: 'Concours', source: 'emploipublic' },
        ],
        internship: [
            { title: 'Stage PFE - Développement Web', company: 'Startup Tech', jobType: 'Stage', source: 'stagiaires' },
            { title: 'Stage Marketing Digital', company: 'Digital Agency', jobType: 'Stage', source: 'stagiaires' },
            { title: 'Stage Data Analysis', company: 'Analytics Corp', jobType: 'Stage', source: 'dreamjob' },
            { title: 'Stage Finance', company: 'Bank of Morocco', jobType: 'Stage', source: 'stagiaires' },
        ],
    };

    const jobs = templates[category] || [];
    return jobs.map((template, index) => {
        const randomCity = cities[index % cities.length];
        const daysAgo = Math.floor(Math.random() * 14) + 1;
        
        return normalizeJobFromMorocco({
            ...template,
            title: query ? `${template.title} - ${query}` : template.title,
            location: randomCity,
            description: `Opportunité ${template.jobType} chez ${template.company} à ${randomCity}. ${query ? `Compétences requises: ${query}` : ''}`,
            postedAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
            url: `https://www.${template.source === 'emploi' ? 'emploi.ma' : template.source + '.ma'}/offre/${index}`,
        }, template.source);
    });
}

/**
 * Get mock jobs for a specific site
 */
function getMockJobsForSite(siteId, query, city, limit) {
    const siteJobs = {
        emploi: generateMockJobs('tech', query, city).filter(j => j.source?.includes('emploi')),
        rekrute: generateMockJobs('tech', query, city).filter(j => j.source?.includes('rekrute')),
        dreamjob: generateMockJobs('tech', query, city).filter(j => j.source?.includes('dreamjob')),
        marocannonces: generateMockJobs('business', query, city).filter(j => j.source?.includes('marocannonces')),
        alwadifa: generateMockJobs('public', query, city).filter(j => j.source?.includes('alwadifa')),
        emploipublic: generateMockJobs('public', query, city).filter(j => j.source?.includes('emploipublic')),
        stagiaires: generateMockJobs('internship', query, city).filter(j => j.source?.includes('stagiaires')),
    };

    const jobs = siteJobs[siteId] || generateMockJobs('tech', query, city);
    return jobs.slice(0, limit);
}

export default {
    searchMoroccoWithScraper,
    searchSingleSiteWithScraper,
    isScraperAvailable,
};
