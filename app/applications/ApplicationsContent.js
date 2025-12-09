'use client';

import { useState, useEffect } from 'react';
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
    Briefcase,
    X,
    Loader2,
    RefreshCw
} from 'lucide-react';
import styles from './applications.module.css';

const statusConfig = {
    saved: { 
        label: 'Saved', 
        color: 'yellow',
        icon: Bookmark,
        bgClass: 'bg-yellow-500/15',
        textClass: 'text-yellow-400',
        borderClass: 'border-yellow-500/30'
    },
    applied: { 
        label: 'Applied', 
        color: 'blue',
        icon: Send,
        bgClass: 'bg-blue-500/15',
        textClass: 'text-blue-400',
        borderClass: 'border-blue-500/30'
    },
    screening: { 
        label: 'Screening', 
        color: 'cyan',
        icon: Eye,
        bgClass: 'bg-cyan-500/15',
        textClass: 'text-cyan-400',
        borderClass: 'border-cyan-500/30'
    },
    interviewing: { 
        label: 'Interviewing', 
        color: 'purple',
        icon: Users,
        bgClass: 'bg-purple-500/15',
        textClass: 'text-purple-400',
        borderClass: 'border-purple-500/30'
    },
    offer: { 
        label: 'Offer', 
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
    withdrawn: { 
        label: 'Withdrawn', 
        color: 'gray',
        icon: XCircle,
        bgClass: 'bg-gray-500/15',
        textClass: 'text-gray-400',
        borderClass: 'border-gray-500/30'
    }
};

export default function ApplicationsContent({ user, applications: initialApplications, cvs }) {
    const [applications, setApplications] = useState(initialApplications || []);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCard, setExpandedCard] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Calculate stats
    const stats = {
        total: applications.length,
        saved: applications.filter(a => a.status === 'saved').length,
        applied: applications.filter(a => a.status === 'applied').length,
        screening: applications.filter(a => a.status === 'screening').length,
        interviewing: applications.filter(a => a.status === 'interviewing').length,
        offer: applications.filter(a => a.status === 'offer').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        withdrawn: applications.filter(a => a.status === 'withdrawn').length,
    };

    // Filter applications
    const filteredApplications = applications.filter(app => {
        const matchesFilter = activeFilter === 'all' || app.status === activeFilter;
        const matchesSearch = 
            (app.company?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (app.title?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const filters = [
        { id: 'all', label: 'All', count: stats.total },
        { id: 'saved', label: 'Saved', count: stats.saved },
        { id: 'applied', label: 'Applied', count: stats.applied },
        { id: 'interviewing', label: 'Interviewing', count: stats.interviewing },
        { id: 'offer', label: 'Offers', count: stats.offer },
        { id: 'rejected', label: 'Rejected', count: stats.rejected },
    ];

    // Refresh applications from API
    const refreshApplications = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/applications');
            if (!response.ok) throw new Error('Failed to fetch applications');
            const data = await response.json();
            setApplications(data.applications || []);
        } catch (err) {
            setError(err.message);
            console.error('Error refreshing applications:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Add new application
    const handleAddApplication = async (applicationData) => {
        try {
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicationData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add application');
            }
            
            await refreshApplications();
            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding application:', err);
            throw err;
        }
    };

    // Update application status
    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await fetch('/api/applications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            
            if (!response.ok) throw new Error('Failed to update application');
            
            // Update local state
            setApplications(prev => prev.map(app => 
                app.id === id ? { ...app, status: newStatus } : app
            ));
        } catch (err) {
            console.error('Error updating application:', err);
        }
    };

    // Delete application
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this application?')) return;
        
        try {
            const response = await fetch(`/api/applications?id=${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete application');
            
            setApplications(prev => prev.filter(app => app.id !== id));
            if (expandedCard === id) setExpandedCard(null);
        } catch (err) {
            console.error('Error deleting application:', err);
        }
    };

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
                <div className="flex gap-2">
                    <button 
                        onClick={refreshApplications}
                        disabled={isLoading}
                        className="btn-icon px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 border border-white/10"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 w-fit"
                    >
                        <Plus className="w-4 h-4" />
                        Add Application
                    </button>
                </div>
            </header>

            {/* Info Card */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-indigo-300 mb-1">Track Your Applications</h3>
                    <p className="text-sm text-gray-400">
                        Keep all your job applications in one place. Monitor their status from applied to offered, update interview schedules, and track your progress. Click <span className="text-indigo-400 font-medium">"Add Application"</span> to start tracking your first application.
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className={styles.statCard}>
                    <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
                    <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className={styles.statCard}>
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.saved}</div>
                    <div className="text-xs text-gray-400">Saved</div>
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
                    <div className="text-2xl font-bold text-green-400 mb-1">{stats.offer}</div>
                    <div className="text-xs text-gray-400">Offers</div>
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

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                    {error}
                </div>
            )}

            {/* Applications List */}
            <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                    <div className="glass-card-static rounded-2xl p-12 text-center">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-xl font-bold mb-2">No applications yet</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            {searchQuery 
                                ? 'Try a different search term' 
                                : 'Start building your application history. Track every job you apply to, monitor your progress through the interview process, and manage your offers all in one place.'}
                        </p>
                        {!searchQuery && (
                            <button 
                                onClick={() => setShowAddModal(true)}
                                className="btn-primary px-6 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Your First Application
                            </button>
                        )}
                    </div>
                ) : (
                    filteredApplications.map((application) => (
                        <ApplicationCard 
                            key={application.id} 
                            application={application}
                            isExpanded={expandedCard === application.id}
                            onToggle={() => setExpandedCard(expandedCard === application.id ? null : application.id)}
                            onUpdateStatus={handleUpdateStatus}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            {/* Add Application Modal */}
            {showAddModal && (
                <AddApplicationModal 
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddApplication}
                    cvs={cvs}
                />
            )}
        </div>
    );
}

function ApplicationCard({ application, isExpanded, onToggle, onUpdateStatus, onDelete }) {
    const config = statusConfig[application.status] || statusConfig.applied;
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
                            e.target.parentElement.innerHTML = `<span class="text-xl font-bold text-gray-800">${(application.company || 'C')[0]}</span>`;
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
                        {application.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {application.location}
                            </span>
                        )}
                        {application.salary && application.salary !== 'Not specified' && (
                            <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {application.salary}
                            </span>
                        )}
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
                    {/* Status Update Buttons */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Update Status:</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(statusConfig).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateStatus(application.id, key);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                        application.status === key 
                                            ? `${value.bgClass} ${value.textClass} ${value.borderClass} border`
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    {value.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Next Step */}
                    {application.nextStep && (
                        <div className={`${styles.offerCard} bg-purple-500/10 border-purple-500/30 mb-4`}>
                            <h4 className="font-semibold text-purple-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Next Step: {application.nextStep}
                            </h4>
                        </div>
                    )}

                    {/* Offer Details */}
                    {application.status === 'offer' && application.offerDetails && (
                        <div className={`${styles.offerCard} bg-green-500/10 border-green-500/30 mb-4`}>
                            <h4 className="font-semibold mb-3 text-green-400 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Offer Details
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                {application.offerDetails.salary && (
                                    <div>
                                        <span className="text-gray-400 block">Base Salary</span>
                                        <span className="font-semibold text-green-300">{application.offerDetails.salary}</span>
                                    </div>
                                )}
                                {application.offerDetails.bonus && (
                                    <div>
                                        <span className="text-gray-400 block">Signing Bonus</span>
                                        <span className="font-semibold">{application.offerDetails.bonus}</span>
                                    </div>
                                )}
                                {application.offerDetails.equity && (
                                    <div>
                                        <span className="text-gray-400 block">Equity</span>
                                        <span className="font-semibold">{application.offerDetails.equity}</span>
                                    </div>
                                )}
                                {application.offerDetails.deadline && (
                                    <div>
                                        <span className="text-gray-400 block">Decision Deadline</span>
                                        <span className="font-semibold text-yellow-400">{application.offerDetails.deadline}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {application.status === 'rejected' && application.rejectionReason && (
                        <div className={`${styles.offerCard} bg-red-500/10 border-red-500/30 mb-4`}>
                            <h4 className="font-semibold text-red-400 flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                Rejection Reason
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">{application.rejectionReason}</p>
                        </div>
                    )}

                    {/* Notes */}
                    {application.notes && (
                        <div className="mb-4 p-3 bg-white/5 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-400 mb-1">Notes:</h4>
                            <p className="text-sm">{application.notes}</p>
                        </div>
                    )}

                    {/* Application Details */}
                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                        {application.resumeUsed && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <FileText className="w-4 h-4" />
                                Resume: <span className="text-white">{application.resumeUsed}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-400">
                            <Briefcase className="w-4 h-4" />
                            Source: <span className="text-white">{application.source}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <FileText className="w-4 h-4" />
                            Cover Letter: 
                            <span className={application.coverLetter ? 'text-green-400' : 'text-gray-500'}>
                                {application.coverLetter ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                        {application.jobUrl && (
                            <a 
                                href={application.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-icon flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10 flex items-center justify-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View Job Posting
                            </a>
                        )}
                        {application.status === 'interviewing' && (
                            <a 
                                href="/interview-prep"
                                className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                            >
                                Prepare for Interview
                            </a>
                        )}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(application.id);
                            }}
                            className="btn-icon px-4 rounded-xl text-red-400 hover:bg-red-500/10" 
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function AddApplicationModal({ onClose, onSubmit, cvs }) {
    const [formData, setFormData] = useState({
        job_title: '',
        company_name: '',
        location: '',
        salary: '',
        job_url: '',
        cv_id: '',
        status: 'applied',
        notes: '',
        source: 'Manual'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold">Add Application</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Job Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.job_title}
                            onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-theme"
                            placeholder="e.g., Senior Frontend Developer"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Company <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.company_name}
                            onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-theme"
                            placeholder="e.g., Google"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-theme"
                                placeholder="e.g., Remote, NYC"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Salary</label>
                            <input
                                type="text"
                                value={formData.salary}
                                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-theme"
                                placeholder="e.g., $120k - $150k"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Job URL</label>
                        <input
                            type="url"
                            value={formData.job_url}
                            onChange={(e) => setFormData({...formData, job_url: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-theme"
                            placeholder="https://..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-theme"
                            >
                                <option value="saved">Saved</option>
                                <option value="applied">Applied</option>
                                <option value="screening">Screening</option>
                                <option value="interviewing">Interviewing</option>
                                <option value="offer">Offer</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Source</label>
                            <select
                                value={formData.source}
                                onChange={(e) => setFormData({...formData, source: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-theme"
                            >
                                <option value="Manual">Manual</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Indeed">Indeed</option>
                                <option value="Company Website">Company Website</option>
                                <option value="Referral">Referral</option>
                                <option value="Job Board">Job Board</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    {cvs && cvs.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">CV Used</label>
                            <select
                                value={formData.cv_id}
                                onChange={(e) => setFormData({...formData, cv_id: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-theme"
                            >
                                <option value="">Select a CV</option>
                                {cvs.map(cv => (
                                    <option key={cv.id} value={cv.id}>{cv.title}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-theme resize-none"
                            placeholder="Any additional notes about this application..."
                        />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add Application
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
