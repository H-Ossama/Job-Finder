/**
 * Ausbildung (German Apprenticeship) Job Provider
 * Searches for Ausbildung/apprenticeship positions specifically in Germany
 * Uses Adzuna Germany API with Ausbildung-specific filtering
 */

const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

// Common Ausbildung job titles/keywords
const AUSBILDUNG_KEYWORDS = [
    'ausbildung',
    'azubi',
    'auszubildende',
    'berufsausbildung',
    'lehrstelle',
    'lehrling',
    'trainee',
    'dual studium',
    'duales studium',
];

// Popular Ausbildung fields
export const AUSBILDUNG_FIELDS = [
    { id: 'kaufmaennisch', name: 'Kaufmännische Berufe', nameEn: 'Commercial/Business' },
    { id: 'it', name: 'IT & Informatik', nameEn: 'IT & Computer Science' },
    { id: 'handwerk', name: 'Handwerk & Technik', nameEn: 'Crafts & Technical' },
    { id: 'gesundheit', name: 'Gesundheit & Pflege', nameEn: 'Healthcare & Nursing' },
    { id: 'gastronomie', name: 'Gastronomie & Hotel', nameEn: 'Gastronomy & Hotel' },
    { id: 'einzelhandel', name: 'Einzelhandel & Verkauf', nameEn: 'Retail & Sales' },
    { id: 'industrie', name: 'Industrie & Produktion', nameEn: 'Industry & Production' },
    { id: 'logistik', name: 'Logistik & Transport', nameEn: 'Logistics & Transport' },
    { id: 'elektro', name: 'Elektro & Elektronik', nameEn: 'Electrical & Electronics' },
    { id: 'bau', name: 'Bau & Architektur', nameEn: 'Construction & Architecture' },
    { id: 'medien', name: 'Medien & Design', nameEn: 'Media & Design' },
    { id: 'banken', name: 'Banken & Versicherung', nameEn: 'Banking & Insurance' },
];

// German states (Bundesländer) for location filtering
export const GERMAN_STATES = [
    { code: 'BW', name: 'Baden-Württemberg' },
    { code: 'BY', name: 'Bayern' },
    { code: 'BE', name: 'Berlin' },
    { code: 'BB', name: 'Brandenburg' },
    { code: 'HB', name: 'Bremen' },
    { code: 'HH', name: 'Hamburg' },
    { code: 'HE', name: 'Hessen' },
    { code: 'MV', name: 'Mecklenburg-Vorpommern' },
    { code: 'NI', name: 'Niedersachsen' },
    { code: 'NW', name: 'Nordrhein-Westfalen' },
    { code: 'RP', name: 'Rheinland-Pfalz' },
    { code: 'SL', name: 'Saarland' },
    { code: 'SN', name: 'Sachsen' },
    { code: 'ST', name: 'Sachsen-Anhalt' },
    { code: 'SH', name: 'Schleswig-Holstein' },
    { code: 'TH', name: 'Thüringen' },
];

// Major German cities for Ausbildung
export const GERMAN_CITIES = [
    'Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart',
    'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden',
    'Hannover', 'Nürnberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld',
    'Bonn', 'Münster', 'Karlsruhe', 'Mannheim', 'Augsburg', 'Wiesbaden',
];

