/**
 * Job Data Normalizer
 * Converts job data from different sources into a unified format
 */

/**
 * Normalize job data from any source into a standard format
 * @param {Object} job - Raw job data from API
 * @param {string} source - Source identifier
 * @returns {Object} - Normalized job object
 */
export function normalizeJob(job, source) {
    const normalizers = {
        remoteok: normalizeRemoteOK,
        adzuna: normalizeAdzuna,
        jsearch: normalizeJSearch,
        themuse: normalizeTheMuse,
    };

    const normalizer = normalizers[source];
    if (!normalizer) {
        console.warn(`No normalizer found for source: ${source}`);
        return createBaseJob(job, source);
    }

    return normalizer(job);
}

/**
 * Create a base job object with default values
 */
function createBaseJob(job, source) {
    return {
        id: `${source}_${job.id || Date.now()}`,
        externalId: String(job.id || ''),
        source,
        title: job.title || 'Unknown Position',
        company: job.company || job.company_name || 'Unknown Company',
        companyLogo: job.logo || job.company_logo || null,
        location: job.location || 'Remote',
        locationType: detectLocationType(job),
        country: job.country || '',
        city: job.city || '',
        salary: formatSalary(job),
        salaryMin: job.salary_min || job.salaryMin || null,
        salaryMax: job.salary_max || job.salaryMax || null,
        salaryCurrency: job.salary_currency || 'USD',
        jobType: normalizeJobType(job.job_type || job.type),
        experienceLevel: normalizeExperienceLevel(job.experience_level || job.experience),
        description: job.description || '',
        requirements: job.requirements || [],
        benefits: job.benefits || [],
        skills: extractSkills(job),
        applyUrl: job.url || job.apply_url || job.application_url || '#',
        postedAt: parseDate(job.date || job.posted_at || job.created_at),
        expiresAt: job.expires_at ? parseDate(job.expires_at) : null,
        tags: generateTags(job),
        featured: job.featured || false,
        rawData: job,
    };
}

/**
 * Normalize RemoteOK job data
 */
function normalizeRemoteOK(job) {
    return {
        id: `remoteok_${job.id}`,
        externalId: String(job.id),
        source: 'remoteok',
        title: job.position || job.title || 'Unknown Position',
        company: job.company || 'Unknown Company',
        companyLogo: job.company_logo || job.logo || null,
        location: job.location || 'Remote',
        locationType: 'remote',
        country: extractCountry(job.location),
        city: '',
        salary: formatRemoteOKSalary(job),
        salaryMin: job.salary_min || null,
        salaryMax: job.salary_max || null,
        salaryCurrency: 'USD',
        jobType: 'full-time',
        experienceLevel: detectExperienceFromTitle(job.position || job.title),
        description: job.description || '',
        requirements: [],
        benefits: [],
        skills: job.tags || [],
        applyUrl: job.url || job.apply_url || `https://remoteok.com/remote-jobs/${job.id}`,
        postedAt: job.date ? new Date(job.date * 1000).toISOString() : new Date().toISOString(),
        expiresAt: null,
        tags: [...(job.tags || []), 'Remote'],
        featured: false,
        rawData: job,
    };
}

/**
 * Normalize Adzuna job data
 */
function normalizeAdzuna(job) {
    return {
        id: `adzuna_${job.id}`,
        externalId: String(job.id),
        source: 'adzuna',
        title: job.title || 'Unknown Position',
        company: job.company?.display_name || 'Unknown Company',
        companyLogo: null, // Adzuna doesn't provide logos
        location: job.location?.display_name || 'Unknown Location',
        locationType: detectLocationType({ location: job.location?.display_name }),
        country: job.location?.area?.[0] || '',
        city: job.location?.area?.[job.location?.area?.length - 1] || '',
        salary: formatAdzunaSalary(job),
        salaryMin: job.salary_min || null,
        salaryMax: job.salary_max || null,
        salaryCurrency: 'GBP', // Adzuna UK default
        jobType: normalizeJobType(job.contract_type),
        experienceLevel: detectExperienceFromTitle(job.title),
        description: job.description || '',
        requirements: [],
        benefits: [],
        skills: extractSkillsFromDescription(job.description),
        applyUrl: job.redirect_url || '#',
        postedAt: job.created ? new Date(job.created).toISOString() : new Date().toISOString(),
        expiresAt: null,
        tags: [job.category?.label, job.contract_type].filter(Boolean),
        featured: false,
        rawData: job,
    };
}

