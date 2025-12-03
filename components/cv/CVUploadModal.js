'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Plus, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './CVUploadModal.module.css';

/**
 * CV Upload Modal - Choose between creating from scratch or uploading existing CV
 */
export default function CVUploadModal({ isOpen, onClose, onCreateFromScratch, onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [parseResult, setParseResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a PDF or Word document');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setUploading(true);
        setError(null);
        setParseResult(null);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);

            // Upload and parse CV
            const response = await fetch('/api/cv/parse', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to parse CV');
            }

            setParseResult(result);
            
            // Call success callback with parsed data
            setTimeout(() => {
                onUploadSuccess(result.data, result.missingFields || []);
            }, 1500);

        } catch (err) {
            console.error('Error parsing CV:', err);
            setError(err.message || 'Failed to parse CV. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X className="w-5 h-5" />
                </button>

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        <span className="text-gradient">Build Your CV</span>
                    </h2>
                    <p className={styles.modalSubtitle}>
                        Choose how you'd like to create your professional CV
                    </p>
                </div>

                <div className={styles.optionsGrid}>
                    {/* Create from Scratch */}
                    <button 
                        className={styles.optionCard}
                        onClick={() => {
                            onCreateFromScratch();
                            onClose();
                        }}
                        disabled={uploading}
                    >
                        <div className={styles.optionIcon}>
                            <Plus className="w-8 h-8" />
                        </div>
                        <h3 className={styles.optionTitle}>Start from Scratch</h3>
                        <p className={styles.optionDesc}>
                            Create a brand new CV with our step-by-step builder
                        </p>
                        <div className={styles.optionBadge}>Recommended for first-time users</div>
                    </button>

                    {/* Upload Existing CV */}
                    <button 
                        className={styles.optionCard}
                        onClick={handleUploadClick}
                        disabled={uploading}
                    >
                        <div className={styles.optionIcon}>
                            {uploading ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                            ) : parseResult ? (
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            ) : error ? (
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            ) : (
                                <Upload className="w-8 h-8" />
                            )}
                        </div>
                        <h3 className={styles.optionTitle}>Upload Existing CV</h3>
                        <p className={styles.optionDesc}>
                            {uploading ? 'Analyzing your CV...' : 
                             parseResult ? 'CV parsed successfully!' :
                             error ? error :
                             'We\'ll extract and pre-fill your information'}
                        </p>
                        <div className={styles.optionBadge}>
                            {uploading ? 'Processing...' : 
                             parseResult ? 'Done! Redirecting...' :
                             'PDF or Word document'}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            className={styles.fileInput}
                        />
                    </button>
                </div>

                {/* Features List */}
                <div className={styles.featuresList}>
                    <div className={styles.feature}>
                        <FileText className="w-4 h-4 text-accent" />
                        <span>AI-powered CV analysis</span>
                    </div>
                    <div className={styles.feature}>
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span>Smart data extraction</span>
                    </div>
                    <div className={styles.feature}>
                        <Upload className="w-4 h-4 text-accent" />
                        <span>Supports PDF & Word</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
