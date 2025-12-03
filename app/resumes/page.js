import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ResumesContent from './ResumesContent';

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
    const { data: cvs } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    return (
        <DashboardLayout user={user} profile={profile}>
            <ResumesContent user={user} cvs={cvs || []} />
        </DashboardLayout>
    );
}
