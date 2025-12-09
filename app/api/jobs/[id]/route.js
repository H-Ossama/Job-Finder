/**
 * Job Details API Endpoint
 * GET /api/jobs/[id]
 * 
 * Fetches a single job by ID
 */

import { NextResponse } from 'next/server';
import { getCachedJobById } from '@/utils/jobs/cache';
import { getJobById, fetchJobDirectly } from '@/utils/jobs';
import { detectSmartTips } from '@/utils/jobs/smartTipDetector';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Job ID is required',
            }, { status: 400 });
        }

        // Decode the job ID (it may be URL encoded, especially for JSearch IDs with special chars)
        const jobId = decodeURIComponent(id);

        // Try to get from cache first
        let job = await getCachedJobById(jobId);
        
        // If not in cache, fetch from provider
        if (!job) {
            job = await getJobById(jobId);
        }
        
        // If still no job, try to fetch directly from the source provider
        if (!job) {
            job = await fetchJobDirectly(jobId);
        }
        
        // If still no job, return 404 error
        if (!job) {
            // Parse the job ID to get source for better error message
            const underscoreIndex = jobId.indexOf('_');
            const source = underscoreIndex !== -1 ? jobId.substring(0, underscoreIndex) : 'unknown';
            
            // Provide more specific message for Morocco jobs
            const isMoroccoJob = source === 'morocco' || jobId.startsWith('morocco_');
            const sourceDisplayName = isMoroccoJob 
                ? 'Morocco job sites' 
                : source === 'remoteok' ? 'Remote OK'
                : source === 'adzuna' ? 'Adzuna'
                : source === 'jsearch' ? 'JSearch'
                : source === 'themuse' ? 'The Muse'
                : source;
            
            const message = isMoroccoJob
                ? 'This job from Morocco may no longer be available. Morocco jobs are scraped from external sites and may expire quickly. Try searching again to find fresh listings.'
                : `This job from ${sourceDisplayName} may no longer be available or has expired. Try searching for similar positions.`;
            
            return NextResponse.json({
                success: false,
                error: 'Job not found',
                message,
                source: sourceDisplayName,
                isMoroccoJob,
            }, { status: 404 });
        }

        // Generate additional data for the job details page
        const enrichedJob = enrichJobDetails(job);

        return NextResponse.json({
            success: true,
            data: { job: enrichedJob },
        });

    } catch (error) {
        console.error('Job details API error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch job details',
            message: error.message,
        }, { status: 500 });
    }
}

/**
 * Enrich job details with additional computed/default data
 */
function enrichJobDetails(job) {
    // Generate company colors based on company name
    const companyColors = generateCompanyColors(job.company);
    
    // Sanitize HTML in description
    const sanitizedDescription = sanitizeJobDescription(job.description);
    
    // Detect smart tips (hidden keywords for application)
    const smartTips = detectSmartTips(job.description);
    
    // Extract requirements from description if not present
    const requirements = job.requirements?.length > 0 
        ? job.requirements 
        : extractRequirements(job.description);
    
    // Generate nice-to-have from description
    const niceToHave = extractNiceToHave(job.description);
    
    // Generate responsibilities from description
    const responsibilities = extractResponsibilities(job.description);
    
    // Default benefits if not provided
    const benefits = job.benefits?.length > 0 ? job.benefits : generateDefaultBenefits(job);
    
    // Calculate match score (placeholder - would be based on user profile)
    const matchScore = calculateMatchScore(job);
    
    return {
        ...job,
        description: sanitizedDescription, // Use sanitized description
        companyLogo: job.companyLogo || job.company?.[0]?.toUpperCase(),
        companyColors,
        companyDescription: `${job.company} is a company in the ${job.industry || 'technology'} industry.`,
        companySize: job.companySize || 'Unknown',
        companyLocation: job.location,
        companyWebsite: job.companyWebsite || '',
        industry: job.industry || 'Technology',
        locationType: job.locationType || 'onsite',
        jobType: job.jobType || 'full-time',
        experience: formatExperience(job.experienceLevel, job.description, job.title),
        experienceLevel: formatExperience(job.experienceLevel, job.description, job.title),
        matchScore,
        postedAt: job.postedAt, // Keep original ISO string for client-side formatting
        postedAtFormatted: formatPostedDate(job.postedAt), // Pre-formatted for display
        responsibilities,
        requirements: requirements.slice(0, 6),
        niceToHave: niceToHave.slice(0, 4),
        benefits: formatBenefits(benefits),
        skills: formatSkills(job.skills || []),
        similarJobs: [], // Would be populated from search
        tags: generateTags(job),
        url: job.applyUrl || job.url || '#', // Ensure url is available
        applyUrl: job.applyUrl || job.url || '#',
        smartTips: smartTips.found ? smartTips.tips : [], // Add smart tips
    };
}

