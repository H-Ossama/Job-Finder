/**
 * OpenRouter AI Client for CV Builder
 * Uses OpenRouter API for AI-powered CV generation and optimization
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Make a request to OpenRouter API
 * @param {Object} options - Request options
 * @param {string} options.prompt - The user prompt
 * @param {string} options.systemPrompt - The system prompt
 * @param {string} options.model - The model to use (default: anthropic/claude-3-haiku)
 * @returns {Promise<string>} The AI response
 */
async function callOpenRouter({ prompt, systemPrompt, model = 'anthropic/claude-3-haiku' }) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not set in environment variables');
    }

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'CareerForge CV Builder'
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

/**
 * Generate a professional summary for a CV
 * @param {Object} params - Parameters for generation
 * @returns {Promise<string>} Generated professional summary
 */
export async function generateProfessionalSummary({ jobTitle, yearsExperience, skills, industry, targetRole }) {
    const systemPrompt = `You are an expert CV writer and ATS (Applicant Tracking System) optimization specialist. 
Your task is to write professional summaries that:
- Are highly optimized for ATS scanning
- Include relevant keywords naturally
- Are concise (3-4 sentences max)
- Highlight quantifiable achievements
- Use strong action verbs
- Are tailored to the target role

Always write in first person without using "I" at the start of sentences.
Focus on value proposition and unique selling points.`;

    const prompt = `Write a professional summary for a CV with these details:
- Current/Target Job Title: ${jobTitle || 'Professional'}
- Years of Experience: ${yearsExperience || 'Several'}
- Key Skills: ${skills?.join(', ') || 'Various professional skills'}
- Industry: ${industry || 'Technology'}
- Target Role: ${targetRole || jobTitle || 'Similar position'}

Create a compelling, ATS-optimized professional summary. Provide ONLY the summary text, no explanations or formatting.`;

    return callOpenRouter({ prompt, systemPrompt });
}

/**
 * Improve existing CV content for better ATS compatibility
 * @param {Object} params - Parameters for improvement
 * @returns {Promise<string>} Improved content
 */
export async function improveCVContent({ content, section, targetRole, keywords }) {
    const systemPrompt = `You are an expert CV writer specializing in ATS optimization.
Your improvements should:
- Increase ATS compatibility and keyword density
- Use strong action verbs (Led, Developed, Implemented, Achieved, etc.)
- Quantify achievements with numbers when possible
- Remove weak phrases and filler words
- Maintain professional tone
- Keep content concise and impactful

Never change factual information, only improve the writing.`;

    const prompt = `Improve this ${section} section for better ATS compatibility:

Original content:
${content}

${targetRole ? `Target Role: ${targetRole}` : ''}
${keywords?.length ? `Keywords to incorporate naturally: ${keywords.join(', ')}` : ''}

Provide ONLY the improved content, maintaining the same structure but with better wording.`;

    return callOpenRouter({ prompt, systemPrompt });
}

/**
 * Generate job description bullet points
 * @param {Object} params - Job details
 * @returns {Promise<string[]>} Array of bullet points
 */
export async function generateJobBulletPoints({ jobTitle, company, responsibilities, achievements, skills }) {
    const systemPrompt = `You are an expert CV writer. Generate impactful bullet points for job experience that:
- Start with strong action verbs (Spearheaded, Engineered, Orchestrated, etc.)
- Include quantifiable results (%, $, numbers)
- Are ATS-optimized with relevant keywords
- Follow STAR format (Situation, Task, Action, Result)
- Are 1-2 lines each, maximum 3 lines

Format: Return ONLY a JSON array of strings, each being one bullet point.`;

    const prompt = `Generate 4-6 impactful bullet points for this job experience:

Job Title: ${jobTitle}
Company: ${company}
Key Responsibilities: ${responsibilities || 'General duties'}
Notable Achievements: ${achievements || 'Various accomplishments'}
Skills Used: ${skills?.join(', ') || 'Various skills'}

Return a JSON array of bullet point strings. Example format: ["Bullet 1", "Bullet 2"]`;

    const response = await callOpenRouter({ prompt, systemPrompt });
    
    try {
        // Try to parse JSON response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        // Fallback: split by newlines
        return response.split('\n').filter(line => line.trim().length > 0);
    } catch {
        return response.split('\n').filter(line => line.trim().length > 0);
    }
}

