/**
 * useJobsPagination Hook
 * 
 * Advanced pagination hook with:
 * - 3-page sliding window cache
 * - Request deduplication
 * - AbortController for cancelled requests
 * - Intelligent prefetching (N+1 high priority, N-1 medium)
 * - Stale-while-revalidate pattern
 * - SessionStorage persistence for back navigation
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Cache configuration
const CACHE_SIZE = 3; // Keep only 3 pages in memory
const PREFETCH_DELAY = 300; // ms delay before prefetching
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache validity
const SESSION_CACHE_KEY = 'job_search_results_cache';

/**
 * Build search params from filter object
 */
function buildSearchParams(filters, page, limit, bypassCache = false) {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.location) params.set('location', filters.location);
    if (filters.country) params.set('country', filters.country);
    if (filters.remote) params.set('remote', 'true');
    if (filters.jobType) params.set('jobType', filters.jobType.toLowerCase().replace(' ', '-'));
    if (filters.experienceLevel) {
        const levelMap = {
            'Entry Level': 'entry',
            'Mid-Level': 'mid',
            'Senior': 'senior',
            'Lead': 'senior',
        };
        params.set('experienceLevel', levelMap[filters.experienceLevel] || 'mid');
    }
    if (filters.salaryMin) params.set('salaryMin', filters.salaryMin.toString());
    if (filters.sources && !filters.sources.includes('all')) {
        params.set('sources', filters.sources.join(','));
    }
    
    // Ausbildung-specific params
    if (filters.isAusbildung) params.set('isAusbildung', 'true');
    if (filters.ausbildungField) params.set('ausbildungField', filters.ausbildungField);
    if (filters.startYear) params.set('startYear', filters.startYear);
    
    // Morocco-specific params
    if (filters.isMorocco) params.set('isMorocco', 'true');
    if (filters.moroccoSources && filters.moroccoSources.length > 0) {
        params.set('moroccoSources', filters.moroccoSources.join(','));
    }
    
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    // Add cache bypass flag
    if (bypassCache) {
        params.set('cache', 'false');
    }
    
    return params.toString();
}

/**
 * Generate a unique cache key for a search
 */
function generateCacheKey(filters, page) {
    return JSON.stringify({ ...filters, page });
}

/**
 * Save results cache to sessionStorage for persistence across navigation
 */
function saveToSessionStorage(filters, page, data, totalJobs, totalPages, sourcesUsed) {
    if (typeof window === 'undefined') return;
    try {
        const cacheData = {
            filters,
            page,
            data,
            totalJobs,
            totalPages,
            sourcesUsed,
            timestamp: Date.now(),
        };
        sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
        // SessionStorage might be full or unavailable
        console.warn('Failed to save search results to sessionStorage:', e);
    }
}

/**
 * Load results cache from sessionStorage
 */
function loadFromSessionStorage() {
    if (typeof window === 'undefined') return null;
    try {
        const stored = sessionStorage.getItem(SESSION_CACHE_KEY);
        if (!stored) return null;
        
        const cacheData = JSON.parse(stored);
        
        // Check if cache is still valid (within 30 minutes)
        if (Date.now() - cacheData.timestamp > 30 * 60 * 1000) {
            sessionStorage.removeItem(SESSION_CACHE_KEY);
            return null;
        }
        
        return cacheData;
    } catch (e) {
        return null;
    }
}

