'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import AuthModal from '@/components/AuthModal';
import ScrollToTop from '@/components/ScrollToTop';

export default function Home() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('signin');

    const openSignin = () => {
        setAuthMode('signin');
        setIsAuthModalOpen(true);
    };

    const openSignup = () => {
        setAuthMode('signup');
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    return (
        <main className="min-h-screen text-white overflow-x-hidden">
            <Navbar onOpenSignin={openSignin} onOpenSignup={openSignup} />

            <Hero onOpenSignup={openSignup} />
            <Stats />
            <Features />
            <HowItWorks />
            <Testimonials />
            <Pricing onOpenSignup={openSignup} />
            <CTA onOpenSignup={openSignup} />
            <Footer />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                initialMode={authMode}
            />
            <ScrollToTop />
        </main>
    );
}
