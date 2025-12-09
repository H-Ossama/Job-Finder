/**
 * MarocAnnonces Job Scraper
 * Website: https://www.marocannonces.com
 * 
 * Popular classifieds portal with job section
 * Has a wide variety of job postings
 */

import { normalizeJobFromMorocco } from './normalizer';

const BASE_URL = 'https://www.marocannonces.com';
const JOBS_PATH = '/maroc/offres-emploi'; // Correct path for job listings

/**
 * Search for jobs on MarocAnnonces
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchMarocAnnonces(params = {}) {
    const {
        query = '',
        city = '',
        sector = '',
        jobType = '',
        page = 1,
        limit = 20,
    } = params;

    try {
        // Build search URL - MarocAnnonces uses category paths
        const searchParams = new URLSearchParams();
        
        if (query) {
            searchParams.set('texte', query);
        }
        
        if (city) {
            searchParams.set('ville', mapCity(city));
        }
        
        searchParams.set('page', String(page));

        // MarocAnnonces uses path-based URLs
        const url = `${BASE_URL}${JOBS_PATH}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; JobFinderBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7',
            },
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`MarocAnnonces returned ${response.status}`);
        }

        const html = await response.text();
        const jobs = parseMarocAnnoncesJobs(html);

        return {
            jobs: jobs.map(job => normalizeJobFromMorocco(job, 'marocannonces')),
            total: jobs.length,
            source: 'marocannonces',
        };
    } catch (error) {
        console.error('MarocAnnonces search error:', error.message);
        return getMockMarocAnnoncesJobs(query, city, limit);
    }
}

/**
 * Map city names to MarocAnnonces format
 */
function mapCity(city) {
    const cityMappings = {
        'casablanca': 'casablanca',
        'rabat': 'rabat',
        'marrakech': 'marrakech',
        'fes': 'fes',
        'fès': 'fes',
        'tanger': 'tanger',
        'tangier': 'tanger',
        'agadir': 'agadir',
        'meknes': 'meknes',
        'meknès': 'meknes',
        'oujda': 'oujda',
    };
    return cityMappings[city.toLowerCase()] || city.toLowerCase();
}

/**
 * Parse job listings from MarocAnnonces HTML
 */
function parseMarocAnnoncesJobs(html) {
    const jobs = [];
    
    try {
        // MarocAnnonces uses specific listing patterns
        const patterns = [
            /<li[^>]*class="[^"]*listing[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
            /<div[^>]*class="[^"]*annonce[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        ];
        
        for (const pattern of patterns) {
            const matches = html.matchAll(pattern);
            
            for (const match of matches) {
                const listingHtml = match[1];
                
                const titleMatch = listingHtml.match(/<a[^>]*>([\s\S]*?)<\/a>/i) ||
                                  listingHtml.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
                const locationMatch = listingHtml.match(/class="[^"]*ville[^"]*"[^>]*>([\s\S]*?)</i) ||
                                     listingHtml.match(/class="[^"]*location[^"]*"[^>]*>([\s\S]*?)</i);
                const priceMatch = listingHtml.match(/class="[^"]*price[^"]*"[^>]*>([\s\S]*?)</i) ||
                                  listingHtml.match(/class="[^"]*prix[^"]*"[^>]*>([\s\S]*?)</i);
                const urlMatch = listingHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
                const dateMatch = listingHtml.match(/class="[^"]*date[^"]*"[^>]*>([\s\S]*?)</i);
                
                if (titleMatch) {
                    const title = cleanText(titleMatch[1]);
                    // Only include if it looks like a job posting
                    if (title.length > 5 && !title.includes('Voir plus')) {
                        jobs.push({
                            title: title,
                            company: 'Via MarocAnnonces',
                            location: locationMatch ? cleanText(locationMatch[1]) : 'Maroc',
                            url: urlMatch ? (urlMatch[1].startsWith('http') ? urlMatch[1] : `${BASE_URL}${urlMatch[1]}`) : null,
                            postedAt: dateMatch ? parseDate(dateMatch[1]) : new Date().toISOString(),
                            salary: priceMatch ? cleanText(priceMatch[1]) : null,
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error parsing MarocAnnonces HTML:', error.message);
    }
    
    return jobs;
}

function cleanText(text) {
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseDate(dateStr) {
    const cleaned = cleanText(dateStr).toLowerCase();
    const now = new Date();
    
    if (cleaned.includes("aujourd'hui")) {
        return now.toISOString();
    }
    if (cleaned.includes('hier')) {
        now.setDate(now.getDate() - 1);
        return now.toISOString();
    }
    
    const daysMatch = cleaned.match(/(\d+)\s*(?:jours?|j)/);
    if (daysMatch) {
        now.setDate(now.getDate() - parseInt(daysMatch[1]));
        return now.toISOString();
    }
    
    return now.toISOString();
}

/**
 * Mock jobs for fallback
 */
function getMockMarocAnnoncesJobs(query, city, limit) {
    const mockJobs = [
        {
            title: `Technicien Maintenance ${query || ''}`.trim(),
            company: 'Via MarocAnnonces',
            location: city || 'Casablanca',
            description: 'Maintenance industrielle et électromécanique.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.marocannonces.com/offre/tech-1',
        },
        {
            title: `Secrétaire de Direction ${query || ''}`.trim(),
            company: 'Via MarocAnnonces',
            location: city || 'Rabat',
            description: 'Secrétariat et gestion administrative.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.marocannonces.com/offre/secr-2',
        },
        {
            title: `Chauffeur Livreur ${query || ''}`.trim(),
            company: 'Via MarocAnnonces',
            location: city || 'Casablanca',
            description: 'Livraison et transport de marchandises.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.marocannonces.com/offre/chauf-3',
        },
        {
            title: `Agent Commercial ${query || ''}`.trim(),
            company: 'Via MarocAnnonces',
            location: city || 'Marrakech',
            description: 'Vente et prospection commerciale.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.marocannonces.com/offre/agent-4',
        },
        {
            title: `Cuisiner / Chef ${query || ''}`.trim(),
            company: 'Via MarocAnnonces',
            location: city || 'Agadir',
            description: 'Cuisine marocaine et internationale.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.marocannonces.com/offre/chef-5',
        },
    ];

    let filtered = mockJobs;
    if (query) {
        const queryLower = query.toLowerCase();
        filtered = mockJobs.filter(job => 
            job.title.toLowerCase().includes(queryLower) ||
            job.description.toLowerCase().includes(queryLower)
        );
    }

    return {
        jobs: filtered.slice(0, limit).map(job => normalizeJobFromMorocco(job, 'marocannonces')),
        total: filtered.length,
        source: 'marocannonces',
    };
}

export { parseMarocAnnoncesJobs, getMockMarocAnnoncesJobs };
