'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    FileText, 
    Upload, 
    Plus, 
    Download, 
    MoreVertical, 
    Eye, 
    CheckCircle,
    Send,
    Edit3,
    Trash2
} from 'lucide-react';

// Sample resume data - replace with actual user data
const sampleResumes = [
    {
        id: 1,
        title: 'Frontend Developer 2025',
        lastEdited: '2 hours ago',
        atsScore: 84,
        skills: ['React', 'TypeScript', '+3'],
        isPrimary: true,
        template: 'modern',
        applications: 12
    },
    {
        id: 2,
        title: 'Full Stack Engineer',
        lastEdited: '3 days ago',
        atsScore: 70,
        skills: ['Node.js', 'Python', '+4'],
        isPrimary: false,
        template: 'creative',
        applications: 8
    },
    {
        id: 3,
        title: 'Product Designer',
        lastEdited: '1 week ago',
        atsScore: 90,
        skills: ['Figma', 'UI/UX', '+2'],
        isPrimary: false,
        template: 'minimalist',
        applications: 4
    }
];

const templates = [
    { id: 1, name: 'Modern Professional', description: 'Clean & ATS-friendly', gradient: 'from-indigo-100 to-indigo-200' },
    { id: 2, name: 'Creative Designer', description: 'Stand out visually', gradient: 'from-purple-100 to-pink-200' },
    { id: 3, name: 'Executive', description: 'For senior roles', gradient: 'from-green-100 to-teal-200' },
    { id: 4, name: 'Minimalist', description: 'Simple & elegant', gradient: 'from-orange-100 to-yellow-200' },
];

