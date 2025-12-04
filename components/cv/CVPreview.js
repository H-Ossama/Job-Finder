'use client';

import { useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';

/**
 * Dynamically import templates to reduce initial bundle size
 * This prevents the 1.95MB page data error
 */
const ModernTemplate = dynamic(() => import('./templates/ModernTemplate'), { ssr: false });
const CreativeTemplate = dynamic(() => import('./templates/CreativeTemplate'), { ssr: false });
const MinimalistTemplate = dynamic(() => import('./templates/MinimalistTemplate'), { ssr: false });
const ExecutiveTemplate = dynamic(() => import('./templates/ExecutiveTemplate'), { ssr: false });
const TechTemplate = dynamic(() => import('./templates/TechTemplate'), { ssr: false });
const AwesomeTemplate = dynamic(() => import('./templates/AwesomeTemplate'), { ssr: false });
const PikachuTemplate = dynamic(() => import('./templates/PikachuTemplate'), { ssr: false });
const OnyxTemplate = dynamic(() => import('./templates/OnyxTemplate'), { ssr: false });
const AzurillTemplate = dynamic(() => import('./templates/AzurillTemplate'), { ssr: false });

/**
 * Template Component Map
 * Maps template IDs to their React components
 */
const TEMPLATE_MAP = {
    // Original templates
    modern: ModernTemplate,
    creative: CreativeTemplate,
    minimalist: MinimalistTemplate,
    executive: ExecutiveTemplate,
    tech: TechTemplate,
    // New templates (inspired by Awesome-CV and Reactive Resume)
    awesome: AwesomeTemplate,
    pikachu: PikachuTemplate,
    onyx: OnyxTemplate,
    azurill: AzurillTemplate
};

/**
 * Paper sizes in pixels at 96 DPI
 */
const PAPER_SIZES = {
    letter: { width: 816, height: 1056 }, // 8.5 x 11 inches
    a4: { width: 794, height: 1123 }      // 210 x 297 mm
};

/**
 * CV Preview Component
 * Renders a CV with the selected template style
 */
export default function CVPreview({ 
    cvData, 
    templateId = 'modern', 
    scale = 1,
    paperSize = 'letter',
    resumeSettings = {},
    sectionOrder = []
}) {
    // Get the appropriate template component
    const TemplateComponent = useMemo(() => {
        return TEMPLATE_MAP[templateId] || TEMPLATE_MAP.modern;
    }, [templateId]);

    // Get paper dimensions
    const paper = PAPER_SIZES[paperSize] || PAPER_SIZES.letter;

    // Merge resume settings with defaults
    const settings = {
        fontFamily: resumeSettings.fontFamily || 'Roboto',
        fontSize: resumeSettings.fontSize || 'standard',
        customFontSize: resumeSettings.customFontSize || null,
        themeColor: resumeSettings.themeColor || '#ef4444',
        ...resumeSettings
    };

    // Font size multipliers - support custom font size
    let fontSizeMultiplier;
    if (settings.customFontSize && settings.fontSize === 'custom') {
        // Custom font size: base is 11pt = 1em, so calculate ratio
        fontSizeMultiplier = settings.customFontSize / 11;
    } else {
        fontSizeMultiplier = {
            compact: 0.82,    // ~9pt
            standard: 1,      // ~11pt
            large: 1.18       // ~13pt
        }[settings.fontSize] || 1;
    }

    // Filter cvData based on sectionOrder visibility
    const filteredCvData = useMemo(() => {
        if (!sectionOrder || sectionOrder.length === 0) return cvData;
        
        // Create a map of section visibility
        const visibilityMap = {};
        sectionOrder.forEach(section => {
            visibilityMap[section.id] = section.visible !== false;
        });

        return {
            ...cvData,
            // Hide summary if not visible
            summary: visibilityMap.summary !== false ? cvData.summary : '',
            // Hide experience if not visible
            experience: visibilityMap.experience !== false ? cvData.experience : [],
            // Hide education if not visible
            education: visibilityMap.education !== false ? cvData.education : [],
            // Hide skills if not visible
            skills: visibilityMap.skills !== false ? cvData.skills : { technical: [], soft: [], languages: [], certifications: [] },
            // Hide projects if not visible
            projects: visibilityMap.projects !== false ? cvData.projects : [],
            // Hide certifications if not visible
            certifications: visibilityMap.certifications !== false ? cvData.certifications : []
        };
    }, [cvData, sectionOrder]);

    // Loading placeholder component
    const LoadingPlaceholder = () => (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            minHeight: '400px',
            color: '#999',
            fontSize: '14px'
        }}>
            Loading template...
        </div>
    );

    return (
        <div 
            className="cv-preview-container"
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: scale !== 1 ? `${100 / scale}%` : '100%',
                fontFamily: `"${settings.fontFamily}", -apple-system, BlinkMacSystemFont, sans-serif`,
                fontSize: `${fontSizeMultiplier}em`,
                '--theme-color': settings.themeColor
            }}
        >
            <div 
                className="cv-document"
                style={{
                    width: `${paper.width}px`,
                    minHeight: `${paper.height}px`
                }}
            >
                <Suspense fallback={<LoadingPlaceholder />}>
                    <TemplateComponent 
                        cvData={filteredCvData} 
                        themeColor={settings.themeColor}
                        fontFamily={settings.fontFamily}
                        sectionOrder={sectionOrder}
                    />
                </Suspense>
            </div>

            <style jsx>{`
                .cv-preview-container {
                    background: #f8f9fa;
                    border-radius: 0;
                    overflow: hidden;
                }
                .cv-document {
                    background: white;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    box-sizing: border-box;
                }
                @media print {
                    .cv-preview-container {
                        background: white;
                        border-radius: 0;
                        transform: none !important;
                        width: 100% !important;
                    }
                    .cv-document {
                        box-shadow: none;
                        width: 100% !important;
                        min-height: auto !important;
                    }
                }
            `}</style>
        </div>
    );
}
