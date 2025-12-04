'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
    Search, 
    MapPin, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight,
    Briefcase,
    Clock,
    Globe,
    Star,
    Bookmark,
    X,
    Sliders,
    TrendingUp,
    Loader2,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import styles from './job-search.module.css';

// Job platforms/sources - reflects actual available sources
const JOB_PLATFORMS = [
    { id: 'all', name: 'All Sources', icon: Globe },
    { id: 'remoteok', name: 'Remote OK', color: '#ff5858' },
    { id: 'adzuna', name: 'Adzuna', color: '#2164f3' },
    { id: 'jsearch', name: 'JSearch', color: '#10a37f' },
    { id: 'themuse', name: 'The Muse', color: '#6e45a5' },
];

// Quick filters
const QUICK_FILTERS = [
    'All Jobs', 'Remote', 'Full-time', 'Part-time', 'Contract', 
    '$100k+', '$150k+', 'Entry Level', 'Senior'
];

// Advanced filter options
const ADVANCED_FILTERS = {
    jobType: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    experienceLevel: ['Entry Level', 'Mid-Level', 'Senior', 'Lead'],
    datePosted: ['Last 24 hours', 'Last 3 days', 'Last week', 'Last month', 'Any time'],
};

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

// Format posted date
function formatPostedDate(dateStr) {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

export default function JobSearchContent({ user, profile }) {
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState(['All Jobs']);
    const [selectedPlatforms, setSelectedPlatforms] = useState(['all']);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [sortBy, setSortBy] = useState('relevant');
    const [currentPage, setCurrentPage] = useState(1);
    const [advancedFilters, setAdvancedFilters] = useState({
        jobType: [],
        experienceLevel: [],
        datePosted: '',
    });

    // Data state
    const [jobs, setJobs] = useState([]);
    const [totalJobs, setTotalJobs] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [savedJobs, setSavedJobs] = useState([]);
    const [sourcesUsed, setSourcesUsed] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Fetch jobs function
    const fetchJobs = useCallback(async (resetPage = false) => {
        setLoading(true);
        setError(null);
        
        const page = resetPage ? 1 : currentPage;
        if (resetPage) setCurrentPage(1);

        try {
            // Build query params
            const params = new URLSearchParams();
            
            if (searchQuery) params.set('q', searchQuery);
            if (locationQuery) params.set('location', locationQuery);
            
            // Handle quick filters
            if (activeFilters.includes('Remote')) {
                params.set('remote', 'true');
            }
            if (activeFilters.includes('Full-time')) {
                params.set('jobType', 'full-time');
            }
            if (activeFilters.includes('Part-time')) {
                params.set('jobType', 'part-time');
            }
            if (activeFilters.includes('Contract')) {
                params.set('jobType', 'contract');
            }
            if (activeFilters.includes('$100k+')) {
                params.set('salaryMin', '100000');
            }
            if (activeFilters.includes('$150k+')) {
                params.set('salaryMin', '150000');
            }
            if (activeFilters.includes('Entry Level')) {
                params.set('experienceLevel', 'entry');
            }
            if (activeFilters.includes('Senior')) {
                params.set('experienceLevel', 'senior');
            }

            // Handle advanced filters
            if (advancedFilters.jobType.length > 0) {
                params.set('jobType', advancedFilters.jobType[0].toLowerCase().replace(' ', '-'));
            }
            if (advancedFilters.experienceLevel.length > 0) {
                const levelMap = {
                    'Entry Level': 'entry',
                    'Mid-Level': 'mid',
                    'Senior': 'senior',
                    'Lead': 'senior',
                };
                params.set('experienceLevel', levelMap[advancedFilters.experienceLevel[0]] || 'mid');
            }

            // Handle platform filter
            if (!selectedPlatforms.includes('all')) {
                params.set('sources', selectedPlatforms.join(','));
            }

            params.set('page', page.toString());
            params.set('limit', '20');

            const response = await fetch(`/api/jobs/search?${params.toString()}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch jobs');
            }

            setJobs(data.data.jobs || []);
            setTotalJobs(data.data.pagination?.total || 0);
            setTotalPages(data.data.pagination?.totalPages || 1);
            setSourcesUsed(data.data.sources || []);
            setHasSearched(true);

        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError(err.message || 'Failed to load jobs. Please try again.');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, locationQuery, activeFilters, advancedFilters, selectedPlatforms, currentPage]);

    // Initial load with default search
    useEffect(() => {
        const loadInitialJobs = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/jobs/search?q=developer&limit=20');
                const data = await response.json();
                
                if (data.success) {
                    setJobs(data.data.jobs || []);
                    setTotalJobs(data.data.pagination?.total || 0);
                    setTotalPages(data.data.pagination?.totalPages || 1);
                    setSourcesUsed(data.data.sources || []);
                }
            } catch (err) {
                console.error('Error loading initial jobs:', err);
            } finally {
                setLoading(false);
            }
        };
        
        loadInitialJobs();
    }, []);

    // Fetch saved jobs
    useEffect(() => {
        const fetchSavedJobs = async () => {
            try {
                const response = await fetch('/api/jobs/save');
                const data = await response.json();
                if (data.success) {
                    setSavedJobs(data.data.jobs.map(j => j.id));
                }
            } catch (err) {
                // User might not be logged in, ignore error
            }
        };
        fetchSavedJobs();
    }, []);

    // Handle search
    const handleSearch = (e) => {
        e?.preventDefault();
        fetchJobs(true);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Effect to fetch when page changes
    useEffect(() => {
        if (hasSearched && currentPage > 1) {
            fetchJobs(false);
        }
    }, [currentPage]);

    // Toggle save job
    const toggleSaveJob = async (jobId) => {
        const isSaved = savedJobs.includes(jobId);
        
        try {
            if (isSaved) {
                await fetch(`/api/jobs/save?jobId=${jobId}`, { method: 'DELETE' });
                setSavedJobs(prev => prev.filter(id => id !== jobId));
            } else {
                await fetch('/api/jobs/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobId }),
                });
                setSavedJobs(prev => [...prev, jobId]);
            }
        } catch (err) {
            console.error('Error saving job:', err);
        }
    };

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
            datePosted: '',
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

    // Generate pagination numbers
    const getPaginationNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        
        return pages;
    };

    return (
        <div className={styles.jobSearchContainer}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    Find Your <span className="text-gradient">Dream Job</span>
                </h1>
                <p className={styles.pageSubtitle}>
                    Search real jobs from RemoteOK, Adzuna, The Muse, and more
                </p>
            </div>

            {/* Search Section */}
            <form onSubmit={handleSearch} className={`${styles.glassCard} ${styles.searchCard}`}>
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
                                placeholder="City, Country or Remote"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.searchActions}>
                        <button type="submit" className={styles.btnPrimary} disabled={loading}>
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                            Search Jobs
                        </button>
                    </div>
                </div>

                {/* Advanced Filters Toggle */}
                <div className={styles.advancedToggle}>
                    <button 
                        type="button"
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
                        <button type="button" className={styles.clearFiltersBtn} onClick={clearAllFilters}>
                            <X className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>
            </form>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
                <div className={`${styles.glassCard} ${styles.advancedFiltersCard}`}>
                    {/* Job Sources */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.filterTitle}>
                            <Globe className="w-4 h-4" />
                            Job Sources
                        </h3>
                        <div className={styles.platformGrid}>
                            {JOB_PLATFORMS.map(platform => (
                                <button
                                    key={platform.id}
                                    type="button"
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
                    {loading ? (
                        <span>Searching...</span>
                    ) : (
                        <>
                            <span>{totalJobs.toLocaleString()}</span> jobs found
                            {sourcesUsed.length > 0 && (
                                <span className={styles.sourcesInfo}>
                                    {' '}from {sourcesUsed.map(s => 
                                        JOB_PLATFORMS.find(p => p.id === s)?.name || s
                                    ).join(', ')}
                                </span>
                            )}
                        </>
                    )}
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
                    </select>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className={styles.errorCard}>
                    <AlertCircle className="w-6 h-6" />
                    <div>
                        <p className={styles.errorTitle}>Error loading jobs</p>
                        <p className={styles.errorMessage}>{error}</p>
                    </div>
                    <button onClick={() => fetchJobs()} className={styles.retryBtn}>
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className={styles.loadingGrid}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={styles.skeletonCard}>
                            <div className={styles.skeletonHeader}>
                                <div className={styles.skeletonLogo}></div>
                                <div className={styles.skeletonText}>
                                    <div className={styles.skeletonTitle}></div>
                                    <div className={styles.skeletonCompany}></div>
                                </div>
                            </div>
                            <div className={styles.skeletonDescription}></div>
                            <div className={styles.skeletonTags}>
                                <div className={styles.skeletonTag}></div>
                                <div className={styles.skeletonTag}></div>
                                <div className={styles.skeletonTag}></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && jobs.length === 0 && hasSearched && (
                <div className={styles.emptyState}>
                    <Search className="w-16 h-16 text-gray-500 mb-4" />
                    <h3>No jobs found</h3>
                    <p>Try adjusting your search criteria or filters</p>
                    <button onClick={() => {
                        setSearchQuery('');
                        setLocationQuery('');
                        clearAllFilters();
                        fetchJobs(true);
                    }} className={styles.btnSecondary}>
                        Clear filters and search again
                    </button>
                </div>
            )}

            {/* Jobs Grid */}
            {!loading && !error && jobs.length > 0 && (
                <div className={styles.jobsGrid}>
                    {jobs.map(job => {
                        const colors = job.companyColors || generateCompanyColors(job.company);
                        const matchScore = job.matchScore || Math.floor(Math.random() * 30) + 70;
                        
                        return (
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
                                            background: job.companyLogo && job.companyLogo.startsWith('http') 
                                                ? `url(${job.companyLogo}) center/contain no-repeat, linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
                                                : `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
                                        }}
                                    >
                                        {(!job.companyLogo || !job.companyLogo.startsWith('http')) && 
                                            (job.company?.[0]?.toUpperCase() || '?')}
                                    </div>
                                    <div className={styles.jobInfo}>
                                        <div className={styles.jobTitleRow}>
                                            <h3 className={styles.jobTitle}>{job.title}</h3>
                                            <span className={`${styles.matchBadge} ${getMatchBadgeClass(matchScore)}`}>
                                                {matchScore}% Match
                                            </span>
                                        </div>
                                        <p className={styles.companyName}>{job.company}</p>
                                    </div>
                                </div>

                                <p className={styles.jobDescription}>
                                    {job.description?.substring(0, 150).replace(/<[^>]*>/g, '')}
                                    {job.description?.length > 150 ? '...' : ''}
                                </p>

                                <div className={styles.jobTags}>
                                    {(job.skills || job.tags || []).slice(0, 4).map(tag => (
                                        <span key={tag} className={styles.tag}>{tag}</span>
                                    ))}
                                </div>

                                <div className={styles.jobMeta}>
                                    <div className={styles.jobDetails}>
                                        <span className={styles.jobLocation}>
                                            <MapPin className="w-4 h-4" />
                                            {job.location || 'Remote'}
                                        </span>
                                        {job.salary && (
                                            <span className={styles.jobSalary}>{job.salary}</span>
                                        )}
                                    </div>
                                    <div className={styles.jobActions}>
                                        <span className={styles.postedAt}>
                                            {formatPostedDate(job.postedAt)}
                                        </span>
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
                                    via {JOB_PLATFORMS.find(p => p.id === job.source)?.name || job.source || 'Direct'}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className={styles.pagination}>
                    <button 
                        className={styles.pageBtn}
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {getPaginationNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className={styles.pageEllipsis}>...</span>
                        ) : (
                            <button 
                                key={page}
                                className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        )
                    ))}
                    
                    <button 
                        className={styles.pageBtn}
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
