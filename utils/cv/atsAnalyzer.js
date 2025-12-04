/**
 * ATS (Applicant Tracking System) Analyzer Utility
 * Comprehensive local analysis for CV-Job matching and ATS compatibility
 */

// Common ATS-friendly action verbs by category
export const ACTION_VERBS = {
    leadership: ['led', 'directed', 'managed', 'supervised', 'coordinated', 'headed', 'oversaw', 'spearheaded', 'orchestrated', 'mentored'],
    achievement: ['achieved', 'accomplished', 'delivered', 'exceeded', 'outperformed', 'surpassed', 'attained', 'earned', 'won', 'secured'],
    creation: ['created', 'designed', 'developed', 'built', 'established', 'founded', 'initiated', 'launched', 'pioneered', 'introduced'],
    improvement: ['improved', 'enhanced', 'optimized', 'streamlined', 'upgraded', 'transformed', 'revamped', 'modernized', 'strengthened', 'boosted'],
    analysis: ['analyzed', 'assessed', 'evaluated', 'researched', 'investigated', 'examined', 'reviewed', 'audited', 'diagnosed', 'identified'],
    communication: ['presented', 'communicated', 'negotiated', 'collaborated', 'liaised', 'facilitated', 'mediated', 'advocated', 'articulated', 'persuaded'],
    technical: ['implemented', 'engineered', 'programmed', 'automated', 'configured', 'deployed', 'integrated', 'architected', 'coded', 'debugged']
};

// Common soft skills keywords
export const SOFT_SKILLS = [
    'communication', 'leadership', 'teamwork', 'problem-solving', 'critical thinking',
    'time management', 'adaptability', 'flexibility', 'creativity', 'innovation',
    'attention to detail', 'organization', 'interpersonal', 'collaboration',
    'decision making', 'analytical', 'strategic thinking', 'project management',
    'conflict resolution', 'negotiation', 'presentation', 'customer service',
    'self-motivated', 'initiative', 'work ethic', 'reliability', 'accountability',
    'multitasking', 'prioritization', 'emotional intelligence', 'mentoring'
];