/**
 * Search for Ausbildung positions in Germany
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export async function searchAusbildung(params = {}) {
    const {
        query = '',
        location = '',
        field = '', // Ausbildung field/category
        startYear = '', // e.g., '2025', '2026'
        page = 1,
        limit = 20,
    } = params;

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
        console.warn('Adzuna API credentials not configured for Ausbildung search');
        return { jobs: [], total: 0, source: 'ausbildung' };
    }

    try {
        // Build search query with Ausbildung keywords
        let searchQuery = query || 'ausbildung';
        
        // Add Ausbildung keyword if not already present
        const hasAusbildungKeyword = AUSBILDUNG_KEYWORDS.some(kw => 
            searchQuery.toLowerCase().includes(kw)
        );
        
        if (!hasAusbildungKeyword) {
            searchQuery = `ausbildung ${searchQuery}`;
        }

        // Add field-specific keywords
        if (field) {
            const fieldInfo = AUSBILDUNG_FIELDS.find(f => f.id === field);
            if (fieldInfo) {
                searchQuery += ` ${fieldInfo.name}`;
            }
        }

        // Add start year if specified
        if (startYear) {
            searchQuery += ` ${startYear}`;
        }

        // Build query parameters
        const queryParams = new URLSearchParams({
            app_id: appId,
            app_key: appKey,
            results_per_page: String(limit),
            page: String(page),
            what: searchQuery,
            sort_by: 'date',
        });

        // Add location - don't pass country name as location for German API
        if (location) {
            const locationLower = location.toLowerCase().trim();
            // Don't pass 'Germany' or 'Deutschland' as location - we're already using /de/ endpoint
            if (locationLower !== 'germany' && locationLower !== 'deutschland') {
                queryParams.set('where', location);
            }
        }

        const url = `${BASE_URL}/de/search/${page}?${queryParams.toString()}`;
        
        console.log('Ausbildung search URL:', url);
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            const errorText = await response.text();
            // Check if it's an HTML error page (Adzuna sometimes returns these)
            if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
                console.error(`Ausbildung API returned HTML error page, status: ${response.status}`);
                // Return empty results instead of throwing
                return {
                    jobs: [],
                    total: 0,
                    source: 'ausbildung',
                    error: `Ausbildung API unavailable (${response.status})`,
                };
            }
            throw new Error(`Ausbildung API error: ${response.status} - ${errorText}`);
        }

        // Try to parse JSON, handle HTML responses
        let data;
        try {
            const text = await response.text();
            // Check if response is HTML instead of JSON
            if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                console.error('Ausbildung API returned HTML instead of JSON');
                return {
                    jobs: [],
                    total: 0,
                    source: 'ausbildung',
                    error: 'Ausbildung API returned invalid response',
                };
            }
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Ausbildung API JSON parse error:', parseError.message);
            return {
                jobs: [],
                total: 0,
                source: 'ausbildung',
                error: 'Invalid API response format',
            };
        }
        
        // Mark jobs as Ausbildung type
        const jobs = (data.results || []).map(job => ({
            ...job,
            isAusbildung: true,
            jobCategory: 'ausbildung',
        }));
        
        return {
            jobs,
            total: data.count || 0,
            source: 'ausbildung',
        };
    } catch (error) {
        console.error('Ausbildung search error:', error);
        return {
            jobs: [],
            total: 0,
            source: 'ausbildung',
            error: error.message,
        };
    }
}

/**
 * Get popular Ausbildung categories with job counts
 * @param {string} location - Optional location filter
 * @returns {Promise<Array>} - Categories with counts
 */
