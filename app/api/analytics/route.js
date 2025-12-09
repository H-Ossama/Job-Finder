import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch analytics data
export async function GET(request) {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Fetch all applications
        const { data: applications, error: appError } = await supabase
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

        if (appError) {
            console.error('Error fetching applications:', appError);
        }

        const allApplications = applications || [];

        // Filter applications within date range for time-based stats
        const recentApplications = allApplications.filter(app => {
            const appDate = new Date(app.applied_at || app.created_at);
            return appDate >= startDate && appDate <= endDate;
        });

        // Calculate application status distribution
        const statusCounts = {
            saved: allApplications.filter(a => a.status === 'saved').length,
            applied: allApplications.filter(a => a.status === 'applied').length,
            screening: allApplications.filter(a => a.status === 'screening').length,
            interviewing: allApplications.filter(a => a.status === 'interviewing').length,
            offer: allApplications.filter(a => a.status === 'offer').length,
            rejected: allApplications.filter(a => a.status === 'rejected').length,
            withdrawn: allApplications.filter(a => a.status === 'withdrawn').length,
        };

        // Calculate weekly applications for chart
        const weeklyData = getWeeklyApplications(recentApplications, days);

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

        // Calculate application sources
        const sourceCounts = {};
        allApplications.forEach(app => {
            const source = app.source || 'Manual';
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });

        // Fetch job matches for skills analysis
        const { data: matches } = await supabase
            .from('job_matches')
            .select('matched_skills, missing_skills, match_score')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        // Calculate matched skills frequency
        const skillFrequency = {};
        (matches || []).forEach(match => {
            (match.matched_skills || []).forEach(skill => {
                skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
            });
        });

        const matchedSkills = Object.entries(skillFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, count], index) => ({
                name,
                match: Math.max(60, 100 - (index * 5)), // Approximate match percentage
                color: getSkillColor(index)
            }));

        // Calculate missing skills for suggestions
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

        // Fetch search history for activity
        const { data: searches } = await supabase
            .from('job_searches')
            .select('query, location, results_count, created_at')
            .eq('user_id', user.id)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false })
            .limit(10);

        // Calculate response rate (applications that moved beyond 'applied')
        const totalApplied = allApplications.filter(a => 
            a.status !== 'saved' && a.applied_at
        ).length;
        const totalResponses = allApplications.filter(a => 
            ['screening', 'interviewing', 'offer', 'rejected'].includes(a.status)
        ).length;
        const responseRate = totalApplied > 0 
            ? Math.round((totalResponses / totalApplied) * 100) 
            : 0;

        // Calculate stats
        const stats = {
            totalApplications: allApplications.length,
            recentApplications: recentApplications.length,
            interviews: statusCounts.interviewing,
            offers: statusCounts.offer,
            responseRate,
            avgResponseRate: 25, // Industry average for comparison
        };

        // Calculate trend (compare to previous period)
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - days);
        const previousApplications = allApplications.filter(app => {
            const appDate = new Date(app.applied_at || app.created_at);
            return appDate >= previousStartDate && appDate < startDate;
        });
        
        const applicationsTrend = previousApplications.length > 0
            ? Math.round(((recentApplications.length - previousApplications.length) / previousApplications.length) * 100)
            : recentApplications.length > 0 ? 100 : 0;

        return NextResponse.json({
            stats,
            statusCounts,
            weeklyData,
            topCompanies,
            sourceCounts,
            matchedSkills,
            suggestedSkills,
            recentSearches: searches || [],
            trends: {
                applications: applicationsTrend,
                interviews: statusCounts.interviewing,
                responseRate: responseRate > stats.avgResponseRate ? 'above' : 'below'
            }
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper function to get weekly application data
function getWeeklyApplications(applications, days) {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (days <= 7) {
        // Daily data for last 7 days
        const dailyCounts = new Array(7).fill(0);
        const today = new Date();
        
        applications.forEach(app => {
            const appDate = new Date(app.applied_at || app.created_at);
            const daysAgo = Math.floor((today - appDate) / (1000 * 60 * 60 * 24));
            if (daysAgo < 7) {
                dailyCounts[6 - daysAgo]++;
            }
        });

        // Get day labels for the last 7 days
        const labels = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(dayLabels[date.getDay()]);
        }

        return {
            labels,
            data: dailyCounts
        };
    } else if (days <= 30) {
        // Weekly data for last 30 days (4 weeks)
        const weeklyCounts = new Array(4).fill(0);
        const today = new Date();

        applications.forEach(app => {
            const appDate = new Date(app.applied_at || app.created_at);
            const weeksAgo = Math.floor((today - appDate) / (1000 * 60 * 60 * 24 * 7));
            if (weeksAgo < 4) {
                weeklyCounts[3 - weeksAgo]++;
            }
        });

        return {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: weeklyCounts
        };
    } else {
        // Monthly data for 90 days (3 months)
        const monthlyCounts = new Array(3).fill(0);
        const today = new Date();

        applications.forEach(app => {
            const appDate = new Date(app.applied_at || app.created_at);
            const monthsAgo = Math.floor((today - appDate) / (1000 * 60 * 60 * 24 * 30));
            if (monthsAgo < 3) {
                monthlyCounts[2 - monthsAgo]++;
            }
        });

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const labels = [];
        for (let i = 2; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            labels.push(monthNames[date.getMonth()]);
        }

        return {
            labels,
            data: monthlyCounts
        };
    }
}

// Helper function to get skill color
function getSkillColor(index) {
    const colors = ['indigo', 'purple', 'pink', 'cyan', 'green', 'yellow', 'orange', 'red'];
    return colors[index % colors.length];
}
