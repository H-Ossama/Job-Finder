import { NextResponse } from 'next/server';

/**
 * API Route to check user's geolocation
 * This runs server-side to avoid CORS issues with ipapi.co
 */
export async function GET(request) {
    try {
        // Get the user's IP from headers
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');
        const ip = forwardedFor?.split(',')[0] || realIP || '';

        // Call ipapi.co from the server (no CORS issues)
        const apiUrl = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
        
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'JobFinder/1.0',
            },
        });

        if (!response.ok) {
            throw new Error(`ipapi.co returned ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json({
            country_code: data.country_code,
            country_name: data.country_name,
            city: data.city,
            region: data.region,
        });
    } catch (error) {
        console.error('Geo API error:', error);
        // Return a safe default on error
        return NextResponse.json(
            { country_code: 'UNKNOWN', error: 'Failed to determine location' },
            { status: 200 } // Return 200 so client doesn't block
        );
    }
}
