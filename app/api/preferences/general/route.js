import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/preferences/general
 * Fetch user's general preferences (auto-apply, notifications, privacy)
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
            .from('preferences')
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
 * POST /api/preferences/general
 * Save/update user's general preferences
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
            // Auto-apply settings
            autoApplyEnabled,
            minMatchScore,
            dailyLimit,
            generateCoverLetters,
            defaultResumeId,
            coverLetterTone,
            coverLetterLength,
            // Notification settings
            notifyNewMatches,
            notifyApplicationUpdates,
            notifyProfileViews,
            notifyWeeklySummary,
            // Privacy settings
            profileVisible,
            showSalary,
            allowDataCollection,
            // Theme
            theme,
        } = body;

        // Build the preferences object
        const preferencesData = {
            user_id: user.id,
            // Auto-apply
            auto_apply_enabled: autoApplyEnabled ?? false,
            min_match_score: minMatchScore ? parseInt(minMatchScore) : 85,
            daily_limit: dailyLimit ? parseInt(dailyLimit) : 10,
            generate_cover_letters: generateCoverLetters ?? true,
            default_resume_id: defaultResumeId || null,
            cover_letter_tone: coverLetterTone || 'professional',
            cover_letter_length: coverLetterLength || 'medium',
            // Notifications
            notify_new_matches: notifyNewMatches ?? true,
            notify_application_updates: notifyApplicationUpdates ?? true,
            notify_profile_views: notifyProfileViews ?? false,
            notify_weekly_summary: notifyWeeklySummary ?? true,
            // Privacy
            profile_visible: profileVisible ?? true,
            show_salary: showSalary ?? false,
            allow_data_collection: allowDataCollection ?? true,
            // Theme
            theme: theme || 'purple',
            // Timestamp
            updated_at: new Date().toISOString(),
        };

        // Upsert preferences (insert or update)
        const { data, error } = await supabase
            .from('preferences')
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
