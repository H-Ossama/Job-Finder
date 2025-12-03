'use client';

import { useState } from 'react';
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
    Github
} from 'lucide-react';
import { saveCV } from '../actions';
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
        github: ''
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
            description: ''
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
            gpa: ''
        }
    ],
    skills: {
        technical: [],
        soft: []
    }
};

const steps = [
    { id: 1, name: 'Template', icon: Eye },
    { id: 2, name: 'Details', icon: User },
    { id: 3, name: 'Experience', icon: Briefcase },
    { id: 4, name: 'Review', icon: Check }
];

export default function CVBuilderContent({ user, profile }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(2);
    const [activeTab, setActiveTab] = useState('personal');
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

    // Update personal info
    const updatePersonalInfo = (field, value) => {
        setFormData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
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
                description: ''
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
                gpa: ''
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
                    [type]: [...prev.skills[type], newSkill.trim()]
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

    // AI Generate Summary
    const generateAISummary = async () => {
        setGeneratingAI(true);
        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'summary',
                    jobTitle: formData.experience[0]?.title || 'Professional',
                    yearsExperience: formData.experience.length * 2,
                    skills: [...formData.skills.technical, ...formData.skills.soft],
                    industry: 'Technology'
                })
            });

            const result = await response.json();
            if (result.success) {
                setAiSuggestion(result.content);
                setShowAiSuggestion(true);
            } else {
                // Fallback suggestion
                setAiSuggestion(`Results-driven ${formData.experience[0]?.title || 'professional'} with expertise in ${formData.skills.technical.slice(0, 3).join(', ') || 'various technologies'}. Passionate about delivering high-quality solutions and driving innovation. Proven track record of success in collaborative environments.`);
                setShowAiSuggestion(true);
            }
        } catch (error) {
            console.error('Error generating summary:', error);
            setAiSuggestion(`Results-driven ${formData.experience[0]?.title || 'professional'} with expertise in ${formData.skills.technical.slice(0, 3).join(', ') || 'various technologies'}. Passionate about delivering high-quality solutions and driving innovation.`);
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

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'skills', label: 'Skills', icon: Wrench }
    ];

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1">
                        <span className="text-gradient">Build Your CV</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Let AI help you create a professional CV in minutes</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className={styles.btnSecondary}>
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
                        <div key={step.id} className={styles.stepContainer}>
                            <div 
                                className={`${styles.step} ${
                                    currentStep > step.id ? styles.stepCompleted : 
                                    currentStep === step.id ? styles.stepActive : ''
                                }`}
                                onClick={() => setCurrentStep(step.id)}
                            >
                                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`${styles.stepLine} ${currentStep > step.id ? styles.stepLineCompleted : ''}`} />
                            )}
                        </div>
                    ))}
                </div>
                <div className={styles.stepLabels}>
                    {steps.map(step => (
                        <span key={step.id} className={styles.stepLabel}>{step.name}</span>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Panel - Form */}
                <div>
                    {/* Tabs */}
                    <div className={styles.tabsContainer}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Personal Info Tab */}
                    {activeTab === 'personal' && (
                        <div className={styles.formSection}>
                            <div className={styles.glassCard}>
                                <h3 className={styles.sectionTitle}>
                                    <User className="w-5 h-5 text-accent" />
                                    Personal Information
                                </h3>

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
                                    placeholder="Write a brief professional summary..."
                                    rows={4}
                                />

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

                    {/* Experience Tab */}
                    {activeTab === 'experience' && (
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
                                            {formData.experience.length > 1 && (
                                                <button 
                                                    onClick={() => removeExperience(exp.id)}
                                                    className={styles.removeBtn}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
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
                                                <label className={styles.formLabel}>Description</label>
                                                <textarea
                                                    className={styles.formTextarea}
                                                    value={exp.description}
                                                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                                    placeholder="Describe your responsibilities and achievements..."
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education Tab */}
                    {activeTab === 'education' && (
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills Tab */}
                    {activeTab === 'skills' && (
                        <div className={styles.formSection}>
                            {/* Technical Skills */}
                            <div className={styles.glassCard}>
                                <h3 className={styles.sectionTitle}>Technical Skills</h3>
                                <div className={styles.skillTags}>
                                    {formData.skills.technical.map(skill => (
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
                                        placeholder="Add a skill..."
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
                                        {['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'PostgreSQL'].map(skill => (
                                            !formData.skills.technical.includes(skill) && (
                                                <button 
                                                    key={skill}
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        skills: {
                                                            ...prev.skills,
                                                            technical: [...prev.skills.technical, skill]
                                                        }
                                                    }))}
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
                                    {formData.skills.soft.map(skill => (
                                        <span key={skill} className={styles.skillTag}>
                                            {skill}
                                            <button onClick={() => removeSkill('soft', skill)} className={styles.skillRemove}>
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className={styles.suggestedSkills}>
                                    {['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Critical Thinking'].map(skill => (
                                        !formData.skills.soft.includes(skill) && (
                                            <button 
                                                key={skill}
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    skills: {
                                                        ...prev.skills,
                                                        soft: [...prev.skills.soft, skill]
                                                    }
                                                }))}
                                                className={styles.suggestedSkill}
                                            >
                                                + {skill}
                                            </button>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Live Preview */}
                <div className="hidden lg:block">
                    <div className={styles.previewContainer}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Live Preview</h3>
                            <div className="flex gap-2">
                                <button className={`${styles.templateBtn} ${selectedTemplate === 'modern' ? styles.templateBtnActive : ''}`}
                                    onClick={() => setSelectedTemplate('modern')}>
                                    Modern
                                </button>
                                <button className={`${styles.templateBtn} ${selectedTemplate === 'classic' ? styles.templateBtnActive : ''}`}
                                    onClick={() => setSelectedTemplate('classic')}>
                                    Classic
                                </button>
                                <button className={`${styles.templateBtn} ${selectedTemplate === 'creative' ? styles.templateBtnActive : ''}`}
                                    onClick={() => setSelectedTemplate('creative')}>
                                    Creative
                                </button>
                            </div>
                        </div>

                        <div className={styles.cvPreviewPanel}>
                            {/* CV Preview Header */}
                            <header className={styles.cvHeader}>
                                <h1 className={styles.cvName}>
                                    {formData.personalInfo.firstName || 'John'} {formData.personalInfo.lastName || 'Doe'}
                                </h1>
                                <div className={styles.cvContact}>
                                    {formData.personalInfo.email && (
                                        <span><Mail className="w-3 h-3" /> {formData.personalInfo.email}</span>
                                    )}
                                    {formData.personalInfo.phone && (
                                        <span><Phone className="w-3 h-3" /> {formData.personalInfo.phone}</span>
                                    )}
                                    {formData.personalInfo.location && (
                                        <span><MapPin className="w-3 h-3" /> {formData.personalInfo.location}</span>
                                    )}
                                </div>
                                <div className={styles.cvSocials}>
                                    {formData.personalInfo.linkedin && (
                                        <span><Linkedin className="w-3 h-3" /> {formData.personalInfo.linkedin}</span>
                                    )}
                                    {formData.personalInfo.github && (
                                        <span><Github className="w-3 h-3" /> {formData.personalInfo.github}</span>
                                    )}
                                </div>
                            </header>

                            {/* Summary */}
                            {formData.summary && (
                                <section className={styles.cvSection}>
                                    <h2 className={styles.cvSectionTitle}>Professional Summary</h2>
                                    <p className={styles.cvSummary}>{formData.summary}</p>
                                </section>
                            )}

                            {/* Experience */}
                            {formData.experience.some(exp => exp.company || exp.title) && (
                                <section className={styles.cvSection}>
                                    <h2 className={styles.cvSectionTitle}>Experience</h2>
                                    {formData.experience.filter(exp => exp.company || exp.title).map(exp => (
                                        <div key={exp.id} className={styles.cvExperienceItem}>
                                            <div className={styles.cvExpHeader}>
                                                <strong>{exp.title || 'Position'}</strong>
                                                <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                                            </div>
                                            <div className={styles.cvExpCompany}>{exp.company}</div>
                                            {exp.description && <p className={styles.cvExpDesc}>{exp.description}</p>}
                                        </div>
                                    ))}
                                </section>
                            )}

                            {/* Education */}
                            {formData.education.some(edu => edu.school || edu.degree) && (
                                <section className={styles.cvSection}>
                                    <h2 className={styles.cvSectionTitle}>Education</h2>
                                    {formData.education.filter(edu => edu.school || edu.degree).map(edu => (
                                        <div key={edu.id} className={styles.cvEducationItem}>
                                            <div className={styles.cvExpHeader}>
                                                <strong>{edu.degree} {edu.field && `in ${edu.field}`}</strong>
                                                <span>{edu.startDate} - {edu.endDate}</span>
                                            </div>
                                            <div className={styles.cvExpCompany}>{edu.school}</div>
                                        </div>
                                    ))}
                                </section>
                            )}

                            {/* Skills */}
                            {(formData.skills.technical.length > 0 || formData.skills.soft.length > 0) && (
                                <section className={styles.cvSection}>
                                    <h2 className={styles.cvSectionTitle}>Skills</h2>
                                    <div className={styles.cvSkills}>
                                        {[...formData.skills.technical, ...formData.skills.soft].map(skill => (
                                            <span key={skill} className={styles.cvSkillTag}>{skill}</span>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
