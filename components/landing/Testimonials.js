'use client';

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 scroll-reveal">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        <span className="font-display text-gradient">Real People,</span>
                        <span className="text-white">Real Careers</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Join thousands who've transformed their job search from months to weeks.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="testimonial-card glass-card rounded-3xl p-8 scroll-reveal">
                        <div className="flex gap-1 text-yellow-400 mb-4">★★★★★</div>
                        <p className="text-gray-300 mb-6 leading-relaxed">"I spent months applying manually with zero callbacks. CareerForge got me 5 interviews in my first week. Landed my dream job at Spotify."</p>
                        <div className="flex items-center gap-4">
                            <img src="https://i.pravatar.cc/60?img=32" className="w-12 h-12 rounded-full" alt="User" />
                            <div>
                                <div className="font-semibold">Sarah Chen</div>
                                <div className="text-sm text-gray-400">Product Designer @ Spotify</div>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card glass-card rounded-3xl p-8 scroll-reveal" style={{ transitionDelay: '0.1s' }}>
                        <div className="flex gap-1 text-yellow-400 mb-4">★★★★★</div>
                        <p className="text-gray-300 mb-6 leading-relaxed">"The AI understood my experience better than I could describe it myself. My new CV got me a 40% salary increase."</p>
                        <div className="flex items-center gap-4">
                            <img src="https://i.pravatar.cc/60?img=11" className="w-12 h-12 rounded-full" alt="User" />
                            <div>
                                <div className="font-semibold">Marcus Johnson</div>
                                <div className="text-sm text-gray-400">Senior Engineer @ Stripe</div>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card glass-card rounded-3xl p-8 scroll-reveal" style={{ transitionDelay: '0.2s' }}>
                        <div className="flex gap-1 text-yellow-400 mb-4">★★★★★</div>
                        <p className="text-gray-300 mb-6 leading-relaxed">"As a career changer, I had no idea how to position myself. The AI found transferable skills I didn't know I had."</p>
                        <div className="flex items-center gap-4">
                            <img src="https://i.pravatar.cc/60?img=23" className="w-12 h-12 rounded-full" alt="User" />
                            <div>
                                <div className="font-semibold">Emily Rodriguez</div>
                                <div className="text-sm text-gray-400">Data Analyst @ Netflix</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
