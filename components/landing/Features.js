'use client';
import { useEffect, useRef } from 'react';

export default function Features() {
    const observerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.scroll-reveal');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <section id="features" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 scroll-reveal">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        <span className="font-display text-gradient">Two Powerful Engines,</span><br />
                        <span className="text-white">One Mission: Your Success</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Our AI doesn't just build resumes—it understands careers. And while you sleep, it hunts for your perfect job.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {/* AI CV Builder */}
                    <div className="glass-card rounded-3xl p-8 scroll-reveal group">
                        <div className="feature-icon w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">AI CV Builder</h3>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Tell us about yourself in plain English. Our AI transforms your experience into a compelling, ATS-optimized resume that hiring managers can't ignore.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-300">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Industry-specific keyword optimization
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Real-time ATS score analysis
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                50+ premium templates
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                One-click customization per job
                            </li>
                        </ul>
                    </div>

                    {/* Auto Job Searcher */}
                    <div className="glass-card rounded-3xl p-8 scroll-reveal group" style={{ transitionDelay: '0.1s' }}>
                        <div className="feature-icon w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Automatic Job Searcher</h3>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Set your preferences once. Our AI scans thousands of job boards 24/7, matches opportunities to your profile, and delivers only the jobs worth your time.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-300">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Scans 100+ job platforms daily
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Smart match scoring system
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Salary & culture fit analysis
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                One-click apply with tailored CV
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Additional Features Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="glass-card rounded-2xl p-6 scroll-reveal hover:scale-105 transition-transform">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h4 className="font-semibold mb-2">ATS-Proof Formatting</h4>
                        <p className="text-sm text-gray-400">Every CV passes automated screening systems with flying colors.</p>
                    </div>

                    <div className="glass-card rounded-2xl p-6 scroll-reveal hover:scale-105 transition-transform" style={{ transitionDelay: '0.1s' }}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="font-semibold mb-2">Global Job Coverage</h4>
                        <p className="text-sm text-gray-400">Access opportunities across 150+ countries and remote positions.</p>
                    </div>

                    <div className="glass-card rounded-2xl p-6 scroll-reveal hover:scale-105 transition-transform" style={{ transitionDelay: '0.2s' }}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <h4 className="font-semibold mb-2">Interview Insights</h4>
                        <p className="text-sm text-gray-400">AI-powered preparation guides tailored to each company.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