// Technical skills by domain
export const TECH_SKILLS_BY_DOMAIN = {
    programming: ['javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'typescript', 'scala', 'perl', 'r'],
    frontend: ['react', 'angular', 'vue', 'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'jquery', 'webpack', 'next.js', 'nuxt', 'svelte', 'redux'],
    backend: ['node.js', 'express', 'django', 'flask', 'spring', 'rails', 'laravel', 'fastapi', '.net', 'graphql', 'rest api', 'microservices'],
    database: ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'dynamodb', 'cassandra', 'firebase', 'supabase'],
    cloud: ['aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd', 'devops', 'serverless', 'lambda'],
    data: ['machine learning', 'deep learning', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'spark', 'hadoop', 'tableau', 'power bi', 'data analysis'],
    mobile: ['ios', 'android', 'react native', 'flutter', 'swift', 'kotlin', 'xamarin', 'ionic', 'mobile development'],
    tools: ['git', 'github', 'gitlab', 'jira', 'confluence', 'slack', 'figma', 'sketch', 'adobe', 'vs code', 'intellij', 'postman', 'agile', 'scrum']
};

// Industry-specific keywords
export const INDUSTRY_KEYWORDS = {
    tech: ['software', 'development', 'engineering', 'technology', 'digital', 'automation', 'innovation', 'startup', 'saas', 'platform'],
    finance: ['financial', 'banking', 'investment', 'trading', 'risk management', 'compliance', 'audit', 'portfolio', 'fintech', 'accounting'],
    healthcare: ['healthcare', 'medical', 'clinical', 'patient', 'hipaa', 'ehr', 'diagnosis', 'treatment', 'pharmaceutical', 'biotech'],
    marketing: ['marketing', 'branding', 'seo', 'sem', 'social media', 'content', 'digital marketing', 'analytics', 'campaigns', 'advertising'],
    sales: ['sales', 'revenue', 'pipeline', 'crm', 'b2b', 'b2c', 'account management', 'business development', 'client relations', 'quota']
};

// Education keywords
export const EDUCATION_KEYWORDS = ['bachelor', 'master', 'phd', 'mba', 'degree', 'certification', 'certified', 'diploma', 'university', 'college', 'graduate', 'undergraduate'];

// Quantifiable metrics patterns
export const METRIC_PATTERNS = [
    /\d+%/g,                           // Percentages
    /\$[\d,]+(?:\.\d+)?[kmb]?/gi,      // Dollar amounts
    /\d+\+?\s*(?:years?|yrs?)/gi,      // Years
    /\d+\+?\s*(?:months?|mos?)/gi,     // Months
    /\d+\+?\s*(?:team members?|people|employees|staff)/gi, // Team size
    /\d+[,\d]*\+?\s*(?:users?|customers?|clients?)/gi,     // User counts
    /\d+[,\d]*\+?\s*(?:projects?|applications?|systems?)/gi, // Project counts
    /\d+x\s*/gi,                        // Multipliers (2x, 10x improvement)
    /top\s*\d+%?/gi,                    // Rankings
    /\d+[,\d]*\+?\s*(?:hours?|days?|weeks?)/gi            // Time saved
];

/**
 * Extract all text content from CV data
 */
export function extractCVText(cvData) {
    const parts = [];
    
    // Personal info
    if (cvData.personalInfo) {
        parts.push(cvData.personalInfo.title || '');
    }
    
    // Summary
    if (cvData.summary) {
        parts.push(cvData.summary);
    }
    
    // Experience
    if (cvData.experience?.length) {
        cvData.experience.forEach(exp => {
            parts.push(exp.title || '');
            parts.push(exp.company || '');
            parts.push(exp.description || '');
            if (exp.bullets?.length) {
                parts.push(exp.bullets.join(' '));
            }
        });
    }
    
    // Education
    if (cvData.education?.length) {
        cvData.education.forEach(edu => {
            parts.push(edu.degree || '');
            parts.push(edu.field || '');
            parts.push(edu.school || '');
            parts.push(edu.honors || '');
        });
    }
    
    // Skills
    if (cvData.skills) {
        if (cvData.skills.technical?.length) {
            parts.push(cvData.skills.technical.join(' '));
        }
        if (cvData.skills.soft?.length) {
            parts.push(cvData.skills.soft.join(' '));
        }
        if (cvData.skills.languages?.length) {
            parts.push(cvData.skills.languages.join(' '));
        }
        if (cvData.skills.certifications?.length) {
            parts.push(cvData.skills.certifications.join(' '));
        }
    }
    
    // Certifications
    if (cvData.certifications?.length) {
        cvData.certifications.forEach(cert => {
            parts.push(cert.name || '');
            parts.push(cert.issuer || '');
        });
    }
    
    // Projects
    if (cvData.projects?.length) {
        cvData.projects.forEach(proj => {
            parts.push(proj.name || '');
            parts.push(proj.description || '');
            if (proj.technologies?.length) {
                parts.push(proj.technologies.join(' '));
            }
        });
    }
    
    return parts.filter(Boolean).join(' ').toLowerCase();
}

/**
 * Tokenize text into words and phrases
 */
export function tokenize(text) {
    const normalized = text.toLowerCase()
        .replace(/[^\w\s\-\.\/\+#]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    const words = normalized.split(' ').filter(w => w.length > 1);
    
    // Also extract 2-word and 3-word phrases
    const phrases = [];
    for (let i = 0; i < words.length - 1; i++) {
        phrases.push(words.slice(i, i + 2).join(' '));
        if (i < words.length - 2) {
            phrases.push(words.slice(i, i + 3).join(' '));
        }
    }
    
    return { words, phrases, all: [...new Set([...words, ...phrases])] };
}

/**
 * Extract keywords from job description
 */
export function extractJobKeywords(jobDescription) {
    const text = jobDescription.toLowerCase();
    const tokens = tokenize(text);
    
    const extracted = {
        technicalSkills: [],
        softSkills: [],
        tools: [],
        requirements: [],
        responsibilities: [],
        qualifications: [],
        experience: [],
        education: [],
        all: []
    };
    
    // Find technical skills
    Object.values(TECH_SKILLS_BY_DOMAIN).flat().forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (text.includes(skillLower)) {
            extracted.technicalSkills.push(skill);
        }
    });
    
    // Find soft skills
    SOFT_SKILLS.forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (text.includes(skillLower)) {
            extracted.softSkills.push(skill);
        }
    });
    
    // Find education requirements
    EDUCATION_KEYWORDS.forEach(keyword => {
        if (text.includes(keyword)) {
            extracted.education.push(keyword);
        }
    });
    
    // Extract years of experience requirements
    const expPatterns = [
        /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi,
        /(?:minimum|at least|min)\s*(\d+)\s*(?:years?|yrs?)/gi
    ];
    expPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            extracted.experience.push(...matches);
        }
    });
    
    // Extract specific requirement keywords
    const requirementIndicators = ['required', 'must have', 'essential', 'mandatory', 'needed'];
    const qualificationIndicators = ['preferred', 'nice to have', 'bonus', 'plus', 'desirable'];
    
    // Parse sections if structured
    const lines = jobDescription.split(/\n|\.|;/).filter(Boolean);
    lines.forEach(line => {
        const lineLower = line.toLowerCase();
        const hasRequirement = requirementIndicators.some(ind => lineLower.includes(ind));
        const hasQualification = qualificationIndicators.some(ind => lineLower.includes(ind));
        
        // Extract keywords from this line
        const lineTokens = tokenize(line);
        
        if (hasRequirement) {
            extracted.requirements.push(...lineTokens.words.filter(w => w.length > 3));
        }
        if (hasQualification) {
            extracted.qualifications.push(...lineTokens.words.filter(w => w.length > 3));
        }
    });
    
    // Deduplicate
    Object.keys(extracted).forEach(key => {
        extracted[key] = [...new Set(extracted[key])];
    });
    
    // Create combined unique keywords
    extracted.all = [...new Set([
        ...extracted.technicalSkills,
        ...extracted.softSkills,
        ...extracted.education,
        ...extracted.requirements.slice(0, 10),
        ...extracted.qualifications.slice(0, 10)
    ])];
    
    return extracted;
}