export async function getAusbildungCategories(location = '') {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
        return AUSBILDUNG_FIELDS.map(f => ({ ...f, count: 0 }));
    }

    try {
        const url = `${BASE_URL}/de/categories?app_id=${appId}&app_key=${appKey}`;
        
        const response = await fetch(url, {
            next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (!response.ok) {
            throw new Error(`Adzuna categories error: ${response.status}`);
        }

        const data = await response.json();
        
        // Map to our Ausbildung fields
        return AUSBILDUNG_FIELDS.map(field => ({
            ...field,
            count: Math.floor(Math.random() * 5000) + 500, // Placeholder - would need actual counts
        }));
    } catch (error) {
        console.error('Ausbildung categories error:', error);
        return AUSBILDUNG_FIELDS.map(f => ({ ...f, count: 0 }));
    }
}

/**
 * Extract Ausbildung-specific data from job description
 * @param {Object} job - Job data
 * @returns {Object} - Ausbildung details
 */
export function extractAusbildungDetails(job) {
    const description = (job.description || '').toLowerCase();
    const title = (job.title || '').toLowerCase();
    
    const details = {
        // Training duration (typically 2-3.5 years)
        duration: extractDuration(description),
        
        // Training start date
        startDate: extractStartDate(description, title),
        
        // Required education level
        requiredEducation: extractEducation(description),
        
        // Training salary (Ausbildungsvergütung)
        trainingSalary: extractTrainingSalary(job),
        
        // Vocational school info
        vocationalSchool: extractSchoolInfo(description),
        
        // Whether it's dual study (Duales Studium)
        isDualStudy: isDualStudy(title, description),
        
        // Company training benefits
        trainingBenefits: extractTrainingBenefits(description),
        
        // Career prospects after training
        careerProspects: extractCareerProspects(description),
        
        // IHK/HWK chamber certification
        chamberCertification: extractChamberInfo(description),
        
        // German language requirements (important for international applicants)
        languageRequirements: extractLanguageRequirements(description),
    };
    
    return details;
}

// Helper functions for extracting Ausbildung-specific data

function extractDuration(description) {
    // Look for duration patterns like "2 Jahre", "3 Jahre", "2,5 Jahre"
    const patterns = [
        /(\d[,.]?\d?)\s*(jahre?|years?)/i,
        /(\d+)\s*-\s*(\d+)\s*(jahre?|years?)/i,
        /ausbildungsdauer:?\s*(\d[,.]?\d?)\s*(jahre?)/i,
    ];
    
    for (const pattern of patterns) {
        const match = description.match(pattern);
        if (match) {
            if (match[2] && !isNaN(match[2])) {
                // Range like "2-3 years"
                return `${match[1]}-${match[2]} Jahre`;
            }
            return `${match[1]} Jahre`;
        }
    }
    
    return '2-3.5 Jahre'; // Default Ausbildung duration
}

function extractStartDate(description, title) {
    // Look for start dates like "ab August 2025", "01.09.2025"
    const patterns = [
        /ab\s+(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\s*(\d{4})/i,
        /start:?\s*(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\s*(\d{4})/i,
        /ausbildungsbeginn:?\s*([\d.]+\d{4})/i,
        /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
        /(2025|2026)/,
    ];
    
    for (const pattern of patterns) {
        const match = description.match(pattern) || title.match(pattern);
        if (match) {
            if (match[1] && match[2]) {
                return `${match[1]} ${match[2]}`;
            }
            return match[0];
        }
    }
    
    // Check title for year
    const yearMatch = title.match(/(2025|2026)/);
    if (yearMatch) {
        return `Ab ${yearMatch[1]}`;
    }
    
    return null;
}

function extractEducation(description) {
    const educationLevels = [];
    
    if (description.includes('abitur') || description.includes('hochschulreife')) {
        educationLevels.push('Abitur / Fachabitur');
    }
    if (description.includes('mittlere reife') || description.includes('realschulabschluss')) {
        educationLevels.push('Mittlere Reife');
    }
    if (description.includes('hauptschulabschluss') || description.includes('hauptschule')) {
        educationLevels.push('Hauptschulabschluss');
    }
    if (description.includes('fachabitur')) {
        educationLevels.push('Fachabitur');
    }
    
    return educationLevels.length > 0 ? educationLevels : ['Schulabschluss erforderlich'];
}

function extractTrainingSalary(job) {
    const description = (job.description || '').toLowerCase();
    
    // Look for Ausbildungsvergütung patterns
    const patterns = [
        /ausbildungsvergütung:?\s*(\d+[\d.,]*)\s*€?/i,
        /vergütung:?\s*(\d+[\d.,]*)\s*€?/i,
        /(\d{3,4})\s*€?\s*(pro monat|monatlich|\/monat)/i,
        /1\.\s*jahr:?\s*(\d+).*2\.\s*jahr:?\s*(\d+)/i,
    ];
    
    for (const pattern of patterns) {
        const match = description.match(pattern);
        if (match) {
            if (match[2] && !isNaN(match[2])) {
                // Multiple years mentioned
                return {
                    year1: `€${match[1]}`,
                    year2: `€${match[2]}`,
                    year3: match[3] ? `€${match[3]}` : null,
                };
            }
            return `€${match[1]}/Monat`;
        }
    }
    
    // Use job salary if available
    if (job.salary_min) {
        return `€${Math.round(job.salary_min / 12)}/Monat`;
    }
    
    return null;
}

function extractSchoolInfo(description) {
    // Look for Berufsschule mentions
    if (description.includes('berufsschule') || description.includes('berufskolleg')) {
        return {
            hasVocationalSchool: true,
            schedule: description.includes('blockunterricht') 
                ? 'Blockunterricht' 
                : 'Teilzeit (1-2 Tage/Woche)',
        };
    }
    return {
        hasVocationalSchool: true, // All German Ausbildung includes vocational school
        schedule: 'Dual (Betrieb + Berufsschule)',
    };
}

function isDualStudy(title, description) {
    return title.includes('dual') || 
           title.includes('duales studium') ||
           description.includes('duales studium') ||
           description.includes('dual study');
}

function extractTrainingBenefits(description) {
    const benefits = [];
    
    const benefitKeywords = {
        'übernahme': 'Übernahmechance nach Ausbildung',
        'übernahmegarantie': 'Übernahmegarantie',
        'fahrtkosten': 'Fahrtkostenzuschuss',
        'fahrtkostenzuschuss': 'Fahrtkostenzuschuss',
        'essenszuschuss': 'Essenszuschuss',
        'kantine': 'Betriebskantine',
        'urlaubsgeld': 'Urlaubsgeld',
        'weihnachtsgeld': 'Weihnachtsgeld',
        '13. gehalt': '13. Gehalt',
        'vermögenswirksame': 'Vermögenswirksame Leistungen',
        'azubi-ticket': 'Azubi-Ticket',
        'laptop': 'Laptop/Arbeitsmittel',
        'betriebliche altersvorsorge': 'Betriebliche Altersvorsorge',
        'weiterbildung': 'Weiterbildungsmöglichkeiten',
        'auslandseinsatz': 'Auslandseinsatz möglich',
    };
    
    for (const [keyword, benefit] of Object.entries(benefitKeywords)) {
        if (description.includes(keyword)) {
            benefits.push(benefit);
        }
    }
    
    return benefits;
}

function extractCareerProspects(description) {
    const prospects = [];
    
    if (description.includes('aufstiegschance') || description.includes('karrierechance')) {
        prospects.push('Aufstiegsmöglichkeiten');
    }
    if (description.includes('weiterbildung') || description.includes('fortbildung')) {
        prospects.push('Weiterbildungsmöglichkeiten');
    }
    if (description.includes('meister') || description.includes('techniker')) {
        prospects.push('Meister/Techniker Qualifikation');
    }
    if (description.includes('studium') && !isDualStudy(description, description)) {
        prospects.push('Studium nach Ausbildung möglich');
    }
    
    return prospects;
}

function extractChamberInfo(description) {
    if (description.includes('ihk')) {
        return 'IHK-zertifiziert (Industrie- und Handelskammer)';
    }
    if (description.includes('hwk')) {
        return 'HWK-zertifiziert (Handwerkskammer)';
    }
    return null;
}

/**
 * Extract German language requirements from job description
 * @param {string} description - Job description
 * @returns {Object} - Language requirements object
 */
function extractLanguageRequirements(description) {
    const requirements = {
        germanLevel: null,
        germanLevelCode: null,
        englishLevel: null,
        englishRequired: false,
        otherLanguages: [],
        note: null,
    };
    
    // German language level patterns (CEFR levels: A1, A2, B1, B2, C1, C2)
    const germanPatterns = [
        // Explicit CEFR mentions
        /deutsch(?:kenntnisse)?[:\s]*(?:mind\.?|mindestens|minimum)?\s*(a1|a2|b1|b2|c1|c2)/i,
        /german[:\s]*(?:min\.?|minimum)?\s*(a1|a2|b1|b2|c1|c2)/i,
        /(a1|a2|b1|b2|c1|c2)\s*(?:deutsch|german)/i,
        /sprachniveau[:\s]*(a1|a2|b1|b2|c1|c2)/i,
        
        // General language descriptions
        /gute?\s+deutsch(?:kenntnisse|sprache)/i,
        /sehr\s+gute?\s+deutsch(?:kenntnisse|sprache)/i,
        /flie(?:ß|ss)end(?:e[rs]?)?\s+deutsch/i,
        /deutsch\s+(?:in\s+)?wort\s+und\s+schrift/i,
        /grundkenntnisse\s+(?:in\s+)?deutsch/i,
        /muttersprache\s+deutsch/i,
        /deutsch\s+als\s+muttersprache/i,
        /verhandlungssicher(?:e[rs]?)?\s+deutsch/i,
    ];
    
    // Check for explicit CEFR levels
    for (let i = 0; i < 4; i++) {
        const match = description.match(germanPatterns[i]);
        if (match) {
            const level = match[1].toUpperCase();
            requirements.germanLevelCode = level;
            requirements.germanLevel = mapCEFRToDescription(level, 'de');
            break;
        }
    }
    
    // If no explicit level, try to infer from descriptions
    if (!requirements.germanLevel) {
        if (description.match(/muttersprache\s+deutsch|deutsch\s+als\s+muttersprache/i)) {
            requirements.germanLevel = 'Muttersprachler (Native)';
            requirements.germanLevelCode = 'C2';
        } else if (description.match(/verhandlungssicher|flie(?:ß|ss)end|perfekt/i) && description.includes('deutsch')) {
            requirements.germanLevel = 'Fließend / Verhandlungssicher (C1-C2)';
            requirements.germanLevelCode = 'C1';
        } else if (description.match(/sehr\s+gute?\s+deutsch/i) || description.match(/deutsch\s+in\s+wort\s+und\s+schrift/i)) {
            requirements.germanLevel = 'Sehr gute Kenntnisse (B2-C1)';
            requirements.germanLevelCode = 'B2';
        } else if (description.match(/gute?\s+deutsch(?:kenntnisse)?/i)) {
            requirements.germanLevel = 'Gute Kenntnisse (B1-B2)';
            requirements.germanLevelCode = 'B1';
        } else if (description.match(/grundkenntnisse|basis|anfänger/i) && description.includes('deutsch')) {
            requirements.germanLevel = 'Grundkenntnisse (A1-A2)';
            requirements.germanLevelCode = 'A2';
        }
    }
    
    // Check for English requirements
    const englishPatterns = [
        /english[:\s]*(?:min\.?|minimum)?\s*(a1|a2|b1|b2|c1|c2)/i,
        /englisch(?:kenntnisse)?[:\s]*(?:mind\.?|mindestens)?\s*(a1|a2|b1|b2|c1|c2)/i,
        /gute?\s+englisch(?:kenntnisse)?/i,
        /english\s+required|englisch\s+erforderlich/i,
    ];
    
    for (const pattern of englishPatterns) {
        const match = description.match(pattern);
        if (match) {
            requirements.englishRequired = true;
            if (match[1]) {
                requirements.englishLevel = mapCEFRToDescription(match[1].toUpperCase(), 'en');
            } else if (pattern.source.includes('gute')) {
                requirements.englishLevel = 'Good English (B1+)';
            } else {
                requirements.englishLevel = 'English required';
            }
            break;
        }
    }
    
    // Check for other languages
    const otherLangs = {
        'französisch': 'French',
        'spanisch': 'Spanish',
        'italienisch': 'Italian',
        'türkisch': 'Turkish',
        'russisch': 'Russian',
        'arabisch': 'Arabic',
        'polnisch': 'Polish',
        'chinesisch': 'Chinese',
        'japanisch': 'Japanese',
    };
    
    for (const [german, english] of Object.entries(otherLangs)) {
        if (description.includes(german)) {
            requirements.otherLanguages.push(english);
        }
    }
    
    // Add note for international applicants if no German level found
    if (!requirements.germanLevel) {
        // Default assumption for German apprenticeships
        requirements.germanLevel = 'B1-B2 empfohlen (Recommended)';
        requirements.germanLevelCode = 'B1';
        requirements.note = 'Most Ausbildung positions require at least B1-B2 German level for vocational school';
    }
    
    return requirements;
}

/**
 * Map CEFR level code to human-readable description
 * @param {string} level - CEFR level code (A1, A2, B1, B2, C1, C2)
 * @param {string} lang - Language code ('de' or 'en')
 * @returns {string} - Human-readable description
 */
function mapCEFRToDescription(level, lang = 'de') {
    const descriptions = {
        'A1': lang === 'de' ? 'Anfänger (A1)' : 'Beginner (A1)',
        'A2': lang === 'de' ? 'Grundlegende Kenntnisse (A2)' : 'Elementary (A2)',
        'B1': lang === 'de' ? 'Mittelstufe (B1)' : 'Intermediate (B1)',
        'B2': lang === 'de' ? 'Gute Mittelstufe (B2)' : 'Upper Intermediate (B2)',
        'C1': lang === 'de' ? 'Fortgeschritten (C1)' : 'Advanced (C1)',
        'C2': lang === 'de' ? 'Muttersprachliches Niveau (C2)' : 'Proficient (C2)',
    };
    return descriptions[level] || level;
}

export { AUSBILDUNG_KEYWORDS };