function generateCompanyColors(companyName) {
    // Generate consistent colors based on company name
    const hash = companyName.split('').reduce((acc, char) => 
        char.charCodeAt(0) + ((acc << 5) - acc), 0
    );
    
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 30) % 360;
    
    return [
        `hsl(${hue1}, 70%, 50%)`,
        `hsl(${hue2}, 70%, 40%)`,
    ];
}

function extractRequirements(description) {
    if (!description) return [];
    
    const requirements = [];
    const lines = description.split(/[\n.]/);
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^\d+\+?\s*years?/i) ||
            trimmed.match(/experience\s+(with|in)/i) ||
            trimmed.match(/proficiency\s+in/i) ||
            trimmed.match(/knowledge\s+of/i) ||
            trimmed.match(/bachelor|master|degree/i) ||
            trimmed.match(/strong\s+skills/i)) {
            requirements.push(trimmed);
        }
    }
    
    return requirements.length > 0 ? requirements : [
        'Relevant experience in the field',
        'Strong problem-solving skills',
        'Excellent communication skills',
        'Ability to work in a team environment',
    ];
}

function extractNiceToHave(description) {
    if (!description) return [];
    
    const niceToHave = [];
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('preferred') || lowerDesc.includes('nice to have') || lowerDesc.includes('bonus')) {
        const lines = description.split(/[\n.]/);
        let inPreferred = false;
        
        for (const line of lines) {
            if (line.toLowerCase().includes('preferred') || 
                line.toLowerCase().includes('nice to have') ||
                line.toLowerCase().includes('bonus')) {
                inPreferred = true;
            }
            if (inPreferred && line.trim()) {
                niceToHave.push(line.trim());
            }
        }
    }
    
    return niceToHave.length > 0 ? niceToHave : [
        'Experience with related technologies',
        'Open source contributions',
        'Previous experience in similar role',
    ];
}

function extractResponsibilities(description) {
    if (!description) return [];
    
    const responsibilities = [];
    const lines = description.split(/[\n.]/);
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^(you will|you'll|responsibilities include|duties|what you'll do)/i) ||
            trimmed.match(/^[-•*]\s*.+/)) {
            responsibilities.push(trimmed.replace(/^[-•*]\s*/, ''));
        }
    }
    
    return responsibilities.length > 0 ? responsibilities : [
        'Work on challenging technical problems',
        'Collaborate with cross-functional teams',
        'Contribute to code reviews and best practices',
        'Help design and implement new features',
    ];
}

function generateDefaultBenefits(job) {
    const benefits = [];
    
    if (job.salary || job.salaryMin) {
        benefits.push({ icon: 'dollar', text: 'Competitive salary', color: 'green' });
    }
    if (job.locationType === 'remote' || job.location?.toLowerCase().includes('remote')) {
        benefits.push({ icon: 'home', text: 'Remote work', color: 'purple' });
    }
    
    benefits.push(
        { icon: 'shield', text: 'Health insurance', color: 'blue' },
        { icon: 'calendar', text: 'Paid time off', color: 'cyan' },
    );
    
    return benefits;
}

