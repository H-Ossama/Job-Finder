'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
    RefreshCw,
    Settings,
    Sparkles,
    Info,
    FileText,
    Plus,
    Trash2,
    Copy,
    Check
} from 'lucide-react';
import { getCountryByCode } from '@/utils/location/countries';

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

export default function JobsContent({ user, applications, jobPreferences, hasCV = false }) {
    // Check if user has completed job preferences
    const hasPreferences = jobPreferences && 
        jobPreferences.desired_titles?.length > 0 &&
        (jobPreferences.desired_countries?.length > 0 || jobPreferences.job_types?.includes('remote'));

    // Get preference display info
    const getPreferencesSummary = () => {
        if (!jobPreferences) return null;
        
        const titles = jobPreferences.desired_titles?.slice(0, 2).join(', ') || '';
        const country = jobPreferences.desired_countries?.[0];
        const countryInfo = country ? getCountryByCode(country) : null;
        const location = jobPreferences.desired_locations?.[0] || (countryInfo ? countryInfo.name : 'Remote');
        const isRemote = jobPreferences.job_types?.includes('remote');
        
        return {
            titles,
            location: isRemote ? `${location} (+ Remote)` : location,
            isRemote,
        };
    };

    const preferencesSummary = getPreferencesSummary();

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

    // Auto-apply state
    const [autoApplyRunning, setAutoApplyRunning] = useState(false);
    const [autoApplyResults, setAutoApplyResults] = useState(null);
    const [showAutoApplyModal, setShowAutoApplyModal] = useState(false);
    const [autoApplyStatus, setAutoApplyStatus] = useState(null);

    // Run auto-apply process
    const runAutoApply = async (options = {}) => {
        if (!hasCV) {
            setAutoApplyStatus({ type: 'error', message: 'Please create a CV first before using auto-apply.' });
            return;
        }

        if (!hasPreferences) {
            setAutoApplyStatus({ type: 'error', message: 'Please set up your job preferences first.' });
            return;
        }

        setAutoApplyRunning(true);
        setAutoApplyResults(null);
        setAutoApplyStatus({ type: 'info', message: 'Starting auto-apply process...' });

        try {
            const response = await fetch('/api/jobs/auto-apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maxApplications: options.maxApplications || 5,
                    minMatchScore: options.minMatchScore || 75,
                    dryRun: options.dryRun || false,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAutoApplyResults(data.data);
                setAutoApplyStatus({
                    type: 'success',
                    message: `Auto-apply complete! Applied to ${data.data.applicationsSubmitted} jobs.`
                });
                
                // Update stats
                setStats(prev => ({
                    ...prev,
                    autoApplied: prev.autoApplied + data.data.applicationsSubmitted
                }));
            } else {
                throw new Error(data.error || 'Auto-apply failed');
            }
        } catch (error) {
            console.error('Auto-apply error:', error);
            setAutoApplyStatus({
                type: 'error',
                message: error.message || 'Auto-apply failed. Please try again.'
            });
        } finally {
            setAutoApplyRunning(false);
        }
    };

    // Clear cache and fetch fresh job matches
    const clearCacheAndRefresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Clear server cache first
            await fetch('/api/jobs/cache', { method: 'DELETE' });
            
            // Build search params with cache bypass
            const params = new URLSearchParams();
            params.set('limit', '20');
            params.set('cache', 'false'); // Bypass server cache
            
            if (searchQuery) {
                params.set('q', searchQuery);
            } else if (hasPreferences) {
                const preferredQuery = jobPreferences.desired_titles?.[0] || 'software developer';
                params.set('q', preferredQuery);
                
                const preferredLocation = jobPreferences.desired_locations?.[0] || 
                    (jobPreferences.desired_countries?.[0] ? getCountryByCode(jobPreferences.desired_countries[0])?.name || '' : '');
                if (preferredLocation) {
                    params.set('location', preferredLocation);
                }
                
                if (jobPreferences.job_types?.includes('remote')) {
                    params.set('remote', 'true');
                }
                
                if (jobPreferences.experience_levels?.[0]) {
                    params.set('experienceLevel', jobPreferences.experience_levels[0]);
                }
            } else {
                params.set('q', 'software developer');
            }

            const response = await fetch(`/api/jobs/search?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                const jobs = data.data.jobs || [];
                setMatchedJobs(jobs);
                
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
            console.error('Error clearing cache and fetching:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, hasPreferences, jobPreferences]);

    // Fetch job matches
    const fetchJobMatches = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Build search query based on user preferences or profile
            const params = new URLSearchParams();
            params.set('limit', '20');
            
            // If we have a search query, use it
            if (searchQuery) {
                params.set('q', searchQuery);
            } else if (hasPreferences) {
                // Use preferences for search
                const preferredQuery = jobPreferences.desired_titles?.[0] || 'software developer';
                params.set('q', preferredQuery);
                
                // Add location from preferences
                const preferredLocation = jobPreferences.desired_locations?.[0] || 
                    (jobPreferences.desired_countries?.[0] ? getCountryByCode(jobPreferences.desired_countries[0])?.name || '' : '');
                if (preferredLocation) {
                    params.set('location', preferredLocation);
                }
                
                // Add remote filter
                if (jobPreferences.job_types?.includes('remote')) {
                    params.set('remote', 'true');
                }
                
                // Add experience level
                if (jobPreferences.experience_levels?.[0]) {
                    params.set('experienceLevel', jobPreferences.experience_levels[0]);
                }
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

    // Initial load - only fetch job matches if user has a CV
    useEffect(() => {
        if (hasCV) {
            fetchJobMatches();
        }
        fetchSavedJobs();
    }, [hasCV]);

    // Search effect - only if user has a CV
    useEffect(() => {
        if (!hasCV) return;
        
        const debounce = setTimeout(() => {
            if (searchQuery.length > 2 || searchQuery.length === 0) {
                fetchJobMatches();
            }
        }, 500);
        
        return () => clearTimeout(debounce);
    }, [searchQuery, fetchJobMatches, hasCV]);

    const tabs = [
        { id: 'matches', label: 'New Matches', count: hasCV ? matchedJobs.length : 0, requiresCV: true },
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
                <div className="flex flex-wrap gap-3">
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
                    {/* Auto-Apply Button */}
                    <button 
                        className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all disabled:opacity-50"
                        style={{ 
                            background: autoApplyRunning 
                                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3))' 
                                : 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                            border: '1px solid rgba(139, 92, 246, 0.5)'
                        }}
                        onClick={() => setShowAutoApplyModal(true)}
                        disabled={autoApplyRunning || !hasCV || !hasPreferences}
                        title={!hasCV ? 'Create CV first' : !hasPreferences ? 'Set preferences first' : 'Run AI auto-apply'}
                    >
                        {autoApplyRunning ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Auto-Applying...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                Auto-Apply
                            </>
                        )}
                    </button>
                    <button 
                        className="btn-icon px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={clearCacheAndRefresh}
                        disabled={loading}
                        title="Clear cached results and fetch fresh jobs"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        Clear Cache
                    </button>
                </div>
            </header>

            {/* Auto-Apply Status Banner */}
            {autoApplyStatus && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                    autoApplyStatus.type === 'success' 
                        ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                        : autoApplyStatus.type === 'error'
                        ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                        : 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                }`}>
                    {autoApplyStatus.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : autoApplyStatus.type === 'error' ? (
                        <AlertCircle className="w-5 h-5" />
                    ) : (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                    <span className="flex-1">{autoApplyStatus.message}</span>
                    <button 
                        onClick={() => setAutoApplyStatus(null)}
                        className="p-1 hover:bg-white/10 rounded"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Preferences Banner */}
            {!hasPreferences ? (
                /* No preferences - prompt to set them up */
                <div className="glass-card-static rounded-2xl p-6" style={{ 
                    background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(244, 63, 94, 0.1) 100%)',
                    border: '1px solid rgba(251, 146, 60, 0.3)',
                }}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                <Info className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Set Up Your Job Preferences</h3>
                                <p className="text-gray-400 text-sm">
                                    Tell us your preferred job titles, location, and experience level to see better job matches tailored to you.
                                </p>
                            </div>
                        </div>
                        <Link 
                            href="/settings" 
                            className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                        >
                            <Settings className="w-4 h-4" />
                            Set Preferences
                        </Link>
                    </div>
                </div>
            ) : preferencesSummary ? (
                /* Has preferences - show what we're matching */
                <div className="glass-card-static rounded-2xl p-6" style={{ 
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                }}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1 flex items-center gap-2">
                                    Matching Jobs for You
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    <strong className="text-white">{preferencesSummary.titles}</strong> in <strong className="text-white">{preferencesSummary.location}</strong>
                                </p>
                            </div>
                        </div>
                        <Link 
                            href="/settings" 
                            className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Edit Preferences
                        </Link>
                    </div>
                </div>
            ) : null}

            {/* CV Required Banner - Show when user doesn't have a CV */}
            {!hasCV && (
                <div className="glass-card-static rounded-2xl p-6" style={{ 
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                }}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Create Your CV to Unlock AI Features</h3>
                                <p className="text-gray-400 text-sm mb-2">
                                    Get personalized match scores, experience comparisons, and quick apply with AI.
                                </p>
                                <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                    <span>📊 Match Score Analysis</span>
                                    <span>⏱️ Experience Comparison</span>
                                    <span>✅ Skills Detection</span>
                                    <span>⚡ Quick Apply</span>
                                </div>
                            </div>
                        </div>
                        <Link 
                            href="/cv-builder" 
                            className="px-4 py-2.5 rounded-lg flex items-center gap-2 whitespace-nowrap font-semibold text-sm"
                            style={{ 
                                background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            Create CV
                        </Link>
                    </div>
                </div>
            )}

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
                    <div className="text-2xl font-bold text-indigo-400">{hasCV ? stats.newToday : '—'}</div>
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
                    <div className="text-2xl font-bold text-pink-400">{hasCV ? `${stats.avgMatch}%` : '—'}</div>
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
                    {!hasCV ? (
                        /* No CV - Show prompt to create CV first */
                        <div className="glass-card-static rounded-2xl p-12 text-center" style={{ 
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                        }}>
                            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10 text-amber-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Create Your CV First</h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                To see AI-powered job matches tailored to your skills and experience, you need to create or upload your CV first.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-400 mb-6">
                                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /> Personalized Matches</span>
                                <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> AI Match Scores</span>
                                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Skills Analysis</span>
                            </div>
                            <Link 
                                href="/cv-builder" 
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base"
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
                            >
                                <Plus className="w-5 h-5" />
                                Create Your CV Now
                            </Link>
                        </div>
                    ) : (
                    <>
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
                                hasCV={hasCV}
                            />
                        ))
                    )}
                    </>
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
                                hasCV={hasCV}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Job Details Modal */}
            {selectedJob && (
                <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} hasCV={hasCV} />
            )}

            {/* Auto-Apply Modal */}
            {showAutoApplyModal && (
                <AutoApplyModal 
                    onClose={() => setShowAutoApplyModal(false)}
                    onRun={runAutoApply}
                    running={autoApplyRunning}
                    results={autoApplyResults}
                    hasCV={hasCV}
                    hasPreferences={hasPreferences}
                />
            )}
        </div>
    );
}

