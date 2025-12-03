'use client';

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 scroll-reveal">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        <span className="text-white">From Zero to Hired in</span><br />
                        <span className="font-display text-gradient">Four Simple Steps</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        We've eliminated the complexity. You focus on being awesome—we handle everything else.
                    </p>
                </div>

                <div className="relative">
                    {/* Connection Line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30"></div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="relative scroll-reveal">
                            <div className="glass-card rounded-3xl p-6 text-center relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                                <h4 className="font-semibold text-lg mb-3">Tell Your Story</h4>
                                <p className="text-gray-400 text-sm">Answer a few questions or paste your LinkedIn. Takes 3 minutes.</p>
                            </div>
                        </div>

                        <div className="relative scroll-reveal" style={{ transitionDelay: '0.1s' }}>
                            <div className="glass-card rounded-3xl p-6 text-center relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                                <h4 className="font-semibold text-lg mb-3">AI Creates Magic</h4>
                                <p className="text-gray-400 text-sm">Watch as AI generates a stunning, optimized CV in seconds.</p>
                            </div>
                        </div>

                        <div className="relative scroll-reveal" style={{ transitionDelay: '0.2s' }}>
                            <div className="glass-card rounded-3xl p-6 text-center relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                                <h4 className="font-semibold text-lg mb-3">Set Your Targets</h4>
                                <p className="text-gray-400 text-sm">Define your dream role, salary range, and preferences.</p>
                            </div>
                        </div>

                        <div className="relative scroll-reveal" style={{ transitionDelay: '0.3s' }}>
                            <div className="glass-card rounded-3xl p-6 text-center relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
                                <h4 className="font-semibold text-lg mb-3">Get Matched</h4>
                                <p className="text-gray-400 text-sm">Receive daily curated job matches. Apply with one click.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
