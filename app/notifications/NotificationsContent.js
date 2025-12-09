'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { 
    Menu,
    Check,
    CheckCheck,
    Briefcase,
    FileCheck,
    AlertTriangle,
    Info,
    Video,
    Bell,
    Settings,
    Trash2,
    MoreHorizontal,
    RefreshCw
} from 'lucide-react';
import styles from './notifications.module.css';

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
    { id: 'job', label: 'Jobs' },
    { id: 'interview', label: 'Interviews' },
    { id: 'application', label: 'Applications' }
];

// Helper to format timestamp
const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (weeks === 1) return '1 week ago';
    if (weeks < 4) return `${weeks} weeks ago`;
    return date.toLocaleDateString();
};

export default function NotificationsContent({ user, profile }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [menuOpen, setMenuOpen] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
    const userInitial = userName.charAt(0).toUpperCase();

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const params = new URLSearchParams();
            if (activeTab !== 'all' && activeTab !== 'unread') {
                params.set('type', activeTab);
            }
            if (activeTab === 'unread') {
                params.set('unread', 'true');
            }
            
            const response = await fetch(`/api/notifications?${params.toString()}`);
            const data = await response.json();
            
            if (data.success) {
                setNotifications(data.data.notifications.map(n => ({
                    id: n.id,
                    type: n.type,
                    title: n.title,
                    description: n.description,
                    timestamp: formatTimestamp(n.created_at),
                    unread: n.unread,
                    actionUrl: n.action_url,
                    actionText: n.action_text,
                    secondaryAction: n.secondary_action,
                    metadata: n.metadata
                })));
                setUnreadCount(data.data.unreadCount);
            } else {
                setError(data.error || 'Failed to fetch notifications');
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    // Load notifications on mount and when tab changes
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    // Mark single notification as read
    const markAsRead = async (id) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds: [id] })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setNotifications(prev => prev.map(n => 
                    n.id === id ? { ...n, unread: false } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    // Delete notification
    const deleteNotification = async (id) => {
        try {
            const response = await fetch(`/api/notifications?id=${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                const notification = notifications.find(n => n.id === id);
                if (notification?.unread) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
                setNotifications(prev => prev.filter(n => n.id !== id));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
        setMenuOpen(null);
    };

    // Filter notifications based on active tab
    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return n.unread;
        return n.type === activeTab;
    });

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
                    <button 
                        className={styles.refreshBtn}
                        onClick={fetchNotifications}
                        disabled={isLoading}
                        title="Refresh notifications"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
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

                    {/* Error State */}
                    {error && (
                        <div className={styles.errorState}>
                            <AlertTriangle className="w-12 h-12" />
                            <h3>Failed to load notifications</h3>
                            <p>{error}</p>
                            <button onClick={fetchNotifications} className={styles.retryBtn}>
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Notifications List */}
                    {!error && (
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
                                    const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system;
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
                                                                {notification.actionText || 'View'}
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
                    )}

                    {/* Load More - only show if we have notifications and not in error state */}
                    {!error && filteredNotifications.length >= 50 && (
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
