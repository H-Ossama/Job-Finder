'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    RefreshCw,
    DollarSign,
    Zap,
    Settings,
    Sparkles,
    Info,
    GraduationCap,
    Building2,
    CalendarDays,
    Flag,
    Trash2
} from 'lucide-react';
import styles from './job-search.module.css';
import { useJobsPagination, useJobDetailsCache } from '@/hooks';
import { countries, getCountryByCode, supportsAusbildung } from '@/utils/location/countries';
import { getCitiesForCountry } from '@/utils/location/cities';
import MoroccoSourceSelector, { MOROCCO_SOURCES } from '@/components/MoroccoSourceSelector';

// Ausbildung-specific data
const AUSBILDUNG_FIELDS = [
    { id: 'kaufmaennisch', name: 'Kaufmännische Berufe', nameEn: 'Commercial/Business' },
    { id: 'it', name: 'IT & Informatik', nameEn: 'IT & Computer Science' },
    { id: 'handwerk', name: 'Handwerk & Technik', nameEn: 'Crafts & Technical' },
    { id: 'gesundheit', name: 'Gesundheit & Pflege', nameEn: 'Healthcare & Nursing' },
    { id: 'gastronomie', name: 'Gastronomie & Hotel', nameEn: 'Gastronomy & Hotel' },
    { id: 'einzelhandel', name: 'Einzelhandel & Verkauf', nameEn: 'Retail & Sales' },
    { id: 'industrie', name: 'Industrie & Produktion', nameEn: 'Industry & Production' },
    { id: 'logistik', name: 'Logistik & Transport', nameEn: 'Logistics & Transport' },
    { id: 'elektro', name: 'Elektro & Elektronik', nameEn: 'Electrical & Electronics' },
    { id: 'bau', name: 'Bau & Architektur', nameEn: 'Construction & Architecture' },
    { id: 'medien', name: 'Medien & Design', nameEn: 'Media & Design' },
    { id: 'banken', name: 'Banken & Versicherung', nameEn: 'Banking & Insurance' },
];

const GERMAN_CITIES = [
    'Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart',
    'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden',
    'Hannover', 'Nürnberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld',
];

// Job platforms/sources - reflects actual available sources
const JOB_PLATFORMS = [
    { id: 'all', name: 'All Sources', icon: Globe },
    { id: 'remoteok', name: 'Remote OK', color: '#ff5858' },
    { id: 'adzuna', name: 'Adzuna', color: '#2164f3' },
    { id: 'jsearch', name: 'JSearch (LinkedIn/Indeed)', color: '#10a37f' },
    { id: 'themuse', name: 'The Muse', color: '#6e45a5' },
];

