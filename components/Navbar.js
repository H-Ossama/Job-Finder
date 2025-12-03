'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar({ onOpenSignin, onOpenSignup }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    const supabase = createClient();
    const router = useRouter();
    const userMenuRef = useRef(null);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isMobileMenuOpen]);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check for authenticated user
    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        getUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setShowUserMenu(false);
        router.refresh();
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-card rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2 logo-link" onClick={scrollToTop}>
                            <div className="w-10 h-10 rounded-xl logo-gradient flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-lg md:text-xl font-bold">CareerForge<span className="text-accent">.ai</span></span>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden lg:flex items-center gap-8">
                            <a href="#features" className="nav-link text-gray-300 hover:text-white transition">Features</a>
                            <a href="#how-it-works" className="nav-link text-gray-300 hover:text-white transition">How It Works</a>
                            <a href="#testimonials" className="nav-link text-gray-300 hover:text-white transition">Success Stories</a>
                            <a href="#pricing" className="nav-link text-gray-300 hover:text-white transition">Pricing</a>
                        </div>

                        {/* Desktop Auth Buttons / User Profile */}
                        <div className="hidden md:flex items-center gap-4">
                            {isLoading ? (
                                <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
                            ) : user ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button 
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-3 hover:opacity-80 transition"
                                    >
                                        {user.user_metadata?.avatar_url ? (
                                            <img 
                                                src={user.user_metadata.avatar_url} 
                                                alt="Profile"
                                                className="w-9 h-9 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full logo-gradient flex items-center justify-center text-sm font-medium">
                                                {user.user_metadata?.full_name 
                                                    ? user.user_metadata.full_name.charAt(0).toUpperCase() 
                                                    : user.email?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-gray-200 font-medium hidden lg:block">
                                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                        </span>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {/* User Dropdown Menu */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl py-2 shadow-xl border border-white/10">
                                            <a href="/dashboard" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition">
                                                Dashboard
                                            </a>
                                            <a href="/cv-builder" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition">
                                                CV Builder
                                            </a>
                                            <hr className="my-2 border-white/10" />
                                            <button 
                                                onClick={handleSignOut}
                                                className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-white/5 transition"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <button onClick={onOpenSignin} className="text-gray-300 hover:text-white transition">Sign In</button>
                                    <button onClick={onOpenSignup} className="btn-primary px-5 py-2.5 rounded-xl font-medium">Get Started Free</button>
                                </>
                            )}
                        </div>

                        {/* Mobile Hamburger Menu */}
                        <div className="lg:hidden flex items-center gap-3">
                            {!isLoading && !user && (
                                <button onClick={onOpenSignup} className="btn-primary px-4 py-2 rounded-lg text-sm font-medium md:hidden">Start Free</button>
                            )}
                            {!isLoading && user && (
                                user.user_metadata?.avatar_url ? (
                                    <img 
                                        src={user.user_metadata.avatar_url} 
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full object-cover md:hidden"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full logo-gradient flex items-center justify-center text-xs font-medium md:hidden">
                                        {user.user_metadata?.full_name 
                                            ? user.user_metadata.full_name.charAt(0).toUpperCase() 
                                            : user.email?.charAt(0).toUpperCase()}
                                    </div>
                                )
                            )}
                            <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                <a href="#features" onClick={closeMobileMenu}>Features</a>
                <a href="#how-it-works" onClick={closeMobileMenu}>How It Works</a>
                <a href="#testimonials" onClick={closeMobileMenu}>Success Stories</a>
                <a href="#pricing" onClick={closeMobileMenu}>Pricing</a>
                {user ? (
                    <>
                        <a href="/dashboard" onClick={closeMobileMenu}>Dashboard</a>
                        <a href="/cv-builder" onClick={closeMobileMenu}>CV Builder</a>
                        <button 
                            className="text-red-400 hover:text-red-300 transition mt-4" 
                            onClick={() => { closeMobileMenu(); handleSignOut(); }}
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <>
                        <a href="#" onClick={() => { closeMobileMenu(); onOpenSignin(); }}>Sign In</a>
                        <button className="btn-primary px-8 py-3 rounded-xl font-medium mt-4" onClick={() => { closeMobileMenu(); onOpenSignup(); }}>Get Started Free</button>
                    </>
                )}
            </div>
        </>
    );
}
