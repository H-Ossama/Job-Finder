'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    CheckCircle,
    Download,
    Edit3,
    Target,
    Key,
    TrendingUp,
    AlertTriangle,
    Lightbulb,
    FileText,
    ArrowLeft,
    Share2,
    Sparkles,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Briefcase,
    Award,
    Check,
    X,
    Plus,
    RefreshCw,
    Info,
    ChevronDown,
    ChevronUp,
    Loader2
} from 'lucide-react';
import LivePreviewPanel from '@/components/cv/LivePreviewPanel';
import styles from './result.module.css';

export default function CVResultContent({ cv, user }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cvPreviewRef = useRef(null);
    const [activeTab, setActiveTab] = useState('found');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null);
    const [zoom, setZoom] = useState(0.6);
    const [showAtsReason, setShowAtsReason] = useState(false);
    const [showKeywordReason, setShowKeywordReason] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // Determine back link based on referrer or query param
    const [backLink, setBackLink] = useState({ href: '/cv-builder', label: 'Back to CV Builder' });
    
    useEffect(() => {
        // Check for explicit 'from' query parameter first
        const fromParam = searchParams.get('from');
        if (fromParam === 'resumes' || fromParam === 'my-cvs') {
            setBackLink({ href: '/resumes', label: 'Back to My CVs' });
            return;
        }
        
        // Check document referrer as fallback
        if (typeof window !== 'undefined' && document.referrer) {
            const referrerUrl = new URL(document.referrer);
            if (referrerUrl.pathname === '/resumes' || referrerUrl.pathname.includes('/resumes')) {
                setBackLink({ href: '/resumes', label: 'Back to My CVs' });
            }
        }
    }, [searchParams]);

    // Run ATS analysis on mount - but check for cached analysis first
    useEffect(() => {
        loadOrAnalyzeCV();
    }, [cv]);

    // Load cached analysis or analyze if not available
    const loadOrAnalyzeCV = async () => {
        setLoading(true);
        setError(null);
        
        // Check if we have cached analysis data in the CV record
        if (cv.ats_analysis && cv.ats_score > 0) {
            // Use cached analysis data
            const cachedAnalysis = cv.ats_analysis;
            setAnalysisResult({
                atsScore: cv.ats_score || cachedAnalysis.atsScore || 0,
                atsScoreReason: cachedAnalysis.atsScoreReason || '',
                keywordScore: cachedAnalysis.keywordScore || 0,
                keywordScoreReason: cachedAnalysis.keywordScoreReason || '',
                breakdown: cachedAnalysis.breakdown || {},
                improvements: cachedAnalysis.improvements || [],
                keywords: cachedAnalysis.keywords || { found: [], missing: [], suggested: [] },
                strengths: cachedAnalysis.strengths || [],
                summary: cachedAnalysis.summary || ''
            });
            setLoading(false);
            return;
        }
        
        // No cached data, run AI analysis
        await analyzeCV();
    };

    const analyzeCV = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Call Gemini API for accurate analysis
            const response = await fetch('/api/cv/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'analyze',
                    cvData: cv.content
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || result.message || 'Analysis failed');
            }

            const data = result.data;
            
            const analysisData = {
                atsScore: data.atsScore || 0,
                atsScoreReason: data.atsScoreReason || '',
                keywordScore: data.keywordScore || 0,
                keywordScoreReason: data.keywordScoreReason || '',
                breakdown: data.breakdown || {},
                improvements: data.improvements || [],
                keywords: data.keywords || { found: [], missing: [], suggested: [] },
                strengths: data.strengths || [],
                summary: data.summary || ''
            };
            
            setAnalysisResult(analysisData);
            
            // Save the analysis to the database for caching
            try {
                await fetch('/api/cv/save-analysis', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cvId: cv.id,
                        atsScore: analysisData.atsScore,
                        analysis: analysisData
                    })
                });
            } catch (saveError) {
                console.error('Error saving analysis to cache:', saveError);
                // Don't fail the whole operation if caching fails
            }
        } catch (error) {
            console.error('Error analyzing CV:', error);
            setError(error.message);
            
            // Fallback to basic analysis if Gemini fails
            const cvData = cv.content || {};
            const technicalSkills = cvData.skills?.technical || [];
            const softSkills = cvData.skills?.soft || [];
            
            setAnalysisResult({
                atsScore: calculateBasicScore(cvData),
                atsScoreReason: 'Analysis performed locally due to API error. For more accurate results, try re-analyzing.',
                keywordScore: Math.min(90, (technicalSkills.length + softSkills.length) * 5 + 30),
                keywordScoreReason: 'Basic keyword count analysis.',
                breakdown: {},
                improvements: [
                    { priority: 'high', title: 'Add more quantifiable achievements', description: 'Include numbers and metrics to demonstrate impact', impact: '+5-10 points' },
                    { priority: 'medium', title: 'Use more action verbs', description: 'Start bullet points with strong action verbs like "Developed", "Led", "Improved"', impact: '+3-5 points' },
                    { priority: 'medium', title: 'Add more technical keywords', description: 'Include relevant technical skills and tools for your industry', impact: '+5-8 points' }
                ],
                keywords: {
                    found: [...technicalSkills, ...softSkills],
                    missing: ['Problem Solving', 'Communication', 'Leadership'].filter(k => 
                        ![...technicalSkills, ...softSkills].map(s => s.toLowerCase()).includes(k.toLowerCase())
                    ),
                    suggested: ['Agile', 'Project Management', 'Collaboration', 'Innovation']
                },
                strengths: [],
                summary: 'Local analysis completed. For AI-powered insights, please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateBasicScore = (cvData) => {
        let score = 40; // Base score
        
        // Personal info completeness
        if (cvData.personalInfo?.firstName) score += 5;
        if (cvData.personalInfo?.email) score += 5;
        if (cvData.personalInfo?.phone) score += 3;
        if (cvData.personalInfo?.location) score += 2;
        if (cvData.personalInfo?.linkedin) score += 3;
        
        // Summary
        if (cvData.summary && cvData.summary.length > 50) score += 10;
        
        // Experience
        if (cvData.experience && cvData.experience.length > 0) {
            score += Math.min(15, cvData.experience.length * 5);
            cvData.experience.forEach(exp => {
                if (exp.bullets && exp.bullets.length > 0) score += 2;
            });
        }
        
        // Education
        if (cvData.education && cvData.education.length > 0) score += 5;
        
        // Skills
        if (cvData.skills?.technical?.length > 0) score += Math.min(10, cvData.skills.technical.length);
        if (cvData.skills?.soft?.length > 0) score += Math.min(5, cvData.skills.soft.length);
        
        return Math.min(95, score);
    };

    const getScoreLevel = (score) => {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        return 'needsWork';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        return 'Needs Work';
    };

    const handleDownload = async () => {
        if (!cvPreviewRef.current) return;
        
        setDownloading(true);
        try {
            // Find the CV document element inside the preview
            const cvElement = cvPreviewRef.current.querySelector('.cv-document') || 
                              cvPreviewRef.current.querySelector('.paper-document') ||
                              cvPreviewRef.current;
            
            // Get the paper size settings
            const paperSize = cv.content?._settings?.paperSize || 'letter';
            const isA4 = paperSize === 'a4';
            
            // Paper dimensions in mm
            const pdfWidth = isA4 ? 210 : 215.9; // A4 or Letter width
            const pdfHeight = isA4 ? 297 : 279.4; // A4 or Letter height
            
            // Create canvas from the CV element
            const canvas = await html2canvas(cvElement, {
                scale: 2, // Higher resolution
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
            
            // Calculate dimensions to fit the page
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            // Add image to PDF (may span multiple pages)
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
            const firstName = cv.content?.personalInfo?.firstName || 'My';
            const lastName = cv.content?.personalInfo?.lastName || 'CV';
            const filename = `${firstName}_${lastName}_CV.pdf`.replace(/\s+/g, '_');
            
            // Download the PDF
            pdf.save(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            // Fallback to window.print() if canvas fails
            window.print();
        } finally {
            setDownloading(false);
        }
    };

    const handleEdit = () => {
        router.push(`/cv-builder?edit=${cv.id}`);
    };

    const copyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Analyzing your CV with AI...</p>
                    <p className={styles.loadingSubtext}>This may take a few seconds</p>
                </div>
            </div>
        );
    }

    const { atsScore, atsScoreReason, keywordScore, keywordScoreReason, keywords, improvements, breakdown, summary } = analysisResult || {};

    return (
        <div className={styles.container}>
            {/* Back Link */}
            <Link href={backLink.href} className={styles.backLink}>
                <ArrowLeft className="w-4 h-4" />
                {backLink.label}
            </Link>

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.successIcon}>
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className={styles.title}>Congratulations! 🎉</h1>
                <p className={styles.subtitle}>
                    Your CV "{cv.title}" has been created successfully. Here's your AI-powered analysis.
                </p>
                {summary && (
                    <p className={styles.summaryText}>{summary}</p>
                )}
            </header>

            {/* Error Banner */}
            {error && (
                <div className={styles.errorBanner}>
                    <AlertTriangle className="w-5 h-5" />
                    <span>AI analysis encountered an issue. Showing estimated scores.</span>
                    <button onClick={analyzeCV} className={styles.retryBtn}>
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            )}

            {/* Main Grid */}
            <div className={styles.mainGrid}>
                {/* Left Column - Analysis */}
                <div className={styles.analysisColumn}>
                    {/* Score Cards */}
                    <div className={styles.scoreSection}>
                        {/* ATS Score Card */}
                        <div className={styles.scoreCard}>
                            <div className={styles.scoreCircle}>
                                <svg className={styles.scoreCircleSvg} viewBox="0 0 100 100">
                                    <circle
                                        className={styles.scoreCircleTrack}
                                        cx="50"
                                        cy="50"
                                        r="42"
                                    />
                                    <circle
                                        className={`${styles.scoreCircleProgress} ${styles[getScoreLevel(atsScore)]}`}
                                        cx="50"
                                        cy="50"
                                        r="42"
                                        strokeDasharray={`${(atsScore / 100) * 264} 264`}
                                    />
                                </svg>
                                <span className={styles.scoreValue}>{atsScore}</span>
                            </div>
                            <div className={styles.scoreInfo}>
                                <div className={styles.scoreLabel}>
                                    <Target className="w-5 h-5" />
                                    ATS Score
                                    <span className={`${styles.scoreBadge} ${styles[getScoreLevel(atsScore)]}`}>
                                        {getScoreLabel(atsScore)}
                                    </span>
                                </div>
                                <button 
                                    className={styles.reasonToggle}
                                    onClick={() => setShowAtsReason(!showAtsReason)}
                                >
                                    <Info className="w-4 h-4" />
                                    Why this score?
                                    {showAtsReason ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {showAtsReason && atsScoreReason && (
                                    <p className={styles.scoreReason}>{atsScoreReason}</p>
                                )}
                            </div>
                        </div>

                        {/* Keyword Score Card */}
                        <div className={styles.scoreCard}>
                            <div className={styles.scoreCircle}>
                                <svg className={styles.scoreCircleSvg} viewBox="0 0 100 100">
                                    <circle
                                        className={styles.scoreCircleTrack}
                                        cx="50"
                                        cy="50"
                                        r="42"
                                    />
                                    <circle
                                        className={`${styles.scoreCircleProgress} ${styles[getScoreLevel(keywordScore)]}`}
                                        cx="50"
                                        cy="50"
                                        r="42"
                                        strokeDasharray={`${(keywordScore / 100) * 264} 264`}
                                    />
                                </svg>
                                <span className={styles.scoreValue}>{keywordScore}</span>
                            </div>
                            <div className={styles.scoreInfo}>
                                <div className={styles.scoreLabel}>
                                    <Key className="w-5 h-5" />
                                    Keyword Score
                                    <span className={`${styles.scoreBadge} ${styles[getScoreLevel(keywordScore)]}`}>
                                        {getScoreLabel(keywordScore)}
                                    </span>
                                </div>
                                <button 
                                    className={styles.reasonToggle}
                                    onClick={() => setShowKeywordReason(!showKeywordReason)}
                                >
                                    <Info className="w-4 h-4" />
                                    Why this score?
                                    {showKeywordReason ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {showKeywordReason && keywordScoreReason && (
                                    <p className={styles.scoreReason}>{keywordScoreReason}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Score Breakdown */}
                    {breakdown && Object.keys(breakdown).length > 0 && (
                        <div className={styles.analysisSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    <Target className="w-5 h-5" />
                                    Score Breakdown
                                </h2>
                            </div>
                            <div className={styles.breakdownGrid}>
                                {Object.entries(breakdown).map(([key, value]) => (
                                    <div key={key} className={styles.breakdownItem}>
                                        <div className={styles.breakdownHeader}>
                                            <span className={styles.breakdownLabel}>
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </span>
                                            <span className={`${styles.breakdownScore} ${styles[getScoreLevel(value.score)]}`}>
                                                {value.score}%
                                            </span>
                                        </div>
                                        <div className={styles.breakdownBar}>
                                            <div 
                                                className={`${styles.breakdownProgress} ${styles[getScoreLevel(value.score)]}`}
                                                style={{ width: `${value.score}%` }}
                                            />
                                        </div>
                                        {value.details && (
                                            <p className={styles.breakdownDetails}>{value.details}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Keywords Analysis */}
                    <div className={styles.analysisSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <Key className="w-5 h-5" />
                                Keywords Analysis
                            </h2>
                        </div>

                        {/* Tabs */}
                        <div className={styles.tabs}>
                            <button 
                                className={`${styles.tab} ${activeTab === 'found' ? styles.active : ''}`}
                                onClick={() => setActiveTab('found')}
                            >
                                <Check className="w-4 h-4" />
                                Found
                                <span className={styles.tabBadge}>{keywords?.found?.length || 0}</span>
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'missing' ? styles.active : ''}`}
                                onClick={() => setActiveTab('missing')}
                            >
                                <X className="w-4 h-4" />
                                Missing
                                <span className={styles.tabBadge}>{keywords?.missing?.length || 0}</span>
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'suggested' ? styles.active : ''}`}
                                onClick={() => setActiveTab('suggested')}
                            >
                                <Plus className="w-4 h-4" />
                                Suggested
                                <span className={styles.tabBadge}>{keywords?.suggested?.length || 0}</span>
                            </button>
                        </div>

                        {/* Keywords Grid */}
                        <div className={styles.keywordsGrid}>
                            {activeTab === 'found' && keywords?.found?.map((keyword, i) => (
                                <span key={i} className={`${styles.keyword} ${styles.found}`}>
                                    <Check className="w-3.5 h-3.5" />
                                    {keyword}
                                </span>
                            ))}
                            {activeTab === 'missing' && keywords?.missing?.map((keyword, i) => (
                                <span key={i} className={`${styles.keyword} ${styles.missing}`}>
                                    <X className="w-3.5 h-3.5" />
                                    {keyword}
                                </span>
                            ))}
                            {activeTab === 'suggested' && keywords?.suggested?.map((keyword, i) => (
                                <span key={i} className={`${styles.keyword} ${styles.suggested}`}>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {keyword}
                                </span>
                            ))}
                            {((activeTab === 'found' && !keywords?.found?.length) ||
                              (activeTab === 'missing' && !keywords?.missing?.length) ||
                              (activeTab === 'suggested' && !keywords?.suggested?.length)) && (
                                <div className={styles.emptyState}>
                                    <Key className="w-8 h-8" />
                                    <p>No {activeTab} keywords</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Improvements Section */}
                    <div className={styles.analysisSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <Lightbulb className="w-5 h-5" />
                                How to Improve
                            </h2>
                        </div>

                        <div className={styles.improvementsList}>
                            {improvements?.map((item, i) => (
                                <div key={i} className={styles.improvementItem}>
                                    <div className={`${styles.improvementIcon} ${styles[item.priority || 'medium']}`}>
                                        {item.priority === 'high' ? (
                                            <AlertTriangle className="w-5 h-5" />
                                        ) : item.priority === 'low' ? (
                                            <Lightbulb className="w-5 h-5" />
                                        ) : (
                                            <TrendingUp className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className={styles.improvementContent}>
                                        <div className={styles.improvementHeader}>
                                            <h4 className={styles.improvementTitle}>{item.title}</h4>
                                            <span className={`${styles.priorityBadge} ${styles[item.priority || 'medium']}`}>
                                                {item.priority || 'medium'}
                                            </span>
                                        </div>
                                        <p className={styles.improvementDescription}>{item.description}</p>
                                        {item.impact && (
                                            <span className={styles.improvementImpact}>
                                                <TrendingUp className="w-3 h-3" />
                                                {item.impact}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {(!improvements || improvements.length === 0) && (
                                <div className={styles.emptyState}>
                                    <Award className="w-10 h-10" />
                                    <p>Great job! No major improvements needed.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Preview & Actions */}
                <div className={styles.previewPanel}>
                    <div className={styles.previewCard}>
                        <div className={styles.previewHeader}>
                            <span className={styles.previewTitle}>
                                <FileText className="w-4 h-4" />
                                CV Preview
                            </span>
                            <div className={styles.previewControls}>
                                <button 
                                    className={styles.previewBtn}
                                    onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
                                    title="Zoom out"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <button 
                                    className={styles.previewBtn}
                                    onClick={() => setZoom(Math.min(1, zoom + 0.1))}
                                    title="Zoom in"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                                <button 
                                    className={styles.previewBtn}
                                    onClick={() => setZoom(0.6)}
                                    title="Reset zoom"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        <div className={styles.previewContent} ref={cvPreviewRef}>
                            <LivePreviewPanel
                                cvData={cv.content}
                                templateId={cv.template || 'modern'}
                                paperSize={cv.content?._settings?.paperSize || 'letter'}
                                resumeSettings={cv.content?._settings}
                                sectionOrder={cv.content?._sectionOrder}
                                showControls={false}
                                scale={zoom}
                            />
                        </div>

                        <div className={styles.actionsSection}>
                            <button onClick={handleDownload} className={styles.btnPrimary} disabled={downloading}>
                                {downloading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </>
                                )}
                            </button>
                            <button onClick={handleEdit} className={styles.btnSecondary}>
                                <Edit3 className="w-4 h-4" />
                                Edit CV
                            </button>
                            
                            <div className={styles.quickActions}>
                                <Link href="/job-search" className={styles.quickAction}>
                                    <Briefcase className="w-5 h-5" />
                                    Find Jobs
                                </Link>
                                <button onClick={copyShareLink} className={styles.quickAction}>
                                    {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                                    {copied ? 'Copied!' : 'Share'}
                                </button>
                                <button onClick={analyzeCV} className={styles.quickAction} disabled={loading}>
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                                    Re-analyze
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
