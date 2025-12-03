'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    Home, 
    FileText, 
    Briefcase, 
    ClipboardCheck, 
    Lightbulb, 
    Search, 
    Calendar, 
    BarChart3, 
    User, 
    Settings,
    Sparkles,
    Zap
} from 'lucide-react';

const mainLinks = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/resumes', icon: FileText, label: 'My CVs', badge: '3', badgeColor: 'indigo' },
    { href: '/jobs', icon: Briefcase, label: 'Job Matches', badge: '12', badgeColor: 'green' },
    { href: '/applications', icon: ClipboardCheck, label: 'Applications' },
];

const toolLinks = [
    { href: '/cv-builder/create', icon: Lightbulb, label: 'AI CV Builder' },
    { href: '/job-search', icon: Search, label: 'Job Search' },
    { href: '/interview-prep', icon: Calendar, label: 'Interview Prep' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const settingsLinks = [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardSidebar({ isOpen, onClose }) {
    const pathname = usePathname();

    const isActive = (href) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isOpen ? 'active' : ''}`}>
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl logo-gradient flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-lg font-bold">
                            CareerForge<span className="text-accent">.ai</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="py-4 flex-1">
                    <div className="sidebar-section">Main</div>
                    
                    {mainLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <link.icon className="w-5 h-5 sidebar-icon" />
                            {link.label}
                            {link.badge && (
                                <span className={`ml-auto bg-${link.badgeColor}-500/20 text-${link.badgeColor}-300 text-xs px-2 py-0.5 rounded-full`}>
                                    {link.badge}
                                </span>
                            )}
                        </Link>
                    ))}

                    <div className="sidebar-section mt-6">Tools</div>
                    
                    {toolLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <link.icon className="w-5 h-5 sidebar-icon" />
                            {link.label}
                        </Link>
                    ))}

                    <div className="sidebar-section mt-6">Settings</div>
                    
                    {settingsLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <link.icon className="w-5 h-5 sidebar-icon" />
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Upgrade Card */}
                <div className="p-4">
                    <div className="glass-card-static rounded-2xl p-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold mb-1">Upgrade to Pro</h4>
                        <p className="text-xs text-gray-400 mb-4">Get unlimited CVs & auto-apply features</p>
                        <button className="btn-primary w-full py-2.5 rounded-xl text-sm font-medium">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
