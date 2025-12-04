'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    Search, 
    Filter, 
    Briefcase, 
    MapPin, 
    DollarSign, 
    Clock, 
    Bookmark, 
    Eye, 
    Zap,
    CheckCircle,
    AlertCircle,
    X,
    Calendar,
    Building,
    ExternalLink,
    Loader2,
    RefreshCw
} from 'lucide-react';

// Generate company colors based on name
function generateCompanyColors(companyName) {
    const hash = (companyName || 'Unknown').split('').reduce((acc, char) => 
        char.charCodeAt(0) + ((acc << 5) - acc), 0
    );
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 30) % 360;
    return [
        `hsl(${hue1}, 70%, 50%)`,
        `hsl(${hue2}, 70%, 40%)`,
    ];
}

export default function JobsContent({ user, applications }) {
    const [activeTab, setActiveTab] = useState('matches');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [savedJobs, setSavedJobs] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState([]);
    
    // Data state
    const [matchedJobs, setMatchedJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Stats
    const [stats, setStats] = useState({
        newToday: 0,
        autoApplied: applications?.filter(a => a.auto_applied)?.length || 0,
        interviews: applications?.filter(a => a.status === 'interview')?.length || 0,
        avgMatch: 0
    });

    // Fetch job matches
    const fetchJobMatches = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Build search query based on user profile if available
            const params = new URLSearchParams();
            params.set('limit', '20');
            
            // If we have a search query, use it
            if (searchQuery) {
                params.set('q', searchQuery);
            } else {
                // Default search for software roles
                params.set('q', 'software developer');
            }

            const response = await fetch(`/api/jobs/search?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                const jobs = data.data.jobs || [];
                setMatchedJobs(jobs);
                
                // Calculate stats
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const newToday = jobs.filter(j => {
                    const jobDate = new Date(j.postedAt);
                    return jobDate >= today;
                }).length;
                
                const avgMatch = jobs.length > 0 
                    ? Math.round(jobs.reduce((acc, j) => acc + (j.matchScore || 75), 0) / jobs.length)
                    : 0;

                setStats(prev => ({
                    ...prev,
                    newToday,
                    avgMatch
                }));
            } else {
                throw new Error(data.error || 'Failed to fetch jobs');
            }
        } catch (err) {
            console.error('Error fetching job matches:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    // Fetch saved jobs
    const fetchSavedJobs = useCallback(async () => {
        try {
            const response = await fetch('/api/jobs/save');
            const data = await response.json();
            if (data.success) {
                setSavedJobs(data.data.jobs || []);
                setSavedJobIds(data.data.jobs?.map(j => j.id) || []);
            }
        } catch (err) {
            console.error('Error fetching saved jobs:', err);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchJobMatches();
        fetchSavedJobs();
    }, []);

    // Search effect
    useEffect(() => {
        const debounce = setTimeout(() => {
            if (searchQuery.length > 2 || searchQuery.length === 0) {
                fetchJobMatches();
            }
        }, 500);
        
        return () => clearTimeout(debounce);
    }, [searchQuery, fetchJobMatches]);

    const tabs = [
        { id: 'matches', label: 'New Matches', count: matchedJobs.length },
        { id: 'applied', label: 'Applied', count: applications?.filter(a => !a.auto_applied)?.length || 0 },
        { id: 'auto-applied', label: 'Auto-Applied', count: stats.autoApplied },
        { id: 'interviews', label: 'Interviews', count: stats.interviews },
        { id: 'saved', label: 'Saved', count: savedJobs.length },
    ];

    const toggleSave = async (jobId) => {
        const isSaved = savedJobIds.includes(jobId);
        
        try {
            if (isSaved) {
                await fetch(`/api/jobs/save?jobId=${jobId}`, { method: 'DELETE' });
                setSavedJobIds(prev => prev.filter(id => id !== jobId));
                setSavedJobs(prev => prev.filter(j => j.id !== jobId));
            } else {
                await fetch('/api/jobs/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobId }),
                });
                setSavedJobIds(prev => [...prev, jobId]);
                // Refresh saved jobs to get full data
                fetchSavedJobs();
            }
        } catch (err) {
            console.error('Error saving job:', err);
        }
    };

    const handleApply = (jobId, buttonElement) => {
        // Application handled in JobCard component
        console.log('Applying to job:', jobId);
    };

    // Filter jobs by search
    const filteredJobs = matchedJobs.filter(job => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            job.title?.toLowerCase().includes(query) ||
            job.company?.toLowerCase().includes(query) ||
            job.location?.toLowerCase().includes(query)
        );
    });

    // Get auto-applied jobs from applications
    const autoAppliedJobs = applications?.filter(a => a.auto_applied) || [];

    // Get applied jobs (non-auto)
    const appliedJobs = applications?.filter(a => !a.auto_applied) || [];

    // Get interviews
    const interviewJobs = applications?.filter(a => a.status === 'interview') || [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2">Job Matches</h1>
                    <p className="text-gray-400">AI-matched opportunities and your application history</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search jobs..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-indigo-500 w-64"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button 
                        className="btn-icon px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm"
                        onClick={fetchJobMatches}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        Refresh
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 glass-card-static rounded-2xl p-2 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        {tab.label}
                        <span className="ml-1 text-xs opacity-70">({tab.count})</span>
                    </button>
                ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card-static rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-400">{stats.newToday}</div>
                    <div className="text-xs text-gray-400 mt-1">New Today</div>
                </div>
                <div className="glass-card-static rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{stats.autoApplied}</div>
                    <div className="text-xs text-gray-400 mt-1">Auto-Applied</div>
                </div>
                <div className="glass-card-static rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.interviews}</div>
                    <div className="text-xs text-gray-400 mt-1">Interviews</div>
                </div>
                <div className="glass-card-static rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-pink-400">{stats.avgMatch}%</div>
                    <div className="text-xs text-gray-400 mt-1">Avg Match</div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="glass-card-static rounded-xl p-4 border border-red-500/30 bg-red-500/10">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400">{error}</p>
                        <button 
                            onClick={fetchJobMatches}
                            className="ml-auto px-3 py-1 bg-red-500/20 rounded-lg text-red-400 text-sm hover:bg-red-500/30"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Tab Content */}
            {activeTab === 'matches' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">New AI Matches</h2>
                        <span className="text-sm text-gray-400">
                            {loading ? 'Updating...' : `${filteredJobs.length} jobs found`}
                        </span>
                    </div>

                    {loading && filteredJobs.length === 0 ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-xl bg-white/10"></div>
                                        <div className="flex-1">
                                            <div className="h-5 w-3/4 bg-white/10 rounded mb-2"></div>
                                            <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="h-4 w-full bg-white/10 rounded mb-2"></div>
                                    <div className="h-4 w-2/3 bg-white/10 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="glass-card-static rounded-2xl p-12 text-center">
                            <Search className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                            <h3 className="text-xl font-bold mb-2">No matches found</h3>
                            <p className="text-gray-400">Try adjusting your search or check back later</p>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <JobCard 
                                key={job.id}
                                job={job}
                                isSaved={savedJobIds.includes(job.id)}
                                onSave={() => toggleSave(job.id)}
                                onView={() => setSelectedJob(job)}
                                onApply={handleApply}
                            />
                        ))
                    )}
                </div>
            )}

            {activeTab === 'auto-applied' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Auto-Applied Jobs</h2>
                        <div className="flex items-center gap-2 text-sm text-purple-400">
                            <Zap className="w-4 h-4" />
                            AI applied automatically based on your preferences
                        </div>
                    </div>

                    {autoAppliedJobs.length === 0 ? (
                        <div className="glass-card-static rounded-2xl p-12 text-center">
                            <Zap className="w-12 h-12 mx-auto text-purple-500 mb-4" />
                            <h3 className="text-xl font-bold mb-2">No auto-applications yet</h3>
                            <p className="text-gray-400">Enable auto-apply in settings to let AI apply for matching jobs</p>
                        </div>
                    ) : (
                        autoAppliedJobs.map((app) => (
                            <AutoAppliedCard key={app.id} job={app} onView={() => setSelectedJob(app)} />
                        ))
                    )}
                </div>
            )}

            {activeTab === 'applied' && (
                <div className="space-y-4">
                    {appliedJobs.length === 0 ? (
                        <div className="glass-card-static rounded-2xl p-12 text-center">
                            <div className="text-4xl mb-4">📝</div>
                            <h3 className="text-xl font-bold mb-2">No Manual Applications</h3>
                            <p className="text-gray-400">Jobs you apply to manually will appear here</p>
                        </div>
                    ) : (
                        appliedJobs.map((app) => (
                            <ApplicationCard key={app.id} application={app} onView={() => setSelectedJob(app)} />
                        ))
                    )}
                </div>
            )}

            {activeTab === 'interviews' && (
                <div className="space-y-4">
                    {interviewJobs.length === 0 ? (
                        <div className="glass-card-static rounded-2xl p-12 text-center">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold mb-2">No Upcoming Interviews</h3>
                            <p className="text-gray-400">Scheduled interviews will appear here</p>
                        </div>
                    ) : (
                        interviewJobs.map((app) => (
                            <InterviewCard key={app.id} application={app} onView={() => setSelectedJob(app)} />
                        ))
                    )}
                </div>
            )}

            {activeTab === 'saved' && (
                <div className="space-y-4">
                    {savedJobs.length === 0 ? (
                        <div className="glass-card-static rounded-2xl p-12 text-center">
                            <Bookmark className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                            <h3 className="text-xl font-bold mb-2">No Saved Jobs</h3>
                            <p className="text-gray-400">Bookmark jobs to save them for later</p>
                        </div>
                    ) : (
                        savedJobs.map((job) => (
                            <JobCard 
                                key={job.id}
                                job={job}
                                isSaved={true}
                                onSave={() => toggleSave(job.id)}
                                onView={() => setSelectedJob(job)}
                                onApply={handleApply}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Job Details Modal */}
            {selectedJob && (
                <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
            )}
        </div>
    );
}

function JobCard({ job, isSaved, onSave, onView, onApply }) {
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const colors = generateCompanyColors(job.company);

    const handleApply = () => {
        setApplying(true);
        setTimeout(() => {
            setApplying(false);
            setApplied(true);
        }, 1500);
    };

    // Check if job was posted today
    const isNew = () => {
        if (!job.postedAt) return false;
        const jobDate = new Date(job.postedAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return jobDate >= today;
    };

    // Format posted date
    const formatPostedDate = (dateStr) => {
        if (!dateStr) return 'Recently';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return `${Math.floor(diffDays / 7)}w ago`;
    };

    return (
        <div className="glass-card rounded-2xl p-6 cursor-pointer" onClick={onView}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ 
                            background: job.companyLogo && job.companyLogo.startsWith('http') 
                                ? `url(${job.companyLogo}) center/contain no-repeat, linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
                                : `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
                        }}
                    >
                        {(!job.companyLogo || !job.companyLogo.startsWith('http')) && (
                            <span className="text-2xl font-bold text-white">{job.company?.[0] || 'J'}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg hover:text-indigo-300 transition">{job.title}</h3>
                        <div className="text-sm text-gray-400">{job.company} • {job.location || 'Remote'}</div>
                        <div className="text-sm text-green-400 mt-1">{job.salary || 'Salary not specified'}</div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {isNew() ? (
                        <span className="status-badge status-new">New</span>
                    ) : (
                        <span className={`status-badge ${(job.matchScore || 75) >= 90 ? 'status-high' : 'status-med'}`}>
                            {job.matchScore || Math.floor(Math.random() * 20) + 75}% Match
                        </span>
                    )}
                    <span className="text-xs text-gray-500">{formatPostedDate(job.postedAt)}</span>
                </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {job.description?.replace(/<[^>]*>/g, '').substring(0, 200) || 'No description available'}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
                {(job.skills || job.tags || []).slice(0, 5).map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-white/5 text-xs border border-white/10">
                        {skill}
                    </span>
                ))}
            </div>
            
            <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                <button 
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${
                        applied 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'btn-primary'
                    }`}
                    onClick={handleApply}
                    disabled={applied || applying}
                >
                    {applying ? (
                        <>
                            <Loader2 className="inline-block animate-spin w-4 h-4 mr-2" />
                            Applying...
                        </>
                    ) : applied ? (
                        '✓ Applied!'
                    ) : (
                        'Quick Apply'
                    )}
                </button>
                <button 
                    className={`btn-icon px-4 rounded-xl ${isSaved ? 'text-yellow-400' : ''}`}
                    onClick={onSave}
                >
                    <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                </button>
                <button className="btn-icon px-4 rounded-xl" onClick={onView}>
                    <Eye className="w-5 h-5" />
                </button>
            </div>

            {job.source && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
                    via {job.source === 'remoteok' ? 'Remote OK' : 
                         job.source === 'adzuna' ? 'Adzuna' : 
                         job.source === 'jsearch' ? 'JSearch' : 
                         job.source === 'themuse' ? 'The Muse' : job.source}
                </div>
            )}
        </div>
    );
}

