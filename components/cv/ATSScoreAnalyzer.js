'use client';

import { useState } from 'react';
import { 
    Target, 
    TrendingUp, 
    AlertCircle, 
    CheckCircle, 
    Loader2,
    Lightbulb,
    Zap,
    RefreshCw
} from 'lucide-react';

/**
 * ATS Score Analyzer Component
 * Displays ATS compatibility score and suggestions
 */
export default function ATSScoreAnalyzer({ cvData, onAnalyze, initialScore = null }) {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(initialScore ? { score: initialScore } : null);
    const [jobDescription, setJobDescription] = useState('');
    const [showJobInput, setShowJobInput] = useState(false);

    const analyzeCV = async (withJobDescription = false) => {
        setAnalyzing(true);
        try {
            const response = await fetch('/api/cv/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'ats-analyze',
                    cvData,
                    jobDescription: withJobDescription ? jobDescription : null
                })
            });

            const result = await response.json();
            if (result.success) {
                setAnalysis(result.analysis);
                if (onAnalyze) {
                    onAnalyze(result.analysis);
                }
            }
        } catch (error) {
            console.error('Error analyzing CV:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        return 'Needs Improvement';
    };

    return (
        <div className="ats-analyzer">
            <div className="analyzer-header">
                <div className="header-title">
                    <Target className="icon" />
                    <h3>ATS Compatibility</h3>
                </div>
                {!analysis && !analyzing && (
                    <button 
                        onClick={() => analyzeCV(false)} 
                        className="analyze-btn"
                    >
                        <Zap size={16} />
                        Analyze Now
                    </button>
                )}
                {analysis && !analyzing && (
                    <button 
                        onClick={() => analyzeCV(showJobInput && jobDescription)} 
                        className="refresh-btn"
                    >
                        <RefreshCw size={14} />
                        Re-analyze
                    </button>
                )}
            </div>

            {analyzing && (
                <div className="analyzing-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Analyzing your CV for ATS compatibility...</p>
                </div>
            )}

            {analysis && !analyzing && (
                <>
                    {/* Main Score */}
                    <div className="score-display">
                        <div 
                            className="score-circle"
                            style={{ 
                                background: `conic-gradient(${getScoreColor(analysis.score)} ${analysis.score * 3.6}deg, rgba(255,255,255,0.1) 0deg)` 
                            }}
                        >
                            <div className="score-inner">
                                <span className="score-number">{analysis.score}</span>
                                <span className="score-label">{getScoreLabel(analysis.score)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Score Breakdown */}
                    {analysis.breakdown && (
                        <div className="score-breakdown">
                            <h4>Score Breakdown</h4>
                            <div className="breakdown-items">
                                {Object.entries(analysis.breakdown).map(([key, value]) => (
                                    <div key={key} className="breakdown-item">
                                        <div className="breakdown-header">
                                            <span className="breakdown-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                            <span className="breakdown-value">{value}%</span>
                                        </div>
                                        <div className="breakdown-bar">
                                            <div 
                                                className="breakdown-fill"
                                                style={{ 
                                                    width: `${value}%`,
                                                    background: getScoreColor(value)
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Strengths */}
                    {analysis.strengths?.length > 0 && (
                        <div className="section strengths">
                            <h4>
                                <CheckCircle size={16} />
                                Strengths
                            </h4>
                            <ul>
                                {analysis.strengths.map((strength, i) => (
                                    <li key={i}>{strength}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Missing Keywords */}
                    {analysis.missingKeywords?.length > 0 && (
                        <div className="section keywords">
                            <h4>
                                <AlertCircle size={16} />
                                Missing Keywords
                            </h4>
                            <div className="keyword-tags">
                                {analysis.missingKeywords.map((keyword, i) => (
                                    <span key={i} className="keyword-tag">{keyword}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    {analysis.suggestions?.length > 0 && (
                        <div className="section suggestions">
                            <h4>
                                <Lightbulb size={16} />
                                Suggestions to Improve
                            </h4>
                            <ul>
                                {analysis.suggestions.map((suggestion, i) => (
                                    <li key={i}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Improvements */}
                    {analysis.improvements?.length > 0 && (
                        <div className="section improvements">
                            <h4>
                                <TrendingUp size={16} />
                                Areas for Improvement
                            </h4>
                            <ul>
                                {analysis.improvements.map((improvement, i) => (
                                    <li key={i}>{improvement}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}

            {/* Job Description Matcher */}
            <div className="job-matcher">
                <button 
                    onClick={() => setShowJobInput(!showJobInput)}
                    className="job-matcher-toggle"
                >
                    <Target size={16} />
                    {showJobInput ? 'Hide Job Matcher' : 'Match to Job Posting'}
                </button>

                {showJobInput && (
                    <div className="job-input-area">
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste a job description here to see how well your CV matches..."
                            rows={4}
                        />
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
                )}
            </div>

            <style jsx>{`
                .ats-analyzer {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 20px;
                }

                .analyzer-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .header-title .icon {
                    color: var(--accent-color, #a855f7);
                }

                .header-title h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #fff;
                    margin: 0;
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
                    gap: 6px;
                    padding: 8px 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #d1d5db;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .refresh-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
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

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .score-display {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 24px;
                }

                .score-circle {
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
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

                .score-number {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #fff;
                }

                .score-label {
                    font-size: 0.75rem;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .score-breakdown {
                    margin-bottom: 20px;
                }

                .score-breakdown h4 {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #d1d5db;
                    margin-bottom: 12px;
                }

                .breakdown-items {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .breakdown-item {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 8px;
                    padding: 10px 12px;
                }

                .breakdown-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 6px;
                }

                .breakdown-label {
                    font-size: 0.85rem;
                    color: #9ca3af;
                }

                .breakdown-value {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #fff;
                }

                .breakdown-bar {
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .breakdown-fill {
                    height: 100%;
                    border-radius: 2px;
                    transition: width 0.5s ease;
                }

                .section {
                    margin-bottom: 16px;
                    padding: 14px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }

                .section h4 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 10px;
                }

                .strengths h4 { color: #22c55e; }
                .keywords h4 { color: #f59e0b; }
                .suggestions h4 { color: #a855f7; }
                .improvements h4 { color: #3b82f6; }

                .section ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .section li {
                    font-size: 0.85rem;
                    color: #d1d5db;
                    padding: 6px 0;
                    padding-left: 16px;
                    position: relative;
                }

                .section li::before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: #6b7280;
                }

                .keyword-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .keyword-tag {
                    font-size: 0.75rem;
                    padding: 4px 10px;
                    background: rgba(245, 158, 11, 0.1);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                    border-radius: 6px;
                    color: #f59e0b;
                }

                .job-matcher {
                    margin-top: 20px;
                    padding-top: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .job-matcher-toggle {
                    display: flex;
                    align-items: center;
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

                .job-matcher-toggle:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    border-color: var(--accent-color, #a855f7);
                }

                .job-input-area {
                    margin-top: 12px;
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
                    min-height: 100px;
                    font-family: inherit;
                }

                .job-input-area textarea:focus {
                    outline: none;
                    border-color: var(--accent-color, #a855f7);
                }

                .job-input-area textarea::placeholder {
                    color: #6b7280;
                }

                .match-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    width: 100%;
                    margin-top: 10px;
                    padding: 12px;
                    background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-weight: 500;
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
            `}</style>
        </div>
    );
}
