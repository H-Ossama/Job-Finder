'use client';

import { useState } from 'react';
import { 
    Search, 
    Filter, 
    Briefcase, 
    MapPin, 
    DollarSign, 
    Clock, 
    Bookmark, 
    Eye, 
    Zap,
    CheckCircle,
    AlertCircle,
    X,
    Calendar,
    Building,
    ExternalLink
} from 'lucide-react';

// Sample job data - replace with actual API data
const sampleJobs = [
    {
        id: 'google',
        company: 'Google',
        logo: 'https://logo.clearbit.com/google.com',
        title: 'Senior Frontend Engineer',
        location: 'Mountain View, CA (Remote OK)',
        salary: '$180,000 - $240,000 / year',
        matchScore: 98,
        isNew: false,
        postedAt: '2 hours ago',
        description: 'Join our team to build next-generation web experiences. We\'re looking for someone passionate about React, TypeScript, and creating delightful user interfaces...',
        skills: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
        type: 'Full-time',
        experience: '5+ years'
    },
    {
        id: 'meta',
        company: 'Meta',
        logo: 'https://logo.clearbit.com/meta.com',
        title: 'Full Stack Developer',
        location: 'New York, NY (Hybrid)',
        salary: '$160,000 - $210,000 / year',
        matchScore: 95,
        isNew: false,
        postedAt: '4 hours ago',
        description: 'Build products that connect billions of people. Work on challenging problems at scale with cutting-edge technologies...',
        skills: ['React', 'Node.js', 'Python'],
        type: 'Full-time',
        experience: '4+ years'
    },
    {
        id: 'stripe',
        company: 'Stripe',
        logo: 'https://logo.clearbit.com/stripe.com',
        title: 'Software Engineer, Payments',
        location: 'San Francisco, CA (Remote)',
        salary: '$190,000 - $260,000 / year',
        matchScore: 0,
        isNew: true,
        postedAt: 'Just now',
        description: 'Help build the economic infrastructure for the internet. Work on systems that process billions of dollars...',
        skills: ['Ruby', 'Go', 'Distributed Systems'],
        type: 'Full-time',
        experience: '3+ years'
    }
];

const autoAppliedJobs = [
    {
        id: 'spotify',
        company: 'Spotify',
        logo: 'https://logo.clearbit.com/spotify.com',
        title: 'Frontend Developer',
        location: 'Stockholm, Sweden (Remote)',
        salary: '$140,000 - $180,000 / year',
        status: 'auto-applied',
        appliedAt: 'Applied 2 days ago',
        resumeUsed: 'Frontend_Developer_2024',
        aiSummary: 'Used your "Frontend_Developer_2024" resume. Tailored cover letter highlighting React and TypeScript experience.'
    },
    {
        id: 'airbnb',
        company: 'Airbnb',
        logo: 'https://logo.clearbit.com/airbnb.com',
        title: 'Senior UI Engineer',
        location: 'San Francisco, CA',
        salary: '$175,000 - $225,000 / year',
        status: 'interview',
        appliedAt: 'Applied 5 days ago',
        interviewDate: 'March 15, 2024 at 2:00 PM PST',
        interviewType: 'Technical screening with hiring manager'
    },
    {
        id: 'uber',
        company: 'Uber',
        logo: 'https://logo.clearbit.com/uber.com',
        title: 'React Developer',
        location: 'Chicago, IL',
        salary: '$130,000 - $170,000 / year',
        status: 'rejected',
        appliedAt: 'Applied 1 week ago',
        message: 'Position filled. AI will continue matching similar roles for you.'
    }
];

