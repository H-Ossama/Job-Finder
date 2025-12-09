/**
 * Morocco Job Sites Scraper
 * Uses Puppeteer for browser automation to scrape Moroccan job sites
 * 
 * Supported sites:
 * - Emploi.ma
 * - Rekrute.com
 * - Dreamjob.ma
 * - MarocAnnonces
 * - Alwadifa-Maroc.com
 * - Emploi-Public.ma
 * - Stagiaires.ma
 */

import { scrapePage, scrapePages } from './index.js';
import { normalizeJobFromMorocco } from '../providers/morocco/normalizer.js';

/**
 * Site-specific extraction scripts for Puppeteer page.evaluate()
 */
const EXTRACTION_SCRIPTS = {
    /**
     * Emploi.ma extraction
     */
    emploi: () => {
        const jobs = [];
        
        // Try multiple selectors
        const jobCards = document.querySelectorAll(
            '.job-listing, .offre-emploi, article.job, .search-result-item, [class*="job-card"]'
        );
        
        jobCards.forEach(card => {
            try {
                const titleEl = card.querySelector('h2 a, h3 a, .job-title a, [class*="title"] a');
                const companyEl = card.querySelector('.company, .entreprise, [class*="company"]');
                const locationEl = card.querySelector('.location, .ville, [class*="location"]');
                const dateEl = card.querySelector('.date, time, [class*="date"]');
                const urlEl = card.querySelector('a[href*="offre"], a[href*="emploi"]');
                
                if (titleEl) {
                    jobs.push({
                        title: titleEl.textContent?.trim(),
                        company: companyEl?.textContent?.trim() || 'Entreprise',
                        location: locationEl?.textContent?.trim() || 'Maroc',
                        url: urlEl?.href || titleEl?.href,
                        postedAt: dateEl?.getAttribute('datetime') || dateEl?.textContent?.trim(),
                    });
                }
            } catch (e) {
                // Skip malformed entries
            }
        });
        
        // Also check JSON-LD
        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        jsonLdScripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                if (data['@type'] === 'JobPosting') {
                    jobs.push({
                        title: data.title,
                        company: data.hiringOrganization?.name,
                        location: data.jobLocation?.address?.addressLocality,
                        url: data.url || window.location.href,
                        postedAt: data.datePosted,
                        description: data.description,
                        salary: data.baseSalary?.value?.value,
                    });
                } else if (data['@graph']) {
                    data['@graph'].filter(item => item['@type'] === 'JobPosting').forEach(job => {
                        jobs.push({
                            title: job.title,
                            company: job.hiringOrganization?.name,
                            location: job.jobLocation?.address?.addressLocality,
                            url: job.url,
                            postedAt: job.datePosted,
                        });
                    });
                }
            } catch (e) {}
        });
        
        return jobs;
    },

    /**
     * Rekrute.com extraction
     */
    rekrute: () => {
        const jobs = [];
        
        const jobCards = document.querySelectorAll(
            '.post-id, .job-item, article, .offre, [class*="job-listing"]'
        );
        
        jobCards.forEach(card => {
            try {
                const titleEl = card.querySelector('h2, h3, .titreoffre, [class*="title"]');
                const companyEl = card.querySelector('.company, .entreprise, [class*="company"]');
                const locationEl = card.querySelector('.location, .ville, [class*="location"]');
                const dateEl = card.querySelector('.date, time');
                const urlEl = card.querySelector('a[href*="offre"]');
                
                if (titleEl) {
                    jobs.push({
                        title: titleEl.textContent?.trim(),
                        company: companyEl?.textContent?.trim() || 'Entreprise',
                        location: locationEl?.textContent?.trim() || 'Maroc',
                        url: urlEl?.href,
                        postedAt: dateEl?.textContent?.trim(),
                    });
                }
            } catch (e) {}
        });
        
        return jobs;
    },

    /**
     * Dreamjob.ma extraction
     */
    dreamjob: () => {
        const jobs = [];
        
        const jobCards = document.querySelectorAll(
            '.job-listing, .offre, article, .job-item, [class*="job"]'
        );
        
        jobCards.forEach(card => {
            try {
                const titleEl = card.querySelector('h2 a, h3 a, .job-title, [class*="title"]');
                const companyEl = card.querySelector('.company, .entreprise');
                const locationEl = card.querySelector('.location, .ville');
                const dateEl = card.querySelector('.date, time');
                const urlEl = card.querySelector('a[href]');
                
                if (titleEl) {
                    jobs.push({
                        title: titleEl.textContent?.trim(),
                        company: companyEl?.textContent?.trim() || 'Entreprise',
                        location: locationEl?.textContent?.trim() || 'Maroc',
                        url: urlEl?.href,
                        postedAt: dateEl?.textContent?.trim(),
                    });
                }
            } catch (e) {}
        });
        
        return jobs;
    },

    /**
     * MarocAnnonces extraction
     */
    marocannonces: () => {
        const jobs = [];
        
        const jobCards = document.querySelectorAll(
            '.cars-list li, .listing-item, article, .annonce'
        );
        
        jobCards.forEach(card => {
            try {
                const titleEl = card.querySelector('h3 a, h2 a, .title a, [class*="title"]');
                const locationEl = card.querySelector('.location, .ville, [class*="location"]');
                const dateEl = card.querySelector('.date, time, [class*="date"]');
                const urlEl = card.querySelector('a[href]');
                const priceEl = card.querySelector('.price, .prix');
                
                if (titleEl) {
                    jobs.push({
                        title: titleEl.textContent?.trim(),
                        company: 'Via MarocAnnonces',
                        location: locationEl?.textContent?.trim() || 'Maroc',
                        url: urlEl?.href,
                        postedAt: dateEl?.textContent?.trim(),
                        salary: priceEl?.textContent?.trim(),
                    });
                }
            } catch (e) {}
        });
        
        return jobs;
    },

    /**
     * Alwadifa-Maroc.com extraction (WordPress)
     */
    alwadifa: () => {
        const jobs = [];
        
        // WordPress article pattern
        const articles = document.querySelectorAll(
            'article, .post, .entry, [class*="post-"]'
        );
        
        articles.forEach(article => {
            try {
                const titleEl = article.querySelector('.entry-title a, h2 a, h3 a');
                const dateEl = article.querySelector('.entry-date, .posted-on, time');
                const categoryEl = article.querySelector('.cat-links a, .category');
                const excerptEl = article.querySelector('.entry-summary, .excerpt');
                
                if (titleEl) {
                    const title = titleEl.textContent?.trim();
                    jobs.push({
                        title,
                        company: extractCompanyFromTitle(title),
                        location: extractLocationFromTitle(title),
                        url: titleEl.href,
                        postedAt: dateEl?.getAttribute('datetime') || dateEl?.textContent?.trim(),
                        category: categoryEl?.textContent?.trim(),
                        description: excerptEl?.textContent?.trim(),
                    });
                }
            } catch (e) {}
        });
        
        function extractCompanyFromTitle(title) {
            const patterns = [
                /(?:chez|par|à)\s+([^-–]+)/i,
                /(?:ministère|office|agence)\s+([^-–]+)/i,
            ];
            for (const pattern of patterns) {
                const match = title.match(pattern);
                if (match) return match[1].trim().substring(0, 50);
            }
            return 'Administration Publique';
        }
        
        function extractLocationFromTitle(title) {
            const cities = ['Rabat', 'Casablanca', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda'];
            const titleLower = title.toLowerCase();
            for (const city of cities) {
                if (titleLower.includes(city.toLowerCase())) return city;
            }
            return 'Maroc';
        }
        
        return jobs;
    },

    /**
     * Emploi-Public.ma extraction
     */
    emploipublic: () => {
        const jobs = [];
        
        const articles = document.querySelectorAll(
            'article, .post, .concours-item, [class*="job"]'
        );
        
        articles.forEach(article => {
            try {
                const titleEl = article.querySelector('h2 a, h3 a, .title a');
                const dateEl = article.querySelector('.date, time');
                const orgEl = article.querySelector('.organization, .ministere');
                
                if (titleEl) {
                    jobs.push({
                        title: titleEl.textContent?.trim(),
                        company: orgEl?.textContent?.trim() || 'Secteur Public',
                        location: 'Maroc',
                        url: titleEl.href,
                        postedAt: dateEl?.textContent?.trim(),
                        jobType: 'Fonction Publique',
                    });
                }
            } catch (e) {}
        });
        
        return jobs;
    },

    /**
     * Stagiaires.ma extraction
     */
    stagiaires: () => {
        const jobs = [];
        
        const stageCards = document.querySelectorAll(
            '.stage-item, .internship, article, .offre, [class*="stage"]'
        );
        
        stageCards.forEach(card => {
            try {
                const titleEl = card.querySelector('h2 a, h3 a, .title a');
                const companyEl = card.querySelector('.company, .entreprise');
                const locationEl = card.querySelector('.location, .ville');
                const dateEl = card.querySelector('.date, time');
                const durationEl = card.querySelector('.duration, .duree');
                
                if (titleEl) {
                    jobs.push({
                        title: titleEl.textContent?.trim(),
                        company: companyEl?.textContent?.trim() || 'Entreprise',
                        location: locationEl?.textContent?.trim() || 'Maroc',
                        url: titleEl.href,
                        postedAt: dateEl?.textContent?.trim(),
                        duration: durationEl?.textContent?.trim(),
                        jobType: 'Stage',
                    });
                }
            } catch (e) {}
        });
        
        return jobs;
    },
};

