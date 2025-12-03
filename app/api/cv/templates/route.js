import { NextResponse } from 'next/server';
import { getAllTemplates, getTemplate, getATSKeywords, ATS_BEST_PRACTICES } from '@/utils/cv/templates';

/**
 * GET /api/cv/templates
 * Get all available CV templates or a specific template
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    const industry = searchParams.get('industry');

    // If specific template requested
    if (templateId) {
        const template = getTemplate(templateId);
        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }
        return NextResponse.json({ template });
    }

    // If industry keywords requested
    if (industry) {
        const keywords = getATSKeywords(industry);
        return NextResponse.json({ 
            industry,
            keywords,
            bestPractices: ATS_BEST_PRACTICES
        });
    }

    // Return all templates
    const templates = getAllTemplates();
    return NextResponse.json({ 
        templates,
        industries: ['technology', 'marketing', 'finance', 'healthcare', 'sales', 'general']
    });
}
