'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Palestine Support Component
 * A floating icon that shows a support message for Palestine
 * - Draggable to any position
 * - Position saved to localStorage
 * - Click only to open (no hover)
 */
export default function PalestineSupport() {
    const [isOpen, setIsOpen] = useState(false);
    const [watermelons, setWatermelons] = useState([]);
    const [position, setPosition] = useState({ x: 24, y: null }); // x from left, y from bottom
    const [isDragging, setIsDragging] = useState(false);
    const [isActuallyDragging, setIsActuallyDragging] = useState(false); // For visual feedback
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // Track initial click position
    const hasMovedRef = useRef(false); // Use ref to avoid stale closure issues
    const DRAG_THRESHOLD = 10; // Pixels to move before considering it a drag
    
    const panelRef = useRef(null);
    const buttonRef = useRef(null);

    // Load saved position from localStorage
    useEffect(() => {
        const savedPosition = localStorage.getItem('palestine_support_position');
        if (savedPosition) {
            try {
                const parsed = JSON.parse(savedPosition);
                setPosition(parsed);
            } catch (e) {
                // Use default position
                setPosition({ x: 24, y: 24 });
            }
        } else {
            setPosition({ x: 24, y: 24 });
        }
    }, []);

    // Save position to localStorage when it changes
    useEffect(() => {
        if (position.y !== null) {
            localStorage.setItem('palestine_support_position', JSON.stringify(position));
        }
    }, [position]);

    // Close panel when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                panelRef.current && 
                !panelRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate watermelon animation when panel opens
    useEffect(() => {
        if (isOpen) {
            const newWatermelons = Array.from({ length: 8 }, (_, i) => ({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 2,
                duration: 3 + Math.random() * 2,
            }));
            setWatermelons(newWatermelons);
        }
    }, [isOpen]);

    // Handle drag start
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        hasMovedRef.current = false;
        setStartPos({ x: e.clientX, y: e.clientY });
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - (window.innerHeight - position.y - 48), // 48 is button height
        });
    };

    // Handle touch start for mobile
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        setIsDragging(true);
        hasMovedRef.current = false;
        setStartPos({ x: touch.clientX, y: touch.clientY });
        setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - (window.innerHeight - position.y - 48),
        });
    };

    // Handle drag move
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            // Check if we've moved beyond threshold before considering it a drag
            const dx = Math.abs(e.clientX - startPos.x);
            const dy = Math.abs(e.clientY - startPos.y);
            
            if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
                hasMovedRef.current = true;
                setIsActuallyDragging(true);
                const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragStart.x));
                const newY = Math.max(0, Math.min(window.innerHeight - 60, window.innerHeight - e.clientY + dragStart.y - 48));
                setPosition({ x: newX, y: newY });
            }
        };

        const handleTouchMove = (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            // Check if we've moved beyond threshold before considering it a drag
            const dx = Math.abs(touch.clientX - startPos.x);
            const dy = Math.abs(touch.clientY - startPos.y);
            
            if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
                hasMovedRef.current = true;
                setIsActuallyDragging(true);
                const newX = Math.max(0, Math.min(window.innerWidth - 60, touch.clientX - dragStart.x));
                const newY = Math.max(0, Math.min(window.innerHeight - 60, window.innerHeight - touch.clientY + dragStart.y - 48));
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            // Small delay to let click event check hasMovedRef
            setTimeout(() => {
                setIsDragging(false);
                setIsActuallyDragging(false);
            }, 10);
        };

        const handleTouchEnd = () => {
            // For touch, toggle immediately if not moved
            if (!hasMovedRef.current) {
                setIsOpen(prev => !prev);
            }
            setIsDragging(false);
            setIsActuallyDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, dragStart, startPos]);

    // Handle click (only toggle if not dragged)
    const handleClick = (e) => {
        e.stopPropagation();
        if (!hasMovedRef.current) {
            setIsOpen(prev => !prev);
        }
    };

    // Calculate panel position based on button position
    const getPanelStyle = () => {
        const panelWidth = 320;
        const panelHeight = 450;
        const buttonSize = 48;
        
        // Determine if panel should open above or below
        const openAbove = position.y < panelHeight + 20;
        
        // Determine if panel should open to left or right
        const openLeft = position.x > window.innerWidth - panelWidth - 20;
        
        return {
            bottom: openAbove ? `${position.y + buttonSize + 10}px` : 'auto',
            top: openAbove ? 'auto' : `${window.innerHeight - position.y - buttonSize - panelHeight - 10}px`,
            left: openLeft ? 'auto' : `${position.x}px`,
            right: openLeft ? `${window.innerWidth - position.x - buttonSize}px` : 'auto',
        };
    };

    if (position.y === null) return null; // Wait for position to load

    return (
        <>
            {/* Floating Button - Red Arrow */}
            <button
                ref={buttonRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onMouseUp={handleClick}
                className={`fixed z-50 group touch-none ${isActuallyDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
                style={{
                    left: `${position.x}px`,
                    bottom: `${position.y}px`,
                }}
                aria-label="Support Palestine"
            >
                <div className="relative">
                    {/* Red Arrow Icon - Pointing Down */}
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        className={`drop-shadow-lg transition-transform duration-300 ${!isActuallyDragging ? 'group-hover:scale-110' : ''}`}
                    >
                        <polygon
                            points="4,4 24,14 44,4 24,44"
                            fill="#ef4444"
                            stroke="#dc2626"
                            strokeWidth="2"
                        />
                    </svg>
                    {/* Pulse effect */}
                    {!isActuallyDragging && (
                        <div className="absolute inset-0 animate-ping opacity-30">
                            <svg width="48" height="48" viewBox="0 0 48 48">
                                <polygon points="4,4 24,14 44,4 24,44" fill="#ef4444" />
                            </svg>
                        </div>
                    )}
                    {/* Drag hint */}
                    {isActuallyDragging && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            Drag to move
                        </div>
                    )}
                </div>
            </button>

            {/* Support Panel */}
            {isOpen && !isActuallyDragging && (
                <div
                    ref={panelRef}
                    className="fixed z-50 w-80 overflow-hidden rounded-2xl shadow-2xl border border-white/10"
                    style={{
                        ...getPanelStyle(),
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(17,24,39,0.98) 100%)',
                    }}
                >
                    {/* Watermelon rain animation */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {watermelons.map((w) => (
                            <div
                                key={w.id}
                                className="absolute text-2xl animate-watermelon-fall"
                                style={{
                                    left: `${w.left}%`,
                                    animationDelay: `${w.delay}s`,
                                    animationDuration: `${w.duration}s`,
                                }}
                            >
                                🍉
                            </div>
                        ))}
                    </div>

                    {/* Header with Palestine flag colors */}
                    <div className="h-2 flex">
                        <div className="flex-1 bg-black"></div>
                        <div className="flex-1 bg-white"></div>
                        <div className="flex-1 bg-green-600"></div>
                    </div>
                    <div 
                        className="absolute top-2 left-0 w-0 h-0"
                        style={{
                            borderTop: '20px solid transparent',
                            borderBottom: '20px solid transparent',
                            borderLeft: '30px solid #dc2626',
                        }}
                    ></div>

                    {/* Content */}
                    <div className="p-6 pt-8 relative z-10">
                        {/* Palestine Flag */}
                        <div className="flex justify-center mb-4">
                            <span className="text-5xl">🇵🇸</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-center mb-3 bg-gradient-to-r from-green-400 via-white to-red-400 bg-clip-text text-transparent">
                            FREE PALESTINE
                        </h3>

                        {/* Message */}
                        <p className="text-gray-300 text-center text-sm mb-4">
                            We stand in solidarity with the Palestinian people. 
                            May peace and justice prevail. 🕊️
                        </p>

                        {/* Arabic Prayer */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-center text-lg mb-2 font-arabic" dir="rtl">
                                اللهم انصر إخواننا في فلسطين
                            </p>
                            <p className="text-center text-lg mb-2 font-arabic" dir="rtl">
                                اللهم فرّج همّهم ونفّس كربهم
                            </p>
                            <p className="text-center text-lg mb-2 font-arabic" dir="rtl">
                                اللهم احفظهم واحمهم
                            </p>
                            <p className="text-center text-xs text-gray-400 mt-3">
                                "O Allah, grant victory to our brothers and sisters in Palestine. 
                                O Allah, relieve their distress and remove their hardship. 
                                O Allah, protect them and keep them safe."
                            </p>
                        </div>

                        {/* Watermelon emoji decoration */}
                        <div className="flex justify-center gap-2 mt-4">
                            <span className="text-xl">🍉</span>
                            <span className="text-xl">🇵🇸</span>
                            <span className="text-xl">🍉</span>
                        </div>
                    </div>

                    {/* Footer with flag colors */}
                    <div className="h-2 flex">
                        <div className="flex-1 bg-black"></div>
                        <div className="flex-1 bg-white"></div>
                        <div className="flex-1 bg-green-600"></div>
                    </div>
                </div>
            )}

            {/* CSS for watermelon animation */}
            <style jsx>{`
                @keyframes watermelon-fall {
                    0% {
                        transform: translateY(-20px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(350px) rotate(360deg);
                        opacity: 0;
                    }
                }
                .animate-watermelon-fall {
                    animation: watermelon-fall linear infinite;
                }
            `}</style>
        </>
    );
}
