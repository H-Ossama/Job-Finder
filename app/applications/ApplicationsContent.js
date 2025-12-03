'use client';

import { useState } from 'react';
import { 
    Search, 
    Filter, 
    Plus,
    Building,
    MapPin, 
    DollarSign, 
    Calendar,
    Clock,
    ExternalLink,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    AlertCircle,
    Bookmark,
    Send,
    Users,
    FileText,
    Eye,
    Edit,
    Trash2,
    ChevronDown,
    ChevronRight,
    Briefcase
} from 'lucide-react';
import styles from './applications.module.css';

// Sample application data - replace with actual data from props
const sampleApplications = [
    {
        id: 1,
        company: 'Google',
        logo: 'https://logo.clearbit.com/google.com',
        title: 'Senior Frontend Engineer',
        location: 'Mountain View, CA',
        salary: '$180,000 - $240,000',
        status: 'interviewing',
        appliedDate: '2025-11-28',
        lastUpdate: '2 days ago',
        resumeUsed: 'Frontend_Developer_2025',
        coverLetter: true,
        source: 'LinkedIn',
        nextStep: 'Technical Interview - Dec 5, 2025',
        timeline: [
            { date: 'Nov 28', event: 'Applied', status: 'completed' },
            { date: 'Nov 30', event: 'Resume Reviewed', status: 'completed' },
            { date: 'Dec 2', event: 'Phone Screen', status: 'completed' },
            { date: 'Dec 5', event: 'Technical Interview', status: 'upcoming' },
            { date: 'TBD', event: 'Final Round', status: 'pending' },
        ]
    },
    {
        id: 2,
        company: 'Stripe',
        logo: 'https://logo.clearbit.com/stripe.com',
        title: 'Software Engineer, Payments',
        location: 'San Francisco, CA',
        salary: '$190,000 - $260,000',
        status: 'offered',
        appliedDate: '2025-11-15',
        lastUpdate: '1 day ago',
        resumeUsed: 'Full_Stack_Developer',
        coverLetter: true,
        source: 'Company Website',
        offerDetails: {
            salary: '$220,000',
            bonus: '$25,000 signing',
            equity: '50,000 options',
            deadline: 'Dec 10, 2025'
        },
        timeline: [
            { date: 'Nov 15', event: 'Applied', status: 'completed' },
            { date: 'Nov 17', event: 'Resume Reviewed', status: 'completed' },
            { date: 'Nov 20', event: 'Phone Screen', status: 'completed' },
            { date: 'Nov 25', event: 'Technical Interview', status: 'completed' },
            { date: 'Nov 28', event: 'Final Round', status: 'completed' },
            { date: 'Dec 1', event: 'Offer Received', status: 'current' },
        ]
    },
    {
        id: 3,
        company: 'Meta',
        logo: 'https://logo.clearbit.com/meta.com',
        title: 'Full Stack Developer',
        location: 'New York, NY',
        salary: '$160,000 - $210,000',
        status: 'applied',
        appliedDate: '2025-12-01',
        lastUpdate: 'Today',
        resumeUsed: 'Full_Stack_Developer',
        coverLetter: false,
        source: 'Auto-Applied',
        timeline: [
            { date: 'Dec 1', event: 'Applied', status: 'current' },
            { date: 'Pending', event: 'Resume Review', status: 'pending' },
        ]
    },
    {
        id: 4,
        company: 'Netflix',
        logo: 'https://logo.clearbit.com/netflix.com',
        title: 'UI Engineer',
        location: 'Los Gatos, CA',
        salary: '$200,000 - $280,000',
        status: 'saved',
        appliedDate: null,
        lastUpdate: '3 days ago',
        deadline: 'Dec 15, 2025',
        matchScore: 94,
    },
    {
        id: 5,
        company: 'Amazon',
        logo: 'https://logo.clearbit.com/amazon.com',
        title: 'Frontend Developer',
        location: 'Seattle, WA',
        salary: '$150,000 - $200,000',
        status: 'rejected',
        appliedDate: '2025-11-10',
        lastUpdate: '1 week ago',
        resumeUsed: 'Frontend_Developer_2025',
        coverLetter: true,
        source: 'Referral',
        rejectionReason: 'Position filled internally',
        timeline: [
            { date: 'Nov 10', event: 'Applied', status: 'completed' },
            { date: 'Nov 12', event: 'Resume Reviewed', status: 'completed' },
            { date: 'Nov 20', event: 'Rejected', status: 'rejected' },
        ]
    },
    {
        id: 6,
        company: 'Spotify',
        logo: 'https://logo.clearbit.com/spotify.com',
        title: 'React Developer',
        location: 'Stockholm, Sweden (Remote)',
        salary: '$140,000 - $180,000',
        status: 'applied',
        appliedDate: '2025-11-29',
        lastUpdate: '4 days ago',
        resumeUsed: 'Frontend_Developer_2025',
        coverLetter: true,
        source: 'Auto-Applied',
        timeline: [
            { date: 'Nov 29', event: 'Applied', status: 'completed' },
            { date: 'Dec 2', event: 'Resume Reviewed', status: 'current' },
        ]
    }
];

