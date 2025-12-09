import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ApplicationsContent from './ApplicationsContent';

export const metadata = {
    title: 'Applications — CareerForge AI',
    description: 'Track and manage all your job applications in one place',
};

export default async function ApplicationsPage() {
    console.log('📋 [APPLICATIONS PAGE] Loading...');
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        redirect('/login');
    }
    console.log('✅ [APPLICATIONS PAGE] User:', user.id);

    // Fetch user profile for avatar
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch user's CVs for the add application modal
    const { data: cvs } = await supabase
        .from('cvs')
        .select('id, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch user's job applications (no joins to avoid relationship errors)
    const { data: applications, error: appError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (appError) {
        console.error('❌ [APPLICATIONS PAGE] Error fetching applications:', appError);
    } else {
        console.log('✅ [APPLICATIONS PAGE] Found', applications?.length || 0, 'applications');
    }

    // Transform applications data for the component
    const transformedApplications = (applications || []).map(app => ({
        id: app.id,
        company: app.company_name || 'Unknown Company',
        logo: `https://logo.clearbit.com/${(app.company_name || 'company').toLowerCase().replace(/\s/g, '')}.com`,
        title: app.job_title || 'Unknown Position',
        location: app.location || 'Remote',
        salary: app.salary || 'Not specified',
        status: app.status,
        appliedDate: app.applied_at,
        lastUpdate: getRelativeTime(app.updated_at),
        resumeUsed: null,
        coverLetter: !!app.cover_letter || !!app.ai_cover_letter,
        source: app.source || 'Manual',
        notes: app.notes,
        nextStep: app.interview_date 
            ? `Interview - ${new Date(app.interview_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` 
            : null,
        interviewType: app.interview_type,
        interviewNotes: app.interview_notes,
        offerDetails: app.offer_details,
        rejectionReason: app.rejection_reason,
        jobUrl: app.job_url,
        jobId: app.job_id,
        externalJobId: app.external_job_id
    }));
    
    console.log('📤 [APPLICATIONS PAGE] Transformed', transformedApplications.length, 'applications');

    return (
        <DashboardLayout user={user} profile={profile}>
            <ApplicationsContent 
                user={user} 
                applications={transformedApplications} 
                cvs={cvs || []}
            />
        </DashboardLayout>
    );
}

// Helper function to get relative time
function getRelativeTime(dateString) {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks === 1) return '1 week ago';
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