function JobCard({ job, isSaved, onSave, onView, onApply, hasCV = false, onApplySuccess }) {
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null); // 'success', 'error', 'generating'
    const [coverLetterGenerated, setCoverLetterGenerated] = useState(false);
    const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
    const [coverLetterData, setCoverLetterData] = useState(null);
    const colors = generateCompanyColors(job.company);

    const handleApply = async () => {
        if (!hasCV) {
            // Redirect to CV builder if no CV
            window.location.href = '/cv-builder';
            return;
        }

        setApplying(true);
        setApplyStatus('generating');

        try {
            // Call the real apply API
            const response = await fetch('/api/jobs/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: job.id,
                    jobData: {
                        title: job.title,
                        company: job.company,
                        description: job.description,
                        location: job.location,
                        salary: job.salary,
                        skills: job.skills || job.tags,
                        applyUrl: job.applyUrl || job.url,
                        source: job.source,
                    },
                    autoApply: false, // Manual quick apply
                    generateCover: true,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setApplyStatus('success');
                setApplied(true);
                setCoverLetterGenerated(!!data.data?.coverLetter);
                
                // Show cover letter modal instead of directly opening the URL
                if (data.data?.coverLetter) {
                    setCoverLetterData({
                        coverLetter: data.data.coverLetter,
                        applyUrl: data.data.applyUrl,
                        job: {
                            title: job.title,
                            company: job.company,
                        }
                    });
                    setShowCoverLetterModal(true);
                } else if (data.data?.applyUrl && data.data.applyUrl !== '#') {
                    // No cover letter, just open the URL
                    window.open(data.data.applyUrl, '_blank');
                }

                // Notify parent of successful application
                if (onApplySuccess) {
                    onApplySuccess(job, data.data);
                }
            } else if (data.alreadyApplied) {
                setApplyStatus('already');
                setApplied(true);
            } else {
                throw new Error(data.error || 'Application failed');
            }
        } catch (error) {
            console.error('Apply error:', error);
            setApplyStatus('error');
            // Reset after showing error
            setTimeout(() => {
                setApplyStatus(null);
                setApplying(false);
            }, 3000);
        } finally {
            if (applyStatus !== 'error') {
                setApplying(false);
            }
        }
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
                    ) : hasCV ? (
                        <span className={`status-badge ${(job.matchScore || 75) >= 90 ? 'status-high' : 'status-med'}`}>
                            {job.matchScore || Math.floor(Math.random() * 20) + 75}% Match
                        </span>
                    ) : (
                        <Link href="/cv-builder" className="status-badge text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-colors">
                            Create CV to see match
                        </Link>
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
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        applyStatus === 'error'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : applyStatus === 'already'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : applied 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'btn-primary'
                    }`}
                    onClick={handleApply}
                    disabled={applied || applying}
                >
                    {applyStatus === 'generating' ? (
                        <>
                            <Loader2 className="inline-block animate-spin w-4 h-4 mr-2" />
                            Generating Cover Letter...
                        </>
                    ) : applying ? (
                        <>
                            <Loader2 className="inline-block animate-spin w-4 h-4 mr-2" />
                            Applying...
                        </>
                    ) : applyStatus === 'error' ? (
                        '✗ Failed - Try Again'
                    ) : applyStatus === 'already' ? (
                        '⚠ Already Applied'
                    ) : applied ? (
                        <>
                            <CheckCircle className="inline-block w-4 h-4 mr-2" />
                            Applied! {coverLetterGenerated && '(Cover Letter Sent)'}
                        </>
                    ) : !hasCV ? (
                        <>
                            <FileText className="inline-block w-4 h-4 mr-2" />
                            Create CV to Apply
                        </>
                    ) : (
                        <>
                            <Zap className="inline-block w-4 h-4 mr-2" />
                            Quick Apply
                        </>
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

            {/* Application status message */}
            {applied && !applyStatus && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-green-400">
                    ✓ Application recorded. Complete your application on the company site.
                </div>
            )}

            {job.source && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
                    via {job.source === 'remoteok' ? 'Remote OK' : 
                         job.source === 'adzuna' ? 'Adzuna' : 
                         job.source === 'jsearch' ? 'JSearch' : 
                         job.source === 'themuse' ? 'The Muse' : job.source}
                </div>
            )}

            {/* Cover Letter Preview Modal */}
            {showCoverLetterModal && coverLetterData && (
                <CoverLetterModal 
                    coverLetter={coverLetterData.coverLetter}
                    applyUrl={coverLetterData.applyUrl}
                    job={coverLetterData.job}
                    onClose={() => setShowCoverLetterModal(false)}
                />
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
                {((application.apply_url && application.apply_url !== '#') || 
                  (application.applyUrl && application.applyUrl !== '#') || 
                  (application.url && application.url !== '#')) ? (
                    <a 
                        href={application.apply_url || application.applyUrl || application.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-icon px-4 rounded-xl flex items-center justify-center"
                        title="Apply on company site"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </a>
                ) : (
                    <button 
                        className="btn-icon px-4 rounded-xl opacity-50 cursor-not-allowed"
                        title="Application link not available"
                        disabled
                    >
                        <ExternalLink className="w-5 h-5" />
                    </button>
                )}
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

function JobModal({ job, onClose, hasCV = false }) {
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
                            {hasCV ? (
                                <div className="font-semibold text-indigo-400">{job.matchScore || 98}%</div>
                            ) : (
                                <Link href="/cv-builder" className="text-xs text-amber-400 hover:underline">Create CV</Link>
                            )}
                        </div>
                    </div>

                    {/* AI Match Analysis */}
                    {hasCV ? (
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
                    ) : (
                        <div className="glass-card-static rounded-xl p-5 border border-amber-500/30" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-amber-400" />
                                </div>
                                <h3 className="font-semibold">AI Match Analysis</h3>
                            </div>
                            <div className="text-center py-4">
                                <p className="text-gray-400 text-sm mb-3">
                                    Create your CV to unlock AI-powered match analysis, experience comparison, and personalized recommendations.
                                </p>
                                <Link 
                                    href="/cv-builder" 
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm"
                                    style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Your CV
                                </Link>
                            </div>
                        </div>
                    )}

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
                        {(job.applyUrl && job.applyUrl !== '#') || (job.url && job.url !== '#') ? (
                            <a 
                                href={job.applyUrl || job.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-icon px-6 rounded-xl flex items-center justify-center"
                                title="Apply on company site"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        ) : (
                            <button 
                                className="btn-icon px-6 rounded-xl opacity-50 cursor-not-allowed"
                                title="Application link not available"
                                disabled
                            >
                                <ExternalLink className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AutoApplyModal({ onClose, onRun, running, results, hasCV, hasPreferences }) {
    const [settings, setSettings] = useState({
        maxApplications: 5,
        minMatchScore: 75,
        dryRun: false,
    });

    const handleRun = () => {
        onRun(settings);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">AI Auto-Apply</h2>
                            <p className="text-sm text-gray-400">Automatically apply to matching jobs</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Requirements Check */}
                    {(!hasCV || !hasPreferences) && (
                        <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/30">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-amber-300">Requirements Not Met</h3>
                                    <ul className="text-sm text-gray-400 mt-2 space-y-1">
                                        {!hasCV && (
                                            <li className="flex items-center gap-2">
                                                <X className="w-4 h-4 text-red-400" />
                                                <span>Create a CV first</span>
                                                <Link href="/cv-builder" className="text-indigo-400 hover:underline ml-2">→ Create CV</Link>
                                            </li>
                                        )}
                                        {!hasPreferences && (
                                            <li className="flex items-center gap-2">
                                                <X className="w-4 h-4 text-red-400" />
                                                <span>Set up job preferences</span>
                                                <Link href="/settings" className="text-indigo-400 hover:underline ml-2">→ Set Preferences</Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings */}
                    {hasCV && hasPreferences && !results && (
                        <>
                            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                                <h3 className="font-medium mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    How Auto-Apply Works
                                </h3>
                                <ol className="text-sm text-gray-400 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full bg-purple-500/30 text-purple-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                                        <span>AI searches for jobs matching your preferences</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full bg-purple-500/30 text-purple-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                                        <span>Calculates match scores based on your CV</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full bg-purple-500/30 text-purple-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                                        <span>Generates personalized cover letters for each job</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full bg-purple-500/30 text-purple-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                                        <span>Records applications in your history</span>
                                    </li>
                                </ol>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Maximum Applications</label>
                                    <select 
                                        value={settings.maxApplications}
                                        onChange={(e) => setSettings(s => ({ ...s, maxApplications: parseInt(e.target.value) }))}
                                        className="form-input w-full"
                                    >
                                        <option value="1">1 job</option>
                                        <option value="3">3 jobs</option>
                                        <option value="5">5 jobs</option>
                                        <option value="10">10 jobs</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Minimum Match Score</label>
                                    <select 
                                        value={settings.minMatchScore}
                                        onChange={(e) => setSettings(s => ({ ...s, minMatchScore: parseInt(e.target.value) }))}
                                        className="form-input w-full"
                                    >
                                        <option value="90">90% - Very High Match Only</option>
                                        <option value="80">80% - High Match</option>
                                        <option value="75">75% - Good Match</option>
                                        <option value="70">70% - Decent Match</option>
                                    </select>
                                </div>

                                <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={settings.dryRun}
                                        onChange={(e) => setSettings(s => ({ ...s, dryRun: e.target.checked }))}
                                        className="accent-purple-500"
                                    />
                                    <div>
                                        <span className="font-medium">Preview Mode (Dry Run)</span>
                                        <p className="text-xs text-gray-400">See which jobs would be selected without actually applying</p>
                                    </div>
                                </label>
                            </div>
                        </>
                    )}

                    {/* Results */}
                    {results && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-white/5 rounded-xl">
                                    <div className="text-2xl font-bold text-indigo-400">{results.jobsFound}</div>
                                    <div className="text-xs text-gray-400">Jobs Found</div>
                                </div>
                                <div className="text-center p-4 bg-white/5 rounded-xl">
                                    <div className="text-2xl font-bold text-purple-400">{results.jobsAnalyzed}</div>
                                    <div className="text-xs text-gray-400">Analyzed</div>
                                </div>
                                <div className="text-center p-4 bg-white/5 rounded-xl">
                                    <div className="text-2xl font-bold text-pink-400">{results.jobsMatched}</div>
                                    <div className="text-xs text-gray-400">Matched</div>
                                </div>
                                <div className="text-center p-4 bg-white/5 rounded-xl">
                                    <div className="text-2xl font-bold text-green-400">{results.applicationsSubmitted}</div>
                                    <div className="text-xs text-gray-400">Applied</div>
                                </div>
                            </div>

                            {results.applications?.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-3">Applications {results.settings?.dryRun ? '(Preview)' : 'Submitted'}</h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {results.applications.map((app, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                <div>
                                                    <div className="font-medium">{app.job.title}</div>
                                                    <div className="text-sm text-gray-400">{app.job.company}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-purple-400">{app.matchScore}% match</span>
                                                    {app.status === 'would_apply' ? (
                                                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">Preview</span>
                                                    ) : (
                                                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Applied</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.skipped?.length > 0 && (
                                <details className="text-sm">
                                    <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                                        {results.skipped.length} jobs skipped (click to expand)
                                    </summary>
                                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                                        {results.skipped.slice(0, 10).map((skip, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded text-xs">
                                                <span>{skip.job.title} at {skip.job.company}</span>
                                                <span className="text-gray-500">{skip.reason}</span>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}
                        </div>
                    )}

                    {/* Running State */}
                    {running && !results && (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-400 mb-4" />
                            <p className="text-lg font-medium">Auto-Apply in Progress...</p>
                            <p className="text-sm text-gray-400 mt-2">Searching for jobs and generating cover letters</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-white/10">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition font-medium"
                    >
                        {results ? 'Close' : 'Cancel'}
                    </button>
                    {!results && hasCV && hasPreferences && (
                        <button 
                            onClick={handleRun}
                            disabled={running}
                            className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}
                        >
                            {running ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Running...
                                </>
                            ) : settings.dryRun ? (
                                <>
                                    <Eye className="w-5 h-5" />
                                    Preview Jobs
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Start Auto-Apply
                                </>
                            )}
                        </button>
                    )}
                    {results && !results.settings?.dryRun && (
                        <button 
                            onClick={() => window.location.reload()}
                            className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}
                        >
                            <RefreshCw className="w-5 h-5" />
                            Refresh Page
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Cover Letter Preview Modal - Shows before redirecting to apply
function CoverLetterModal({ coverLetter, applyUrl, job, onClose }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(coverLetter);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = coverLetter;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleProceed = () => {
        // Open the apply URL in a new tab
        if (applyUrl && applyUrl !== '#') {
            window.open(applyUrl, '_blank');
        }
        onClose();
    };

    const handleCopyAndProceed = async () => {
        await handleCopy();
        // Small delay to show the copied state
        setTimeout(() => {
            handleProceed();
        }, 500);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="glass-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/20">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-green-300">Cover Letter Ready!</h2>
                            <p className="text-sm text-gray-400">
                                For {job.title} at {job.company}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Instructions */}
                <div className="px-6 py-4 bg-indigo-500/10 border-b border-white/10">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="text-indigo-300 font-medium mb-1">How to use this cover letter:</p>
                            <ol className="text-gray-400 space-y-1 list-decimal list-inside">
                                <li>Review and customize the cover letter below</li>
                                <li>Click "Copy & Apply" to copy it to your clipboard</li>
                                <li>Paste it into the application form on the company's website</li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Cover Letter Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="relative">
                        <div className="absolute top-3 right-3">
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    copied 
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 pr-24">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">
                                {coverLetter}
                            </pre>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-200">
                                <strong>Pro Tip:</strong> Feel free to personalize this cover letter! Add specific projects you've worked on, 
                                or mention why you're particularly excited about this company.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 p-6 border-t border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition font-medium"
                    >
                        Close
                    </button>
                    <button 
                        onClick={handleCopy}
                        className={`px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                            copied 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-white/10 hover:bg-white/20 border border-white/10'
                        }`}
                    >
                        {copied ? (
                            <>
                                <Check className="w-5 h-5" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-5 h-5" />
                                Copy Only
                            </>
                        )}
                    </button>
                    {applyUrl && applyUrl !== '#' && (
                        <button 
                            onClick={handleCopyAndProceed}
                            className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                        >
                            <Copy className="w-5 h-5" />
                            Copy & Apply
                            <ExternalLink className="w-4 h-4 ml-1" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}