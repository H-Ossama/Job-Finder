'use client';

import { useState, useTransition, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
    Trash2,
    Copy,
    Star,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { deleteCV, setPrimaryCV, duplicateCV } from '@/app/cv-builder/actions';
import CVPreview from '@/components/cv/CVPreview';

export default function ResumesContent({ user, cvs }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showDropdown, setShowDropdown] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [reviewingId, setReviewingId] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [cvToDownload, setCvToDownload] = useState(null);
    const hiddenCvRef = useRef(null);
    const [actionError, setActionError] = useState(null);

    // Map CVs to display format
    const resumes = cvs.map(cv => {
        const content = cv.content || {};
        const skills = content.skills || {};
        const allSkills = [
            ...(skills.technical || []),
            ...(skills.soft || [])
        ];
        
        return {
            id: cv.id,
            title: cv.title || 'Untitled Resume',
            lastEdited: formatTimeAgo(cv.created_at),
            createdAt: formatTimeAgo(cv.created_at),
            atsScore: cv.ats_score || 0,
            skills: allSkills.slice(0, 3),
            skillsCount: Math.max(0, allSkills.length - 3),
            isPrimary: cv.is_primary || false,
            template: cv.template || 'modern',
            applications: cv.applications_count || 0,
            personalInfo: content.personalInfo || {},
            rawData: cv
        };
    });

    // Calculate stats from real data
    const totalResumes = resumes.length;
    const avgAtsScore = totalResumes > 0 
        ? Math.round(resumes.reduce((sum, r) => sum + r.atsScore, 0) / totalResumes)
        : 0;
    const totalApplications = resumes.reduce((sum, r) => sum + r.applications, 0);
    const primaryResume = resumes.find(r => r.isPrimary);

    // Handle delete CV
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
            return;
        }
        
        setDeletingId(id);
        setActionError(null);
        
        try {
            await deleteCV(id);
            setShowDropdown(null);
            router.refresh();
        } catch (error) {
            console.error('Error deleting CV:', error);
            setActionError('Failed to delete resume. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    // Handle set as primary
    const handleSetPrimary = async (id) => {
        setActionError(null);
        try {
            await setPrimaryCV(id);
            setShowDropdown(null);
            router.refresh();
        } catch (error) {
            console.error('Error setting primary CV:', error);
            setActionError('Failed to set as primary. Please try again.');
        }
    };

    // Handle duplicate
    const handleDuplicate = async (id) => {
        setActionError(null);
        try {
            await duplicateCV(id);
            setShowDropdown(null);
            router.refresh();
        } catch (error) {
            console.error('Error duplicating CV:', error);
            setActionError('Failed to duplicate resume. Please try again.');
        }
    };

    // Handle download/preview
    const handlePreview = async (id) => {
        setReviewingId(id);
        // Small delay to show loading state before navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push(`/cv-builder/result/${id}?from=resumes`);
    };

    // Handle direct download
    const handleDownload = async (resume) => {
        setDownloadingId(resume.id);
        setCvToDownload(resume.rawData);
        
        // Wait for the CV to render in the hidden container
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
            if (!hiddenCvRef.current) {
                throw new Error('CV container not found');
            }
            
            const cvElement = hiddenCvRef.current.querySelector('.cv-document') || hiddenCvRef.current;
            
            // Get paper size settings
            const paperSize = resume.rawData?.content?._settings?.paperSize || 'letter';
            const isA4 = paperSize === 'a4';
            
            // Paper dimensions in mm
            const pdfWidth = isA4 ? 210 : 215.9;
            const pdfHeight = isA4 ? 297 : 279.4;
            
            // Create canvas from CV element
            const canvas = await html2canvas(cvElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                windowWidth: cvElement.scrollWidth,
                windowHeight: cvElement.scrollHeight
            });
            
            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: isA4 ? 'a4' : 'letter'
            });
            
            // Calculate dimensions
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;
            
            const imgData = canvas.toDataURL('image/png');
            
            // First page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
            
            // Add more pages if needed
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            // Generate filename
            const firstName = resume.personalInfo?.firstName || 'My';
            const lastName = resume.personalInfo?.lastName || 'CV';
            const filename = `${firstName}_${lastName}_CV.pdf`.replace(/\s+/g, '_');
            
            pdf.save(filename);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            setActionError('Failed to download PDF. Please try again.');
        } finally {
            setDownloadingId(null);
            setCvToDownload(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-display mb-2">My Resumes</h1>
                    <p className="text-gray-400">Create, manage, and optimize your AI-powered resumes</p>
                </div>
                <div className="flex gap-3">
                    <Link 
                        href="/cv-builder" 
                        className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Resume
                    </Link>
                </div>
            </header>

            {/* Error Banner */}
            {actionError && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{actionError}</span>
                    <button 
                        onClick={() => setActionError(null)}
                        className="ml-auto text-red-300 hover:text-red-100"
                    >
                        ×
                    </button>
                </div>
            )}

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
                            <div className={`text-2xl font-bold ${avgAtsScore >= 80 ? 'text-green-400' : avgAtsScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {avgAtsScore || '--'}
                            </div>
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
                            <div className="text-2xl font-bold text-purple-400">
                                {primaryResume ? '1' : '0'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Primary Resume</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <Star className="w-5 h-5" />
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
            {resumes.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map((resume) => (
                        <ResumeCard 
                            key={resume.id} 
                            resume={resume}
                            showDropdown={showDropdown === resume.id}
                            onToggleDropdown={() => setShowDropdown(showDropdown === resume.id ? null : resume.id)}
                            onDelete={() => handleDelete(resume.id)}
                            onSetPrimary={() => handleSetPrimary(resume.id)}
                            onDuplicate={() => handleDuplicate(resume.id)}
                            onPreview={() => handlePreview(resume.id)}
                            onDownload={() => handleDownload(resume)}
                            isDeleting={deletingId === resume.id}
                            isReviewing={reviewingId === resume.id}
                            isDownloading={downloadingId === resume.id}
                        />
                    ))}

                    {/* Create New Card */}
                    <Link 
                        href="/cv-builder" 
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
            ) : (
                /* Empty State */
                <div className="glass-card rounded-2xl p-12 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No resumes yet</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Create your first AI-powered resume to get started. Our builder will help you craft a professional, ATS-optimized resume in minutes.
                    </p>
                    <Link 
                        href="/cv-builder"
                        className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Resume
                    </Link>
                </div>
            )}
            
            {/* Hidden CV Renderer for PDF Download */}
            {cvToDownload && (
                <div 
                    ref={hiddenCvRef}
                    style={{ 
                        position: 'absolute', 
                        left: '-9999px', 
                        top: 0,
                        width: '816px',
                        background: 'white'
                    }}
                >
                    <CVPreview 
                        cvData={cvToDownload.content}
                        templateId={cvToDownload.template || 'modern'}
                        paperSize={cvToDownload.content?._settings?.paperSize || 'letter'}
                        resumeSettings={cvToDownload.content?._settings}
                        sectionOrder={cvToDownload.content?._sectionOrder}
                        scale={1}
                    />
                </div>
            )}
        </div>
    );
}

function ResumeCard({ resume, showDropdown, onToggleDropdown, onDelete, onSetPrimary, onDuplicate, onPreview, onDownload, isDeleting, isReviewing, isDownloading }) {
    const scoreColor = resume.atsScore >= 80 ? 'text-green-500' : resume.atsScore >= 60 ? 'text-yellow-500' : 'text-red-500';
    const scoreBgColor = resume.atsScore >= 80 ? 'bg-green-500' : resume.atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    const scoreOffset = 113.1 - (113.1 * resume.atsScore / 100);
    const displayName = resume.personalInfo?.firstName && resume.personalInfo?.lastName
        ? `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`
        : null;

    return (
        <div className={`resume-card glass-card rounded-2xl ${resume.isPrimary ? 'border-2 border-indigo-500/50' : ''}`} style={{ position: 'relative', overflow: 'visible' }}>
            {/* Preview Area */}
            <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 p-4 relative overflow-hidden rounded-t-2xl">
                {resume.isPrimary && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-indigo-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Primary
                    </div>
                )}
                
                {/* Mini Resume Preview */}
                <div className="transform scale-50 origin-top-left w-[200%]">
                    <div className="bg-white rounded shadow-lg p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {resume.personalInfo?.firstName?.[0] || 'U'}
                            </div>
                            <div>
                                <div className="h-3 w-24 bg-gray-800 rounded mb-1 text-xs font-medium text-gray-800 truncate">
                                    {displayName || 'Your Name'}
                                </div>
                                <div className="h-2 w-16 bg-gray-400 rounded text-[10px] text-gray-500 truncate">
                                    {resume.personalInfo?.title || 'Professional'}
                                </div>
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
                        href={`/cv-builder?edit=${resume.id}`}
                        className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition cursor-pointer"
                    >
                        Edit
                    </Link>
                    <button 
                        onClick={onPreview}
                        disabled={isReviewing}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition cursor-pointer disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
                    >
                        {isReviewing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Preview'
                        )}
                    </button>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{resume.title}</h3>
                        <p className="text-sm text-gray-400">Last edited {resume.lastEdited}</p>
                    </div>
                    {/* ATS Score Badge */}
                    <div className="flex-shrink-0 ml-3">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${resume.atsScore >= 80 ? 'border-green-500' : resume.atsScore >= 60 ? 'border-yellow-500' : resume.atsScore > 0 ? 'border-red-500' : 'border-gray-600'}`}>
                            <span className={`text-sm font-bold ${resume.atsScore >= 80 ? 'text-green-500' : resume.atsScore >= 60 ? 'text-yellow-500' : resume.atsScore > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                {resume.atsScore > 0 ? resume.atsScore : '--'}
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-500 text-center mt-1">ATS</p>
                    </div>
                </div>

                {/* Skills */}
                {resume.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {resume.skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 rounded bg-white/5 text-xs border border-white/10">
                                {skill}
                            </span>
                        ))}
                        {resume.skillsCount > 0 && (
                            <span className="px-2 py-1 rounded bg-indigo-500/20 text-xs text-indigo-300">
                                +{resume.skillsCount}
                            </span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {resume.isPrimary ? (
                        <button className="flex-1 py-2 text-sm font-medium btn-primary rounded-lg flex items-center justify-center gap-2">
                            <Star className="w-4 h-4" />
                            Primary Resume
                        </button>
                    ) : (
                        <button 
                            onClick={onSetPrimary}
                            className="flex-1 py-2 text-sm font-medium border border-white/20 rounded-lg hover:bg-white/5 transition"
                        >
                            Set as Primary
                        </button>
                    )}
                    <button 
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="btn-icon p-2 rounded-lg cursor-pointer disabled:cursor-wait"
                        title="Download PDF"
                    >
                        {isDownloading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Download className="w-5 h-5" />
                        )}
                    </button>
                    <div className="relative">
                        <button 
                            className="btn-icon p-2 rounded-lg cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleDropdown();
                            }}
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {showDropdown && (
                            <div 
                                className="absolute right-0 top-full mt-1 w-44 glass-card-static rounded-xl py-2 shadow-xl border border-white/10"
                                style={{ zIndex: 9999 }}
                            >
                                <Link 
                                    href={`/cv-builder?edit=${resume.id}`}
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/10 transition"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit
                                </Link>
                                <button 
                                    onClick={onPreview}
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/10 transition w-full text-left"
                                >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                </button>
                                <button 
                                    onClick={onDuplicate}
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/10 transition w-full text-left"
                                >
                                    <Copy className="w-4 h-4" />
                                    Duplicate
                                </button>
                                <hr className="my-2 border-white/10" />
                                <button 
                                    onClick={onDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition w-full text-left disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    {isDeleting ? 'Deleting...' : 'Delete'}
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
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    return date.toLocaleDateString();
}