/**
 * Calculate keyword match score
 */
export function calculateKeywordMatch(cvText, jobKeywords) {
    const cvTextLower = cvText.toLowerCase();
    const matches = {
        found: [],
        missing: [],
        partial: []
    };
    
    const allKeywords = [
        ...jobKeywords.technicalSkills,
        ...jobKeywords.softSkills,
        ...jobKeywords.education.slice(0, 3)
    ];
    
    allKeywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        // Exact match
        if (cvTextLower.includes(keywordLower)) {
            matches.found.push(keyword);
        }
        // Partial match (word variations)
        else if (keywordLower.split(' ').some(word => cvTextLower.includes(word) && word.length > 3)) {
            matches.partial.push(keyword);
        }
        else {
            matches.missing.push(keyword);
        }
    });
    
    const totalKeywords = allKeywords.length || 1;
    const score = Math.round(
        ((matches.found.length + matches.partial.length * 0.5) / totalKeywords) * 100
    );
    
    return {
        score: Math.min(100, score),
        matches,
        totalKeywords
    };
}

/**
 * Analyze CV action verbs
 */
export function analyzeActionVerbs(cvText) {
    const cvTextLower = cvText.toLowerCase();
    const found = {
        strong: [],
        weak: [],
        byCategory: {}
    };
    
    // Check for strong action verbs
    Object.entries(ACTION_VERBS).forEach(([category, verbs]) => {
        found.byCategory[category] = [];
        verbs.forEach(verb => {
            if (cvTextLower.includes(verb)) {
                found.strong.push(verb);
                found.byCategory[category].push(verb);
            }
        });
    });
    
    // Check for weak/passive verbs
    const weakVerbs = ['responsible for', 'helped', 'assisted', 'worked on', 'participated', 'was involved', 'duties included'];
    weakVerbs.forEach(verb => {
        if (cvTextLower.includes(verb)) {
            found.weak.push(verb);
        }
    });
    
    return found;
}

/**
 * Analyze quantifiable achievements
 */
export function analyzeQuantifiableMetrics(cvText) {
    const metrics = {
        found: [],
        count: 0,
        types: {
            percentages: [],
            money: [],
            time: [],
            people: [],
            scale: []
        }
    };
    
    METRIC_PATTERNS.forEach((pattern, index) => {
        const matches = cvText.match(pattern);
        if (matches) {
            metrics.found.push(...matches);
            metrics.count += matches.length;
            
            // Categorize
            if (index === 0) metrics.types.percentages.push(...matches);
            else if (index === 1) metrics.types.money.push(...matches);
            else if (index === 2 || index === 3) metrics.types.time.push(...matches);
            else if (index === 4 || index === 5) metrics.types.people.push(...matches);
            else metrics.types.scale.push(...matches);
        }
    });
    
    // Deduplicate
    metrics.found = [...new Set(metrics.found)];
    
    return metrics;
}

/**
 * Analyze CV structure and formatting
 */
