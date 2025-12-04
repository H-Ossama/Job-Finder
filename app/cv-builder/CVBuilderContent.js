'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
    AlertCircle,
    FolderKanban,
    Award,
    ExternalLink
} from 'lucide-react';
import { saveCV, updateCV } from './actions';
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
    projects: [
        {
            id: 1,
            name: '',
            description: '',
            technologies: [],
            link: '',
            date: ''
        }
    ],
    certifications: []
};

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

// Updated steps with Projects and Resume Settings
const steps = [
    { id: 1, name: 'Template', icon: Layout },
    { id: 2, name: 'Details', icon: User },
    { id: 3, name: 'Experience', icon: Briefcase },
    { id: 4, name: 'Education', icon: GraduationCap },
    { id: 5, name: 'Skills', icon: Wrench },
    { id: 6, name: 'Projects', icon: FolderKanban },
    { id: 7, name: 'Settings', icon: Settings },
    { id: 8, name: 'Review', icon: Check }
];

export default function CVBuilderContent({ user, profile, existingCV }) {
    const router = useRouter();
    const fileInputRef = useRef(null);
    // Only show upload modal if not editing an existing CV
    const [showUploadModal, setShowUploadModal] = useState(!existingCV);
    // If editing, skip to template/settings step
    const [currentStep, setCurrentStep] = useState(existingCV ? 7 : 1);
    const [uploadedData, setUploadedData] = useState(null);
    const [missingFieldsNotification, setMissingFieldsNotification] = useState(null);
    
    // Initialize form data from existing CV or defaults
    const getInitialFormData = () => {
        if (existingCV && existingCV.content) {
            const content = existingCV.content;
            return {
                personalInfo: {
                    firstName: content.personalInfo?.firstName || profile?.full_name?.split(' ')[0] || '',
                    lastName: content.personalInfo?.lastName || profile?.full_name?.split(' ').slice(1).join(' ') || '',
                    email: content.personalInfo?.email || user?.email || '',
                    phone: content.personalInfo?.phone || '',
                    location: content.personalInfo?.location || profile?.location || '',
                    website: content.personalInfo?.website || '',
                    linkedin: content.personalInfo?.linkedin || '',
                    github: content.personalInfo?.github || '',
                    photo: content.personalInfo?.photo || null,
                    title: content.personalInfo?.title || ''
                },
                summary: content.summary || '',
                experience: content.experience?.length > 0 ? content.experience.map((exp, i) => ({
                    id: exp.id || Date.now() + i,
                    company: exp.company || '',
                    title: exp.title || '',
                    location: exp.location || '',
                    startDate: exp.startDate || '',
                    endDate: exp.endDate || '',
                    current: exp.current || false,
                    description: exp.description || '',
                    bullets: exp.bullets || []
                })) : initialFormData.experience,
                education: content.education?.length > 0 ? content.education.map((edu, i) => ({
                    id: edu.id || Date.now() + i,
                    school: edu.school || '',
                    degree: edu.degree || '',
                    field: edu.field || '',
                    startDate: edu.startDate || '',
                    endDate: edu.endDate || '',
                    gpa: edu.gpa || '',
                    honors: edu.honors || ''
                })) : initialFormData.education,
                skills: {
                    technical: content.skills?.technical || [],
                    soft: content.skills?.soft || [],
                    languages: content.skills?.languages || [],
                    certifications: content.skills?.certifications || []
                },
                projects: content.projects?.length > 0 ? content.projects.map((proj, i) => ({
                    id: proj.id || Date.now() + i,
                    name: proj.name || '',
                    description: proj.description || '',
                    technologies: proj.technologies || [],
                    link: proj.link || '',
                    date: proj.date || ''
                })) : initialFormData.projects,
                certifications: content.certifications || []
            };
        }
        
        return {
            ...initialFormData,
            personalInfo: {
                ...initialFormData.personalInfo,
                firstName: profile?.full_name?.split(' ')[0] || '',
                lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
                email: user?.email || '',
                location: profile?.location || ''
            }
        };
    };

    const [formData, setFormData] = useState(getInitialFormData);
    const [saving, setSaving] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [showAiSuggestion, setShowAiSuggestion] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    // Use existing CV template or default to modern
    const [selectedTemplate, setSelectedTemplate] = useState(existingCV?.template || 'modern');
    const [atsScore, setAtsScore] = useState(null);
    const [generatingBullets, setGeneratingBullets] = useState(null);
    
    // Resume settings state - use existing CV settings or defaults
    const [resumeSettings, setResumeSettings] = useState(() => {
        if (existingCV?.content?._settings) {
            return existingCV.content._settings;
        }
        return {
            fontFamily: 'Roboto',
            fontSize: 'standard',
            customFontSize: null,
            paperSize: 'letter'
        };
    });

    // Section order state for reordering
    const [sectionOrder, setSectionOrder] = useState(() => {
        if (existingCV?.content?._sectionOrder) {
            return existingCV.content._sectionOrder;
        }
        return [
            { id: 'summary', label: 'Professional Summary', visible: true },
            { id: 'experience', label: 'Work Experience', visible: true },
            { id: 'education', label: 'Education', visible: true },
            { id: 'skills', label: 'Skills', visible: true },
            { id: 'projects', label: 'Projects', visible: true },
            { id: 'certifications', label: 'Certifications', visible: true }
        ];
    });

    // Resizable panel state
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);

    // Handle panel resize
    const handleResizeStart = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const handleResizeMove = useCallback((e) => {
        if (!isResizing || !containerRef.current) return;
        
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        
        // Clamp between 30% and 70%
        const clampedWidth = Math.min(70, Math.max(30, newWidth));
        setLeftPanelWidth(clampedWidth);
    }, [isResizing]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
    }, []);

    // Add global mouse events for resizing
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    // Handle CV upload success
    const handleUploadSuccess = (data, missingFields) => {
        // Merge uploaded data with form data, preserving structure
        setFormData(prev => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                ...data.personalInfo,
                firstName: data.personalInfo?.firstName || prev.personalInfo.firstName,
                lastName: data.personalInfo?.lastName || prev.personalInfo.lastName
            },
            summary: data.summary || prev.summary,
            experience: data.experience?.length > 0 ? data.experience.map((exp, i) => ({
                id: exp.id || Date.now() + i,
                company: exp.company || '',
                title: exp.title || '',
                location: exp.location || '',
                startDate: exp.startDate || '',
                endDate: exp.endDate || '',
                current: exp.current || false,
                description: exp.description || '',
                bullets: exp.bullets || []
            })) : prev.experience,
            education: data.education?.length > 0 ? data.education.map((edu, i) => ({
                id: edu.id || Date.now() + i,
                school: edu.school || '',
                degree: edu.degree || '',
                field: edu.field || '',
                startDate: edu.startDate || '',
                endDate: edu.endDate || '',
                gpa: edu.gpa || '',
                honors: edu.honors || ''
            })) : prev.education,
            skills: {
                technical: data.skills?.technical || prev.skills.technical,
                soft: data.skills?.soft || prev.skills.soft,
                languages: data.skills?.languages || prev.skills.languages,
                certifications: data.skills?.certifications || prev.skills.certifications
            },
            projects: data.projects?.length > 0 ? data.projects.map((proj, i) => ({
                id: proj.id || Date.now() + i,
                name: proj.name || '',
                description: proj.description || '',
                technologies: proj.technologies || [],
                link: proj.link || '',
                date: proj.date || ''
            })) : prev.projects,
            certifications: data.certifications?.length > 0 ? data.certifications.map((cert, i) => ({
                id: cert.id || Date.now() + i,
                name: typeof cert === 'string' ? cert : (cert.name || ''),
                issuer: cert.issuer || '',
                date: cert.date || '',
                expiry: cert.expiry || '',
                credentialId: cert.credentialId || ''
            })) : prev.certifications
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
            setCurrentStep(7);
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

    // Project handlers
    const addProject = () => {
        setFormData(prev => ({
            ...prev,
            projects: [...(prev.projects || []), {
                id: Date.now(),
                name: '',
                description: '',
                technologies: [],
                link: '',
                date: ''
            }]
        }));
    };

    const updateProject = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            projects: (prev.projects || []).map(proj => 
                proj.id === id ? { ...proj, [field]: value } : proj
            )
        }));
    };

    const removeProject = (id) => {
        setFormData(prev => ({
            ...prev,
            projects: (prev.projects || []).filter(proj => proj.id !== id)
        }));
    };

    const addProjectTechnology = (projectId, tech) => {
        if (!tech.trim()) return;
        setFormData(prev => ({
            ...prev,
            projects: (prev.projects || []).map(proj => 
                proj.id === projectId 
                    ? { ...proj, technologies: [...(proj.technologies || []), tech.trim()] }
                    : proj
            )
        }));
    };

    const removeProjectTechnology = (projectId, tech) => {
        setFormData(prev => ({
            ...prev,
            projects: (prev.projects || []).map(proj => 
                proj.id === projectId 
                    ? { ...proj, technologies: (proj.technologies || []).filter(t => t !== tech) }
                    : proj
            )
        }));
    };

    // Certification handlers
    const addCertification = () => {
        setFormData(prev => ({
            ...prev,
            certifications: [...(prev.certifications || []), {
                id: Date.now(),
                name: '',
                issuer: '',
                date: '',
                expiry: '',
                credentialId: ''
            }]
        }));
    };

    const updateCertification = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            certifications: (prev.certifications || []).map(cert => 
                cert.id === id ? { ...cert, [field]: value } : cert
            )
        }));
    };

    const removeCertification = (id) => {
        setFormData(prev => ({
            ...prev,
            certifications: (prev.certifications || []).filter(cert => cert.id !== id)
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
            // Store settings inside content so they persist
            const contentWithSettings = {
                ...formData,
                _settings: resumeSettings,
                _sectionOrder: sectionOrder
            };
            
            const cvData = {
                title: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName} - CV`,
                content: contentWithSettings,
                template: selectedTemplate,
                ats_score: atsScore?.score || 0,
                is_primary: existingCV?.is_primary || false
            };

            let savedCV;
            if (existingCV) {
                // Update existing CV
                savedCV = await updateCV(existingCV.id, cvData);
            } else {
                // Create new CV
                savedCV = await saveCV(cvData);
            }
            router.push(`/cv-builder/result/${savedCV.id}`);
        } catch (error) {
            console.error('Error saving CV:', error);
        } finally {
            setSaving(false);
        }
    };

    // Download PDF
    const [downloading, setDownloading] = useState(false);
    const downloadPDF = async () => {
        setDownloading(true);
        try {
            // Find the CV document element in the preview
            const previewContainer = document.querySelector('.live-preview-panel');
            const cvElement = previewContainer?.querySelector('.paper-document') || 
                              previewContainer?.querySelector('.cv-document') ||
                              document.querySelector('.cv-preview-container');
            
            if (!cvElement) {
                console.error('CV element not found');
                window.print();
                return;
            }
            
            // Get the paper size settings
            const isA4 = resumeSettings.paperSize === 'a4';
            
            // Paper dimensions in mm
            const pdfWidth = isA4 ? 210 : 215.9; // A4 or Letter width
            const pdfHeight = isA4 ? 297 : 279.4; // A4 or Letter height
            
            // Create canvas from the CV element
            const canvas = await html2canvas(cvElement, {
                scale: 2, // Higher resolution
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                windowWidth: cvElement.scrollWidth,
                windowHeight: cvElement.scrollHeight
            });
            
            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: isA4 ? 'a4' : 'letter'
            });
            
            // Calculate dimensions to fit the page
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            // Add image to PDF (may span multiple pages)
            let heightLeft = imgHeight;
            let position = 0;
            
            const imgData = canvas.toDataURL('image/png');
            
            // First page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
            
            // Add more pages if needed
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            // Generate filename
            const firstName = formData.personalInfo?.firstName || 'My';
            const lastName = formData.personalInfo?.lastName || 'CV';
            const filename = `${firstName}_${lastName}_CV.pdf`.replace(/\s+/g, '_');
            
            // Download the PDF
            pdf.save(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            // Fallback to window.print() if canvas fails
            window.print();
        } finally {
            setDownloading(false);
        }
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
                {missingFieldsNotification && currentStep >= 2 && currentStep <= 6 && (
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
                                setCurrentStep(7); // Skip to settings
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
                        <span className="text-gradient">{existingCV ? 'Edit Your CV' : 'Build Your CV'}</span>
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {existingCV 
                            ? `Editing: ${existingCV.title}`
                            : 'Let AI help you create a professional, ATS-optimized CV'
                        }
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={downloadPDF} className={styles.btnSecondary} disabled={downloading}>
                        {downloading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Download PDF
                            </>
                        )}
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

            {/* Steps 2-7: Details, Experience, Education, Skills, Projects, Settings */}
            {(currentStep >= 2 && currentStep <= 7) && (
                <div 
                    className={styles.builderLayout}
                    ref={containerRef}
                >
                    {/* Left Panel - Form */}
                    <div 
                        className={styles.formPanel}
                        style={{ width: `${leftPanelWidth}%` }}
                    >
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

                        {/* Step 6: Projects */}
                        {currentStep === 6 && (
                            <div className={styles.formSection}>
                                <div className={styles.glassCard}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={styles.sectionTitle}>
                                            <FolderKanban className="w-5 h-5 text-accent" />
                                            Projects
                                        </h3>
                                        <button onClick={addProject} className={styles.addBtn}>
                                            <Plus className="w-4 h-4" />
                                            Add Project
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Showcase your personal, academic, or professional projects to demonstrate your skills.
                                    </p>

                                    {(formData.projects || []).map((project, index) => (
                                        <div key={project.id} className={styles.experienceItem}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={styles.itemNumber}>Project {index + 1}</span>
                                                {(formData.projects || []).length > 1 && (
                                                    <button 
                                                        onClick={() => removeProject(project.id)}
                                                        className={styles.removeBtn}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className={styles.formGroup + " md:col-span-2"}>
                                                    <label className={styles.formLabel}>Project Name</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={project.name}
                                                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                                                        placeholder="E-commerce Platform"
                                                    />
                                                </div>
                                                <div className={styles.formGroup + " md:col-span-2"}>
                                                    <label className={styles.formLabel}>Description</label>
                                                    <textarea
                                                        className={styles.formTextarea}
                                                        value={project.description}
                                                        onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                                                        placeholder="Describe what the project does, your role, and key achievements..."
                                                        rows={3}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Date / Duration</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={project.date}
                                                        onChange={(e) => updateProject(project.id, 'date', e.target.value)}
                                                        placeholder="Jan 2024 - Present"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>
                                                        <ExternalLink className="w-4 h-4 inline mr-1" />
                                                        Project Link (Optional)
                                                    </label>
                                                    <input
                                                        type="url"
                                                        className={styles.formInput}
                                                        value={project.link}
                                                        onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                                                        placeholder="https://github.com/user/project"
                                                    />
                                                </div>
                                                <div className={styles.formGroup + " md:col-span-2"}>
                                                    <label className={styles.formLabel}>Technologies Used</label>
                                                    <div className={styles.skillTags}>
                                                        {(project.technologies || []).map(tech => (
                                                            <span key={tech} className={styles.skillTag}>
                                                                {tech}
                                                                <button 
                                                                    onClick={() => removeProjectTechnology(project.id, tech)} 
                                                                    className={styles.skillRemove}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className={styles.addSkillRow}>
                                                        <input
                                                            type="text"
                                                            className={styles.formInput}
                                                            placeholder="Add technology (e.g., React, Node.js)..."
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    addProjectTechnology(project.id, e.target.value);
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {(!formData.projects || formData.projects.length === 0) && (
                                        <div className="text-center py-8 text-gray-500">
                                            <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No projects added yet.</p>
                                            <button onClick={addProject} className={styles.btnSecondary + " mt-3"}>
                                                <Plus className="w-4 h-4" />
                                                Add Your First Project
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Certifications Section - Detailed */}
                                <div className={styles.glassCard}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={styles.sectionTitle}>
                                            <Award className="w-5 h-5 text-accent" />
                                            Certifications
                                        </h3>
                                        <button onClick={addCertification} className={styles.addBtn}>
                                            <Plus className="w-4 h-4" />
                                            Add Certification
                                        </button>
                                    </div>

                                    {(formData.certifications || []).map((cert, index) => (
                                        <div key={cert.id || index} className={styles.experienceItem}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={styles.itemNumber}>Certification {index + 1}</span>
                                                <button 
                                                    onClick={() => removeCertification(cert.id)}
                                                    className={styles.removeBtn}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className={styles.formGroup + " md:col-span-2"}>
                                                    <label className={styles.formLabel}>Certification Name</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={cert.name || ''}
                                                        onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                                                        placeholder="AWS Solutions Architect Associate"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Issuing Organization</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={cert.issuer || ''}
                                                        onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                                                        placeholder="Amazon Web Services"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Date Obtained</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={cert.date || ''}
                                                        onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                                                        placeholder="Jan 2024"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Expiration Date (Optional)</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={cert.expiry || ''}
                                                        onChange={(e) => updateCertification(cert.id, 'expiry', e.target.value)}
                                                        placeholder="Jan 2027"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Credential ID (Optional)</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        value={cert.credentialId || ''}
                                                        onChange={(e) => updateCertification(cert.id, 'credentialId', e.target.value)}
                                                        placeholder="ABC123XYZ"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {(!formData.certifications || formData.certifications.length === 0) && (
                                        <div className="text-center py-6 text-gray-500">
                                            <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No certifications added yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 7: Resume Settings */}
                        {currentStep === 7 && (
                            <div className={styles.formSection}>
                                {/* Template Switcher - Primary */}
                                <div className={styles.glassCard}>
                                    <h3 className={styles.sectionTitle}>
                                        <Layout className="w-5 h-5 text-accent" />
                                        Choose Template
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Select a template that best fits your industry and style.
                                    </p>
                                    
                                    {/* Photo Warning */}
                                    {TEMPLATE_INFO[selectedTemplate]?.hasPhoto && !formData.personalInfo?.photo && (
                                        <div className={styles.photoWarning}>
                                            <AlertCircle className="w-5 h-5" />
                                            <div className={styles.photoWarningContent}>
                                                <span className={styles.photoWarningText}>
                                                    <strong>{TEMPLATE_INFO[selectedTemplate]?.name}</strong> template supports a profile photo.
                                                </span>
                                                <div className={styles.photoWarningActions}>
                                                    <button 
                                                        onClick={() => setCurrentStep(2)}
                                                        className={styles.photoWarningBtn}
                                                    >
                                                        <Image className="w-4 h-4" />
                                                        Add Photo
                                                    </button>
                                                    <span className={styles.photoWarningSkip}>or continue without</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className={styles.templateSelectorGrid}>
                                        {allTemplates.map(template => (
                                            <button 
                                                key={template}
                                                className={`${styles.templateCard} ${selectedTemplate === template ? styles.templateCardActive : ''}`}
                                                onClick={() => setSelectedTemplate(template)}
                                            >
                                                <div className={styles.templateCardHeader}>
                                                    <span className={styles.templateCardName}>{TEMPLATE_INFO[template]?.name || template}</span>
                                                    {selectedTemplate === template && <Check className="w-4 h-4 text-green-400" />}
                                                </div>
                                                <p className={styles.templateCardDesc}>{TEMPLATE_INFO[template]?.description}</p>
                                                <div className={styles.templateCardMeta}>
                                                    {TEMPLATE_INFO[template]?.hasPhoto && (
                                                        <span className={styles.templateBadge}>
                                                            <Image className="w-3 h-3" /> Photo
                                                        </span>
                                                    )}
                                                    <span className={styles.templateBadgeSecondary}>{TEMPLATE_INFO[template]?.bestFor?.split(',')[0]}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Typography Settings */}
                                <div className={styles.glassCard}>
                                    <h3 className={styles.sectionTitle}>
                                        <Settings className="w-5 h-5 text-accent" />
                                        Typography Settings
                                    </h3>

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

                                    {/* Font Size - Improved */}
                                    <div className={styles.settingGroup}>
                                        <label className={styles.settingLabel}>
                                            Font Size
                                        </label>
                                        <div className={styles.fontSizeSelector}>
                                            <button
                                                className={`${styles.fontSizeBtn} ${resumeSettings.fontSize === 'compact' && !resumeSettings.customFontSize ? styles.fontSizeBtnActive : ''}`}
                                                onClick={() => {
                                                    updateResumeSetting('fontSize', 'compact');
                                                    updateResumeSetting('customFontSize', null);
                                                }}
                                            >
                                                <span className={styles.fontSizeLabel}>Compact</span>
                                                <span className={styles.fontSizeValue}>9pt</span>
                                                <span className={styles.fontSizePreview} style={{ fontSize: '9px' }}>Aa</span>
                                            </button>
                                            <button
                                                className={`${styles.fontSizeBtn} ${resumeSettings.fontSize === 'standard' && !resumeSettings.customFontSize ? styles.fontSizeBtnActive : ''}`}
                                                onClick={() => {
                                                    updateResumeSetting('fontSize', 'standard');
                                                    updateResumeSetting('customFontSize', null);
                                                }}
                                            >
                                                <span className={styles.fontSizeLabel}>Standard</span>
                                                <span className={styles.fontSizeValue}>11pt</span>
                                                <span className={styles.fontSizePreview} style={{ fontSize: '11px' }}>Aa</span>
                                            </button>
                                            <button
                                                className={`${styles.fontSizeBtn} ${resumeSettings.fontSize === 'large' && !resumeSettings.customFontSize ? styles.fontSizeBtnActive : ''}`}
                                                onClick={() => {
                                                    updateResumeSetting('fontSize', 'large');
                                                    updateResumeSetting('customFontSize', null);
                                                }}
                                            >
                                                <span className={styles.fontSizeLabel}>Large</span>
                                                <span className={styles.fontSizeValue}>13pt</span>
                                                <span className={styles.fontSizePreview} style={{ fontSize: '13px' }}>Aa</span>
                                            </button>
                                            <div className={`${styles.fontSizeCustom} ${resumeSettings.customFontSize ? styles.fontSizeCustomActive : ''}`}>
                                                <span className={styles.fontSizeLabel}>Custom</span>
                                                <div className={styles.customSizeInput}>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={resumeSettings.customFontSize || ''}
                                                        placeholder="11"
                                                        className={styles.customSizeField}
                                                        onChange={(e) => {
                                                            const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                                            if (rawVal === '') {
                                                                updateResumeSetting('customFontSize', null);
                                                                return;
                                                            }
                                                            const val = parseInt(rawVal);
                                                            if (!isNaN(val)) {
                                                                // Allow typing, clamp on blur
                                                                updateResumeSetting('customFontSize', val);
                                                                updateResumeSetting('fontSize', 'custom');
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val)) {
                                                                const clamped = Math.min(16, Math.max(8, val));
                                                                updateResumeSetting('customFontSize', clamped);
                                                            }
                                                        }}
                                                    />
                                                    <span className={styles.customSizeUnit}>pt</span>
                                                </div>
                                            </div>
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
                            {currentStep < 8 && (
                                <button 
                                    onClick={() => setCurrentStep(Math.min(8, currentStep + 1))}
                                    className={styles.btnPrimary}
                                >
                                    {currentStep === 7 ? 'Review CV' : 'Continue'}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Resize Handle */}
                    <div 
                        className={`${styles.resizeHandle} ${isResizing ? styles.resizeHandleActive : ''}`}
                        onMouseDown={handleResizeStart}
                    >
                        <div className={styles.resizeHandleLine}></div>
                    </div>

                    {/* Right Panel - Live Preview */}
                    <div 
                        className={styles.previewPanel}
                        style={{ width: `${100 - leftPanelWidth}%` }}
                    >
                        <LivePreviewPanel
                            cvData={formData}
                            templateId={selectedTemplate}
                            paperSize={resumeSettings.paperSize}
                            resumeSettings={resumeSettings}
                            sectionOrder={sectionOrder}
                            showControls={true}
                        />
                    </div>
                </div>
            )}

            {/* Step 8: Review & Download */}
            {currentStep === 8 && (
                <div className={styles.reviewSection}>
                    {/* Top Bar with Header, ATS Score, and Actions */}
                    <div className={styles.reviewTopBar}>
                        {/* Left: Back & Title */}
                        <div className={styles.reviewTopLeft}>
                            <button 
                                onClick={() => setCurrentStep(7)}
                                className={styles.btnIconSecondary}
                                title="Edit Settings"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className={styles.reviewTitleCompact}>
                                <div className={styles.successIconSmall}>
                                    <Check className="w-4 h-4" />
                                </div>
                                <span>Your CV is Ready!</span>
                            </div>
                        </div>

                        {/* Center: Ready Indicator */}
                        <div className={styles.atsScoreCompact}>
                            <div className={styles.readyBadge}>
                                <Check className="w-5 h-5" />
                            </div>
                            <span className={styles.atsScoreLabelSmall}>Ready to Save</span>
                        </div>

                        {/* Right: Actions */}
                        <div className={styles.reviewTopRight}>
                            <button 
                                onClick={handleSaveCV}
                                disabled={saving}
                                className={styles.btnSecondary}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={downloadPDF} className={styles.btnPrimary} disabled={downloading}>
                                {downloading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Main Content: Preview and Sidebar */}
                    <div className={styles.reviewMainContent}>
                        {/* CV Preview */}
                        <div className={styles.reviewPreviewContainer}>
                            <LivePreviewPanel
                                cvData={formData}
                                templateId={selectedTemplate}
                                paperSize={resumeSettings.paperSize}
                                resumeSettings={resumeSettings}
                                sectionOrder={sectionOrder}
                                showControls={true}
                                fitToScreen={true}
                            />
                        </div>

                        {/* Sidebar: Template Selector */}
                        <div className={styles.reviewSidebar}>
                            <div className={styles.templateSwitcherVertical}>
                                <span className={styles.templateSwitcherLabel}>Templates</span>
                                <div className={styles.templateSwitcherList}>
                                    {allTemplates.map(template => (
                                        <button 
                                            key={template}
                                            className={`${styles.templateBtnVertical} ${selectedTemplate === template ? styles.templateBtnActive : ''}`}
                                            onClick={() => setSelectedTemplate(template)}
                                        >
                                            {TEMPLATE_INFO[template]?.name || template}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
}
