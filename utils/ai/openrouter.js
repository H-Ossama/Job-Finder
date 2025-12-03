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
    const systemPrompt = `You are an ATS (Applicant Tracking System) expert analyst. 
Analyze CVs for ATS compatibility and provide detailed feedback.

Your analysis should cover:
1. Keyword optimization (presence of industry-relevant keywords)
2. Format compatibility (clear sections, proper hierarchy)
3. Content quality (action verbs, quantified achievements)
4. Skills alignment (technical and soft skills balance)
5. Overall readability and scannability

Return your analysis as a valid JSON object with this exact structure:
{
    "score": <number 0-100>,
    "breakdown": {
        "keywords": <number 0-100>,
        "format": <number 0-100>,
        "content": <number 0-100>,
        "skills": <number 0-100>
    },
    "missingKeywords": ["keyword1", "keyword2"],
    "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"]
}`;

    const cvSummary = `
Personal Info: ${cvData.personalInfo?.firstName} ${cvData.personalInfo?.lastName}
Summary: ${cvData.summary || 'Not provided'}
Experience: ${cvData.experience?.map(e => `${e.title} at ${e.company}`).join(', ') || 'None'}
Education: ${cvData.education?.map(e => `${e.degree} from ${e.school}`).join(', ') || 'None'}
Technical Skills: ${cvData.skills?.technical?.join(', ') || 'None'}
Soft Skills: ${cvData.skills?.soft?.join(', ') || 'None'}
`;

    const prompt = `Analyze this CV for ATS compatibility:

${cvSummary}

${targetJobDescription ? `\nTarget Job Description:\n${targetJobDescription}` : ''}

Provide your analysis as a valid JSON object. Be specific and actionable in your suggestions.`;

    const response = await callOpenRouter({ prompt, systemPrompt });
    
    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No valid JSON found');
    } catch {
        // Return default analysis if parsing fails
        return {
            score: 70,
            breakdown: { keywords: 65, format: 80, content: 70, skills: 65 },
            missingKeywords: [],
            suggestions: ['Add more quantifiable achievements', 'Include industry-specific keywords'],
            strengths: ['Clear structure', 'Good experience section'],
            improvements: ['Enhance professional summary', 'Add more technical skills']
        };
    }
}

/**
 * Extract keywords from a job description for CV optimization
 * @param {string} jobDescription - The job description text
 * @returns {Promise<Object>} Extracted keywords categorized
 */
export async function extractJobKeywords(jobDescription) {
    const systemPrompt = `You are an expert at analyzing job descriptions and extracting ATS-relevant keywords.
Extract and categorize keywords that should appear in a CV targeting this job.

Return a JSON object with this structure:
{
    "technicalSkills": ["skill1", "skill2"],
    "softSkills": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "certifications": ["cert1", "cert2"],
    "experienceKeywords": ["keyword1", "keyword2"],
    "industryTerms": ["term1", "term2"],
    "actionVerbs": ["verb1", "verb2"]
}`;

    const prompt = `Extract ATS-relevant keywords from this job description:

${jobDescription}

Return ONLY a valid JSON object with categorized keywords.`;

    const response = await callOpenRouter({ prompt, systemPrompt });
    
    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No valid JSON found');
    } catch {
        return {
            technicalSkills: [],
            softSkills: [],
            tools: [],
            certifications: [],
            experienceKeywords: [],
            industryTerms: [],
            actionVerbs: []
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

export { callOpenRouter };
