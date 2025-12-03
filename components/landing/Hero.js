'use client';
import { useEffect, useState } from 'react';

export default function Hero({ onOpenSignup }) {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const phrases = ['AI', 'Intelligence', 'Automation', 'Machine Learning'];

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % phrases.length;
            const fullText = phrases[i];

            setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));

            setTypingSpeed(isDeleting ? 50 : 150);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed, phrases]);

    return (
        <section className="relative min-h-screen hero-gradient flex items-center pt-24 pb-16 overflow-hidden">
            {/* Floating Orbs */}
            <div className="glow-orb orb-1"></div>
            <div className="glow-orb orb-2"></div>
            <div className="glow-orb orb-3"></div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-gray-300 mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-green-400"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span>Trusted by 50,000+ professionals worldwide</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                            <span className="font-display text-gradient">Your Career,</span><br />
                            <span className="text-white">Powered by</span>{' '}
                            <span className="relative inline-block">
                                <span className="text-gradient">{text}</span>
                                <span className="typing-cursor text-indigo-400">|</span>
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Stop writing resumes. Start landing interviews. Our AI crafts perfect CVs while automatically matching you with your dream jobs—24/7.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                            <button onClick={onOpenSignup} className="btn-primary px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 group">
                                Build Your CV Now
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                            <button className="px-8 py-4 rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/5 transition flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Watch Demo
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex items-center gap-6 justify-center lg:justify-start opacity-60">
                            <div className="flex items-center gap-1">
                                <div className="flex -space-x-2">
                                    <img src="https://i.pravatar.cc/40?img=1" className="w-8 h-8 rounded-full border-2 border-gray-900" alt="User" />
                                    <img src="https://i.pravatar.cc/40?img=2" className="w-8 h-8 rounded-full border-2 border-gray-900" alt="User" />
                                    <img src="https://i.pravatar.cc/40?img=3" className="w-8 h-8 rounded-full border-2 border-gray-900" alt="User" />
                                    <img src="https://i.pravatar.cc/40?img=4" className="w-8 h-8 rounded-full border-2 border-gray-900" alt="User" />
                                </div>
                            </div>
                            <div className="text-sm text-gray-400">
                                <span className="text-yellow-500">★★★★★</span> 4.9/5 from 2,000+ reviews
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="relative hidden md:block">
                        {/* CV Preview Card */}
                        <div className="cv-preview rounded-3xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                                <div className="flex-1">
                                    <div className="h-4 w-32 bg-white/20 rounded mb-2"></div>
                                    <div className="h-3 w-24 bg-white/10 rounded"></div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">AI Optimized</div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="h-3 w-full bg-white/10 rounded relative overflow-hidden"><div className="shimmer absolute inset-0"></div></div>
                                <div className="h-3 w-5/6 bg-white/10 rounded"></div>
                                <div className="h-3 w-4/6 bg-white/10 rounded"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="h-20 rounded-xl bg-white/5 p-3">
                                    <div className="h-2 w-16 bg-indigo-500/50 rounded mb-2"></div>
                                    <div className="h-2 w-full bg-white/10 rounded mb-1"></div>
                                    <div className="h-2 w-4/5 bg-white/10 rounded"></div>
                                </div>
                                <div className="h-20 rounded-xl bg-white/5 p-3">
                                    <div className="h-2 w-16 bg-purple-500/50 rounded mb-2"></div>
                                    <div className="h-2 w-full bg-white/10 rounded mb-1"></div>
                                    <div className="h-2 w-4/5 bg-white/10 rounded"></div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">React</span>
                                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">Python</span>
                                <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs">Leadership</span>
                            </div>
                        </div>

                        {/* Floating Job Matches */}
                        <div className="absolute -right-4 top-1/4 glass-card rounded-2xl p-4 shadow-xl job-card" style={{ transform: 'translateX(20px)', animationDelay: '0.5s' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold">G</div>
                                <div>
                                    <div className="font-medium text-sm">Senior Developer</div>
                                    <div className="text-xs text-gray-400">Google • 98% Match</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -left-4 bottom-1/4 glass-card rounded-2xl p-4 shadow-xl job-card" style={{ transform: 'translateX(-20px)', animationDelay: '1s' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold">A</div>
                                <div>
                                    <div className="font-medium text-sm">Product Manager</div>
                                    <div className="text-xs text-gray-400">Amazon • 95% Match</div>
                                </div>
                            </div>
                        </div>

                        {/* AI Processing Indicator */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-card rounded-full px-6 py-3 flex items-center gap-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            </div>
                            <span className="text-sm text-gray-300">AI analyzing 1,847 jobs...</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
