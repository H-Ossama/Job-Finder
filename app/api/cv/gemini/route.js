import { NextResponse } from 'next/server';
import { analyzeCV, analyzeKeywords, generateImprovements } from '@/utils/ai/gemini';

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, cvData, jobDescription, targetRole } = body;

        if (!cvData) {
            return NextResponse.json(
                { error: 'CV data is required' },
                { status: 400 }
            );
        }

        let result;

        switch (action) {
            case 'analyze':
                // Full CV analysis with ATS score, keywords, and improvements
                result = await analyzeCV(cvData, jobDescription);
                return NextResponse.json({
                    success: true,
                    data: result
                });

            case 'keywords':
                // Keyword analysis against job description
                if (!jobDescription) {
                    return NextResponse.json(
                        { error: 'Job description is required for keyword analysis' },
                        { status: 400 }
                    );
                }
                result = await analyzeKeywords(cvData, jobDescription);
                return NextResponse.json({
                    success: true,
                    data: result
                });

            case 'improvements':
                // Get detailed improvement suggestions
                result = await generateImprovements(cvData, targetRole);
                return NextResponse.json({
                    success: true,
                    data: result
                });

            default:
                // Default to full analysis
                result = await analyzeCV(cvData, jobDescription);
                return NextResponse.json({
                    success: true,
                    data: result
                });
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to analyze CV',
                message: error.message 
            },
            { status: 500 }
        );
    }
}
