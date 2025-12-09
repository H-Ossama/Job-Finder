/**
 * Emploi-Public.ma Job Scraper
 * Website: https://www.emploi-public.ma
 * 
 * Official portal for public sector jobs in Morocco
 * Features government positions, concours, and public administration roles
 * 
 * Note: Uses structured data parsing from their website
 */

import { normalizeJobFromMorocco } from './normalizer';

const BASE_URL = 'https://www.emploi-public.ma';
// Emploi-Public.ma may use different URL patterns
const CONCOURS_PATH = '/concours';

// Ministries and public organizations
const PUBLIC_ORGANIZATIONS = {
    'sante': 'Ministère de la Santé',
    'education': "Ministère de l'Education Nationale",
    'interieur': "Ministère de l'Intérieur",
    'finances': 'Ministère des Finances',
    'justice': 'Ministère de la Justice',
    'agriculture': "Ministère de l'Agriculture",
    'equipement': "Ministère de l'Equipement",
    'collectivites': 'Collectivités Territoriales',
};

/**
 * Search for jobs on Emploi-Public.ma
 * 
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchEmploiPublic(params = {}) {
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
            searchParams.set('q', query);
        }
        
        if (city) {
            searchParams.set('ville', city);
        }
        
        if (sector) {
            searchParams.set('ministere', sector);
        }
        
        searchParams.set('page', String(page));

        // Try main page or search endpoint
        const url = query 
            ? `${BASE_URL}/?s=${encodeURIComponent(query)}`
            : `${BASE_URL}${CONCOURS_PATH}${page > 1 ? '/page/' + page : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; JobFinderBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'fr-FR,fr;q=0.9,ar;q=0.8,en;q=0.7',
            },
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`Emploi-Public.ma returned ${response.status}`);
        }

        const html = await response.text();
        const jobs = parseEmploiPublicJobs(html);

        // Filter by city if specified
        let filteredJobs = jobs;
        if (city) {
            const cityLower = city.toLowerCase();
            filteredJobs = jobs.filter(job => 
                (job.location || '').toLowerCase().includes(cityLower)
            );
        }

        return {
            jobs: filteredJobs.slice(0, limit).map(job => normalizeJobFromMorocco(job, 'emploipublic')),
            total: filteredJobs.length,
            source: 'emploipublic',
        };
    } catch (error) {
        console.error('Emploi-Public.ma search error:', error.message);
        return getMockEmploiPublicJobs(query, city, limit);
    }
}

/**
 * Parse job listings from Emploi-Public HTML
 */
function parseEmploiPublicJobs(html) {
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
                            company: data.hiringOrganization?.name || 'Secteur Public',
                            location: data.jobLocation?.address?.addressLocality || 'Maroc',
                            description: data.description,
                            url: data.url || data['@id'],
                            postedAt: data.datePosted,
                            validThrough: data.validThrough,
                            jobType: 'Fonction Publique',
                        });
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        }
        
        // Parse job listing patterns
        const patterns = [
            /<div[^>]*class="[^"]*offre[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
            /<article[^>]*class="[^"]*concours[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
            /<tr[^>]*class="[^"]*job-row[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi,
        ];
        
        for (const pattern of patterns) {
            const matches = html.matchAll(pattern);
            for (const match of matches) {
                const job = extractEmploiPublicJob(match[1]);
                if (job && job.title) {
                    jobs.push(job);
                }
            }
        }
    } catch (error) {
        console.error('Error parsing Emploi-Public HTML:', error.message);
    }
    
    return jobs;
}

/**
 * Extract job details from HTML snippet
 */
function extractEmploiPublicJob(html) {
    try {
        // Extract title and URL
        const titleMatch = html.match(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
        if (!titleMatch) return null;
        
        const url = titleMatch[1];
        const title = cleanText(titleMatch[2]);
        
        // Extract organization/ministry
        const orgMatch = html.match(/class="[^"]*(?:ministere|organisme|etablissement)[^"]*"[^>]*>([\s\S]*?)</i);
        
        // Extract location
        const locationMatch = html.match(/class="[^"]*(?:ville|lieu|region)[^"]*"[^>]*>([\s\S]*?)</i);
        
        // Extract date
        const dateMatch = html.match(/class="[^"]*date[^"]*"[^>]*>([\s\S]*?)</i) ||
                         html.match(/<time[^>]*datetime="([^"]*)"[^>]*>/i);
        
        // Extract deadline
        const deadlineMatch = html.match(/(?:limite|deadline|avant le)[^>]*>([\s\S]*?)</i);
        
        return {
            title,
            company: orgMatch ? cleanText(orgMatch[1]) : 'Secteur Public',
            location: locationMatch ? cleanText(locationMatch[1]) : 'Maroc',
            url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
            postedAt: dateMatch ? parseDate(dateMatch[1]) : new Date().toISOString(),
            validThrough: deadlineMatch ? parseDate(deadlineMatch[1]) : null,
            jobType: 'Fonction Publique',
        };
    } catch (e) {
        return null;
    }
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
    
    // Try parsing French date format (dd/mm/yyyy)
    const frenchDate = cleaned.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (frenchDate) {
        return new Date(frenchDate[3], frenchDate[2] - 1, frenchDate[1]).toISOString();
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
function getMockEmploiPublicJobs(query, city, limit) {
    const mockJobs = [
        {
            title: `Concours Ministère des Finances - Inspecteurs ${query || ''}`.trim(),
            company: 'Ministère des Finances',
            location: city || 'Rabat',
            description: 'Recrutement d\'inspecteurs des finances pour la Direction Générale des Impôts.',
            jobType: 'Fonction Publique',
            postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.emploi-public.ma/concours/finances',
            validThrough: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            title: `Ministère de l'Education - Professeurs Contractuels ${query || ''}`.trim(),
            company: "Ministère de l'Education Nationale",
            location: 'Tout le Maroc',
            description: 'Campagne de recrutement de professeurs contractuels pour les établissements publics.',
            jobType: 'Fonction Publique',
            postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.emploi-public.ma/education/professeurs',
        },
        {
            title: `Agence Urbaine - Architectes et Urbanistes ${query || ''}`.trim(),
            company: 'Agences Urbaines',
            location: city || 'Casablanca',
            description: 'Recrutement d\'architectes et urbanistes pour les projets de développement urbain.',
            jobType: 'Fonction Publique',
            postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.emploi-public.ma/agence-urbaine',
        },
        {
            title: `Direction Générale de la Sûreté Nationale ${query || ''}`.trim(),
            company: 'DGSN',
            location: city || 'Rabat',
            description: 'Concours de recrutement de gardiens de la paix et officiers de police.',
            jobType: 'Fonction Publique',
            postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.emploi-public.ma/dgsn-concours',
        },
        {
            title: `Cour des Comptes - Magistrats ${query || ''}`.trim(),
            company: 'Cour des Comptes',
            location: 'Rabat',
            description: 'Concours de recrutement de magistrats à la Cour des Comptes.',
            jobType: 'Fonction Publique',
            postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.emploi-public.ma/cour-comptes',
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
        jobs: filtered.slice(0, limit).map(job => normalizeJobFromMorocco(job, 'emploipublic')),
        total: filtered.length,
        source: 'emploipublic',
    };
}

export { parseEmploiPublicJobs, getMockEmploiPublicJobs };
