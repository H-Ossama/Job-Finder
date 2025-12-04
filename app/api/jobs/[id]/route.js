/**
 * Job Details API Endpoint
 * GET /api/jobs/[id]
 * 
 * Fetches a single job by ID
 */

import { NextResponse } from 'next/server';
import { getCachedJobById } from '@/utils/jobs/cache';
import { getJobById } from '@/utils/jobs';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Job ID is required',
            }, { status: 400 });
        }

        // Try to get from cache first
        let job = await getCachedJobById(id);
        
        // If not in cache, fetch from provider
        if (!job) {
            job = await getJobById(id);
            
            if (!job) {
                return NextResponse.json({
                    success: false,
                    error: 'Job not found',
                }, { status: 404 });
            }
        }

        // Generate additional data for the job details page
        const enrichedJob = enrichJobDetails(job);

        return NextResponse.json({
            success: true,
            data: enrichedJob,
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
        companyLogo: job.companyLogo || job.company?.[0]?.toUpperCase(),
        companyColors,
        companyDescription: `${job.company} is a company in the ${job.industry || 'technology'} industry.`,
        companySize: job.companySize || 'Unknown',
        companyLocation: job.location,
        companyWebsite: job.companyWebsite || '',
        industry: job.industry || 'Technology',
        locationType: job.locationType || 'onsite',
        jobType: job.jobType || 'full-time',
        experience: formatExperience(job.experienceLevel),
        matchScore,
        postedAt: formatPostedDate(job.postedAt),
        responsibilities,
        requirements: requirements.slice(0, 6),
        niceToHave: niceToHave.slice(0, 4),
        benefits: formatBenefits(benefits),
        skills: formatSkills(job.skills || []),
        similarJobs: [], // Would be populated from search
        tags: generateTags(job),
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

function formatExperience(level) {
    const mapping = {
        'entry': '0-2 years',
        'mid': '3-5 years',
        'senior': '5+ years',
        'lead': '7+ years',
        'executive': '10+ years',
    };
    return mapping[level] || '3+ years';
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
    if (job.experienceLevel) {
        tags.push(formatExperience(job.experienceLevel) + ' exp');
    }
    
    return tags;
}
