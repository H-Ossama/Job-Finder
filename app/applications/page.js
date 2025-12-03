import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ApplicationsContent from './ApplicationsContent';

export const metadata = {
    title: 'Applications — CareerForge AI',
    description: 'Track and manage all your job applications in one place',
};

export default async function ApplicationsPage() {
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

    // Fetch user's applications
    const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <DashboardLayout user={user} profile={profile}>
            <ApplicationsContent user={user} applications={applications || []} />
        </DashboardLayout>
    );
}
