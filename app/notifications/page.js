import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import NotificationsContent from './NotificationsContent';

export const metadata = {
    title: 'Notifications — CareerForge AI',
    description: 'Stay updated on your job search activity'
};

export default async function NotificationsPage() {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <NotificationsContent user={user} profile={profile} />
    );
}
