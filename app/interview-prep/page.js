import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import InterviewPrepContent from './InterviewPrepContent';

export default async function InterviewPrep() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user profile for avatar
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch user's interview prep progress
    const { data: progress } = await supabase
        .from('interview_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

    return (
        <DashboardLayout user={user} profile={profile}>
            <InterviewPrepContent 
                user={user} 
                progress={progress || {}} 
            />
        </DashboardLayout>
    );
}
