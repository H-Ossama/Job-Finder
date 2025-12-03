import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the AI client
let genAI = null

function getAIClient() {
    if (!genAI) {
        const apiKey = process.env.GOOGLE_AI_API_KEY
        if (!apiKey) {
            throw new Error('GOOGLE_AI_API_KEY is not set in environment variables')
        }
        genAI = new GoogleGenerativeAI(apiKey)
    }
    return genAI
}

/**
 * Generate CV content from user input
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - The prompt for CV generation
 * @param {string} params.context - Additional context (job title, experience level, etc.)
 * @returns {Promise<string>} Generated content
 */
export async function generateCVContent({ prompt, context = '' }) {
    try {
        const ai = getAIClient()
        const model = ai.getGenerativeModel({ model: 'gemini-pro' })

        const fullPrompt = `${context}\n\n${prompt}\n\nProvide professional, ATS-compliant content. Be concise and impactful.`

        const result = await model.generateContent(fullPrompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('AI generation error:', error)
        throw new Error('Failed to generate CV content')
    }
}

/**
 * Improve existing CV content
 * @param {Object} params - Improvement parameters
 * @param {string} params.content - Current CV content
 * @param {string} params.section - Section to improve (summary, experience, etc.)
 * @returns {Promise<string>} Improved content
 */
export async function improveCVContent({ content, section }) {
    try {
        const ai = getAIClient()
        const model = ai.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `You are a professional CV writer and ATS optimization expert. 
        
Improve the following ${section} section of a CV:

${content}

Requirements:
- Make it more impactful and professional
- Optimize for ATS (Applicant Tracking Systems)
- Use strong action verbs
- Quantify achievements where possible
- Keep it concise and relevant
- Maintain professional tone

Provide ONLY the improved content, no explanations.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('AI improvement error:', error)
        throw new Error('Failed to improve CV content')
    }
}

/**
 * Generate a professional summary from user details
 * @param {Object} params - User details
 * @param {string} params.jobTitle - Target job title
 * @param {number} params.yearsExperience - Years of experience
 * @param {string[]} params.skills - Key skills
 * @param {string} params.industry - Industry/field
 * @returns {Promise<string>} Generated professional summary
 */
export async function generateProfessionalSummary({ jobTitle, yearsExperience, skills, industry }) {
    try {
        const ai = getAIClient()
        const model = ai.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `Generate a professional summary for a CV with the following details:
- Job Title: ${jobTitle}
- Years of Experience: ${yearsExperience}
- Key Skills: ${skills.join(', ')}
- Industry: ${industry}

Create a compelling 3-4 sentence professional summary that:
- Highlights key qualifications and experience
- Showcases relevant skills
- Demonstrates value proposition
- Is ATS-optimized
- Uses strong, professional language

Provide ONLY the summary text, no additional commentary.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('AI summary generation error:', error)
        throw new Error('Failed to generate professional summary')
    }
}

/**
 * Parse and extract structured data from CV text
 * @param {string} cvText - Raw CV text
 * @returns {Promise<Object>} Structured CV data
 */
export async function parseCV(cvText) {
    try {
        const ai = getAIClient()
        const model = ai.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `Extract structured information from the following CV text and return it as JSON:

${cvText}

Extract the following information:
{
  "personalInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": ""
  },
  "summary": "",
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "description": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "location": "",
      "graduationDate": "",
      "gpa": ""
    }
  ],
  "skills": [],
  "certifications": [],
  "languages": []
}

Return ONLY valid JSON, no markdown formatting or explanations.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Remove markdown code blocks if present
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        return JSON.parse(jsonText)
    } catch (error) {
        console.error('CV parsing error:', error)
        throw new Error('Failed to parse CV content')
    }
}
