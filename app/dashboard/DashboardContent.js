'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    FileText, 
    Briefcase, 
    Clock, 
    Calendar,
    Plus,
    Check,
    Lightbulb
} from 'lucide-react';

// Animated counter hook
function useAnimatedCounter(target, duration = 1500) {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        if (target === 0) return;
        
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            setCount(Math.floor(current));
        }, 16);
        
        return () => clearInterval(timer);
    }, [target, duration]);
    
    return count;
}

// Stat Card Component
function StatCard({ icon: Icon, iconBg, label, value, badge, badgeColor, delay }) {
    const animatedValue = useAnimatedCounter(value);
    
    return (
        <div className={`stat-card animate-fade-in animate-delay-${delay}`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`stat-icon ${iconBg}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {badge && (
                    <span className={`tag ${badgeColor}`}>{badge}</span>
                )}
            </div>
            <div className="stat-number-large">{animatedValue}</div>
            <div className="text-gray-400 text-sm">{label}</div>
        </div>
    );
}

// CV Preview Card Component
function CVPreviewCard({ cv }) {
    return (
        <Link href={`/cv-builder?edit=${cv.id}`} className="cv-card">
            <div className="cv-preview-card mb-4">
                <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30"></div>
                    <div className="flex-1">
                        <div className="cv-preview-mini-line w-20"></div>
                        <div className="cv-preview-mini-line w-14" style={{ height: '4px' }}></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="cv-preview-mini-line w-full"></div>
                    <div className="cv-preview-mini-line w-5/6"></div>
                    <div className="cv-preview-mini-line w-4/6"></div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <div className="cv-preview-mini-line w-3/4"></div>
                    <div className="cv-preview-mini-line w-full"></div>
                    <div className="cv-preview-mini-line w-2/3"></div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-medium text-sm">{cv.title || 'Untitled CV'}</h4>
                    <p className="text-xs text-gray-400">
                        Created {new Date(cv.created_at).toLocaleDateString()}
                    </p>
                </div>
                <span className="tag tag-success text-xs">92%</span>
            </div>
        </Link>
    );
}

// Create New CV Card
function CreateCVCard() {
    return (
        <Link href="/cv-builder" className="cv-card border-dashed flex flex-col items-center justify-center text-center min-h-[280px]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                <Plus className="w-7 h-7 text-indigo-400" />
            </div>
            <h4 className="font-medium mb-1">Create New CV</h4>
            <p className="text-xs text-gray-400">AI-powered builder</p>
        </Link>
    );
}

// Activity Item Component
function ActivityItem({ color, text, highlight, time }) {
    return (
        <div className="activity-item">
            <div className={`activity-dot ${color}`}></div>
            <div className="flex-1">
                <p className="text-sm">
                    {text} <span className="text-indigo-400">{highlight}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{time}</p>
            </div>
        </div>
    );
}

// Job Card Component
function JobCard({ company, initial, gradient, title, location, matchScore, description, tags, salary }) {
    return (
        <div className="job-match-card">
            <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center text-lg font-bold flex-shrink-0`}>
                    {initial}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{title}</h4>
                    <p className="text-sm text-gray-400">{company} • {location}</p>
                </div>
                <span className={`match-score ${matchScore >= 90 ? 'high' : 'medium'}`}>{matchScore}%</span>
            </div>
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-sm text-gray-400">{salary}</span>
                <button className="btn-primary px-4 py-2 rounded-lg text-sm font-medium">
                    Quick Apply
                </button>
            </div>
        </div>
    );
}

