/**
 * useJobDetailsCache Hook
 * 
 * Global cache for job details with:
 * - LRU eviction (keeps most recently viewed)
 * - Instant retrieval of previously viewed jobs
 * - Background refresh option
 * - Persistence across navigation
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Cache configuration
const MAX_CACHED_JOBS = 20; // Keep last 20 viewed jobs
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache validity
const STORAGE_KEY = 'job_details_cache';

// Global cache (shared across all component instances)
// Using module-level variables for persistence across navigation
let jobCache = new Map(); // Map<jobId, { data, timestamp, accessTime }>
let cacheInitialized = false;

/**
 * Initialize cache from localStorage (if available)
 */
function initializeCache() {
    if (cacheInitialized) return;
    cacheInitialized = true;
    
    if (typeof window === 'undefined') return;
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            const now = Date.now();
            
            // Filter out expired entries
            for (const [key, value] of Object.entries(parsed)) {
                if (now - value.timestamp < CACHE_TTL) {
                    jobCache.set(key, { ...value, accessTime: now });
                }
            }
        }
    } catch (err) {
        console.warn('Failed to load job cache from localStorage:', err);
    }
}

/**
 * Persist cache to localStorage
 */
function persistCache() {
    if (typeof window === 'undefined') return;
    
    try {
        const obj = {};
        for (const [key, value] of jobCache.entries()) {
            obj[key] = value;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (err) {
        console.warn('Failed to persist job cache:', err);
    }
}

/**
 * Evict least recently used entries when cache is full
 */
function evictLRU() {
    if (jobCache.size <= MAX_CACHED_JOBS) return;
    
    // Sort by access time (oldest first)
    const entries = [...jobCache.entries()].sort((a, b) => 
        a[1].accessTime - b[1].accessTime
    );
    
    // Remove oldest entries until we're under the limit
    const toRemove = jobCache.size - MAX_CACHED_JOBS;
    for (let i = 0; i < toRemove; i++) {
        jobCache.delete(entries[i][0]);
    }
}

// Initialize on module load
if (typeof window !== 'undefined') {
    initializeCache();
}

export function useJobDetailsCache() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);
    
    // Force re-render when cache updates
    const [, forceUpdate] = useState({});
    
    /**
     * Get a job from cache
     */
    const getCachedJob = useCallback((jobId) => {
        const entry = jobCache.get(jobId);
        if (!entry) return null;
        
        // Check if expired
        if (Date.now() - entry.timestamp > CACHE_TTL) {
            jobCache.delete(jobId);
            return null;
        }
        
        // Update access time (LRU tracking)
        entry.accessTime = Date.now();
        
        return entry.data;
    }, []);
    
    /**
     * Check if a job is in cache and valid
     */
    const isJobCached = useCallback((jobId) => {
        const entry = jobCache.get(jobId);
        if (!entry) return false;
        return Date.now() - entry.timestamp < CACHE_TTL;
    }, []);
    
    /**
     * Add a job to cache
     */
    const cacheJob = useCallback((jobId, jobData) => {
        const now = Date.now();
        jobCache.set(jobId, {
            data: jobData,
            timestamp: now,
            accessTime: now,
        });
        
        evictLRU();
        persistCache();
        forceUpdate({});
    }, []);
    
    /**
     * Fetch job details (with caching)
     */
    const fetchJobDetails = useCallback(async (jobId, options = {}) => {
        const { 
            forceRefresh = false,
            includeMatch = true,
        } = options;
        
        // Decode the job ID in case it came from a URL
        const decodedJobId = decodeURIComponent(jobId);
        
        // Check cache first
        if (!forceRefresh) {
            const cached = getCachedJob(decodedJobId);
            if (cached) {
                return cached;
            }
        }
        
        // Cancel any in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        setError(null);
        
        try {
            // URL encode the job ID for the API request
            const response = await fetch(`/api/jobs/${encodeURIComponent(decodedJobId)}`, {
                signal: abortControllerRef.current.signal,
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch job details');
            }
            
            const job = data.data.job;
            
            // Cache the job with decoded ID
            cacheJob(decodedJobId, job);
            
            return job;
        } catch (err) {
            if (err.name === 'AbortError') {
                return null;
            }
            setError(err.message || 'Failed to load job');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [getCachedJob, cacheJob]);
    
    /**
     * Prefetch a job in the background (e.g., on hover)
     */
    const prefetchJob = useCallback(async (jobId) => {
        // Don't prefetch if already cached
        if (isJobCached(jobId)) return;
        
        try {
            await fetchJobDetails(jobId);
        } catch (err) {
            // Silently fail for prefetch
            console.debug('Prefetch failed for job:', jobId);
        }
    }, [isJobCached, fetchJobDetails]);
    
    /**
     * Clear a specific job from cache
     */
    const invalidateJob = useCallback((jobId) => {
        jobCache.delete(jobId);
        persistCache();
        forceUpdate({});
    }, []);
    
    /**
     * Clear entire cache
     */
    const clearCache = useCallback(() => {
        jobCache.clear();
        localStorage.removeItem(STORAGE_KEY);
        forceUpdate({});
    }, []);
    
    /**
     * Get all cached job IDs
     */
    const getCachedJobIds = useCallback(() => {
        return [...jobCache.keys()];
    }, []);
    
    /**
     * Get cache statistics
     */
    const getCacheStats = useCallback(() => {
        const now = Date.now();
        let validCount = 0;
        let expiredCount = 0;
        
        for (const [, entry] of jobCache.entries()) {
            if (now - entry.timestamp < CACHE_TTL) {
                validCount++;
            } else {
                expiredCount++;
            }
        }
        
        return {
            total: jobCache.size,
            valid: validCount,
            expired: expiredCount,
            maxSize: MAX_CACHED_JOBS,
        };
    }, []);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);
    
    return {
        // State
        loading,
        error,
        
        // Cache operations
        getCachedJob,
        isJobCached,
        cacheJob,
        fetchJobDetails,
        prefetchJob,
        invalidateJob,
        clearCache,
        
        // Utilities
        getCachedJobIds,
        getCacheStats,
    };
}

/**
 * JobDetailsCacheProvider Context
 * For sharing cache state across components
 */
import { createContext, useContext } from 'react';

const JobDetailsCacheContext = createContext(null);

export function JobDetailsCacheProvider({ children }) {
    const cache = useJobDetailsCache();
    
    return (
        <JobDetailsCacheContext.Provider value={cache}>
            {children}
        </JobDetailsCacheContext.Provider>
    );
}

export function useJobDetailsCacheContext() {
    const context = useContext(JobDetailsCacheContext);
    if (!context) {
        throw new Error('useJobDetailsCacheContext must be used within JobDetailsCacheProvider');
    }
    return context;
}

export default useJobDetailsCache;
