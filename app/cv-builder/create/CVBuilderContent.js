'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    User, 
    Briefcase, 
    GraduationCap, 
    Wrench,
    Sparkles,
    Plus,
    X,
    Download,
    Save,
    Eye,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Check,
    Mail,
    Phone,
    MapPin,
    Globe,
    Linkedin,
    Github,
    Layout,
    Target,
    Wand2,
    FileText,
    Settings,
    Image,
    Upload,
    Palette,
    AlertCircle
} from 'lucide-react';
import { saveCV } from '../actions';
import CVPreview from '@/components/cv/CVPreview';
import LivePreviewPanel from '@/components/cv/LivePreviewPanel';
import TemplateSelector from '@/components/cv/TemplateSelector';
import ATSScoreAnalyzer from '@/components/cv/ATSScoreAnalyzer';
import CVUploadModal from '@/components/cv/CVUploadModal';
import SectionReorder from '@/components/cv/SectionReorder';
import { TEMPLATE_INFO } from '@/components/cv/templates';
import styles from './create.module.css';

const initialFormData = {
    personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        photo: null,
        title: ''
    },
    summary: '',
    experience: [
        {
            id: 1,
            company: '',
            title: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
            bullets: []
        }
    ],
    education: [
        {
            id: 1,
            school: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            gpa: '',
            honors: ''
        }
    ],
    skills: {
        technical: [],
        soft: [],
        languages: [],
        certifications: []
    },
    projects: []
};

// Theme color options
const THEME_COLORS = [
    { value: '#ef4444', name: 'Red' },
    { value: '#f97316', name: 'Orange' },
    { value: '#f59e0b', name: 'Amber' },
    { value: '#eab308', name: 'Yellow' },
    { value: '#84cc16', name: 'Lime' },
    { value: '#22c55e', name: 'Green' },
    { value: '#10b981', name: 'Emerald' },
    { value: '#14b8a6', name: 'Teal' },
    { value: '#06b6d4', name: 'Cyan' },
    { value: '#0ea5e9', name: 'Sky' },
    { value: '#3b82f6', name: 'Blue' },
    { value: '#6366f1', name: 'Indigo' },
    { value: '#8b5cf6', name: 'Violet' },
    { value: '#a855f7', name: 'Purple' }
];

// Font family options
const FONT_FAMILIES = [
    { value: 'Roboto', name: 'Roboto' },
    { value: 'Lato', name: 'Lato' },
    { value: 'Montserrat', name: 'Montserrat' },
    { value: 'Open Sans', name: 'Open Sans' },
    { value: 'Raleway', name: 'Raleway' },
    { value: 'Caladea', name: 'Caladea' },
    { value: 'Lora', name: 'Lora' },
    { value: 'Roboto Slab', name: 'Roboto Slab' },
    { value: 'Playfair Display', name: 'Playfair Display' },
    { value: 'Merriweather', name: 'Merriweather' }
];

// Updated steps with Resume Settings
const steps = [
    { id: 1, name: 'Template', icon: Layout },
    { id: 2, name: 'Details', icon: User },
    { id: 3, name: 'Experience', icon: Briefcase },
    { id: 4, name: 'Education', icon: GraduationCap },
    { id: 5, name: 'Skills', icon: Wrench },
    { id: 6, name: 'Settings', icon: Settings },
    { id: 7, name: 'Review', icon: Check }
];

