import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardContent from './DashboardContent';

export const dynamic = 'force-dynamic';

// Generate activity items from applications
function generateActivityItems(applications) {
    if (!applications || applications.length === 0) {
        return [
            { color: 'bg-green-400', text: 'Welcome to Job Finder!', highlight: 'Get started by creating a CV', time: 'Just now' }
        ];
    }
    
    return applications.slice(0, 5).map(app => {
        const timeAgo = getTimeAgo(new Date(app.created_at || app.applied_at));
        
        if (app.status === 'interview') {
            return {
                color: 'bg-pink-400',
                text: 'Interview scheduled with',
                highlight: app.company || app.job_title,
                time: timeAgo
            };
        } else if (app.status === 'accepted') {
            return {
                color: 'bg-green-400',
                text: 'Application accepted by',
                highlight: app.company || app.job_title,
                time: timeAgo
            };
        } else if (app.auto_applied) {
            return {
                color: 'bg-purple-400',
                text: 'AI auto-applied to',
                highlight: app.company || app.job_title,
                time: timeAgo
            };
        } else {
            return {
                color: 'bg-blue-400',
                text: 'Applied to',
                highlight: app.company || app.job_title,
                time: timeAgo
            };
        }
    });
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

export default async function Dashboard() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user's CVs
    const { data: cvs } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch user's applications
    const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch user profile for avatar
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Generate activity items from applications
    const activities = generateActivityItems(applications);

    const cvCount = cvs?.length || 0;

    return (
        <DashboardLayout user={user} profile={profile} cvCount={cvCount}>
            <DashboardContent 
                user={user} 
                cvs={cvs || []} 
                applications={applications || []} 
                activities={activities}
            />
        </DashboardLayout>
    );
}
