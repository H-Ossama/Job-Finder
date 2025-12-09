import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SettingsContent from './SettingsContent';

export const metadata = {
    title: 'Preferences — CareerForge AI',
    description: 'Configure your job search preferences and AI settings',
};

export default async function SettingsPage() {
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

    // Fetch user preferences (general)
    const { data: preferences } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Fetch job search preferences
    const { data: jobPreferences } = await supabase
        .from('user_job_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Fetch user's CVs for auto-apply dropdown
    const { data: cvs } = await supabase
        .from('cvs')
        .select('id, title, ats_score')
        .eq('user_id', user.id);

    return (
        <DashboardLayout user={user} profile={profile}>
            <SettingsContent 
                user={user} 
                preferences={preferences} 
                jobPreferences={jobPreferences}
                cvs={cvs || []} 
            />
        </DashboardLayout>
    );
}