export default function CVBuilderContent({ user, profile }) {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [showUploadModal, setShowUploadModal] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedData, setUploadedData] = useState(null);
    const [missingFieldsNotification, setMissingFieldsNotification] = useState(null);
    const [formData, setFormData] = useState({
        ...initialFormData,
        personalInfo: {
            ...initialFormData.personalInfo,
            firstName: profile?.full_name?.split(' ')[0] || '',
            lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
            email: user?.email || '',
            location: profile?.location || ''
        }
    });
    const [saving, setSaving] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [showAiSuggestion, setShowAiSuggestion] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [atsScore, setAtsScore] = useState(null);
    const [generatingBullets, setGeneratingBullets] = useState(null);
    
    // Resume settings state
    const [resumeSettings, setResumeSettings] = useState({
        themeColor: '#ef4444',
        fontFamily: 'Roboto',
        fontSize: 'standard',
        paperSize: 'letter'
    });

    // Section order state for reordering
    const [sectionOrder, setSectionOrder] = useState([
        { id: 'summary', label: 'Professional Summary', visible: true, required: true },
        { id: 'experience', label: 'Work Experience', visible: true, required: true },
        { id: 'education', label: 'Education', visible: true, required: true },
        { id: 'skills', label: 'Skills', visible: true, required: true },
        { id: 'projects', label: 'Projects', visible: false, required: false },
        { id: 'certifications', label: 'Certifications', visible: false, required: false }
    ]);

    // Handle CV upload success
    const handleUploadSuccess = (data, missingFields) => {
        // Merge uploaded data with form data
        setFormData(prev => ({
            ...prev,
            ...data,
            personalInfo: {
                ...prev.personalInfo,
                ...data.personalInfo
            }
        }));
        
        setUploadedData(data);
        
        // Determine start step based on missing fields
        if (missingFields && missingFields.length > 0) {
            const firstMissing = missingFields[0];
            setCurrentStep(firstMissing.step);
            setMissingFieldsNotification({
                fields: missingFields,
                message: `We've detected some missing or incomplete information. Let's complete your ${firstMissing.field} section.`
            });
        } else {
            // All data is complete, go to settings
            setCurrentStep(6);
        }
        
        setShowUploadModal(false);
    };

    // Handle create from scratch
    const handleCreateFromScratch = () => {
        setShowUploadModal(false);
        setCurrentStep(1);
    };

    // Check if selected template supports photo
    const templateSupportsPhoto = TEMPLATE_INFO[selectedTemplate]?.hasPhoto || false;

    // Update personal info
    const updatePersonalInfo = (field, value) => {
        setFormData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
    };

    // Handle photo upload
    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Photo must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                updatePersonalInfo('photo', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove photo
    const removePhoto = () => {
        updatePersonalInfo('photo', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Update resume settings
    const updateResumeSetting = (key, value) => {
        setResumeSettings(prev => ({ ...prev, [key]: value }));
    };

    // Update summary
    const updateSummary = (value) => {
        setFormData(prev => ({ ...prev, summary: value }));
    };

    // Experience handlers
    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience: [...prev.experience, {
                id: Date.now(),
                company: '',
                title: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: '',
                bullets: []
            }]
        }));
    };

    const updateExperience = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => 
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const removeExperience = (id) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }));
    };

    // Generate AI bullets for experience
    const generateBullets = async (expId) => {
        const exp = formData.experience.find(e => e.id === expId);
        if (!exp?.title && !exp?.company) return;

        setGeneratingBullets(expId);
        try {
            const response = await fetch('/api/cv/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'bullets',
                    jobTitle: exp.title,
                    company: exp.company,
                    responsibilities: exp.description,
                    skills: formData.skills.technical
                })
            });

            const result = await response.json();
            if (result.success && result.bullets) {
                updateExperience(expId, 'bullets', result.bullets);
            }
        } catch (error) {
            console.error('Error generating bullets:', error);
        } finally {
            setGeneratingBullets(null);
        }
    };

    // Education handlers
    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, {
                id: Date.now(),
                school: '',
                degree: '',
                field: '',
                startDate: '',
                endDate: '',
                gpa: '',
                honors: ''
            }]
        }));
    };

    const updateEducation = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.map(edu => 
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        }));
    };

    const removeEducation = (id) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    };

    // Skills handlers
    const addSkill = (type) => {
        if (newSkill.trim()) {
            setFormData(prev => ({
                ...prev,
                skills: {
                    ...prev.skills,
                    [type]: [...(prev.skills[type] || []), newSkill.trim()]
                }
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (type, skill) => {
        setFormData(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                [type]: prev.skills[type].filter(s => s !== skill)
            }
        }));
    };

    const addSuggestedSkill = (type, skill) => {
        if (!formData.skills[type]?.includes(skill)) {
            setFormData(prev => ({
                ...prev,
                skills: {
                    ...prev.skills,
                    [type]: [...(prev.skills[type] || []), skill]
                }
            }));
        }
    };

    // AI Generate Summary
    const generateAISummary = async () => {
        setGeneratingAI(true);
        try {
            const response = await fetch('/api/cv/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'summary',
                    jobTitle: formData.experience[0]?.title || 'Professional',
                    yearsExperience: formData.experience.length * 2,
                    skills: [...(formData.skills.technical || []), ...(formData.skills.soft || [])],
                    industry: 'Technology',
                    targetRole: formData.experience[0]?.title
                })
            });

            const result = await response.json();
            if (result.success) {
                setAiSuggestion(result.content);
                setShowAiSuggestion(true);
            } else {
                setAiSuggestion(`Results-driven ${formData.experience[0]?.title || 'professional'} with expertise in ${formData.skills.technical?.slice(0, 3).join(', ') || 'various technologies'}. Passionate about delivering high-quality solutions and driving innovation. Proven track record of success in collaborative environments.`);
                setShowAiSuggestion(true);
            }
        } catch (error) {
            console.error('Error generating summary:', error);
            setAiSuggestion(`Results-driven ${formData.experience[0]?.title || 'professional'} with expertise in ${formData.skills.technical?.slice(0, 3).join(', ') || 'various technologies'}. Passionate about delivering high-quality solutions and driving innovation.`);
            setShowAiSuggestion(true);
        } finally {
            setGeneratingAI(false);
        }
    };

    const applySuggestion = () => {
        updateSummary(aiSuggestion);
        setShowAiSuggestion(false);
    };

    // Save CV
    const handleSaveCV = async () => {
        setSaving(true);
        try {
            const cvData = {
                title: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName} - CV`,
                content: formData,
                template: selectedTemplate,
                settings: resumeSettings,
                ats_score: atsScore?.score || 0,
                is_primary: false
            };

            const savedCV = await saveCV(cvData);
            router.push(`/cv-builder/edit/${savedCV.id}`);
        } catch (error) {
            console.error('Error saving CV:', error);
        } finally {
            setSaving(false);
        }
    };

    // Download PDF
    const downloadPDF = async () => {
        window.print();
    };

    const suggestedTechnicalSkills = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Kubernetes', 'Git', 'CI/CD'];
    const suggestedSoftSkills = ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Critical Thinking', 'Adaptability', 'Creativity'];

    // Get all template IDs for the selector
    const allTemplates = Object.keys(TEMPLATE_INFO);

    return (
        <>
            {/* CV Upload Modal */}
            <CVUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onCreateFromScratch={handleCreateFromScratch}
                onUploadSuccess={handleUploadSuccess}
            />

            <div className="space-y-6">
                {/* Missing Fields Notification */}
                {missingFieldsNotification && currentStep >= 2 && currentStep <= 5 && (
                    <div className={styles.notificationBanner}>
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                        <div className={styles.notificationContent}>
                            <strong>Information Needed</strong>
                            <p>{missingFieldsNotification.message}</p>
                            <button 
                                onClick={() => setMissingFieldsNotification(null)}
                                className={styles.dismissBtn}
                            >
                                Got it
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setMissingFieldsNotification(null);
                                setCurrentStep(6); // Skip to settings
                            }}
                            className={styles.skipBtn}
                        >
                            Skip for now
                        </button>
                    </div>
                )}

                {/* Header Actions */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1">
                        <span className="text-gradient">Build Your CV</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Let AI help you create a professional, ATS-optimized CV</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={downloadPDF} className={styles.btnSecondary}>
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                    <button 
                        onClick={handleSaveCV}
                        disabled={saving}
                        className={styles.btnPrimary}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save CV
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Step Indicator */}
            <div className={styles.stepIndicatorWrapper}>
                <div className={styles.stepIndicator}>
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className={styles.stepContainer}>
                                <div 
                                    className={`${styles.step} ${
                                        currentStep > step.id ? styles.stepCompleted : 
                                        currentStep === step.id ? styles.stepActive : ''
                                    }`}
                                    onClick={() => setCurrentStep(step.id)}
                                >
                                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                                </div>
                                <span className={styles.stepLabel}>{step.name}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`${styles.stepLine} ${currentStep > step.id ? styles.stepLineCompleted : ''}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Step 1: Template Selection */}
            {currentStep === 1 && (
                <div className={styles.formSection}>
                    <div className="flex justify-end mb-6">
                        <button 
                            onClick={() => setCurrentStep(2)}
                            className={styles.btnPrimary}
                        >
                            Continue to Details
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <TemplateSelector 
                        selectedTemplate={selectedTemplate}
                        onSelectTemplate={setSelectedTemplate}
                    />
                </div>
            )}

            {/* Steps 2-6: Details, Experience, Education, Skills, Settings */}
            {(currentStep >= 2 && currentStep <= 6) && (
                <div className={styles.builderLayout}>
                    {/* Left Panel - Form */}
                    <div className={styles.formPanel}>
                        {/* Step 2: Personal Info & Summary */}
                        {currentStep === 2 && (
                            <div className={styles.formSection}>
                                <div className={styles.glassCard}>
                                    <h3 className={styles.sectionTitle}>
                                        <User className="w-5 h-5 text-accent" />
                                        Personal Information
                                    </h3>

                                    {/* Photo Upload - Only show if template supports it */}
                                    {templateSupportsPhoto && (
                                        <div className={styles.photoUploadSection}>
                                            <label className={styles.formLabel}>
                                                <Image className="w-4 h-4 inline mr-2" />
                                                Profile Photo
                                                <span className={styles.optionalBadge}>For {TEMPLATE_INFO[selectedTemplate]?.name} template</span>
                                            </label>
                                            <div className={styles.photoUploadArea}>
                                                {formData.personalInfo.photo ? (
                                                    <div className={styles.photoPreview}>
                                                        <img 
                                                            src={formData.personalInfo.photo} 
                                                            alt="Profile" 
                                                            className={styles.photoImage}
                                                        />
                                                        <button 
                                                            onClick={removePhoto}
                                                            className={styles.photoRemoveBtn}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className={styles.photoUploadLabel}>
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handlePhotoUpload}
                                                            className={styles.photoInput}
                                                        />
                                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                        <span className="text-sm text-gray-400">Click to upload photo</span>
                                                        <span className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG</span>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>First Name</label>
                                            <input
                                                type="text"
                                                className={styles.formInput}
                                                value={formData.personalInfo.firstName}
                                                onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                                                placeholder="John"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Last Name</label>
                                            <input
                                                type="text"
                                                className={styles.formInput}
                                                value={formData.personalInfo.lastName}
                                                onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                                                placeholder="Doe"
                                            />
                                        </div>
                                        <div className={styles.formGroup + " md:col-span-2"}>
                                            <label className={styles.formLabel}>Professional Title</label>
                                            <input
                                                type="text"
                                                className={styles.formInput}
                                                value={formData.personalInfo.title}
                                                onChange={(e) => updatePersonalInfo('title', e.target.value)}
                                                placeholder="Senior Software Engineer"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Email</label>
                                            <input
                                                type="email"
                                                className={styles.formInput}
                                                value={formData.personalInfo.email}
                                                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Phone</label>
                                            <input
                                                type="tel"
                                                className={styles.formInput}
                                                value={formData.personalInfo.phone}
                                                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                        <div className={styles.formGroup + " md:col-span-2"}>
                                            <label className={styles.formLabel}>Location</label>
                                            <input
                                                type="text"
                                                className={styles.formInput}
                                                value={formData.personalInfo.location}
                                                onChange={(e) => updatePersonalInfo('location', e.target.value)}
                                                placeholder="San Francisco, CA"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>LinkedIn</label>
                                            <input
                                                type="url"
                                                className={styles.formInput}
                                                value={formData.personalInfo.linkedin}
                                                onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                                                placeholder="linkedin.com/in/johndoe"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>GitHub</label>
                                            <input
                                                type="url"
                                                className={styles.formInput}
                                                value={formData.personalInfo.github}
                                                onChange={(e) => updatePersonalInfo('github', e.target.value)}
                                                placeholder="github.com/johndoe"
                                            />
                                        </div>
                                        <div className={styles.formGroup + " md:col-span-2"}>
                                            <label className={styles.formLabel}>Website (Optional)</label>
                                            <input
                                                type="url"
                                                className={styles.formInput}
                                                value={formData.personalInfo.website}
                                                onChange={(e) => updatePersonalInfo('website', e.target.value)}
                                                placeholder="johndoe.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Summary */}
                                <div className={styles.glassCard}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={styles.sectionTitle}>
                                            <Sparkles className="w-5 h-5 text-accent" />
                                            Professional Summary
                                        </h3>
                                        <button 
                                            onClick={generateAISummary}
                                            disabled={generatingAI}
                                            className={styles.aiBtn}
                                        >
                                            {generatingAI ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-4 h-4" />
                                            )}
                                            {generatingAI ? 'Generating...' : 'AI Generate'}
                                        </button>
                                    </div>
                                    <textarea
                                        className={styles.formTextarea}
                                        value={formData.summary}
                                        onChange={(e) => updateSummary(e.target.value)}
                                        placeholder="Write a brief professional summary highlighting your key qualifications and career objectives..."
                                        rows={4}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Tip: A good summary is 3-4 sentences and includes your role, years of experience, and key skills.
                                    </p>

                                    {showAiSuggestion && (
                                        <div className={styles.aiSuggestion}>
                                            <div className={styles.aiSuggestionHeader}>
                                                <Sparkles className="w-4 h-4" />
                                                <span>AI Suggestion</span>
                                            </div>
                                            <p className={styles.aiSuggestionText}>{aiSuggestion}</p>
                                            <div className={styles.aiSuggestionActions}>
                                                <button onClick={applySuggestion} className={styles.btnPrimary}>
                                                    Apply
                                                </button>
                                                <button onClick={() => setShowAiSuggestion(false)} className={styles.btnSecondary}>
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Experience */}
                        {currentStep === 3 && (
                            <div className={styles.formSection}>
                                <div className={styles.glassCard}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={styles.sectionTitle}>
                                            <Briefcase className="w-5 h-5 text-accent" />
                                            Work Experience
                                        </h3>
                                        <button onClick={addExperience} className={styles.addBtn}>
                                            <Plus className="w-4 h-4" />
                                            Add Experience
                                        </button>
                                    </div>

                                    {formData.experience.map((exp, index) => (
                                        <div key={exp.id} className={styles.experienceItem}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={styles.itemNumber}>Position {index + 1}</span>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => generateBullets(exp.id)}
                                                        disabled={generatingBullets === exp.id || (!exp.title && !exp.company)}
                                                        className={styles.aiBtn}
                                                        title="Generate bullet points with AI"
                                                    >
                                                        {generatingBullets === exp.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Wand2 className="w-4 h-4" />
                                                        )}
                                                        AI Bullets
                                                    </button>
                                                    {formData.experience.length > 1 && (
                                                        <button 
                                                            onClick={() => removeExperience(exp.id)}
                                                            className={styles.removeBtn}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Company</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={exp.company}
                                                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                        placeholder="Google"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Job Title</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={exp.title}
                                                        onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                                        placeholder="Senior Software Engineer"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Location</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={exp.location}
                                                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                                        placeholder="San Francisco, CA"
                                                    />
                                                </div>
                                                <div></div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Start Date</label>
                                                    <input
                                                        type="month"
                                                        className={styles.formInput}
                                                        value={exp.startDate}
                                                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>End Date</label>
                                                    <input
                                                        type="month"
                                                        className={styles.formInput}
                                                        value={exp.endDate}
                                                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                                        disabled={exp.current}
                                                    />
                                                    <label className={styles.checkboxLabel}>
                                                        <input
                                                            type="checkbox"
                                                            checked={exp.current}
                                                            onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                                        />
                                                        Currently working here
                                                    </label>
                                                </div>
                                                <div className={styles.formGroup + " md:col-span-2"}>
                                                    <label className={styles.formLabel}>Description / Key Responsibilities</label>
                                                    <textarea
                                                        className={styles.formTextarea}
                                                        value={exp.description}
                                                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                                        placeholder="Brief overview of your role and key responsibilities..."
                                                        rows={2}
                                                    />
                                                </div>
                                                
                                                {/* AI Generated Bullets */}
                                                {exp.bullets && exp.bullets.length > 0 && (
                                                    <div className={styles.formGroup + " md:col-span-2"}>
                                                        <label className={styles.formLabel}>
                                                            <Sparkles className="w-4 h-4 inline mr-1 text-accent" />
                                                            AI-Generated Achievements
                                                        </label>
                                                        <ul className="space-y-2">
                                                            {exp.bullets.map((bullet, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                                                                    <span className="text-accent">•</span>
                                                                    <span>{bullet}</span>
                                                                    <button 
                                                                        onClick={() => {
                                                                            const newBullets = exp.bullets.filter((_, idx) => idx !== i);
                                                                            updateExperience(exp.id, 'bullets', newBullets);
                                                                        }}
                                                                        className="ml-auto text-gray-500 hover:text-red-400"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Education */}
                        {currentStep === 4 && (
                            <div className={styles.formSection}>
                                <div className={styles.glassCard}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={styles.sectionTitle}>
                                            <GraduationCap className="w-5 h-5 text-accent" />
                                            Education
                                        </h3>
                                        <button onClick={addEducation} className={styles.addBtn}>
                                            <Plus className="w-4 h-4" />
                                            Add Education
                                        </button>
                                    </div>

                                    {formData.education.map((edu, index) => (
                                        <div key={edu.id} className={styles.experienceItem}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={styles.itemNumber}>Education {index + 1}</span>
                                                {formData.education.length > 1 && (
                                                    <button 
                                                        onClick={() => removeEducation(edu.id)}
                                                        className={styles.removeBtn}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className={styles.formGroup + " md:col-span-2"}>
                                                    <label className={styles.formLabel}>School/University</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={edu.school}
                                                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                                        placeholder="Stanford University"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Degree</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={edu.degree}
                                                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                                        placeholder="Bachelor of Science"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Field of Study</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={edu.field}
                                                        onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                                        placeholder="Computer Science"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Start Year</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={edu.startDate}
                                                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                                        placeholder="2016"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>End Year</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={edu.endDate}
                                                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                                        placeholder="2020"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>GPA (Optional)</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={edu.gpa}
                                                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                                        placeholder="3.8/4.0"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Honors (Optional)</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={edu.honors}
                                                        onChange={(e) => updateEducation(edu.id, 'honors', e.target.value)}
                                                        placeholder="Magna Cum Laude"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 5: Skills */}
                        {currentStep === 5 && (
                            <div className={styles.formSection}>
                                {/* Technical Skills */}
                                <div className={styles.glassCard}>
                                    <h3 className={styles.sectionTitle}>
                                        <Wrench className="w-5 h-5 text-accent" />
                                        Technical Skills
                                    </h3>
                                    <div className={styles.skillTags}>
                                        {formData.skills.technical?.map(skill => (
                                            <span key={skill} className={styles.skillTag}>
                                                {skill}
                                                <button onClick={() => removeSkill('technical', skill)} className={styles.skillRemove}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className={styles.addSkillRow}>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="Add a technical skill..."
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('technical'))}
                                        />
                                        <button onClick={() => addSkill('technical')} className={styles.addBtn}>
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className={styles.aiSuggestion}>
                                        <div className={styles.aiSuggestionHeader}>
                                            <Sparkles className="w-4 h-4" />
                                            <span>Suggested Skills (Click to add)</span>
                                        </div>
                                        <div className={styles.suggestedSkills}>
                                            {suggestedTechnicalSkills.map(skill => (
                                                !formData.skills.technical?.includes(skill) && (
                                                    <button 
                                                        key={skill}
                                                        onClick={() => addSuggestedSkill('technical', skill)}
                                                        className={styles.suggestedSkill}
                                                    >
                                                        + {skill}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Soft Skills */}
                                <div className={styles.glassCard}>
                                    <h3 className={styles.sectionTitle}>Soft Skills</h3>
                                    <div className={styles.skillTags}>
                                        {formData.skills.soft?.map(skill => (
                                            <span key={skill} className={styles.skillTag}>
                                                {skill}
                                                <button onClick={() => removeSkill('soft', skill)} className={styles.skillRemove}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className={styles.suggestedSkills}>
                                        {suggestedSoftSkills.map(skill => (
                                            !formData.skills.soft?.includes(skill) && (
                                                <button 
                                                    key={skill}
                                                    onClick={() => addSuggestedSkill('soft', skill)}
                                                    className={styles.suggestedSkill}
                                                >
                                                    + {skill}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                </div>

                                {/* Certifications */}
                                <div className={styles.glassCard}>
                                    <h3 className={styles.sectionTitle}>
                                        <FileText className="w-5 h-5 text-accent" />
                                        Certifications (Optional)
                                    </h3>
                                    <div className={styles.skillTags}>
                                        {formData.skills.certifications?.map(cert => (
                                            <span key={cert} className={styles.skillTag}>
                                                {cert}
                                                <button onClick={() => removeSkill('certifications', cert)} className={styles.skillRemove}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className={styles.addSkillRow}>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            placeholder="Add a certification (e.g., AWS Solutions Architect)..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const cert = e.target.value.trim();
                                                    if (cert) {
                                                        addSuggestedSkill('certifications', cert);
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 6: Resume Settings */}
                        {currentStep === 6 && (
                            <div className={styles.formSection}>
                                <div className={styles.glassCard}>
                                    <h3 className={styles.sectionTitle}>
                                        <Settings className="w-5 h-5 text-accent" />
                                        Resume Settings
                                    </h3>

                                    {/* Theme Color */}
                                    <div className={styles.settingGroup}>
                                        <label className={styles.settingLabel}>
                                            <Palette className="w-4 h-4" />
                                            Theme Color
                                            <span className={styles.settingValue}>{resumeSettings.themeColor}</span>
                                        </label>
                                        <div className={styles.colorGrid}>
                                            {THEME_COLORS.map(color => (
                                                <button
                                                    key={color.value}
                                                    className={`${styles.colorBtn} ${resumeSettings.themeColor === color.value ? styles.colorBtnActive : ''}`}
                                                    style={{ backgroundColor: color.value }}
                                                    onClick={() => updateResumeSetting('themeColor', color.value)}
                                                    title={color.name}
                                                >
                                                    {resumeSettings.themeColor === color.value && (
                                                        <Check className="w-4 h-4 text-white" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Font Family */}
                                    <div className={styles.settingGroup}>
                                        <label className={styles.settingLabel}>Font Family</label>
                                        <div className={styles.fontGrid}>
                                            {FONT_FAMILIES.map(font => (
                                                <button
                                                    key={font.value}
                                                    className={`${styles.fontBtn} ${resumeSettings.fontFamily === font.value ? styles.fontBtnActive : ''}`}
                                                    style={{ fontFamily: font.value }}
                                                    onClick={() => updateResumeSetting('fontFamily', font.value)}
                                                >
                                                    {font.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Font Size */}
                                    <div className={styles.settingGroup}>
                                        <label className={styles.settingLabel}>
                                            Font Size (pt)
                                            <span className={styles.settingValue}>
                                                {resumeSettings.fontSize === 'compact' ? '10' : resumeSettings.fontSize === 'standard' ? '11' : '12'}
                                            </span>
                                        </label>
                                        <div className={styles.sizeToggle}>
                                            {['compact', 'standard', 'large'].map(size => (
                                                <button
                                                    key={size}
                                                    className={`${styles.sizeBtn} ${resumeSettings.fontSize === size ? styles.sizeBtnActive : ''}`}
                                                    onClick={() => updateResumeSetting('fontSize', size)}
                                                >
                                                    {size.charAt(0).toUpperCase() + size.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Document Size */}
                                    <div className={styles.settingGroup}>
                                        <label className={styles.settingLabel}>Document Size</label>
                                        <div className={styles.paperSizeToggle}>
                                            <button
                                                className={`${styles.paperSizeBtn} ${resumeSettings.paperSize === 'letter' ? styles.paperSizeBtnActive : ''}`}
                                                onClick={() => updateResumeSetting('paperSize', 'letter')}
                                            >
                                                <span className={styles.paperSizeName}>Letter</span>
                                                <span className={styles.paperSizeDesc}>(US, Canada)</span>
                                            </button>
                                            <button
                                                className={`${styles.paperSizeBtn} ${resumeSettings.paperSize === 'a4' ? styles.paperSizeBtnActive : ''}`}
                                                onClick={() => updateResumeSetting('paperSize', 'a4')}
                                            >
                                                <span className={styles.paperSizeName}>A4</span>
                                                <span className={styles.paperSizeDesc}>(other countries)</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Section Order */}
                                <div className={styles.glassCard}>
                                    <SectionReorder
                                        sections={sectionOrder}
                                        onReorder={setSectionOrder}
                                    />
                                </div>

                                {/* Template Quick Switch */}
                                <div className={styles.glassCard}>
                                    <h3 className={styles.sectionTitle}>
                                        <Layout className="w-5 h-5 text-accent" />
                                        Change Template
                                    </h3>
                                    <div className={styles.templateQuickGrid}>
                                        {allTemplates.map(template => (
                                            <button 
                                                key={template}
                                                className={`${styles.templateQuickBtn} ${selectedTemplate === template ? styles.templateQuickBtnActive : ''}`}
                                                onClick={() => setSelectedTemplate(template)}
                                            >
                                                {TEMPLATE_INFO[template]?.name || template}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6">
                            <button 
                                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                className={styles.btnSecondary}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                            {currentStep < 7 && (
                                <button 
                                    onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
                                    className={styles.btnPrimary}
                                >
                                    {currentStep === 6 ? 'Review CV' : 'Continue'}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Live Preview */}
                    <div className={styles.previewPanel}>
                        <LivePreviewPanel
                            cvData={formData}
                            templateId={selectedTemplate}
                            paperSize={resumeSettings.paperSize}
                            resumeSettings={resumeSettings}
                            showControls={true}
                        />
                    </div>
                </div>
            )}

            {/* Step 7: Review & Download */}
            {currentStep === 7 && (
                <div className={styles.reviewSection}>
                    {/* Success Header */}
                    <div className={styles.reviewHeader}>
                        <div className={styles.successIcon}>
                            <Check className="w-8 h-8" />
                        </div>
                        <h2 className={styles.reviewTitle}>Your CV is Ready!</h2>
                        <p className={styles.reviewSubtitle}>
                            Review your CV below and download it when you're satisfied
                        </p>
                    </div>

                    {/* ATS Score Card */}
                    <div className={styles.atsScoreCard}>
                        <div className={styles.atsScoreMain}>
                            <div className={styles.atsScoreCircle}>
                                <svg viewBox="0 0 100 100" className={styles.atsScoreSvg}>
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke={atsScore?.score >= 80 ? '#22c55e' : atsScore?.score >= 60 ? '#f59e0b' : '#ef4444'}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(atsScore?.score || 75) * 2.83} 283`}
                                        transform="rotate(-90 50 50)"
                                    />
                                </svg>
                                <span className={styles.atsScoreValue}>{atsScore?.score || 75}%</span>
                            </div>
                            <div className={styles.atsScoreInfo}>
                                <h3>ATS Compatibility Score</h3>
                                <p className={atsScore?.score >= 80 ? styles.scoreGood : atsScore?.score >= 60 ? styles.scoreOk : styles.scoreLow}>
                                    {atsScore?.score >= 80 ? 'Excellent! Your CV is well-optimized for ATS systems.' : 
                                     atsScore?.score >= 60 ? 'Good, but there\'s room for improvement.' : 
                                     'Consider adding more keywords and details.'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setCurrentStep(2)}
                            className={styles.btnSecondary}
                        >
                            <Wand2 className="w-4 h-4" />
                            Improve Score
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.reviewActions}>
                        <button 
                            onClick={() => setCurrentStep(6)}
                            className={styles.btnSecondary}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Edit Settings
                        </button>
                        <div className={styles.reviewActionsRight}>
                            <button 
                                onClick={handleSaveCV}
                                disabled={saving}
                                className={styles.btnSecondary}
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saving ? 'Saving...' : 'Save CV'}
                            </button>
                            <button 
                                onClick={downloadPDF}
                                className={styles.btnPrimary}
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                    </div>

                    {/* CV Preview - Full Width with Controls */}
                    <div className={styles.reviewPreviewContainer}>
                        <LivePreviewPanel
                            cvData={formData}
                            templateId={selectedTemplate}
                            paperSize={resumeSettings.paperSize}
                            resumeSettings={resumeSettings}
                            showControls={true}
                        />
                    </div>

                    {/* Template Selector (compact) */}
                    <div className={styles.templateSwitcher}>
                        <span className={styles.templateSwitcherLabel}>Change Template:</span>
                        <div className={styles.templateSwitcherBtns}>
                            {allTemplates.map(template => (
                                <button 
                                    key={template}
                                    className={`${styles.templateBtn} ${selectedTemplate === template ? styles.templateBtnActive : ''}`}
                                    onClick={() => setSelectedTemplate(template)}
                                >
                                    {TEMPLATE_INFO[template]?.name || template}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
}