export function analyzeStructure(cvData) {
    const structure = {
        score: 100,
        issues: [],
        sections: {
            personalInfo: false,
            summary: false,
            experience: false,
            education: false,
            skills: false,
            certifications: false,
            projects: false
        },
        completeness: {}
    };
    
    // Check personal info
    if (cvData.personalInfo) {
        structure.sections.personalInfo = true;
        const pi = cvData.personalInfo;
        structure.completeness.personalInfo = {
            name: !!(pi.firstName && pi.lastName),
            email: !!pi.email,
            phone: !!pi.phone,
            location: !!pi.location,
            linkedin: !!pi.linkedin
        };
        
        if (!pi.email) {
            structure.issues.push('Missing email address');
            structure.score -= 10;
        }
        if (!pi.phone) {
            structure.issues.push('Missing phone number');
            structure.score -= 5;
        }
        if (!pi.linkedin) {
            structure.issues.push('Consider adding LinkedIn profile');
            structure.score -= 3;
        }
    } else {
        structure.issues.push('Missing personal information section');
        structure.score -= 20;
    }
    
    // Check summary
    if (cvData.summary && cvData.summary.length > 50) {
        structure.sections.summary = true;
        if (cvData.summary.length > 500) {
            structure.issues.push('Summary is too long (keep under 4 sentences)');
            structure.score -= 5;
        }
    } else {
        structure.issues.push('Add a professional summary (3-4 sentences)');
        structure.score -= 10;
    }
    
    // Check experience
    if (cvData.experience?.length > 0) {
        structure.sections.experience = true;
        const validExps = cvData.experience.filter(e => e.title && e.company);
        if (validExps.length === 0) {
            structure.issues.push('Experience entries missing job titles or companies');
            structure.score -= 10;
        }
        // Check for descriptions
        const withDescriptions = cvData.experience.filter(e => 
            (e.description && e.description.length > 50) || (e.bullets && e.bullets.length > 0)
        );
        if (withDescriptions.length < cvData.experience.length) {
            structure.issues.push('Add descriptions or bullet points to all experience entries');
            structure.score -= 5;
        }
    } else {
        structure.issues.push('Missing experience section');
        structure.score -= 15;
    }
    
    // Check education
    if (cvData.education?.length > 0) {
        structure.sections.education = true;
        const validEdus = cvData.education.filter(e => e.school || e.degree);
        if (validEdus.length === 0) {
            structure.issues.push('Education entries incomplete');
            structure.score -= 5;
        }
    } else {
        structure.issues.push('Consider adding education section');
        structure.score -= 5;
    }
    
    // Check skills
    if (cvData.skills) {
        const hasSkills = (cvData.skills.technical?.length > 0) || (cvData.skills.soft?.length > 0);
        if (hasSkills) {
            structure.sections.skills = true;
            if (!cvData.skills.technical?.length) {
                structure.issues.push('Add technical skills');
                structure.score -= 5;
            }
        } else {
            structure.issues.push('Add skills section');
            structure.score -= 10;
        }
    } else {
        structure.issues.push('Missing skills section');
        structure.score -= 10;
    }
    
    // Check certifications (optional but valued)
    if (cvData.certifications?.length > 0 || cvData.skills?.certifications?.length > 0) {
        structure.sections.certifications = true;
    }
    
    // Check projects (optional but valued for tech roles)
    if (cvData.projects?.length > 0) {
        structure.sections.projects = true;
    }
    
    structure.score = Math.max(0, structure.score);
    
    return structure;
}

/**
 * Calculate overall ATS compatibility score
 */