/**
 * Site configurations
 */
const SITE_CONFIGS = {
    emploi: {
        name: 'Emploi.ma',
        baseUrl: 'https://www.emploi.ma',
        searchUrl: (query, city) => {
            const params = new URLSearchParams();
            if (query) params.set('q', query);
            if (city) params.set('lieu', city);
            return `https://www.emploi.ma/recherche-jobs-maroc${params.toString() ? '?' + params : ''}`;
        },
        listingUrl: 'https://www.emploi.ma/offres-emploi',
        waitForSelector: '.job-listing, article, .search-results',
        extractScript: EXTRACTION_SCRIPTS.emploi,
    },
    rekrute: {
        name: 'Rekrute.com',
        baseUrl: 'https://www.rekrute.com',
        searchUrl: (query, city) => {
            const params = new URLSearchParams();
            if (query) params.set('keyword', query);
            if (city) params.set('location', city);
            return `https://www.rekrute.com/offres-emploi.html${params.toString() ? '?' + params : ''}`;
        },
        listingUrl: 'https://www.rekrute.com/offres-emploi.html',
        waitForSelector: '.post-id, .job-item',
        extractScript: EXTRACTION_SCRIPTS.rekrute,
    },
    dreamjob: {
        name: 'Dreamjob.ma',
        baseUrl: 'https://www.dreamjob.ma',
        searchUrl: (query, city) => {
            const params = new URLSearchParams();
            if (query) params.set('keywords', query);
            if (city) params.set('location', city);
            return `https://www.dreamjob.ma/offres-emploi${params.toString() ? '?' + params : ''}`;
        },
        listingUrl: 'https://www.dreamjob.ma/offres-emploi',
        waitForSelector: '.job-listing, article',
        extractScript: EXTRACTION_SCRIPTS.dreamjob,
    },
    marocannonces: {
        name: 'MarocAnnonces',
        baseUrl: 'https://www.marocannonces.com',
        searchUrl: (query, city) => {
            const params = new URLSearchParams();
            if (query) params.set('texte', query);
            return `https://www.marocannonces.com/maroc/offres-emploi${params.toString() ? '?' + params : ''}`;
        },
        listingUrl: 'https://www.marocannonces.com/maroc/offres-emploi',
        waitForSelector: '.cars-list, .listing',
        extractScript: EXTRACTION_SCRIPTS.marocannonces,
    },
    alwadifa: {
        name: 'Alwadifa-Maroc',
        baseUrl: 'https://alwadifa-maroc.com',
        searchUrl: (query) => {
            if (query) return `https://alwadifa-maroc.com/?s=${encodeURIComponent(query)}`;
            return 'https://alwadifa-maroc.com/category/offres-demploi/';
        },
        listingUrl: 'https://alwadifa-maroc.com/category/offres-demploi/',
        waitForSelector: 'article, .post',
        extractScript: EXTRACTION_SCRIPTS.alwadifa,
    },
    emploipublic: {
        name: 'Emploi-Public.ma',
        baseUrl: 'https://www.emploi-public.ma',
        searchUrl: (query) => {
            if (query) return `https://www.emploi-public.ma/?s=${encodeURIComponent(query)}`;
            return 'https://www.emploi-public.ma/concours/';
        },
        listingUrl: 'https://www.emploi-public.ma/concours/',
        waitForSelector: 'article, .post',
        extractScript: EXTRACTION_SCRIPTS.emploipublic,
    },
    stagiaires: {
        name: 'Stagiaires.ma',
        baseUrl: 'https://www.stagiaires.ma',
        searchUrl: (query, city) => {
            const params = new URLSearchParams();
            if (query) params.set('q', query);
            if (city) params.set('ville', city);
            return `https://www.stagiaires.ma/offres-de-stages${params.toString() ? '?' + params : ''}`;
        },
        listingUrl: 'https://www.stagiaires.ma/offres-de-stages',
        waitForSelector: '.stage-item, article',
        extractScript: EXTRACTION_SCRIPTS.stagiaires,
    },
};

