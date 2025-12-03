'use client';
import { useEffect, useRef, useState } from 'react';

export default function Stats() {
    const [stats, setStats] = useState({
        cvs: 0,
        interviewRate: 0,
        jobsMatched: 0,
        daysToHire: 0
    });
    const sectionRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    animateStats();
                }
            },
            { threshold: 0.5 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated]);

    const animateStats = () => {
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setStats({
                cvs: Math.floor(50000 * progress),
                interviewRate: Math.floor(92 * progress),
                jobsMatched: Math.floor(2500000 * progress),
                daysToHire: Math.floor(14 * progress)
            });

            if (currentStep >= steps) {
                clearInterval(timer);
            }
        }, interval);
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
        if (num >= 1000) return Math.floor(num / 1000) + 'K+';
        return num;
    };

    return (
        <section className="py-16 relative" ref={sectionRef}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="glass-card rounded-3xl p-8 md:p-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className={`text-center scroll-reveal ${hasAnimated ? 'revealed' : ''}`}>
                            <div className="stat-number text-4xl md:text-5xl font-bold mb-2">
                                {formatNumber(stats.cvs)}
                            </div>
                            <div className="text-gray-400">CVs Created</div>
                        </div>
                        <div className={`text-center scroll-reveal ${hasAnimated ? 'revealed' : ''}`} style={{ transitionDelay: '0.1s' }}>
                            <div className="stat-number text-4xl md:text-5xl font-bold mb-2">
                                {stats.interviewRate}%
                            </div>
                            <div className="text-gray-400">% Interview Rate</div>
                        </div>
                        <div className={`text-center scroll-reveal ${hasAnimated ? 'revealed' : ''}`} style={{ transitionDelay: '0.2s' }}>
                            <div className="stat-number text-4xl md:text-5xl font-bold mb-2">
                                {formatNumber(stats.jobsMatched)}
                            </div>
                            <div className="text-gray-400">Jobs Matched</div>
                        </div>
                        <div className={`text-center scroll-reveal ${hasAnimated ? 'revealed' : ''}`} style={{ transitionDelay: '0.3s' }}>
                            <div className="stat-number text-4xl md:text-5xl font-bold mb-2">
                                {stats.daysToHire}
                            </div>
                            <div className="text-gray-400">Days Avg. to Hire</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
