'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    Target, 
    TrendingUp, 
    AlertCircle, 
    CheckCircle, 
    Loader2,
    Lightbulb,
    Zap,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Search,
    FileText,
    BarChart3,
    CheckCircle2,
    XCircle,
    MinusCircle,
    Sparkles,
    Brain,
    Settings2
} from 'lucide-react';
import { 
    calculateATSScore, 
    extractJobKeywords as extractLocalKeywords, 
    calculateKeywordMatch,
    extractCVText,
    generateATSReport
} from '@/utils/cv/atsAnalyzer';

/**
 * Enhanced ATS Score Analyzer Component
 * Comprehensive ATS compatibility analysis with keyword matching
 */
export default function ATSScoreAnalyzer({ cvData, onAnalyze, initialScore = null }) {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(initialScore ? { score: initialScore } : null);
    const [localAnalysis, setLocalAnalysis] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [showJobInput, setShowJobInput] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedSections, setExpandedSections] = useState({
        breakdown: true,
        keywords: true,
        suggestions: true,
        strengths: false
    });
    const [analysisMode, setAnalysisMode] = useState('hybrid'); // 'local', 'ai', 'hybrid'
    const [keywordFilter, setKeywordFilter] = useState('all'); // 'all', 'found', 'missing'

    // Run local analysis whenever CV data changes
    useEffect(() => {
        if (cvData) {
            const local = calculateATSScore(cvData, jobDescription || null);
            setLocalAnalysis(local);
        }
    }, [cvData, jobDescription]);

    const analyzeCV = async (withJobDescription = false) => {
        setAnalyzing(true);
        try {
            // First, run local analysis for instant feedback
            const jobDesc = withJobDescription ? jobDescription : null;
            const local = calculateATSScore(cvData, jobDesc);
            setLocalAnalysis(local);

            if (analysisMode === 'local') {
                // Use only local analysis
                const report = generateATSReport(local);
                setAnalysis({
                    score: local.overallScore,
                    breakdown: local.breakdown,
                    missingKeywords: local.missingKeywords,
                    matchedKeywords: local.matchedKeywords,
                    suggestions: local.suggestions,
                    strengths: local.strengths,
                    improvements: local.suggestions,
                    details: local.details,
                    atsReadiness: report.summary.status
                });
            } else {
                // Use AI analysis (hybrid or ai-only mode)
                const response = await fetch('/api/cv/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'ats-analyze',
                        cvData,
                        jobDescription: jobDesc
                    })
                });

                const result = await response.json();
                if (result.success) {
                    if (analysisMode === 'hybrid') {
                        // Merge local and AI analysis for best results
                        const merged = mergeAnalysis(local, result.analysis);
                        setAnalysis(merged);
                    } else {
                        setAnalysis(result.analysis);
                    }
                } else {
                    // Fallback to local analysis on AI failure
                    setAnalysis({
                        score: local.overallScore,
                        breakdown: local.breakdown,
                        missingKeywords: local.missingKeywords,
                        matchedKeywords: local.matchedKeywords,
                        suggestions: local.suggestions,
                        strengths: local.strengths,
                        improvements: local.suggestions,
                        details: local.details
                    });
                }
            }

            if (onAnalyze) {
                onAnalyze(analysis);
            }
        } catch (error) {
            console.error('Error analyzing CV:', error);
            // Use local analysis as fallback
            if (localAnalysis) {
                setAnalysis({
                    score: localAnalysis.overallScore,
                    breakdown: localAnalysis.breakdown,
                    missingKeywords: localAnalysis.missingKeywords,
                    matchedKeywords: localAnalysis.matchedKeywords,
                    suggestions: localAnalysis.suggestions,
                    strengths: localAnalysis.strengths,
                    improvements: localAnalysis.suggestions,
                    details: localAnalysis.details
                });
            }
        } finally {
            setAnalyzing(false);
        }
    };

    // Merge local and AI analysis for hybrid mode
    const mergeAnalysis = (local, ai) => {
        return {
            score: Math.round((local.overallScore * 0.4 + (ai.score || 70) * 0.6)),
            breakdown: {
                structure: Math.round((local.breakdown.structure + (ai.breakdown?.structure || ai.breakdown?.format || 70)) / 2),
                keywords: Math.round((local.breakdown.keywords + (ai.breakdown?.keywords || 65)) / 2),
                actionVerbs: Math.round((local.breakdown.actionVerbs + (ai.breakdown?.actionVerbs || ai.breakdown?.content || 70)) / 2),
                metrics: Math.round((local.breakdown.metrics + (ai.breakdown?.metrics || 65)) / 2),
                formatting: Math.round((local.breakdown.formatting + (ai.breakdown?.formatting || 75)) / 2)
            },
            missingKeywords: [...new Set([
                ...(local.missingKeywords || []),
                ...(ai.missingKeywords || ai.keywordAnalysis?.missing || [])
            ])].slice(0, 15),
            matchedKeywords: [...new Set([
                ...(local.matchedKeywords || []),
                ...(ai.keywordAnalysis?.found || [])
            ])],
            suggestions: [...new Set([
                ...(ai.suggestions || []),
                ...(local.suggestions || [])
            ])].slice(0, 10),
            strengths: [...new Set([
                ...(ai.strengths || []),
                ...(local.strengths || [])
            ])].slice(0, 8),
            improvements: [...new Set([
                ...(ai.improvements || []),
                ...(local.suggestions || [])
            ])].slice(0, 8),
            keywordAnalysis: ai.keywordAnalysis || local.details?.keywordMatch,
            actionVerbAnalysis: ai.actionVerbAnalysis || local.details?.actionVerbs,
            metricsAnalysis: ai.metricsAnalysis || local.details?.metrics,
            industryFit: ai.industryFit,
            atsReadiness: ai.atsReadiness || (local.overallScore >= 70 ? 'ATS Ready' : 'Needs Improvement'),
            details: local.details
        };
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#f59e0b';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    };

    const getScoreLabel = (score) => {
        if (score >= 85) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 55) return 'Fair';
        return 'Needs Work';
    };

    const getScoreGrade = (score) => {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'A-';
        if (score >= 75) return 'B+';
        if (score >= 70) return 'B';
        if (score >= 65) return 'B-';
        if (score >= 60) return 'C+';
        if (score >= 55) return 'C';
        if (score >= 50) return 'C-';
        if (score >= 45) return 'D';
        return 'F';
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const renderQuickScore = () => {
        if (!localAnalysis && !analysis) return null;
        const score = analysis?.score || localAnalysis?.overallScore || 0;
        
        return (
            <div className="quick-score-bar">
                <div className="quick-score-fill" style={{ 
                    width: `${score}%`,
                    background: `linear-gradient(90deg, ${getScoreColor(score)}88, ${getScoreColor(score)})`
                }} />
                <span className="quick-score-text">{score}% ATS Compatible</span>
            </div>
        );
    };

    const breakdownLabels = {
        structure: { label: 'Structure', icon: FileText, description: 'Section organization & completeness' },
        keywords: { label: 'Keywords', icon: Search, description: 'Industry & role-specific terms' },
        actionVerbs: { label: 'Action Verbs', icon: Zap, description: 'Strong, impactful language' },
        metrics: { label: 'Metrics', icon: BarChart3, description: 'Quantifiable achievements' },
        formatting: { label: 'Formatting', icon: Settings2, description: 'ATS-friendly format' }
    };

    return (
        <div className="ats-analyzer">
            {/* Header */}
            <div className="analyzer-header">
                <div className="header-title">
                    <Target className="icon" />
                    <div>
                        <h3>ATS Analysis</h3>
                        <p className="header-subtitle">Applicant Tracking System Compatibility</p>
                    </div>
                </div>
                
                <div className="header-actions">
                    {/* Analysis Mode Toggle */}
                    <div className="mode-toggle">
                        <button 
                            className={`mode-btn ${analysisMode === 'local' ? 'active' : ''}`}
                            onClick={() => setAnalysisMode('local')}
                            title="Fast local analysis"
                        >
                            <Zap size={14} />
                        </button>
                        <button 
                            className={`mode-btn ${analysisMode === 'hybrid' ? 'active' : ''}`}
                            onClick={() => setAnalysisMode('hybrid')}
                            title="Hybrid analysis (recommended)"
                        >
                            <Sparkles size={14} />
                        </button>
                        <button 
                            className={`mode-btn ${analysisMode === 'ai' ? 'active' : ''}`}
                            onClick={() => setAnalysisMode('ai')}
                            title="Full AI analysis"
                        >
                            <Brain size={14} />
                        </button>
                    </div>

                    {!analysis && !analyzing && (
                        <button 
                            onClick={() => analyzeCV(false)} 
                            className="analyze-btn"
                        >
                            <Zap size={16} />
                            Analyze
                        </button>
                    )}
                    {analysis && !analyzing && (
                        <button 
                            onClick={() => analyzeCV(showJobInput && jobDescription)} 
                            className="refresh-btn"
                        >
                            <RefreshCw size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Score Bar (always visible if analysis exists) */}
            {renderQuickScore()}

            {/* Analyzing State */}
            {analyzing && (
                <div className="analyzing-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Analyzing your CV for ATS compatibility...</p>
                    <span className="analyzing-mode">
                        Mode: {analysisMode === 'local' ? 'Fast Local' : analysisMode === 'hybrid' ? 'Hybrid AI' : 'Full AI'}
                    </span>
                </div>
            )}

            {/* Main Analysis Results */}
            {analysis && !analyzing && (
                <>
                    {/* Main Score Display */}
                    <div className="score-display">
                        <div 
                            className="score-circle"
                            style={{ 
                                background: `conic-gradient(${getScoreColor(analysis.score)} ${analysis.score * 3.6}deg, rgba(255,255,255,0.08) 0deg)` 
                            }}
                        >
                            <div className="score-inner">
                                <span className="score-grade">{getScoreGrade(analysis.score)}</span>
                                <span className="score-number">{analysis.score}</span>
                                <span className="score-label">{getScoreLabel(analysis.score)}</span>
                            </div>
                        </div>
                        
                        <div className="score-summary">
                            <div className={`ats-status ${analysis.score >= 70 ? 'ready' : 'needs-work'}`}>
                                {analysis.score >= 70 ? (
                                    <>
                                        <CheckCircle2 size={16} />
                                        <span>{analysis.atsReadiness || 'ATS Ready'}</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={16} />
                                        <span>{analysis.atsReadiness || 'Needs Improvement'}</span>
                                    </>
                                )}
                            </div>
                            {analysis.industryFit && (
                                <p className="industry-fit">{analysis.industryFit}</p>
                            )}
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="tabs">
                        <button 
                            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button 
                            className={`tab ${activeTab === 'keywords' ? 'active' : ''}`}
                            onClick={() => setActiveTab('keywords')}
                        >
                            Keywords
                        </button>
                        <button 
                            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Details
                        </button>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="tab-content">
                            {/* Score Breakdown */}
                            <div className="section collapsible">
                                <div className="section-header" onClick={() => toggleSection('breakdown')}>
                                    <h4>
                                        <BarChart3 size={16} />
                                        Score Breakdown
                                    </h4>
                                    {expandedSections.breakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                                {expandedSections.breakdown && (
                                    <div className="breakdown-grid">
                                        {Object.entries(analysis.breakdown || {}).map(([key, value]) => {
                                            const info = breakdownLabels[key] || { label: key, icon: Target, description: '' };
                                            const Icon = info.icon;
                                            return (
                                                <div key={key} className="breakdown-card">
                                                    <div className="breakdown-card-header">
                                                        <Icon size={16} className="breakdown-icon" />
                                                        <span className="breakdown-label">{info.label}</span>
                                                        <span 
                                                            className="breakdown-value"
                                                            style={{ color: getScoreColor(value) }}
                                                        >
                                                            {value}%
                                                        </span>
                                                    </div>
                                                    <div className="breakdown-bar-container">
                                                        <div 
                                                            className="breakdown-bar"
                                                            style={{ 
                                                                width: `${value}%`,
                                                                background: `linear-gradient(90deg, ${getScoreColor(value)}88, ${getScoreColor(value)})`
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="breakdown-description">{info.description}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Strengths */}
                            {analysis.strengths?.length > 0 && (
                                <div className="section collapsible">
                                    <div className="section-header" onClick={() => toggleSection('strengths')}>
                                        <h4 className="success">
                                            <CheckCircle size={16} />
                                            Strengths ({analysis.strengths.length})
                                        </h4>
                                        {expandedSections.strengths ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                    {expandedSections.strengths && (
                                        <ul className="feedback-list success">
                                            {analysis.strengths.map((strength, i) => (
                                                <li key={i}>
                                                    <CheckCircle2 size={14} className="list-icon" />
                                                    {strength}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* Suggestions */}
                            {analysis.suggestions?.length > 0 && (
                                <div className="section collapsible">
                                    <div className="section-header" onClick={() => toggleSection('suggestions')}>
                                        <h4 className="warning">
                                            <Lightbulb size={16} />
                                            Suggestions ({analysis.suggestions.length})
                                        </h4>
                                        {expandedSections.suggestions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                    {expandedSections.suggestions && (
                                        <ul className="feedback-list warning">
                                            {analysis.suggestions.map((suggestion, i) => (
                                                <li key={i}>
                                                    <Lightbulb size={14} className="list-icon" />
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* Improvements */}
                            {analysis.improvements?.length > 0 && (
                                <div className="section">
                                    <h4 className="info">
                                        <TrendingUp size={16} />
                                        Areas to Improve
                                    </h4>
                                    <ul className="feedback-list info">
                                        {analysis.improvements.slice(0, 5).map((improvement, i) => (
                                            <li key={i}>
                                                <TrendingUp size={14} className="list-icon" />
                                                {improvement}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Keywords Tab */}
                    {activeTab === 'keywords' && (
                        <div className="tab-content">
                            {/* Keyword Filter */}
                            <div className="keyword-filter">
                                <button 
                                    className={`filter-btn ${keywordFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setKeywordFilter('all')}
                                >
                                    All
                                </button>
                                <button 
                                    className={`filter-btn found ${keywordFilter === 'found' ? 'active' : ''}`}
                                    onClick={() => setKeywordFilter('found')}
                                >
                                    <CheckCircle2 size={12} />
                                    Found ({analysis.matchedKeywords?.length || 0})
                                </button>
                                <button 
                                    className={`filter-btn missing ${keywordFilter === 'missing' ? 'active' : ''}`}
                                    onClick={() => setKeywordFilter('missing')}
                                >
                                    <XCircle size={12} />
                                    Missing ({analysis.missingKeywords?.length || 0})
                                </button>
                            </div>

                            {/* Matched Keywords */}
                            {(keywordFilter === 'all' || keywordFilter === 'found') && analysis.matchedKeywords?.length > 0 && (
                                <div className="section keywords-section">
                                    <h4 className="success">
                                        <CheckCircle size={16} />
                                        Found Keywords
                                    </h4>
                                    <div className="keyword-tags">
                                        {analysis.matchedKeywords.map((keyword, i) => (
                                            <span key={i} className="keyword-tag found">
                                                <CheckCircle2 size={12} />
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Missing Keywords */}
                            {(keywordFilter === 'all' || keywordFilter === 'missing') && analysis.missingKeywords?.length > 0 && (
                                <div className="section keywords-section">
                                    <h4 className="warning">
                                        <AlertCircle size={16} />
                                        Missing Keywords
                                    </h4>
                                    <p className="keyword-hint">Consider adding these keywords to improve your match:</p>
                                    <div className="keyword-tags">
                                        {analysis.missingKeywords.map((keyword, i) => (
                                            <span key={i} className="keyword-tag missing">
                                                <XCircle size={12} />
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Keyword Analysis Details */}
                            {analysis.keywordAnalysis && (
                                <div className="section">
                                    <h4>
                                        <Search size={16} />
                                        Keyword Density
                                    </h4>
                                    <p className="density-note">{analysis.keywordAnalysis.density || 'Analysis based on job requirements'}</p>
                                </div>
                            )}

                            {/* Action Verb Analysis */}
                            {analysis.actionVerbAnalysis && (
                                <div className="section">
                                    <h4>
                                        <Zap size={16} />
                                        Action Verbs
                                    </h4>
                                    {analysis.actionVerbAnalysis.strong?.length > 0 && (
                                        <div className="verb-group">
                                            <span className="verb-label success">Strong:</span>
                                            <div className="verb-tags">
                                                {analysis.actionVerbAnalysis.strong.slice(0, 10).map((verb, i) => (
                                                    <span key={i} className="verb-tag strong">{verb}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {analysis.actionVerbAnalysis.weak?.length > 0 && (
                                        <div className="verb-group">
                                            <span className="verb-label warning">Weak phrases to replace:</span>
                                            <div className="verb-tags">
                                                {analysis.actionVerbAnalysis.weak.map((phrase, i) => (
                                                    <span key={i} className="verb-tag weak">{phrase}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="tab-content">
                            {/* Metrics Analysis */}
                            {analysis.metricsAnalysis && (
                                <div className="section">
                                    <h4>
                                        <BarChart3 size={16} />
                                        Quantifiable Achievements
                                    </h4>
                                    {analysis.metricsAnalysis.found?.length > 0 ? (
                                        <>
                                            <p className="metrics-count success">
                                                Found {analysis.metricsAnalysis.found.length} quantifiable metrics
                                            </p>
                                            <div className="metrics-list">
                                                {analysis.metricsAnalysis.found.slice(0, 8).map((metric, i) => (
                                                    <span key={i} className="metric-tag">{metric}</span>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <p className="metrics-count warning">No quantifiable metrics found</p>
                                    )}
                                    {analysis.metricsAnalysis.missingOpportunities?.length > 0 && (
                                        <div className="opportunities">
                                            <p className="opportunities-label">Opportunities to add metrics:</p>
                                            <ul>
                                                {analysis.metricsAnalysis.missingOpportunities.map((opp, i) => (
                                                    <li key={i}>{opp}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Structure Details */}
                            {analysis.details?.structure && (
                                <div className="section">
                                    <h4>
                                        <FileText size={16} />
                                        Structure Analysis
                                    </h4>
                                    <div className="structure-grid">
                                        {Object.entries(analysis.details.structure.sections || {}).map(([section, present]) => (
                                            <div key={section} className={`structure-item ${present ? 'present' : 'missing'}`}>
                                                {present ? <CheckCircle2 size={14} /> : <MinusCircle size={14} />}
                                                <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {analysis.details.structure.issues?.length > 0 && (
                                        <ul className="structure-issues">
                                            {analysis.details.structure.issues.map((issue, i) => (
                                                <li key={i}>{issue}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Job Description Matcher */}
            <div className="job-matcher">
                <button 
                    onClick={() => setShowJobInput(!showJobInput)}
                    className={`job-matcher-toggle ${showJobInput ? 'active' : ''}`}
                >
                    <Target size={16} />
                    {showJobInput ? 'Hide Job Matcher' : 'Match Against Job Posting'}
                </button>

                {showJobInput && (
                    <div className="job-input-area">
                        <label>Paste the job description for precise keyword matching:</label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the complete job description here to get accurate keyword matching and tailored suggestions..."
                            rows={6}
                        />
                        <div className="job-input-footer">
                            <span className="char-count">{jobDescription.length} characters</span>
                            <button 
                                onClick={() => analyzeCV(true)}
                                disabled={!jobDescription.trim() || analyzing}
                                className="match-btn"
                            >
                                {analyzing ? (
                                    <Loader2 className="spinner" size={16} />
                                ) : (
                                    <Zap size={16} />
                                )}
                                Analyze Match
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .ats-analyzer {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 20px;
                }

                .analyzer-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .header-title {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }

                .header-title .icon {
                    color: var(--accent-color, #a855f7);
                    margin-top: 2px;
                }

                .header-title h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #fff;
                    margin: 0;
                }

                .header-subtitle {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin: 2px 0 0 0;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .mode-toggle {
                    display: flex;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 2px;
                }

                .mode-btn {
                    padding: 6px 10px;
                    border: none;
                    background: transparent;
                    color: #6b7280;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .mode-btn:hover {
                    color: #d1d5db;
                }

                .mode-btn.active {
                    background: var(--accent-color, #a855f7);
                    color: white;
                }

                .analyze-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-weight: 500;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .analyze-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3);
                }

                .refresh-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #9ca3af;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .refresh-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .quick-score-bar {
                    position: relative;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    margin-bottom: 20px;
                    overflow: hidden;
                }

                .quick-score-fill {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.5s ease;
                }

                .quick-score-text {
                    position: absolute;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 0.7rem;
                    color: #9ca3af;
                }

                .analyzing-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 40px;
                    color: #9ca3af;
                }

                .analyzing-state .spinner {
                    animation: spin 1s linear infinite;
                    color: var(--accent-color, #a855f7);
                    margin-bottom: 12px;
                }

                .analyzing-mode {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-top: 8px;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .score-display {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    margin-bottom: 20px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                }

                .score-circle {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    flex-shrink: 0;
                }

                .score-inner {
                    width: 100%;
                    height: 100%;
                    background: #1a1a2e;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .score-grade {
                    font-size: 0.7rem;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .score-number {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #fff;
                    line-height: 1;
                }

                .score-label {
                    font-size: 0.65rem;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 2px;
                }

                .score-summary {
                    flex: 1;
                }

                .ats-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .ats-status.ready {
                    background: rgba(34, 197, 94, 0.15);
                    color: #22c55e;
                }

                .ats-status.needs-work {
                    background: rgba(245, 158, 11, 0.15);
                    color: #f59e0b;
                }

                .industry-fit {
                    font-size: 0.85rem;
                    color: #9ca3af;
                    margin: 10px 0 0 0;
                    line-height: 1.5;
                }

                .tabs {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    padding: 4px;
                }

                .tab {
                    flex: 1;
                    padding: 10px 16px;
                    border: none;
                    background: transparent;
                    color: #6b7280;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .tab:hover {
                    color: #d1d5db;
                }

                .tab.active {
                    background: rgba(168, 85, 247, 0.2);
                    color: #a855f7;
                }

                .tab-content {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .section {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    padding: 16px;
                }

                .section.collapsible .section-header {
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0;
                }

                .section.collapsible .section-header:hover h4 {
                    color: #fff;
                }

                .section h4 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #d1d5db;
                    margin: 0 0 12px 0;
                    transition: color 0.2s;
                }

                .section.collapsible .section-header h4 {
                    margin: 0;
                }

                .section h4.success { color: #22c55e; }
                .section h4.warning { color: #f59e0b; }
                .section h4.info { color: #3b82f6; }

                .breakdown-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                    margin-top: 12px;
                }

                .breakdown-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    padding: 12px;
                }

                .breakdown-card-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .breakdown-icon {
                    color: #6b7280;
                }

                .breakdown-label {
                    flex: 1;
                    font-size: 0.85rem;
                    color: #d1d5db;
                }

                .breakdown-value {
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .breakdown-bar-container {
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .breakdown-bar {
                    height: 100%;
                    border-radius: 2px;
                    transition: width 0.5s ease;
                }

                .breakdown-description {
                    font-size: 0.7rem;
                    color: #6b7280;
                    margin: 8px 0 0 0;
                }

                .feedback-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .feedback-list li {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    font-size: 0.85rem;
                    color: #d1d5db;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .feedback-list li:last-child {
                    border-bottom: none;
                }

                .list-icon {
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .feedback-list.success .list-icon { color: #22c55e; }
                .feedback-list.warning .list-icon { color: #f59e0b; }
                .feedback-list.info .list-icon { color: #3b82f6; }

                .keyword-filter {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                }

                .filter-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    color: #9ca3af;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-btn:hover {
                    background: rgba(255, 255, 255, 0.06);
                    color: #d1d5db;
                }

                .filter-btn.active {
                    border-color: var(--accent-color, #a855f7);
                    color: var(--accent-color, #a855f7);
                }

                .filter-btn.found.active {
                    border-color: #22c55e;
                    color: #22c55e;
                    background: rgba(34, 197, 94, 0.1);
                }

                .filter-btn.missing.active {
                    border-color: #f59e0b;
                    color: #f59e0b;
                    background: rgba(245, 158, 11, 0.1);
                }

                .keywords-section .keyword-hint {
                    font-size: 0.8rem;
                    color: #6b7280;
                    margin: 0 0 10px 0;
                }

                .keyword-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .keyword-tag {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    padding: 5px 10px;
                    border-radius: 6px;
                    font-weight: 500;
                }

                .keyword-tag.found {
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    color: #22c55e;
                }

                .keyword-tag.missing {
                    background: rgba(245, 158, 11, 0.1);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                    color: #f59e0b;
                }

                .density-note {
                    font-size: 0.85rem;
                    color: #9ca3af;
                    margin: 0;
                }

                .verb-group {
                    margin: 12px 0;
                }

                .verb-label {
                    display: block;
                    font-size: 0.8rem;
                    margin-bottom: 8px;
                }

                .verb-label.success { color: #22c55e; }
                .verb-label.warning { color: #f59e0b; }

                .verb-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .verb-tag {
                    font-size: 0.75rem;
                    padding: 4px 10px;
                    border-radius: 4px;
                }

                .verb-tag.strong {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                }

                .verb-tag.weak {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                .metrics-count {
                    font-size: 0.85rem;
                    margin: 0 0 10px 0;
                }

                .metrics-count.success { color: #22c55e; }
                .metrics-count.warning { color: #f59e0b; }

                .metrics-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .metric-tag {
                    font-size: 0.75rem;
                    padding: 4px 10px;
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 4px;
                    color: #3b82f6;
                }

                .opportunities {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .opportunities-label {
                    font-size: 0.8rem;
                    color: #f59e0b;
                    margin: 0 0 8px 0;
                }

                .opportunities ul {
                    margin: 0;
                    padding-left: 20px;
                }

                .opportunities li {
                    font-size: 0.85rem;
                    color: #9ca3af;
                    margin: 4px 0;
                }

                .structure-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 8px;
                }

                .structure-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 0.8rem;
                }

                .structure-item.present {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                }

                .structure-item.missing {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                .structure-issues {
                    margin: 12px 0 0 0;
                    padding-left: 20px;
                }

                .structure-issues li {
                    font-size: 0.8rem;
                    color: #f59e0b;
                    margin: 4px 0;
                }

                .job-matcher {
                    margin-top: 20px;
                    padding-top: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .job-matcher-toggle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px dashed rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                    color: #9ca3af;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .job-matcher-toggle:hover,
                .job-matcher-toggle.active {
                    background: rgba(168, 85, 247, 0.1);
                    color: #a855f7;
                    border-color: rgba(168, 85, 247, 0.4);
                }

                .job-input-area {
                    margin-top: 12px;
                }

                .job-input-area label {
                    display: block;
                    font-size: 0.85rem;
                    color: #9ca3af;
                    margin-bottom: 8px;
                }

                .job-input-area textarea {
                    width: 100%;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 0.9rem;
                    resize: vertical;
                    min-height: 120px;
                    font-family: inherit;
                    line-height: 1.5;
                }

                .job-input-area textarea:focus {
                    outline: none;
                    border-color: var(--accent-color, #a855f7);
                }

                .job-input-area textarea::placeholder {
                    color: #6b7280;
                }

                .job-input-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 10px;
                }

                .char-count {
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                .match-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-weight: 500;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .match-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3);
                }

                .match-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .match-btn .spinner {
                    animation: spin 1s linear infinite;
                }

                @media (max-width: 640px) {
                    .score-display {
                        flex-direction: column;
                        text-align: center;
                    }

                    .breakdown-grid {
                        grid-template-columns: 1fr;
                    }

                    .keyword-filter {
                        flex-wrap: wrap;
                    }

                    .analyzer-header {
                        flex-direction: column;
                    }

                    .header-actions {
                        width: 100%;
                        justify-content: space-between;
                    }
                }
            `}</style>
        </div>
    );
}