export default function JobsContent({ user, applications }) {
    const [activeTab, setActiveTab] = useState('matches');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [savedJobs, setSavedJobs] = useState([]);

    const tabs = [
        { id: 'matches', label: 'New Matches', count: 12 },
        { id: 'applied', label: 'Applied', count: 24 },
        { id: 'auto-applied', label: 'Auto-Applied', count: 18 },
        { id: 'interviews', label: 'Interviews', count: 3 },
        { id: 'saved', label: 'Saved', count: savedJobs.length },
    ];

    const toggleSave = (jobId) => {
        setSavedJobs(prev => 
            prev.includes(jobId) 
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
        );
    };

    const handleApply = (jobId, buttonElement) => {
        // Simulate application
        console.log('Applying to job:', jobId);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2">Job Matches</h1>
                    <p className="text-gray-400">AI-matched opportunities and your application history</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search jobs..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-indigo-500 w-64"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button className="btn-icon px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 glass-card-static rounded-2xl p-2 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        {tab.label}
                        <span className="ml-1 text-xs opacity-70">({tab.count})</span>
                    </button>
                ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card-static rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-400">12</div>
                    <div className="text-xs text-gray-400 mt-1">New Today</div>
                </div>
                <div className="glass-card-static rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">18</div>
                    <div className="text-xs text-gray-400 mt-1">Auto-Applied</div>
                </div>
                <div className="glass-card-static rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">3</div>
                    <div className="text-xs text-gray-400 mt-1">Interviews</div>
                </div>
                <div className="glass-card-static rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-pink-400">89%</div>
                    <div className="text-xs text-gray-400 mt-1">Avg Match</div>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'matches' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">New AI Matches</h2>
                        <span className="text-sm text-gray-400">Updated 5 mins ago</span>
                    </div>

                    {sampleJobs.map((job) => (
                        <JobCard 
                            key={job.id}
                            job={job}
                            isSaved={savedJobs.includes(job.id)}
                            onSave={() => toggleSave(job.id)}
                            onView={() => setSelectedJob(job)}
                            onApply={handleApply}
                        />
                    ))}
                </div>
            )}

            {activeTab === 'auto-applied' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Auto-Applied Jobs</h2>
                        <div className="flex items-center gap-2 text-sm text-purple-400">
                            <Zap className="w-4 h-4" />
                            AI applied automatically based on your preferences
                        </div>
                    </div>

                    {autoAppliedJobs.map((job) => (
                        <AutoAppliedCard key={job.id} job={job} onView={() => setSelectedJob(job)} />
                    ))}
                </div>
            )}

            {activeTab === 'applied' && (
                <div className="glass-card-static rounded-2xl p-12 text-center">
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-xl font-bold mb-2">24 Manual Applications</h3>
                    <p className="text-gray-400">Jobs you applied to manually appear here</p>
                </div>
            )}

            {activeTab === 'interviews' && (
                <div className="glass-card-static rounded-2xl p-12 text-center">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold mb-2">3 Upcoming Interviews</h3>
                    <p className="text-gray-400">Your scheduled interviews appear here</p>
                </div>
            )}

            {activeTab === 'saved' && (
                <div className="glass-card-static rounded-2xl p-12 text-center">
                    <div className="text-4xl mb-4">⭐</div>
                    <h3 className="text-xl font-bold mb-2">{savedJobs.length} Saved Jobs</h3>
                    <p className="text-gray-400">Jobs you've bookmarked for later</p>
                </div>
            )}

            {/* Job Details Modal */}
            {selectedJob && (
                <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
            )}
        </div>
    );
}