const statusConfig = {
    applied: { 
        label: 'Applied', 
        color: 'blue',
        icon: Send,
        bgClass: 'bg-blue-500/15',
        textClass: 'text-blue-400',
        borderClass: 'border-blue-500/30'
    },
    interviewing: { 
        label: 'Interviewing', 
        color: 'purple',
        icon: Users,
        bgClass: 'bg-purple-500/15',
        textClass: 'text-purple-400',
        borderClass: 'border-purple-500/30'
    },
    offered: { 
        label: 'Offered', 
        color: 'green',
        icon: CheckCircle,
        bgClass: 'bg-green-500/15',
        textClass: 'text-green-400',
        borderClass: 'border-green-500/30'
    },
    rejected: { 
        label: 'Rejected', 
        color: 'red',
        icon: XCircle,
        bgClass: 'bg-red-500/15',
        textClass: 'text-red-400',
        borderClass: 'border-red-500/30'
    },
    saved: { 
        label: 'Saved', 
        color: 'yellow',
        icon: Bookmark,
        bgClass: 'bg-yellow-500/15',
        textClass: 'text-yellow-400',
        borderClass: 'border-yellow-500/30'
    }
};

export default function ApplicationsContent({ user, applications }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCard, setExpandedCard] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Use sample data for now, merge with actual applications
    const allApplications = sampleApplications;

    // Calculate stats
    const stats = {
        total: allApplications.length,
        applied: allApplications.filter(a => a.status === 'applied').length,
        interviewing: allApplications.filter(a => a.status === 'interviewing').length,
        offered: allApplications.filter(a => a.status === 'offered').length,
        rejected: allApplications.filter(a => a.status === 'rejected').length,
        saved: allApplications.filter(a => a.status === 'saved').length,
    };

    // Filter applications
    const filteredApplications = allApplications.filter(app => {
        const matchesFilter = activeFilter === 'all' || app.status === activeFilter;
        const matchesSearch = app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const filters = [
        { id: 'all', label: 'All', count: stats.total },
        { id: 'applied', label: 'Applied', count: stats.applied },
        { id: 'interviewing', label: 'Interviewing', count: stats.interviewing },
        { id: 'offered', label: 'Offered', count: stats.offered },
        { id: 'saved', label: 'Saved', count: stats.saved },
        { id: 'rejected', label: 'Rejected', count: stats.rejected },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2">
                        <span className="text-gradient">Job Applications</span>
                    </h1>
                    <p className="text-gray-400">Track and manage all your job applications in one place</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 w-fit"
                >
                    <Plus className="w-4 h-4" />
                    Add Application
                </button>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className={styles.statCard}>
                    <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
                    <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className={styles.statCard}>
                    <div className="text-2xl font-bold text-blue-400 mb-1">{stats.applied}</div>
                    <div className="text-xs text-gray-400">Applied</div>
                </div>
                <div className={styles.statCard}>
                    <div className="text-2xl font-bold text-purple-400 mb-1">{stats.interviewing}</div>
                    <div className="text-xs text-gray-400">Interviewing</div>
                </div>
                <div className={styles.statCard}>
                    <div className="text-2xl font-bold text-green-400 mb-1">{stats.offered}</div>
                    <div className="text-xs text-gray-400">Offered</div>
                </div>
                <div className={styles.statCard}>
                    <div className="text-2xl font-bold text-red-400 mb-1">{stats.rejected}</div>
                    <div className="text-xs text-gray-400">Rejected</div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <input 
                        type="text" 
                        placeholder="Search by company or job title..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-primary-theme"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`${styles.filterBtn} ${activeFilter === filter.id ? styles.filterBtnActive : ''}`}
                        >
                            {filter.label}
                            <span className="ml-1 text-xs opacity-70">({filter.count})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                    <div className="glass-card-static rounded-2xl p-12 text-center">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-xl font-bold mb-2">No applications found</h3>
                        <p className="text-gray-400">
                            {searchQuery ? 'Try a different search term' : 'Start tracking your job applications'}
                        </p>
                    </div>
                ) : (
                    filteredApplications.map((application) => (
                        <ApplicationCard 
                            key={application.id} 
                            application={application}
                            isExpanded={expandedCard === application.id}
                            onToggle={() => setExpandedCard(expandedCard === application.id ? null : application.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function ApplicationCard({ application, isExpanded, onToggle }) {
    const config = statusConfig[application.status];
    const StatusIcon = config.icon;

    return (
        <div className={`${styles.applicationCard} ${isExpanded ? styles.applicationCardExpanded : ''}`}>
            {/* Main Content */}
            <div className="flex items-start gap-4 cursor-pointer" onClick={onToggle}>
                {/* Company Logo */}
                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center p-2 flex-shrink-0">
                    <img 
                        src={application.logo} 
                        alt={application.company}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-xl font-bold text-gray-800">${application.company[0]}</span>`;
                        }}
                    />
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-lg hover:text-primary-theme transition truncate">
                                {application.title}
                            </h3>
                            <p className="text-gray-400 text-sm">{application.company}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`${styles.statusBadge} ${config.bgClass} ${config.textClass} ${config.borderClass}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {config.label}
                            </span>
                            {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {application.location}
                        </span>
                        <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {application.salary}
                        </span>
                        {application.appliedDate && (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Applied {new Date(application.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Updated {application.lastUpdate}
                        </span>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className={styles.expandedContent}>
                    {/* Timeline */}
                    {application.timeline && (
                        <div className={styles.timelineSection}>
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-accent" />
                                Application Timeline
                            </h4>
                            <div className={styles.timeline}>
                                {application.timeline.map((item, index) => (
                                    <div key={index} className={styles.timelineItem}>
                                        <div className={`${styles.timelineDot} ${styles[`timelineDot${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]}`}>
                                            {item.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                            {item.status === 'current' && <AlertCircle className="w-3 h-3" />}
                                            {item.status === 'upcoming' && <Calendar className="w-3 h-3" />}
                                            {item.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                        </div>
                                        <div className={styles.timelineContent}>
                                            <span className="font-medium">{item.event}</span>
                                            <span className="text-gray-500 text-sm">{item.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Offer Details */}
                    {application.status === 'offered' && application.offerDetails && (
                        <div className={`${styles.offerCard} bg-green-500/10 border-green-500/30`}>
                            <h4 className="font-semibold mb-3 text-green-400 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Offer Details
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400 block">Base Salary</span>
                                    <span className="font-semibold text-green-300">{application.offerDetails.salary}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Signing Bonus</span>
                                    <span className="font-semibold">{application.offerDetails.bonus}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Equity</span>
                                    <span className="font-semibold">{application.offerDetails.equity}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Decision Deadline</span>
                                    <span className="font-semibold text-yellow-400">{application.offerDetails.deadline}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Next Step */}
                    {application.nextStep && (
                        <div className={`${styles.offerCard} bg-purple-500/10 border-purple-500/30`}>
                            <h4 className="font-semibold text-purple-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Next Step: {application.nextStep}
                            </h4>
                        </div>
                    )}

                    {/* Saved Job - Match Score */}
                    {application.status === 'saved' && (
                        <div className={`${styles.offerCard} bg-yellow-500/10 border-yellow-500/30`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-yellow-400 flex items-center gap-2">
                                        <Bookmark className="w-4 h-4" />
                                        Saved for Later
                                    </h4>
                                    <p className="text-sm text-gray-400 mt-1">Apply before {application.deadline}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-yellow-400">{application.matchScore}%</span>
                                    <span className="text-sm text-gray-400 block">Match Score</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {application.status === 'rejected' && application.rejectionReason && (
                        <div className={`${styles.offerCard} bg-red-500/10 border-red-500/30`}>
                            <h4 className="font-semibold text-red-400 flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                Rejection Reason
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">{application.rejectionReason}</p>
                        </div>
                    )}

                    {/* Application Details */}
                    {application.resumeUsed && (
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                                <FileText className="w-4 h-4" />
                                Resume: <span className="text-white">{application.resumeUsed}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Briefcase className="w-4 h-4" />
                                Source: <span className="text-white">{application.source}</span>
                            </div>
                            {application.coverLetter !== undefined && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <FileText className="w-4 h-4" />
                                    Cover Letter: 
                                    <span className={application.coverLetter ? 'text-green-400' : 'text-gray-500'}>
                                        {application.coverLetter ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                        {application.status === 'saved' ? (
                            <button className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium">
                                Apply Now
                            </button>
                        ) : application.status === 'interviewing' ? (
                            <button className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium">
                                Prepare for Interview
                            </button>
                        ) : application.status === 'offered' ? (
                            <>
                                <button className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium">
                                    Accept Offer
                                </button>
                                <button className="btn-icon flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10">
                                    Negotiate
                                </button>
                            </>
                        ) : (
                            <button className="btn-icon flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10">
                                View Details
                            </button>
                        )}
                        <button className="btn-icon px-4 rounded-xl" title="Edit">
                            <Edit className="w-4 h-4" />
                        </button>
                        <button className="btn-icon px-4 rounded-xl" title="External Link">
                            <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="btn-icon px-4 rounded-xl text-red-400 hover:bg-red-500/10" title="Delete">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
