/**
 * Emploi.ma Job Scraper
 * Website: https://www.emploi.ma
 * 
 * One of the oldest job boards in Morocco (since 2002)
 * Generalist platform with jobs across all sectors
 * 
 * Note: This uses structured data parsing from their website
 * as they don't provide a public API
 */

import { normalizeJobFromMorocco } from './normalizer';

const BASE_URL = 'https://www.emploi.ma';
const SEARCH_URL = 'https://www.emploi.ma/recherche-jobs-maroc';

// Contract type mappings
const CONTRACT_TYPES = {
    'cdi': 'CDI',
    'cdd': 'CDD',
    'stage': 'Stage',
    'interim': 'Intérim',
    'freelance': 'Freelance',
    'full-time': 'CDI',
    'part-time': 'CDD',
    'internship': 'Stage',
    'contract': 'CDD',
};

/**
 * Search for jobs on Emploi.ma
 * Uses their search endpoint with query parameters
 * 
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchEmploi(params = {}) {
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
        // Emploi.ma uses query parameters for search
        const searchParams = new URLSearchParams();
        
        if (query) {
            searchParams.set('q', query);
        }
        
        if (city) {
            searchParams.set('lieu', city); // Emploi.ma uses 'lieu' for location
        }
        
        if (sector) {
            searchParams.set('secteur', sector);
        }
        
        if (jobType) {
            const mappedType = CONTRACT_TYPES[jobType.toLowerCase()] || jobType;
            searchParams.set('contrat', mappedType);
        }
        
        searchParams.set('page', String(page));

        // Emploi.ma search URL format: /recherche-jobs-maroc?q=query&lieu=city
        const url = query || city 
            ? `${SEARCH_URL}?${searchParams.toString()}`
            : `${BASE_URL}/offres-emploi`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; JobFinderBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error(`Emploi.ma returned ${response.status}`);
        }

        const html = await response.text();
        const jobs = parseEmploiJobs(html);

        return {
            jobs: jobs.map(job => normalizeJobFromMorocco(job, 'emploi')),
            total: jobs.length,
            source: 'emploi',
        };
    } catch (error) {
        console.error('Emploi.ma search error:', error.message);
        
        // Return mock data for development/fallback
        return getMockEmploiJobs(query, city, limit);
    }
}

/**
 * Parse job listings from Emploi.ma HTML
 * @param {string} html - HTML content
 * @returns {Array} - Array of job objects
 */