export function calculateATSScore(cvData, jobDescription = null) {
    const cvText = extractCVText(cvData);
    
    const analysis = {
        overallScore: 0,
        breakdown: {
            structure: 0,
            keywords: 0,
            actionVerbs: 0,
            metrics: 0,
            formatting: 0
        },
        details: {},
        suggestions: [],
        strengths: [],
        missingKeywords: [],
        matchedKeywords: []
    };
    
    // 1. Structure Analysis (25% of score)
    const structureAnalysis = analyzeStructure(cvData);
    analysis.breakdown.structure = structureAnalysis.score;
    analysis.details.structure = structureAnalysis;
    
    // Add structure issues as suggestions
    structureAnalysis.issues.forEach(issue => {
        analysis.suggestions.push(issue);
    });
    
    // 2. Action Verbs Analysis (15% of score)
    const verbAnalysis = analyzeActionVerbs(cvText);
    const verbScore = Math.min(100, verbAnalysis.strong.length * 10);
    analysis.breakdown.actionVerbs = verbScore;
    analysis.details.actionVerbs = verbAnalysis;
    
    if (verbAnalysis.strong.length > 5) {
        analysis.strengths.push(`Uses ${verbAnalysis.strong.length} strong action verbs`);
    }
    if (verbAnalysis.weak.length > 0) {
        analysis.suggestions.push(`Replace weak phrases like "${verbAnalysis.weak[0]}" with action verbs`);
    }
    if (verbAnalysis.strong.length < 5) {
        analysis.suggestions.push('Use more action verbs (led, developed, achieved, etc.)');
    }
    
    // 3. Quantifiable Metrics Analysis (15% of score)
    const metricsAnalysis = analyzeQuantifiableMetrics(cvText);
    const metricsScore = Math.min(100, metricsAnalysis.count * 15);
    analysis.breakdown.metrics = metricsScore;
    analysis.details.metrics = metricsAnalysis;
    
    if (metricsAnalysis.count >= 5) {
        analysis.strengths.push(`Includes ${metricsAnalysis.count} quantifiable achievements`);
    } else {
        analysis.suggestions.push('Add more quantifiable achievements (%, $, numbers)');
    }
    
    // 4. Formatting Score (15% of score) - Check for ATS-friendly format
    let formattingScore = 100;
    const formattingIssues = [];
    
    // Check for bullet points in experience
    const hasBullets = cvData.experience?.some(e => e.bullets?.length > 0 || e.description?.includes('•'));
    if (!hasBullets) {
        formattingScore -= 20;
        formattingIssues.push('Use bullet points for experience descriptions');
    }
    
    // Check section organization
    const sectionsPresent = Object.values(structureAnalysis.sections).filter(Boolean).length;
    if (sectionsPresent < 4) {
        formattingScore -= 15;
    }
    
    analysis.breakdown.formatting = Math.max(0, formattingScore);
    formattingIssues.forEach(issue => analysis.suggestions.push(issue));
    
    // 5. Keyword Match (30% of score) - Only if job description provided
    if (jobDescription) {
        const jobKeywords = extractJobKeywords(jobDescription);
        const keywordMatch = calculateKeywordMatch(cvText, jobKeywords);
        
        analysis.breakdown.keywords = keywordMatch.score;
        analysis.details.keywordMatch = keywordMatch;
        analysis.missingKeywords = keywordMatch.matches.missing;
        analysis.matchedKeywords = keywordMatch.matches.found;
        
        if (keywordMatch.matches.found.length > 5) {
            analysis.strengths.push(`Matches ${keywordMatch.matches.found.length} keywords from job posting`);
        }
        if (keywordMatch.matches.missing.length > 0) {
            analysis.suggestions.push(`Consider adding keywords: ${keywordMatch.matches.missing.slice(0, 5).join(', ')}`);
        }
        
        // Calculate weighted score with job description
        analysis.overallScore = Math.round(
            analysis.breakdown.structure * 0.20 +
            analysis.breakdown.keywords * 0.35 +
            analysis.breakdown.actionVerbs * 0.15 +
            analysis.breakdown.metrics * 0.15 +
            analysis.breakdown.formatting * 0.15
        );
    } else {
        // Without job description, use different weights
        analysis.breakdown.keywords = 70; // Default score
        analysis.overallScore = Math.round(
            analysis.breakdown.structure * 0.30 +
            analysis.breakdown.keywords * 0.20 +
            analysis.breakdown.actionVerbs * 0.20 +
            analysis.breakdown.metrics * 0.15 +
            analysis.breakdown.formatting * 0.15
        );
        
        // General keyword suggestions
        const techSkillsFound = [];
        Object.values(TECH_SKILLS_BY_DOMAIN).flat().forEach(skill => {
            if (cvText.includes(skill.toLowerCase())) {
                techSkillsFound.push(skill);
            }
        });
        
        if (techSkillsFound.length < 5) {
            analysis.suggestions.push('Add more industry-specific technical skills');
        } else {
            analysis.strengths.push(`Lists ${techSkillsFound.length} technical skills`);
        }
    }
    
    // Ensure score is within bounds
    analysis.overallScore = Math.max(0, Math.min(100, analysis.overallScore));
    
    // Deduplicate suggestions and strengths
    analysis.suggestions = [...new Set(analysis.suggestions)].slice(0, 8);
    analysis.strengths = [...new Set(analysis.strengths)].slice(0, 6);
    
    return analysis;
}

