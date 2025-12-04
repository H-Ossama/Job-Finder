'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
    ZoomIn, 
    ZoomOut, 
    Maximize2, 
    Download,
    Check,
    Move
} from 'lucide-react';
import CVPreview from './CVPreview';

/**
 * Paper sizes in pixels at 96 DPI
 * Letter: 8.5 x 11 inches = 816 x 1056 pixels
 * A4: 210 x 297 mm = 794 x 1123 pixels
 */
const PAPER_SIZES = {
    letter: { width: 816, height: 1056, label: 'Letter (US, Canada)' },
    a4: { width: 794, height: 1123, label: 'A4 (other countries)' }
};

/**
 * Live Preview Panel Component
 * Professional CV preview with zoom, autoscale, and paper size options
 */
export default function LivePreviewPanel({ 
    cvData, 
    templateId, 
    paperSize = 'letter',
    resumeSettings = {},
    onPaperSizeChange,
    showControls = true,
    sectionOrder = [],
    fitToScreen = false
}) {
    const containerRef = useRef(null);
    const paperRef = useRef(null);
    const [zoom, setZoom] = useState(65);
    const [autoscale, setAutoscale] = useState(true);
    const [containerWidth, setContainerWidth] = useState(0);
    
    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

    // Calculate zoom based on container size for autoscale
    const calculateAutoZoom = useCallback(() => {
        if (!containerRef.current) return 65;
        const container = containerRef.current;
        const padding = 48; // padding on both sides
        const availableWidth = container.clientWidth - padding;
        const availableHeight = container.clientHeight - padding;
        const paperWidth = PAPER_SIZES[paperSize].width;
        const paperHeight = PAPER_SIZES[paperSize].height;
        
        // Calculate zoom to fit width
        const zoomByWidth = Math.floor((availableWidth / paperWidth) * 100);
        
        // If fitToScreen is enabled, also consider height and use the smaller zoom
        if (fitToScreen && availableHeight > 0) {
            const zoomByHeight = Math.floor((availableHeight / paperHeight) * 100);
            const autoZoom = Math.min(zoomByWidth, zoomByHeight, 100);
            return Math.max(30, autoZoom);
        }
        
        const autoZoom = Math.min(100, zoomByWidth);
        return Math.max(30, autoZoom);
    }, [paperSize, fitToScreen]);

    // Update container width on resize
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
                if (autoscale) {
                    setZoom(calculateAutoZoom());
                }
            }
        };

        updateWidth();
        const resizeObserver = new ResizeObserver(updateWidth);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [autoscale, calculateAutoZoom]);

    // Handle autoscale toggle
    const toggleAutoscale = () => {
        const newAutoscale = !autoscale;
        setAutoscale(newAutoscale);
        if (newAutoscale) {
            setZoom(calculateAutoZoom());
        }
    };

    // Handle zoom change
    const handleZoomChange = (newZoom) => {
        setAutoscale(false);
        setZoom(Math.min(150, Math.max(30, newZoom)));
    };

    // Handle zoom with step (for buttons)
    const handleZoomStep = (direction) => {
        const step = 5; // Less sensitive step
        const newZoom = direction === 'in' ? zoom + step : zoom - step;
        handleZoomChange(newZoom);
    };

    // Drag handlers for panning when zoomed
    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setScrollStart({ 
            x: containerRef.current?.scrollLeft || 0, 
            y: containerRef.current?.scrollTop || 0 
        });
        e.preventDefault();
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !containerRef.current) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        containerRef.current.scrollLeft = scrollStart.x - dx;
        containerRef.current.scrollTop = scrollStart.y - dy;
    }, [isDragging, dragStart, scrollStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Add global mouse event listeners for drag
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Get paper dimensions
    const paper = PAPER_SIZES[paperSize];
    const scaledWidth = (paper.width * zoom) / 100;
    const scaledHeight = (paper.height * zoom) / 100;

    // Download PDF
    const handleDownload = () => {
        window.print();
    };

    return (
        <div className="live-preview-panel">
            {/* Preview Area */}
            <div 
                className={`preview-area ${isDragging ? 'dragging' : ''}`} 
                ref={containerRef}
                onMouseDown={handleMouseDown}
            >
                <div 
                    className="paper-container"
                    ref={paperRef}
                >
                    <div 
                        className="paper-wrapper"
                        style={{
                            width: `${scaledWidth}px`,
                            height: `${scaledHeight}px`,
                        }}
                    >
                        <div 
                            className="paper-document"
                            style={{
                                width: `${paper.width}px`,
                                height: `${paper.height}px`,
                                transform: `scale(${zoom / 100})`,
                                transformOrigin: 'top left'
                            }}
                        >
                            <CVPreview 
                                cvData={cvData} 
                                templateId={templateId}
                                paperSize={paperSize}
                                resumeSettings={resumeSettings}
                                sectionOrder={sectionOrder}
                                scale={1}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls Bar */}
            {showControls && (
                <div className="controls-bar">
                    <div className="controls-left">
                        {/* Zoom Controls */}
                        <button 
                            className="control-btn"
                            onClick={() => handleZoomStep('out')}
                            disabled={zoom <= 30}
                            title="Zoom Out"
                        >
                            <ZoomOut size={18} />
                        </button>
                        
                        <div className="zoom-slider-container">
                            <input
                                type="range"
                                min="30"
                                max="150"
                                step="5"
                                value={zoom}
                                onChange={(e) => handleZoomChange(parseInt(e.target.value))}
                                className="zoom-slider"
                            />
                        </div>
                        
                        <span className="zoom-value">{zoom}%</span>
                        
                        <button 
                            className="control-btn"
                            onClick={() => handleZoomStep('in')}
                            disabled={zoom >= 150}
                            title="Zoom In"
                        >
                            <ZoomIn size={18} />
                        </button>

                        {/* Autoscale Toggle */}
                        <label className="autoscale-toggle">
                            <input
                                type="checkbox"
                                checked={autoscale}
                                onChange={toggleAutoscale}
                            />
                            <span className="autoscale-checkmark">
                                {autoscale && <Check size={12} />}
                            </span>
                            <span className="autoscale-label">Autoscale</span>
                        </label>

                        {/* Drag hint */}
                        <div className="drag-hint">
                            <Move size={14} />
                            <span>Drag to pan</span>
                        </div>
                    </div>

                </div>
            )}

            <style jsx>{`
                .live-preview-panel {
                    display: flex;
                    flex-direction: column;
                    background: #1a1a2e;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    height: 100%;
                }

                .preview-area {
                    flex: 1;
                    overflow: auto;
                    padding: 24px;
                    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%);
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    min-height: 0;
                    cursor: grab;
                    user-select: none;
                }

                .preview-area.dragging {
                    cursor: grabbing;
                }

                .paper-container {
                    display: flex;
                    justify-content: center;
                    padding: 20px;
                }

                .paper-wrapper {
                    background: white;
                    box-shadow: 
                        0 4px 6px rgba(0, 0, 0, 0.1),
                        0 10px 40px rgba(0, 0, 0, 0.3),
                        0 0 0 1px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    flex-shrink: 0;
                    border-radius: 4px;
                }

                .paper-document {
                    background: white;
                    overflow: hidden;
                }

                .controls-bar {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .controls-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .control-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #9ca3af;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .control-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .control-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .zoom-slider-container {
                    width: 120px;
                }

                .zoom-slider {
                    width: 100%;
                    height: 4px;
                    appearance: none;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                    outline: none;
                    cursor: pointer;
                }

                .zoom-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                    transition: transform 0.2s ease;
                }

                .zoom-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }

                .zoom-slider::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                }

                .zoom-value {
                    font-size: 0.8rem;
                    color: #9ca3af;
                    min-width: 40px;
                    text-align: center;
                }

                .autoscale-toggle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    padding-left: 12px;
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                }

                .autoscale-toggle input {
                    position: absolute;
                    opacity: 0;
                    cursor: pointer;
                    height: 0;
                    width: 0;
                }

                .autoscale-checkmark {
                    width: 18px;
                    height: 18px;
                    border-radius: 4px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    transition: all 0.2s ease;
                }

                .autoscale-toggle input:checked ~ .autoscale-checkmark {
                    background: var(--accent-color, #a855f7);
                    border-color: var(--accent-color, #a855f7);
                }

                .autoscale-label {
                    font-size: 0.8rem;
                    color: #9ca3af;
                }

                .drag-hint {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding-left: 12px;
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                    color: #6b7280;
                    font-size: 0.75rem;
                }

                @media (max-width: 768px) {
                    .controls-bar {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .controls-left {
                        width: 100%;
                        justify-content: center;
                        flex-wrap: wrap;
                    }

                    .zoom-slider-container {
                        width: 80px;
                    }

                    .drag-hint {
                        display: none;
                    }
                }

                @media print {
                    .live-preview-panel {
                        background: white;
                        border: none;
                    }

                    .preview-area {
                        background: white;
                        padding: 0;
                    }

                    .controls-bar {
                        display: none;
                    }

                    .paper-wrapper {
                        box-shadow: none;
                        width: 100% !important;
                        height: auto !important;
                    }

                    .paper-document {
                        transform: none !important;
                        width: 100% !important;
                        height: auto !important;
                    }
                }
            `}</style>
        </div>
    );
}