function formatBenefits(benefits) {
    if (!benefits || benefits.length === 0) return [];
    
    // If benefits are strings, convert to objects
    if (typeof benefits[0] === 'string') {
        const iconMap = {
            'health': 'shield',
            'insurance': 'shield',
            'remote': 'home',
            'salary': 'dollar',
            'pto': 'calendar',
            'vacation': 'calendar',
            'learning': 'book',
            'wellness': 'heart',
        };
        
        return benefits.map(benefit => {
            const lowerBenefit = benefit.toLowerCase();
            let icon = 'star';
            let color = 'indigo';
            
            for (const [key, value] of Object.entries(iconMap)) {
                if (lowerBenefit.includes(key)) {
                    icon = value;
                    break;
                }
            }
            
            return { icon, text: benefit, color };
        });
    }
    
    return benefits;
}

function formatSkills(skills) {
    return skills.map(skill => ({
        name: skill,
        match: Math.random() > 0.3, // Placeholder - would check against user profile
    }));
}

function calculateMatchScore(job) {
    // Placeholder - would calculate based on user profile match
    return Math.floor(Math.random() * 30) + 70; // 70-100
}

function formatExperience(level, description = '', title = '') {
    const descLower = (description || '').toLowerCase();
    const titleLower = (title || '').toLowerCase();
    const combinedText = `${titleLower} ${descLower}`;
    
    // FIRST: Try to extract explicit year requirements from description
    // This takes PRIORITY over any "entry level" text that might appear
    const yearPatterns = [
        /(\d+)\s*(?:to|-)\s*(\d+)\s*years?/gi,        // 3-5 years, 3 to 5 years, 8-10 years
        /(\d+)\s*\+\s*years?/gi,                       // 5+ years
        /minimum\s*(?:of\s*)?(\d+)\s*years?/gi,       // minimum 5 years
        /at\s*least\s*(\d+)\s*years?/gi,              // at least 5 years
        /(\d+)\s*years?\s*(?:of\s*)?(?:relevant\s*)?experience/gi,  // 5 years of experience
        /experience[:\s]+(\d+)\+?\s*years?/gi,        // experience: 5+ years
        /experience\s*\(?in\s*yrs?\)?[:\s]*(\d+)\s*(?:to|-)\s*(\d+)/gi  // Experience (in Yrs) 8-10
    ];
    
    let maxYears = 0;
    let yearResult = null;
    
    for (const pattern of yearPatterns) {
        const matches = [...combinedText.matchAll(pattern)];
        for (const match of matches) {
            let years;
            if (match[2]) {
                // Range like 3-5 years
                years = parseInt(match[1]);
                if (years > maxYears && years <= 20) {
                    maxYears = years;
                    yearResult = `${match[1]}-${match[2]} years`;
                }
            } else if (match[1]) {
                years = parseInt(match[1]);
                if (years > maxYears && years <= 20) {
                    maxYears = years;
                    yearResult = `${years}+ years`;
                }
            }
        }
    }
    
    // If we found explicit years > 0, return that (NOT entry level)
    if (maxYears > 0 && yearResult) {
        return yearResult;
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
            return 'No experience required';
        }
    }
    
    // Check title for entry-level indicators ONLY if no years were found
    if (titleLower.match(/\b(entry[\s-]?level|junior|jr\.?|intern|trainee|graduate|fresher|beginner)\b/i)) {
        return 'Entry Level';
    }
    
    // Check experience level mapping from metadata
    const mapping = {
        'entry': 'Entry Level',
        'entry-level': 'Entry Level',
        'entry_level': 'Entry Level',
        'junior': 'Entry Level',
        'mid': '3-5 years',
        'mid-level': '3-5 years',
        'intermediate': '3-5 years',
        'senior': '5+ years',
        'senior-level': '5+ years',
        'lead': '7+ years',
        'principal': '8+ years',
        'staff': '8+ years',
        'executive': '10+ years',
    };
    
    const normalizedLevel = (level || '').toLowerCase().replace(/[_]/g, '-');
    if (mapping[normalizedLevel]) {
        return mapping[normalizedLevel];
    }
    
    // If level is specified but not in mapping, use it directly
    if (level) {
        return level;
    }
    
    // Default: Don't assume experience - leave as not specified
    return 'Not specified';
}

