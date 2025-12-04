import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ResumesContent from './ResumesContent';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'My Resumes — CareerForge AI',
    description: 'Create, manage, and optimize your AI-powered resumes',
};

export default async function ResumesPage() {
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

    // Fetch user's CVs/resumes
    const { data: cvs, error: cvsError } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (cvsError) {
        console.error('Error fetching CVs:', cvsError);
    }

    const cvCount = cvs?.length || 0;

    return (
        <DashboardLayout user={user} profile={profile} cvCount={cvCount}>
            <ResumesContent user={user} cvs={cvs || []} />
        </DashboardLayout>
    );
}