/**
 * Scrape jobs from a specific Morocco site
 * 
 * @param {string} siteId - Site identifier (emploi, rekrute, etc.)
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Scraped jobs
 */
export async function scrapeMoroccoSite(siteId, params = {}) {
    const { query = '', city = '', limit = 20 } = params;
    const config = SITE_CONFIGS[siteId];

    if (!config) {
        throw new Error(`Unknown site: ${siteId}`);
    }

    try {
        const url = query || city 
            ? config.searchUrl(query, city)
            : config.listingUrl;

        console.log(`🕷️ Scraping ${config.name}: ${url}`);

        const result = await scrapePage(url, {
            waitForSelector: config.waitForSelector,
            extractScript: config.extractScript,
            waitTime: 3000, // Wait for dynamic content
            timeout: 30000,
        });

        const jobs = Array.isArray(result) ? result : [];
        
        return {
            jobs: jobs.slice(0, limit).map(job => normalizeJobFromMorocco(job, siteId)),
            total: jobs.length,
            source: siteId,
            scraped: true,
        };
    } catch (error) {
        console.error(`❌ ${config.name} scrape failed:`, error.message);
        throw error;
    }
}

/**
 * Scrape all Morocco job sites in parallel
 * 
 * @param {Object} params - Search parameters
 * @param {string[]} sources - Specific sources to scrape (optional)
 * @returns {Promise<Object>} - Combined results
 */
