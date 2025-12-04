/**
 * Gemini AI Integration for CV Analysis
 * Uses Gemini 2.5 Flash for accurate ATS scoring, keyword analysis, and improvements
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Make a request to Gemini API
 */
async function callGemini(prompt, options = {}) {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: options.temperature || 0.3,
                    topK: options.topK || 40,
                    topP: options.topP || 0.95,
                    maxOutputTokens: options.maxTokens || 4096,
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Gemini API error:', error);
            throw new Error(error.error?.message || 'Gemini API request failed');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            throw new Error('No response from Gemini');
        }

        return text;
    } catch (error) {
        console.error('Error calling Gemini:', error);
        throw error;
    }
}

/**
 * Parse JSON from Gemini response (handles markdown code blocks)
 */
function parseGeminiJSON(text) {
    try {
        // Remove markdown code blocks if present
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.slice(7);
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.slice(3);
        }
        if (cleaned.endsWith('```')) {
            cleaned = cleaned.slice(0, -3);
        }
        return JSON.parse(cleaned.trim());
    } catch (error) {
        console.error('Failed to parse Gemini response as JSON:', text);
        throw new Error('Invalid JSON response from Gemini');
    }
}

/**
 * Analyze CV for ATS compatibility and get comprehensive scoring
 */
export async function analyzeCV(cvData, jobDescription = null) {
    const cvText = formatCVForAnalysis(cvData);
    
    const prompt = `You are an expert ATS (Applicant Tracking System) analyst and professional resume reviewer with 15+ years of experience in HR and recruitment.

Analyze the following CV/Resume and provide a comprehensive, accurate assessment.

${jobDescription ? `TARGET JOB DESCRIPTION:
${jobDescription}

` : ''}CV CONTENT:
${cvText}

Provide your analysis in the following JSON format ONLY (no additional text):
{
    "atsScore": <number 0-100>,
    "atsScoreReason": "<detailed explanation of why this ATS score was given>",
    "keywordScore": <number 0-100>,
    "keywordScoreReason": "<detailed explanation of keyword coverage and relevance>",
    "breakdown": {
        "formatting": {
            "score": <number 0-100>,
            "details": "<explanation>"
        },
        "content": {
            "score": <number 0-100>,
            "details": "<explanation>"
        },
        "keywords": {
            "score": <number 0-100>,
            "details": "<explanation>"
        },
        "structure": {
            "score": <number 0-100>,
            "details": "<explanation>"
        },
        "impact": {
            "score": <number 0-100>,
            "details": "<explanation of quantifiable achievements and action verbs>"
        }
    },
    "keywords": {
        "found": ["<list of relevant keywords/skills found in CV>"],
        "missing": ["<important keywords that should be added>"],
        "suggested": ["<additional recommended keywords for this field>"]
    },
    "improvements": [
        {
            "priority": "high|medium|low",
            "title": "<short title>",
            "description": "<detailed actionable suggestion>",
            "impact": "<potential score improvement, e.g. '+5-10 points'>"
        }
    ],
    "strengths": ["<list of CV strengths>"],
    "summary": "<2-3 sentence overall assessment>"
}

SCORING CRITERIA:
- ATS Score: Consider parsability, standard formatting, keyword presence, section organization, file compatibility
- Keyword Score: Relevance to industry, technical skills coverage, soft skills, action verbs usage
- Be strict but fair - most CVs score between 50-85
- Only exceptional CVs should score above 90
- CVs with significant issues should score below 50

Provide at least 5 specific, actionable improvements prioritized by impact.`;

    try {
        const response = await callGemini(prompt);
        return parseGeminiJSON(response);
    } catch (error) {
        console.error('Error analyzing CV with Gemini:', error);
        throw error;
    }
}

/**
 * Extract and analyze keywords from CV against a job description
 */
export async function analyzeKeywords(cvData, jobDescription) {
    const cvText = formatCVForAnalysis(cvData);
    
    const prompt = `You are an expert keyword analyst for ATS systems. Compare the CV against the job description and provide detailed keyword analysis.

JOB DESCRIPTION:
${jobDescription}

CV CONTENT:
${cvText}

Respond with ONLY this JSON format:
{
    "matchScore": <number 0-100>,
    "matchScoreReason": "<explanation of the match percentage>",
    "requiredKeywords": {
        "found": ["<required keywords from job description found in CV>"],
        "missing": ["<required keywords from job description NOT in CV>"]
    },
    "preferredKeywords": {
        "found": ["<preferred/nice-to-have keywords found>"],
        "missing": ["<preferred keywords not found>"]
    },
    "technicalSkills": {
        "matched": ["<technical skills that match>"],
        "gap": ["<technical skills to add>"]
    },
    "softSkills": {
        "matched": ["<soft skills present>"],
        "gap": ["<soft skills to add>"]
    },
    "suggestions": [
        {
            "keyword": "<keyword to add>",
            "importance": "critical|important|helpful",
            "context": "<how/where to incorporate this keyword>"
        }
    ]
}`;

    try {
        const response = await callGemini(prompt);
        return parseGeminiJSON(response);
    } catch (error) {
        console.error('Error analyzing keywords with Gemini:', error);
        throw error;
    }
}

/**
 * Generate improvement suggestions for a CV
 */