/**
 * Analyze CV for ATS compatibility and generate score
 * @param {Object} cvData - The complete CV data
 * @param {string} targetJobDescription - Optional job description to match against
 * @returns {Promise<Object>} ATS analysis results
 */
export async function analyzeATSCompatibility(cvData, targetJobDescription = null) {
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyst and professional resume reviewer with 15+ years of experience in HR and recruiting technology.

Your task is to perform a COMPREHENSIVE and PRECISE analysis of the CV for ATS compatibility. Be SPECIFIC, DETAILED, and ACTIONABLE in your feedback.

SCORING METHODOLOGY (Be strict and precise):
1. STRUCTURE (0-100): Section organization, clear headings, contact info completeness, chronological order, consistent formatting
2. KEYWORDS (0-100): Industry-relevant terms, job-specific skills, technical terminology, role-appropriate language
3. ACTION_VERBS (0-100): Strong action verbs at bullet start (led, developed, achieved), avoid passive voice, quantified statements
4. METRICS (0-100): Quantifiable achievements (%, $, numbers), specific results, measurable impact statements
5. FORMATTING (0-100): ATS-parseable format, standard sections, bullet point usage, appropriate length

ANALYSIS REQUIREMENTS:
- Identify SPECIFIC missing keywords that ATS systems look for
- Provide CONCRETE suggestions with examples (e.g., "Change 'Responsible for managing' to 'Managed team of 8 engineers'")
- List ACTUAL strengths found in the CV (not generic compliments)
- Point out SPECIFIC weak areas with improvement recommendations
- If job description is provided, calculate EXACT keyword match percentage

Return ONLY a valid JSON object with this structure:
{
    "score": <number 0-100, weighted average>,
    "breakdown": {
        "structure": <number 0-100>,
        "keywords": <number 0-100>,
        "actionVerbs": <number 0-100>,
        "metrics": <number 0-100>,
        "formatting": <number 0-100>
    },
    "keywordAnalysis": {
        "found": ["keyword1", "keyword2"],
        "missing": ["keyword1", "keyword2"],
        "density": "assessment of keyword density"
    },
    "actionVerbAnalysis": {
        "strong": ["verb1", "verb2"],
        "weak": ["phrase1", "phrase2"],
        "suggestions": ["Replace X with Y"]
    },
    "metricsAnalysis": {
        "found": ["metric1", "metric2"],
        "missingOpportunities": ["Could quantify X", "Add numbers to Y"]
    },
    "missingKeywords": ["specific keyword 1", "specific keyword 2"],
    "suggestions": [
        "Specific actionable suggestion 1",
        "Specific actionable suggestion 2"
    ],
    "strengths": [
        "Specific strength 1",
        "Specific strength 2"
    ],
    "improvements": [
        "Specific improvement area 1",
        "Specific improvement area 2"
    ],
    "industryFit": "Brief assessment of industry alignment",
    "atsReadiness": "Ready|Needs Minor Tweaks|Needs Significant Improvement|Not ATS Ready"
}`;

    // Build comprehensive CV summary
    const experienceDetails = cvData.experience?.map(e => {
        let details = `\n  - ${e.title} at ${e.company} (${e.startDate || ''} - ${e.endDate || 'Present'})`;
        if (e.description) details += `\n    Description: ${e.description}`;
        if (e.bullets?.length) details += `\n    Bullets: ${e.bullets.join(' | ')}`;
        return details;
    }).join('') || 'None listed';

    const educationDetails = cvData.education?.map(e => 
        `${e.degree}${e.field ? ' in ' + e.field : ''} from ${e.school} (${e.endDate || 'N/A'})`
    ).join('; ') || 'None listed';

    const cvSummary = `
=== CV DATA FOR ANALYSIS ===

PERSONAL INFO:
- Name: ${cvData.personalInfo?.firstName || ''} ${cvData.personalInfo?.lastName || ''}
- Title: ${cvData.personalInfo?.title || 'Not specified'}
- Email: ${cvData.personalInfo?.email || 'Not provided'}
- Phone: ${cvData.personalInfo?.phone || 'Not provided'}
- Location: ${cvData.personalInfo?.location || 'Not provided'}
- LinkedIn: ${cvData.personalInfo?.linkedin || 'Not provided'}
- GitHub: ${cvData.personalInfo?.github || 'Not provided'}

PROFESSIONAL SUMMARY:
${cvData.summary || 'No summary provided'}

WORK EXPERIENCE:${experienceDetails}

EDUCATION:
${educationDetails}

SKILLS:
- Technical: ${cvData.skills?.technical?.join(', ') || 'None listed'}
- Soft Skills: ${cvData.skills?.soft?.join(', ') || 'None listed'}
- Languages: ${cvData.skills?.languages?.join(', ') || 'None listed'}

CERTIFICATIONS:
${cvData.certifications?.map(c => c.name || c).join(', ') || cvData.skills?.certifications?.join(', ') || 'None listed'}

PROJECTS:
${cvData.projects?.map(p => `${p.name}: ${p.description || ''} (${p.technologies?.join(', ') || 'No tech listed'})`).join('\n') || 'None listed'}
`;

    let prompt;
    if (targetJobDescription) {
        prompt = `Analyze this CV for ATS compatibility WITH the target job description.

${cvSummary}

=== TARGET JOB DESCRIPTION ===
${targetJobDescription}

CRITICAL: 
1. Compare the CV against the job description keyword-by-keyword
2. Calculate exact match percentage for required skills
3. Identify ALL missing keywords that appear in the job description but not in the CV
4. Provide job-specific improvement suggestions

Return a detailed JSON analysis.`;
    } else {
        prompt = `Analyze this CV for general ATS compatibility (no specific job target).

${cvSummary}

Analyze for:
1. General ATS parsing compatibility
2. Industry-standard keyword presence
3. Professional formatting and structure
4. Action verb usage and quantifiable achievements

Return a detailed JSON analysis.`;
    }

    const response = await callOpenRouter({ prompt, systemPrompt, model: 'anthropic/claude-3-haiku' });
    
    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            // Ensure all required fields exist
            return {
                score: analysis.score || 70,
                breakdown: {
                    structure: analysis.breakdown?.structure || analysis.breakdown?.format || 70,
                    keywords: analysis.breakdown?.keywords || 65,
                    actionVerbs: analysis.breakdown?.actionVerbs || analysis.breakdown?.content || 70,
                    metrics: analysis.breakdown?.metrics || 65,
                    formatting: analysis.breakdown?.formatting || 75
                },
                keywordAnalysis: analysis.keywordAnalysis || { found: [], missing: [], density: 'Not analyzed' },
                actionVerbAnalysis: analysis.actionVerbAnalysis || { strong: [], weak: [], suggestions: [] },
                metricsAnalysis: analysis.metricsAnalysis || { found: [], missingOpportunities: [] },
                missingKeywords: analysis.missingKeywords || analysis.keywordAnalysis?.missing || [],
                suggestions: analysis.suggestions || [],
                strengths: analysis.strengths || [],
                improvements: analysis.improvements || [],
                industryFit: analysis.industryFit || 'General professional profile',
                atsReadiness: analysis.atsReadiness || 'Needs Review'
            };
        }
        throw new Error('No valid JSON found');
    } catch (error) {
        console.error('ATS analysis parsing error:', error);
        // Return default analysis if parsing fails
        return {
            score: 65,
            breakdown: { structure: 70, keywords: 60, actionVerbs: 65, metrics: 55, formatting: 70 },
            keywordAnalysis: { found: [], missing: [], density: 'Unable to analyze' },
            actionVerbAnalysis: { strong: [], weak: [], suggestions: [] },
            metricsAnalysis: { found: [], missingOpportunities: [] },
            missingKeywords: [],
            suggestions: ['Add more quantifiable achievements with specific numbers', 'Include industry-specific keywords', 'Use strong action verbs at the start of bullet points'],
            strengths: ['CV structure is present'],
            improvements: ['Enhance professional summary with key achievements', 'Add more technical skills relevant to your target role'],
            industryFit: 'Unable to determine',
            atsReadiness: 'Needs Review'
        };
    }
}

/**
 * Extract keywords from a job description for CV optimization
 * @param {string} jobDescription - The job description text
 * @returns {Promise<Object>} Extracted keywords categorized
 */
export async function extractJobKeywords(jobDescription) {
    const systemPrompt = `You are an expert ATS keyword analyst and recruiting specialist. Your task is to extract ALL relevant keywords from a job description that a candidate should include in their CV/resume.

EXTRACTION METHODOLOGY:
1. TECHNICAL SKILLS: Programming languages, frameworks, tools, technologies, platforms (e.g., Python, React, AWS, Docker)
2. SOFT SKILLS: Interpersonal and professional abilities (e.g., leadership, communication, problem-solving)
3. TOOLS & SOFTWARE: Specific applications, platforms, systems (e.g., Salesforce, Jira, Figma, SAP)
4. CERTIFICATIONS: Required or preferred certifications (e.g., PMP, AWS Certified, CPA)
5. EXPERIENCE KEYWORDS: Industry-specific terms, methodologies (e.g., Agile, CI/CD, machine learning)
6. INDUSTRY TERMS: Domain-specific vocabulary and buzzwords
7. ACTION VERBS: Key verbs that indicate desired activities (e.g., manage, develop, lead, analyze)
8. REQUIREMENTS: Specific experience levels, education, clearances

IMPORTANT:
- Extract EXACT keywords as they appear (preserve casing for technologies)
- Include variations (e.g., "JavaScript" and "JS")
- Identify REQUIRED vs PREFERRED keywords
- Weight keywords by frequency and prominence in the job description

Return a JSON object with this structure:
{
    "technicalSkills": ["skill1", "skill2"],
    "softSkills": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "certifications": ["cert1", "cert2"],
    "experienceKeywords": ["keyword1", "keyword2"],
    "industryTerms": ["term1", "term2"],
    "actionVerbs": ["verb1", "verb2"],
    "required": {
        "skills": ["skill1"],
        "experience": ["requirement1"],
        "education": ["degree1"]
    },
    "preferred": {
        "skills": ["skill1"],
        "experience": ["nice-to-have1"]
    },
    "yearsExperience": "X+ years if mentioned",
    "educationLevel": "Degree level if mentioned",
    "keyPhrases": ["important multi-word phrase 1", "phrase 2"]
}`;

    const prompt = `Extract ALL ATS-relevant keywords from this job description. Be thorough and precise.

=== JOB DESCRIPTION ===
${jobDescription}
=== END JOB DESCRIPTION ===

Instructions:
1. Extract every relevant keyword, skill, and requirement
2. Categorize them accurately
3. Identify which are required vs preferred
4. Include industry jargon and technical terms
5. Note specific experience requirements

Return ONLY a valid JSON object.`;

    const response = await callOpenRouter({ prompt, systemPrompt, model: 'anthropic/claude-3-haiku' });
    
    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const extracted = JSON.parse(jsonMatch[0]);
            // Ensure all fields exist
            return {
                technicalSkills: extracted.technicalSkills || [],
                softSkills: extracted.softSkills || [],
                tools: extracted.tools || [],
                certifications: extracted.certifications || [],
                experienceKeywords: extracted.experienceKeywords || [],
                industryTerms: extracted.industryTerms || [],
                actionVerbs: extracted.actionVerbs || [],
                required: extracted.required || { skills: [], experience: [], education: [] },
                preferred: extracted.preferred || { skills: [], experience: [] },
                yearsExperience: extracted.yearsExperience || 'Not specified',
                educationLevel: extracted.educationLevel || 'Not specified',
                keyPhrases: extracted.keyPhrases || []
            };
        }
        throw new Error('No valid JSON found');
    } catch (error) {
        console.error('Keyword extraction error:', error);
        return {
            technicalSkills: [],
            softSkills: [],
            tools: [],
            certifications: [],
            experienceKeywords: [],
            industryTerms: [],
            actionVerbs: [],
            required: { skills: [], experience: [], education: [] },
            preferred: { skills: [], experience: [] },
            yearsExperience: 'Not specified',
            educationLevel: 'Not specified',
            keyPhrases: []
        };
    }
}

/**
 * Generate a complete CV section
 * @param {Object} params - Generation parameters
 * @returns {Promise<string>} Generated content
 */
export async function generateCVSection({ section, context, existingData }) {
    const systemPrompt = `You are an expert CV writer creating ATS-optimized content.
Focus on:
- Clarity and conciseness
- Industry-relevant keywords
- Quantifiable achievements
- Professional tone
- Action-oriented language`;

    let prompt;
    
    switch (section) {
        case 'summary':
            prompt = `Generate a professional summary based on: ${JSON.stringify(context)}`;
            break;
        case 'experience':
            prompt = `Generate experience bullet points for: ${JSON.stringify(context)}`;
            break;
        case 'skills':
            prompt = `Suggest relevant skills for a ${context.jobTitle} role in ${context.industry}`;
            break;
        default:
            prompt = `Generate ${section} content: ${JSON.stringify(context)}`;
    }

    return callOpenRouter({ prompt, systemPrompt });
}

/**
 * Tailor CV content to a specific job posting
 * @param {Object} cvData - Current CV data
 * @param {string} jobDescription - Target job description
 * @returns {Promise<Object>} Tailored CV suggestions
 */
export async function tailorCVToJob(cvData, jobDescription) {
    const systemPrompt = `You are an expert at tailoring CVs for specific job applications.
Analyze the CV and job description, then provide specific recommendations to increase match rate.

Return a JSON object with:
{
    "matchScore": <number 0-100>,
    "summaryRevision": "suggested new summary",
    "skillsToHighlight": ["skill1", "skill2"],
    "skillsToAdd": ["skill1", "skill2"],
    "experienceEnhancements": [
        {"position": "Job Title", "suggestions": ["suggestion1"]}
    ],
    "keywordsToAdd": ["keyword1", "keyword2"],
    "overallFeedback": "brief overall assessment"
}`;

    const prompt = `Tailor this CV for the job posting:

CV Data:
${JSON.stringify(cvData, null, 2)}

Job Description:
${jobDescription}

Provide specific, actionable tailoring suggestions as a JSON object.`;

    const response = await callOpenRouter({ prompt, systemPrompt });
    
    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No valid JSON found');
    } catch {
        return {
            matchScore: 65,
            summaryRevision: '',
            skillsToHighlight: [],
            skillsToAdd: [],
            experienceEnhancements: [],
            keywordsToAdd: [],
            overallFeedback: 'Unable to analyze. Please try again.'
        };
    }
}

/**
 * Parse and extract structured data from CV text
 * @param {string} cvText - Raw CV text extracted from PDF/DOCX
 * @returns {Promise<Object>} Structured CV data
 */
export async function parseCV(cvText) {
    const systemPrompt = `You are an expert CV/Resume parser. Your task is to extract ALL information from a CV text and return it as a structured JSON object.

CRITICAL INSTRUCTIONS:
1. Extract ALL information present in the CV - do not skip or summarize anything
2. For education: SEPARATE the degree type (e.g., "Bachelor of Science", "Master's", "PhD") from the field of study (e.g., "Computer Science", "Business Administration")
3. For certifications: Extract ALL certifications, licenses, and professional credentials mentioned anywhere in the CV
4. For projects: Extract ALL projects including personal projects, academic projects, portfolio projects mentioned
5. Parse dates in a consistent format (MM/YYYY or YYYY)
6. If information is not available, use empty string "" or empty array []

Return a JSON object with this EXACT structure:

{
  "personalInfo": {
    "firstName": "first name only",
    "lastName": "last name only",
    "email": "email address",
    "phone": "phone number",
    "location": "city, state/country",
    "linkedin": "linkedin URL or username",
    "github": "github URL or username",
    "website": "personal website URL",
    "title": "current job title or professional title"
  },
  "summary": "professional summary or objective statement",
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "location": "job location",
      "startDate": "start date (MM/YYYY or YYYY)",
      "endDate": "end date (MM/YYYY or YYYY) or 'Present' if current",
      "current": true/false,
      "description": "job description and achievements as bullet points or paragraph"
    }
  ],
  "education": [
    {
      "school": "institution name",
      "degree": "degree type only (e.g., Bachelor of Science, Master of Arts, PhD, High School Diploma)",
      "field": "field of study/major (e.g., Computer Science, Business, Engineering)",
      "startDate": "start year",
      "endDate": "graduation year",
      "gpa": "GPA if mentioned",
      "honors": "honors, awards, or distinctions"
    }
  ],
  "skills": {
    "technical": ["programming languages", "frameworks", "tools", "technologies"],
    "soft": ["communication", "leadership", "teamwork", etc.],
    "languages": ["spoken languages with proficiency level"]
  },
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "date": "date obtained",
      "expiry": "expiration date if applicable",
      "credentialId": "credential ID if mentioned"
    }
  ],
  "projects": [
    {
      "name": "project name",
      "description": "project description",
      "technologies": ["technologies used"],
      "link": "project URL if mentioned",
      "date": "project date or duration"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object. No markdown code blocks, no explanations, just pure valid JSON.`;

    const prompt = `Parse this CV/Resume text and extract ALL information into the specified JSON structure. Be thorough and extract every piece of information:

---CV TEXT START---
${cvText}
---CV TEXT END---

Remember:
- Separate degree TYPE from field of STUDY in education
- Extract ALL certifications mentioned anywhere
- Extract ALL projects mentioned
- Include all skills, technical and soft
- Return valid JSON only`;

    try {
        const response = await callOpenRouter({ 
            prompt, 
            systemPrompt,
            model: 'anthropic/claude-3-haiku' 
        });

        // Clean up response - remove markdown code blocks if present
        let jsonText = response.trim();
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Try to find JSON object in the response
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
        }

        const parsedData = JSON.parse(jsonText);
        
        // Transform certifications to match the expected format if they came as strings
        let certifications = [];
        if (Array.isArray(parsedData.certifications)) {
            certifications = parsedData.certifications.map(cert => {
                if (typeof cert === 'string') {
                    return { name: cert, issuer: '', date: '', expiry: '', credentialId: '' };
                }
                return cert;
            });
        }

        // Transform projects to ensure proper structure
        let projects = [];
        if (Array.isArray(parsedData.projects)) {
            projects = parsedData.projects.map((project, index) => {
                if (typeof project === 'string') {
                    return { 
                        id: Date.now() + index, 
                        name: project, 
                        description: '', 
                        technologies: [], 
                        link: '', 
                        date: '' 
                    };
                }
                return { 
                    id: Date.now() + index, 
                    ...project,
                    technologies: Array.isArray(project.technologies) ? project.technologies : []
                };
            });
        }

        // Transform education to ensure field is separated from degree
        let education = [];
        if (Array.isArray(parsedData.education)) {
            education = parsedData.education.map((edu, index) => ({
                id: Date.now() + index,
                school: edu.school || edu.institution || '',
                degree: edu.degree || '',
                field: edu.field || edu.major || edu.fieldOfStudy || '',
                startDate: edu.startDate || '',
                endDate: edu.endDate || edu.graduationDate || '',
                gpa: edu.gpa || '',
                honors: edu.honors || ''
            }));
        }

        // Transform experience
        let experience = [];
        if (Array.isArray(parsedData.experience)) {
            experience = parsedData.experience.map((exp, index) => ({
                id: Date.now() + index,
                title: exp.title || exp.position || '',
                company: exp.company || exp.employer || '',
                location: exp.location || '',
                startDate: exp.startDate || '',
                endDate: exp.endDate || '',
                current: exp.current || exp.endDate?.toLowerCase() === 'present' || false,
                description: exp.description || '',
                bullets: Array.isArray(exp.bullets) ? exp.bullets : []
            }));
        }

        // Ensure the structure matches what we expect
        return {
            personalInfo: {
                firstName: parsedData.personalInfo?.firstName || '',
                lastName: parsedData.personalInfo?.lastName || '',
                email: parsedData.personalInfo?.email || '',
                phone: parsedData.personalInfo?.phone || '',
                location: parsedData.personalInfo?.location || '',
                linkedin: parsedData.personalInfo?.linkedin || '',
                github: parsedData.personalInfo?.github || '',
                website: parsedData.personalInfo?.website || '',
                title: parsedData.personalInfo?.title || ''
            },
            summary: parsedData.summary || '',
            experience: experience.length > 0 ? experience : [{ id: Date.now(), company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '', bullets: [] }],
            education: education.length > 0 ? education : [{ id: Date.now(), school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', honors: '' }],
            skills: {
                technical: Array.isArray(parsedData.skills?.technical) ? parsedData.skills.technical : [],
                soft: Array.isArray(parsedData.skills?.soft) ? parsedData.skills.soft : [],
                languages: Array.isArray(parsedData.skills?.languages) ? parsedData.skills.languages : [],
                certifications: certifications.map(c => typeof c === 'object' ? c.name : c)
            },
            certifications: certifications,
            projects: projects
        };
    } catch (error) {
        console.error('CV parsing error:', error);
        throw new Error('Failed to parse CV content: ' + error.message);
    }
}

export { callOpenRouter };
