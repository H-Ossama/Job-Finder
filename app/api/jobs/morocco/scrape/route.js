/**
 * Morocco Job Scraper API Endpoint
 * GET /api/jobs/morocco/scrape
 * 
 * Uses Puppeteer for browser automation to scrape Morocco job sites.
 * This endpoint is separate from the main search to avoid performance impact.
 * 
 * Query params:
 * - q: Search query
 * - city: City filter
 * - sources: Comma-separated list of source IDs
 * - limit: Max results per source
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for scraping

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        
        const params = {
            query: searchParams.get('q') || searchParams.get('query') || '',
            city: searchParams.get('city') || searchParams.get('location') || '',
            sources: searchParams.get('sources')?.split(',').filter(Boolean) || null,
            limit: Math.min(parseInt(searchParams.get('limit') || '10', 10), 20),
        };

        // Dynamically import the scraper to avoid loading Puppeteer on every request
        const { searchMoroccoWithScraper, isScraperAvailable } = await import('@/utils/jobs/scraper/search.js');

        // Check if Puppeteer is available
        const scraperAvailable = await isScraperAvailable();
        
        if (!scraperAvailable) {
            return NextResponse.json({
                success: false,
                error: 'Puppeteer scraper not available',
                message: 'Browser automation is not configured on this server',
                fallback: true,
            }, { status: 503 });
        }

        console.log(`🕷️ Morocco scraper request: "${params.query}" in ${params.city || 'all cities'}`);

        const results = await searchMoroccoWithScraper({
            ...params,
            useScraper: true,
        });

        return NextResponse.json({
            success: true,
            data: {
                jobs: results.jobs,
                total: results.total,
                sources: results.sources,
                method: results.method,
            },
        });

    } catch (error) {
        console.error('Morocco scraper API error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Scraping failed',
            message: error.message,
        }, { status: 500 });
    }
}

/**
 * POST endpoint to scrape a specific site
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { siteId, query, city, limit = 10 } = body;

        if (!siteId) {
            return NextResponse.json({
                success: false,
                error: 'Missing siteId parameter',
            }, { status: 400 });
        }

        const { searchSingleSiteWithScraper } = await import('@/utils/jobs/scraper/search.js');

        const results = await searchSingleSiteWithScraper(siteId, { query, city, limit });

        return NextResponse.json({
            success: true,
            data: results,
        });

    } catch (error) {
        console.error('Morocco single site scraper error:', error);
        
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}