export async function scrapeAllMoroccoSites(params = {}, sources = null) {
    const { query = '', city = '', limit = 20 } = params;
    
    const sitesToScrape = sources 
        ? sources.filter(s => SITE_CONFIGS[s])
        : Object.keys(SITE_CONFIGS);

    const results = await Promise.allSettled(
        sitesToScrape.map(siteId => scrapeMoroccoSite(siteId, { query, city, limit }))
    );

    const allJobs = [];
    const sourcesUsed = [];
    const errors = [];

    results.forEach((result, index) => {
        const siteId = sitesToScrape[index];
        if (result.status === 'fulfilled') {
            allJobs.push(...result.value.jobs);
            if (result.value.jobs.length > 0) {
                sourcesUsed.push(siteId);
            }
        } else {
            errors.push(`${siteId}: ${result.reason.message}`);
        }
    });

    // Deduplicate by title + company
    const seenJobs = new Set();
    const uniqueJobs = allJobs.filter(job => {
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

    return {
        jobs: uniqueJobs.slice(0, limit * 2), // Return more to account for client-side filtering
        total: uniqueJobs.length,
        sources: sourcesUsed,
        errors: errors.length > 0 ? errors : null,
    };
}

export { SITE_CONFIGS, EXTRACTION_SCRIPTS };
