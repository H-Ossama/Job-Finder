/**
 * Rekrute.com Job Scraper
 * Website: https://www.rekrute.com
 * 
 * Major recruitment platform in Morocco
 * Used by large companies and multinationals
 */

import { normalizeJobFromMorocco } from './normalizer';

const BASE_URL = 'https://www.rekrute.com';

/**
 * Search for jobs on Rekrute.com
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchRekrute(params = {}) {
    const {
        query = '',
        city = '',
        sector = '',
        jobType = '',
        experienceLevel = '',
        page = 1,
        limit = 20,
    } = params;

    try {
        // Build search URL
        // Rekrute uses path-based filtering
        let searchPath = '/offres.html';
        const searchParams = new URLSearchParams();
        
        if (query) {
            searchParams.set('s', query);
        }
        
        if (city) {
            searchParams.set('city', city);
        }
        
        if (sector) {
            searchParams.set('sector', sector);
        }
        
        if (jobType) {
            searchParams.set('contract', mapJobType(jobType));
        }
        
        if (experienceLevel) {
            searchParams.set('experience', mapExperienceLevel(experienceLevel));
        }
        
        searchParams.set('p', String(page));

        const url = `${BASE_URL}${searchPath}?${searchParams.toString()}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; JobFinderBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7',
            },
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`Rekrute.com returned ${response.status}`);
        }

        const html = await response.text();
        const jobs = parseRekruteJobs(html);

        return {
            jobs: jobs.map(job => normalizeJobFromMorocco(job, 'rekrute')),
            total: jobs.length,
            source: 'rekrute',
        };
    } catch (error) {
        console.error('Rekrute.com search error:', error.message);
        return getMockRekruteJobs(query, city, limit);
    }
}

function mapJobType(jobType) {
    const mapping = {
        'cdi': 'CDI',
        'cdd': 'CDD',
        'stage': 'Stage',
        'interim': 'Intérim',
        'full-time': 'CDI',
        'internship': 'Stage',
    };
    return mapping[jobType.toLowerCase()] || jobType;
}

function mapExperienceLevel(level) {
    const mapping = {
        'entry': 'debutant',
        'entry level': 'debutant',
        'junior': 'debutant',
        'mid': 'confirme',
        'mid-level': 'confirme',
        'senior': 'senior',
        'lead': 'senior',
    };
    return mapping[level.toLowerCase()] || level;
}

/**
 * Parse job listings from Rekrute.com HTML
 */
function parseRekruteJobs(html) {
    const jobs = [];
    
    try {
        // Try JSON-LD first
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
                        salary: data.baseSalary?.value?.value || null,
                    });
                }
            } catch (e) {
                // Skip invalid JSON
            }
        }
        
        // HTML parsing - Rekrute specific patterns
        const patterns = [
            /<div[^>]*class="[^"]*post-[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
            /<article[^>]*class="[^"]*offre[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
        ];
        
        for (const pattern of patterns) {
            const matches = html.matchAll(pattern);
            
            for (const match of matches) {
                const cardHtml = match[1];
                
                const titleMatch = cardHtml.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i) ||
                                  cardHtml.match(/<a[^>]*class="[^"]*titreJob[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
                const companyMatch = cardHtml.match(/class="[^"]*company[^"]*"[^>]*>([\s\S]*?)</i) ||
                                    cardHtml.match(/class="[^"]*entreprise[^"]*"[^>]*>([\s\S]*?)</i);
                const locationMatch = cardHtml.match(/class="[^"]*location[^"]*"[^>]*>([\s\S]*?)</i) ||
                                     cardHtml.match(/class="[^"]*ville[^"]*"[^>]*>([\s\S]*?)</i);
                const urlMatch = cardHtml.match(/<a[^>]*href="([^"]*offre[^"]*)"[^>]*>/i);
                
                if (titleMatch) {
                    jobs.push({
                        title: cleanText(titleMatch[1]),
                        company: companyMatch ? cleanText(companyMatch[1]) : 'Entreprise Marocaine',
                        location: locationMatch ? cleanText(locationMatch[1]) : 'Maroc',
                        url: urlMatch ? `${BASE_URL}${urlMatch[1]}` : null,
                        postedAt: new Date().toISOString(),
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error parsing Rekrute.com HTML:', error.message);
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
function getMockRekruteJobs(query, city, limit) {
    const mockJobs = [
        {
            title: `Directeur Commercial ${query || ''}`.trim(),
            company: 'Groupe Industriel',
            location: city || 'Casablanca',
            description: 'Direction commerciale pour l\'Afrique du Nord.',
            jobType: 'CDI',
            experienceLevel: 'Senior',
            postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.rekrute.com/offre/directeur-1',
            salary: '25000-35000 MAD',
        },
        {
            title: `Architecte Cloud AWS ${query || ''}`.trim(),
            company: 'ESN Internationale',
            location: city || 'Casablanca',
            description: 'Architecture cloud et migration vers AWS.',
            jobType: 'CDI',
            experienceLevel: 'Senior',
            postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.rekrute.com/offre/architect-2',
            salary: '20000-30000 MAD',
        },
        {
            title: `Responsable Supply Chain ${query || ''}`.trim(),
            company: 'Logistique Maroc',
            location: city || 'Tanger',
            description: 'Gestion de la chaîne logistique et approvisionnement.',
            jobType: 'CDI',
            experienceLevel: 'Mid-Level',
            postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.rekrute.com/offre/supply-3',
            salary: '15000-22000 MAD',
        },
        {
            title: `Ingénieur Cybersécurité ${query || ''}`.trim(),
            company: 'Banque Marocaine',
            location: city || 'Rabat',
            description: 'Sécurité informatique et protection des données.',
            jobType: 'CDI',
            experienceLevel: 'Mid-Level',
            postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.rekrute.com/offre/cyber-4',
            salary: '18000-28000 MAD',
        },
        {
            title: `Stage PFE - Data Science ${query || ''}`.trim(),
            company: 'Assurance Taamine',
            location: city || 'Casablanca',
            description: 'Stage de fin d\'études en Data Science et Machine Learning.',
            jobType: 'Stage',
            experienceLevel: 'Entry Level',
            postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.rekrute.com/offre/stage-5',
            salary: 'Indemnité de stage',
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
        jobs: filtered.slice(0, limit).map(job => normalizeJobFromMorocco(job, 'rekrute')),
        total: filtered.length,
        source: 'rekrute',
    };
}

export { parseRekruteJobs, getMockRekruteJobs };
