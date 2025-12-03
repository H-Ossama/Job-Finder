'use client';
import { useState } from 'react';
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
    Menu
} from 'lucide-react';
import styles from './job-details.module.css';

// Sample job data - in production this would come from API/DB
const SAMPLE_JOB = {
    id: 1,
    title: 'Senior Software Engineer',
    company: 'Google',
    companyLogo: 'G',
    companyColors: ['#4285f4', '#34a853'],
    companyDescription: 'Google is a multinational technology company that specializes in Internet-related services and products.',
    companySize: '150,000+ employees',
    companyLocation: 'Mountain View, California',
    companyWebsite: 'google.com',
    industry: 'Technology',
    location: 'Mountain View, CA',
    locationType: 'Remote Friendly',
    salary: '$180,000 - $250,000',
    jobType: 'Full-time',
    experience: '5+ years',
    matchScore: 98,
    postedAt: '2 days ago',
    description: `We're looking for a Senior Software Engineer to join our team and help build the next generation of AI-powered products. You'll work on cutting-edge technology that impacts billions of users worldwide.

As a Senior Software Engineer, you'll be responsible for designing, developing, and maintaining scalable software solutions. You'll collaborate with cross-functional teams to deliver high-quality products that meet our users' needs.`,
    responsibilities: [
        'Design and implement scalable, high-performance software systems',
        'Lead technical discussions and mentor junior engineers',
        'Collaborate with product managers and designers to define requirements',
        'Write clean, maintainable, and well-documented code',
        'Participate in code reviews and contribute to best practices',
        'Debug and optimize application performance'
    ],
    requirements: [
        '5+ years of experience in software development',
        'Strong proficiency in Python, JavaScript, or similar languages',
        'Experience with cloud platforms (GCP, AWS, or Azure)',
        'Bachelor\'s degree in Computer Science or equivalent experience',
        'Strong problem-solving and communication skills'
    ],
    niceToHave: [
        'Experience with machine learning frameworks (TensorFlow, PyTorch)',
        'Knowledge of distributed systems and microservices architecture',
        'Open source contributions'
    ],
    benefits: [
        { icon: 'dollar', text: 'Competitive salary + equity', color: 'green' },
        { icon: 'shield', text: 'Health, dental & vision insurance', color: 'blue' },
        { icon: 'home', text: 'Work from home flexibility', color: 'purple' },
        { icon: 'book', text: 'Learning & development budget', color: 'amber' },
        { icon: 'heart', text: 'Wellness programs', color: 'pink' },
        { icon: 'calendar', text: 'Unlimited PTO', color: 'cyan' }
    ],
    skills: [
        { name: 'React', match: true },
        { name: 'Python', match: true },
        { name: 'AI/ML', match: true },
        { name: 'Cloud (GCP/AWS)', match: true },
        { name: 'Distributed Systems', match: 'partial' }
    ],
    similarJobs: [
        { id: 2, title: 'Staff Engineer', company: 'Meta', location: 'Remote' },
        { id: 3, title: 'Senior Backend Engineer', company: 'Amazon', location: 'Seattle, WA' },
        { id: 4, title: 'Lead Developer', company: 'Stripe', location: 'San Francisco, CA' }
    ],
    tags: ['Full-time', 'Remote Friendly', '$180k - $250k', '5+ years exp']
};

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

    const job = SAMPLE_JOB; // In production, fetch based on jobId

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
    const userInitial = userName.charAt(0).toUpperCase();

    const handleShare = (platform) => {
        const url = window.location.href;
        const text = `Check out this ${job.title} position at ${job.company}`;
        
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
                        onClick={() => setIsSaved(!isSaved)}
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
                    <div className={styles.grid}>
                        {/* Main Column */}
                        <div className={styles.mainColumn}>
                            {/* Job Header Card */}
                            <div className={styles.glassCard}>
                                <div className={styles.jobHeader}>
                                    <div 
                                        className={styles.companyLogo}
                                        style={{ 
                                            background: `linear-gradient(135deg, ${job.companyColors[0]}, ${job.companyColors[1]})` 
                                        }}
                                    >
                                        {job.companyLogo}
                                    </div>
                                    <div className={styles.jobHeaderInfo}>
                                        <div className={styles.jobTitleRow}>
                                            <div>
                                                <h1 className={styles.jobTitle}>{job.title}</h1>
                                                <p className={styles.companyName}>
                                                    {job.company} • {job.location}
                                                </p>
                                            </div>
                                            <span className={styles.matchBadge}>
                                                {job.matchScore}% Match
                                            </span>
                                        </div>
                                        <div className={styles.tags}>
                                            {job.tags.map(tag => (
                                                <span key={tag} className={styles.tag}>{tag}</span>
                                            ))}
                                        </div>
                                        <div className={styles.applyButtons}>
                                            <button className={styles.btnPrimary}>
                                                <Zap className="w-5 h-5" />
                                                Quick Apply with AI
                                            </button>
                                            <button className={styles.btnSecondary}>
                                                Apply on Company Site
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About the Role */}
                            <div className={styles.glassCard}>
                                <h2 className={styles.sectionTitle}>About the Role</h2>
                                <div className={styles.description}>
                                    {job.description.split('\n\n').map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Responsibilities */}
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

                            {/* Requirements */}
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

                            {/* Nice to Have */}
                            <div className={styles.glassCard}>
                                <h2 className={styles.sectionTitle}>Nice to Have</h2>
                                <ul className={styles.list}>
                                    {job.niceToHave.map((item, i) => (
                                        <li key={i}>
                                            <Star className={styles.purpleIcon} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Benefits */}
                            <div className={styles.glassCard}>
                                <h2 className={styles.sectionTitle}>Benefits & Perks</h2>
                                <div className={styles.benefitsGrid}>
                                    {job.benefits.map((benefit, i) => (
                                        <div key={i} className={styles.benefitItem}>
                                            <div className={`${styles.benefitIcon} ${styles[benefit.color]}`}>
                                                <BenefitIcon type={benefit.icon} className="w-5 h-5" />
                                            </div>
                                            <span>{benefit.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                                            background: `linear-gradient(135deg, ${job.companyColors[0]}, ${job.companyColors[1]})` 
                                        }}
                                    >
                                        {job.companyLogo}
                                    </div>
                                    <div>
                                        <h4>{job.company}</h4>
                                        <p>{job.industry}</p>
                                    </div>
                                </div>
                                <p className={styles.companyDesc}>{job.companyDescription}</p>
                                <div className={styles.companyDetails}>
                                    <div className={styles.detailItem}>
                                        <Users className="w-4 h-4" />
                                        <span>{job.companySize}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <MapPin className="w-4 h-4" />
                                        <span>{job.companyLocation}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <Globe className="w-4 h-4" />
                                        <span>{job.companyWebsite}</span>
                                    </div>
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
                                            <span className={styles.infoValue}>{job.jobType}</span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <DollarSign className="w-5 h-5" />
                                        <div>
                                            <span className={styles.infoLabel}>Salary Range</span>
                                            <span className={styles.infoValue}>{job.salary}</span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Building2 className="w-5 h-5" />
                                        <div>
                                            <span className={styles.infoLabel}>Experience</span>
                                            <span className={styles.infoValue}>{job.experience}</span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Clock className="w-5 h-5" />
                                        <div>
                                            <span className={styles.infoLabel}>Posted</span>
                                            <span className={styles.infoValue}>{job.postedAt}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Match */}
                            <div className={styles.glassCard}>
                                <h3 className={styles.cardTitle}>Your Skills Match</h3>
                                <div className={styles.skillsList}>
                                    {job.skills.map((skill, i) => (
                                        <div key={i} className={styles.skillItem}>
                                            <span>{skill.name}</span>
                                            <span className={`${styles.skillStatus} ${
                                                skill.match === true ? styles.match : 
                                                skill.match === 'partial' ? styles.partial : styles.noMatch
                                            }`}>
                                                {skill.match === true ? '✓ Match' : 
                                                 skill.match === 'partial' ? 'Partial' : '✗ Missing'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Similar Jobs */}
                            <div className={styles.glassCard}>
                                <h3 className={styles.cardTitle}>Similar Jobs</h3>
                                <div className={styles.similarJobs}>
                                    {job.similarJobs.map(similar => (
                                        <Link 
                                            key={similar.id} 
                                            href={`/jobs/${similar.id}`}
                                            className={styles.similarJob}
                                        >
                                            <h4>{similar.title}</h4>
                                            <p>{similar.company} • {similar.location}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
