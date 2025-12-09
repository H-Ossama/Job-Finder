/**
 * Job Cache Management API
 * DELETE /api/jobs/cache - Clear all job search cache
 * GET /api/jobs/cache - Get cache status
 */

import { NextResponse } from 'next/server';
import { 
    clearAllSearchCache, 
    clearJobMemoryCache, 
    clearSearchMemoryCache 
} from '@/utils/jobs/cache';

export const dynamic = 'force-dynamic';

/**
 * Clear job search cache
 * DELETE /api/jobs/cache
 * Query params:
 *   - type: 'all' | 'search' | 'jobs' (default: 'all')
 */
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';
        
        let result = {};
        
        switch (type) {
            case 'search':
                // Clear only search results cache
                result = clearSearchMemoryCache();
                result.type = 'search';
                break;
            case 'jobs':
                // Clear only individual jobs cache
                result = clearJobMemoryCache();
                result.type = 'jobs';
                break;
            case 'all':
            default:
                // Clear everything
                result = await clearAllSearchCache();
                const jobResult = clearJobMemoryCache();
                result.type = 'all';
                result.jobMemoryCleared = jobResult.cleared;
                result.jobEntriesRemoved = jobResult.entriesRemoved;
                break;
        }
        
        console.log(`🧹 Cache cleared: ${type}`, result);
        
        return NextResponse.json({
            success: true,
            message: `Cache cleared successfully (${type})`,
            details: result,
        });
        
    } catch (error) {
        console.error('Cache clear error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to clear cache',
            message: error.message,
        }, { status: 500 });
    }
}

/**
 * Get cache status info
 * GET /api/jobs/cache
 */
export async function GET(request) {
    return NextResponse.json({
        success: true,
        message: 'Use DELETE method to clear cache',
        options: {
            'DELETE /api/jobs/cache': 'Clear all cache',
            'DELETE /api/jobs/cache?type=search': 'Clear search results cache only',
            'DELETE /api/jobs/cache?type=jobs': 'Clear individual jobs cache only',
        },
        tip: 'Add ?cache=false to any search request to bypass cache',
    });
}
