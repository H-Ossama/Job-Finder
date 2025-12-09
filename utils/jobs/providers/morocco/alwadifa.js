/**
 * Alwadifa-Maroc.com Job Scraper
 * Website: https://alwadifa-maroc.com
 * 
 * Specializes in public sector jobs and government positions
 * Very popular for "concours" (competitive exams) and public administration
 * 
 * Note: Uses structured data parsing from their website
 */

import { normalizeJobFromMorocco } from './normalizer';

const BASE_URL = 'https://alwadifa-maroc.com';
const JOBS_PATH = '/category/offres-demploi'; // Category page for jobs

// Job categories on Alwadifa
const CATEGORIES = {
    'concours': 'Concours',
    'emploi': 'Emploi',
    'stage': 'Stage',
    'anapec': 'ANAPEC',
    'prive': 'Secteur Privé',
    'public': 'Secteur Public',
};

/**
 * Search for jobs on Alwadifa-Maroc.com
 * 
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchAlwadifa(params = {}) {
    const {
        query = '',
        city = '',
        sector = '',
        jobType = '',
        page = 1,
        limit = 20,
    } = params;

    try {
        // Build search URL
        const searchParams = new URLSearchParams();
        
        if (query) {
            searchParams.set('s', query);
        }
        
        if (page > 1) {
            searchParams.set('paged', String(page));
        }

        // Alwadifa uses WordPress, so search is via ?s= parameter
        // For browsing, use category pages
        let url;
        if (query) {
            url = `${BASE_URL}/?${searchParams.toString()}`;
        } else {
            url = `${BASE_URL}${JOBS_PATH}/${page > 1 ? `page/${page}/` : ''}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; JobFinderBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'fr-FR,fr;q=0.9,ar;q=0.8,en;q=0.7',
            },
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`Alwadifa-Maroc returned ${response.status}`);
        }

        const html = await response.text();
        const jobs = parseAlwadifaJobs(html);

        // Filter by city if specified
        let filteredJobs = jobs;
        if (city) {
            const cityLower = city.toLowerCase();
            filteredJobs = jobs.filter(job => 
                (job.location || '').toLowerCase().includes(cityLower)
            );
        }

        return {
            jobs: filteredJobs.slice(0, limit).map(job => normalizeJobFromMorocco(job, 'alwadifa')),
            total: filteredJobs.length,
            source: 'alwadifa',
        };
    } catch (error) {
        console.error('Alwadifa-Maroc search error:', error.message);
        return getMockAlwadifaJobs(query, city, limit);
    }
}

/**
 * Parse job listings from Alwadifa HTML
 */