export default function DashboardContent({ user, cvs, applications }) {
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const firstName = userName.split(' ')[0];
    
    const cvCount = cvs?.length || 0;
    const applicationCount = applications?.length || 0;

    // Sample activity data
    const activities = [
        { color: 'bg-green-500', text: 'New job match:', highlight: 'Senior Developer at Google', time: '2 minutes ago' },
        { color: 'bg-indigo-500', text: 'CV updated:', highlight: 'Software Engineer CV', time: '1 hour ago' },
        { color: 'bg-amber-500', text: 'Application viewed by', highlight: 'Amazon', time: '3 hours ago' },
        { color: 'bg-pink-500', text: 'Interview scheduled with', highlight: 'Stripe', time: 'Yesterday' },
        { color: 'bg-purple-500', text: 'Applied to', highlight: 'Netflix', time: '2 days ago' },
    ];

    // Sample job data
    const jobMatches = [
        {
            company: 'Google',
            initial: 'G',
            gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
            title: 'Senior Software Engineer',
            location: 'Mountain View, CA',
            matchScore: 98,
            description: 'Join our team to build cutting-edge AI products that impact billions of users worldwide...',
            tags: ['React', 'Python', 'AI/ML'],
            salary: '$180k - $250k'
        },
        {
            company: 'Amazon',
            initial: 'A',
            gradient: 'bg-gradient-to-br from-orange-500 to-red-500',
            title: 'Full Stack Developer',
            location: 'Remote',
            matchScore: 95,
            description: 'Work on AWS services used by millions of developers. Build scalable solutions...',
            tags: ['TypeScript', 'AWS', 'Node.js'],
            salary: '$150k - $200k'
        },
        {
            company: 'Stripe',
            initial: 'S',
            gradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
            title: 'Backend Engineer',
            location: 'San Francisco, CA',
            matchScore: 87,
            description: 'Help build the financial infrastructure for the internet. Work on payments APIs...',
            tags: ['Ruby', 'Go', 'PostgreSQL'],
            salary: '$160k - $220k'
        }
    ];

    return (
        <>
            {/* Welcome Header */}
            <div className="mb-8 animate-fade-in">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Welcome back, <span className="text-gradient">{firstName}</span> 👋
                </h1>
                <p className="text-gray-400">Here's what's happening with your job search today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    icon={FileText}
                    iconBg="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400"
                    label="Active CVs"
                    value={cvCount || 3}
                    badge="+1 today"
                    badgeColor="tag-success"
                    delay={1}
                />
                <StatCard
                    icon={Briefcase}
                    iconBg="bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400"
                    label="Job Matches"
                    value={47}
                    badge="New"
                    badgeColor="tag-primary"
                    delay={2}
                />
                <StatCard
                    icon={Clock}
                    iconBg="bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400"
                    label="Applications Sent"
                    value={applicationCount || 12}
                    delay={3}
                />
                <StatCard
                    icon={Calendar}
                    iconBg="bg-gradient-to-br from-pink-500/20 to-rose-500/20 text-pink-400"
                    label="Interviews Scheduled"
                    value={3}
                    delay={4}
                />
            </div>

            {/* Main Grid - CVs + Activity */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Your CVs Section */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold">Your CVs</h2>
                        <Link href="/cv-builder" className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            New CV
                        </Link>
                    </div>

                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {cvs.slice(0, 2).map((cv) => (
                            <CVPreviewCard key={cv.id} cv={cv} />
                        ))}
                        <CreateCVCard />
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div>
                    <h2 className="text-lg font-semibold mb-5">Recent Activity</h2>
                    <div className="glass-card-static rounded-2xl p-5">
                        {activities.map((activity, i) => (
                            <ActivityItem key={i} {...activity} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Job Matches Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-semibold">Top Job Matches</h2>
                        <p className="text-sm text-gray-400">Based on your profile and preferences</p>
                    </div>
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition">
                        View all →
                    </button>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {jobMatches.map((job, i) => (
                        <JobCard key={i} {...job} />
                    ))}
                </div>
            </div>

            {/* Profile Completion & Tips Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Profile Completion */}
                <div className="glass-card-static rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Profile Completion</h3>
                        <span className="text-2xl font-bold text-gradient-purple">78%</span>
                    </div>
                    <div className="progress-bar mb-6">
                        <div className="progress-fill" style={{ width: '78%' }}></div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <Check className="w-5 h-5 text-green-400" />
                            <span className="text-gray-300">Basic information added</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Check className="w-5 h-5 text-green-400" />
                            <span className="text-gray-300">Work experience uploaded</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Plus className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-400">Add portfolio links</span>
                            <button className="ml-auto text-indigo-400 hover:text-indigo-300 transition">Add</button>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Plus className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-400">Complete skills assessment</span>
                            <button className="ml-auto text-indigo-400 hover:text-indigo-300 transition">Start</button>
                        </div>
                    </div>
                </div>

                {/* AI Tips */}
                <div className="glass-card-static rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold">AI Suggestions</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <div className="flex gap-3">
                                <span className="text-xl">💡</span>
                                <div>
                                    <p className="text-sm text-gray-200 mb-2">Add quantifiable achievements to your CV to increase interview chances by 40%</p>
                                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Apply suggestion →</button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <div className="flex gap-3">
                                <span className="text-xl">🎯</span>
                                <div>
                                    <p className="text-sm text-gray-200 mb-2">Your profile matches 12 new jobs posted today. Apply early for better chances!</p>
                                    <button className="text-xs text-green-400 hover:text-green-300 font-medium">View matches →</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
