'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
    Menu, 
    Search, 
    Bell, 
    User, 
    Settings, 
    CreditCard, 
    LogOut,
    ChevronDown
} from 'lucide-react';

export default function DashboardHeader({ user, profile, onMenuClick }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();
    const supabase = createClient();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Close dropdown on escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setDropdownOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || '';
    const userInitial = userName.charAt(0).toUpperCase();
    const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || null;

    return (
        <header className="dashboard-header">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button 
                    className="mobile-menu-btn"
                    onClick={onMenuClick}
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Search */}
                <div className="relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Search jobs, CVs..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button 
                    className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
                    onClick={() => router.push('/notifications')}
                >
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="notification-dot pulse" />
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium">{userName}</div>
                            <div className="text-xs text-gray-400">Pro Member</div>
                        </div>
                        {userAvatar ? (
                            <img 
                                src={userAvatar} 
                                alt={userName}
                                className="w-9 h-9 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-lg logo-gradient flex items-center justify-center text-white font-semibold">
                                {userInitial}
                            </div>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    <div className={`dropdown-menu ${dropdownOpen ? 'active' : ''}`}>
                        <div className="px-4 py-3 border-b border-white/5">
                            <div className="font-medium">{userName}</div>
                            <div className="text-sm text-gray-400">{userEmail}</div>
                        </div>
                        <div className="py-2">
                            <button 
                                className="dropdown-item w-full"
                                onClick={() => { setDropdownOpen(false); router.push('/profile'); }}
                            >
                                <User className="w-4 h-4" />
                                My Profile
                            </button>
                            <button 
                                className="dropdown-item w-full"
                                onClick={() => { setDropdownOpen(false); router.push('/job-search'); }}
                            >
                                <Search className="w-4 h-4" />
                                Job Search
                            </button>
                            <button 
                                className="dropdown-item w-full"
                                onClick={() => { setDropdownOpen(false); router.push('/settings'); }}
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                            <button 
                                className="dropdown-item w-full"
                                onClick={() => { setDropdownOpen(false); router.push('/billing'); }}
                            >
                                <CreditCard className="w-4 h-4" />
                                Billing
                            </button>
                        </div>
                        <div className="dropdown-divider" />
                        <button 
                            className="dropdown-item danger w-full"
                            onClick={handleSignOut}
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