export function useJobsPagination(initialFilters = {}, pageSize = 14) {
    // Try to restore from sessionStorage on initial load
    const sessionCache = useMemo(() => loadFromSessionStorage(), []);
    
    // State - restore from session cache if available
    const [currentPage, setCurrentPage] = useState(sessionCache?.page || 1);
    const [filters, setFilters] = useState(sessionCache?.filters || initialFilters);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(sessionCache?.totalPages || 1);
    const [totalJobs, setTotalJobs] = useState(sessionCache?.totalJobs || 0);
    const [sourcesUsed, setSourcesUsed] = useState(sessionCache?.sourcesUsed || []);
    const [hasSearched, setHasSearched] = useState(!!sessionCache);
    const [restoredFromCache, setRestoredFromCache] = useState(!!sessionCache);
    
    // Refs for caching and request management
    const cacheRef = useRef(new Map()); // Page cache: Map<cacheKey, { data, timestamp }>
    const abortControllerRef = useRef(null);
    const pendingRequestsRef = useRef(new Set()); // Track in-flight requests
    const prefetchTimeoutRef = useRef(null);
    
    // Initialize cache from sessionStorage if available
    useEffect(() => {
        if (sessionCache?.data) {
            const cacheKey = generateCacheKey(sessionCache.filters, sessionCache.page);
            cacheRef.current.set(cacheKey, {
                data: sessionCache.data,
                timestamp: sessionCache.timestamp,
            });
        }
    }, [sessionCache]);
    
    // Get current page's jobs from cache
    const currentCacheKey = generateCacheKey(filters, currentPage);
    const cachedData = cacheRef.current.get(currentCacheKey);
    const jobs = cachedData?.data?.jobs || sessionCache?.data?.jobs || [];
    
    /**
     * Check if a cache entry is still valid
     */
    const isCacheValid = useCallback((cacheKey) => {
        const entry = cacheRef.current.get(cacheKey);
        if (!entry) return false;
        return Date.now() - entry.timestamp < CACHE_TTL;
    }, []);
    
    /**
     * Clean up old cache entries, keeping only the sliding window
     */
    const cleanupCache = useCallback((centerPage) => {
        const keysToKeep = new Set();
        
        // Keep pages in the sliding window: [centerPage - 1, centerPage, centerPage + 1]
        for (let p = Math.max(1, centerPage - 1); p <= Math.min(totalPages, centerPage + 1); p++) {
            keysToKeep.add(generateCacheKey(filters, p));
        }
        
        // Remove entries outside the window
        for (const key of cacheRef.current.keys()) {
            if (!keysToKeep.has(key)) {
                cacheRef.current.delete(key);
            }
        }
    }, [filters, totalPages]);
    
    /**
     * Fetch a page of jobs
     */
    const fetchPage = useCallback(async (page, options = {}) => {
        const { 
            isPrefetch = false, 
            forceRefresh = false,
            bypassServerCache = false, // NEW: bypass server-side cache too
            signal = null,
            overrideFilters = null  // Allow passing filters directly
        } = options;
        
        const effectiveFilters = overrideFilters || filters;
        const cacheKey = generateCacheKey(effectiveFilters, page);
        
        // Check cache first (unless force refresh)
        if (!forceRefresh && !bypassServerCache && isCacheValid(cacheKey)) {
            return cacheRef.current.get(cacheKey).data;
        }
        
        // Deduplicate: don't make duplicate requests
        if (pendingRequestsRef.current.has(cacheKey)) {
            // Wait for the existing request
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!pendingRequestsRef.current.has(cacheKey)) {
                        clearInterval(checkInterval);
                        resolve(cacheRef.current.get(cacheKey)?.data || null);
                    }
                }, 50);
            });
        }
        
        pendingRequestsRef.current.add(cacheKey);
        
        try {
            const queryString = buildSearchParams(effectiveFilters, page, pageSize, bypassServerCache);
            const response = await fetch(`/api/jobs/search?${queryString}`, {
                signal: signal || undefined,
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch jobs');
            }
            
            const result = {
                jobs: data.data.jobs || [],
                pagination: data.data.pagination,
                sources: data.data.sources || [],
            };
            
            // Store in cache
            cacheRef.current.set(cacheKey, {
                data: result,
                timestamp: Date.now(),
            });
            
            return result;
        } catch (err) {
            if (err.name === 'AbortError') {
                // Request was cancelled, don't treat as error
                return null;
            }
            throw err;
        } finally {
            pendingRequestsRef.current.delete(cacheKey);
        }
    }, [filters, pageSize, isCacheValid]);
    
    /**
     * Prefetch adjacent pages
     */
    const prefetchAdjacentPages = useCallback((centerPage) => {
        // Clear any pending prefetch
        if (prefetchTimeoutRef.current) {
            clearTimeout(prefetchTimeoutRef.current);
        }
        
        prefetchTimeoutRef.current = setTimeout(async () => {
            // High priority: next page
            if (centerPage < totalPages) {
                const nextKey = generateCacheKey(filters, centerPage + 1);
                if (!isCacheValid(nextKey) && !pendingRequestsRef.current.has(nextKey)) {
                    fetchPage(centerPage + 1, { isPrefetch: true }).catch(() => {});
                }
            }
            
            // Medium priority: previous page (if not cached)
            if (centerPage > 1) {
                const prevKey = generateCacheKey(filters, centerPage - 1);
                if (!isCacheValid(prevKey) && !pendingRequestsRef.current.has(prevKey)) {
                    // Small delay to prioritize next page
                    setTimeout(() => {
                        fetchPage(centerPage - 1, { isPrefetch: true }).catch(() => {});
                    }, 200);
                }
            }
        }, PREFETCH_DELAY);
    }, [filters, totalPages, fetchPage, isCacheValid]);
    
    /**
     * Search with new filters (resets to page 1)
     */
    const search = useCallback(async (newFilters = filters) => {
        // Cancel any in-flight requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        
        // Clear cache when filters change
        if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
            cacheRef.current.clear();
        }
        
        setFilters(newFilters);
        setCurrentPage(1);
        setLoading(true);
        setError(null);
        setHasSearched(true);
        
        try {
            // Pass newFilters directly to avoid stale closure issue
            const result = await fetchPage(1, { 
                forceRefresh: true,
                signal: abortControllerRef.current.signal,
                overrideFilters: newFilters
            });
            
            if (result) {
                setTotalJobs(result.pagination?.total || 0);
                setTotalPages(result.pagination?.totalPages || 1);
                setSourcesUsed(result.sources || []);
                
                // Save to sessionStorage for back navigation persistence
                saveToSessionStorage(
                    newFilters,
                    1,
                    result,
                    result.pagination?.total || 0,
                    result.pagination?.totalPages || 1,
                    result.sources || []
                );
                
                // Start prefetching next page
                if (result.pagination?.totalPages > 1) {
                    prefetchAdjacentPages(1);
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message || 'Failed to search jobs');
            }
        } finally {
            setLoading(false);
        }
    }, [filters, fetchPage, prefetchAdjacentPages]);
    
    /**
     * Go to a specific page
     */
    const goToPage = useCallback(async (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        
        // Cancel any in-flight requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        
        const cacheKey = generateCacheKey(filters, page);
        const hasCache = isCacheValid(cacheKey);
        
        // If we have cache, show it immediately (stale-while-revalidate)
        if (hasCache) {
            setCurrentPage(page);
            cleanupCache(page);
            prefetchAdjacentPages(page);
            
            // Save current page to sessionStorage
            const cachedResult = cacheRef.current.get(cacheKey);
            if (cachedResult?.data) {
                saveToSessionStorage(filters, page, cachedResult.data, totalJobs, totalPages, sourcesUsed);
            }
            
            // Optionally revalidate in background
            fetchPage(page, { isPrefetch: true }).catch(() => {});
            return;
        }
        
        // No cache, need to fetch
        setLoading(true);
        setError(null);
        
        try {
            const result = await fetchPage(page, { signal: abortControllerRef.current.signal });
            setCurrentPage(page);
            cleanupCache(page);
            prefetchAdjacentPages(page);
            
            // Save to sessionStorage
            if (result) {
                saveToSessionStorage(filters, page, result, totalJobs, totalPages, sourcesUsed);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message || 'Failed to load page');
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, totalPages, totalJobs, sourcesUsed, filters, fetchPage, isCacheValid, cleanupCache, prefetchAdjacentPages]);
    
    /**
     * Go to next page
     */
    const nextPage = useCallback(() => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    }, [currentPage, totalPages, goToPage]);
    
    /**
     * Go to previous page
     */
    const previousPage = useCallback(() => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    }, [currentPage, goToPage]);
    
    /**
     * Refresh current page
     */
    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await fetchPage(currentPage, { forceRefresh: true });
            if (result) {
                setTotalJobs(result.pagination?.total || 0);
                setTotalPages(result.pagination?.totalPages || 1);
                setSourcesUsed(result.sources || []);
            }
        } catch (err) {
            setError(err.message || 'Failed to refresh');
        } finally {
            setLoading(false);
        }
    }, [currentPage, fetchPage]);
    
    /**
     * Clear ALL caches and search fresh - bypasses server cache too
     */
    const clearCacheAndSearch = useCallback(async (newFilters = filters) => {
        // Cancel any in-flight requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        
        // Clear ALL local caches
        cacheRef.current.clear();
        
        // Clear sessionStorage cache
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(SESSION_CACHE_KEY);
        }
        
        // Also clear server cache via API
        try {
            await fetch('/api/jobs/cache', { method: 'DELETE' });
        } catch (e) {
            console.warn('Failed to clear server cache:', e);
        }
        
        setFilters(newFilters);
        setCurrentPage(1);
        setLoading(true);
        setError(null);
        setHasSearched(true);
        setRestoredFromCache(false);
        
        try {
            // Fetch with bypass of ALL caches
            const result = await fetchPage(1, { 
                forceRefresh: true,
                bypassServerCache: true,
                signal: abortControllerRef.current.signal,
                overrideFilters: newFilters
            });
            
            if (result) {
                setTotalJobs(result.pagination?.total || 0);
                setTotalPages(result.pagination?.totalPages || 1);
                setSourcesUsed(result.sources || []);
                
                // Save fresh results to sessionStorage
                saveToSessionStorage(
                    newFilters,
                    1,
                    result,
                    result.pagination?.total || 0,
                    result.pagination?.totalPages || 1,
                    result.sources || []
                );
                
                // Start prefetching next page
                if (result.pagination?.totalPages > 1) {
                    prefetchAdjacentPages(1);
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message || 'Failed to search jobs');
            }
        } finally {
            setLoading(false);
        }
    }, [filters, fetchPage, prefetchAdjacentPages]);
    
    /**
     * Clear all local caches only (without making a new search)
     */
    const clearLocalCache = useCallback(() => {
        cacheRef.current.clear();
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(SESSION_CACHE_KEY);
        }
        setRestoredFromCache(false);
    }, []);
    
    /**
     * Check if a page is cached
     */
    const isPageCached = useCallback((page) => {
        return isCacheValid(generateCacheKey(filters, page));
    }, [filters, isCacheValid]);
    
    /**
     * Generate pagination numbers for UI
     */
    const paginationNumbers = useMemo(() => {
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
    }, [currentPage, totalPages]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (prefetchTimeoutRef.current) {
                clearTimeout(prefetchTimeoutRef.current);
            }
        };
    }, []);
    
    return {
        // Data
        jobs,
        totalJobs,
        totalPages,
        currentPage,
        sourcesUsed,
        
        // State
        loading,
        error,
        hasSearched,
        restoredFromCache, // Indicates if results were restored from sessionStorage
        
        // Actions
        search,
        goToPage,
        nextPage,
        previousPage,
        refresh,
        setFilters,
        clearCacheAndSearch, // NEW: Clear all caches and search fresh
        clearLocalCache, // NEW: Clear local caches only
        
        // Utilities
        isPageCached,
        paginationNumbers,
        
        // Get cached filters for restoration
        getCachedFilters: () => sessionCache?.filters || null,
    };
}

export default useJobsPagination;
