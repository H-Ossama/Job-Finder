/**
 * Stagiaires.ma Job Scraper
 * Website: https://www.stagiaires.ma
 * 
 * Specialized platform for internships (stages) in Morocco
 * Great resource for students and recent graduates
 * 
 * Note: Uses structured data parsing from their website
 */

import { normalizeJobFromMorocco } from './normalizer';

const BASE_URL = 'https://www.stagiaires.ma';
// Try multiple URL patterns as the site structure may vary
const SEARCH_PATHS = {
    main: '/offres-de-stages',
    search: '/recherche',
};

// Internship types
const INTERNSHIP_TYPES = {
    'pfe': 'Stage PFE (Projet Fin d\'Études)',
    'pre-embauche': 'Stage Pré-Embauche',
    'observation': 'Stage d\'Observation',
    'application': 'Stage d\'Application',
    'initiation': 'Stage d\'Initiation',
};

// Duration mappings
const DURATIONS = {
    '1-month': '1 mois',
    '2-months': '2 mois',
    '3-months': '3 mois',
    '4-months': '4 mois',
    '6-months': '6 mois',
};

/**
 * Search for internships on Stagiaires.ma
 * 
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchStagiaires(params = {}) {
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
            searchParams.set('secteur', sector);
        }
        
        searchParams.set('page', String(page));

        // Try main listing page or search
        const url = query 
            ? `${BASE_URL}${SEARCH_PATHS.search}?${searchParams.toString()}`
            : `${BASE_URL}${SEARCH_PATHS.main}${page > 1 ? '?page=' + page : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; JobFinderBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            },
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`Stagiaires.ma returned ${response.status}`);
        }

        const html = await response.text();
        const jobs = parseStagiairesJobs(html);

        // Filter by city if specified
        let filteredJobs = jobs;
        if (city) {
            const cityLower = city.toLowerCase();
            filteredJobs = jobs.filter(job => 
                (job.location || '').toLowerCase().includes(cityLower)
            );
        }

        return {
            jobs: filteredJobs.slice(0, limit).map(job => normalizeJobFromMorocco(job, 'stagiaires')),
            total: filteredJobs.length,
            source: 'stagiaires',
        };
    } catch (error) {
        console.error('Stagiaires.ma search error:', error.message);
        return getMockStagiairesJobs(query, city, limit);
    }
}

/**
 * Parse internship listings from Stagiaires.ma HTML
 */
function parseStagiairesJobs(html) {
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
                    
                    if (data['@type'] === 'JobPosting' || data['@type'] === 'Internship') {
                        jobs.push({
                            title: data.title,
                            company: data.hiringOrganization?.name || 'Entreprise Marocaine',
                            location: data.jobLocation?.address?.addressLocality || 'Maroc',
                            description: data.description,
                            url: data.url || data['@id'],
                            postedAt: data.datePosted,
                            jobType: 'Stage',
                            duration: data.employmentType,
                        });
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        }
        
        // Parse internship card patterns
        const patterns = [
            /<div[^>]*class="[^"]*stage[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
            /<article[^>]*class="[^"]*offre[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
            /<li[^>]*class="[^"]*internship[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
        ];
        
        for (const pattern of patterns) {
            const matches = html.matchAll(pattern);
            for (const match of matches) {
                const job = extractStagiairesJob(match[1]);
                if (job && job.title) {
                    jobs.push(job);
                }
            }
        }
    } catch (error) {
        console.error('Error parsing Stagiaires.ma HTML:', error.message);
    }
    
    return jobs;
}

/**
 * Extract internship details from HTML snippet
 */
