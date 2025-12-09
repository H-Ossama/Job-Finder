'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Pricing({ onOpenSignup }) {
    const [user, setUser] = useState(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleGetStarted = () => {
        if (user) {
            router.push('/cv-builder');
        } else {
            onOpenSignup();
        }
    };

    const handleStartTrial = () => {
        if (user) {
            router.push('/billing');
        } else {
            onOpenSignup();
        }
    };
    return (
        <section id="pricing" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 scroll-reveal">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        <span className="text-white">Invest in Your Future,</span><br />
                        <span className="font-display text-gradient">Not Expensive Recruiters</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Less than a coffee a day to land your dream career. Cancel anytime.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Free Tier */}
                    <div className="glass-card rounded-3xl p-8 scroll-reveal">
                        <div className="text-gray-400 font-medium mb-2">Starter</div>
                        <div className="text-4xl font-bold mb-4">Free</div>
                        <p className="text-gray-400 text-sm mb-6">Perfect for testing the waters</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-gray-300 text-sm">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                1 AI-generated CV
                            </li>
                            <li className="flex items-center gap-3 text-gray-300 text-sm">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                5 templates
                            </li>
                            <li className="flex items-center gap-3 text-gray-300 text-sm">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                Basic job matches
                            </li>
                        </ul>
                        <button onClick={handleGetStarted} className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 transition font-medium">Get Started</button>
                    </div>

                    {/* Pro Tier */}
                    <div className="relative scroll-reveal" style={{ transitionDelay: '0.1s' }}>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-medium">Most Popular</div>
                        <div className="glass-card rounded-3xl p-8 border border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-transparent">
                            <div className="text-indigo-400 font-medium mb-2">Professional</div>
                            <div className="text-4xl font-bold mb-1">$19<span className="text-lg text-gray-400">/mo</span></div>
                            <p className="text-gray-400 text-sm mb-6">For serious job seekers</p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-gray-300 text-sm">
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    Unlimited AI CVs
                                </li>
                                <li className="flex items-center gap-3 text-gray-300 text-sm">
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    50+ premium templates
                                </li>
                                <li className="flex items-center gap-3 text-gray-300 text-sm">
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    Smart job search (100/day)
                                </li>
                                <li className="flex items-center gap-3 text-gray-300 text-sm">
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    AI cover letter drafts
                                </li>
                                <li className="flex items-center gap-3 text-gray-300 text-sm">
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    Interview prep guides
                                </li>
                            </ul>
                            <button onClick={handleStartTrial} className="btn-primary w-full py-3 rounded-xl font-medium">Start Free Trial</button>
                        </div>
                    </div>

                    {/* Enterprise */}
                    <div className="glass-card rounded-3xl p-8 scroll-reveal" style={{ transitionDelay: '0.2s' }}>
                        <div className="text-gray-400 font-medium mb-2">Enterprise</div>
                        <div className="text-4xl font-bold mb-4">Custom</div>
                        <p className="text-gray-400 text-sm mb-6">For teams & recruiters</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-gray-300 text-sm">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                Everything in Pro
                            </li>
                            <li className="flex items-center gap-3 text-gray-300 text-sm">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                Team management
                            </li>
                            <li className="flex items-center gap-3 text-gray-300 text-sm">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                API access
                            </li>
                            <li className="flex items-center gap-3 text-gray-300 text-sm">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                Dedicated support
                            </li>
                        </ul>
                        <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 transition font-medium">Contact Sales</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
