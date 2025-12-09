/**
 * Morocco Scraper Status/Test Endpoint
 * GET /api/jobs/morocco/scrape/status
 * 
 * Returns the status of the Puppeteer scraper and available sources.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Check Puppeteer availability
        let puppeteerAvailable = false;
        let puppeteerVersion = null;
        
        try {
            const puppeteer = await import('puppeteer');
            puppeteerAvailable = true;
            // Puppeteer doesn't expose version easily, so we just confirm it's there
            puppeteerVersion = 'installed';
        } catch (error) {
            puppeteerAvailable = false;
        }

        // Get available Morocco sources
        const { MOROCCO_SOURCES, getEnabledMoroccoSources } = await import('@/utils/jobs/providers/morocco/index.js');
        const enabledSources = getEnabledMoroccoSources();

        return NextResponse.json({
            success: true,
            scraper: {
                available: puppeteerAvailable,
                version: puppeteerVersion,
                status: puppeteerAvailable ? 'ready' : 'unavailable',
            },
            morocco: {
                totalSources: Object.keys(MOROCCO_SOURCES).length,
                enabledSources: enabledSources.length,
                sources: enabledSources.map(s => ({
                    id: s.id,
                    name: s.name,
                    url: s.url,
                    category: s.category || 'general',
                })),
            },
            endpoints: {
                scrape: '/api/jobs/morocco/scrape',
                search: '/api/jobs/search?country=ma',
            },
            usage: {
                scrapeAll: 'GET /api/jobs/morocco/scrape?q=developer&city=Casablanca',
                scrapeSingle: 'POST /api/jobs/morocco/scrape { siteId: "emploi", query: "developer" }',
            },
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}
