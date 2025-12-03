'use client';

export default function CTA({ onOpenSignup }) {
    return (
        <section className="py-24 relative">
            <div className="max-w-4xl mx-auto px-6 text-center scroll-reveal">
                <div className="glass-card rounded-3xl p-12 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-pink-500/30 to-rose-500/30 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            <span className="font-display text-gradient">Your Dream Job</span><br />
                            <span className="text-white">Is Waiting</span>
                        </h2>
                        <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
                            Stop scrolling job boards. Let AI work for you. Start building your future today—it's free.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={onOpenSignup} className="btn-primary px-10 py-4 rounded-2xl font-semibold text-lg">
                                Create Your Free CV Now
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-6">No credit card required • Setup in under 3 minutes</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
