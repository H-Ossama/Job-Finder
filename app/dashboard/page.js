import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardContent from './DashboardContent';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user's CVs
    const { data: cvs } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch user's applications
    const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id);

    // Fetch user profile for avatar
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const cvCount = cvs?.length || 0;

    return (
        <DashboardLayout user={user} profile={profile} cvCount={cvCount}>
            <DashboardContent 
                user={user} 
                cvs={cvs || []} 
                applications={applications || []} 
            />
        </DashboardLayout>
    );
}
