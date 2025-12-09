'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    FileText, 
    Eye, 
    Calendar, 
    CheckCircle,
    TrendingUp,
    TrendingDown,
    Lightbulb,
    RefreshCw,
    Briefcase,
    Award,
    Target
} from 'lucide-react';

export default function AnalyticsContent({ user, analyticsData }) {
    const [timeRange, setTimeRange] = useState('30');
    const [data, setData] = useState(analyticsData);
    const [isLoading, setIsLoading] = useState(false);
    const lineChartRef = useRef(null);
    const doughnutChartRef = useRef(null);
    const [chartsReady, setChartsReady] = useState(false);

    // Fetch fresh analytics data when time range changes
    const fetchAnalytics = async (days) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/analytics?days=${days}`);
            if (response.ok) {
                const newData = await response.json();
                setData(prev => ({ ...prev, ...newData }));
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle time range change
    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
        fetchAnalytics(range);
    };

    // Calculate weekly data from applications
    const getWeeklyData = () => {
        const applications = data.applications || [];
        const days = parseInt(timeRange);
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        if (days <= 7) {
            const dailyCounts = new Array(7).fill(0);
            const today = new Date();
            
            applications.forEach(app => {
                const appDate = new Date(app.applied_at || app.created_at);
                const daysAgo = Math.floor((today - appDate) / (1000 * 60 * 60 * 24));
                if (daysAgo < 7 && daysAgo >= 0) {
                    dailyCounts[6 - daysAgo]++;
                }
            });

            const labels = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(dayLabels[date.getDay()]);
            }

            return { labels, data: dailyCounts };
        } else if (days <= 30) {
            const weeklyCounts = new Array(4).fill(0);
            const today = new Date();

            applications.forEach(app => {
                const appDate = new Date(app.applied_at || app.created_at);
                const diffDays = Math.floor((today - appDate) / (1000 * 60 * 60 * 24));
                if (diffDays < 28 && diffDays >= 0) {
                    const weekIndex = Math.floor(diffDays / 7);
                    if (weekIndex < 4) {
                        weeklyCounts[3 - weekIndex]++;
                    }
                }
            });

            return { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: weeklyCounts };
        } else {
            const monthlyCounts = new Array(3).fill(0);
            const today = new Date();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            applications.forEach(app => {
                const appDate = new Date(app.applied_at || app.created_at);
                const monthDiff = (today.getFullYear() - appDate.getFullYear()) * 12 + today.getMonth() - appDate.getMonth();
                if (monthDiff < 3 && monthDiff >= 0) {
                    monthlyCounts[2 - monthDiff]++;
                }
            });

            const labels = [];
            for (let i = 2; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                labels.push(monthNames[date.getMonth()]);
            }

            return { labels, data: monthlyCounts };
        }
    };

    // Load Chart.js and render charts
    useEffect(() => {
        const loadChartJS = async () => {
            if (typeof window !== 'undefined') {
                const Chart = (await import('chart.js/auto')).default;
                
                // Clean up existing charts
                if (lineChartRef.current?.chart) {
                    lineChartRef.current.chart.destroy();
                }
                if (doughnutChartRef.current?.chart) {
                    doughnutChartRef.current.chart.destroy();
                }

                const weeklyData = getWeeklyData();
                const statusCounts = data.statusCounts || {};

                // Applications Line Chart
                if (lineChartRef.current) {
                    const ctx = lineChartRef.current.getContext('2d');
                    lineChartRef.current.chart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: weeklyData.labels,
                            datasets: [{
                                label: 'Applications',
                                data: weeklyData.data,
                                borderColor: '#818cf8',
                                backgroundColor: 'rgba(129, 140, 248, 0.1)',
                                fill: true,
                                tension: 0.4
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { 
                                    beginAtZero: true, 
                                    grid: { color: 'rgba(255,255,255,0.05)' }, 
                                    ticks: { color: '#9ca3af', stepSize: 1 } 
                                },
                                x: { 
                                    grid: { display: false }, 
                                    ticks: { color: '#9ca3af' } 
                                }
                            }
                        }
                    });
                }

                // Status Doughnut Chart
                if (doughnutChartRef.current) {
                    const ctx = doughnutChartRef.current.getContext('2d');
                    const hasData = Object.values(statusCounts).some(v => v > 0);
                    
                    doughnutChartRef.current.chart = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: hasData 
                                ? ['Applied', 'Screening', 'Interviewing', 'Offer', 'Rejected']
                                : ['No Data'],
                            datasets: [{
                                data: hasData 
                                    ? [
                                        statusCounts.applied || 0, 
                                        statusCounts.screening || 0,
                                        statusCounts.interviewing || 0, 
                                        statusCounts.offer || 0, 
                                        statusCounts.rejected || 0
                                    ]
                                    : [1],
                                backgroundColor: hasData 
                                    ? ['#818cf8', '#22d3ee', '#a78bfa', '#34d399', '#f87171']
                                    : ['#374151'],
                                borderWidth: 0
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: { 
                                    position: 'right', 
                                    labels: { color: '#9ca3af', padding: 20 } 
                                }
                            }
                        }
                    });
                }

                setChartsReady(true);
            }
        };

        loadChartJS();

        return () => {
            if (lineChartRef.current?.chart) {
                lineChartRef.current.chart.destroy();
            }
            if (doughnutChartRef.current?.chart) {
                doughnutChartRef.current.chart.destroy();
            }
        };
    }, [timeRange, data]);

    const stats = data.stats || {};
    const topCompanies = data.topCompanies || [];
    const matchedSkills = data.matchedSkills || [];
    const suggestedSkills = data.suggestedSkills || [];

    // Calculate this week's applications
    const thisWeekApps = (data.applications || []).filter(app => {
        const appDate = new Date(app.applied_at || app.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return appDate >= weekAgo;
    }).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2">Analytics</h1>
                    <p className="text-gray-400">Track your job search performance and insights.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isLoading && (
                        <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                    )}
                    <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                        {['7', '30', '90'].map((range) => (
                            <button
                                key={range}
                                onClick={() => handleTimeRangeChange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    timeRange === range 
                                        ? 'bg-indigo-500 text-white' 
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {range} Days
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                    icon={FileText}
                    iconColor="indigo"
                    label="Applications"
                    value={stats.totalApplications || 0}
                    trend={thisWeekApps > 0 ? `+${thisWeekApps} this week` : 'No applications this week'}
                    trendUp={thisWeekApps > 0}
                />
                <StatCard 
                    icon={Target}
                    iconColor="purple"
                    label="Active Applications"
                    value={(data.statusCounts?.applied || 0) + (data.statusCounts?.screening || 0)}
                    subtext="Applied & Screening"
                />
                <StatCard 
                    icon={Calendar}
                    iconColor="green"
                    label="Interviews"
                    value={stats.interviews || 0}
                    subtext={stats.interviews > 0 ? 'Keep preparing!' : 'Apply more to get interviews'}
                />
                <StatCard 
                    icon={Award}
                    iconColor="pink"
                    label="Response Rate"
                    value={`${stats.responseRate || 0}%`}
                    trend={stats.responseRate >= 25 ? 'Above avg (25%)' : 'Below avg (25%)'}
                    trendUp={stats.responseRate >= 25}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Applications Over Time */}
                <div className="glass-card-static rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Applications Over Time</h3>
                    {(data.applications || []).length > 0 ? (
                        <canvas ref={lineChartRef} height="200"></canvas>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No application data yet</p>
                                <p className="text-sm">Start applying to see your progress</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Application Status */}
                <div className="glass-card-static rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Application Status</h3>
                    <canvas ref={doughnutChartRef} height="200"></canvas>
                </div>
            </div>

            {/* Top Companies & Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Companies */}
                <div className="glass-card-static rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Top Companies Applied</h3>
                    {topCompanies.length > 0 ? (
                        <div className="space-y-4">
                            {topCompanies.map((company) => (
                                <div key={company.name} className="flex items-center gap-4">
                                    <img 
                                        src={company.logo} 
                                        alt={company.name}
                                        className="w-10 h-10 rounded-lg bg-white p-1"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = `<div class="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-white font-bold">${company.name[0]}</div>`;
                                        }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium">{company.name}</span>
                                            <span className="text-sm text-gray-400">{company.applications} application{company.applications !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                                style={{ width: `${company.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No companies yet</p>
                            <p className="text-sm">Track your applications to see company stats</p>
                        </div>
                    )}
                </div>

                {/* In-Demand Skills */}
                <div className="glass-card-static rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Your Most Matched Skills</h3>
                    {matchedSkills.length > 0 ? (
                        <>
                            <div className="flex flex-wrap gap-3">
                                {matchedSkills.map((skill) => (
                                    <div 
                                        key={skill.name}
                                        className={`px-4 py-2 rounded-xl bg-${skill.color}-500/20 border border-${skill.color}-500/30`}
                                        style={{
                                            backgroundColor: `rgba(var(--color-${skill.color}-500), 0.2)`,
                                            borderColor: `rgba(var(--color-${skill.color}-500), 0.3)`
                                        }}
                                    >
                                        <span className={`text-${skill.color}-300 font-medium`}>{skill.name}</span>
                                        <span className="text-xs text-gray-400 ml-2">{skill.match}% match</span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* AI Suggestion */}
                            {suggestedSkills.length > 0 && (
                                <div className="mt-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                    <div className="flex items-center gap-3">
                                        <Lightbulb className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-300">
                                            Consider adding{' '}
                                            {suggestedSkills.map((skill, i) => (
                                                <span key={skill}>
                                                    <span className="text-indigo-400 font-medium">{skill}</span>
                                                    {i < suggestedSkills.length - 1 && (i === suggestedSkills.length - 2 ? ' and ' : ', ')}
                                                </span>
                                            ))}
                                            {' '}to increase your match rate
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No skill matches yet</p>
                            <p className="text-sm">Apply to jobs to see which skills match</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Offers Section */}
            {(stats.offers || 0) > 0 && (
                <div className="glass-card-static rounded-2xl p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
                            <Award className="w-8 h-8 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-green-400">
                                🎉 Congratulations!
                            </h3>
                            <p className="text-gray-300">
                                You have {stats.offers} offer{stats.offers > 1 ? 's' : ''}! 
                                Check your applications to review the details.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, iconColor, label, value, trend, trendUp, subtext }) {
    const colorClasses = {
        indigo: 'bg-indigo-500/20 text-indigo-400',
        purple: 'bg-purple-500/20 text-purple-400',
        green: 'bg-green-500/20 text-green-400',
        pink: 'bg-pink-500/20 text-pink-400',
    };

    return (
        <div className="glass-card-static rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[iconColor]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-gray-400 text-sm">{label}</span>
            </div>
            <div className="text-3xl font-bold">{value}</div>
            {trend && (
                <div className={`text-sm flex items-center gap-1 mt-1 ${trendUp ? 'text-green-400' : 'text-gray-400'}`}>
                    {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {trend}
                </div>
            )}
            {subtext && (
                <div className="text-sm text-gray-400 mt-1">{subtext}</div>
            )}
        </div>
    );
}
