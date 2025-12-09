'use client';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

const MIN_LOADING_TIME = 500; // Minimum time to show loader (ms)

export default function PageLoader() {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const pathname = usePathname();
    const startTimeRef = useRef(null);
    const isFirstRender = useRef(true);

    // Detect route changes and complete loading
    useEffect(() => {
        // Skip first render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Route changed - complete the loading with minimum display time
        if (startTimeRef.current) {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);
            
            setProgress(100);
            
            setTimeout(() => {
                setVisible(false);
                setProgress(0);
                startTimeRef.current = null;
            }, remaining + 200);
        }
    }, [pathname]);

    // Animate progress while visible
    useEffect(() => {
        if (!visible) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 85) return prev;
                return prev + (Math.random() * 15);
            });
        }, 150);

        return () => clearInterval(interval);
    }, [visible]);

    // Listen for link clicks
    useEffect(() => {
        const handleClick = (e) => {
            // Skip if clicking on interactive elements inside links
            const target = e.target.closest('a');
            const clickedElement = e.target.closest('button, input, select, textarea, [role="button"]');
            
            // If clicked on an interactive element, don't show loader
            if (clickedElement) return;
            
            if (!target) return;
            
            const href = target.getAttribute('href');
            if (!href) return;
            
            // Skip external links, hash links, downloads, and same-page links
            if (
                href.startsWith('http') || 
                href.startsWith('#') || 
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                target.hasAttribute('download') ||
                target.getAttribute('target') === '_blank' ||
                href === pathname
            ) return;
            
            // Skip if modifier keys are pressed
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            
            // Start loading
            startTimeRef.current = Date.now();
            setVisible(true);
            setProgress(15);
        };

        // Use capture phase to catch clicks before Next.js handles them
        window.addEventListener('click', handleClick, { capture: true });
        
        return () => {
            window.removeEventListener('click', handleClick, { capture: true });
        };
    }, [pathname]);

    if (!visible) return null;

    return (
        <div className="page-loader" aria-hidden="true">
            <div 
                className="page-loader-bar" 
                style={{ 
                    transform: `scaleX(${progress / 100})`
                }} 
            />
        </div>
    );
}
