import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProfileContent from './ProfileContent';

export const metadata = {
    title: 'Profile — CareerForge AI',
    description: 'Manage your personal information and account settings',
};

export default async function ProfilePage() {
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        redirect('/login');
    }

    // Fetch user profile data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <DashboardLayout user={user} profile={profile}>
            <ProfileContent user={user} profile={profile} />
        </DashboardLayout>
    );
}
