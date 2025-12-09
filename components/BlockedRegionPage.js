'use client';

import { useState, useEffect } from 'react';

/**
 * Blocked Region Page
 * Shows when a user from a blocked region tries to access the site
 */
export default function BlockedRegionPage() {
    const [watermelons, setWatermelons] = useState([]);
    const [showFlash, setShowFlash] = useState(false);

    // Generate continuous watermelon rain - more intense
    useEffect(() => {
        const generateWatermelons = () => {
            const newWatermelons = Array.from({ length: 40 }, (_, i) => ({
                id: `${Date.now()}-${i}`,
                left: Math.random() * 100,
                delay: Math.random() * 3,
                duration: 3 + Math.random() * 3,
                size: 20 + Math.random() * 30,
            }));
            setWatermelons(newWatermelons);
        };

        generateWatermelons();
        const interval = setInterval(generateWatermelons, 5000);
        return () => clearInterval(interval);
    }, []);

    // Flash effect
    useEffect(() => {
        const flashInterval = setInterval(() => {
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 150);
        }, 4000);
        return () => clearInterval(flashInterval);
    }, []);

    return (
        <div className={`h-screen w-screen fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden transition-all duration-100 ${showFlash ? 'bg-red-900' : ''}`}>
            {/* Aggressive red overlay pulse */}
            <div className="absolute inset-0 bg-red-900/20 animate-pulse pointer-events-none"></div>
            
            {/* Blood red vignette effect */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at center, transparent 0%, rgba(139, 0, 0, 0.4) 100%)'
            }}></div>

            {/* Watermelon rain */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {watermelons.map((w) => (
                    <div
                        key={w.id}
                        className="absolute animate-watermelon-fall-full"
                        style={{
                            left: `${w.left}%`,
                            animationDelay: `${w.delay}s`,
                            animationDuration: `${w.duration}s`,
                            fontSize: `${w.size}px`,
                        }}
                    >
                        🍉
                    </div>
                ))}
            </div>

            {/* Palestine flag stripes on sides - responsive */}
            <div className="absolute left-0 top-0 bottom-0 w-2 sm:w-4 md:w-6 flex flex-col">
                <div className="flex-1 bg-black"></div>
                <div className="flex-1 bg-white"></div>
                <div className="flex-1 bg-green-600"></div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-2 sm:w-4 md:w-6 flex flex-col">
                <div className="flex-1 bg-black"></div>
                <div className="flex-1 bg-white"></div>
                <div className="flex-1 bg-green-600"></div>
            </div>

            {/* Top and bottom flag bars */}
            <div className="absolute top-0 left-0 right-0 h-2 sm:h-3 flex">
                <div className="flex-1 bg-black"></div>
                <div className="flex-1 bg-white"></div>
                <div className="flex-1 bg-green-600"></div>
                <div className="flex-1 bg-red-600"></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-2 sm:h-3 flex">
                <div className="flex-1 bg-red-600"></div>
                <div className="flex-1 bg-green-600"></div>
                <div className="flex-1 bg-white"></div>
                <div className="flex-1 bg-black"></div>
            </div>

            {/* Red triangle accents - hidden on mobile */}
            <div 
                className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 hidden sm:block"
                style={{
                    width: 0,
                    height: 0,
                    borderTop: '80px solid transparent',
                    borderBottom: '80px solid transparent',
                    borderLeft: '50px solid #dc2626',
                }}
            ></div>
            <div 
                className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 hidden sm:block"
                style={{
                    width: 0,
                    height: 0,
                    borderTop: '80px solid transparent',
                    borderBottom: '80px solid transparent',
                    borderRight: '50px solid #dc2626',
                }}
            ></div>

            {/* Main content - fits screen without scrollbar */}
            <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 w-full max-w-3xl h-full flex flex-col justify-center py-6 overflow-hidden">
                
                {/* Palestine flag - responsive size */}
                <div className="flex justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <span className="text-5xl sm:text-6xl md:text-8xl animate-pulse">🇵🇸</span>
                </div>

                {/* Main message - responsive */}
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-3 sm:mb-4 text-transparent bg-clip-text animate-text-shimmer"
                    style={{
                        backgroundImage: 'linear-gradient(90deg, #22c55e, #ffffff, #ef4444, #ffffff, #22c55e)',
                        backgroundSize: '200% auto',
                    }}>
                    FREE PALESTINE
                </h1>

                {/* Hebrew message - compact for mobile */}
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-900/40 border-2 border-red-500 rounded-xl">
                    <p className="text-lg sm:text-2xl md:text-3xl font-bold text-red-400 mb-1" dir="rtl">
                        🚫 האתר הזה חסום באזור שלך 🚫
                    </p>
                    <p className="text-sm sm:text-base text-red-300" dir="rtl">
                        השירות אינו זמין לתושבי ישראל • הכיבוש הוא פשע
                    </p>
                </div>

                {/* Arabic text - responsive */}
                <div className="mb-3 sm:mb-4">
                    <p className="text-2xl sm:text-3xl md:text-4xl mb-2 font-arabic text-white font-bold" dir="rtl">
                        فلسطين حرة 🇵🇸
                    </p>
                    <p className="text-base sm:text-lg md:text-xl text-green-400 font-bold" dir="rtl">
                        من النهر إلى البحر، فلسطين ستتحرر
                    </p>
                </div>

                {/* Access denied box - compact */}
                <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 border-2 border-red-500/50 mb-3 sm:mb-4 shadow-lg shadow-red-500/20">
                    <p className="text-xl sm:text-2xl text-white font-bold mb-2">
                        ⛔ ACCESS DENIED ⛔
                    </p>
                    <p className="text-base sm:text-lg text-gray-200">
                        This service is <span className="text-red-400 font-bold">PERMANENTLY BLOCKED</span> in your region.
                    </p>
                </div>

                {/* Statistics - responsive grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="bg-red-900/30 rounded-lg p-3 sm:p-4 border border-red-500/30">
                        <div className="text-2xl sm:text-3xl font-bold text-red-400">75+</div>
                        <div className="text-xs sm:text-sm text-gray-400">Years</div>
                    </div>
                    <div className="bg-green-900/30 rounded-lg p-3 sm:p-4 border border-green-500/30">
                        <div className="text-2xl sm:text-3xl font-bold text-green-400">🍉</div>
                        <div className="text-xs sm:text-sm text-gray-400">Resistance</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 sm:p-4 border border-white/30">
                        <div className="text-2xl sm:text-3xl font-bold text-white">∞</div>
                        <div className="text-xs sm:text-sm text-gray-400">Spirit</div>
                    </div>
                </div>

                {/* Prayer section - compact */}
                <div className="bg-gradient-to-r from-green-900/40 to-red-900/40 rounded-xl p-4 sm:p-5 border border-white/20 mb-3 sm:mb-4">
                    <p className="text-base sm:text-lg md:text-xl font-arabic text-white mb-2" dir="rtl">
                        اللهم انصر إخواننا في فلسطين
                    </p>
                    <p className="text-base sm:text-lg md:text-xl font-arabic text-white mb-2" dir="rtl">
                        اللهم احفظ أطفال غزة وارحم شهداءهم
                    </p>
                    <p className="text-base sm:text-lg md:text-xl font-arabic text-red-400 font-bold" dir="rtl">
                        اللهم عليك بالصهاينة المحتلين
                    </p>
                </div>

                {/* Watermelon decoration - smaller */}
                <div className="flex justify-center gap-3 sm:gap-4">
                    <span className="text-3xl sm:text-4xl animate-bounce">🍉</span>
                    <span className="text-3xl sm:text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🇵🇸</span>
                    <span className="text-3xl sm:text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🕊️</span>
                    <span className="text-3xl sm:text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🇵🇸</span>
                    <span className="text-3xl sm:text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🍉</span>
                </div>

                {/* Final message */}
                <p className="mt-3 text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-red-400">
                    PALESTINE WILL BE FREE
                </p>
            </div>

            {/* CSS for animations */}
            <style jsx>{`
                @keyframes watermelon-fall-full {
                    0% {
                        transform: translateY(-100px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0.3;
                    }
                }
                .animate-watermelon-fall-full {
                    animation: watermelon-fall-full linear infinite;
                }
                @keyframes text-shimmer {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                .animate-text-shimmer {
                    animation: text-shimmer 3s linear infinite;
                }
            `}</style>
        </div>
    );
}