/**
 * Normalize JSearch (RapidAPI) job data
 */
function normalizeJSearch(job) {
    return {
        id: `jsearch_${job.job_id}`,
        externalId: String(job.job_id),
        source: 'jsearch',
        title: job.job_title || 'Unknown Position',
        company: job.employer_name || 'Unknown Company',
        companyLogo: job.employer_logo || null,
        location: formatJSearchLocation(job),
        locationType: job.job_is_remote ? 'remote' : 'onsite',
        country: job.job_country || '',
        city: job.job_city || '',
        salary: formatJSearchSalary(job),
        salaryMin: job.job_min_salary || null,
        salaryMax: job.job_max_salary || null,
        salaryCurrency: job.job_salary_currency || 'USD',
        jobType: normalizeJobType(job.job_employment_type),
        experienceLevel: normalizeExperienceLevel(job.job_required_experience?.experience_mentioned?.[0]),
        description: job.job_description || '',
        requirements: job.job_required_skills || [],
        benefits: job.job_benefits || [],
        skills: job.job_required_skills || [],
        applyUrl: job.job_apply_link || job.job_google_link || '#',
        postedAt: job.job_posted_at_datetime_utc || new Date().toISOString(),
        expiresAt: job.job_offer_expiration_datetime_utc || null,
        tags: [
            job.job_employment_type,
            job.job_is_remote ? 'Remote' : null,
            job.employer_company_type,
        ].filter(Boolean),
        featured: job.job_is_highlighted || false,
        rawData: job,
    };
}

/**
 * Normalize The Muse job data
 */
function normalizeTheMuse(job) {
    const location = job.locations?.[0] || {};
    return {
        id: `themuse_${job.id}`,
        externalId: String(job.id),
        source: 'themuse',
        title: job.name || 'Unknown Position',
        company: job.company?.name || 'Unknown Company',
        companyLogo: job.company?.logo || null,
        location: location.name || 'Unknown Location',
        locationType: detectLocationType({ location: location.name }),
        country: extractCountry(location.name),
        city: location.name?.split(',')[0] || '',
        salary: '', // The Muse doesn't provide salary info
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: 'USD',
        jobType: normalizeJobType(job.type),
        experienceLevel: normalizeExperienceLevel(job.levels?.[0]?.name),
        description: job.contents || '',
        requirements: [],
        benefits: [],
        skills: job.categories?.map(c => c.name) || [],
        applyUrl: job.refs?.landing_page || `https://www.themuse.com/jobs/${job.id}`,
        postedAt: job.publication_date || new Date().toISOString(),
        expiresAt: null,
        tags: [
            ...(job.categories?.map(c => c.name) || []),
            ...(job.levels?.map(l => l.name) || []),
        ],
        featured: false,
        rawData: job,
    };
}

// Helper functions

function detectLocationType(job) {
    const location = (job.location || '').toLowerCase();
    if (location.includes('remote') || location.includes('anywhere')) return 'remote';
    if (location.includes('hybrid')) return 'hybrid';
    return 'onsite';
}

function normalizeJobType(type) {
    if (!type) return 'full-time';
    const normalized = type.toLowerCase();
    if (normalized.includes('full')) return 'full-time';
    if (normalized.includes('part')) return 'part-time';
    if (normalized.includes('contract') || normalized.includes('freelance')) return 'contract';
    if (normalized.includes('intern')) return 'internship';
    if (normalized.includes('temp')) return 'temporary';
    return 'full-time';
}

