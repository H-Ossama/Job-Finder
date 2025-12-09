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

    // Fetch user's job search preferences
    const { data: jobPreferences } = await supabase
        .from('user_job_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Check if user has any CVs
    const { data: cvs, error: cvError } = await supabase
        .from('cvs')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

    const hasCV = !cvError && cvs && cvs.length > 0;

    return (
        <DashboardLayout user={user} profile={profile}>
            <JobSearchContent 
                user={user} 
                profile={profile} 
                jobPreferences={jobPreferences}
                hasCV={hasCV}
            />
        </DashboardLayout>
    );
}
