import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AnalyticsContent from './AnalyticsContent';

export const metadata = {
    title: 'Analytics — CareerForge AI',
    description: 'Track your job search performance and insights',
};

export default async function AnalyticsPage() {
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        redirect('/login');
    }

    // Fetch user profile for avatar
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch analytics data
    const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id);

    return (
        <DashboardLayout user={user} profile={profile}>
            <AnalyticsContent user={user} applications={applications || []} />
        </DashboardLayout>
    );
}