function normalizeExperienceLevel(level) {
    if (!level) return 'mid';
    const normalized = level.toLowerCase();
    if (normalized.includes('entry') || normalized.includes('junior') || normalized.includes('jr')) return 'entry';
    if (normalized.includes('senior') || normalized.includes('sr') || normalized.includes('lead')) return 'senior';
    if (normalized.includes('executive') || normalized.includes('director') || normalized.includes('vp')) return 'executive';
    if (normalized.includes('intern')) return 'intern';
    return 'mid';
}

function detectExperienceFromTitle(title) {
    if (!title) return 'mid';
    const normalized = title.toLowerCase();
    if (normalized.includes('senior') || normalized.includes('sr.') || normalized.includes('lead') || normalized.includes('principal')) return 'senior';
    if (normalized.includes('junior') || normalized.includes('jr.') || normalized.includes('entry')) return 'entry';
    if (normalized.includes('intern')) return 'intern';
    if (normalized.includes('director') || normalized.includes('vp') || normalized.includes('head of')) return 'executive';
    return 'mid';
}

function formatSalary(job) {
    if (job.salary) return job.salary;
    if (job.salary_min && job.salary_max) {
        return `$${formatNumber(job.salary_min)} - $${formatNumber(job.salary_max)}`;
    }
    if (job.salary_min) return `From $${formatNumber(job.salary_min)}`;
    if (job.salary_max) return `Up to $${formatNumber(job.salary_max)}`;
    return '';
}

function formatRemoteOKSalary(job) {
    if (job.salary_min && job.salary_max) {
        return `$${formatNumber(job.salary_min)} - $${formatNumber(job.salary_max)}`;
    }
    return '';
}

function formatAdzunaSalary(job) {
    if (job.salary_min && job.salary_max) {
        return `£${formatNumber(job.salary_min)} - £${formatNumber(job.salary_max)}`;
    }
    return '';
}

function formatJSearchSalary(job) {
    const currency = job.job_salary_currency || 'USD';
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '';
    
    if (job.job_min_salary && job.job_max_salary) {
        return `${symbol}${formatNumber(job.job_min_salary)} - ${symbol}${formatNumber(job.job_max_salary)}`;
    }
    return '';
}

function formatJSearchLocation(job) {
    const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
    if (job.job_is_remote) {
        return parts.length ? `Remote (${parts.join(', ')})` : 'Remote';
    }
    return parts.join(', ') || 'Unknown Location';
}

function formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${Math.round(num / 1000)}k`;
    return num.toString();
}

function extractCountry(location) {
    if (!location) return '';
    const parts = location.split(',').map(p => p.trim());
    return parts[parts.length - 1] || '';
}

function extractSkills(job) {
    const skills = [];
    if (job.skills) skills.push(...job.skills);
    if (job.tags) skills.push(...job.tags);
    if (job.required_skills) skills.push(...job.required_skills);
    return [...new Set(skills)];
}

function extractSkillsFromDescription(description) {
    if (!description) return [];
    
    const commonSkills = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP',
        'React', 'Vue', 'Angular', 'Node.js', 'Django', 'Flask', 'Spring', 'Rails',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
        'Git', 'CI/CD', 'Agile', 'Scrum',
        'Machine Learning', 'AI', 'Data Science', 'Deep Learning',
    ];
    
    const foundSkills = commonSkills.filter(skill => 
        description.toLowerCase().includes(skill.toLowerCase())
    );
    
    return foundSkills.slice(0, 10); // Limit to 10 skills
}

function generateTags(job) {
    const tags = [];
    if (job.job_type || job.type) tags.push(normalizeJobType(job.job_type || job.type));
    if (job.remote || job.is_remote) tags.push('Remote');
    if (job.salary_min && job.salary_min >= 100000) tags.push('$100k+');
    if (job.salary_min && job.salary_min >= 150000) tags.push('$150k+');
    return [...new Set(tags)];
}

function parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString();
    
    // Handle Unix timestamp
    if (typeof dateStr === 'number') {
        return new Date(dateStr * 1000).toISOString();
    }
    
    // Handle ISO date string
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date.toISOString();
    }
    
    return new Date().toISOString();
}
