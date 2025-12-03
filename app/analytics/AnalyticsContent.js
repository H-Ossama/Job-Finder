'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    FileText, 
    Eye, 
    Calendar, 
    CheckCircle,
    TrendingUp,
    Lightbulb
} from 'lucide-react';

// Sample analytics data
const weeklyApplications = [2, 4, 3, 5, 4, 2, 4];
const applicationStatus = {
    applied: 15,
    interviewing: 5,
    offer: 1,
    rejected: 3
};

const topCompanies = [
    { name: 'Google', logo: 'https://logo.clearbit.com/google.com', applications: 4, percentage: 80 },
    { name: 'Meta', logo: 'https://logo.clearbit.com/meta.com', applications: 3, percentage: 60 },
    { name: 'Netflix', logo: 'https://logo.clearbit.com/netflix.com', applications: 2, percentage: 40 },
];

const matchedSkills = [
    { name: 'React', match: 95, color: 'indigo' },
    { name: 'TypeScript', match: 92, color: 'purple' },
    { name: 'Node.js', match: 88, color: 'pink' },
    { name: 'GraphQL', match: 85, color: 'cyan' },
    { name: 'AWS', match: 78, color: 'green' },
    { name: 'Python', match: 72, color: 'yellow' },
];

export default function AnalyticsContent({ user, applications }) {
    const [timeRange, setTimeRange] = useState('7');
    const lineChartRef = useRef(null);
    const doughnutChartRef = useRef(null);
    const [chartsReady, setChartsReady] = useState(false);

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

                // Applications Line Chart
                if (lineChartRef.current) {
                    const ctx = lineChartRef.current.getContext('2d');
                    lineChartRef.current.chart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            datasets: [{
                                label: 'Applications',
                                data: weeklyApplications,
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
                                    ticks: { color: '#9ca3af' } 
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
                    doughnutChartRef.current.chart = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Applied', 'Interviewing', 'Offer', 'Rejected'],
                            datasets: [{
                                data: [applicationStatus.applied, applicationStatus.interviewing, applicationStatus.offer, applicationStatus.rejected],
                                backgroundColor: ['#818cf8', '#34d399', '#fbbf24', '#f87171'],
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
    }, [timeRange]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2">Analytics</h1>
                    <p className="text-gray-400">Track your job search performance and insights.</p>
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                    {['7', '30', '90'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
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
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                    icon={FileText}
                    iconColor="indigo"
                    label="Applications"
                    value="24"
                    trend="+8 this week"
                    trendUp={true}
                />
                <StatCard 
                    icon={Eye}
                    iconColor="purple"
                    label="Profile Views"
                    value="142"
                    trend="+23% vs last week"
                    trendUp={true}
                />
                <StatCard 
                    icon={Calendar}
                    iconColor="green"
                    label="Interviews"
                    value="3"
                    subtext="1 scheduled"
                />
                <StatCard 
                    icon={CheckCircle}
                    iconColor="pink"
                    label="Response Rate"
                    value="38%"
                    trend="Above avg (25%)"
                    trendUp={true}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Applications Over Time */}
                <div className="glass-card-static rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Applications Over Time</h3>
                    <canvas ref={lineChartRef} height="200"></canvas>
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
                    <div className="space-y-4">
                        {topCompanies.map((company) => (
                            <div key={company.name} className="flex items-center gap-4">
                                <img 
                                    src={company.logo} 
                                    alt={company.name}
                                    className="w-10 h-10 rounded-lg bg-white p-1"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium">{company.name}</span>
                                        <span className="text-sm text-gray-400">{company.applications} applications</span>
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
                </div>

                {/* In-Demand Skills */}
                <div className="glass-card-static rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Your Most Matched Skills</h3>
                    <div className="flex flex-wrap gap-3">
                        {matchedSkills.map((skill) => (
                            <div 
                                key={skill.name}
                                className={`px-4 py-2 rounded-xl bg-${skill.color}-500/20 border border-${skill.color}-500/30`}
                            >
                                <span className={`text-${skill.color}-300 font-medium`}>{skill.name}</span>
                                <span className="text-xs text-gray-400 ml-2">{skill.match}% match</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* AI Suggestion */}
                    <div className="mt-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <div className="flex items-center gap-3">
                            <Lightbulb className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                            <span className="text-sm text-gray-300">
                                Consider adding <span className="text-indigo-400 font-medium">Docker</span> and{' '}
                                <span className="text-indigo-400 font-medium">Kubernetes</span> to increase matches by 15%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
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
                    {trendUp && <TrendingUp className="w-4 h-4" />}
                    {trend}
                </div>
            )}
            {subtext && (
                <div className="text-sm text-gray-400 mt-1">{subtext}</div>
            )}
        </div>
    );
}
