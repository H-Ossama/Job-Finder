'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { useJobDetailsCache } from '@/hooks';
import { 
    ArrowLeft, 
    Bookmark, 
    Share2, 
    ExternalLink,
    MapPin,
    DollarSign,
    Clock,
    Briefcase,
    Users,
    Globe,
    CheckCircle,
    Circle,
    Star,
    Zap,
    Shield,
    Home,
    Calendar,
    BookOpen,
    Heart,
    Building2,
    Menu,
    Loader2,
    AlertCircle,
    RefreshCw,
    Lightbulb,
    Eye,
    Copy,
    GraduationCap,
    Award,
    School,
    TrendingUp,
    Euro,
    FileText,
    Plus
} from 'lucide-react';
import styles from './job-details.module.css';

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

const BenefitIcon = ({ type, className }) => {
    const icons = {
        dollar: DollarSign,
        shield: Shield,
        home: Home,
        book: BookOpen,
        heart: Heart,
        calendar: Calendar
    };
    const Icon = icons[type] || Star;
    return <Icon className={className} />;
};

export default function JobDetailsContent({ user, profile, jobId, hasCV = false }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    
    // Data state
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [similarJobs, setSimilarJobs] = useState([]);
    const [loadedFromCache, setLoadedFromCache] = useState(false);
    
    // Match score state
    const [matchData, setMatchData] = useState(null);
    const [matchLoading, setMatchLoading] = useState(false);
    const [matchError, setMatchError] = useState(null);
    
    // CV requirement state - don't call AI if no CV
    const [needsCV, setNeedsCV] = useState(!hasCV);
    
    // Smart tip copy feedback
    const [copiedKeyword, setCopiedKeyword] = useState(null);
    
    // Use the job details cache hook
    const { getCachedJob, cacheJob, isJobCached } = useJobDetailsCache();

    // Fetch job details with cache support
    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            setError(null);
            
            // Decode the job ID in case it was URL encoded (e.g., JSearch IDs with == at the end)
            const decodedJobId = decodeURIComponent(jobId);
            
            // Check cache first for instant display
            const cachedJob = getCachedJob(decodedJobId);
            if (cachedJob) {
                setJob(cachedJob);
                setLoading(false);
                setLoadedFromCache(true);
                
                // Still fetch in background to refresh data (stale-while-revalidate)
                fetchFreshJobData(true, decodedJobId);
                
                // Fetch match score if user is logged in
                if (user) {
                    fetchMatchScore(cachedJob);
                }
                return;
            }
            
            // No cache, fetch fresh
            await fetchFreshJobData(false, decodedJobId);
        };
        
        const fetchFreshJobData = async (isBackgroundRefresh, decodedId) => {
            try {
                // URL encode the job ID for the API request
                const response = await fetch(`/api/jobs/${encodeURIComponent(decodedId)}`);
                const data = await response.json();
                
                if (!data.success) {
                    if (!isBackgroundRefresh) {
                        // Show error with message from API if available
                        throw new Error(data.message || data.error || 'Failed to fetch job details');
                    }
                    return;
                }
                
                const fetchedJob = data.data.job;
                
                // Validate that we have real job data, not a placeholder
                if (!fetchedJob || !fetchedJob.title || fetchedJob.title === 'Job Details') {
                    if (!isBackgroundRefresh) {
                        throw new Error('This job may no longer be available or has expired.');
                    }
                    return;
                }
                
                setJob(fetchedJob);
                
                // Cache the job for future visits (use decoded ID)
                cacheJob(decodedId, fetchedJob);
                
                if (!isBackgroundRefresh) {
                    setLoadedFromCache(false);
                }
                
                // Check if job is saved
                const savedResponse = await fetch('/api/jobs/save');
                const savedData = await savedResponse.json();
                if (savedData.success) {
                    const savedIds = savedData.data.jobs?.map(j => j.id) || [];
                    setIsSaved(savedIds.includes(decodedId));
                }
                
                // Fetch similar jobs
                if (fetchedJob?.title) {
                    const keywords = fetchedJob.title.split(' ').slice(0, 2).join(' ');
                    const similarResponse = await fetch(`/api/jobs/search?q=${encodeURIComponent(keywords)}&limit=3`);
                    const similarData = await similarResponse.json();
                    if (similarData.success) {
                        setSimilarJobs(similarData.data.jobs?.filter(j => j.id !== decodedId).slice(0, 3) || []);
                    }
                }
                
                // Fetch match score if user is logged in
                if (user && !isBackgroundRefresh) {
                    fetchMatchScore(fetchedJob);
                }
            } catch (err) {
                console.error('Error fetching job:', err);
                if (!isBackgroundRefresh) {
                    setError(err.message);
                }
            } finally {
                if (!isBackgroundRefresh) {
                    setLoading(false);
                }
            }
        };
        
        if (jobId) {
            fetchJob();
        }
    }, [jobId, user, getCachedJob, cacheJob]);

    // Fetch or calculate match score - only if user has a CV
    const fetchMatchScore = async (jobData) => {
        // Don't call AI if user doesn't have a CV
        if (!hasCV) {
            setNeedsCV(true);
            setMatchError('cv_required');
            return;
        }
        
        setMatchLoading(true);
        setMatchError(null);
        
        try {
            // First check if we have a cached result
            const checkResponse = await fetch(`/api/jobs/match?jobId=${jobId}`);
            const checkData = await checkResponse.json();
            
            if (checkData.success && checkData.data) {
                setMatchData(checkData.data);
                setMatchLoading(false);
                return;
            }
            
            // No cached result, calculate using AI
            const response = await fetch('/api/jobs/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    jobId,
                    jobData: jobData || job
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMatchData(data.data);
            } else if (data.requiresCV) {
                setNeedsCV(true);
                setMatchError('cv_required');
            } else {
                setMatchError(data.error || 'Could not calculate match');
            }
        } catch (err) {
            console.error('Error fetching match score:', err);
            setMatchError('Unable to calculate match');
        } finally {
            setMatchLoading(false);
        }
    };

    // Toggle save job
    const toggleSaveJob = async () => {
        try {
            if (isSaved) {
                await fetch(`/api/jobs/save?jobId=${jobId}`, { method: 'DELETE' });
            } else {
                await fetch('/api/jobs/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobId }),
                });
            }
            setIsSaved(!isSaved);
        } catch (err) {
            console.error('Error saving job:', err);
        }
    };

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
    const userInitial = userName.charAt(0).toUpperCase();

    const handleShare = (platform) => {
        const url = window.location.href;
        const text = `Check out this ${job?.title || 'job'} position at ${job?.company || 'company'}`;
        
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            copy: url
        };

        if (platform === 'copy') {
            navigator.clipboard.writeText(url);
            setShowShareMenu(false);
        } else {
            window.open(shareUrls[platform], '_blank');
            setShowShareMenu(false);
        }
    };

    // Format posted date with proper handling for hours/days/months/years
    const formatPostedDate = (dateStr) => {
        if (!dateStr) return 'Recently';
        
        const date = new Date(dateStr);
        
        // Check if date is valid
        if (isNaN(date.getTime())) return 'Recently';
        
        const now = new Date();
        const diffMs = now - date;
        
        // If date is in the future or too far in the past (before 2020), show "Recently"
        if (diffMs < 0 || date.getFullYear() < 2020) return 'Recently';
        
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);
        
        // Less than 1 hour
        if (diffHours < 1) {
            if (diffMinutes < 1) return 'Just now';
            if (diffMinutes === 1) return '1 minute ago';
            return `${diffMinutes} minutes ago`;
        }
        
        // Less than 24 hours
        if (diffHours < 24) {
            if (diffHours === 1) return '1 hour ago';
            return `${diffHours} hours ago`;
        }
        
        // Days
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        // Weeks
        if (diffWeeks === 1) return '1 week ago';
        if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
        
        // Months
        if (diffMonths === 1) return '1 month ago';
        if (diffMonths < 12) return `${diffMonths} months ago`;
        
        // Years
        if (diffYears === 1) return '1 year ago';
        return `${diffYears} years ago`;
    };

    // Get company colors
    const companyColors = job ? generateCompanyColors(job.company) : ['#6366f1', '#8b5cf6'];

    return (
        <div className={styles.dashboardWrapper}>
            <DashboardSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            {/* Custom Header with extra elements */}
            <header className={styles.customHeader}>
                <div className={styles.headerLeft}>
                    <button 
                        className={styles.mobileMenuBtn}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <Link href="/job-search" className={styles.backLink}>
                        <ArrowLeft className="w-5 h-5" />
                        Back to Search
                    </Link>
                </div>
                <div className={styles.headerRight}>
                    <button 
                        className={`${styles.headerBtn} ${isSaved ? styles.saved : ''}`}
                        onClick={toggleSaveJob}
                    >
                        <Bookmark className="w-4 h-4" />
                        {isSaved ? 'Saved' : 'Save Job'}
                    </button>
                    <div className={styles.shareWrapper}>
                        <button 
                            className={styles.headerBtn}
                            onClick={() => setShowShareMenu(!showShareMenu)}
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                        {showShareMenu && (
                            <div className={styles.shareMenu}>
                                <button onClick={() => handleShare('twitter')}>
                                    Share on Twitter
                                </button>
                                <button onClick={() => handleShare('linkedin')}>
                                    Share on LinkedIn
                                </button>
                                <button onClick={() => handleShare('copy')}>
                                    Copy Link
                                </button>
                            </div>
                        )}
                    </div>
                    {userAvatar ? (
                        <img 
                            src={userAvatar} 
                            alt={userName}
                            className={styles.userAvatar}
                        />
                    ) : (
                        <div className={styles.userAvatarPlaceholder}>
                            {userInitial}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    {/* Loading State */}
                    {loading && (
                        <div className={styles.loadingState}>
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            <p>Loading job details...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className={styles.errorState}>
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <h2>Error loading job</h2>
                            <p>{error}</p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
                                <Link href="/job-search" className={styles.btnPrimary}>
                                    Back to Job Search
                                </Link>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className={styles.btnSecondary || styles.btnPrimary}
                                    style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)' }}
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Instant Load Indicator */}
                    {loadedFromCache && job && !loading && (
                        <div className={styles.instantLoadBadge}>
                            <Zap className="w-4 h-4" />
                            Loaded instantly from cache
                        </div>
                    )}

                    {/* Job Content */}
                    {job && !loading && !error && (
                        <div className={styles.grid}>
                            {/* Main Column */}
                            <div className={styles.mainColumn}>
                                {/* Job Header Card */}
                                <div className={styles.glassCard}>
                                    <div className={styles.jobHeader}>
                                        <div 
                                            className={styles.companyLogo}
                                            style={{ 
                                                background: job.companyLogo && job.companyLogo.startsWith('http') 
                                                    ? `url(${job.companyLogo}) center/contain no-repeat, linear-gradient(135deg, ${companyColors[0]}, ${companyColors[1]})`
                                                    : `linear-gradient(135deg, ${companyColors[0]}, ${companyColors[1]})` 
                                            }}
                                        >
                                            {(!job.companyLogo || !job.companyLogo.startsWith('http')) && 
                                                (job.company?.[0]?.toUpperCase() || 'J')}
                                        </div>
                                        <div className={styles.jobHeaderInfo}>
                                            <div className={styles.jobTitleRow}>
                                                <div>
                                                    <h1 className={styles.jobTitle}>{job.title}</h1>
                                                    <p className={styles.companyName}>
                                                        {job.company} • {job.location || 'Remote'}
                                                    </p>
                                                </div>
                                                {/* AI-Calculated Match Badge */}
                                                {job.isAusbildung && (
                                                    <span 
                                                        className={styles.matchBadge}
                                                        style={{ 
                                                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))',
                                                            color: '#22c55e'
                                                        }}
                                                    >
                                                        <GraduationCap className="w-4 h-4 inline mr-1" />
                                                        Ausbildung
                                                    </span>
                                                )}
                                                {matchLoading && !needsCV ? (
                                                    <span className={styles.matchBadge} style={{ opacity: 0.7 }}>
                                                        <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                                                        Analyzing...
                                                    </span>
                                                ) : matchData ? (
                                                    <span 
                                                        className={`${styles.matchBadge} ${
                                                            matchData.matchScore >= 80 ? styles.matchHigh : 
                                                            matchData.matchScore >= 60 ? styles.matchMedium : 
                                                            styles.matchLow
                                                        }`}
                                                        title={matchData.analysis || 'Based on your CV'}
                                                    >
                                                        {matchData.matchScore}% Match
                                                    </span>
                                                ) : needsCV ? (
                                                    <Link 
                                                        href="/cv-builder" 
                                                        className={styles.matchBadge} 
                                                        style={{ 
                                                            background: 'rgba(245, 158, 11, 0.2)', 
                                                            color: '#f59e0b',
                                                            textDecoration: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Plus className="w-3 h-3 inline mr-1" />
                                                        Create CV to see match
                                                    </Link>
                                                ) : matchError && matchError !== 'cv_required' ? (
                                                    <span className={styles.matchBadge} style={{ opacity: 0.6, fontSize: '0.75rem' }}>
                                                        {matchError}
                                                    </span>
                                                ) : !user ? (
                                                    <span className={styles.matchBadge} style={{ opacity: 0.6, fontSize: '0.75rem' }}>
                                                        Login to see match
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className={styles.tags}>
                                                {(job.tags || job.skills || []).slice(0, 5).map(tag => (
                                                    <span key={tag} className={styles.tag}>{tag}</span>
                                                ))}
                                                {job.remote && <span className={styles.tag}>Remote</span>}
                                                {job.jobType && <span className={styles.tag}>{job.jobType}</span>}
                                            </div>
                                            <div className={styles.applyButtons}>
                                                {needsCV ? (
                                                    <Link href="/cv-builder" className={styles.btnPrimary} style={{ textDecoration: 'none' }}>
                                                        <FileText className="w-5 h-5" />
                                                        Create CV to Apply
                                                    </Link>
                                                ) : (
                                                    <button className={styles.btnPrimary}>
                                                        <Zap className="w-5 h-5" />
                                                        Quick Apply with AI
                                                    </button>
                                                )}
                                                {(job.applyUrl || job.url) && (job.applyUrl || job.url) !== '#' && (
                                                    <a 
                                                        href={job.applyUrl || job.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className={styles.btnSecondary}
                                                    >
                                                        Apply on Company Site
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Smart Tips - Hidden Keywords Detection */}
                                {job.smartTips && job.smartTips.length > 0 && (
                                    <div className={styles.glassCard} style={{
                                        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(251, 191, 36, 0.05))',
                                        border: '1px solid rgba(234, 179, 8, 0.3)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <Lightbulb className="w-5 h-5" style={{ color: '#fbbf24' }} />
                                            <h2 className={styles.sectionTitle} style={{ margin: 0, color: '#fbbf24' }}>
                                                Smart Tip
                                            </h2>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(234, 179, 8, 0.2)',
                                                borderRadius: '4px',
                                                color: '#fbbf24',
                                                fontWeight: 600
                                            }}>
                                                AI Detected
                                            </span>
                                        </div>
                                        <p style={{ 
                                            fontSize: '0.875rem', 
                                            color: 'var(--text-secondary)', 
                                            marginBottom: '1rem',
                                            lineHeight: 1.6
                                        }}>
                                            <Eye className="w-4 h-4 inline mr-1" style={{ opacity: 0.7 }} />
                                            This job posting contains keywords that employers use to verify applicants read the full description. Including these in your application can help you stand out!
                                        </p>
                                        
                                        {job.smartTips.map((tip, index) => (
                                            <div key={index} style={{
                                                background: 'rgba(0,0,0,0.2)',
                                                borderRadius: '8px',
                                                padding: '1rem',
                                                marginBottom: index < job.smartTips.length - 1 ? '0.75rem' : 0
                                            }}>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <span style={{
                                                        fontWeight: 600,
                                                        color: '#fbbf24',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {tip.type === 'hidden_keyword' ? '🔑 Required Keyword' : 
                                                         tip.type === 'tracking_code' ? '🏷️ Tracking Code' : 
                                                         '💡 Possible Keyword'}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(tip.keyword);
                                                            setCopiedKeyword(tip.keyword);
                                                            setTimeout(() => setCopiedKeyword(null), 2000);
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            padding: '0.25rem 0.5rem',
                                                            background: copiedKeyword === tip.keyword 
                                                                ? 'rgba(34, 197, 94, 0.3)' 
                                                                : 'rgba(234, 179, 8, 0.2)',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            color: copiedKeyword === tip.keyword ? '#22c55e' : '#fbbf24',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                        {copiedKeyword === tip.keyword ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                                
                                                <div style={{
                                                    fontFamily: 'monospace',
                                                    fontSize: '1rem',
                                                    fontWeight: 700,
                                                    color: '#fff',
                                                    background: 'rgba(234, 179, 8, 0.15)',
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '4px',
                                                    marginBottom: '0.5rem',
                                                    wordBreak: 'break-all'
                                                }}>
                                                    {tip.keyword}
                                                </div>
                                                
                                                <p style={{
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-secondary)',
                                                    margin: 0,
                                                    lineHeight: 1.5
                                                }}>
                                                    {tip.instruction}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Ausbildung Details Section */}
                                {job.isAusbildung && (
                                    <div className={styles.glassCard} style={{
                                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))',
                                        border: '1px solid rgba(34, 197, 94, 0.3)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <GraduationCap className="w-5 h-5" style={{ color: '#22c55e' }} />
                                            <h2 className={styles.sectionTitle} style={{ margin: 0, color: '#22c55e' }}>
                                                Ausbildung Details
                                            </h2>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 6px',
                                                background: 'rgba(34, 197, 94, 0.2)',
                                                borderRadius: '4px',
                                                color: '#22c55e',
                                                fontWeight: 600
                                            }}>
                                                🇩🇪 German Apprenticeship
                                            </span>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                            {/* Duration */}
                                            <div style={{ 
                                                background: 'rgba(0,0,0,0.2)', 
                                                borderRadius: '8px', 
                                                padding: '1rem',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.75rem'
                                            }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(34, 197, 94, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <Clock className="w-4 h-4" style={{ color: '#22c55e' }} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: 0, marginBottom: '0.25rem' }}>Duration</p>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', margin: 0 }}>
                                                        {job.ausbildungDetails?.duration || '2-3.5 Jahre'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Start Date */}
                                            <div style={{ 
                                                background: 'rgba(0,0,0,0.2)', 
                                                borderRadius: '8px', 
                                                padding: '1rem',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.75rem'
                                            }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(34, 197, 94, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <Calendar className="w-4 h-4" style={{ color: '#22c55e' }} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: 0, marginBottom: '0.25rem' }}>Start Date</p>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', margin: 0 }}>
                                                        {job.ausbildungDetails?.startDate || 'August/September 2025'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Training Salary */}
                                            <div style={{ 
                                                background: 'rgba(0,0,0,0.2)', 
                                                borderRadius: '8px', 
                                                padding: '1rem',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.75rem'
                                            }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(34, 197, 94, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <Euro className="w-4 h-4" style={{ color: '#22c55e' }} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: 0, marginBottom: '0.25rem' }}>Training Salary</p>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', margin: 0 }}>
                                                        {typeof job.ausbildungDetails?.trainingSalary === 'object' 
                                                            ? `${job.ausbildungDetails.trainingSalary.year1} - ${job.ausbildungDetails.trainingSalary.year3 || job.ausbildungDetails.trainingSalary.year2}`
                                                            : job.ausbildungDetails?.trainingSalary || '€680-€1,500/Monat'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Required Education */}
                                            <div style={{ 
                                                background: 'rgba(0,0,0,0.2)', 
                                                borderRadius: '8px', 
                                                padding: '1rem',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.75rem'
                                            }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(34, 197, 94, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <School className="w-4 h-4" style={{ color: '#22c55e' }} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: 0, marginBottom: '0.25rem' }}>Required Education</p>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', margin: 0 }}>
                                                        {job.ausbildungDetails?.requiredEducation?.[0] || 'Schulabschluss erforderlich'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Dual System Info */}
                                        <div style={{ 
                                            background: 'rgba(34, 197, 94, 0.1)', 
                                            borderRadius: '8px', 
                                            padding: '1rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <BookOpen className="w-4 h-4" style={{ color: '#22c55e' }} />
                                                <span style={{ fontWeight: '600', color: '#22c55e', fontSize: '0.875rem' }}>
                                                    Dual Training System
                                                </span>
                                                {job.ausbildungDetails?.isDualStudy && (
                                                    <span style={{
                                                        fontSize: '0.65rem',
                                                        padding: '2px 6px',
                                                        background: 'rgba(99, 102, 241, 0.3)',
                                                        borderRadius: '4px',
                                                        color: '#a78bfa'
                                                    }}>
                                                        Duales Studium
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
                                                {job.ausbildungDetails?.vocationalSchool?.schedule || 'Combination of practical training at the company and theoretical education at a vocational school (Berufsschule).'}
                                            </p>
                                        </div>
                                        
                                        {/* Training Benefits */}
                                        {job.ausbildungDetails?.trainingBenefits?.length > 0 && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Award className="w-4 h-4" style={{ color: '#22c55e' }} />
                                                    Training Benefits
                                                </h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {job.ausbildungDetails.trainingBenefits.map((benefit, i) => (
                                                        <span key={i} style={{
                                                            padding: '0.35rem 0.75rem',
                                                            background: 'rgba(34, 197, 94, 0.15)',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            color: '#22c55e',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}>
                                                            <CheckCircle className="w-3 h-3" />
                                                            {benefit}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Career Prospects */}
                                        {job.ausbildungDetails?.careerProspects?.length > 0 && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <TrendingUp className="w-4 h-4" style={{ color: '#22c55e' }} />
                                                    Career Prospects After Training
                                                </h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {job.ausbildungDetails.careerProspects.map((prospect, i) => (
                                                        <span key={i} style={{
                                                            padding: '0.35rem 0.75rem',
                                                            background: 'rgba(99, 102, 241, 0.15)',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            color: '#a78bfa'
                                                        }}>
                                                            {prospect}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Chamber Certification */}
                                        {job.ausbildungDetails?.chamberCertification && (
                                            <div style={{
                                                background: 'rgba(0,0,0,0.2)',
                                                borderRadius: '8px',
                                                padding: '0.75rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <Shield className="w-4 h-4" style={{ color: '#fbbf24' }} />
                                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                                                    {job.ausbildungDetails.chamberCertification}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* Language Requirements */}
                                        {job.ausbildungDetails?.languageRequirements && (
                                            <div style={{ marginTop: '1rem' }}>
                                                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Globe className="w-4 h-4" style={{ color: '#22c55e' }} />
                                                    Language Requirements
                                                </h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                                    {/* German Level */}
                                                    {job.ausbildungDetails.languageRequirements.germanLevel && (
                                                        <div style={{
                                                            background: 'rgba(0,0,0,0.2)',
                                                            borderRadius: '8px',
                                                            padding: '0.75rem',
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '0.5rem'
                                                        }}>
                                                            <span style={{ fontSize: '1.25rem' }}>🇩🇪</span>
                                                            <div>
                                                                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: 0, marginBottom: '0.25rem' }}>German</p>
                                                                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff', margin: 0 }}>
                                                                    {job.ausbildungDetails.languageRequirements.germanLevel}
                                                                </p>
                                                                {job.ausbildungDetails.languageRequirements.germanLevelCode && (
                                                                    <span style={{
                                                                        display: 'inline-block',
                                                                        marginTop: '0.25rem',
                                                                        padding: '0.15rem 0.4rem',
                                                                        background: 'rgba(34, 197, 94, 0.2)',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: '700',
                                                                        color: '#22c55e'
                                                                    }}>
                                                                        {job.ausbildungDetails.languageRequirements.germanLevelCode}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* English Level */}
                                                    {job.ausbildungDetails.languageRequirements.englishRequired && (
                                                        <div style={{
                                                            background: 'rgba(0,0,0,0.2)',
                                                            borderRadius: '8px',
                                                            padding: '0.75rem',
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '0.5rem'
                                                        }}>
                                                            <span style={{ fontSize: '1.25rem' }}>🇬🇧</span>
                                                            <div>
                                                                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: 0, marginBottom: '0.25rem' }}>English</p>
                                                                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff', margin: 0 }}>
                                                                    {job.ausbildungDetails.languageRequirements.englishLevel}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Other Languages */}
                                                    {job.ausbildungDetails.languageRequirements.otherLanguages?.length > 0 && (
                                                        <div style={{
                                                            background: 'rgba(0,0,0,0.2)',
                                                            borderRadius: '8px',
                                                            padding: '0.75rem',
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '0.5rem'
                                                        }}>
                                                            <span style={{ fontSize: '1.25rem' }}>🌍</span>
                                                            <div>
                                                                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: 0, marginBottom: '0.25rem' }}>Also Helpful</p>
                                                                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff', margin: 0 }}>
                                                                    {job.ausbildungDetails.languageRequirements.otherLanguages.join(', ')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Language Note */}
                                                {job.ausbildungDetails.languageRequirements.note && (
                                                    <p style={{ 
                                                        fontSize: '0.75rem', 
                                                        color: 'rgba(255,255,255,0.6)', 
                                                        marginTop: '0.75rem',
                                                        padding: '0.5rem',
                                                        background: 'rgba(34, 197, 94, 0.05)',
                                                        borderRadius: '4px',
                                                        borderLeft: '2px solid rgba(34, 197, 94, 0.5)'
                                                    }}>
                                                        💡 {job.ausbildungDetails.languageRequirements.note}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* About the Role */}
                                <div className={styles.glassCard}>
                                    <h2 className={styles.sectionTitle}>About the Role</h2>
                                    <div 
                                        className={styles.description}
                                        dangerouslySetInnerHTML={{ 
                                            __html: job.description || 'No description available.' 
                                        }}
                                    />
                                </div>

                                {/* Requirements */}
                                {job.requirements && job.requirements.length > 0 && (
                                    <div className={styles.glassCard}>
                                        <h2 className={styles.sectionTitle}>Requirements</h2>
                                        <ul className={styles.list}>
                                            {job.requirements.map((item, i) => (
                                                <li key={i}>
                                                    <Circle className={styles.blueIcon} />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Responsibilities */}
                                {job.responsibilities && job.responsibilities.length > 0 && (
                                    <div className={styles.glassCard}>
                                        <h2 className={styles.sectionTitle}>Responsibilities</h2>
                                        <ul className={styles.list}>
                                            {job.responsibilities.map((item, i) => (
                                                <li key={i}>
                                                    <CheckCircle className={styles.checkIcon} />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Benefits */}
                                {job.benefits && job.benefits.length > 0 && (
                                    <div className={styles.glassCard}>
                                        <h2 className={styles.sectionTitle}>Benefits & Perks</h2>
                                        <div className={styles.benefitsGrid}>
                                            {job.benefits.map((benefit, i) => (
                                                <div key={i} className={styles.benefitItem}>
                                                    <div className={`${styles.benefitIcon}`}>
                                                        <CheckCircle className="w-5 h-5" />
                                                    </div>
                                                    <span>{typeof benefit === 'string' ? benefit : benefit.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Column */}
                            <div className={styles.sidebarColumn}>
                                {/* CV Required Card - Show when user doesn't have a CV */}
                                {needsCV && !matchData && (
                                    <div className={styles.glassCard} style={{ 
                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)'
                                    }}>
                                        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '50%',
                                                background: 'rgba(245, 158, 11, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 1rem'
                                            }}>
                                                <FileText className="w-7 h-7" style={{ color: '#f59e0b' }} />
                                            </div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                                Create Your CV First
                                            </h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                                To unlock AI-powered features, you need to create your CV.
                                            </p>
                                            
                                            {/* Features user is missing */}
                                            <div style={{ 
                                                textAlign: 'left', 
                                                background: 'rgba(0,0,0,0.2)', 
                                                borderRadius: '8px', 
                                                padding: '0.75rem',
                                                marginBottom: '1rem'
                                            }}>
                                                <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '0.5rem', fontWeight: '600' }}>
                                                    Features you're missing:
                                                </p>
                                                <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1rem', margin: 0 }}>
                                                    <li style={{ marginBottom: '0.25rem' }}>📊 AI Match Score Analysis</li>
                                                    <li style={{ marginBottom: '0.25rem' }}>⏱️ Experience Comparison</li>
                                                    <li style={{ marginBottom: '0.25rem' }}>✅ Skills Match Detection</li>
                                                    <li style={{ marginBottom: '0.25rem' }}>🎯 Personalized Recommendations</li>
                                                    <li>⚡ Quick Apply with AI</li>
                                                </ul>
                                            </div>
                                            
                                            <Link 
                                                href="/cv-builder"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.75rem 1.5rem',
                                                    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    fontWeight: '600',
                                                    fontSize: '0.875rem',
                                                    textDecoration: 'none',
                                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                                }}
                                            >
                                                <Plus className="w-4 h-4" />
                                                Create Your CV Now
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Match Loading State */}
                                {matchLoading && !needsCV && (
                                    <div className={styles.glassCard}>
                                        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#818cf8' }} />
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                Analyzing your CV match...
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Match Analysis Card - Only show if we have match data */}
                                {matchData && (
                                    <div className={styles.glassCard}>
                                        <h3 className={styles.cardTitle}>
                                            <Star className="w-4 h-4 inline mr-2" />
                                            CV Match Analysis
                                        </h3>
                                        
                                        {/* Match Score Circle */}
                                        <div className={styles.matchScoreCircle} style={{ textAlign: 'center', margin: '1rem 0' }}>
                                            <div style={{
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: '50%',
                                                background: `conic-gradient(
                                                    ${matchData.matchScore >= 80 ? '#22c55e' : matchData.matchScore >= 60 ? '#f59e0b' : '#ef4444'} 
                                                    ${matchData.matchScore * 3.6}deg, 
                                                    rgba(255,255,255,0.1) 0deg
                                                )`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto',
                                                position: 'relative'
                                            }}>
                                                <div style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '50%',
                                                    background: 'var(--card-bg, #1a1a2e)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexDirection: 'column'
                                                }}>
                                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                                        {matchData.matchScore}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Experience Comparison */}
                                        {matchData.experienceAnalysis && (
                                            <div style={{ 
                                                marginBottom: '1rem', 
                                                padding: '0.75rem', 
                                                background: matchData.experienceAnalysis.isEntryLevel 
                                                    ? 'rgba(34, 197, 94, 0.1)' 
                                                    : 'rgba(99, 102, 241, 0.1)', 
                                                borderRadius: '8px',
                                                border: `1px solid ${matchData.experienceAnalysis.isEntryLevel ? 'rgba(34, 197, 94, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`
                                            }}>
                                                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: matchData.experienceAnalysis.isEntryLevel ? '#22c55e' : '#818cf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Briefcase className="w-4 h-4" />
                                                    {matchData.experienceAnalysis.isEntryLevel ? 'Entry Level Position' : 'Experience Comparison'}
                                                </h4>
                                                {matchData.experienceAnalysis.isEntryLevel || matchData.experienceAnalysis.requiredYears === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                                                        <div style={{ 
                                                            display: 'inline-block',
                                                            padding: '0.5rem 1rem', 
                                                            borderRadius: '8px',
                                                            background: 'rgba(34, 197, 94, 0.2)',
                                                            color: '#22c55e',
                                                            fontWeight: '600',
                                                            marginBottom: '0.5rem'
                                                        }}>
                                                            ✓ No Experience Required
                                                        </div>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                            This is an entry-level position open to all candidates, including those without prior work experience.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                            <div style={{ textAlign: 'center', flex: 1 }}>
                                                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#a5b4fc' }}>
                                                                    {matchData.experienceAnalysis.userYears || 0}
                                                                </div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Your Years</div>
                                                            </div>
                                                            <div style={{ 
                                                                padding: '0.25rem 0.5rem', 
                                                                borderRadius: '4px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600',
                                                                background: matchData.experienceAnalysis.meetsRequirement 
                                                                    ? 'rgba(34, 197, 94, 0.2)' 
                                                                    : 'rgba(239, 68, 68, 0.2)',
                                                                color: matchData.experienceAnalysis.meetsRequirement 
                                                                    ? '#22c55e' 
                                                                    : '#ef4444'
                                                            }}>
                                                                {matchData.experienceAnalysis.meetsRequirement ? '✓ Meets' : `${Math.abs(matchData.experienceAnalysis.experienceGap || 0)} yrs gap`}
                                                            </div>
                                                            <div style={{ textAlign: 'center', flex: 1 }}>
                                                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>
                                                                    {matchData.experienceAnalysis.requiredYears || 0}
                                                                </div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Required</div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                {matchData.experienceAnalysis.relevantExperience && (
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                                        {matchData.experienceAnalysis.relevantExperience}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Analysis Text */}
                                        {matchData.analysis && (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                                {matchData.analysis}
                                            </p>
                                        )}
                                        
                                        {/* Matched Skills */}
                                        {matchData.matchedSkills?.length > 0 && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#22c55e' }}>
                                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                                    Skills You Have
                                                </h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {matchData.matchedSkills.slice(0, 6).map((skill, i) => (
                                                        <span key={i} style={{
                                                            padding: '0.25rem 0.5rem',
                                                            background: 'rgba(34, 197, 94, 0.2)',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            color: '#22c55e'
                                                        }}>
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Missing Skills */}
                                        {matchData.missingSkills?.length > 0 && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#f59e0b' }}>
                                                    <AlertCircle className="w-4 h-4 inline mr-1" />
                                                    Skills to Develop
                                                </h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {matchData.missingSkills.slice(0, 6).map((skill, i) => (
                                                        <span key={i} style={{
                                                            padding: '0.25rem 0.5rem',
                                                            background: 'rgba(245, 158, 11, 0.2)',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            color: '#f59e0b'
                                                        }}>
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Recommendations */}
                                        {matchData.recommendations?.length > 0 && (
                                            <div>
                                                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                                    Recommendations
                                                </h4>
                                                <ul style={{ fontSize: '0.75rem', paddingLeft: '1rem', color: 'var(--text-secondary)' }}>
                                                    {matchData.recommendations.slice(0, 3).map((rec, i) => (
                                                        <li key={i} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {matchData.cached && (
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                                                Analyzed {formatPostedDate(matchData.calculatedAt)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Company Info */}
                                <div className={styles.glassCard}>
                                    <h3 className={styles.cardTitle}>About {job.company}</h3>
                                    <div className={styles.companyInfo}>
                                        <div 
                                            className={styles.companyLogoSmall}
                                            style={{ 
                                                background: job.companyLogo && job.companyLogo.startsWith('http') 
                                                    ? `url(${job.companyLogo}) center/contain no-repeat, linear-gradient(135deg, ${companyColors[0]}, ${companyColors[1]})`
                                                    : `linear-gradient(135deg, ${companyColors[0]}, ${companyColors[1]})` 
                                            }}
                                        >
                                            {(!job.companyLogo || !job.companyLogo.startsWith('http')) && 
                                                (job.company?.[0]?.toUpperCase() || 'J')}
                                        </div>
                                        <div>
                                            <h4>{job.company}</h4>
                                            <p>{job.industry || 'Technology'}</p>
                                        </div>
                                    </div>
                                    {job.companyDescription && (
                                        <p className={styles.companyDesc}>{job.companyDescription}</p>
                                    )}
                                    <div className={styles.companyDetails}>
                                        <div className={styles.detailItem}>
                                            <MapPin className="w-4 h-4" />
                                            <span>{job.location || 'Remote'}</span>
                                        </div>
                                        {job.companyWebsite && (
                                            <div className={styles.detailItem}>
                                                <Globe className="w-4 h-4" />
                                                <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer">
                                                    {job.companyWebsite.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Job Info */}
                                <div className={styles.glassCard}>
                                    <h3 className={styles.cardTitle}>Job Information</h3>
                                    <div className={styles.infoItems}>
                                        <div className={styles.infoItem}>
                                            <Briefcase className="w-5 h-5" />
                                            <div>
                                                <span className={styles.infoLabel}>Job Type</span>
                                                <span className={styles.infoValue}>{job.jobType || 'Full-time'}</span>
                                            </div>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <DollarSign className="w-5 h-5" />
                                            <div>
                                                <span className={styles.infoLabel}>Salary Range</span>
                                                <span className={styles.infoValue}>{job.salary || 'Not specified'}</span>
                                            </div>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <Clock className="w-5 h-5" />
                                            <div>
                                                <span className={styles.infoLabel}>Posted</span>
                                                <span className={styles.infoValue}>{formatPostedDate(job.postedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills Match */}
                                {(job.skills || job.tags) && (job.skills || job.tags).length > 0 && (
                                    <div className={styles.glassCard}>
                                        <h3 className={styles.cardTitle}>Required Skills</h3>
                                        <div className={styles.skillsList}>
                                            {(job.skills || job.tags).map((skill, i) => (
                                                <div key={i} className={styles.skillItem}>
                                                    <span>{typeof skill === 'string' ? skill : skill.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Source Attribution */}
                                {job.source && (
                                    <div className={styles.glassCard}>
                                        <h3 className={styles.cardTitle}>Job Source</h3>
                                        <p className={styles.sourceInfo}>
                                            This job was found via {
                                                job.source === 'remoteok' ? 'Remote OK' :
                                                job.source === 'adzuna' ? 'Adzuna' :
                                                job.source === 'jsearch' ? 'JSearch' :
                                                job.source === 'themuse' ? 'The Muse' :
                                                job.source
                                            }
                                        </p>
                                        {job.url && (
                                            <a 
                                                href={job.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={styles.sourceLink}
                                            >
                                                View Original Posting
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Similar Jobs */}
                                {similarJobs.length > 0 && (
                                    <div className={styles.glassCard}>
                                        <h3 className={styles.cardTitle}>Similar Jobs</h3>
                                        <div className={styles.similarJobs}>
                                            {similarJobs.map(similar => (
                                                <Link 
                                                    key={similar.id} 
                                                    href={`/jobs/${encodeURIComponent(similar.id)}`}
                                                    className={styles.similarJob}
                                                >
                                                    <h4>{similar.title}</h4>
                                                    <p>{similar.company} • {similar.location || 'Remote'}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
