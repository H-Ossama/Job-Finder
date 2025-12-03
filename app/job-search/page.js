import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import JobSearchContent from './JobSearchContent';

export const metadata = {
    title: 'Job Search — CareerForge AI',
    description: 'Search from thousands of jobs tailored to your skills'
};

export default async function JobSearchPage() {
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
        <DashboardLayout user={user} profile={profile}>
            <JobSearchContent user={user} profile={profile} />
        </DashboardLayout>
    );
}
