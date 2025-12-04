import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardContent from './DashboardContent';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// Fetch job matches from API
async function fetchJobMatches() {
    try {
        // Get the host from headers for absolute URL
        const headersList = await headers();
        const host = headersList.get('host');
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
        
        const response = await fetch(`${protocol}://${host}/api/jobs/search?q=developer&limit=3`, {
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch jobs');
        }
        
        const data = await response.json();
        
        if (data.success && data.data.jobs) {
            // Transform jobs to match the expected format
            return data.data.jobs.slice(0, 3).map(job => ({
                company: job.company || 'Company',
                initial: (job.company || 'C')[0].toUpperCase(),
                gradient: `bg-gradient-to-br from-${getRandomColor()}-500/20 to-${getRandomColor()}-500/20`,
                title: job.title,
                location: job.location || 'Remote',
                matchScore: job.matchScore || Math.floor(Math.random() * 20) + 75,
                description: job.description?.replace(/<[^>]*>/g, '').substring(0, 150) || 'No description available',
                tags: (job.skills || job.tags || []).slice(0, 3),
                salary: job.salary || 'Salary not specified',
                id: job.id
            }));
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching job matches:', error);
        return [];
    }
}

function getRandomColor() {
    const colors = ['indigo', 'purple', 'blue', 'green', 'pink', 'amber'];
    return colors[Math.floor(Math.random() * colors.length)];
}

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

    // Fetch job matches from API
    const jobMatches = await fetchJobMatches();
    
    // Generate activity items from applications
    const activities = generateActivityItems(applications);

    const cvCount = cvs?.length || 0;

    return (
        <DashboardLayout user={user} profile={profile} cvCount={cvCount}>
            <DashboardContent 
                user={user} 
                cvs={cvs || []} 
                applications={applications || []} 
                jobMatches={jobMatches}
                activities={activities}
            />
        </DashboardLayout>
    );
}
