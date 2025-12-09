/**
 * Morocco Job Normalizer
 * Converts job data from various Moroccan job sites to a standardized format
 */

// Source information for Morocco providers
const SOURCE_INFO = {
    emploi: {
        name: 'Emploi.ma',
        url: 'https://www.emploi.ma',
        color: '#0066cc',
    },
    dreamjob: {
        name: 'Dreamjob.ma',
        url: 'https://www.dreamjob.ma',
        color: '#ff6b35',
    },
    rekrute: {
        name: 'Rekrute.com',
        url: 'https://www.rekrute.com',
        color: '#e31937',
    },
    marocannonces: {
        name: 'MarocAnnonces',
        url: 'https://www.marocannonces.com',
        color: '#28a745',
    },
};

// Job type normalization
const JOB_TYPE_MAP = {
    // French terms
    'cdi': 'Full-time',
    'contrat à durée indéterminée': 'Full-time',
    'cdd': 'Contract',
    'contrat à durée déterminée': 'Contract',
    'stage': 'Internship',
    'interim': 'Contract',
    'intérim': 'Contract',
    'freelance': 'Freelance',
    'temps partiel': 'Part-time',
    'temps plein': 'Full-time',
    // English terms
    'permanent': 'Full-time',
    'temporary': 'Contract',
    'internship': 'Internship',
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
};

// Experience level normalization
const EXPERIENCE_LEVEL_MAP = {
    // French terms
    'débutant': 'Entry Level',
    'debutant': 'Entry Level',
    'junior': 'Entry Level',
    'confirmé': 'Mid-Level',
    'confirme': 'Mid-Level',
    'expérimenté': 'Mid-Level',
    'experimente': 'Mid-Level',
    'senior': 'Senior',
    'expert': 'Senior',
    // English terms
    'entry': 'Entry Level',
    'entry level': 'Entry Level',
    'mid': 'Mid-Level',
    'mid-level': 'Mid-Level',
    'lead': 'Lead',
};

/**
 * Generate a unique ID for a Morocco job
 * @param {Object} job - Raw job data
 * @param {string} source - Source identifier
 * @returns {string} - Unique job ID
 */
function generateJobId(job, source) {
    // Use URL hash if available, otherwise create from title + company
    if (job.url) {
        const urlHash = simpleHash(job.url);
        return `morocco_${source}_${urlHash}`;
    }
    
    const contentHash = simpleHash(`${job.title}-${job.company}-${source}`);
    return `morocco_${source}_${contentHash}`;
}

/**
 * Simple hash function for generating IDs
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Generate company colors based on company name
 */
function generateCompanyColors(companyName) {
    const hash = (companyName || 'Unknown').split('').reduce((acc, char) => 
        char.charCodeAt(0) + ((acc << 5) - acc), 0
    );
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 30) % 360;
    return [
        `hsl(${hue1}, 70%, 50%)`,
        `hsl(${hue2}, 70%, 40%)`,
    ];
}

/**
 * Normalize job type to standard format
 */
function normalizeJobType(jobType) {
    if (!jobType) return null;
    const normalized = JOB_TYPE_MAP[jobType.toLowerCase().trim()];
    return normalized || jobType;
}

/**
 * Normalize experience level to standard format
 */
function normalizeExperienceLevel(level) {
    if (!level) return null;
    const normalized = EXPERIENCE_LEVEL_MAP[level.toLowerCase().trim()];
    return normalized || level;
}

/**
 * Normalize location to include Morocco
 */
function normalizeLocation(location) {
    if (!location) return 'Maroc';
    
    const locationLower = location.toLowerCase();
    
    // If already has Morocco reference, return as is
    if (locationLower.includes('maroc') || locationLower.includes('morocco')) {
        return location;
    }
    
    // Add Morocco suffix if it's a known Moroccan city
    const moroccanCities = [
        'casablanca', 'rabat', 'marrakech', 'fes', 'fès', 'tanger', 'tangier',
        'agadir', 'meknes', 'meknès', 'oujda', 'kenitra', 'kénitra', 'tetouan',
        'tétouan', 'safi', 'el jadida', 'nador', 'beni mellal', 'mohammedia',
        'essaouira', 'settat', 'salé', 'temara'
    ];
    
    for (const city of moroccanCities) {
        if (locationLower.includes(city)) {
            return `${location}, Maroc`;
        }
    }
    
    return location;
}

/**
 * Normalize salary to a displayable format
 */
function normalizeSalary(salary, currency = 'MAD') {
    if (!salary) return null;
    
    // If already formatted, return as is
    if (typeof salary === 'string' && (salary.includes('MAD') || salary.includes('DH'))) {
        return salary;
    }
    
    // If it's a number, format it
    if (typeof salary === 'number') {
        return `${salary.toLocaleString()} ${currency}`;
    }
    
    return salary;
}

