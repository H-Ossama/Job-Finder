import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CVBuilderContent from './CVBuilderContent';

export const metadata = {
    title: 'AI CV Builder — CareerForge AI',
    description: 'Build your professional CV with AI assistance',
};

export default async function CVBuilderCreatePage() {
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

    return (
        <DashboardLayout user={user} profile={profile}>
            <CVBuilderContent user={user} profile={profile} />
        </DashboardLayout>
    );
}
