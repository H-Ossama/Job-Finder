import { NextResponse } from 'next/server';
import { 
    generateProfessionalSummary,
    improveCVContent,
    generateJobBulletPoints,
    analyzeATSCompatibility,
    extractJobKeywords,
    tailorCVToJob
} from '@/utils/ai/openrouter';

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, ...params } = body;

        let result;

        switch (action) {
            case 'summary':
                // Generate professional summary
                result = await generateProfessionalSummary(params);
                return NextResponse.json({
                    success: true,
                    content: result
                });

            case 'improve':
                // Improve existing content
                result = await improveCVContent(params);
                return NextResponse.json({
                    success: true,
                    content: result
                });

            case 'bullets':
                // Generate job description bullet points
                result = await generateJobBulletPoints(params);
                return NextResponse.json({
                    success: true,
                    bullets: result
                });

            case 'ats-analyze':
                // Analyze ATS compatibility
                result = await analyzeATSCompatibility(params.cvData, params.jobDescription);
                return NextResponse.json({
                    success: true,
                    analysis: result
                });

            case 'extract-keywords':
                // Extract keywords from job description
                result = await extractJobKeywords(params.jobDescription);
                return NextResponse.json({
                    success: true,
                    keywords: result
                });

            case 'tailor':
                // Tailor CV to specific job
                result = await tailorCVToJob(params.cvData, params.jobDescription);
                return NextResponse.json({
                    success: true,
                    suggestions: result
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Valid actions: summary, improve, bullets, ats-analyze, extract-keywords, tailor' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('AI API Error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: error.message || 'Failed to process AI request' 
            },
            { status: 500 }
        );
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'CV AI Assistant',
        actions: ['summary', 'improve', 'bullets', 'ats-analyze', 'extract-keywords', 'tailor']
    });
}