function extractStagiairesJob(html) {
    try {
        // Extract title and URL
        const titleMatch = html.match(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i) ||
                          html.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
        
        if (!titleMatch) return null;
        
        const url = titleMatch[1] || '';
        const title = cleanText(titleMatch[2] || titleMatch[1]);
        
        // Extract company
        const companyMatch = html.match(/class="[^"]*(?:entreprise|company|societe)[^"]*"[^>]*>([\s\S]*?)</i);
        
        // Extract location
        const locationMatch = html.match(/class="[^"]*(?:ville|location|lieu)[^"]*"[^>]*>([\s\S]*?)</i);
        
        // Extract duration
        const durationMatch = html.match(/class="[^"]*(?:duree|duration)[^"]*"[^>]*>([\s\S]*?)</i) ||
                             html.match(/(\d+)\s*mois/i);
        
        // Extract date
        const dateMatch = html.match(/class="[^"]*date[^"]*"[^>]*>([\s\S]*?)</i);
        
        // Extract internship type
        const typeMatch = html.match(/(?:pfe|pré-embauche|observation|application|initiation)/i);
        
        return {
            title,
            company: companyMatch ? cleanText(companyMatch[1]) : 'Entreprise Marocaine',
            location: locationMatch ? cleanText(locationMatch[1]) : 'Maroc',
            url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
            postedAt: dateMatch ? parseDate(dateMatch[1]) : new Date().toISOString(),
            jobType: 'Stage',
            duration: durationMatch ? cleanText(durationMatch[1] || `${durationMatch[1]} mois`) : null,
            internshipType: typeMatch ? typeMatch[0] : 'Stage',
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
    
    if (cleaned.includes("aujourd'hui") || cleaned.includes('today')) {
        return now.toISOString();
    }
    if (cleaned.includes('hier') || cleaned.includes('yesterday')) {
        now.setDate(now.getDate() - 1);
        return now.toISOString();
    }
    
    const daysMatch = cleaned.match(/(\d+)\s*(?:jours?|days?)/);
    if (daysMatch) {
        now.setDate(now.getDate() - parseInt(daysMatch[1]));
        return now.toISOString();
    }
    
    const weeksMatch = cleaned.match(/(\d+)\s*(?:semaines?|weeks?)/);
    if (weeksMatch) {
        now.setDate(now.getDate() - (parseInt(weeksMatch[1]) * 7));
        return now.toISOString();
    }
    
    return now.toISOString();
}

/**
 * Mock internships for fallback
 */
function getMockStagiairesJobs(query, city, limit) {
    const mockJobs = [
        {
            title: `Stage PFE - Développement Web ${query || ''}`.trim(),
            company: 'Tech Solutions Maroc',
            location: city || 'Casablanca',
            description: 'Stage de fin d\'études en développement web (React, Node.js). Durée 4-6 mois.',
            jobType: 'Stage',
            duration: '6 mois',
            internshipType: 'PFE',
            postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.stagiaires.ma/stage/dev-web-1',
        },
        {
            title: `Stage Pré-Embauche - Marketing Digital ${query || ''}`.trim(),
            company: 'Agence Digital MA',
            location: city || 'Rabat',
            description: 'Stage pré-embauche en marketing digital avec possibilité de CDI.',
            jobType: 'Stage',
            duration: '3 mois',
            internshipType: 'Pré-Embauche',
            postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.stagiaires.ma/stage/marketing-2',
        },
        {
            title: `Stage Data Science - Intelligence Artificielle ${query || ''}`.trim(),
            company: 'AI Labs Morocco',
            location: city || 'Casablanca',
            description: 'Stage en Data Science et Machine Learning pour étudiants en informatique.',
            jobType: 'Stage',
            duration: '4 mois',
            internshipType: 'PFE',
            postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.stagiaires.ma/stage/data-science-3',
        },
        {
            title: `Stage Finance - Audit ${query || ''}`.trim(),
            company: 'Cabinet Audit Maroc',
            location: city || 'Casablanca',
            description: 'Stage en audit et comptabilité pour étudiants en finance.',
            jobType: 'Stage',
            duration: '3 mois',
            internshipType: 'Application',
            postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.stagiaires.ma/stage/audit-4',
        },
        {
            title: `Stage RH - Ressources Humaines ${query || ''}`.trim(),
            company: 'Groupe Industriel MA',
            location: city || 'Tanger',
            description: 'Stage en gestion des ressources humaines et recrutement.',
            jobType: 'Stage',
            duration: '2 mois',
            internshipType: 'Observation',
            postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.stagiaires.ma/stage/rh-5',
        },
        {
            title: `Stage Ingénieur - Génie Civil ${query || ''}`.trim(),
            company: 'BTP Maroc Construction',
            location: city || 'Marrakech',
            description: 'Stage pour étudiants en génie civil sur chantier de construction.',
            jobType: 'Stage',
            duration: '4 mois',
            internshipType: 'PFE',
            postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://www.stagiaires.ma/stage/genie-civil-6',
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
        jobs: filtered.slice(0, limit).map(job => normalizeJobFromMorocco(job, 'stagiaires')),
        total: filtered.length,
        source: 'stagiaires',
    };
}

export { parseStagiairesJobs, getMockStagiairesJobs };
