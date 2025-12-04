'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
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
    RefreshCw
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

export default function JobDetailsContent({ user, profile, jobId }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    
    // Data state
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [similarJobs, setSimilarJobs] = useState([]);

    // Fetch job details
    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`/api/jobs/${jobId}`);
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Failed to fetch job details');
                }
                
                setJob(data.data.job);
                
                // Check if job is saved
                const savedResponse = await fetch('/api/jobs/save');
                const savedData = await savedResponse.json();
                if (savedData.success) {
                    const savedIds = savedData.data.jobs?.map(j => j.id) || [];
                    setIsSaved(savedIds.includes(jobId));
                }
                
                // Fetch similar jobs
                if (data.data.job?.title) {
                    const keywords = data.data.job.title.split(' ').slice(0, 2).join(' ');
                    const similarResponse = await fetch(`/api/jobs/search?q=${encodeURIComponent(keywords)}&limit=3`);
                    const similarData = await similarResponse.json();
                    if (similarData.success) {
                        setSimilarJobs(similarData.data.jobs?.filter(j => j.id !== jobId).slice(0, 3) || []);
                    }
                }
            } catch (err) {
                console.error('Error fetching job:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        if (jobId) {
            fetchJob();
        }
    }, [jobId]);

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

    // Format posted date
    const formatPostedDate = (dateStr) => {
        if (!dateStr) return 'Recently';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
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
                            <Link href="/job-search" className={styles.btnPrimary}>
                                Back to Job Search
                            </Link>
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
                                                <span className={styles.matchBadge}>
                                                    {job.matchScore || Math.floor(Math.random() * 20) + 75}% Match
                                                </span>
                                            </div>
                                            <div className={styles.tags}>
                                                {(job.tags || job.skills || []).slice(0, 5).map(tag => (
                                                    <span key={tag} className={styles.tag}>{tag}</span>
                                                ))}
                                                {job.remote && <span className={styles.tag}>Remote</span>}
                                                {job.jobType && <span className={styles.tag}>{job.jobType}</span>}
                                            </div>
                                            <div className={styles.applyButtons}>
                                                <button className={styles.btnPrimary}>
                                                    <Zap className="w-5 h-5" />
                                                    Quick Apply with AI
                                                </button>
                                                {job.url && (
                                                    <a 
                                                        href={job.url} 
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
                                            <Building2 className="w-5 h-5" />
                                            <div>
                                                <span className={styles.infoLabel}>Experience</span>
                                                <span className={styles.infoValue}>{job.experienceLevel || 'Not specified'}</span>
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
                                                    href={`/jobs/${similar.id}`}
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
