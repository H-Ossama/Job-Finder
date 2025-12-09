import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch user notifications
export async function GET(request) {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // filter by type
        const unreadOnly = searchParams.get('unread') === 'true';
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (type && type !== 'all') {
            query = query.eq('type', type);
        }

        if (unreadOnly) {
            query = query.eq('unread', true);
        }

        const { data: notifications, error } = await query;

        if (error) {
            console.error('Error fetching notifications:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch notifications' },
                { status: 500 }
            );
        }

        // Get unread count
        const { count: unreadCount } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('unread', true);

        return NextResponse.json({
            success: true,
            data: {
                notifications: notifications || [],
                unreadCount: unreadCount || 0
            }
        });
    } catch (error) {
        console.error('Notifications API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create a new notification
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
        const { type, title, description, actionUrl, actionText, secondaryAction, metadata } = body;

        if (!type || !title) {
            return NextResponse.json(
                { success: false, error: 'Type and title are required' },
                { status: 400 }
            );
        }

        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                user_id: user.id,
                type,
                title,
                description,
                action_url: actionUrl,
                action_text: actionText,
                secondary_action: secondaryAction,
                metadata,
                unread: true
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating notification:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to create notification' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Create notification error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH - Mark notifications as read
export async function PATCH(request) {
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
        const { notificationIds, markAllRead } = body;

        let query = supabase
            .from('notifications')
            .update({ unread: false })
            .eq('user_id', user.id);

        if (markAllRead) {
            // Mark all notifications as read
            query = query.eq('unread', true);
        } else if (notificationIds && notificationIds.length > 0) {
            // Mark specific notifications as read
            query = query.in('id', notificationIds);
        } else {
            return NextResponse.json(
                { success: false, error: 'Either notificationIds or markAllRead is required' },
                { status: 400 }
            );
        }

        const { data, error } = await query.select();

        if (error) {
            console.error('Error updating notifications:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to update notifications' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { updated: data?.length || 0 }
        });
    } catch (error) {
        console.error('Update notifications error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete notifications
export async function DELETE(request) {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const notificationId = searchParams.get('id');

        if (!notificationId) {
            return NextResponse.json(
                { success: false, error: 'Notification ID is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting notification:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to delete notification' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
