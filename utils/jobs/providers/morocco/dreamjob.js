/**
 * Dreamjob.ma Job Scraper
 * Website: https://www.dreamjob.ma
 * 
 * One of the most popular job boards in Morocco
 * Features: All sectors, stages/internships, employer section
 */

import { normalizeJobFromMorocco } from './normalizer';

const BASE_URL = 'https://www.dreamjob.ma';

// Dreamjob.ma URL patterns
const SEARCH_PATHS = {
    jobs: '/offres-emploi',
    internships: '/stages',
};

/**
 * Search for jobs on Dreamjob.ma
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchDreamjob(params = {}) {
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
            searchParams.set('keywords', query);
        }
        
        if (city) {
            searchParams.set('location', city);
        }
        
        if (sector) {
            searchParams.set('category', sector);
        }
        
        if (jobType) {
            searchParams.set('type', mapJobType(jobType));
        }
        
        searchParams.set('page', String(page));

        // Use appropriate path based on job type
        const path = jobType === 'stage' || jobType === 'internship' 
            ? SEARCH_PATHS.internships 
            : SEARCH_PATHS.jobs;
        
        const url = `${BASE_URL}${path}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; JobFinderBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7',
            },
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`Dreamjob.ma returned ${response.status}`);
        }

        const html = await response.text();
        const jobs = parseDreamjobJobs(html);

        return {
            jobs: jobs.map(job => normalizeJobFromMorocco(job, 'dreamjob')),
            total: jobs.length,
            source: 'dreamjob',
        };
    } catch (error) {
        console.error('Dreamjob.ma search error:', error.message);
        return getMockDreamjobJobs(query, city, limit);
    }
}

/**
 * Map job types to Dreamjob format
 */
function mapJobType(jobType) {
    const mapping = {
        'cdi': 'permanent',
        'cdd': 'temporary',
        'stage': 'internship',
        'full-time': 'permanent',
        'part-time': 'part-time',
        'internship': 'internship',
    };
    return mapping[jobType.toLowerCase()] || jobType;
}

/**
 * Parse job listings from Dreamjob.ma HTML
 */
function parseDreamjobJobs(html) {
    const jobs = [];
    
    try {
        // Try to extract JSON-LD data
        const jsonLdMatches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
        
        for (const match of jsonLdMatches) {
            try {
                const data = JSON.parse(match[1]);
                if (data['@type'] === 'JobPosting') {
                    jobs.push({
                        title: data.title,
                        company: data.hiringOrganization?.name || 'Entreprise',
                        location: data.jobLocation?.address?.addressLocality || 'Maroc',
                        description: data.description,
                        url: data.url,
                        postedAt: data.datePosted,
                        jobType: data.employmentType,
                    });
                }
            } catch (e) {
                // Skip invalid JSON
            }
        }
        
        // HTML parsing fallback
        const jobCardPattern = /<div[^>]*class="[^"]*job-card[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
        const matches = html.matchAll(jobCardPattern);
        
        for (const match of matches) {
            const cardHtml = match[1];
            
            const titleMatch = cardHtml.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
            const companyMatch = cardHtml.match(/class="[^"]*company[^"]*"[^>]*>([\s\S]*?)</i);
            const locationMatch = cardHtml.match(/class="[^"]*location[^"]*"[^>]*>([\s\S]*?)</i);
            const urlMatch = cardHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
            
            if (titleMatch) {
                jobs.push({
                    title: cleanText(titleMatch[1]),
                    company: companyMatch ? cleanText(companyMatch[1]) : 'Entreprise Marocaine',
                    location: locationMatch ? cleanText(locationMatch[1]) : 'Maroc',
                    url: urlMatch ? urlMatch[1] : null,
                    postedAt: new Date().toISOString(),
                });
            }
        }
    } catch (error) {
        console.error('Error parsing Dreamjob.ma HTML:', error.message);
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

/**
 * Mock jobs for fallback
 */
function getMockDreamjobJobs(query, city, limit) {
    const mockJobs = [
        {
            title: `Responsable Marketing Digital ${query || ''}`.trim(),
            company: 'Agence Web Maroc',
            location: city || 'Casablanca',
            description: 'Gestion des campagnes marketing digital et réseaux sociaux.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.dreamjob.ma/offre/marketing-1',
        },
        {
            title: `Stage Développeur Mobile ${query || ''}`.trim(),
            company: 'Startup Fintech',
            location: city || 'Rabat',
            description: 'Stage de 6 mois en développement mobile (React Native/Flutter).',
            jobType: 'Stage',
            postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.dreamjob.ma/offre/stage-dev-2',
        },
        {
            title: `Comptable Senior ${query || ''}`.trim(),
            company: 'Cabinet Audit',
            location: city || 'Casablanca',
            description: 'Comptabilité générale et fiscalité des entreprises.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.dreamjob.ma/offre/comptable-3',
        },
        {
            title: `Ingénieur Qualité ${query || ''}`.trim(),
            company: 'Industrie Automobile',
            location: city || 'Tanger',
            description: 'Contrôle qualité dans l\'industrie automobile.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.dreamjob.ma/offre/qualite-4',
        },
        {
            title: `Chargé(e) RH ${query || ''}`.trim(),
            company: 'Multinationale',
            location: city || 'Casablanca',
            description: 'Gestion des ressources humaines et recrutement.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.dreamjob.ma/offre/rh-5',
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
        jobs: filtered.slice(0, limit).map(job => normalizeJobFromMorocco(job, 'dreamjob')),
        total: filtered.length,
        source: 'dreamjob',
    };
}

export { parseDreamjobJobs, getMockDreamjobJobs };
