import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/preferences/job-search
 * Fetch user's job search preferences
 */
export async function GET() {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { data: preferences, error } = await supabase
            .from('user_job_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error fetching preferences:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch preferences' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: preferences || null,
            hasPreferences: !!preferences,
        });
    } catch (error) {
        console.error('Preferences API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/preferences/job-search
 * Save/update user's job search preferences
 */
export async function POST(request) {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        
        const {
            desiredTitles,
            preferredCountry,
            preferredCity,
            useAutoLocation,
            salaryMin,
            salaryMax,
            salaryCurrency,
            jobTypes,
            experienceLevels,
            workTypes,
            skills,
            excludedCompanies,
        } = body;

        // Build the preferences object
        const preferencesData = {
            user_id: user.id,
            desired_titles: desiredTitles || [],
            desired_locations: preferredCity ? [`${preferredCity}, ${preferredCountry}`] : (preferredCountry ? [preferredCountry] : []),
            desired_countries: preferredCountry ? [preferredCountry] : [],
            salary_min: salaryMin ? parseInt(String(salaryMin).replace(/[^0-9]/g, '')) || null : null,
            salary_max: salaryMax ? parseInt(String(salaryMax).replace(/[^0-9]/g, '')) || null : null,
            salary_currency: salaryCurrency || 'USD',
            job_types: jobTypes || [],
            experience_levels: experienceLevels || [],
            skills: skills || [],
            excluded_companies: excludedCompanies || [],
            updated_at: new Date().toISOString(),
        };

        // Store auto-location preference in metadata (we'll add this column or use existing)
        // For now, encode it in the desired_locations array if needed

        // Upsert preferences (insert or update)
        const { data, error } = await supabase
            .from('user_job_preferences')
            .upsert(preferencesData, {
                onConflict: 'user_id',
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving preferences:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to save preferences' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
            message: 'Preferences saved successfully',
        });
    } catch (error) {
        console.error('Preferences API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