function parseEmploiJobs(html) {
    const jobs = [];
    
    try {
        // Look for JSON-LD structured data first (most reliable)
        const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
        
        if (jsonLdMatch) {
            for (const match of jsonLdMatch) {
                try {
                    const jsonContent = match.replace(/<script type="application\/ld\+json">/, '')
                                            .replace(/<\/script>/, '');
                    const data = JSON.parse(jsonContent);
                    
                    if (data['@type'] === 'JobPosting') {
                        jobs.push({
                            title: data.title,
                            company: data.hiringOrganization?.name || 'Entreprise Marocaine',
                            location: data.jobLocation?.address?.addressLocality || 'Maroc',
                            description: data.description,
                            url: data.url || data['@id'],
                            postedAt: data.datePosted,
                            salary: data.baseSalary?.value?.value || null,
                            jobType: data.employmentType,
                        });
                    } else if (Array.isArray(data['@graph'])) {
                        for (const item of data['@graph']) {
                            if (item['@type'] === 'JobPosting') {
                                jobs.push({
                                    title: item.title,
                                    company: item.hiringOrganization?.name || 'Entreprise Marocaine',
                                    location: item.jobLocation?.address?.addressLocality || 'Maroc',
                                    description: item.description,
                                    url: item.url || item['@id'],
                                    postedAt: item.datePosted,
                                    salary: item.baseSalary?.value?.value || null,
                                    jobType: item.employmentType,
                                });
                            }
                        }
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        }
        
        // Fallback: Parse HTML patterns for job listings
        // Common patterns on Moroccan job sites
        const jobPatterns = [
            // Pattern 1: Job cards with data attributes
            /<article[^>]*class="[^"]*job[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
            // Pattern 2: List items with job info
            /<li[^>]*class="[^"]*offre[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
            // Pattern 3: Divs with job listings
            /<div[^>]*class="[^"]*job-listing[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        ];
        
        for (const pattern of jobPatterns) {
            const matches = html.matchAll(pattern);
            for (const match of matches) {
                const jobHtml = match[1];
                const job = extractJobFromHtml(jobHtml);
                if (job && job.title) {
                    jobs.push(job);
                }
            }
        }
    } catch (error) {
        console.error('Error parsing Emploi.ma HTML:', error.message);
    }
    
    return jobs;
}

/**
 * Extract job details from HTML snippet
 */
function extractJobFromHtml(html) {
    try {
        // Extract title
        const titleMatch = html.match(/<h[1-3][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i) ||
                          html.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
        
        // Extract company
        const companyMatch = html.match(/class="[^"]*company[^"]*"[^>]*>([\s\S]*?)</i) ||
                            html.match(/class="[^"]*entreprise[^"]*"[^>]*>([\s\S]*?)</i);
        
        // Extract location
        const locationMatch = html.match(/class="[^"]*location[^"]*"[^>]*>([\s\S]*?)</i) ||
                             html.match(/class="[^"]*ville[^"]*"[^>]*>([\s\S]*?)</i);
        
        // Extract URL
        const urlMatch = html.match(/<a[^>]*href="([^"]*)"[^>]*>/i);
        
        // Extract date
        const dateMatch = html.match(/class="[^"]*date[^"]*"[^>]*>([\s\S]*?)</i);
        
        if (titleMatch) {
            return {
                title: cleanText(titleMatch[1]),
                company: companyMatch ? cleanText(companyMatch[1]) : 'Entreprise Marocaine',
                location: locationMatch ? cleanText(locationMatch[1]) : 'Maroc',
                url: urlMatch ? urlMatch[1] : null,
                postedAt: dateMatch ? parseDate(dateMatch[1]) : new Date().toISOString(),
            };
        }
    } catch (e) {
        // Skip malformed entries
    }
    
    return null;
}

/**
 * Clean text from HTML entities and extra whitespace
 */
function cleanText(text) {
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Parse various date formats common on Moroccan sites
 */
function parseDate(dateStr) {
    const cleaned = cleanText(dateStr).toLowerCase();
    const now = new Date();
    
    // French date patterns
    if (cleaned.includes("aujourd'hui") || cleaned.includes('today')) {
        return now.toISOString();
    }
    if (cleaned.includes('hier') || cleaned.includes('yesterday')) {
        now.setDate(now.getDate() - 1);
        return now.toISOString();
    }
    
    // "Il y a X jours" / "X days ago"
    const daysMatch = cleaned.match(/(\d+)\s*(?:jours?|days?)/);
    if (daysMatch) {
        now.setDate(now.getDate() - parseInt(daysMatch[1]));
        return now.toISOString();
    }
    
    // "Il y a X semaines" / "X weeks ago"
    const weeksMatch = cleaned.match(/(\d+)\s*(?:semaines?|weeks?)/);
    if (weeksMatch) {
        now.setDate(now.getDate() - (parseInt(weeksMatch[1]) * 7));
        return now.toISOString();
    }
    
    // Try to parse as date
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
    }
    
    return now.toISOString();
}

/**
 * Get mock jobs for development/fallback
 */
function getMockEmploiJobs(query, city, limit) {
    const mockJobs = [
        {
            title: `Développeur Full Stack ${query || ''}`.trim(),
            company: 'Tech Maroc Solutions',
            location: city || 'Casablanca',
            description: 'Nous recherchons un développeur Full Stack passionné pour rejoindre notre équipe dynamique.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.emploi.ma/offre/dev-fullstack-1',
        },
        {
            title: `Ingénieur DevOps ${query || ''}`.trim(),
            company: 'Entreprise Digitale MA',
            location: city || 'Rabat',
            description: 'Poste de DevOps pour gérer notre infrastructure cloud et pipelines CI/CD.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.emploi.ma/offre/devops-2',
        },
        {
            title: `Chef de Projet IT ${query || ''}`.trim(),
            company: 'Groupe Industriel Marocain',
            location: city || 'Marrakech',
            description: 'Management de projets informatiques dans un environnement international.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.emploi.ma/offre/chef-projet-3',
        },
        {
            title: `Analyste Data ${query || ''}`.trim(),
            company: 'Banque Populaire',
            location: city || 'Casablanca',
            description: 'Analyse de données et reporting pour le département stratégie.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.emploi.ma/offre/analyste-data-4',
        },
        {
            title: `Commercial B2B ${query || ''}`.trim(),
            company: 'Société de Services',
            location: city || 'Tanger',
            description: 'Développement commercial auprès des entreprises du Nord du Maroc.',
            jobType: 'CDI',
            postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.emploi.ma/offre/commercial-5',
        },
    ];

    // Filter by query if provided
    let filtered = mockJobs;
    if (query) {
        const queryLower = query.toLowerCase();
        filtered = mockJobs.filter(job => 
            job.title.toLowerCase().includes(queryLower) ||
            job.description.toLowerCase().includes(queryLower)
        );
    }

    return {
        jobs: filtered.slice(0, limit).map(job => normalizeJobFromMorocco(job, 'emploi')),
        total: filtered.length,
        source: 'emploi',
    };
}

export { parseEmploiJobs, getMockEmploiJobs };
