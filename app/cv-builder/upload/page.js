'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { saveCV } from '../actions'
import styles from './upload.module.css'

export default function UploadCV() {
    const router = useRouter()
    const [file, setFile] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [parsedData, setParsedData] = useState(null)

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleFile = async (selectedFile) => {
        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.docx')) {
            setError('Please upload a PDF or DOCX file')
            return
        }

        setFile(selectedFile)
        setError(null)
        setLoading(true)

        try {
            // Parse the file
            const formData = new FormData()
            formData.append('file', selectedFile)

            const response = await fetch('/api/parse', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to parse file')
            }

            setParsedData(result.data)
        } catch (err) {
            setError(err.message)
            setFile(null)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!parsedData) return

        setLoading(true)
        try {
            const cvData = {
                title: `${parsedData.personalInfo?.name || 'Untitled'}'s CV`,
                content: parsedData,
                is_primary: false
            }

            const savedCV = await saveCV(cvData)
            router.push(`/cv-builder/edit/${savedCV.id}`)
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Upload Your CV</h1>
                <p className={styles.subtitle}>Upload your existing CV and let AI enhance it</p>
            </div>

            <div className={styles.content}>
                {!parsedData ? (
                    <div
                        className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className={styles.fileInput}
                            accept=".pdf,.docx"
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <label htmlFor="file-upload" className={styles.uploadLabel}>
                            {loading ? (
                                <>
                                    <Loader2 size={48} className={styles.spinner} />
                                    <p className={styles.uploadText}>Parsing your CV...</p>
                                </>
                            ) : (
                                <>
                                    <Upload size={48} />
                                    <p className={styles.uploadText}>
                                        {file ? file.name : 'Drag and drop your CV here'}
                                    </p>
                                    <p className={styles.uploadHint}>or click to browse</p>
                                    <p className={styles.uploadFormats}>Supports PDF and DOCX files</p>
                                </>
                            )}
                        </label>
                    </div>
                ) : (
                    <div className={styles.previewCard}>
                        <div className={styles.previewHeader}>
                            <FileText size={24} />
                            <h2>CV Parsed Successfully!</h2>
                        </div>
                        <div className={styles.previewContent}>
                            <div className={styles.infoSection}>
                                <h3>Personal Information</h3>
                                <p><strong>Name:</strong> {parsedData.personalInfo?.name || 'Not found'}</p>
                                <p><strong>Email:</strong> {parsedData.personalInfo?.email || 'Not found'}</p>
                                <p><strong>Phone:</strong> {parsedData.personalInfo?.phone || 'Not found'}</p>
                            </div>
                            <div className={styles.infoSection}>
                                <h3>Experience</h3>
                                <p>{parsedData.experience?.length || 0} positions found</p>
                            </div>
                            <div className={styles.infoSection}>
                                <h3>Education</h3>
                                <p>{parsedData.education?.length || 0} entries found</p>
                            </div>
                            <div className={styles.infoSection}>
                                <h3>Skills</h3>
                                <p>{parsedData.skills?.length || 0} skills found</p>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <button onClick={() => { setParsedData(null); setFile(null) }} className={styles.secondaryBtn}>
                                Upload Different File
                            </button>
                            <button onClick={handleSave} className={styles.primaryBtn} disabled={loading}>
                                {loading ? 'Saving...' : 'Continue to Edit'}
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className={styles.errorBox}>
                        <AlertCircle size={20} />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <button onClick={() => router.push('/cv-builder')} className={styles.backLink}>
                    ← Back to CV Builder
                </button>
            </div>
        </div>
    )
}
