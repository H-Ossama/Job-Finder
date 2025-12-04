import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CVResultContent from './CVResultContent';

export const metadata = {
    title: 'CV Analysis Results — CareerForge AI',
    description: 'Your CV analysis results with ATS score and improvement suggestions',
};

export default async function CVResultPage({ params }) {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        redirect('/login');
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch the CV
    const { data: cv, error: cvError } = await supabase
        .from('cvs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (cvError || !cv) {
        redirect('/cv-builder');
    }

    // Get CV count for sidebar
    const { count: cvCount } = await supabase
        .from('cvs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    return (
        <DashboardLayout user={user} profile={profile} cvCount={cvCount || 0}>
            <CVResultContent cv={cv} user={user} />
        </DashboardLayout>
    );
}
