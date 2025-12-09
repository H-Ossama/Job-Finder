import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { callOpenRouter } from '@/utils/ai/openrouter';

/**
 * Calculate job match percentage between user's CV and a job posting
 * Uses AI to analyze and caches results to prevent repeated calculations
 */

// GET - Get match score for a job (checks cache first)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json(
                { success: false, error: 'Job ID is required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if we have a cached match result
        const { data: cachedMatch, error: cacheError } = await supabase
            .from('job_matches')
            .select('*')
            .eq('user_id', user.id)
            .eq('job_id', jobId)
            .single();

        if (cachedMatch && !cacheError) {
            // Return cached result with experienceAnalysis from job_data if available
            return NextResponse.json({
                success: true,
                data: {
                    matchScore: cachedMatch.match_score,
                    analysis: cachedMatch.analysis,
                    experienceAnalysis: cachedMatch.job_data?.experienceAnalysis || null,
                    matchedSkills: cachedMatch.matched_skills,
                    missingSkills: cachedMatch.missing_skills,
                    recommendations: cachedMatch.recommendations,
                    cached: true,
                    calculatedAt: cachedMatch.created_at
                }
            });
        }

        // No cached result - return null (client should call POST to calculate)
        return NextResponse.json({
            success: true,
            data: null,
            message: 'No cached match found. Use POST to calculate match.'
        });

    } catch (error) {
        console.error('Error getting job match:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get job match' },
            { status: 500 }
        );
    }
}