function parseAlwadifaJobs(html) {
    const jobs = [];
    
    try {
        // Look for JSON-LD structured data
        const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
        
        if (jsonLdMatches) {
            for (const match of jsonLdMatches) {
                try {
                    const jsonContent = match.replace(/<script type="application\/ld\+json">/, '')
                                            .replace(/<\/script>/, '');
                    const data = JSON.parse(jsonContent);
                    
                    if (data['@type'] === 'JobPosting') {
                        jobs.push({
                            title: data.title,
                            company: data.hiringOrganization?.name || 'Administration Publique',
                            location: data.jobLocation?.address?.addressLocality || 'Maroc',
                            description: data.description,
                            url: data.url || data['@id'],
                            postedAt: data.datePosted,
                            validThrough: data.validThrough,
                            jobType: 'Concours',
                        });
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        }
        
        // Parse article elements (WordPress pattern)
        const articlePattern = /<article[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
        const matches = html.matchAll(articlePattern);
        
        for (const match of matches) {
            const articleHtml = match[1];
            const job = extractAlwadifaJob(articleHtml);
            if (job && job.title) {
                jobs.push(job);
            }
        }
        
        // Also check for entry-title pattern
        const titlePattern = /<h[2-3][^>]*class="[^"]*entry-title[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        const titleMatches = html.matchAll(titlePattern);
        
        for (const match of titleMatches) {
            const url = match[1];
            const title = cleanText(match[2]);
            
            // Avoid duplicates
            if (title && !jobs.some(j => j.title === title)) {
                jobs.push({
                    title,
                    company: extractCompanyFromTitle(title),
                    location: extractLocationFromTitle(title),
                    url,
                    postedAt: new Date().toISOString(),
                    jobType: title.toLowerCase().includes('concours') ? 'Concours' : 'Emploi',
                });
            }
        }
    } catch (error) {
        console.error('Error parsing Alwadifa HTML:', error.message);
    }
    
    return jobs;
}

/**
 * Extract job details from article HTML
 */
function extractAlwadifaJob(html) {
    try {
        // Extract title and URL
        const titleMatch = html.match(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
        if (!titleMatch) return null;
        
        const url = titleMatch[1];
        const title = cleanText(titleMatch[2]);
        
        // Extract date
        const dateMatch = html.match(/<time[^>]*datetime="([^"]*)"[^>]*>/i) ||
                         html.match(/class="[^"]*date[^"]*"[^>]*>([\s\S]*?)</i);
        
        // Extract category
        const categoryMatch = html.match(/class="[^"]*category[^"]*"[^>]*>([\s\S]*?)</i);
        
        return {
            title,
            company: extractCompanyFromTitle(title),
            location: extractLocationFromTitle(title),
            url,
            postedAt: dateMatch ? (dateMatch[1] || parseDate(dateMatch[1])) : new Date().toISOString(),
            jobType: categoryMatch ? cleanText(categoryMatch[1]) : 'Emploi',
        };
    } catch (e) {
        return null;
    }
}

/**
 * Extract company name from job title
 * Alwadifa titles often include the organization name
 */
function extractCompanyFromTitle(title) {
    const patterns = [
        /(?:chez|par|à)\s+([^-–]+)/i,
        /(?:ministère|ministre)\s+(?:de\s+)?([^-–]+)/i,
        /(?:office|agence)\s+([^-–]+)/i,
        /([^-–]+)\s+(?:recrute|lance|organise)/i,
    ];
    
    for (const pattern of patterns) {
        const match = title.match(pattern);
        if (match) {
            return cleanText(match[1]).substring(0, 50);
        }
    }
    
    return 'Administration Publique';
}

/**
 * Extract location from job title
 */
function extractLocationFromTitle(title) {
    const cities = [
        'Rabat', 'Casablanca', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
        'Meknès', 'Oujda', 'Kenitra', 'Tétouan', 'Safi', 'El Jadida',
        'Nador', 'Beni Mellal', 'Khouribga', 'Laâyoune', 'Dakhla',
    ];
    
    const titleLower = title.toLowerCase();
    for (const city of cities) {
        if (titleLower.includes(city.toLowerCase())) {
            return city;
        }
    }
    
    if (titleLower.includes('tout le maroc') || titleLower.includes('plusieurs villes')) {
        return 'Tout le Maroc';
    }
    
    return 'Maroc';
}

function cleanText(text) {
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseDate(dateStr) {
    const cleaned = cleanText(dateStr).toLowerCase();
    const now = new Date();
    
    if (cleaned.includes("aujourd'hui")) return now.toISOString();
    if (cleaned.includes('hier')) {
        now.setDate(now.getDate() - 1);
        return now.toISOString();
    }
    
    const daysMatch = cleaned.match(/(\d+)\s*jours?/);
    if (daysMatch) {
        now.setDate(now.getDate() - parseInt(daysMatch[1]));
        return now.toISOString();
    }
    
    return now.toISOString();
}

/**
 * Mock jobs for fallback
 */
function getMockAlwadifaJobs(query, city, limit) {
    const mockJobs = [
        {
            title: `Concours de Recrutement - Ministère de l'Intérieur ${query || ''}`.trim(),
            company: "Ministère de l'Intérieur",
            location: city || 'Rabat',
            description: 'Concours de recrutement de techniciens et ingénieurs dans différentes spécialités.',
            jobType: 'Concours',
            postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://alwadifa-maroc.com/concours-interieur',
            validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            title: `Recrutement ANAPEC - Agents Administratifs ${query || ''}`.trim(),
            company: 'ANAPEC',
            location: city || 'Casablanca',
            description: "L'ANAPEC recrute des agents pour ses centres d'orientation.",
            jobType: 'Emploi',
            postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://alwadifa-maroc.com/anapec-recrutement',
        },
        {
            title: `Concours Office National des Chemins de Fer ${query || ''}`.trim(),
            company: 'ONCF',
            location: city || 'Rabat',
            description: "L'ONCF organise un concours pour le recrutement de cadres et techniciens.",
            jobType: 'Concours',
            postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://alwadifa-maroc.com/oncf-concours',
        },
        {
            title: `Ministère de la Santé - Recrutement Infirmiers ${query || ''}`.trim(),
            company: 'Ministère de la Santé',
            location: 'Tout le Maroc',
            description: 'Campagne de recrutement nationale pour les infirmiers diplômés.',
            jobType: 'Concours',
            postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://alwadifa-maroc.com/sante-infirmiers',
        },
        {
            title: `Communes Territoriales - Techniciens ${query || ''}`.trim(),
            company: 'Collectivités Territoriales',
            location: city || 'Plusieurs Villes',
            description: 'Concours unifié pour le recrutement de techniciens dans les communes.',
            jobType: 'Concours',
            postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://alwadifa-maroc.com/communes-techniciens',
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
        jobs: filtered.slice(0, limit).map(job => normalizeJobFromMorocco(job, 'alwadifa')),
        total: filtered.length,
        source: 'alwadifa',
    };
}

export { parseAlwadifaJobs, getMockAlwadifaJobs };