function formatPostedDate(dateStr) {
    if (!dateStr) return 'Recently';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

function generateTags(job) {
    const tags = [];
    
    if (job.jobType) {
        tags.push(job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1).replace('-', ' '));
    }
    if (job.locationType === 'remote') {
        tags.push('Remote');
    }
    if (job.salary) {
        tags.push(job.salary);
    }
    
    // Generate experience tag using full context
    const experienceTag = formatExperience(job.experienceLevel, job.description, job.title);
    if (experienceTag && experienceTag !== 'Not specified') {
        // Don't add "exp" suffix if it already says "No experience required" or "Entry Level"
        if (experienceTag.includes('experience') || experienceTag === 'Entry Level') {
            tags.push(experienceTag);
        } else {
            tags.push(experienceTag + ' exp');
        }
    }
    
    return tags;
}

/**
 * Sanitize job description HTML
 * Fixes malformed HTML, removes orphaned closing tags, and ensures proper structure
 */
function sanitizeJobDescription(html) {
    if (!html) return '';
    
    // Remove orphaned closing tags at the beginning
    let sanitized = html.replace(/^(\s*<\/[a-zA-Z]+>\s*)+/, '');
    
    // Remove orphaned opening tags at the end
    sanitized = sanitized.replace(/(\s*<[a-zA-Z]+[^>]*>\s*)+$/, '');
    
    // Fix double tags like </li></ul> at start
    sanitized = sanitized.replace(/^<\/li>/gi, '');
    sanitized = sanitized.replace(/^<\/ul>/gi, '');
    sanitized = sanitized.replace(/^<\/p>/gi, '');
    sanitized = sanitized.replace(/^<\/div>/gi, '');
    
    // Ensure lists are properly wrapped
    // Check if content starts with <li> without <ul>
    if (sanitized.match(/^\s*<li>/i) && !sanitized.match(/^\s*<ul>/i)) {
        sanitized = '<ul>' + sanitized;
    }
    
    // Convert <br> tags in succession to proper paragraph breaks
    sanitized = sanitized.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>');
    
    // Ensure no empty paragraphs
    sanitized = sanitized.replace(/<p>\s*<\/p>/gi, '');
    sanitized = sanitized.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '');
    
    // Fix unclosed bold/strong tags
    const boldCount = (sanitized.match(/<b>/gi) || []).length;
    const boldCloseCount = (sanitized.match(/<\/b>/gi) || []).length;
    if (boldCount > boldCloseCount) {
        for (let i = 0; i < boldCount - boldCloseCount; i++) {
            sanitized += '</b>';
        }
    }
    
    const strongCount = (sanitized.match(/<strong>/gi) || []).length;
    const strongCloseCount = (sanitized.match(/<\/strong>/gi) || []).length;
    if (strongCount > strongCloseCount) {
        for (let i = 0; i < strongCount - strongCloseCount; i++) {
            sanitized += '</strong>';
        }
    }
    
    // Ensure lists are properly closed
    const ulCount = (sanitized.match(/<ul>/gi) || []).length;
    const ulCloseCount = (sanitized.match(/<\/ul>/gi) || []).length;
    if (ulCount > ulCloseCount) {
        for (let i = 0; i < ulCount - ulCloseCount; i++) {
            sanitized += '</ul>';
        }
    }
    
    const liCount = (sanitized.match(/<li>/gi) || []).length;
    const liCloseCount = (sanitized.match(/<\/li>/gi) || []).length;
    if (liCount > liCloseCount) {
        for (let i = 0; i < liCount - liCloseCount; i++) {
            sanitized += '</li>';
        }
    }
    
    // Wrap plain text sections that look like headers (bold text on its own line)
    sanitized = sanitized.replace(/<p><br><\/p><b>([^<]+)<\/b>/gi, '</p><h4>$1</h4><p>');
    sanitized = sanitized.replace(/<p>\s*<\/p>\s*<b>([^<]+)<\/b>/gi, '<h4>$1</h4>');
    
    // Clean up multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    // Wrap in a div if it doesn't start with a block element
    if (!sanitized.match(/^\s*<(?:div|p|ul|ol|h[1-6]|section|article)/i)) {
        sanitized = '<div>' + sanitized + '</div>';
    }
    
    return sanitized;
}
