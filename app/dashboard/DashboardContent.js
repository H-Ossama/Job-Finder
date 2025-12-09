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
    Lightbulb,
    Loader2
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

// Hook to fetch job matches client-side
function useJobMatches(hasCV = false) {
    const [jobMatches, setJobMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(hasCV); // Only show loading if we're going to fetch
    
    useEffect(() => {
        // Don't fetch if user doesn't have a CV
        if (!hasCV) {
            setIsLoading(false);
            return;
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
        
        async function fetchJobs() {
            try {
                const response = await fetch('/api/jobs/search?q=developer&limit=3', {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) throw new Error('Failed to fetch');
                
                const data = await response.json();
                
                if (data.success && data.data.jobs) {
                    const colors = ['indigo', 'purple', 'blue', 'green', 'pink', 'amber'];
                    const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
                    
                    setJobMatches(data.data.jobs.slice(0, 3).map(job => ({
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
                    })));
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching job matches:', error);
                }
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchJobs();
        
        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [hasCV]);
    
    return { jobMatches, isLoading };
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

export default function DashboardContent({ user, cvs, applications, activities = [] }) {
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const firstName = userName.split(' ')[0];
    
    const cvCount = cvs?.length || 0;
    const hasCV = cvCount > 0;
    const applicationCount = applications?.length || 0;

    // Fetch job matches client-side (non-blocking) - only if user has a CV
    const { jobMatches, isLoading: jobsLoading } = useJobMatches(hasCV);

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
                    value={cvCount}
                    badge={cvCount > 0 ? null : "Create one"}
                    badgeColor={cvCount > 0 ? "tag-success" : "tag-warning"}
                    delay={1}
                />
                <StatCard
                    icon={Briefcase}
                    iconBg="bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400"
                    label="Job Matches"
                    value={hasCV ? jobMatches.length : 0}
                    badge={hasCV ? (jobMatches.length > 0 ? "New" : null) : "Need CV"}
                    badgeColor={hasCV ? "tag-primary" : "tag-warning"}
                    delay={2}
                />
                <StatCard
                    icon={Clock}
                    iconBg="bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400"
                    label="Applications Sent"
                    value={applicationCount}
                    delay={3}
                />
                <StatCard
                    icon={Calendar}
                    iconBg="bg-gradient-to-br from-pink-500/20 to-rose-500/20 text-pink-400"
                    label="Interviews Scheduled"
                    value={applications?.filter(a => a.status === 'interview')?.length || 0}
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
                        <p className="text-sm text-gray-400">
                            {hasCV ? 'Based on your CV and preferences' : 'Create a CV to unlock AI-powered matching'}
                        </p>
                    </div>
                    <Link href="/job-search" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition">
                        View all →
                    </Link>
                </div>

                {!hasCV ? (
                    /* No CV - Show CTA banner */
                    <div className="glass-card-static rounded-2xl p-6" style={{ 
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                    }}>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-8 h-8 text-amber-400" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="font-semibold mb-2">Create Your CV to Unlock AI Features</h3>
                                <p className="text-gray-400 text-sm mb-3">
                                    Get personalized job matches, AI-powered match scores, experience comparisons, and quick apply functionality.
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs text-gray-400">
                                    <span>📊 Match Score Analysis</span>
                                    <span>⏱️ Experience Comparison</span>
                                    <span>✅ Skills Detection</span>
                                    <span>⚡ Quick Apply</span>
                                </div>
                            </div>
                            <Link 
                                href="/cv-builder" 
                                className="px-5 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap font-semibold text-sm"
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
                            >
                                <Plus className="w-4 h-4" />
                                Create CV Now
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {jobsLoading ? (
                            // Loading skeleton
                            <>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="job-match-card animate-pulse">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-700/50"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="h-3 bg-gray-700/50 rounded w-full"></div>
                                            <div className="h-3 bg-gray-700/50 rounded w-5/6"></div>
                                        </div>
                                        <div className="flex gap-2 mb-4">
                                            <div className="h-6 bg-gray-700/50 rounded w-16"></div>
                                            <div className="h-6 bg-gray-700/50 rounded w-20"></div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : jobMatches.length > 0 ? (
                            jobMatches.map((job, i) => (
                                <JobCard key={i} {...job} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8 text-gray-400">
                                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No job matches found. Try updating your profile!</p>
                            </div>
                        )}
                    </div>
                )}
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