// Advanced filter options (includes former quick filters)
const ADVANCED_FILTERS = {
    jobType: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Ausbildung'],
    experienceLevel: ['Entry Level', 'Mid-Level', 'Senior', 'Lead'],
    workType: ['Remote', 'On-site', 'Hybrid'],
    salary: ['$50k+', '$75k+', '$100k+', '$150k+', '$200k+'],
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

// Format posted date with proper handling for hours/days/months/years
function formatPostedDate(dateStr) {
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
}

export default function JobSearchContent({ user, profile, jobPreferences, hasCV = false }) {
    console.log('🔍 [JOB SEARCH PAGE] Component mounted');
    // Check if user has completed job preferences
    // User has preferences if they have job titles AND (a location OR remote work selected)
    const hasPreferences = jobPreferences && 
        jobPreferences.desired_titles?.length > 0 &&
        (jobPreferences.desired_countries?.length > 0 || 
         jobPreferences.desired_locations?.length > 0 ||
         jobPreferences.job_types?.includes('remote'));

    // Session storage key for persisting search state
    const SEARCH_STATE_KEY = 'job_search_state';
    const PREFERENCES_APPLIED_KEY = 'job_search_preferences_applied';

    // Get stored search state (returns null if not found or expired)
    const getStoredSearchState = useCallback(() => {
        if (typeof window === 'undefined') return null;
        try {
            const stored = sessionStorage.getItem(SEARCH_STATE_KEY);
            if (!stored) return null;
            const state = JSON.parse(stored);
            // Check if state is recent (within 30 minutes)
            if (Date.now() - state.timestamp > 30 * 60 * 1000) {
                sessionStorage.removeItem(SEARCH_STATE_KEY);
                return null;
            }
            return state;
        } catch {
            return null;
        }
    }, []);

    // Check if preferences were already applied in this session
    const werePreferencesApplied = useCallback(() => {
        if (typeof window === 'undefined') return false;
        return sessionStorage.getItem(PREFERENCES_APPLIED_KEY) === 'true';
    }, []);

    // Mark preferences as applied
    const markPreferencesApplied = useCallback(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(PREFERENCES_APPLIED_KEY, 'true');
        }
    }, []);

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

    // Get stored search state on mount (for back navigation)
    const storedState = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return getStoredSearchState();
    }, [getStoredSearchState]);

    // Search input state - restore from storage or use defaults
    const [searchQuery, setSearchQuery] = useState(() => {
        if (storedState?.searchQuery !== undefined) return storedState.searchQuery;
        return ''; // Don't pre-fill from preferences - let user choose
    });
    
    // Location state - restore from storage or use defaults
    const [selectedCountry, setSelectedCountry] = useState(() => {
        if (storedState?.selectedCountry !== undefined) return storedState.selectedCountry;
        return ''; // Don't pre-fill from preferences
    });
    const [selectedCity, setSelectedCity] = useState(() => {
        if (storedState?.selectedCity !== undefined) return storedState.selectedCity;
        return '';
    });
    const [isRemoteSearch, setIsRemoteSearch] = useState(() => {
        if (storedState?.isRemoteSearch !== undefined) return storedState.isRemoteSearch;
        return false; // Don't pre-fill from preferences
    });
    
    // For backward compatibility - compute locationQuery from country/city
    const locationQuery = useMemo(() => {
        if (isRemoteSearch) return 'Remote';
        if (selectedCity && selectedCountry) {
            const country = getCountryByCode(selectedCountry);
            return `${selectedCity}, ${country?.name || selectedCountry}`;
        }
        if (selectedCountry) {
            const country = getCountryByCode(selectedCountry);
            return country?.name || selectedCountry;
        }
        return '';
    }, [selectedCountry, selectedCity, isRemoteSearch]);

    // Handle location change from the selector
    const handleLocationChange = useCallback((locationData) => {
        setSelectedCountry(locationData.country);
        setSelectedCity(locationData.city);
        setIsRemoteSearch(locationData.isRemote);
    }, []);

    const [selectedPlatforms, setSelectedPlatforms] = useState(['all']);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [sortBy, setSortBy] = useState('relevant');
    const [usingPreferences, setUsingPreferences] = useState(hasPreferences);
    
    // Initialize advanced filters from preferences
    const getInitialAdvancedFilters = useCallback(() => {
        const filters = {
            jobType: [],
            experienceLevel: [],
            workType: [],
            salary: [],
            datePosted: '',
        };
        
        if (jobPreferences) {
            // Map experience levels from preferences
            if (jobPreferences.experience_levels?.length > 0) {
                // Map from preference format to display format
                const levelMap = {
                    'entry': 'Entry Level',
                    'mid': 'Mid-Level',
                    'senior': 'Senior',
                    'lead': 'Lead',
                };
                filters.experienceLevel = jobPreferences.experience_levels
                    .map(level => levelMap[level] || level)
                    .filter(level => ADVANCED_FILTERS.experienceLevel.includes(level));
            }
            
            // Map job types from preferences
            if (jobPreferences.job_types?.length > 0) {
                // Work type mapping
                if (jobPreferences.job_types.includes('remote')) {
                    filters.workType.push('Remote');
                }
                if (jobPreferences.job_types.includes('hybrid')) {
                    filters.workType.push('Hybrid');
                }
                if (jobPreferences.job_types.includes('onsite')) {
                    filters.workType.push('On-site');
                }
                
                // Employment type mapping
                if (jobPreferences.job_types.includes('full-time')) {
                    filters.jobType.push('Full-time');
                }
                if (jobPreferences.job_types.includes('part-time')) {
                    filters.jobType.push('Part-time');
                }
                if (jobPreferences.job_types.includes('contract')) {
                    filters.jobType.push('Contract');
                }
            }
            
            // Map salary preferences
            if (jobPreferences.salary_min) {
                const salaryMin = parseInt(jobPreferences.salary_min);
                if (salaryMin >= 200000) filters.salary.push('$200k+');
                else if (salaryMin >= 150000) filters.salary.push('$150k+');
                else if (salaryMin >= 100000) filters.salary.push('$100k+');
                else if (salaryMin >= 75000) filters.salary.push('$75k+');
                else if (salaryMin >= 50000) filters.salary.push('$50k+');
            }
        }
        
        return filters;
    }, [jobPreferences]);
    
    const [advancedFilters, setAdvancedFilters] = useState(getInitialAdvancedFilters);
    
    // Country search state
    const [countrySearch, setCountrySearch] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const countryDropdownRef = useRef(null);
    
    // Filter countries based on search
    const filteredCountries = useMemo(() => {
        if (!countrySearch) return countries;
        const search = countrySearch.toLowerCase();
        return countries.filter(c => 
            c.name.toLowerCase().includes(search) ||
            c.code.toLowerCase().includes(search)
        );
    }, [countrySearch]);
    
    // Ausbildung-specific state
    const [searchType, setSearchType] = useState('job'); // 'job' or 'ausbildung'
    const [showAusbildungPrompt, setShowAusbildungPrompt] = useState(false);
    const [ausbildungPromptDismissed, setAusbildungPromptDismissed] = useState(false); // Track if user dismissed the prompt
    const [ausbildungFilters, setAusbildungFilters] = useState({
        field: '',
        startYear: '',
        city: '',
    });

    // Morocco-specific state
    const [selectedMoroccoSources, setSelectedMoroccoSources] = useState([]); // Empty = all sources
    const [showMoroccoSourcePrompt, setShowMoroccoSourcePrompt] = useState(false);
    const [moroccoPromptDismissed, setMoroccoPromptDismissed] = useState(false);

    // Check if searching in Morocco
    const isMoroccoSearch = useMemo(() => {
        return selectedCountry?.toUpperCase() === 'MA';
    }, [selectedCountry]);

    // Saved jobs state
    const [savedJobs, setSavedJobs] = useState([]);

    // Search progress state for animated loading
    const [searchProgress, setSearchProgress] = useState(0);
    const [searchStage, setSearchStage] = useState('');
    const progressIntervalRef = useRef(null);
    const searchStartTimeRef = useRef(null);

    // Use the pagination hook with 14 jobs per page
    const {
        jobs,
        totalJobs,
        totalPages,
        currentPage,
        sourcesUsed,
        loading,
        error,
        hasSearched,
        restoredFromCache,
        getCachedFilters,
        search: originalSearch,
        goToPage,
        nextPage,
        previousPage,
        refresh,
        isPageCached,
        paginationNumbers,
        clearCacheAndSearch, // NEW: Clear all caches and search fresh
        clearLocalCache, // NEW: Clear local caches only
    } = useJobsPagination({}, 14);

    // Wrap search to add progress tracking
    const search = useCallback((filters) => {
        // Reset progress and record start time
        setSearchProgress(0);
        setSearchStage('Initializing search...');
        searchStartTimeRef.current = Date.now();
        
        // Clear any existing interval
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
        
        // Adaptive progress animation
        // Progress increases slowly at first, then slows down as it approaches 90%
        // This creates a more realistic feel where progress seems to match actual work
        let currentProgress = 0;
        
        const stages = [
            { maxProgress: 15, stage: 'Connecting to job providers...' },
            { maxProgress: 35, stage: 'Searching RemoteOK...' },
            { maxProgress: 50, stage: 'Searching Adzuna...' },
            { maxProgress: 65, stage: 'Searching JSearch (LinkedIn/Indeed)...' },
            { maxProgress: 78, stage: 'Searching The Muse...' },
            { maxProgress: 88, stage: 'Processing results...' },
        ];
        
        let stageIndex = 0;
        
        // Progress animation - uses adaptive timing
        // Interval time increases as progress increases (slows down near the end)
        const updateProgress = () => {
            const elapsed = Date.now() - searchStartTimeRef.current;
            
            // Calculate target progress based on elapsed time
            // Fast initial progress, slowing down over time
            // Uses logarithmic curve for natural feel
            const targetProgress = Math.min(88, Math.floor(20 * Math.log10(elapsed / 100 + 1)));
            
            // Smoothly approach target
            if (currentProgress < targetProgress) {
                currentProgress = Math.min(currentProgress + 2, targetProgress);
                setSearchProgress(currentProgress);
                
                // Update stage based on progress
                while (stageIndex < stages.length - 1 && currentProgress >= stages[stageIndex].maxProgress) {
                    stageIndex++;
                }
                setSearchStage(stages[stageIndex].stage);
            }
            
            // If we've been waiting too long (>8s), cap at 88% and show waiting message
            if (elapsed > 8000 && currentProgress >= 85) {
                setSearchStage('Almost there...');
            }
        };
        
        // Update more frequently for smoother animation
        progressIntervalRef.current = setInterval(updateProgress, 150);
        
        // Call original search
        return originalSearch(filters);
    }, [originalSearch]);

    // Close country dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
                setShowCountryDropdown(false);
                setCountrySearch('');
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Clear progress when loading completes
    useEffect(() => {
        if (!loading && searchProgress > 0) {
            // Clear the interval immediately
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
            
            // Animate to 100% completion
            setSearchProgress(95);
            setSearchStage('Finalizing...');
            
            // Quick animation to 100%
            const completeAnimation = setTimeout(() => {
                setSearchProgress(100);
                setSearchStage('Complete!');
                
                // Reset after showing completion
                const resetTimeout = setTimeout(() => {
                    setSearchProgress(0);
                    setSearchStage('');
                }, 400);
                
                return () => clearTimeout(resetTimeout);
            }, 150);
            
            return () => clearTimeout(completeAnimation);
        }
    }, [loading, searchProgress]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, []);

    // Use job details cache for prefetching
    const { prefetchJob, isJobCached } = useJobDetailsCache();

    // Track if initial search has been done
    const initialSearchDone = useRef(false);

    // Build filters object from state
    const buildFilters = useCallback(() => {
        const filters = {
            query: searchQuery,
            location: locationQuery,
            sources: selectedPlatforms,
        };

        // Add country code if selected
        if (selectedCountry) {
            filters.country = selectedCountry.toLowerCase();
        }

        // Handle remote search
        if (isRemoteSearch) {
            filters.remote = true;
        }

        // Handle Ausbildung search
        if (searchType === 'ausbildung') {
            filters.isAusbildung = true;
            filters.query = searchQuery || 'ausbildung';
            if (ausbildungFilters.field) {
                filters.ausbildungField = ausbildungFilters.field;
            }
            if (ausbildungFilters.startYear) {
                filters.startYear = ausbildungFilters.startYear;
            }
            if (ausbildungFilters.city) {
                filters.location = ausbildungFilters.city;
            }
            // Force Germany for Ausbildung (or selected Ausbildung country)
            filters.country = selectedCountry?.toLowerCase() || 'de';
        }

        // Handle work type filters (Remote)
        if (advancedFilters.workType.includes('Remote')) {
            filters.remote = true;
        }

        // Handle job type filters
        if (advancedFilters.jobType.length > 0) {
            const jobType = advancedFilters.jobType[0].toLowerCase();
            if (jobType === 'ausbildung') {
                filters.isAusbildung = true;
            } else {
                filters.jobType = advancedFilters.jobType[0];
            }
        }

        // Handle experience level filters
        if (advancedFilters.experienceLevel.length > 0) {
            filters.experienceLevel = advancedFilters.experienceLevel[0];
        }

        // Handle salary filters
        if (advancedFilters.salary.length > 0) {
            const salaryMap = {
                '$50k+': 50000,
                '$75k+': 75000,
                '$100k+': 100000,
                '$150k+': 150000,
                '$200k+': 200000,
            };
            const salaries = advancedFilters.salary.map(s => salaryMap[s] || 0);
            filters.salaryMin = Math.max(...salaries);
        }

        // Handle Morocco-specific search
        if (selectedCountry?.toUpperCase() === 'MA') {
            filters.isMorocco = true;
            // Only include specific sources if user has selected some
            if (selectedMoroccoSources.length > 0) {
                filters.moroccoSources = selectedMoroccoSources;
            }
        }

        return filters;
    }, [searchQuery, locationQuery, selectedPlatforms, advancedFilters, searchType, ausbildungFilters, selectedCountry, isRemoteSearch, selectedMoroccoSources]);

    // Check if location is Germany for Ausbildung prompt
    useEffect(() => {
        // Check if selected country supports Ausbildung
        const isAusbildungCountry = selectedCountry && supportsAusbildung(selectedCountry);
        
        // Only show prompt if: country supports Ausbildung, user is in job mode, prompt not dismissed, and not already shown
        if (isAusbildungCountry && searchType === 'job' && !ausbildungPromptDismissed && !showAusbildungPrompt) {
            setShowAusbildungPrompt(true);
        } else if (!isAusbildungCountry) {
            // Reset dismissed state when country changes to non-Ausbildung country
            setShowAusbildungPrompt(false);
            setAusbildungPromptDismissed(false);
        }
    }, [selectedCountry, searchType, showAusbildungPrompt, ausbildungPromptDismissed]);

    // Check if location is Morocco for Morocco source prompt
    useEffect(() => {
        // Show prompt if: country is Morocco, in job mode, prompt not dismissed
        if (isMoroccoSearch && searchType === 'job' && !moroccoPromptDismissed && !showMoroccoSourcePrompt) {
            setShowMoroccoSourcePrompt(true);
        } else if (!isMoroccoSearch) {
            // Reset when country changes away from Morocco
            setShowMoroccoSourcePrompt(false);
            setMoroccoPromptDismissed(false);
        }
    }, [isMoroccoSearch, searchType, showMoroccoSourcePrompt, moroccoPromptDismissed]);

    // Save search state to sessionStorage whenever search parameters change
    const saveSearchState = useCallback(() => {
        if (typeof window === 'undefined') return;
        const state = {
            searchQuery,
            selectedCountry,
            selectedCity,
            isRemoteSearch,
            selectedPlatforms,
            advancedFilters,
            searchType,
            ausbildungFilters,
            usingPreferences,
            selectedMoroccoSources,
            timestamp: Date.now(),
        };
        sessionStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(state));
    }, [searchQuery, selectedCountry, selectedCity, isRemoteSearch, selectedPlatforms, advancedFilters, searchType, ausbildungFilters, usingPreferences, selectedMoroccoSources]);

    // Search with preferences function (for the button)
    const searchWithPreferences = useCallback(() => {
        if (!hasPreferences || !jobPreferences) return;
        
        // Check if user prefers Ausbildung OR is currently in Ausbildung mode
        const prefersAusbildung = jobPreferences.job_types?.includes('ausbildung');
        const isAusbildungMode = searchType === 'ausbildung' || prefersAusbildung;
        
        // Update state with preferences
        const preferredQuery = jobPreferences.desired_titles?.[0] || '';
        const preferredCountry = jobPreferences.desired_countries?.[0] || '';
        const isRemote = jobPreferences.job_types?.includes('remote');
        
        setSearchQuery(preferredQuery);
        setUsingPreferences(true);
        
        if (isAusbildungMode) {
            // Switch to Ausbildung mode
            setSearchType('ausbildung');
            setSelectedCountry('DE'); // Ausbildung is Germany-specific
            setSelectedCity('');
            setIsRemoteSearch(false);
            // Clear normal filters
            setShowAdvancedFilters(false);
            setAdvancedFilters({
                jobType: [],
                experienceLevel: [],
                workType: [],
                salary: [],
                datePosted: [],
            });
            // Set Ausbildung filters from preferences if available
            const preferredCity = jobPreferences.desired_locations?.[0] || '';
            setAusbildungFilters(prev => ({
                ...prev,
                city: preferredCity,
            }));
            
            // Perform Ausbildung search
            search({ 
                query: preferredQuery || 'ausbildung',
                location: preferredCity || 'Germany',
                country: 'de',
                isAusbildung: true,
            });
        } else {
            // Regular job search
            setSearchType('job');
            setSelectedCountry(preferredCountry);
            setSelectedCity('');
            setIsRemoteSearch(isRemote);
            
            // Build location for API
            const preferredLocation = jobPreferences.desired_locations?.[0] || 
                (preferredCountry ? getCountryByCode(preferredCountry)?.name || '' : '');
            
            // Perform search
            search({ 
                query: preferredQuery,
                location: preferredLocation,
                country: preferredCountry?.toLowerCase(),
                remote: isRemote,
                experienceLevel: jobPreferences.experience_levels?.[0] || '',
            });
        }
        
        // Mark preferences as applied
        markPreferencesApplied();
    }, [hasPreferences, jobPreferences, search, markPreferencesApplied, searchType]);

    // Initial load - restore previous search or show empty state
    useEffect(() => {
        if (!initialSearchDone.current) {
            initialSearchDone.current = true;
            
            // If results were restored from cache (back navigation), just restore the UI state
            if (restoredFromCache && jobs.length > 0) {
                const cachedFilters = getCachedFilters();
                if (cachedFilters) {
                    // Restore UI state from cached filters
                    if (cachedFilters.query) setSearchQuery(cachedFilters.query);
                    if (cachedFilters.country) setSelectedCountry(cachedFilters.country.toUpperCase());
                    if (cachedFilters.remote) setIsRemoteSearch(cachedFilters.remote);
                }
                // Also restore from storedState for full UI state
                if (storedState) {
                    if (storedState.selectedPlatforms) setSelectedPlatforms(storedState.selectedPlatforms);
                    if (storedState.advancedFilters) setAdvancedFilters(storedState.advancedFilters);
                    if (storedState.searchType) setSearchType(storedState.searchType);
                    if (storedState.ausbildungFilters) setAusbildungFilters(storedState.ausbildungFilters);
                    if (storedState.usingPreferences !== undefined) setUsingPreferences(storedState.usingPreferences);
                    if (storedState.selectedMoroccoSources) setSelectedMoroccoSources(storedState.selectedMoroccoSources);
                }
                // Don't trigger a new search - we already have results
                return;
            }
            
            // Check if we have stored search state (from back navigation)
            if (storedState) {
                // Restore filters from stored state
                if (storedState.selectedPlatforms) setSelectedPlatforms(storedState.selectedPlatforms);
                if (storedState.advancedFilters) setAdvancedFilters(storedState.advancedFilters);
                if (storedState.searchType) setSearchType(storedState.searchType);
                if (storedState.ausbildungFilters) setAusbildungFilters(storedState.ausbildungFilters);
                if (storedState.usingPreferences !== undefined) setUsingPreferences(storedState.usingPreferences);
                if (storedState.selectedMoroccoSources) setSelectedMoroccoSources(storedState.selectedMoroccoSources);
                
                // Re-run the previous search
                const restoredFilters = {
                    query: storedState.searchQuery || '',
                    location: storedState.selectedCity && storedState.selectedCountry 
                        ? `${storedState.selectedCity}, ${getCountryByCode(storedState.selectedCountry)?.name || storedState.selectedCountry}`
                        : storedState.selectedCountry ? getCountryByCode(storedState.selectedCountry)?.name || '' : '',
                    country: storedState.selectedCountry?.toLowerCase() || '',
                    remote: storedState.isRemoteSearch || false,
                    sources: storedState.selectedPlatforms || ['all'],
                    isMorocco: storedState.selectedCountry === 'MA',
                    moroccoSources: storedState.selectedMoroccoSources || [],
                };
                
                search(restoredFilters);
                return;
            }
            
            // First time visit - check if preferences should be auto-applied
            // Only auto-apply if: has preferences AND never applied before in this session
            if (hasPreferences && !werePreferencesApplied()) {
                searchWithPreferences();
            } else {
                // Default search (empty or basic)
                search({ query: 'developer' });
            }
        }
    }, [search, hasPreferences, jobPreferences, storedState, werePreferencesApplied, searchWithPreferences, restoredFromCache, jobs.length, getCachedFilters]);

    // Save state whenever user performs a search
    useEffect(() => {
        if (hasSearched) {
            saveSearchState();
        }
    }, [hasSearched, saveSearchState]);

    // Fetch saved jobs
    useEffect(() => {
        const fetchSavedJobs = async () => {
            console.log('📥 [LOAD SAVED] Fetching saved jobs...');
            try {
                // Fetch from applications with status 'saved'
                const response = await fetch('/api/applications?status=saved&limit=100');
                if (!response.ok) {
                    console.warn('⚠️ [LOAD SAVED] Failed to fetch saved jobs:', response.status);
                    return;
                }
                const data = await response.json();
                console.log('📥 [LOAD SAVED] Response:', data);
                if (data.applications) {
                    // Map externalJobId to savedJobs state
                    // We use externalJobId for tracking search results
                    const savedIds = data.applications
                        .map(app => app.externalJobId)
                        .filter(Boolean);
                    console.log('✅ [LOAD SAVED] Loaded', savedIds.length, 'saved job IDs:', savedIds);
                    setSavedJobs(savedIds);
                }
            } catch (err) {
                console.warn('❌ [LOAD SAVED] Error:', err);
            }
        };
        fetchSavedJobs();
    }, []);

    // Handle search
    const handleSearch = (e) => {
        e?.preventDefault();
        setUsingPreferences(false); // User is doing a manual search
        search(buildFilters());
    };

    // Handle page change with smooth scroll
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            goToPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Prefetch job details on hover (for faster navigation)
    const handleJobHover = useCallback((jobId) => {
        // Prefetch after a short delay to avoid unnecessary requests
        const timer = setTimeout(() => {
            if (!isJobCached(jobId)) {
                prefetchJob(jobId);
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [prefetchJob, isJobCached]);

    // Toggle save job
    const toggleSaveJob = async (jobId) => {
        const isSaved = savedJobs.includes(jobId);
        const job = jobs.find(j => j.id === jobId);
        
        console.log('🔖 [SAVE] Toggle clicked:', { jobId, isSaved, company: job?.company });
        
        // Optimistic update
        if (isSaved) {
            setSavedJobs(prev => prev.filter(id => id !== jobId));
        } else {
            setSavedJobs(prev => [...prev, jobId]);
        }
        
        try {
            if (isSaved) {
                console.log('🗑️ [SAVE] Removing saved job...');
                const res = await fetch(`/api/jobs/track?jobId=${jobId}`, { method: 'DELETE' });
                console.log('🗑️ [SAVE] Delete response:', res.status);
            } else {
                const jobData = job ? {
                    title: job.title || job.jobTitle,
                    company: job.company || job.companyName,
                    location: job.location,
                    salary: job.salary,
                    apply_url: job.url || job.apply_url,
                    source: job.source || 'job-search',
                    postedAt: job.postedAt || job.date || new Date().toISOString(),
                } : {};

                console.log('💾 [SAVE] Saving job...', jobData.company);
                const res = await fetch('/api/jobs/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        jobId, 
                        jobData,
                        action: 'save' 
                    }),
                });
                const data = await res.json();
                console.log('💾 [SAVE] Save response:', res.status, data);
            }
        } catch (err) {
            console.error('❌ [SAVE] Error:', err);
            // Revert on error
            if (isSaved) {
                setSavedJobs(prev => [...prev, jobId]);
            } else {
                setSavedJobs(prev => prev.filter(id => id !== jobId));
            }
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
        setSelectedPlatforms(['all']);
        setAdvancedFilters({
            jobType: [],
            experienceLevel: [],
            workType: [],
            salary: [],
            datePosted: '',
        });
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (!selectedPlatforms.includes('all')) count += selectedPlatforms.length;
        Object.values(advancedFilters).forEach(val => {
            if (Array.isArray(val)) count += val.length;
            else if (val) count += 1;
        });
        return count;
    };

    return (
        <div className={styles.jobSearchContainer}>
            {/* Page Header - Centered */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    Find Your <span className="text-gradient">Dream Job</span>
                </h1>
                <p className={styles.pageSubtitle}>
                    Search real jobs from RemoteOK, Adzuna, The Muse, and more
                </p>
            </div>

            {/* Notification Badges - Compact Pills */}
            {(!hasCV || !hasPreferences) && (
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem', 
                    marginBottom: '1rem',
                    justifyContent: 'center'
                }}>
                    {!hasCV && (
                        <Link 
                            href="/cv-builder"
                            className={styles.notificationBadge}
                            style={{ 
                                background: 'rgba(245, 158, 11, 0.15)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                color: '#fbbf24',
                            }}
                        >
                            <Zap className="w-4 h-4" />
                            <span>Create CV for AI matching</span>
                        </Link>
                    )}
                    {!hasPreferences && (
                        <Link 
                            href="/settings"
                            className={styles.notificationBadge}
                            style={{ 
                                background: 'rgba(99, 102, 241, 0.15)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                color: '#a5b4fc',
                            }}
                        >
                            <Settings className="w-4 h-4" />
                            <span>Set job preferences</span>
                        </Link>
                    )}
                </div>
            )}

            {/* Preferences Bar - Shows when preferences exist */}
            {hasPreferences && preferencesSummary && (
                <div className={styles.preferencesBar}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {usingPreferences ? (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    padding: '0.375rem 0.75rem',
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                                    border: '1px solid rgba(139, 92, 246, 0.4)',
                                    borderRadius: '20px',
                                    fontSize: '0.875rem'
                                }}>
                                    <Sparkles className="w-4 h-4" style={{ color: '#a78bfa' }} />
                                    <span style={{ color: '#e0e7ff' }}>
                                        Searching: <strong>{preferencesSummary.titles}</strong> in <strong>{preferencesSummary.location}</strong>
                                    </span>
                                </div>
                            ) : (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    padding: '0.375rem 0.75rem',
                                    background: 'rgba(34, 197, 94, 0.15)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    borderRadius: '20px',
                                    fontSize: '0.875rem'
                                }}>
                                    <span style={{ color: '#86efac' }}>
                                        Saved: {preferencesSummary.titles} in {preferencesSummary.location}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {usingPreferences ? (
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setUsingPreferences(false);
                                        setSearchQuery('');
                                        setSelectedCountry('');
                                        setSelectedCity('');
                                        setIsRemoteSearch(false);
                                    }}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.375rem',
                                        padding: '0.375rem 0.75rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        color: '#d1d5db',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Clear
                                </button>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={searchWithPreferences}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.375rem',
                                        padding: '0.375rem 0.75rem',
                                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))',
                                        border: '1px solid rgba(34, 197, 94, 0.5)',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        color: '#86efac',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Use preferences
                                </button>
                            )}
                            <Link 
                                href="/settings"
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.375rem',
                                    padding: '0.375rem 0.75rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    color: '#9ca3af',
                                    textDecoration: 'none'
                                }}
                            >
                                <Settings className="w-3.5 h-3.5" />
                                Edit
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Search Card - Hidden in Ausbildung mode */}
            {searchType !== 'ausbildung' && (
            <form onSubmit={handleSearch} className={`${styles.glassCard} ${styles.searchCard}`}>
                <div className={styles.searchGrid}>
                    {/* Job Title Input */}
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
                    
                    {/* Country Selector - Searchable */}
                    {searchType !== 'ausbildung' && (
                        <div className={styles.searchField} ref={countryDropdownRef}>
                            <label className={styles.searchLabel}>Country</label>
                            <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                                <Globe className={styles.inputIcon} />
                                <input 
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Search countries..."
                                    value={countrySearch || (selectedCountry ? `${getCountryByCode(selectedCountry)?.flag || ''} ${getCountryByCode(selectedCountry)?.name || ''}` : '')}
                                    onChange={(e) => {
                                        setCountrySearch(e.target.value);
                                        setShowCountryDropdown(true);
                                    }}
                                    onFocus={() => {
                                        setShowCountryDropdown(true);
                                        if (selectedCountry) setCountrySearch('');
                                    }}
                                    style={{ paddingLeft: '3rem', cursor: 'text' }}
                                />
                                {selectedCountry && !showCountryDropdown && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedCountry('');
                                            setSelectedCity('');
                                            setCountrySearch('');
                                            handleLocationChange({ country: '', city: '', isRemote: false });
                                        }}
                                        style={{
                                            position: 'absolute',
                                            right: '0.75rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '1.25rem',
                                            height: '1.25rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: '#9ca3af'
                                        }}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                                {showCountryDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        marginTop: '0.25rem',
                                        background: '#111827',
                                        border: '1px solid rgba(75, 85, 99, 1)',
                                        borderRadius: '12px',
                                        maxHeight: '280px',
                                        overflowY: 'auto',
                                        zIndex: 9999,
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                                    }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedCountry('');
                                                setSelectedCity('');
                                                setCountrySearch('');
                                                setShowCountryDropdown(false);
                                                handleLocationChange({ country: '', city: '', isRemote: false });
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.625rem 1rem',
                                                textAlign: 'left',
                                                background: !selectedCountry ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                                border: 'none',
                                                color: '#d1d5db',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                borderBottom: '1px solid rgba(55, 65, 81, 0.5)'
                                            }}
                                        >
                                            🌍 All Countries
                                        </button>
                                        {filteredCountries.map(country => (
                                            <button
                                                key={country.code}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCountry(country.code);
                                                    setSelectedCity('');
                                                    setCountrySearch('');
                                                    setShowCountryDropdown(false);
                                                    handleLocationChange({
                                                        country: country.code,
                                                        city: '',
                                                        isRemote: false
                                                    });
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.625rem 1rem',
                                                    textAlign: 'left',
                                                    background: selectedCountry === country.code ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                                    border: 'none',
                                                    color: '#d1d5db',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    transition: 'background 0.15s ease'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.15)'}
                                                onMouseLeave={(e) => e.target.style.background = selectedCountry === country.code ? 'rgba(99, 102, 241, 0.2)' : 'transparent'}
                                            >
                                                {country.flag} {country.name}
                                            </button>
                                        ))}
                                        {filteredCountries.length === 0 && (
                                            <div style={{
                                                padding: '1rem',
                                                textAlign: 'center',
                                                color: '#6b7280',
                                                fontSize: '0.875rem'
                                            }}>
                                                No countries found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* City Selector */}
                    {searchType !== 'ausbildung' && (
                        <div className={styles.searchField}>
                            <label className={styles.searchLabel}>City</label>
                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.inputIcon} />
                                <select 
                                    className={styles.searchInput}
                                    value={selectedCity}
                                    onChange={(e) => {
                                        setSelectedCity(e.target.value);
                                        handleLocationChange({
                                            country: selectedCountry,
                                            city: e.target.value,
                                            isRemote: false
                                        });
                                    }}
                                    disabled={!selectedCountry || !getCitiesForCountry(selectedCountry).length}
                                    style={{ paddingLeft: '3rem', cursor: 'pointer' }}
                                >
                                    <option value="">All Cities</option>
                                    {selectedCountry && getCitiesForCountry(selectedCountry).map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    
                    {/* Search Button */}
                    <div className={styles.searchActions}>
                        <button type="submit" className={styles.btnPrimary} disabled={loading}>
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                            Search
                        </button>
                    </div>
                </div>

                {/* Quick Filters Row - Hidden in Ausbildung mode */}
                {searchType !== 'ausbildung' && (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(55, 65, 81, 0.5)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {/* Filters Button */}
                            <button 
                                type="button"
                                className={`${styles.advancedBtn} ${showAdvancedFilters ? styles.active : ''}`}
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            >
                                <Sliders className="w-4 h-4" />
                                Filters
                                {getActiveFilterCount() > 0 && (
                                    <span className={styles.filterCount}>{getActiveFilterCount()}</span>
                                )}
                                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {getActiveFilterCount() > 0 && (
                                <button type="button" className={styles.clearFiltersBtn} onClick={clearAllFilters}>
                                    <X className="w-3.5 h-3.5" />
                                    Clear
                                </button>
                            )}
                            
                            {/* Remote Toggle */}
                            <button 
                                type="button"
                                className={`${styles.remoteToggle} ${isRemoteSearch ? styles.active : ''}`}
                                onClick={() => {
                                    setIsRemoteSearch(!isRemoteSearch);
                                    if (!isRemoteSearch) {
                                        setSelectedCountry('');
                                        setSelectedCity('');
                                    }
                                }}
                            >
                                <Globe className="w-4 h-4" />
                                Remote Only
                            </button>
                        </div>
                        
                        {/* Quick Filter Chips */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                            {['Remote', 'Full-time', 'Entry Level'].map(quickFilter => {
                                const isActive = 
                                    (quickFilter === 'Remote' && advancedFilters.workType.includes('Remote')) ||
                                    (quickFilter === 'Full-time' && advancedFilters.jobType.includes('Full-time')) ||
                                    (quickFilter === 'Entry Level' && advancedFilters.experienceLevel.includes('Entry Level'));
                                
                                return (
                                    <button
                                        key={quickFilter}
                                        type="button"
                                        onClick={() => {
                                            if (quickFilter === 'Remote') toggleAdvancedFilter('workType', 'Remote');
                                            else if (quickFilter === 'Full-time') toggleAdvancedFilter('jobType', 'Full-time');
                                            else if (quickFilter === 'Entry Level') toggleAdvancedFilter('experienceLevel', 'Entry Level');
                                        }}
                                        className={`${styles.filterChip} ${isActive ? styles.active : ''}`}
                                    >
                                        {quickFilter}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </form>
            )}

            {/* Ausbildung Prompt */}
            {showAusbildungPrompt && searchType === 'job' && (
                <div className={styles.ausbildungPrompt}>
                    <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <GraduationCap className="w-5 h-5" style={{ color: '#22c55e' }} />
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>
                                Looking for <strong style={{ color: '#4ade80' }}>Ausbildung</strong> in {getCountryByCode(selectedCountry)?.name}?
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                onClick={() => {
                                    setSearchType('ausbildung');
                                    setShowAusbildungPrompt(false);
                                    setAusbildungPromptDismissed(true);
                                    setSelectedCity('');
                                    // Clear normal filters when switching to Ausbildung
                                    setShowAdvancedFilters(false);
                                    setIsRemoteSearch(false);
                                    setAdvancedFilters({
                                        jobType: [],
                                        experienceLevel: [],
                                        workType: [],
                                        salary: [],
                                        datePosted: [],
                                    });
                                }}
                                style={{ 
                                    padding: '0.375rem 0.875rem',
                                    background: 'rgba(34, 197, 94, 0.3)',
                                    border: '1px solid rgba(34, 197, 94, 0.5)',
                                    borderRadius: '6px',
                                    color: '#86efac',
                                    fontSize: '0.8rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Yes
                            </button>
                            <button 
                                onClick={() => {
                                    setShowAusbildungPrompt(false);
                                    setAusbildungPromptDismissed(true);
                                }}
                                style={{ 
                                    padding: '0.375rem 0.875rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    color: '#9ca3af',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Morocco Source Selection Prompt */}
            {showMoroccoSourcePrompt && searchType === 'job' && (
                <div className={styles.ausbildungPrompt} style={{
                    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(34, 197, 94, 0.15))',
                    borderColor: 'rgba(220, 38, 38, 0.3)'
                }}>
                    <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Flag className="w-5 h-5" style={{ color: '#ef4444' }} />
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>
                                🇲🇦 Searching in <strong style={{ color: '#22c55e' }}>Morocco</strong>? Select local job sources for better results!
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                onClick={() => {
                                    setShowMoroccoSourcePrompt(false);
                                    setMoroccoPromptDismissed(true);
                                    // Enable all Morocco sources by default
                                    setSelectedMoroccoSources(['emploi', 'dreamjob', 'rekrute', 'marocannonces', 'alwadifa', 'emploipublic', 'stagiaires']);
                                }}
                                style={{ 
                                    padding: '0.375rem 0.875rem',
                                    background: 'rgba(34, 197, 94, 0.3)',
                                    border: '1px solid rgba(34, 197, 94, 0.5)',
                                    borderRadius: '6px',
                                    color: '#86efac',
                                    fontSize: '0.8rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Use Morocco Sources
                            </button>
                            <button 
                                onClick={() => {
                                    setShowMoroccoSourcePrompt(false);
                                    setMoroccoPromptDismissed(true);
                                }}
                                style={{ 
                                    padding: '0.375rem 0.875rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    color: '#9ca3af',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Morocco Source Selector - shown when Morocco is selected and user has sources */}
            {isMoroccoSearch && searchType === 'job' && selectedMoroccoSources.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <MoroccoSourceSelector
                        selectedSources={selectedMoroccoSources}
                        onSourcesChange={setSelectedMoroccoSources}
                        compact={true}
                    />
                </div>
            )}

            {/* Ausbildung Mode Panel - Full Search Card */}
            {searchType === 'ausbildung' && (
                <form onSubmit={handleSearch} className={`${styles.glassCard} ${styles.searchCard}`}>
                    {/* Header with mode indicator and switch button */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        marginBottom: '1.25rem', 
                        paddingBottom: '1rem',
                        borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
                        flexWrap: 'wrap', 
                        gap: '0.75rem' 
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '2.5rem',
                                height: '2.5rem',
                                background: 'rgba(34, 197, 94, 0.2)',
                                borderRadius: '10px'
                            }}>
                                <GraduationCap className="w-5 h-5" style={{ color: '#22c55e' }} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: '600', color: '#86efac', fontSize: '1rem', margin: 0 }}>
                                    Ausbildung Search 🇩🇪
                                </h3>
                                <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>
                                    Find vocational training positions in Germany
                                </p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => {
                                setSearchType('job');
                                setAusbildungFilters({ field: '', startYear: '', city: '' });
                            }}
                            style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '8px',
                                color: '#d1d5db',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Briefcase className="w-4 h-4" />
                            Switch to Jobs
                        </button>
                    </div>
                    
                    {/* Search Grid */}
                    <div className={styles.searchGrid}>
                        {/* Keywords Input */}
                        <div className={styles.searchField}>
                            <label className={styles.searchLabel}>Keywords (Optional)</label>
                            <div className={styles.inputWrapper}>
                                <Search className={styles.inputIcon} />
                                <input 
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="e.g. Kaufmann, IT, Mechatroniker"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        {/* Field Selector */}
                        <div className={styles.searchField}>
                            <label className={styles.searchLabel}>Field of Study</label>
                            <div className={styles.inputWrapper}>
                                <GraduationCap className={styles.inputIcon} />
                                <select 
                                    value={ausbildungFilters.field}
                                    onChange={(e) => setAusbildungFilters(prev => ({ ...prev, field: e.target.value }))}
                                    className={styles.searchInput}
                                    style={{ paddingLeft: '3rem', cursor: 'pointer' }}
                                >
                                    <option value="">All Fields</option>
                                    {AUSBILDUNG_FIELDS.map(field => (
                                        <option key={field.id} value={field.id}>{field.nameEn}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* City Selector */}
                        <div className={styles.searchField}>
                            <label className={styles.searchLabel}>City</label>
                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.inputIcon} />
                                <select 
                                    value={ausbildungFilters.city}
                                    onChange={(e) => setAusbildungFilters(prev => ({ ...prev, city: e.target.value }))}
                                    className={styles.searchInput}
                                    style={{ paddingLeft: '3rem', cursor: 'pointer' }}
                                >
                                    <option value="">All Cities</option>
                                    {GERMAN_CITIES.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Search Button */}
                        <div className={styles.searchActions}>
                            <button type="submit" className={styles.btnPrimary} disabled={loading}>
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Search className="w-5 h-5" />
                                )}
                                Search
                            </button>
                        </div>
                    </div>
                    
                    {/* Additional Filters Row */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(55, 65, 81, 0.5)',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Start Year:</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['2025', '2026'].map(year => (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => setAusbildungFilters(prev => ({ 
                                        ...prev, 
                                        startYear: prev.startYear === year ? '' : year 
                                    }))}
                                    className={`${styles.filterChip} ${ausbildungFilters.startYear === year ? styles.active : ''}`}
                                    style={ausbildungFilters.startYear === year ? {
                                        background: 'rgba(34, 197, 94, 0.3)',
                                        borderColor: 'rgba(34, 197, 94, 0.5)',
                                        color: '#86efac'
                                    } : {}}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>
            )}

            {/* Advanced Filters Panel - Hidden in Ausbildung mode */}
            {showAdvancedFilters && searchType !== 'ausbildung' && (
                <div className={`${styles.glassCard} ${styles.advancedFiltersCard}`}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {/* Job Sources */}
                        <div className={styles.filterSection}>
                            <h3 className={styles.filterTitle}>
                                <Globe className="w-4 h-4" style={{ color: '#818cf8' }} />
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

                        {/* Job Type */}
                        <div className={styles.filterSection}>
                            <h3 className={styles.filterTitle}>
                                <Briefcase className="w-4 h-4" style={{ color: '#818cf8' }} />
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
                                <TrendingUp className="w-4 h-4" style={{ color: '#818cf8' }} />
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
                                <DollarSign className="w-4 h-4" style={{ color: '#818cf8' }} />
                                Salary Range
                            </h3>
                            <div className={styles.filterOptions}>
                                {ADVANCED_FILTERS.salary.map(salary => (
                                    <label key={salary} className={styles.checkboxLabel}>
                                        <input 
                                            type="checkbox"
                                            checked={advancedFilters.salary.includes(salary)}
                                            onChange={() => toggleAdvancedFilter('salary', salary)}
                                            className={styles.checkbox}
                                        />
                                        <span className={styles.checkmark}></span>
                                        {salary}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {/* Results Header */}
            <div className={styles.resultsHeader}>
                <p className={styles.resultsCount}>
                    {loading ? (
                        <span>Searching...</span>
                    ) : (
                        <>
                            <span style={{ color: 'white', fontWeight: '600' }}>{totalJobs.toLocaleString()}</span> jobs found
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
                <div className={styles.sortWrapper} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                        onClick={() => clearCacheAndSearch(buildFilters())}
                        disabled={loading}
                        className={styles.clearCacheBtn}
                        title="Clear cache and fetch fresh results"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            fontSize: '0.8rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1,
                            transition: 'all 0.2s',
                        }}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear Cache
                    </button>
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
                    <button onClick={() => refresh()} className={styles.retryBtn}>
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            )}

            {/* Loading State with Progress */}
            {loading && (
                <div className={styles.loadingContainer}>
                    {/* Progress Bar */}
                    <div className={styles.progressWrapper}>
                        <div className={styles.progressBar}>
                            <div 
                                className={styles.progressFill} 
                                style={{ width: `${searchProgress}%` }}
                            />
                        </div>
                        <div className={styles.progressInfo}>
                            <span className={styles.progressPercentage}>{searchProgress}%</span>
                            <span className={styles.progressStage}>{searchStage}</span>
                        </div>
                    </div>
                    
                    {/* Skeleton Cards - 3 columns */}
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
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && jobs.length === 0 && hasSearched && (
                <div className={`${styles.glassCard} ${styles.emptyState}`}>
                    <Search className="w-16 h-16" style={{ color: '#4b5563', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#d1d5db', marginBottom: '0.5rem' }}>No jobs found</h3>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Try adjusting your search criteria or filters</p>
                    <button onClick={() => {
                        setSearchQuery('');
                        setSelectedCountry('');
                        setSelectedCity('');
                        setIsRemoteSearch(false);
                        clearAllFilters();
                        search({ query: '' });
                    }} className={styles.btnPrimary} style={{ maxWidth: '280px' }}>
                        Clear filters and search again
                    </button>
                </div>
            )}

            {/* Jobs Grid - 3 columns on desktop */}
            {!loading && !error && jobs.length > 0 && (
                <div className={styles.jobsGrid}>
                    {jobs.map(job => {
                        const colors = job.companyColors || generateCompanyColors(job.company);
                        const jobIsCached = isJobCached(job.id);
                        const encodedJobId = encodeURIComponent(job.id);
                        
                        return (
                            <Link 
                                key={job.id}
                                href={`/jobs/${encodedJobId}`}
                                className={`${styles.jobCard} ${job.featured ? styles.featured : ''}`}
                                onMouseEnter={() => handleJobHover(job.id)}
                            >
                                {/* Featured Badge */}
                                {job.featured && (
                                    <div className={styles.featuredBadge}>
                                        <Star className="w-3 h-3" />
                                        Featured
                                    </div>
                                )}
                                
                                {/* Cached indicator */}
                                {jobIsCached && (
                                    <div className={styles.cachedBadge} title="Cached - Loads instantly">
                                        <Zap className="w-3 h-3" />
                                    </div>
                                )}
                                
                                {/* Job Header */}
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
                                        <h3 className={styles.jobTitle}>{job.title}</h3>
                                        <p className={styles.companyName}>{job.company}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className={styles.jobDescription}>
                                    {job.description?.substring(0, 120).replace(/<[^>]*>/g, '')}
                                    {job.description?.length > 120 ? '...' : ''}
                                </p>

                                {/* Tags */}
                                <div className={styles.jobTags}>
                                    {(job.skills || job.tags || []).slice(0, 3).map(tag => (
                                        <span key={tag} className={styles.tag}>{tag}</span>
                                    ))}
                                    {(job.skills || job.tags || []).length > 3 && (
                                        <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                                            +{(job.skills || job.tags || []).length - 3}
                                        </span>
                                    )}
                                </div>

                                {/* Job Meta */}
                                <div className={styles.jobMeta}>
                                    <div className={styles.jobDetails}>
                                        <span className={styles.jobLocation}>
                                            <MapPin className="w-3.5 h-3.5" />
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
                                            title={savedJobs.includes(job.id) ? 'Unsave' : 'Save for later'}
                                        >
                                            <Bookmark className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Ausbildung Badge */}
                                {job.isAusbildung && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginTop: '0.5rem',
                                        padding: '0.5rem',
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        borderRadius: '6px',
                                        fontSize: '0.65rem'
                                    }}>
                                        <GraduationCap className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                                        <span style={{ color: '#22c55e', fontWeight: '600' }}>Ausbildung</span>
                                        {job.ausbildungDetails?.duration && (
                                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                • {job.ausbildungDetails.duration}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Platform Tag */}
                                <div className={styles.platformTag}>
                                    via {JOB_PLATFORMS.find(p => p.id === job.source)?.name || 
                                         (job.source === 'ausbildung' ? 'Ausbildung.de' : job.source) || 'Direct'}
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
                        style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {paginationNumbers.map((page, index) => (
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className={styles.pageEllipsis}>...</span>
                        ) : (
                            <button 
                                key={page}
                                className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                                onClick={() => handlePageChange(page)}
                                style={currentPage === page ? {
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    borderColor: 'transparent'
                                } : {}}
                            >
                                {page}
                                {isPageCached(page) && currentPage !== page && (
                                    <span className={styles.cachedDot}></span>
                                )}
                            </button>
                        )
                    ))}
                    
                    <button 
                        className={styles.pageBtn}
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
