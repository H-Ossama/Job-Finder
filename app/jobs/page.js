import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import JobsContent from './JobsContent';

export const metadata = {
    title: 'Job Matches — CareerForge AI',
    description: 'AI-matched opportunities and your application history',
};

export default async function JobsPage() {
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

    // Fetch user's job search preferences
    const { data: jobPreferences } = await supabase
        .from('user_job_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Fetch user's applications (include all auto-apply fields)
    const { data: applications } = await supabase
        .from('applications')
        .select('*, cvs(id, title)')
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

    // Check if user has any CVs
    const { data: cvs, error: cvError } = await supabase
        .from('cvs')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

    const hasCV = !cvError && cvs && cvs.length > 0;

    return (
        <DashboardLayout user={user} profile={profile}>
            <JobsContent 
                user={user} 
                applications={applications || []} 
                jobPreferences={jobPreferences}
                hasCV={hasCV}
            />
        </DashboardLayout>
    );
}
