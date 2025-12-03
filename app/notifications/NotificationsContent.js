'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { 
    Menu,
    Check,
    CheckCheck,
    Briefcase,
    Calendar,
    FileCheck,
    AlertTriangle,
    Info,
    Video,
    Bell,
    Settings,
    Trash2,
    MoreHorizontal
} from 'lucide-react';
import styles from './notifications.module.css';

// Sample notifications data
const INITIAL_NOTIFICATIONS = [
    {
        id: 1,
        type: 'job',
        title: 'New job match: Senior Software Engineer at Google',
        description: 'This role matches 98% of your profile. Don\'t miss out!',
        timestamp: '2 min ago',
        unread: true,
        actionUrl: '/jobs/1',
        actionText: 'View Job'
    },
    {
        id: 2,
        type: 'interview',
        title: 'Interview reminder: Stripe - Tomorrow at 2:00 PM',
        description: 'Your technical interview with Stripe is scheduled for tomorrow. Prepare your responses!',
        timestamp: '1 hour ago',
        unread: true,
        actionUrl: '/interview-prep',
        actionText: 'Prepare Now',
        secondaryAction: 'Add to Calendar'
    },
    {
        id: 3,
        type: 'application',
        title: 'Application viewed by Amazon',
        description: 'A recruiter at Amazon has viewed your application for Full Stack Developer.',
        timestamp: '3 hours ago',
        unread: true,
        actionUrl: '/applications',
        actionText: 'View Application'
    },
    {
        id: 4,
        type: 'job',
        title: '5 new jobs matching your profile',
        description: 'We found new opportunities at Netflix, Meta, and more.',
        timestamp: 'Yesterday',
        unread: false,
        actionUrl: '/job-search',
        actionText: 'Browse Jobs'
    },
    {
        id: 5,
        type: 'application',
        title: 'Application submitted successfully',
        description: 'Your application for Backend Engineer at Stripe has been submitted.',
        timestamp: '2 days ago',
        unread: false
    },
    {
        id: 6,
        type: 'system',
        title: 'Profile updated successfully',
        description: 'Your profile changes have been saved.',
        timestamp: '3 days ago',
        unread: false
    },
    {
        id: 7,
        type: 'interview',
        title: 'Interview completed with Netflix',
        description: 'Thank you for completing your interview. You should hear back within 5 business days.',
        timestamp: '1 week ago',
        unread: false
    },
    {
        id: 8,
        type: 'alert',
        title: 'Your Pro subscription expires in 7 days',
        description: 'Renew now to continue enjoying unlimited features.',
        timestamp: '1 week ago',
        unread: false,
        actionUrl: '/billing',
        actionText: 'Renew Subscription'
    },
    {
        id: 9,
        type: 'job',
        title: 'Microsoft is hiring: Product Manager',
        description: 'A new role that matches 91% of your profile has been posted.',
        timestamp: '1 week ago',
        unread: false,
        actionUrl: '/jobs/9',
        actionText: 'View Job'
    },
    {
        id: 10,
        type: 'application',
        title: 'Application status updated',
        description: 'Your application at Apple has moved to the screening phase.',
        timestamp: '2 weeks ago',
        unread: false,
        actionUrl: '/applications',
        actionText: 'View Status'
    }
];

const STORAGE_KEY = 'careerforge_notifications';

// Helper to get notifications from localStorage
const getStoredNotifications = () => {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

// Helper to save notifications to localStorage
const saveNotifications = (notifications) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
        // Ignore storage errors
    }
};

const NOTIFICATION_TYPES = {
    job: { icon: Briefcase, color: 'green' },
    interview: { icon: Video, color: 'purple' },
    application: { icon: FileCheck, color: 'blue' },
    system: { icon: Info, color: 'gray' },
    alert: { icon: AlertTriangle, color: 'red' }
};

const TABS = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'interviews', label: 'Interviews' },
    { id: 'applications', label: 'Applications' }
];