/**
 * Extract skills/tags from job title and description
 */
function extractSkills(job) {
    const text = `${job.title || ''} ${job.description || ''}`.toLowerCase();
    const skills = [];
    
    // Common tech skills
    const techSkills = [
        'javascript', 'python', 'java', 'php', 'react', 'angular', 'vue',
        'node.js', 'nodejs', 'sql', 'mongodb', 'aws', 'azure', 'docker',
        'kubernetes', 'git', 'agile', 'scrum', 'devops', 'ci/cd',
        'machine learning', 'data science', 'excel', 'powerbi', 'tableau',
        'sap', 'salesforce', 'wordpress', 'laravel', 'django', 'spring'
    ];
    
    // Common business skills (French)
    const businessSkills = [
        'gestion de projet', 'management', 'commercial', 'vente',
        'marketing', 'communication', 'comptabilité', 'finance',
        'ressources humaines', 'rh', 'logistique', 'supply chain',
        'qualité', 'audit', 'juridique', 'bilingue', 'anglais', 'français'
    ];
    
    // Check for tech skills
    for (const skill of techSkills) {
        if (text.includes(skill)) {
            skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
    }
    
    // Check for business skills
    for (const skill of businessSkills) {
        if (text.includes(skill)) {
            skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
    }
    
    // Limit to 5 skills
    return [...new Set(skills)].slice(0, 5);
}

/**
 * Normalize a job from Morocco sources to the standard format
 * @param {Object} job - Raw job data from source
 * @param {string} source - Source identifier (emploi, dreamjob, rekrute, marocannonces)
 * @returns {Object} - Normalized job object
 */
export function normalizeJobFromMorocco(job, source) {
    const sourceInfo = SOURCE_INFO[source] || { name: source, url: '', color: '#666' };
    const companyColors = generateCompanyColors(job.company);
    
    // Generate the hash for the external ID
    const externalIdHash = job.url 
        ? simpleHash(job.url) 
        : simpleHash(`${job.title}-${job.company}-${source}`);
    
    const fullSource = `morocco_${source}`;
    const jobId = `${fullSource}_${externalIdHash}`;
    
    return {
        id: jobId,
        externalId: externalIdHash, // Required for database caching
        title: job.title || 'Offre d\'emploi',
        company: job.company || 'Entreprise Marocaine',
        companyLogo: job.companyLogo || null,
        companyColors: companyColors,
        location: normalizeLocation(job.location),
        country: 'MA',
        description: job.description || '',
        jobType: normalizeJobType(job.jobType),
        employmentType: job.jobType || null,
        experienceLevel: normalizeExperienceLevel(job.experienceLevel),
        salary: normalizeSalary(job.salary),
        salaryMin: job.salaryMin || null,
        salaryMax: job.salaryMax || null,
        salaryCurrency: 'MAD',
        skills: job.skills || extractSkills(job),
        tags: job.tags || extractSkills(job),
        url: job.url,
        applyUrl: job.applyUrl || job.url,
        postedAt: job.postedAt || new Date().toISOString(),
        expiresAt: job.expiresAt || null,
        remote: false, // Most Morocco jobs are not remote
        featured: job.featured || false,
        source: fullSource,
        sourceInfo: {
            id: source,
            name: sourceInfo.name,
            url: sourceInfo.url,
            color: sourceInfo.color,
            country: 'MA',
            region: 'North Africa',
        },
        // Morocco-specific metadata
        moroccoMetadata: {
            originalSource: source,
            language: detectLanguage(job),
            sector: job.sector || null,
            contractType: job.jobType || null,
        },
    };
}

/**
 * Detect primary language of job posting
 */
function detectLanguage(job) {
    const text = `${job.title || ''} ${job.description || ''}`.toLowerCase();
    
    // French indicators
    const frenchWords = ['nous', 'notre', 'vous', 'pour', 'dans', 'avec', 'une', 'des'];
    let frenchCount = 0;
    
    // Arabic indicators (common transliterated words)
    const arabicIndicators = ['مطلوب', 'وظيفة', 'عمل'];
    let arabicCount = 0;
    
    // English indicators  
    const englishWords = ['the', 'and', 'for', 'with', 'our', 'your', 'we'];
    let englishCount = 0;
    
    for (const word of frenchWords) {
        if (text.includes(word)) frenchCount++;
    }
    
    for (const word of englishWords) {
        if (text.includes(word)) englishCount++;
    }
    
    for (const word of arabicIndicators) {
        if (text.includes(word)) arabicCount++;
    }
    
    if (arabicCount > 0) return 'ar';
    if (frenchCount > englishCount) return 'fr';
    if (englishCount > 0) return 'en';
    return 'fr'; // Default to French for Morocco
}

export { generateJobId, generateCompanyColors, SOURCE_INFO };