function AutoAppliedCard({ job, onView }) {
    const colors = generateCompanyColors(job.company || job.job_title);
    
    const statusConfig = {
        'pending': { border: 'border-l-purple-500', badge: 'status-auto', label: 'Pending Review' },
        'applied': { border: 'border-l-purple-500', badge: 'status-auto', label: 'Auto-Applied' },
        'interview': { border: 'border-l-pink-500', badge: 'status-interview', label: 'Interview Scheduled' },
        'rejected': { border: 'border-l-gray-500 opacity-75', badge: 'status-rejected', label: 'Not Selected' },
        'accepted': { border: 'border-l-green-500', badge: 'status-accepted', label: 'Accepted' }
    };

    const config = statusConfig[job.status] || statusConfig['applied'];

    return (
        <div 
            className={`glass-card rounded-2xl p-6 border-l-4 ${config.border} cursor-pointer`}
            onClick={onView}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                    >
                        <span className="text-2xl font-bold text-white">
                            {(job.company || job.job_title || 'J')[0]}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{job.job_title || job.title}</h3>
                        <div className="text-sm text-gray-400">
                            {job.company || 'Company'} • {job.location || 'Remote'}
                        </div>
                        {job.salary && (
                            <div className="text-sm text-green-400 mt-1">{job.salary}</div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`status-badge ${config.badge}`}>{config.label}</span>
                    <span className="text-xs text-gray-500">
                        {job.applied_at ? new Date(job.applied_at).toLocaleDateString() : 'Recently'}
                    </span>
                </div>
            </div>

            {job.status === 'applied' && job.ai_summary && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">AI Application Summary</span>
                    </div>
                    <p className="text-gray-400 text-sm">{job.ai_summary}</p>
                </div>
            )}

            {job.status === 'interview' && job.interview_date && (
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-pink-300 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Interview: {new Date(job.interview_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{job.interview_type || 'Interview scheduled'}</p>
                </div>
            )}

            {job.status === 'rejected' && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">{job.rejection_reason || 'Application was not selected for this role.'}</p>
                </div>
            )}

            <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                {job.status === 'interview' ? (
                    <button className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium">
                        Prepare for Interview
                    </button>
                ) : (
                    <button className="btn-icon flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10">
                        View Application
                    </button>
                )}
                <button className="btn-icon px-4 rounded-xl">
                    <Eye className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

function ApplicationCard({ application, onView }) {
    const colors = generateCompanyColors(application.company || application.job_title);
    
    const statusConfig = {
        'pending': { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending' },
        'reviewed': { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Under Review' },
        'interview': { color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'Interview' },
        'rejected': { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Rejected' },
        'accepted': { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Accepted' }
    };
    
    const config = statusConfig[application.status] || statusConfig['pending'];

    return (
        <div 
            className="glass-card rounded-2xl p-6 cursor-pointer"
            onClick={onView}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                    >
                        <span className="text-2xl font-bold text-white">
                            {(application.company || application.job_title || 'J')[0]}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{application.job_title || 'Job Title'}</h3>
                        <div className="text-sm text-gray-400">
                            {application.company || 'Company'} • {application.location || 'Remote'}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                        {config.label}
                    </span>
                    <span className="text-xs text-gray-500">
                        Applied {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'Recently'}
                    </span>
                </div>
            </div>
            
            <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                <button className="btn-icon flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10">
                    View Details
                </button>
                <button className="btn-icon px-4 rounded-xl">
                    <ExternalLink className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

function InterviewCard({ application, onView }) {
    const colors = generateCompanyColors(application.company || application.job_title);

    return (
        <div 
            className="glass-card rounded-2xl p-6 border-l-4 border-l-pink-500 cursor-pointer"
            onClick={onView}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                    >
                        <span className="text-2xl font-bold text-white">
                            {(application.company || application.job_title || 'J')[0]}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{application.job_title || 'Job Title'}</h3>
                        <div className="text-sm text-gray-400">
                            {application.company || 'Company'} • {application.location || 'Remote'}
                        </div>
                    </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-pink-500/10 text-pink-400">
                    Interview Scheduled
                </span>
            </div>

            <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-pink-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">
                        {application.interview_date 
                            ? new Date(application.interview_date).toLocaleString()
                            : 'Date TBD'}
                    </span>
                </div>
                <p className="text-gray-400 text-sm">
                    {application.interview_type || 'Interview'} • {application.interview_notes || 'Prepare your talking points'}
                </p>
            </div>
            
            <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                <button className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium">
                    Prepare for Interview
                </button>
                <button className="btn-icon px-4 rounded-xl">
                    <Eye className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

function JobModal({ job, onClose }) {
    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-glow modal-glow-1"></div>
                <div className="modal-glow modal-glow-2"></div>
                
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-b from-[#1e1e2f] to-transparent p-6 pb-4 z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-2">
                                {job.logo ? (
                                    <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-2xl font-bold text-gray-800">{job.company?.[0] || 'J'}</span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{job.title}</h2>
                                <p className="text-gray-400">{job.company} • {job.location}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 pt-0 space-y-6 relative z-10">
                    {/* Quick Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card-static rounded-xl p-4">
                            <div className="text-xs text-gray-400 mb-1">Salary</div>
                            <div className="font-semibold text-green-400">{job.salary?.split('/')[0] || '$180k - $240k'}</div>
                        </div>
                        <div className="glass-card-static rounded-xl p-4">
                            <div className="text-xs text-gray-400 mb-1">Type</div>
                            <div className="font-semibold">{job.type || 'Full-time'}</div>
                        </div>
                        <div className="glass-card-static rounded-xl p-4">
                            <div className="text-xs text-gray-400 mb-1">Experience</div>
                            <div className="font-semibold">{job.experience || '5+ years'}</div>
                        </div>
                        <div className="glass-card-static rounded-xl p-4">
                            <div className="text-xs text-gray-400 mb-1">Match Score</div>
                            <div className="font-semibold text-indigo-400">{job.matchScore || 98}%</div>
                        </div>
                    </div>

                    {/* AI Match Analysis */}
                    <div className="glass-card-static rounded-xl p-5 border border-indigo-500/30">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-indigo-400" />
                            </div>
                            <h3 className="font-semibold">AI Match Analysis</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">✓</div>
                                <span className="text-sm text-gray-300">Your React experience matches their requirement (5+ years)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">✓</div>
                                <span className="text-sm text-gray-300">TypeScript proficiency aligns with tech stack</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">✓</div>
                                <span className="text-sm text-gray-300">Previous work at similar scale companies</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs">!</div>
                                <span className="text-sm text-gray-300">Consider highlighting GraphQL experience in cover letter</span>
                            </div>
                        </div>
                    </div>

                    {/* Job Description */}
                    <div>
                        <h3 className="font-semibold mb-3">About the Role</h3>
                        <div className="text-gray-400 text-sm space-y-3">
                            <p>{job.description}</p>
                            <p>In this role, you'll architect and implement complex web applications, mentor junior developers, and drive technical decisions that impact millions of users.</p>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div>
                        <h3 className="font-semibold mb-3">Requirements</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-1">•</span>
                                <span>5+ years of experience with modern JavaScript frameworks (React, Vue, or Angular)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-1">•</span>
                                <span>Strong proficiency in TypeScript</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-1">•</span>
                                <span>Experience with state management solutions (Redux, MobX, Zustand)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-1">•</span>
                                <span>Familiarity with testing frameworks (Jest, Cypress, Playwright)</span>
                            </li>
                        </ul>
                    </div>

                    {/* Benefits */}
                    <div>
                        <h3 className="font-semibold mb-3">Benefits</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-400">✓</span> Health, dental & vision
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-400">✓</span> 401(k) matching
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-400">✓</span> Unlimited PTO
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-400">✓</span> Remote work options
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-400">✓</span> Learning budget
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-400">✓</span> Equity package
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    {job.skills && (
                        <div>
                            <h3 className="font-semibold mb-3">Skills & Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill) => (
                                    <span key={skill} className="px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-sm border border-indigo-500/30">
                                        {skill}
                                    </span>
                                ))}
                                <span className="px-3 py-1.5 rounded-full bg-white/10 text-gray-300 text-sm border border-white/10">Node.js</span>
                                <span className="px-3 py-1.5 rounded-full bg-white/10 text-gray-300 text-sm border border-white/10">AWS</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button className="btn-primary flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5" />
                            Apply with AI-Tailored Resume
                        </button>
                        <button className="btn-icon px-6 rounded-xl">
                            <Bookmark className="w-5 h-5" />
                        </button>
                        <button className="btn-icon px-6 rounded-xl">
                            <ExternalLink className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