/**
 * Get keyword density analysis
 */
export function analyzeKeywordDensity(cvText, keywords) {
    const words = cvText.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    
    const density = {};
    keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        const count = (cvText.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length;
        density[keyword] = {
            count,
            percentage: ((count / totalWords) * 100).toFixed(2)
        };
    });
    
    return {
        totalWords,
        density,
        recommendations: getKeywordDensityRecommendations(density)
    };
}

/**
 * Get recommendations based on keyword density
 */
function getKeywordDensityRecommendations(density) {
    const recommendations = [];
    
    Object.entries(density).forEach(([keyword, data]) => {
        if (data.count === 0) {
            recommendations.push({
                type: 'missing',
                keyword,
                message: `"${keyword}" is not mentioned - consider adding it naturally`
            });
        } else if (data.count > 10) {
            recommendations.push({
                type: 'overused',
                keyword,
                message: `"${keyword}" appears ${data.count} times - may seem repetitive`
            });
        }
    });
    
    return recommendations;
}

/**
 * Compare CV against job requirements and return detailed match analysis
 */
export function compareToJob(cvData, jobDescription) {
    const cvText = extractCVText(cvData);
    const jobKeywords = extractJobKeywords(jobDescription);
    const keywordMatch = calculateKeywordMatch(cvText, jobKeywords);
    
    return {
        matchPercentage: keywordMatch.score,
        technicalMatch: {
            required: jobKeywords.technicalSkills,
            found: jobKeywords.technicalSkills.filter(skill => 
                cvText.includes(skill.toLowerCase())
            ),
            missing: jobKeywords.technicalSkills.filter(skill => 
                !cvText.includes(skill.toLowerCase())
            )
        },
        softSkillsMatch: {
            required: jobKeywords.softSkills,
            found: jobKeywords.softSkills.filter(skill => 
                cvText.includes(skill.toLowerCase())
            ),
            missing: jobKeywords.softSkills.filter(skill => 
                !cvText.includes(skill.toLowerCase())
            )
        },
        experienceMatch: {
            required: jobKeywords.experience,
            analysis: analyzeExperienceMatch(cvData, jobKeywords.experience)
        },
        educationMatch: {
            required: jobKeywords.education,
            found: jobKeywords.education.filter(keyword => 
                cvText.includes(keyword.toLowerCase())
            )
        },
        allKeywords: keywordMatch
    };
}

/**
 * Analyze if experience matches requirements
 */
function analyzeExperienceMatch(cvData, experienceRequirements) {
    const result = {
        meetsRequirements: false,
        totalYears: 0,
        details: []
    };
    
    // Calculate total years from experience
    if (cvData.experience?.length) {
        cvData.experience.forEach(exp => {
            const startYear = parseInt(exp.startDate?.match(/\d{4}/)?.[0] || '0');
            const endYear = exp.current ? new Date().getFullYear() : 
                          parseInt(exp.endDate?.match(/\d{4}/)?.[0] || '0');
            
            if (startYear && endYear) {
                result.totalYears += (endYear - startYear);
            }
        });
    }
    
    // Check against requirements
    experienceRequirements.forEach(req => {
        const yearsRequired = parseInt(req.match(/\d+/)?.[0] || '0');
        if (yearsRequired > 0) {
            result.details.push({
                requirement: req,
                yearsRequired,
                meets: result.totalYears >= yearsRequired
            });
            if (result.totalYears >= yearsRequired) {
                result.meetsRequirements = true;
            }
        }
    });
    
    return result;
}

/**
 * Export analysis as a report
 */
export function generateATSReport(analysis) {
    return {
        summary: {
            score: analysis.overallScore,
            grade: analysis.overallScore >= 80 ? 'A' : 
                   analysis.overallScore >= 70 ? 'B' :
                   analysis.overallScore >= 60 ? 'C' :
                   analysis.overallScore >= 50 ? 'D' : 'F',
            status: analysis.overallScore >= 70 ? 'ATS Ready' : 'Needs Improvement'
        },
        breakdown: analysis.breakdown,
        topStrengths: analysis.strengths.slice(0, 3),
        topImprovements: analysis.suggestions.slice(0, 5),
        keywordGaps: analysis.missingKeywords?.slice(0, 10) || [],
        matchedKeywords: analysis.matchedKeywords || []
    };
}
