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

    const { id } = await params;

    return (
        <JobDetailsContent 
            user={user} 
            profile={profile} 
            jobId={id} 
        />
    );
}
