'use client';

import { useState, useMemo } from 'react';
import { 
    Search, 
    CheckCircle2, 
    XCircle, 
    Target,
    TrendingUp,
    Copy,
    Check
} from 'lucide-react';

/**
 * Keyword Highlighter Component
 * Visually highlights keyword matches between CV and job description
 */
export default function KeywordHighlighter({ 
    cvText = '', 
    jobDescription = '', 
    matchedKeywords = [], 
    missingKeywords = [] 
}) {
    const [activeTab, setActiveTab] = useState('job'); // 'job' or 'cv'
    const [copiedKeyword, setCopiedKeyword] = useState(null);

    // Highlight keywords in text
    const highlightText = useMemo(() => {
        return (text, highlightMatched = true) => {
            if (!text) return '';
            
            let result = text;
            const allKeywords = [...matchedKeywords, ...missingKeywords];
            
            // Sort keywords by length (longest first) to avoid partial replacements
            const sortedKeywords = allKeywords.sort((a, b) => b.length - a.length);
            
            sortedKeywords.forEach(keyword => {
                const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
                const isMatched = matchedKeywords.some(k => k.toLowerCase() === keyword.toLowerCase());
                const className = isMatched ? 'highlight-found' : 'highlight-missing';
                
                if (highlightMatched || !isMatched) {
                    result = result.replace(regex, `<span class="${className}">$1</span>`);
                }
            });
            
            return result;
        };
    }, [matchedKeywords, missingKeywords]);

    const escapeRegex = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const handleCopyKeyword = async (keyword) => {
        try {
            await navigator.clipboard.writeText(keyword);
            setCopiedKeyword(keyword);
            setTimeout(() => setCopiedKeyword(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const matchPercentage = useMemo(() => {
        const total = matchedKeywords.length + missingKeywords.length;
        if (total === 0) return 0;
        return Math.round((matchedKeywords.length / total) * 100);
    }, [matchedKeywords, missingKeywords]);

    return (
        <div className="keyword-highlighter">
            {/* Match Summary */}
            <div className="match-summary">
                <div className="match-circle">
                    <svg viewBox="0 0 36 36" className="match-progress">
                        <path
                            className="progress-bg"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="progress-fill"
                            strokeDasharray={`${matchPercentage}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <span className="match-percentage">{matchPercentage}%</span>
                </div>
                <div className="match-details">
                    <h4>Keyword Match</h4>
                    <div className="match-stats">
                        <span className="stat found">
                            <CheckCircle2 size={14} />
                            {matchedKeywords.length} Found
                        </span>
                        <span className="stat missing">
                            <XCircle size={14} />
                            {missingKeywords.length} Missing
                        </span>
                    </div>
                </div>
            </div>

            {/* Keyword Lists */}
            <div className="keyword-lists">
                {/* Found Keywords */}
                <div className="keyword-list found">
                    <h5>
                        <CheckCircle2 size={14} />
                        Keywords Found in Your CV
                    </h5>
                    <div className="keywords-grid">
                        {matchedKeywords.length > 0 ? (
                            matchedKeywords.map((keyword, i) => (
                                <span 
                                    key={i} 
                                    className="keyword-chip found"
                                    title="This keyword is in your CV"
                                >
                                    {keyword}
                                </span>
                            ))
                        ) : (
                            <p className="no-keywords">No keywords matched yet</p>
                        )}
                    </div>
                </div>

                {/* Missing Keywords */}
                <div className="keyword-list missing">
                    <h5>
                        <XCircle size={14} />
                        Keywords to Add
                    </h5>
                    <div className="keywords-grid">
                        {missingKeywords.length > 0 ? (
                            missingKeywords.map((keyword, i) => (
                                <span 
                                    key={i} 
                                    className="keyword-chip missing"
                                    onClick={() => handleCopyKeyword(keyword)}
                                    title="Click to copy"
                                >
                                    {keyword}
                                    {copiedKeyword === keyword ? (
                                        <Check size={12} className="copy-icon" />
                                    ) : (
                                        <Copy size={12} className="copy-icon" />
                                    )}
                                </span>
                            ))
                        ) : (
                            <p className="no-keywords success">All keywords covered!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Text Preview with Highlighting */}
            {(cvText || jobDescription) && (
                <div className="text-preview-section">
                    <div className="preview-tabs">
                        <button 
                            className={`preview-tab ${activeTab === 'job' ? 'active' : ''}`}
                            onClick={() => setActiveTab('job')}
                        >
                            <Target size={14} />
                            Job Description
                        </button>
                        <button 
                            className={`preview-tab ${activeTab === 'cv' ? 'active' : ''}`}
                            onClick={() => setActiveTab('cv')}
                        >
                            <TrendingUp size={14} />
                            Your CV
                        </button>
                    </div>

                    <div className="text-preview">
                        {activeTab === 'job' && jobDescription && (
                            <div 
                                className="preview-content"
                                dangerouslySetInnerHTML={{ 
                                    __html: highlightText(jobDescription, true) 
                                }}
                            />
                        )}
                        {activeTab === 'cv' && cvText && (
                            <div 
                                className="preview-content"
                                dangerouslySetInnerHTML={{ 
                                    __html: highlightText(cvText, true) 
                                }}
                            />
                        )}
                        {((activeTab === 'job' && !jobDescription) || (activeTab === 'cv' && !cvText)) && (
                            <p className="no-content">No content available</p>
                        )}
                    </div>

                    <div className="legend">
                        <span className="legend-item found">
                            <span className="legend-color"></span>
                            Found in CV
                        </span>
                        <span className="legend-item missing">
                            <span className="legend-color"></span>
                            Missing from CV
                        </span>
                    </div>
                </div>
            )}

            {/* Suggestions */}
            <div className="suggestions-section">
                <h5>
                    <Search size={14} />
                    Quick Tips
                </h5>
                <ul>
                    <li>Click on missing keywords to copy them</li>
                    <li>Add keywords naturally in context, not just as a list</li>
                    <li>Use exact terminology from the job description</li>
                    <li>Include keywords in your summary, skills, and experience sections</li>
                </ul>
            </div>

            <style jsx>{`
                .keyword-highlighter {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .match-summary {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .match-circle {
                    position: relative;
                    width: 70px;
                    height: 70px;
                    flex-shrink: 0;
                }

                .match-progress {
                    width: 100%;
                    height: 100%;
                    transform: rotate(-90deg);
                }

                .progress-bg {
                    fill: none;
                    stroke: rgba(255, 255, 255, 0.1);
                    stroke-width: 3;
                }

                .progress-fill {
                    fill: none;
                    stroke: #22c55e;
                    stroke-width: 3;
                    stroke-linecap: round;
                    transition: stroke-dasharray 0.5s ease;
                }

                .match-percentage {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 1rem;
                    font-weight: 700;
                    color: #fff;
                }

                .match-details h4 {
                    margin: 0 0 8px 0;
                    font-size: 1rem;
                    color: #fff;
                }

                .match-stats {
                    display: flex;
                    gap: 16px;
                }

                .stat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                }

                .stat.found { color: #22c55e; }
                .stat.missing { color: #f59e0b; }

                .keyword-lists {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .keyword-list {
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .keyword-list h5 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 0 12px 0;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .keyword-list.found h5 { color: #22c55e; }
                .keyword-list.missing h5 { color: #f59e0b; }

                .keywords-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .keyword-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 5px 10px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .keyword-chip.found {
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    color: #22c55e;
                }

                .keyword-chip.missing {
                    background: rgba(245, 158, 11, 0.1);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                    color: #f59e0b;
                    cursor: pointer;
                }

                .keyword-chip.missing:hover {
                    background: rgba(245, 158, 11, 0.2);
                    transform: translateY(-1px);
                }

                .copy-icon {
                    opacity: 0.6;
                    transition: opacity 0.2s;
                }

                .keyword-chip:hover .copy-icon {
                    opacity: 1;
                }

                .no-keywords {
                    font-size: 0.8rem;
                    color: #6b7280;
                    margin: 0;
                }

                .no-keywords.success {
                    color: #22c55e;
                }

                .text-preview-section {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    overflow: hidden;
                }

                .preview-tabs {
                    display: flex;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .preview-tab {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    border: none;
                    background: transparent;
                    color: #6b7280;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .preview-tab:hover {
                    color: #d1d5db;
                    background: rgba(255, 255, 255, 0.02);
                }

                .preview-tab.active {
                    color: var(--accent-color, #a855f7);
                    background: rgba(168, 85, 247, 0.1);
                }

                .text-preview {
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 16px;
                }

                .preview-content {
                    font-size: 0.85rem;
                    line-height: 1.7;
                    color: #d1d5db;
                    white-space: pre-wrap;
                }

                .preview-content :global(.highlight-found) {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                    padding: 1px 4px;
                    border-radius: 3px;
                    font-weight: 500;
                }

                .preview-content :global(.highlight-missing) {
                    background: rgba(245, 158, 11, 0.2);
                    color: #f59e0b;
                    padding: 1px 4px;
                    border-radius: 3px;
                    font-weight: 500;
                }

                .no-content {
                    color: #6b7280;
                    font-size: 0.85rem;
                    text-align: center;
                    margin: 0;
                }

                .legend {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.75rem;
                    color: #9ca3af;
                }

                .legend-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                }

                .legend-item.found .legend-color {
                    background: rgba(34, 197, 94, 0.3);
                    border: 1px solid #22c55e;
                }

                .legend-item.missing .legend-color {
                    background: rgba(245, 158, 11, 0.3);
                    border: 1px solid #f59e0b;
                }

                .suggestions-section {
                    padding: 16px;
                    background: rgba(168, 85, 247, 0.05);
                    border-radius: 12px;
                    border: 1px solid rgba(168, 85, 247, 0.2);
                }

                .suggestions-section h5 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 0 12px 0;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--accent-color, #a855f7);
                }

                .suggestions-section ul {
                    margin: 0;
                    padding-left: 20px;
                }

                .suggestions-section li {
                    font-size: 0.8rem;
                    color: #9ca3af;
                    margin: 6px 0;
                    line-height: 1.5;
                }

                @media (max-width: 640px) {
                    .keyword-lists {
                        grid-template-columns: 1fr;
                    }

                    .match-stats {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .legend {
                        flex-direction: column;
                        gap: 8px;
                    }
                }
            `}</style>
        </div>
    );
}
