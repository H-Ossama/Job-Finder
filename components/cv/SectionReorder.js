'use client';

import { useState } from 'react';
import { GripVertical, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import styles from './SectionReorder.module.css';

/**
 * Section Reorder Component
 * Allows users to reorder and toggle visibility of CV sections
 */
export default function SectionReorder({ sections, onReorder }) {
    const [localSections, setLocalSections] = useState(sections);

    const moveSection = (index, direction) => {
        const newSections = [...localSections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= newSections.length) return;
        
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        setLocalSections(newSections);
        onReorder(newSections);
    };

    const toggleVisibility = (index) => {
        const newSections = [...localSections];
        newSections[index] = {
            ...newSections[index],
            visible: !newSections[index].visible
        };
        setLocalSections(newSections);
        onReorder(newSections);
    };

    const handleDragStart = (e, index) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/html'));
        
        if (sourceIndex === targetIndex) return;
        
        const newSections = [...localSections];
        const [movedSection] = newSections.splice(sourceIndex, 1);
        newSections.splice(targetIndex, 0, movedSection);
        
        setLocalSections(newSections);
        onReorder(newSections);
    };

    return (
        <div className={styles.sectionReorder}>
            <div className={styles.header}>
                <h3 className={styles.title}>Section Order</h3>
                <p className={styles.subtitle}>
                    Drag to reorder or use arrows. Toggle visibility with the eye icon.
                </p>
            </div>

            <div className={styles.sectionList}>
                {localSections.map((section, index) => (
                    <div
                        key={section.id}
                        className={`${styles.sectionItem} ${!section.visible ? styles.hidden : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        <div className={styles.dragHandle}>
                            <GripVertical className="w-5 h-5" />
                        </div>

                        <div className={styles.sectionInfo}>
                            <span className={styles.sectionOrder}>{index + 1}</span>
                            <div className={styles.sectionDetails}>
                                <span className={styles.sectionName}>{section.label}</span>
                                {section.required && (
                                    <span className={styles.requiredBadge}>Required</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <div className={styles.arrowButtons}>
                                <button
                                    className={styles.arrowBtn}
                                    onClick={() => moveSection(index, 'up')}
                                    disabled={index === 0}
                                    title="Move up"
                                >
                                    <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                    className={styles.arrowBtn}
                                    onClick={() => moveSection(index, 'down')}
                                    disabled={index === localSections.length - 1}
                                    title="Move down"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>

                            {!section.required && (
                                <button
                                    className={styles.visibilityBtn}
                                    onClick={() => toggleVisibility(index)}
                                    title={section.visible ? 'Hide section' : 'Show section'}
                                >
                                    {section.visible ? (
                                        <Eye className="w-5 h-5" />
                                    ) : (
                                        <EyeOff className="w-5 h-5" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.helpText}>
                <p>
                    💡 <strong>Tip:</strong> Hidden sections won't appear in your CV but data will be saved.
                </p>
            </div>
        </div>
    );
}