// POST - Calculate match score using AI
export async function POST(request) {
    try {
        const body = await request.json();
        const { jobId } = body;

        if (!jobId) {
            return NextResponse.json(
                { success: false, error: 'Job ID is required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Please log in to see match percentage' },
                { status: 401 }
            );
        }

        // Check for existing cached result first
        const { data: existingMatch } = await supabase
            .from('job_matches')
            .select('*')
            .eq('user_id', user.id)
            .eq('job_id', jobId)
            .single();

        if (existingMatch) {
            return NextResponse.json({
                success: true,
                data: {
                    matchScore: existingMatch.match_score,
                    analysis: existingMatch.analysis,
                    experienceAnalysis: existingMatch.job_data?.experienceAnalysis || null,
                    matchedSkills: existingMatch.matched_skills,
                    missingSkills: existingMatch.missing_skills,
                    recommendations: existingMatch.recommendations,
                    cached: true,
                    calculatedAt: existingMatch.created_at
                }
            });
        }

        // Get user's primary CV
        const { data: cvData, error: cvError } = await supabase
            .from('cvs')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_primary', true)
            .single();

        if (cvError || !cvData) {
            // Try to get any CV
            const { data: anyCv } = await supabase
                .from('cvs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!anyCv) {
                return NextResponse.json({
                    success: false,
                    error: 'No CV found. Please create a CV first to see match percentage.',
                    requiresCV: true
                }, { status: 400 });
            }
        }

        const cv = cvData || (await supabase
            .from('cvs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()).data;

        if (!cv) {
            return NextResponse.json({
                success: false,
                error: 'No CV found. Please create a CV first.',
                requiresCV: true
            }, { status: 400 });
        }

        // Get job details - try jobs_cache first, then construct from jobId
        let jobData = null;
        
        // Check if jobId is in format source_externalId
        const [source, ...externalIdParts] = jobId.split('_');
        const externalId = externalIdParts.join('_');
        
        // Try to get from jobs_cache
        const { data: cachedJob } = await supabase
            .from('jobs_cache')
            .select('*')
            .eq('id', jobId)
            .single();

        if (cachedJob) {
            jobData = cachedJob;
        } else {
            // Try by external_id and source
            const { data: jobByExternal } = await supabase
                .from('jobs_cache')
                .select('*')
                .eq('external_id', externalId)
                .eq('source', source)
                .single();

            jobData = jobByExternal;
        }

        // If no job found in cache, we need the job data from request
        if (!jobData && body.jobData) {
            jobData = body.jobData;
        }

        if (!jobData) {
            return NextResponse.json({
                success: false,
                error: 'Job not found. Please provide job data.'
            }, { status: 404 });
        }

        // Use AI to calculate match
        const matchResult = await calculateMatchWithAI(cv.content, jobData);

        // Cache the result - try to save but don't fail if table doesn't exist
        try {
            await supabase
                .from('job_matches')
                .upsert({
                    user_id: user.id,
                    job_id: jobId,
                    cv_id: cv.id,
                    match_score: matchResult.matchScore,
                    analysis: matchResult.analysis,
                    matched_skills: matchResult.matchedSkills,
                    missing_skills: matchResult.missingSkills,
                    recommendations: matchResult.recommendations,
                    job_data: {
                        title: jobData.title,
                        company: jobData.company,
                        description: jobData.description?.substring(0, 500),
                        experienceAnalysis: matchResult.experienceAnalysis
                    }
                }, {
                    onConflict: 'user_id,job_id'
                });
        } catch (cacheError) {
            // If table doesn't exist, just continue without caching
            console.warn('Could not cache match result:', cacheError.message);
        }

        return NextResponse.json({
            success: true,
            data: {
                matchScore: matchResult.matchScore,
                analysis: matchResult.analysis,
                experienceAnalysis: matchResult.experienceAnalysis,
                matchedSkills: matchResult.matchedSkills,
                missingSkills: matchResult.missingSkills,
                recommendations: matchResult.recommendations,
                cached: false,
                calculatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error calculating job match:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to calculate job match' },
            { status: 500 }
        );
    }
}

/**
 * Calculate match percentage using AI
 */
async function calculateMatchWithAI(cvContent, jobData) {
    // Calculate user's total years of experience
    const userExperience = calculateTotalExperience(cvContent);
    
    // Extract required experience from job
    const requiredExperience = extractRequiredExperience(jobData);
    
    // Determine if this is an entry-level/no-experience job
    const isEntryLevel = requiredExperience.noExperienceRequired || requiredExperience.years === 0;
    
    const experienceGuidance = isEntryLevel 
        ? `IMPORTANT: This is an ENTRY-LEVEL position that requires NO prior experience. 
           The candidate's ${userExperience.totalYears} years of experience (even if 0) is acceptable.
           For entry-level jobs, focus heavily on: enthusiasm, willingness to learn, relevant education, 
           transferable skills, and any academic/personal projects rather than work experience.`
        : `Job requires ${requiredExperience.years} years of experience.
           Candidate has ${userExperience.totalYears} years of experience.`;
    
    const systemPrompt = `You are an expert HR professional and ATS system analyst. Your task is to analyze how well a candidate's CV matches a job posting.

${experienceGuidance}

SCORING METHODOLOGY:
1. EXPERIENCE MATCH (${isEntryLevel ? '20%' : '40%'} weight):
${isEntryLevel 
    ? `   - This is an ENTRY-LEVEL job - NO experience required
   - ANY experience (including 0) is acceptable
   - Focus on: academic projects, internships, volunteer work, personal projects
   - Give FULL POINTS if candidate shows willingness to learn`
    : `   - Compare candidate's total years of experience (${userExperience.totalYears} years) against job requirement (${requiredExperience.years} years)
   - If candidate meets or exceeds: Full points
   - If slightly under (within 1-2 years): Partial points
   - If significantly under: Lower points
   - Also consider RELEVANT experience in the specific field`}

2. SKILLS MATCH (${isEntryLevel ? '40%' : '35%'} weight):
   - Technical skills alignment
   - Tool and technology proficiency
   - Industry-specific knowledge
   ${isEntryLevel ? '- Academic coursework and self-learning count heavily' : ''}

3. EDUCATION & QUALIFICATIONS (${isEntryLevel ? '25%' : '15%'} weight):
   - Degree requirements
   - Certifications
   - Training
   ${isEntryLevel ? '- Recent graduates with relevant degrees are strong candidates' : ''}

4. SOFT SKILLS & CULTURE FIT (${isEntryLevel ? '15%' : '10%'} weight):
   - Communication
   - Leadership indicators
   - Team collaboration
   ${isEntryLevel ? '- Enthusiasm and willingness to learn are key' : ''}

Return a JSON object with:
{
    "matchScore": <number 0-100>,
    "analysis": "Brief 2-3 sentence analysis of overall fit",
    "experienceAnalysis": {
        "userYears": ${userExperience.totalYears},
        "requiredYears": ${requiredExperience.years},
        "meetsRequirement": <boolean>,
        "experienceGap": <number - positive if user has more, negative if less>,
        "relevantExperience": "assessment of how relevant their experience is",
        "isEntryLevel": ${isEntryLevel}
    },
    "matchedSkills": ["skill1", "skill2", ...],
    "missingSkills": ["skill1", "skill2", ...],
    "recommendations": ["recommendation1", "recommendation2", ...]
}

Be realistic with scoring:
${isEntryLevel ? `
FOR ENTRY-LEVEL/NO EXPERIENCE JOBS:
- 85-100: Excellent match - has relevant education, skills, or projects; shows enthusiasm
- 70-84: Strong match - meets education requirements, has some relevant skills/projects
- 55-69: Good match - basic qualifications met, could learn on the job
- 40-54: Potential match - limited relevant background but willing to learn
- Below 40: May need more preparation before applying
` : `
FOR EXPERIENCED POSITIONS:
- 90-100: Excellent match - meets or exceeds all requirements including experience
- 75-89: Strong match - meets most key requirements, experience is adequate
- 60-74: Good match - meets some requirements, may be slightly under on experience
- 40-59: Partial match - has some relevant experience but gaps exist
- Below 40: Weak match - significant gaps in requirements or experience
`}

IMPORTANT: Return ONLY valid JSON, no other text.`;

    // Build detailed CV summary with experience breakdown
    const experienceDetails = cvContent?.experience?.map(e => {
        const startYear = e.startDate?.match(/\d{4}/)?.[0] || '';
        const endYear = e.current ? 'Present' : (e.endDate?.match(/\d{4}/)?.[0] || '');
        const duration = calculateJobDuration(e.startDate, e.endDate, e.current);
        return `- ${e.title} at ${e.company} (${startYear}-${endYear}, ~${duration} years): ${e.description || e.bullets?.join('. ') || ''}`;
    }).join('\n') || 'No experience listed';

    const cvSummary = typeof cvContent === 'string' 
        ? cvContent 
        : `
=== CANDIDATE PROFILE ===
Name: ${cvContent?.personalInfo?.firstName || ''} ${cvContent?.personalInfo?.lastName || ''}
Current Title: ${cvContent?.personalInfo?.title || ''}
Summary: ${cvContent?.summary || ''}

=== TOTAL EXPERIENCE: ${userExperience.totalYears} YEARS ===
${experienceDetails}

=== SKILLS ===
Technical: ${cvContent?.skills?.technical?.join(', ') || 'Not specified'}
Soft Skills: ${cvContent?.skills?.soft?.join(', ') || 'Not specified'}
Languages: ${cvContent?.skills?.languages?.join(', ') || ''}
Tools: ${cvContent?.skills?.tools?.join(', ') || ''}

=== EDUCATION ===
${cvContent?.education?.map(e => `${e.degree} in ${e.field} from ${e.school} (${e.year || e.endDate || ''})`).join('\n') || 'Not specified'}

=== CERTIFICATIONS ===
${cvContent?.skills?.certifications?.join(', ') || cvContent?.certifications?.map(c => c.name || c).join(', ') || 'None listed'}
`;

    // Build job summary with clear experience requirements
    const jobSummary = `
=== JOB POSTING ===
Title: ${jobData.title || 'Unknown'}
Company: ${jobData.company || 'Unknown'}
Location: ${jobData.location || 'Not specified'}
Job Type: ${jobData.job_type || jobData.jobType || 'Full-time'}
${isEntryLevel ? '*** THIS IS AN ENTRY-LEVEL POSITION - NO EXPERIENCE REQUIRED ***' : ''}

=== EXPERIENCE REQUIRED: ${requiredExperience.noExperienceRequired ? 'NONE (Entry Level)' : `${requiredExperience.years} YEARS`} (${requiredExperience.level || 'Not specified'}) ===
${requiredExperience.details || (isEntryLevel ? 'No prior experience required' : 'See description for details')}

=== JOB DESCRIPTION ===
${(jobData.description || '').substring(0, 2500)}

=== REQUIRED SKILLS ===
${jobData.skills?.join(', ') || jobData.tags?.join(', ') || 'See description'}
`;

    const prompt = `Analyze this CV against the job posting.
${isEntryLevel 
    ? `IMPORTANT: This is an ENTRY-LEVEL position that does NOT require prior work experience.
The candidate's lack of experience should NOT count against them. Focus on skills, education, and potential.`
    : `Pay special attention to the experience comparison.
The candidate has ${userExperience.totalYears} years of total experience.
The job requires ${requiredExperience.years} years of experience.`}

${cvSummary}

${jobSummary}

Calculate the match score ${isEntryLevel ? 'focusing on skills and potential rather than experience' : 'considering the experience gap and skill alignment'}. Return only JSON.`;

    try {
        const response = await callOpenRouter({
            prompt,
            systemPrompt,
            model: 'anthropic/claude-3-haiku'
        });

        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return {
                matchScore: Math.min(100, Math.max(0, result.matchScore || (isEntryLevel ? 75 : 65))),
                analysis: result.analysis || 'Analysis not available',
                experienceAnalysis: result.experienceAnalysis || {
                    userYears: userExperience.totalYears,
                    requiredYears: requiredExperience.years,
                    meetsRequirement: isEntryLevel || userExperience.totalYears >= requiredExperience.years,
                    experienceGap: userExperience.totalYears - requiredExperience.years,
                    isEntryLevel: isEntryLevel
                },
                matchedSkills: result.matchedSkills || [],
                missingSkills: result.missingSkills || [],
                recommendations: result.recommendations || []
            };
        }

        throw new Error('Invalid AI response');
    } catch (error) {
        console.error('AI match calculation error:', error);
        // Return a default response with experience info on error
        // For entry-level jobs, default to higher score since experience isn't required
        return {
            matchScore: isEntryLevel ? 75 : 65,
            analysis: isEntryLevel 
                ? 'This is an entry-level position. Focus on demonstrating your skills and enthusiasm.'
                : 'Unable to calculate detailed match. Please ensure your CV is complete.',
            experienceAnalysis: {
                userYears: userExperience.totalYears,
                requiredYears: requiredExperience.years,
                meetsRequirement: isEntryLevel || userExperience.totalYears >= requiredExperience.years,
                experienceGap: userExperience.totalYears - requiredExperience.years,
                isEntryLevel: isEntryLevel
            },
            matchedSkills: [],
            missingSkills: [],
            recommendations: isEntryLevel 
                ? ['Highlight relevant coursework and projects', 'Emphasize your eagerness to learn']
                : ['Complete your CV profile for better matching']
        };
    }
}

/**
 * Calculate total years of experience from CV
 */
function calculateTotalExperience(cvContent) {
    const result = {
        totalYears: 0,
        breakdown: []
    };

    if (!cvContent?.experience?.length) {
        return result;
    }

    cvContent.experience.forEach(exp => {
        const duration = calculateJobDuration(exp.startDate, exp.endDate, exp.current);
        result.totalYears += duration;
        result.breakdown.push({
            title: exp.title,
            company: exp.company,
            years: duration
        });
    });

    // Round to 1 decimal place
    result.totalYears = Math.round(result.totalYears * 10) / 10;
    
    return result;
}

/**
 * Calculate duration of a single job in years
 */
function calculateJobDuration(startDate, endDate, isCurrent) {
    if (!startDate) return 0;

    const startYear = parseInt(startDate.match(/\d{4}/)?.[0] || '0');
    const startMonth = parseInt(startDate.match(/(\d{1,2})\//)?.[1] || startDate.match(/-(\d{2})-/)?.[1] || '1');
    
    let endYear, endMonth;
    
    if (isCurrent) {
        const now = new Date();
        endYear = now.getFullYear();
        endMonth = now.getMonth() + 1;
    } else if (endDate) {
        endYear = parseInt(endDate.match(/\d{4}/)?.[0] || '0');
        endMonth = parseInt(endDate.match(/(\d{1,2})\//)?.[1] || endDate.match(/-(\d{2})-/)?.[1] || '12');
    } else {
        return 0;
    }

    if (!startYear || !endYear) return 0;

    const years = (endYear - startYear) + (endMonth - startMonth) / 12;
    return Math.max(0, Math.round(years * 10) / 10);
}

/**
 * Extract required experience from job posting
 */
function extractRequiredExperience(jobData) {
    const result = {
        years: 0,
        level: jobData.experience_level || jobData.experienceLevel || '',
        details: '',
        noExperienceRequired: false
    };

    // Try to extract from description and title
    const description = (jobData.description || '').toLowerCase();
    const title = (jobData.title || '').toLowerCase();
    const combinedText = `${title} ${description}`;
    
    // FIRST: Try to extract explicit year requirements from description
    // This takes priority over any "entry level" text that might appear
    const yearPatterns = [
        /(\d+)\s*(?:to|-)\s*(\d+)\s*years?/gi,        // 3-5 years, 3 to 5 years, 8-10 years
        /(\d+)\+\s*years?/gi,                          // 5+ years
        /minimum\s*(?:of\s*)?(\d+)\s*years?/gi,       // minimum 5 years
        /at\s*least\s*(\d+)\s*years?/gi,              // at least 5 years
        /(\d+)\s*years?\s*(?:of\s*)?(?:relevant\s*)?experience/gi,  // 5 years of experience
        /experience[:\s]+(\d+)\+?\s*years?/gi,        // experience: 5+ years
        /experience\s*\(?in\s*yrs?\)?[:\s]*(\d+)\s*(?:to|-)\s*(\d+)/gi  // Experience (in Yrs) 8-10
    ];

    for (const pattern of yearPatterns) {
        const matches = [...combinedText.matchAll(pattern)];
        for (const match of matches) {
            let years;
            if (match[2]) {
                // Range like 3-5 years - take the lower bound for requirement check
                years = parseInt(match[1]);
                result.details = `${match[1]}-${match[2]} years required`;
            } else {
                years = parseInt(match[1]);
                result.details = `${years}+ years required`;
            }
            
            if (years > result.years && years <= 20) { // Sanity check, max 20 years
                result.years = years;
            }
        }
    }
    
    // If we found explicit year requirements > 0, this is NOT entry level
    if (result.years > 0) {
        // Determine level based on years
        if (result.years >= 10) {
            result.level = 'Senior/Lead';
        } else if (result.years >= 5) {
            result.level = 'Senior';
        } else if (result.years >= 3) {
            result.level = 'Mid-Level';
        } else {
            result.level = 'Junior';
        }
        return result;
    }
    
    // ONLY if no years found, check for explicit "no experience" indicators
    const noExperiencePatterns = [
        /no\s*experience\s*(needed|required|necessary)/i,
        /experience\s*not\s*(needed|required|necessary)/i,
        /without\s*experience/i,
        /no\s*prior\s*experience/i,
        /beginners?\s*welcome/i,
        /open\s*to\s*(all|beginners?|freshers?)/i,
        /anyone\s*can\s*apply/i,
        /freshers?\s*(welcome|encouraged)/i,
        /will\s*train/i,
        /training\s*provided/i,
        /0\s*years?\s*(of\s*)?experience/i,
        /zero\s*(years?)?\s*(of\s*)?experience/i
    ];
    
    for (const pattern of noExperiencePatterns) {
        if (pattern.test(combinedText)) {
            result.years = 0;
            result.level = 'Entry Level';
            result.details = 'No experience required';
            result.noExperienceRequired = true;
            return result;
        }
    }
    
    // Check title for entry-level indicators ONLY if no years were specified
    if (title.match(/\b(entry[\s-]?level|junior|jr\.?|intern|trainee|graduate|fresher|beginner)\b/i)) {
        result.years = 0;
        result.level = 'Entry Level';
        result.details = 'Entry level position';
        result.noExperienceRequired = true;
        return result;
    }

    // Map experience level to years (from job metadata)
    const levelToYears = {
        'entry': 0,
        'entry-level': 0,
        'entry_level': 0,
        'junior': 1,
        'mid': 3,
        'mid-level': 3,
        'intermediate': 3,
        'senior': 5,
        'senior-level': 5,
        'lead': 7,
        'principal': 8,
        'staff': 8,
        'manager': 5,
        'director': 10,
        'executive': 10,
        'vp': 12
    };

    // Check experience level from job metadata
    if (result.level) {
        const normalizedLevel = result.level.toLowerCase().replace(/[_-]/g, '-');
        if (levelToYears.hasOwnProperty(normalizedLevel)) {
            result.years = levelToYears[normalizedLevel];
            if (result.years === 0) {
                result.noExperienceRequired = true;
                result.details = 'Entry level position';
            }
        }
    }

    // If still no years found, infer from title keywords
    if (result.years === 0 && !result.noExperienceRequired) {
        if (title.includes('senior') || title.includes('sr.') || title.includes('sr ')) {
            result.years = 5;
            result.level = 'Senior';
        } else if (title.includes('lead') || title.includes('principal')) {
            result.years = 7;
            result.level = 'Lead';
        } else {
            // Default: Don't assume experience required - leave as 0 (unspecified)
            result.years = 0;
            result.level = 'Not Specified';
            result.details = 'Experience requirements not specified';
        }
    }

    return result;
}