function JobCard({ job, isSaved, onSave, onView, onApply }) {
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    const handleApply = () => {
        setApplying(true);
        setTimeout(() => {
            setApplying(false);
            setApplied(true);
        }, 1500);
    };

    return (
        <div className="glass-card rounded-2xl p-6 cursor-pointer" onClick={onView}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center p-2">
                        <img 
                            src={job.logo} 
                            alt={job.company}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<span class="text-2xl font-bold text-gray-800">${job.company[0]}</span>`;
                            }}
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg hover:text-indigo-300 transition">{job.title}</h3>
                        <div className="text-sm text-gray-400">{job.company} • {job.location}</div>
                        <div className="text-sm text-green-400 mt-1">{job.salary}</div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {job.isNew ? (
                        <span className="status-badge status-new">New</span>
                    ) : (
                        <span className={`status-badge ${job.matchScore >= 90 ? 'status-high' : 'status-med'}`}>
                            {job.matchScore}% Match
                        </span>
                    )}
                    <span className="text-xs text-gray-500">{job.postedAt}</span>
                </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{job.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-white/5 text-xs border border-white/10">
                        {skill}
                    </span>
                ))}
            </div>
            
            <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                <button 
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${
                        applied 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'btn-primary'
                    }`}
                    onClick={handleApply}
                    disabled={applied || applying}
                >
                    {applying ? (
                        <>
                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                            Applying...
                        </>
                    ) : applied ? (
                        '✓ Applied!'
                    ) : (
                        'Quick Apply'
                    )}
                </button>
                <button 
                    className={`btn-icon px-4 rounded-xl ${isSaved ? 'text-yellow-400' : ''}`}
                    onClick={onSave}
                >
                    <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                </button>
                <button className="btn-icon px-4 rounded-xl" onClick={onView}>
                    <Eye className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

function AutoAppliedCard({ job, onView }) {
    const statusConfig = {
        'auto-applied': { border: 'border-l-purple-500', badge: 'status-auto', label: 'Auto-Applied' },
        'interview': { border: 'border-l-pink-500', badge: 'status-interview', label: 'Interview Scheduled' },
        'rejected': { border: 'border-l-gray-500 opacity-75', badge: 'status-rejected', label: 'Not Selected' }
    };

    const config = statusConfig[job.status];

    return (
        <div 
            className={`glass-card rounded-2xl p-6 border-l-4 ${config.border} cursor-pointer`}
            onClick={onView}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center p-2">
                        <img 
                            src={job.logo} 
                            alt={job.company}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<span class="text-2xl font-bold text-gray-800">${job.company[0]}</span>`;
                            }}
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{job.title}</h3>
                        <div className="text-sm text-gray-400">{job.company} • {job.location}</div>
                        <div className="text-sm text-green-400 mt-1">{job.salary}</div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`status-badge ${config.badge}`}>{config.label}</span>
                    <span className="text-xs text-gray-500">{job.appliedAt}</span>
                </div>
            </div>

            {job.status === 'auto-applied' && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">AI Application Summary</span>
                    </div>
                    <p className="text-gray-400 text-sm">{job.aiSummary}</p>
                </div>
            )}

            {job.status === 'interview' && (
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-pink-300 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Interview: {job.interviewDate}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{job.interviewType}</p>
                </div>
            )}

            {job.status === 'rejected' && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">{job.message}</p>
                </div>
            )}

            <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                {job.status === 'interview' ? (
                    <button className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium">
                        Prepare for Interview
                    </button>
                ) : (
                    <button className="btn-icon flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10">
                        View Application
                    </button>
                )}
                <button className="btn-icon px-4 rounded-xl">
                    <Eye className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

function JobModal({ job, onClose }) {
    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-glow modal-glow-1"></div>
                <div className="modal-glow modal-glow-2"></div>
                
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-b from-[#1e1e2f] to-transparent p-6 pb-4 z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-2">
                                {job.logo ? (
                                    <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-2xl font-bold text-gray-800">{job.company?.[0] || 'J'}</span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{job.title}</h2>
                                <p className="text-gray-400">{job.company} • {job.location}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 pt-0 space-y-6 relative z-10">
                    {/* Quick Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card-static rounded-xl p-4">
                            <div className="text-xs text-gray-400 mb-1">Salary</div>
                            <div className="font-semibold text-green-400">{job.salary?.split('/')[0] || '$180k - $240k'}</div>
                        </div>
                        <div className="glass-card-static rounded-xl p-4">
                            <div className="text-xs text-gray-400 mb-1">Type</div>
                            <div className="font-semibold">{job.type || 'Full-time'}</div>
                        </div>
                        <div className="glass-card-static rounded-xl p-4">
                            <div className="text-xs text-gray-400 mb-1">Experience</div>
                            <div className="font-semibold">{job.experience || '5+ years'}</div>
                        </div>
                        <div className="glass-card-static rounded-xl p-4">
                            <div className="text-xs text-gray-400 mb-1">Match Score</div>
                            <div className="font-semibold text-indigo-400">{job.matchScore || 98}%</div>
                        </div>
                    </div>

                    {/* AI Match Analysis */}
                    <div className="glass-card-static rounded-xl p-5 border border-indigo-500/30">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-indigo-400" />
                            </div>
                            <h3 className="font-semibold">AI Match Analysis</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">✓</div>
                                <span className="text-sm text-gray-300">Your React experience matches their requirement (5+ years)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">✓</div>
                                <span className="text-sm text-gray-300">TypeScript proficiency aligns with tech stack</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">✓</div>
                                <span className="text-sm text-gray-300">Previous work at similar scale companies</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs">!</div>
                                <span className="text-sm text-gray-300">Consider highlighting GraphQL experience in cover letter</span>
                            </div>
                        </div>
                    </div>

                    {/* Job Description */}
                    <div>
                        <h3 className="font-semibold mb-3">About the Role</h3>
                        <div className="text-gray-400 text-sm space-y-3">
                            <p>{job.description}</p>
                            <p>In this role, you'll architect and implement complex web applications, mentor junior developers, and drive technical decisions that impact millions of users.</p>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div>
                        <h3 className="font-semibold mb-3">Requirements</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-1">•</span>
                                <span>5+ years of experience with modern JavaScript frameworks (React, Vue, or Angular)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-1">•</span>
                                <span>Strong proficiency in TypeScript</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-1">•</span>
                                <span>Experience with state management solutions (Redux, MobX, Zustand)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-400 mt-1">•</span>
                                <span>Familiarity with testing frameworks (Jest, Cypress, Playwright)</span>
                            </li>
                        </ul>
                    </div>

                    {/* Benefits */}
                    <div>
                        <h3 className="font-semibold mb-3">Benefits</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-400">✓</span> Health, dental & vision
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-400">✓</span> 401(k) matching
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-400">✓</span> Unlimited PTO
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-400">✓</span> Remote work options
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-400">✓</span> Learning budget
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="text-green-400">✓</span> Equity package
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    {job.skills && (
                        <div>
                            <h3 className="font-semibold mb-3">Skills & Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill) => (
                                    <span key={skill} className="px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-sm border border-indigo-500/30">
                                        {skill}
                                    </span>
                                ))}
                                <span className="px-3 py-1.5 rounded-full bg-white/10 text-gray-300 text-sm border border-white/10">Node.js</span>
                                <span className="px-3 py-1.5 rounded-full bg-white/10 text-gray-300 text-sm border border-white/10">AWS</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button className="btn-primary flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5" />
                            Apply with AI-Tailored Resume
                        </button>
                        <button className="btn-icon px-6 rounded-xl">
                            <Bookmark className="w-5 h-5" />
                        </button>
                        <button className="btn-icon px-6 rounded-xl">
                            <ExternalLink className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