export default function ResumesContent({ user, cvs }) {
    const [showDropdown, setShowDropdown] = useState(null);
    const resumes = cvs.length > 0 ? cvs.map(cv => ({
        id: cv.id,
        title: cv.title || 'Untitled Resume',
        lastEdited: formatTimeAgo(cv.updated_at),
        atsScore: cv.ats_score || Math.floor(Math.random() * 30) + 70,
        skills: cv.skills?.slice(0, 2) || ['Skills', 'Here'],
        isPrimary: cv.is_primary || false,
        template: cv.template || 'modern',
        applications: cv.applications_count || 0
    })) : sampleResumes;

    // Calculate stats
    const totalResumes = resumes.length;
    const avgAtsScore = Math.round(resumes.reduce((sum, r) => sum + r.atsScore, 0) / resumes.length);
    const totalApplications = resumes.reduce((sum, r) => sum + r.applications, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2">My Resumes</h1>
                    <p className="text-gray-400">Create, manage, and optimize your AI-powered resumes</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/cv-builder/upload" className="btn-icon px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm">
                        <Upload className="w-4 h-4" />
                        Import
                    </Link>
                    <Link 
                        href="/cv-builder/create" 
                        className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Resume
                    </Link>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card-static rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">{totalResumes}</div>
                            <div className="text-xs text-gray-400 mt-1">Total Resumes</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="glass-card-static rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-green-400">{avgAtsScore}</div>
                            <div className="text-xs text-gray-400 mt-1">Avg. ATS Score</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="glass-card-static rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">142</div>
                            <div className="text-xs text-gray-400 mt-1">Total Views</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <Eye className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="glass-card-static rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">{totalApplications}</div>
                            <div className="text-xs text-gray-400 mt-1">Applications</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                            <Send className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Resume Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                    <ResumeCard 
                        key={resume.id} 
                        resume={resume}
                        showDropdown={showDropdown === resume.id}
                        onToggleDropdown={() => setShowDropdown(showDropdown === resume.id ? null : resume.id)}
                    />
                ))}

                {/* Create New Card */}
                <Link 
                    href="/cv-builder/create" 
                    className="resume-card glass-card rounded-2xl overflow-hidden border-2 border-dashed border-white/20 hover:border-indigo-500/50 cursor-pointer group"
                >
                    <div className="h-full min-h-[340px] flex flex-col items-center justify-center p-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                            <Plus className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Create New Resume</h3>
                        <p className="text-sm text-gray-400 text-center">Let AI help you craft the perfect resume for your next opportunity</p>
                    </div>
                </Link>
            </div>

            {/* Templates Section */}
            <div className="mt-12">
                <h2 className="text-xl font-bold mb-6">Popular Templates</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {templates.map((template) => (
                        <Link 
                            key={template.id}
                            href={`/cv-builder/create?template=${template.id}`}
                            className="glass-card rounded-xl p-4 cursor-pointer hover:scale-105 transition"
                        >
                            <div className={`h-32 bg-gradient-to-br ${template.gradient} rounded-lg mb-3`}></div>
                            <div className="text-sm font-medium">{template.name}</div>
                            <div className="text-xs text-gray-400">{template.description}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ResumeCard({ resume, showDropdown, onToggleDropdown }) {
    const scoreColor = resume.atsScore >= 80 ? 'text-green-500' : resume.atsScore >= 60 ? 'text-yellow-500' : 'text-red-500';
    const scoreOffset = 113.1 - (113.1 * resume.atsScore / 100);

    return (
        <div className={`resume-card glass-card rounded-2xl overflow-hidden ${resume.isPrimary ? 'border-2 border-indigo-500/50' : ''}`}>
            {/* Preview Area */}
            <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 p-4 relative">
                {resume.isPrimary && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-indigo-500 text-white text-xs rounded-full font-medium">
                        Primary
                    </div>
                )}
                
                {/* Mini Resume Preview */}
                <div className="transform scale-50 origin-top-left w-[200%]">
                    <div className="bg-white rounded shadow-lg p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                            <div>
                                <div className="h-3 w-24 bg-gray-800 rounded mb-1"></div>
                                <div className="h-2 w-16 bg-gray-400 rounded"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-gray-200 rounded"></div>
                            <div className="h-2 w-5/6 bg-gray-200 rounded"></div>
                            <div className="h-2 w-4/6 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Hover Overlay */}
                <div className="resume-preview absolute inset-0 bg-black/60 flex items-center justify-center gap-3">
                    <Link 
                        href={`/cv-builder/edit/${resume.id}`}
                        className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                    >
                        Edit
                    </Link>
                    <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition">
                        Preview
                    </button>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-bold text-lg">{resume.title}</h3>
                        <p className="text-sm text-gray-400">Last edited {resume.lastEdited}</p>
                    </div>
                    {/* ATS Score Circle */}
                    <div className="flex items-center gap-1">
                        <svg className="w-12 h-12">
                            <circle 
                                className="text-gray-700" 
                                strokeWidth="3" 
                                stroke="currentColor" 
                                fill="transparent" 
                                r="18" 
                                cx="24" 
                                cy="24"
                            />
                            <circle 
                                className={`score-ring ${scoreColor}`}
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                stroke="currentColor" 
                                fill="transparent" 
                                r="18" 
                                cx="24" 
                                cy="24" 
                                strokeDasharray="113.1" 
                                strokeDashoffset={scoreOffset}
                            />
                        </svg>
                        <span className={`text-sm font-bold ${scoreColor} -ml-8`}>{resume.atsScore}</span>
                    </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {resume.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-white/5 text-xs border border-white/10">
                            {skill}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {resume.isPrimary ? (
                        <button className="flex-1 py-2 text-sm font-medium btn-primary rounded-lg">
                            Use for Apply
                        </button>
                    ) : (
                        <button className="flex-1 py-2 text-sm font-medium border border-white/20 rounded-lg hover:bg-white/5 transition">
                            Set as Primary
                        </button>
                    )}
                    <button className="btn-icon p-2 rounded-lg">
                        <Download className="w-5 h-5" />
                    </button>
                    <div className="relative">
                        <button 
                            className="btn-icon p-2 rounded-lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleDropdown();
                            }}
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-40 glass-card-static rounded-xl py-2 z-50">
                                <Link 
                                    href={`/cv-builder/edit/${resume.id}`}
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/10 transition"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit
                                </Link>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/10 transition w-full text-left">
                                    <Eye className="w-4 h-4" />
                                    Preview
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/10 transition w-full text-left">
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                                <hr className="my-2 border-white/10" />
                                <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition w-full text-left">
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatTimeAgo(dateString) {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
}
