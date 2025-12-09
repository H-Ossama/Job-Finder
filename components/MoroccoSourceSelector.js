/**
 * Morocco Job Sources Selector Component
 * Allows users to select/deselect specific Morocco job sources for their search
 */

'use client';
import { useState, useEffect, useRef } from 'react';
import { 
    ChevronDown, 
    Check, 
    Globe2, 
    Building2,
    ExternalLink,
    Info,
    Sparkles
} from 'lucide-react';

// Morocco job sources with metadata
const MOROCCO_SOURCES = [
    {
        id: 'emploi',
        name: 'Emploi.ma',
        nameAr: 'إمبلوي.ما',
        url: 'https://www.emploi.ma',
        description: 'Site généraliste depuis 2002',
        descriptionEn: 'Generalist job board since 2002',
        color: '#0066cc',
        icon: '💼',
        features: ['CDI', 'CDD', 'Stage'],
        category: 'general',
    },
    {
        id: 'dreamjob',
        name: 'Dreamjob.ma',
        nameAr: 'دريم جوب',
        url: 'https://www.dreamjob.ma',
        description: 'Job-board populaire',
        descriptionEn: 'Popular job board',
        color: '#ff6b35',
        icon: '⭐',
        features: ['All sectors', 'Stages'],
        category: 'general',
    },
    {
        id: 'rekrute',
        name: 'Rekrute.com',
        nameAr: 'ريكروت',
        url: 'https://www.rekrute.com',
        description: 'Plateforme de recrutement majeure',
        descriptionEn: 'Major recruitment platform',
        color: '#e31937',
        icon: '🎯',
        features: ['Enterprise', 'Multinationals'],
        category: 'general',
    },
    {
        id: 'marocannonces',
        name: 'MarocAnnonces',
        nameAr: 'ماروك أنونس',
        url: 'https://www.marocannonces.com',
        description: 'Portail d\'annonces avec emploi',
        descriptionEn: 'Classifieds with jobs',
        color: '#28a745',
        icon: '📋',
        features: ['Diverse', 'Local'],
        category: 'general',
    },
    {
        id: 'alwadifa',
        name: 'Alwadifa-Maroc',
        nameAr: 'الوظيفة المغرب',
        url: 'https://alwadifa-maroc.com',
        description: 'Concours et emplois publics',
        descriptionEn: 'Public sector & competitive exams',
        color: '#1e3a5f',
        icon: '🏛️',
        features: ['Concours', 'Public'],
        category: 'public',
    },
    {
        id: 'emploipublic',
        name: 'Emploi-Public.ma',
        nameAr: 'التوظيف العمومي',
        url: 'https://www.emploi-public.ma',
        description: 'Portail emplois publics',
        descriptionEn: 'Official public jobs portal',
        color: '#c41e3a',
        icon: '🇲🇦',
        features: ['Government', 'Ministries'],
        category: 'public',
    },
    {
        id: 'stagiaires',
        name: 'Stagiaires.ma',
        nameAr: 'المتدربين',
        url: 'https://www.stagiaires.ma',
        description: 'Plateforme de stages',
        descriptionEn: 'Internship platform',
        color: '#6b46c1',
        icon: '🎓',
        features: ['PFE', 'Internships'],
        category: 'internship',
    },
];

/**
 * Morocco Source Selector Component
 * @param {Object} props
 * @param {string[]} props.selectedSources - Currently selected source IDs
 * @param {Function} props.onSourcesChange - Callback when sources change
 * @param {boolean} props.disabled - Whether the selector is disabled
 * @param {string} props.language - Display language ('en', 'fr', 'ar')
 */
