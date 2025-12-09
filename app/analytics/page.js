import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AnalyticsContent from './AnalyticsContent';

export const metadata = {
    title: 'Analytics — CareerForge AI',
    description: 'Track your job search performance and insights',
};

export default async function AnalyticsPage() {
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

    // Fetch job applications with status counts
    const { data: applications } = await supabase
        .from('job_applications')
        .select(`
            id,
            status,
            applied_at,
            created_at,
            updated_at,
            source,
            job_title,
            company_name,
            job:jobs_cache(
                company,
                title,
                skills
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch job matches for skills analysis
    const { data: matches } = await supabase
        .from('job_matches')
        .select('matched_skills, missing_skills, match_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

    // Fetch recent searches
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: searches } = await supabase
        .from('job_searches')
        .select('query, location, results_count, created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

    // Pre-compute some analytics server-side
    const allApplications = applications || [];
    
    const statusCounts = {
        saved: allApplications.filter(a => a.status === 'saved').length,
        applied: allApplications.filter(a => a.status === 'applied').length,
        screening: allApplications.filter(a => a.status === 'screening').length,
        interviewing: allApplications.filter(a => a.status === 'interviewing').length,
        offer: allApplications.filter(a => a.status === 'offer').length,
        rejected: allApplications.filter(a => a.status === 'rejected').length,
    };

    // Calculate response rate
    const totalApplied = allApplications.filter(a => 
        a.status !== 'saved' && a.applied_at
    ).length;
    const totalResponses = allApplications.filter(a => 
        ['screening', 'interviewing', 'offer', 'rejected'].includes(a.status)
    ).length;
    const responseRate = totalApplied > 0 
        ? Math.round((totalResponses / totalApplied) * 100) 
        : 0;

    // Calculate top companies
    const companyStats = {};
    allApplications.forEach(app => {
        const company = app.job?.company || app.company_name || 'Unknown';
        if (!companyStats[company]) {
            companyStats[company] = { name: company, count: 0 };
        }
        companyStats[company].count++;
    });
    
    const topCompanies = Object.values(companyStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((company, index, arr) => ({
            name: company.name,
            logo: `https://logo.clearbit.com/${company.name.toLowerCase().replace(/\s/g, '')}.com`,
            applications: company.count,
            percentage: arr[0] ? Math.round((company.count / arr[0].count) * 100) : 100
        }));

    // Calculate matched skills
    const skillFrequency = {};
    (matches || []).forEach(match => {
        (match.matched_skills || []).forEach(skill => {
            skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
        });
    });

    const colors = ['indigo', 'purple', 'pink', 'cyan', 'green', 'yellow', 'orange', 'red'];
    const matchedSkills = Object.entries(skillFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count], index) => ({
            name,
            match: Math.max(60, 100 - (index * 5)),
            color: colors[index % colors.length]
        }));

    // Calculate suggested skills from missing skills
    const missingFrequency = {};
    (matches || []).forEach(match => {
        (match.missing_skills || []).forEach(skill => {
            missingFrequency[skill] = (missingFrequency[skill] || 0) + 1;
        });
    });

    const suggestedSkills = Object.entries(missingFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);

    const analyticsData = {
        stats: {
            totalApplications: allApplications.length,
            interviews: statusCounts.interviewing,
            offers: statusCounts.offer,
            responseRate,
        },
        statusCounts,
        topCompanies,
        matchedSkills,
        suggestedSkills,
        applications: allApplications,
        searches: searches || []
    };

    return (
        <DashboardLayout user={user} profile={profile}>
            <AnalyticsContent user={user} analyticsData={analyticsData} />
        </DashboardLayout>
    );
}
