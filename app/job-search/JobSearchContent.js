'use client';
import { useState } from 'react';
import Link from 'next/link';
import { 
    Search, 
    MapPin, 
    Filter, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight,
    Briefcase,
    DollarSign,
    Clock,
    Building2,
    Globe,
    Star,
    Bookmark,
    X,
    Sliders,
    TrendingUp,
    Zap
} from 'lucide-react';
import styles from './job-search.module.css';

// Job platforms/sources
const JOB_PLATFORMS = [
    { id: 'all', name: 'All Platforms', icon: Globe },
    { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
    { id: 'indeed', name: 'Indeed', color: '#2164f3' },
    { id: 'glassdoor', name: 'Glassdoor', color: '#0CAA41' },
    { id: 'monster', name: 'Monster', color: '#6e45a5' },
    { id: 'ziprecruiter', name: 'ZipRecruiter', color: '#5ba3e0' },
    { id: 'wellfound', name: 'Wellfound', color: '#000' },
    { id: 'remoteok', name: 'Remote OK', color: '#ff5858' },
    { id: 'weworkremotely', name: 'WeWorkRemotely', color: '#00a1e0' },
    { id: 'dice', name: 'Dice', color: '#eb1c2d' },
    { id: 'stackoverflow', name: 'Stack Overflow', color: '#f48024' },
];

// Quick filters
const QUICK_FILTERS = [
    'All Jobs', 'Remote', 'Full-time', 'Part-time', 'Contract', 
    '$100k+', '$150k+', 'Entry Level', 'Senior', 'Startup'
];

// Sample job data
const SAMPLE_JOBS = [
    {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'Google',
        companyLogo: 'G',
        companyColors: ['#4285f4', '#34a853'],
        location: 'Mountain View, CA',
        salary: '$180k - $250k',
        matchScore: 98,
        tags: ['React', 'Python', 'AI/ML', 'Remote'],
        description: 'Join our team to build cutting-edge AI products that impact billions of users worldwide. Work with the best engineers...',
        postedAt: '2 days ago',
        platform: 'linkedin',
        featured: true
    },
    {
        id: 2,
        title: 'Full Stack Developer',
        company: 'Amazon',
        companyLogo: 'A',
        companyColors: ['#ff9900', '#ff5722'],
        location: 'Remote',
        salary: '$150k - $200k',
        matchScore: 95,
        tags: ['TypeScript', 'AWS', 'Node.js', 'Full-time'],
        description: 'Work on AWS services used by millions of developers. Build scalable solutions for cloud infrastructure...',
        postedAt: '1 day ago',
        platform: 'indeed'
    },
    {
        id: 3,
        title: 'Backend Engineer',
        company: 'Stripe',
        companyLogo: 'S',
        companyColors: ['#635bff', '#00d4ff'],
        location: 'San Francisco, CA',
        salary: '$160k - $220k',
        matchScore: 87,
        tags: ['Ruby', 'Go', 'PostgreSQL'],
        description: 'Help build the financial infrastructure for the internet. Work on payments APIs used by millions of businesses...',
        postedAt: '3 days ago',
        platform: 'glassdoor'
    },
    {
        id: 4,
        title: 'Frontend Engineer',
        company: 'Netflix',
        companyLogo: 'N',
        companyColors: ['#e50914', '#b20710'],
        location: 'Los Gatos, CA',
        salary: '$170k - $230k',
        matchScore: 92,
        tags: ['React', 'JavaScript', 'CSS'],
        description: 'Build the next generation of streaming experiences. Work on UI that millions of users interact with daily...',
        postedAt: '5 days ago',
        platform: 'wellfound'
    },
    {
        id: 5,
        title: 'Product Engineer',
        company: 'Meta',
        companyLogo: 'M',
        companyColors: ['#0668E1', '#1877f2'],
        location: 'Menlo Park, CA',
        salary: '$180k - $260k',
        matchScore: 85,
        tags: ['C++', 'Unity', 'VR/AR'],
        description: 'Join the team building the metaverse. Work on cutting-edge VR/AR technologies...',
        postedAt: '1 week ago',
        platform: 'linkedin'
    },
    {
        id: 6,
        title: 'DevOps Engineer',
        company: 'X (Twitter)',
        companyLogo: 'X',
        companyColors: ['#000', '#333'],
        location: 'Remote',
        salary: '$140k - $190k',
        matchScore: 78,
        tags: ['Kubernetes', 'Terraform', 'AWS'],
        description: 'Scale infrastructure to handle billions of tweets. Build reliable systems for real-time communication...',
        postedAt: '1 week ago',
        platform: 'remoteok'
    },
    {
        id: 7,
        title: 'Machine Learning Engineer',
        company: 'OpenAI',
        companyLogo: 'O',
        companyColors: ['#10a37f', '#1a1a2e'],
        location: 'San Francisco, CA',
        salary: '$200k - $350k',
        matchScore: 94,
        tags: ['Python', 'PyTorch', 'LLMs', 'Research'],
        description: 'Work on the next generation of AI systems. Help make AI safe and beneficial for humanity...',
        postedAt: '4 days ago',
        platform: 'linkedin',
        featured: true
    },
    {
        id: 8,
        title: 'iOS Developer',
        company: 'Apple',
        companyLogo: '',
        companyColors: ['#555', '#000'],
        location: 'Cupertino, CA',
        salary: '$175k - $240k',
        matchScore: 81,
        tags: ['Swift', 'SwiftUI', 'iOS', 'Objective-C'],
        description: 'Design and build the next generation of iOS apps. Create experiences that delight millions of users...',
        postedAt: '6 days ago',
        platform: 'dice'
    }
];

// Advanced filter options
const ADVANCED_FILTERS = {
    jobType: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    experienceLevel: ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'],
    salaryRange: ['$0 - $50k', '$50k - $100k', '$100k - $150k', '$150k - $200k', '$200k - $300k', '$300k+'],
    datePosted: ['Last 24 hours', 'Last 3 days', 'Last week', 'Last 2 weeks', 'Last month', 'Any time'],
    companySize: ['Startup (1-50)', 'Small (51-200)', 'Medium (201-1000)', 'Large (1001-5000)', 'Enterprise (5000+)'],
    industry: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Education', 'Media', 'Gaming', 'AI/ML', 'Crypto/Web3'],
    benefits: ['Health Insurance', 'Remote Work', 'Unlimited PTO', '401k Match', 'Stock Options', 'Learning Budget', 'Gym Membership', 'Parental Leave']
};

export default function JobSearchContent({ user, profile }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState(['All Jobs']);
    const [selectedPlatforms, setSelectedPlatforms] = useState(['all']);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [sortBy, setSortBy] = useState('relevant');
    const [savedJobs, setSavedJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [advancedFilters, setAdvancedFilters] = useState({
        jobType: [],
        experienceLevel: [],
        salaryRange: [],
        datePosted: '',
        companySize: [],
        industry: [],
        benefits: []
    });

    const toggleQuickFilter = (filter) => {
        if (filter === 'All Jobs') {
            setActiveFilters(['All Jobs']);
        } else {
            setActiveFilters(prev => {
                const newFilters = prev.filter(f => f !== 'All Jobs');
                if (newFilters.includes(filter)) {
                    const result = newFilters.filter(f => f !== filter);
                    return result.length === 0 ? ['All Jobs'] : result;
                }
                return [...newFilters, filter];
            });
        }
    };

    const togglePlatform = (platformId) => {
        if (platformId === 'all') {
            setSelectedPlatforms(['all']);
        } else {
            setSelectedPlatforms(prev => {
                const newPlatforms = prev.filter(p => p !== 'all');
                if (newPlatforms.includes(platformId)) {
                    const result = newPlatforms.filter(p => p !== platformId);
                    return result.length === 0 ? ['all'] : result;
                }
                return [...newPlatforms, platformId];
            });
        }
    };

    const toggleSaveJob = (jobId) => {
        setSavedJobs(prev => 
            prev.includes(jobId) 
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
        );
    };

    const toggleAdvancedFilter = (category, value) => {
        setAdvancedFilters(prev => ({
            ...prev,
            [category]: category === 'datePosted' 
                ? (prev[category] === value ? '' : value)
                : prev[category].includes(value)
                    ? prev[category].filter(v => v !== value)
                    : [...prev[category], value]
        }));
    };

    const clearAllFilters = () => {
        setActiveFilters(['All Jobs']);
        setSelectedPlatforms(['all']);
        setAdvancedFilters({
            jobType: [],
            experienceLevel: [],
            salaryRange: [],
            datePosted: '',
            companySize: [],
            industry: [],
            benefits: []
        });
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (!activeFilters.includes('All Jobs')) count += activeFilters.length;
        if (!selectedPlatforms.includes('all')) count += selectedPlatforms.length;
        Object.values(advancedFilters).forEach(val => {
            if (Array.isArray(val)) count += val.length;
            else if (val) count += 1;
        });
        return count;
    };

    const getMatchBadgeClass = (score) => {
        if (score >= 90) return styles.matchHigh;
        if (score >= 75) return styles.matchMedium;
        return styles.matchLow;
    };

    return (
        <div className={styles.jobSearchContainer}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    Find Your <span className="text-gradient">Dream Job</span>
                </h1>
                <p className={styles.pageSubtitle}>
                    Search from thousands of jobs across multiple platforms tailored to your skills
                </p>
            </div>

            {/* Search Section */}
            <div className={`${styles.glassCard} ${styles.searchCard}`}>
                <div className={styles.searchGrid}>
                    <div className={styles.searchField}>
                        <label className={styles.searchLabel}>Job Title or Keywords</label>
                        <div className={styles.inputWrapper}>
                            <Search className={styles.inputIcon} />
                            <input 
                                type="text"
                                className={styles.searchInput}
                                placeholder="e.g. Software Engineer, React, Python"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.searchField}>
                        <label className={styles.searchLabel}>Location</label>
                        <div className={styles.inputWrapper}>
                            <MapPin className={styles.inputIcon} />
                            <input 
                                type="text"
                                className={styles.searchInput}
                                placeholder="City, State or Remote"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.searchActions}>
                        <button className={styles.btnPrimary}>
                            <Search className="w-5 h-5" />
                            Search Jobs
                        </button>
                    </div>
                </div>

                {/* Advanced Filters Toggle */}
                <div className={styles.advancedToggle}>
                    <button 
                        className={`${styles.advancedBtn} ${showAdvancedFilters ? styles.active : ''}`}
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                        <Sliders className="w-4 h-4" />
                        Advanced Filters
                        {getActiveFilterCount() > 0 && (
                            <span className={styles.filterCount}>{getActiveFilterCount()}</span>
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                    </button>
                    {getActiveFilterCount() > 0 && (
                        <button className={styles.clearFiltersBtn} onClick={clearAllFilters}>
                            <X className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
                <div className={`${styles.glassCard} ${styles.advancedFiltersCard}`}>
                    {/* Job Platforms */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.filterTitle}>
                            <Globe className="w-4 h-4" />
                            Job Platforms
                        </h3>
                        <div className={styles.platformGrid}>
                            {JOB_PLATFORMS.map(platform => (
                                <button
                                    key={platform.id}
                                    className={`${styles.platformChip} ${selectedPlatforms.includes(platform.id) ? styles.active : ''}`}
                                    onClick={() => togglePlatform(platform.id)}
                                    style={platform.color && selectedPlatforms.includes(platform.id) ? { 
                                        borderColor: platform.color,
                                        backgroundColor: `${platform.color}20`
                                    } : {}}
                                >
                                    {platform.icon ? <platform.icon className="w-4 h-4" /> : null}
                                    {platform.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterGrid}>
                        {/* Job Type */}
                        <div className={styles.filterSection}>
                            <h3 className={styles.filterTitle}>
                                <Briefcase className="w-4 h-4" />
                                Job Type
                            </h3>
                            <div className={styles.filterOptions}>
                                {ADVANCED_FILTERS.jobType.map(type => (
                                    <label key={type} className={styles.checkboxLabel}>
                                        <input 
                                            type="checkbox"
                                            checked={advancedFilters.jobType.includes(type)}
                                            onChange={() => toggleAdvancedFilter('jobType', type)}
                                            className={styles.checkbox}
                                        />
                                        <span className={styles.checkmark}></span>
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Experience Level */}
                        <div className={styles.filterSection}>
                            <h3 className={styles.filterTitle}>
                                <TrendingUp className="w-4 h-4" />
                                Experience Level
                            </h3>
                            <div className={styles.filterOptions}>
                                {ADVANCED_FILTERS.experienceLevel.map(level => (
                                    <label key={level} className={styles.checkboxLabel}>
                                        <input 
                                            type="checkbox"
                                            checked={advancedFilters.experienceLevel.includes(level)}
                                            onChange={() => toggleAdvancedFilter('experienceLevel', level)}
                                            className={styles.checkbox}
                                        />
                                        <span className={styles.checkmark}></span>
                                        {level}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Salary Range */}
                        <div className={styles.filterSection}>
                            <h3 className={styles.filterTitle}>
                                <DollarSign className="w-4 h-4" />
                                Salary Range
                            </h3>
                            <div className={styles.filterOptions}>
                                {ADVANCED_FILTERS.salaryRange.map(range => (
                                    <label key={range} className={styles.checkboxLabel}>
                                        <input 
                                            type="checkbox"
                                            checked={advancedFilters.salaryRange.includes(range)}
                                            onChange={() => toggleAdvancedFilter('salaryRange', range)}
                                            className={styles.checkbox}
                                        />
                                        <span className={styles.checkmark}></span>
                                        {range}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Date Posted */}
                        <div className={styles.filterSection}>
                            <h3 className={styles.filterTitle}>
                                <Clock className="w-4 h-4" />
                                Date Posted
                            </h3>
                            <div className={styles.filterOptions}>
                                {ADVANCED_FILTERS.datePosted.map(date => (
                                    <label key={date} className={styles.radioLabel}>
                                        <input 
                                            type="radio"
                                            name="datePosted"
                                            checked={advancedFilters.datePosted === date}
                                            onChange={() => toggleAdvancedFilter('datePosted', date)}
                                            className={styles.radio}
                                        />
                                        <span className={styles.radioMark}></span>
                                        {date}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Company Size */}
                        <div className={styles.filterSection}>
                            <h3 className={styles.filterTitle}>
                                <Building2 className="w-4 h-4" />
                                Company Size
                            </h3>
                            <div className={styles.filterOptions}>
                                {ADVANCED_FILTERS.companySize.map(size => (
                                    <label key={size} className={styles.checkboxLabel}>
                                        <input 
                                            type="checkbox"
                                            checked={advancedFilters.companySize.includes(size)}
                                            onChange={() => toggleAdvancedFilter('companySize', size)}
                                            className={styles.checkbox}
                                        />
                                        <span className={styles.checkmark}></span>
                                        {size}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Industry */}
                        <div className={styles.filterSection}>
                            <h3 className={styles.filterTitle}>
                                <Zap className="w-4 h-4" />
                                Industry
                            </h3>
                            <div className={styles.filterOptions}>
                                {ADVANCED_FILTERS.industry.map(ind => (
                                    <label key={ind} className={styles.checkboxLabel}>
                                        <input 
                                            type="checkbox"
                                            checked={advancedFilters.industry.includes(ind)}
                                            onChange={() => toggleAdvancedFilter('industry', ind)}
                                            className={styles.checkbox}
                                        />
                                        <span className={styles.checkmark}></span>
                                        {ind}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.filterTitle}>
                            <Star className="w-4 h-4" />
                            Benefits & Perks
                        </h3>
                        <div className={styles.benefitsGrid}>
                            {ADVANCED_FILTERS.benefits.map(benefit => (
                                <button
                                    key={benefit}
                                    className={`${styles.benefitChip} ${advancedFilters.benefits.includes(benefit) ? styles.active : ''}`}
                                    onClick={() => toggleAdvancedFilter('benefits', benefit)}
                                >
                                    {benefit}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Filters */}
            <div className={styles.quickFilters}>
                {QUICK_FILTERS.map(filter => (
                    <button
                        key={filter}
                        className={`${styles.filterChip} ${activeFilters.includes(filter) ? styles.active : ''}`}
                        onClick={() => toggleQuickFilter(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Results Header */}
            <div className={styles.resultsHeader}>
                <p className={styles.resultsCount}>
                    <span>{SAMPLE_JOBS.length.toLocaleString()}</span> jobs found
                </p>
                <div className={styles.sortWrapper}>
                    <select 
                        className={styles.sortSelect}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="relevant">Most Relevant</option>
                        <option value="newest">Newest First</option>
                        <option value="salaryHigh">Salary: High to Low</option>
                        <option value="salaryLow">Salary: Low to High</option>
                        <option value="matchScore">Best Match</option>
                    </select>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className={styles.jobsGrid}>
                {SAMPLE_JOBS.map(job => (
                    <Link 
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className={`${styles.jobCard} ${job.featured ? styles.featured : ''}`}
                    >
                        {job.featured && (
                            <div className={styles.featuredBadge}>
                                <Star className="w-3 h-3" />
                                Featured
                            </div>
                        )}
                        
                        <div className={styles.jobHeader}>
                            <div 
                                className={styles.companyLogo}
                                style={{ 
                                    background: `linear-gradient(135deg, ${job.companyColors[0]}, ${job.companyColors[1]})` 
                                }}
                            >
                                {job.companyLogo}
                            </div>
                            <div className={styles.jobInfo}>
                                <div className={styles.jobTitleRow}>
                                    <h3 className={styles.jobTitle}>{job.title}</h3>
                                    <span className={`${styles.matchBadge} ${getMatchBadgeClass(job.matchScore)}`}>
                                        {job.matchScore}% Match
                                    </span>
                                </div>
                                <p className={styles.companyName}>{job.company}</p>
                            </div>
                        </div>

                        <p className={styles.jobDescription}>{job.description}</p>

                        <div className={styles.jobTags}>
                            {job.tags.map(tag => (
                                <span key={tag} className={styles.tag}>{tag}</span>
                            ))}
                        </div>

                        <div className={styles.jobMeta}>
                            <div className={styles.jobDetails}>
                                <span className={styles.jobLocation}>
                                    <MapPin className="w-4 h-4" />
                                    {job.location}
                                </span>
                                <span className={styles.jobSalary}>{job.salary}</span>
                            </div>
                            <div className={styles.jobActions}>
                                <span className={styles.postedAt}>{job.postedAt}</span>
                                <button 
                                    className={`${styles.saveBtn} ${savedJobs.includes(job.id) ? styles.saved : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleSaveJob(job.id);
                                    }}
                                >
                                    <Bookmark className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className={styles.platformTag}>
                            via {JOB_PLATFORMS.find(p => p.id === job.platform)?.name || 'Direct'}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
                <button 
                    className={styles.pageBtn}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
                <button className={styles.pageBtn}>2</button>
                <button className={styles.pageBtn}>3</button>
                <span className={styles.pageEllipsis}>...</span>
                <button className={styles.pageBtn}>42</button>
                <button 
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
