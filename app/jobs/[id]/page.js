import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import JobDetailsContent from './JobDetailsContent';

export const metadata = {
    title: 'Job Details — CareerForge AI',
    description: 'View job details and apply'
};

export default async function JobDetailsPage({ params }) {
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

    // Check if user has any CVs
    const { data: cvs, error: cvError } = await supabase
        .from('cvs')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

    const hasCV = !cvError && cvs && cvs.length > 0;

    const { id } = await params;

    return (
        <JobDetailsContent 
            user={user} 
            profile={profile} 
            jobId={id}
            hasCV={hasCV}
        />
    );
}
