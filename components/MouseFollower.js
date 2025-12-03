'use client';
import { useEffect, useRef, useState } from 'react';

export default function MouseFollower() {
    const outerRef = useRef(null);
    const innerRef = useRef(null);
    const dotRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Hide on touch devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const outer = outerRef.current;
        const inner = innerRef.current;
        const dot = dotRef.current;

        if (!outer || !inner || !dot) return;

        let mouseX = 0;
        let mouseY = 0;
        let outerX = 0;
        let outerY = 0;
        let innerX = 0;
        let innerY = 0;
        let dotX = 0;
        let dotY = 0;
        let animationId = null;
        let isAnimating = false;
        let lastTime = 0;
        const throttleMs = 16; // ~60fps

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (!isVisible) setIsVisible(true);
            
            // Start animation if not already running
            if (!isAnimating) {
                isAnimating = true;
                animationId = requestAnimationFrame(animate);
            }
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
            isAnimating = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };

        const animate = (currentTime) => {
            // Throttle updates
            if (currentTime - lastTime < throttleMs) {
                animationId = requestAnimationFrame(animate);
                return;
            }
            lastTime = currentTime;

            // Calculate distance to check if we should stop animating
            const outerDist = Math.abs(mouseX - outerX) + Math.abs(mouseY - outerY);
            
            // Stop animation if mouse hasn't moved and elements caught up
            if (outerDist < 0.5) {
                isAnimating = false;
                return;
            }

            // Outer follower - slowest
            outerX += (mouseX - outerX) * 0.08;
            outerY += (mouseY - outerY) * 0.08;
            outer.style.transform = `translate3d(${outerX}px, ${outerY}px, 0)`;

            // Inner follower - medium
            innerX += (mouseX - innerX) * 0.12;
            innerY += (mouseY - innerY) * 0.12;
            inner.style.transform = `translate3d(${innerX}px, ${innerY}px, 0)`;

            // Dot follower - fastest
            dotX += (mouseX - dotX) * 0.25;
            dotY += (mouseY - dotY) * 0.25;
            dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;

            animationId = requestAnimationFrame(animate);
        };

        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [isVisible]);

    // Don't render on touch devices (checked in useEffect but also here for SSR)
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        return null;
    }

    return (
        <>
            <div 
                ref={outerRef} 
                className="mouse-follower mouse-follower-outer"
                style={{ 
                    opacity: isVisible ? 1 : 0,
                    willChange: 'transform',
                    transform: 'translate3d(0, 0, 0)'
                }}
            />
            <div 
                ref={innerRef} 
                className="mouse-follower mouse-follower-inner"
                style={{ 
                    opacity: isVisible ? 1 : 0,
                    willChange: 'transform',
                    transform: 'translate3d(0, 0, 0)'
                }}
            />
            <div 
                ref={dotRef} 
                className="mouse-follower mouse-follower-dot"
                style={{ 
                    opacity: isVisible ? 1 : 0,
                    willChange: 'transform',
                    transform: 'translate3d(0, 0, 0)'
                }}
            />
        </>
    );
}