export async function generateImprovements(cvData, targetRole = null) {
    const cvText = formatCVForAnalysis(cvData);
    
    const prompt = `You are a senior career coach and CV optimization expert. Analyze this CV and provide specific, actionable improvements.

${targetRole ? `TARGET ROLE: ${targetRole}\n\n` : ''}CV CONTENT:
${cvText}

Provide improvements in this JSON format ONLY:
{
    "criticalIssues": [
        {
            "issue": "<description of critical problem>",
            "solution": "<specific fix>",
            "example": "<before/after example if applicable>"
        }
    ],
    "improvements": [
        {
            "priority": "high|medium|low",
            "category": "content|formatting|keywords|impact|structure",
            "title": "<short title>",
            "description": "<detailed suggestion>",
            "impact": "<expected improvement>",
            "howTo": "<step by step how to implement>"
        }
    ],
    "quickWins": ["<easy changes that make immediate impact>"],
    "sectionFeedback": {
        "summary": "<feedback on professional summary>",
        "experience": "<feedback on work experience section>",
        "skills": "<feedback on skills section>",
        "education": "<feedback on education section>",
        "projects": "<feedback on projects if present>"
    }
}

Focus on:
1. ATS optimization
2. Quantifiable achievements
3. Action verb usage
4. Keyword optimization
5. Professional formatting
6. Content relevance`;

    try {
        const response = await callGemini(prompt);
        return parseGeminiJSON(response);
    } catch (error) {
        console.error('Error generating improvements with Gemini:', error);
        throw error;
    }
}

/**
 * Format CV data into readable text for analysis
 */
function formatCVForAnalysis(cvData) {
    const parts = [];
    
    // Personal Info
    if (cvData.personalInfo) {
        const pi = cvData.personalInfo;
        parts.push('=== PERSONAL INFORMATION ===');
        if (pi.firstName || pi.lastName) parts.push(`Name: ${pi.firstName || ''} ${pi.lastName || ''}`);
        if (pi.title) parts.push(`Title: ${pi.title}`);
        if (pi.email) parts.push(`Email: ${pi.email}`);
        if (pi.phone) parts.push(`Phone: ${pi.phone}`);
        if (pi.location) parts.push(`Location: ${pi.location}`);
        if (pi.linkedin) parts.push(`LinkedIn: ${pi.linkedin}`);
        if (pi.github) parts.push(`GitHub: ${pi.github}`);
        if (pi.website) parts.push(`Website: ${pi.website}`);
        parts.push('');
    }
    
    // Summary
    if (cvData.summary) {
        parts.push('=== PROFESSIONAL SUMMARY ===');
        parts.push(cvData.summary);
        parts.push('');
    }
    
    // Experience
    if (cvData.experience && cvData.experience.length > 0) {
        parts.push('=== WORK EXPERIENCE ===');
        cvData.experience.forEach(exp => {
            if (exp.title || exp.company) {
                parts.push(`${exp.title || 'Position'} at ${exp.company || 'Company'}`);
                if (exp.location) parts.push(`Location: ${exp.location}`);
                if (exp.startDate || exp.endDate) {
                    parts.push(`Duration: ${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}`);
                }
                if (exp.description) parts.push(`Description: ${exp.description}`);
                if (exp.bullets && exp.bullets.length > 0) {
                    exp.bullets.forEach(bullet => parts.push(`• ${bullet}`));
                }
                parts.push('');
            }
        });
    }
    
    // Education
    if (cvData.education && cvData.education.length > 0) {
        parts.push('=== EDUCATION ===');
        cvData.education.forEach(edu => {
            if (edu.school || edu.degree) {
                parts.push(`${edu.degree || 'Degree'} in ${edu.field || 'Field'}`);
                parts.push(`${edu.school || 'Institution'}`);
                if (edu.startDate || edu.endDate) {
                    parts.push(`${edu.startDate || ''} - ${edu.endDate || ''}`);
                }
                if (edu.gpa) parts.push(`GPA: ${edu.gpa}`);
                if (edu.honors) parts.push(`Honors: ${edu.honors}`);
                parts.push('');
            }
        });
    }
    
    // Skills
    if (cvData.skills) {
        parts.push('=== SKILLS ===');
        if (cvData.skills.technical && cvData.skills.technical.length > 0) {
            parts.push(`Technical Skills: ${cvData.skills.technical.join(', ')}`);
        }
        if (cvData.skills.soft && cvData.skills.soft.length > 0) {
            parts.push(`Soft Skills: ${cvData.skills.soft.join(', ')}`);
        }
        if (cvData.skills.languages && cvData.skills.languages.length > 0) {
            parts.push(`Languages: ${cvData.skills.languages.join(', ')}`);
        }
        if (cvData.skills.certifications && cvData.skills.certifications.length > 0) {
            parts.push(`Certifications: ${cvData.skills.certifications.join(', ')}`);
        }
        parts.push('');
    }
    
    // Projects
    if (cvData.projects && cvData.projects.length > 0) {
        parts.push('=== PROJECTS ===');
        cvData.projects.forEach(proj => {
            if (proj.name) {
                parts.push(`Project: ${proj.name}`);
                if (proj.description) parts.push(`Description: ${proj.description}`);
                if (proj.technologies && proj.technologies.length > 0) {
                    parts.push(`Technologies: ${proj.technologies.join(', ')}`);
                }
                if (proj.link) parts.push(`Link: ${proj.link}`);
                if (proj.date) parts.push(`Date: ${proj.date}`);
                parts.push('');
            }
        });
    }
    
    // Certifications (detailed)
    if (cvData.certifications && cvData.certifications.length > 0) {
        parts.push('=== CERTIFICATIONS ===');
        cvData.certifications.forEach(cert => {
            const certName = typeof cert === 'string' ? cert : cert.name;
            if (certName) {
                parts.push(`• ${certName}`);
                if (cert.issuer) parts.push(`  Issuer: ${cert.issuer}`);
                if (cert.date) parts.push(`  Date: ${cert.date}`);
            }
        });
        parts.push('');
    }
    
    return parts.join('\n');
}

export default {
    analyzeCV,
    analyzeKeywords,
    generateImprovements
};
