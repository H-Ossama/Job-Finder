import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch unread notification count only
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

        // Get unread count
        const { count: unreadCount, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('unread', true);

        if (error) {
            console.error('Error fetching unread count:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch unread count' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                unreadCount: unreadCount || 0
            }
        });
    } catch (error) {
        console.error('Unread count API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