export default function MoroccoSourceSelector({ 
    selectedSources = [], 
    onSourcesChange,
    disabled = false,
    language = 'en',
    compact = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check if all sources are selected
    const allSelected = selectedSources.length === 0 || 
                        selectedSources.length === MOROCCO_SOURCES.length;

    // Toggle a single source
    const toggleSource = (sourceId) => {
        if (disabled) return;
        
        let newSelected;
        
        if (selectedSources.length === 0) {
            // If "all" was selected, switch to only this source
            newSelected = [sourceId];
        } else if (selectedSources.includes(sourceId)) {
            // Remove this source
            newSelected = selectedSources.filter(id => id !== sourceId);
            // If none left, select all (empty array means all)
            if (newSelected.length === 0) {
                newSelected = [];
            }
        } else {
            // Add this source
            newSelected = [...selectedSources, sourceId];
            // If all selected, clear to "all"
            if (newSelected.length === MOROCCO_SOURCES.length) {
                newSelected = [];
            }
        }
        
        onSourcesChange(newSelected);
    };

    // Select all sources
    const selectAll = () => {
        if (disabled) return;
        onSourcesChange([]);
    };

    // Get display text
    const getDisplayText = () => {
        if (allSelected) {
            return language === 'fr' ? 'Toutes les sources' : 'All Morocco sources';
        }
        
        if (selectedSources.length === 1) {
            const source = MOROCCO_SOURCES.find(s => s.id === selectedSources[0]);
            return source?.name || 'Source';
        }
        
        return `${selectedSources.length} ${language === 'fr' ? 'sources' : 'sources'}`;
    };

    // Get description based on language
    const getDescription = (source) => {
        return language === 'fr' ? source.description : source.descriptionEn;
    };

    if (compact) {
        // Compact mode: just pills
        return (
            <div className="morocco-sources-compact">
                <div className="sources-pills">
                    <button
                        type="button"
                        onClick={selectAll}
                        className={`source-pill ${allSelected ? 'active' : ''}`}
                        disabled={disabled}
                    >
                        <Globe2 className="w-3.5 h-3.5" />
                        {language === 'fr' ? 'Toutes' : 'All'}
                    </button>
                    {MOROCCO_SOURCES.map(source => {
                        const isSelected = selectedSources.length === 0 || 
                                          selectedSources.includes(source.id);
                        return (
                            <button
                                key={source.id}
                                type="button"
                                onClick={() => toggleSource(source.id)}
                                className={`source-pill ${isSelected && selectedSources.length > 0 ? 'active' : ''}`}
                                style={isSelected && selectedSources.length > 0 ? { 
                                    borderColor: source.color,
                                    backgroundColor: `${source.color}20`,
                                } : {}}
                                disabled={disabled}
                            >
                                <span>{source.icon}</span>
                                {source.name.replace('.ma', '').replace('.com', '')}
                            </button>
                        );
                    })}
                </div>

                <style jsx>{`
                    .morocco-sources-compact {
                        width: 100%;
                    }
                    .sources-pills {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                    }
                    .source-pill {
                        display: flex;
                        align-items: center;
                        gap: 0.375rem;
                        padding: 0.375rem 0.75rem;
                        border-radius: 9999px;
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        background: rgba(255, 255, 255, 0.05);
                        color: #9ca3af;
                        font-size: 0.8rem;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .source-pill:hover:not(:disabled) {
                        background: rgba(255, 255, 255, 0.1);
                        color: #d1d5db;
                    }
                    .source-pill.active {
                        border-color: rgba(99, 102, 241, 0.5);
                        background: rgba(99, 102, 241, 0.2);
                        color: #a5b4fc;
                    }
                    .source-pill:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                `}</style>
            </div>
        );
    }

    // Full dropdown mode
    return (
        <div className="morocco-sources-selector" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`selector-trigger ${isOpen ? 'open' : ''}`}
                disabled={disabled}
            >
                <div className="trigger-content">
                    <span className="flag">🇲🇦</span>
                    <span className="text">{getDisplayText()}</span>
                </div>
                <ChevronDown className={`chevron ${isOpen ? 'rotated' : ''}`} />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="selector-dropdown">
                    {/* Header */}
                    <div className="dropdown-header">
                        <h4>
                            <Sparkles className="w-4 h-4" style={{ color: '#fbbf24' }} />
                            {language === 'fr' ? 'Sources d\'emploi Maroc' : 'Morocco Job Sources'}
                        </h4>
                        <p className="header-description">
                            {language === 'fr' 
                                ? 'Sélectionnez les sites à inclure dans votre recherche'
                                : 'Select which sites to include in your search'}
                        </p>
                    </div>

                    {/* Select All Option */}
                    <button
                        type="button"
                        onClick={selectAll}
                        className={`source-option all-option ${allSelected ? 'selected' : ''}`}
                    >
                        <div className="option-check">
                            {allSelected && <Check className="w-4 h-4" />}
                        </div>
                        <div className="option-info">
                            <span className="option-icon">
                                <Globe2 className="w-4 h-4" />
                            </span>
                            <div className="option-text">
                                <span className="option-name">
                                    {language === 'fr' ? 'Toutes les sources' : 'All Sources'}
                                </span>
                                <span className="option-desc">
                                    {language === 'fr' 
                                        ? 'Rechercher sur tous les sites marocains'
                                        : 'Search across all Moroccan job sites'}
                                </span>
                            </div>
                        </div>
                    </button>

                    <div className="divider" />

                    {/* Individual Sources */}
                    <div className="sources-list">
                        {MOROCCO_SOURCES.map(source => {
                            const isSelected = selectedSources.length === 0 || 
                                              selectedSources.includes(source.id);
                            
                            return (
                                <button
                                    key={source.id}
                                    type="button"
                                    onClick={() => toggleSource(source.id)}
                                    className={`source-option ${isSelected ? 'selected' : ''}`}
                                >
                                    <div 
                                        className="option-check"
                                        style={isSelected ? { 
                                            borderColor: source.color,
                                            backgroundColor: source.color,
                                        } : {}}
                                    >
                                        {isSelected && <Check className="w-4 h-4" />}
                                    </div>
                                    <div className="option-info">
                                        <span className="option-icon">{source.icon}</span>
                                        <div className="option-text">
                                            <span className="option-name">{source.name}</span>
                                            <span className="option-desc">{getDescription(source)}</span>
                                        </div>
                                    </div>
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="option-link"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Info */}
                    <div className="dropdown-footer">
                        <Info className="w-3.5 h-3.5" />
                        <span>
                            {language === 'fr' 
                                ? 'Les résultats sont agrégés et dédupliqués'
                                : 'Results are aggregated and deduplicated'}
                        </span>
                    </div>
                </div>
            )}

            <style jsx>{`
                .morocco-sources-selector {
                    position: relative;
                    width: 100%;
                }
                
                .selector-trigger {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: rgba(17, 24, 39, 0.8);
                    border: 1px solid rgba(75, 85, 99, 0.5);
                    border-radius: 12px;
                    color: #d1d5db;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .selector-trigger:hover:not(:disabled) {
                    border-color: rgba(99, 102, 241, 0.5);
                    background: rgba(17, 24, 39, 0.9);
                }
                
                .selector-trigger.open {
                    border-color: rgba(99, 102, 241, 0.7);
                    border-bottom-left-radius: 0;
                    border-bottom-right-radius: 0;
                }
                
                .selector-trigger:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .trigger-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .flag {
                    font-size: 1.1rem;
                }
                
                .text {
                    font-size: 0.9rem;
                }
                
                .chevron {
                    width: 1rem;
                    height: 1rem;
                    color: #6b7280;
                    transition: transform 0.2s ease;
                }
                
                .chevron.rotated {
                    transform: rotate(180deg);
                }
                
                .selector-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: #111827;
                    border: 1px solid rgba(99, 102, 241, 0.5);
                    border-top: none;
                    border-radius: 0 0 12px 12px;
                    z-index: 100;
                    max-height: 400px;
                    overflow-y: auto;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                }
                
                .dropdown-header {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(55, 65, 81, 0.5);
                }
                
                .dropdown-header h4 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #e5e7eb;
                    margin: 0 0 0.25rem 0;
                }
                
                .header-description {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin: 0;
                }
                
                .source-option {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: transparent;
                    border: none;
                    color: #d1d5db;
                    cursor: pointer;
                    text-align: left;
                    transition: background 0.15s ease;
                }
                
                .source-option:hover {
                    background: rgba(99, 102, 241, 0.1);
                }
                
                .source-option.all-option {
                    background: rgba(255, 255, 255, 0.02);
                }
                
                .option-check {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 1.25rem;
                    height: 1.25rem;
                    border: 2px solid #4b5563;
                    border-radius: 4px;
                    margin-right: 0.75rem;
                    color: white;
                    transition: all 0.15s ease;
                }
                
                .source-option.selected .option-check {
                    border-color: #6366f1;
                    background: #6366f1;
                }
                
                .option-info {
                    display: flex;
                    align-items: center;
                    flex: 1;
                    min-width: 0;
                }
                
                .option-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 2rem;
                    height: 2rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    margin-right: 0.75rem;
                    font-size: 1rem;
                }
                
                .option-text {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }
                
                .option-name {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #e5e7eb;
                }
                
                .option-desc {
                    font-size: 0.7rem;
                    color: #6b7280;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .option-link {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 2rem;
                    height: 2rem;
                    color: #6b7280;
                    border-radius: 6px;
                    transition: all 0.15s ease;
                }
                
                .option-link:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #a5b4fc;
                }
                
                .divider {
                    height: 1px;
                    background: rgba(55, 65, 81, 0.5);
                    margin: 0.25rem 0;
                }
                
                .sources-list {
                    padding: 0.25rem 0;
                }
                
                .dropdown-footer {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: rgba(31, 41, 55, 0.5);
                    border-top: 1px solid rgba(55, 65, 81, 0.5);
                    font-size: 0.7rem;
                    color: #6b7280;
                }
            `}</style>
        </div>
    );
}

// Export source data for use elsewhere
export { MOROCCO_SOURCES };
