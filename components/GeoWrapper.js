'use client';

import { useState, useEffect } from 'react';
import BlockedRegionPage from './BlockedRegionPage';
import PalestineSupport from './PalestineSupport';

/**
 * GeoWrapper Component
 * Wraps the app to:
 * 1. Block users from Israel
 * 2. Show Palestine support icon on all pages
 */
export default function GeoWrapper({ children }) {
    const [isBlocked, setIsBlocked] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // 🔴 TESTING: Set to true to preview the blocked page, set to false for normal behavior
    const FORCE_SHOW_BLOCKED_PAGE = false;

    useEffect(() => {
        // If forcing blocked page for testing, skip the geo check
        if (FORCE_SHOW_BLOCKED_PAGE) {
            setIsBlocked(true);
            setIsChecking(false);
            return;
        }

        async function checkLocation() {
            try {
                // Check localStorage first to avoid repeated API calls
                const cached = localStorage.getItem('geo_check');
                if (cached) {
                    const { blocked, timestamp } = JSON.parse(cached);
                    // Cache for 1 hour
                    if (Date.now() - timestamp < 3600000) {
                        setIsBlocked(blocked);
                        setIsChecking(false);
                        return;
                    }
                }

                // Use our internal API to detect location (avoids CORS issues)
                const response = await fetch('/api/geo');
                
                if (response.ok) {
                    const data = await response.json();
                    const countryCode = data.country_code;
                    
                    // Block if from Israel
                    const blocked = countryCode === 'IL';
                    
                    // Cache the result
                    localStorage.setItem('geo_check', JSON.stringify({
                        blocked,
                        timestamp: Date.now(),
                    }));
                    
                    setIsBlocked(blocked);
                }
            } catch (error) {
                console.error('Geo check failed:', error);
                // On error, don't block
                setIsBlocked(false);
            } finally {
                setIsChecking(false);
            }
        }

        checkLocation();
    }, []);

    // Show loading state briefly while checking
    if (isChecking) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // If blocked, show the blocked page
    if (isBlocked) {
        return <BlockedRegionPage />;
    }

    // Otherwise, render children with Palestine support icon
    return (
        <>
            {children}
            <PalestineSupport />
        </>
    );
}