export default function NotificationsContent({ user, profile }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [activeTab, setActiveTab] = useState('all');
    const [menuOpen, setMenuOpen] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
    const userInitial = userName.charAt(0).toUpperCase();

    // Load notifications from localStorage on mount with loading effect
    useEffect(() => {
        const loadNotifications = async () => {
            setIsLoading(true);
            // Simulate loading delay for smooth UX
            await new Promise(resolve => setTimeout(resolve, 500));
            const stored = getStoredNotifications();
            if (stored) {
                setNotifications(stored);
            }
            setIsLoaded(true);
            setIsLoading(false);
        };
        loadNotifications();
    }, []);

    // Save notifications to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            saveNotifications(notifications);
        }
    }, [notifications, isLoaded]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, unread: false } : n
        ));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setMenuOpen(null);
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return n.unread;
        if (activeTab === 'jobs') return n.type === 'job';
        if (activeTab === 'interviews') return n.type === 'interview';
        if (activeTab === 'applications') return n.type === 'application';
        return true;
    });

    const getTabCount = (tabId) => {
        if (tabId === 'all') return notifications.length;
        if (tabId === 'unread') return unreadCount;
        if (tabId === 'jobs') return notifications.filter(n => n.type === 'job').length;
        if (tabId === 'interviews') return notifications.filter(n => n.type === 'interview').length;
        if (tabId === 'applications') return notifications.filter(n => n.type === 'application').length;
        return 0;
    };

    return (
        <div className={styles.dashboardWrapper}>
            <DashboardSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            {/* Custom Header with Mark All as Read */}
            <header className={styles.customHeader}>
                <div className={styles.headerLeft}>
                    <button 
                        className={styles.mobileMenuBtn}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <h1 className={styles.headerTitle}>Notifications</h1>
                    {unreadCount > 0 && (
                        <span className={styles.unreadBadge}>{unreadCount}</span>
                    )}
                </div>
                <div className={styles.headerRight}>
                    {unreadCount > 0 && (
                        <button 
                            className={styles.markAllBtn}
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                    <Link href="/settings" className={styles.settingsBtn}>
                        <Settings className="w-4 h-4" />
                    </Link>
                    {userAvatar ? (
                        <img 
                            src={userAvatar} 
                            alt={userName}
                            className={styles.userAvatar}
                        />
                    ) : (
                        <div className={styles.userAvatarPlaceholder}>
                            {userInitial}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    {/* Page Header */}
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>
                            <span className="text-gradient">Notifications</span>
                        </h1>
                        <p className={styles.pageSubtitle}>
                            Stay updated on your job search activity
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className={styles.tabs}>
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                                {tab.id === 'unread' && unreadCount > 0 && (
                                    <span className={styles.tabBadge}>{unreadCount}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Notifications List */}
                    <div className={styles.notificationsList}>
                        {isLoading ? (
                            <div className={styles.loadingState}>
                                <div className={styles.loadingSpinner}></div>
                                <p>Loading notifications...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Bell className="w-12 h-12" />
                                <h3>No notifications</h3>
                                <p>
                                    {activeTab === 'unread' 
                                        ? 'You\'re all caught up! No unread notifications.' 
                                        : 'No notifications in this category yet.'}
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map(notification => {
                                const typeConfig = NOTIFICATION_TYPES[notification.type];
                                const IconComponent = typeConfig.icon;
                                
                                return (
                                    <div 
                                        key={notification.id}
                                        className={`${styles.notificationItem} ${notification.unread ? styles.unread : ''}`}
                                    >
                                        {notification.unread && (
                                            <div className={styles.unreadDot} />
                                        )}
                                        
                                        <div className={`${styles.notificationIcon} ${styles[typeConfig.color]}`}>
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                        
                                        <div className={styles.notificationContent}>
                                            <div className={styles.notificationHeader}>
                                                <div>
                                                    <h3 className={styles.notificationTitle}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className={styles.notificationDesc}>
                                                        {notification.description}
                                                    </p>
                                                </div>
                                                <div className={styles.notificationMeta}>
                                                    <span className={styles.timestamp}>
                                                        {notification.timestamp}
                                                    </span>
                                                    <div className={styles.moreMenu}>
                                                        <button 
                                                            className={styles.moreBtn}
                                                            onClick={() => setMenuOpen(menuOpen === notification.id ? null : notification.id)}
                                                        >
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                        {menuOpen === notification.id && (
                                                            <div className={styles.dropdownMenu}>
                                                                {notification.unread && (
                                                                    <button onClick={() => { markAsRead(notification.id); setMenuOpen(null); }}>
                                                                        <Check className="w-4 h-4" />
                                                                        Mark as read
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    className={styles.danger}
                                                                    onClick={() => deleteNotification(notification.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {(notification.actionUrl || notification.secondaryAction) && (
                                                <div className={styles.notificationActions}>
                                                    {notification.actionUrl && (
                                                        <Link 
                                                            href={notification.actionUrl}
                                                            className={styles.actionLink}
                                                        >
                                                            {notification.actionText}
                                                        </Link>
                                                    )}
                                                    {notification.secondaryAction && (
                                                        <button className={styles.secondaryAction}>
                                                            {notification.secondaryAction}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Load More */}
                    {filteredNotifications.length > 0 && (
                        <div className={styles.loadMore}>
                            <button className={styles.loadMoreBtn}>
                                Load More Notifications
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
