/**
 * CV Templates System
 * ATS-optimized CV templates with different visual styles
 * Includes templates inspired by:
 * - Awesome-CV (posquit0/Awesome-CV)
 * - Reactive Resume (AmruthPillai/Reactive-Resume)
 */

export const CV_TEMPLATES = {
    modern: {
        id: 'modern',
        name: 'Modern',
        description: 'Clean, contemporary design with subtle accents',
        preview: '/templates/modern-preview.png',
        atsScore: 95,
        features: ['Clean layout', 'ATS-friendly', 'Professional fonts', 'Subtle color accents'],
        styles: {
            // Header styles
            headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            headerTextColor: '#ffffff',
            // Section styles
            sectionTitleColor: '#667eea',
            sectionTitleStyle: 'border-bottom: 2px solid #667eea',
            // Body styles
            bodyBg: '#ffffff',
            bodyTextColor: '#333333',
            // Accent colors
            accentColor: '#667eea',
            linkColor: '#764ba2',
            // Typography
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            headingFontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontSize: '10pt',
            lineHeight: '1.5',
            // Spacing
            sectionSpacing: '16px',
            itemSpacing: '12px'
        }
    },
    professional: {
        id: 'professional',
        name: 'Professional',
        description: 'Traditional format perfect for corporate roles',
        preview: '/templates/professional-preview.png',
        atsScore: 98,
        features: ['Traditional layout', 'Maximum ATS compatibility', 'Conservative design', 'Clear hierarchy'],
        styles: {
            headerBg: '#1a1a2e',
            headerTextColor: '#ffffff',
            sectionTitleColor: '#1a1a2e',
            sectionTitleStyle: 'border-bottom: 1px solid #1a1a2e; text-transform: uppercase; letter-spacing: 2px',
            bodyBg: '#ffffff',
            bodyTextColor: '#333333',
            accentColor: '#1a1a2e',
            linkColor: '#2563eb',
            fontFamily: "'Times New Roman', Georgia, serif",
            headingFontFamily: "'Georgia', serif",
            fontSize: '11pt',
            lineHeight: '1.6',
            sectionSpacing: '20px',
            itemSpacing: '14px'
        }
    },
    creative: {
        id: 'creative',
        name: 'Creative',
        description: 'Distinctive design for creative industries',
        preview: '/templates/creative-preview.png',
        atsScore: 88,
        features: ['Unique layout', 'Visual appeal', 'Sidebar design', 'Color blocks'],
        styles: {
            headerBg: '#f59e0b',
            headerTextColor: '#1a1a2e',
            sectionTitleColor: '#f59e0b',
            sectionTitleStyle: 'background: #fef3c7; padding: 4px 12px; border-radius: 4px',
            bodyBg: '#ffffff',
            bodyTextColor: '#374151',
            accentColor: '#f59e0b',
            linkColor: '#d97706',
            fontFamily: "'Poppins', 'Segoe UI', sans-serif",
            headingFontFamily: "'Poppins', 'Segoe UI', sans-serif",
            fontSize: '10pt',
            lineHeight: '1.5',
            sectionSpacing: '18px',
            itemSpacing: '12px'
        }
    },
    minimalist: {
        id: 'minimalist',
        name: 'Minimalist',
        description: 'Simple, elegant design with focus on content',
        preview: '/templates/minimalist-preview.png',
        atsScore: 97,
        features: ['Clean whitespace', 'High readability', 'Simple typography', 'No distractions'],
        styles: {
            headerBg: 'transparent',
            headerTextColor: '#111827',
            sectionTitleColor: '#111827',
            sectionTitleStyle: 'font-weight: 600; letter-spacing: 1px',
            bodyBg: '#ffffff',
            bodyTextColor: '#4b5563',
            accentColor: '#6b7280',
            linkColor: '#111827',
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            headingFontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: '10pt',
            lineHeight: '1.6',
            sectionSpacing: '24px',
            itemSpacing: '16px'
        }
    },
    executive: {
        id: 'executive',
        name: 'Executive',
        description: 'Sophisticated design for senior positions',
        preview: '/templates/executive-preview.png',
        atsScore: 94,
        features: ['Premium look', 'Authority presence', 'Elegant typography', 'Refined details'],
        styles: {
            headerBg: '#0f172a',
            headerTextColor: '#f8fafc',
            sectionTitleColor: '#0f172a',
            sectionTitleStyle: 'border-left: 3px solid #0f172a; padding-left: 12px',
            bodyBg: '#ffffff',
            bodyTextColor: '#334155',
            accentColor: '#0f172a',
            linkColor: '#1e40af',
            fontFamily: "'Crimson Text', Georgia, serif",
            headingFontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '11pt',
            lineHeight: '1.7',
            sectionSpacing: '22px',
            itemSpacing: '14px'
        }
    },
    tech: {
        id: 'tech',
        name: 'Tech',
        description: 'Modern design optimized for tech roles',
        preview: '/templates/tech-preview.png',
        atsScore: 93,
        features: ['Code-inspired', 'Skills showcase', 'Modern aesthetics', 'Tech-friendly'],
        styles: {
            headerBg: '#18181b',
            headerTextColor: '#a3e635',
            sectionTitleColor: '#18181b',
            sectionTitleStyle: 'background: #f4f4f5; padding: 6px 12px; border-radius: 6px; font-family: monospace',
            bodyBg: '#ffffff',
            bodyTextColor: '#3f3f46',
            accentColor: '#a3e635',
            linkColor: '#2563eb',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            headingFontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontSize: '10pt',
            lineHeight: '1.5',
            sectionSpacing: '18px',
            itemSpacing: '12px'
        }
    },
    // NEW TEMPLATES - Inspired by Open Source Projects
    awesome: {
        id: 'awesome',
        name: 'Awesome CV',
        description: 'LaTeX-inspired professional design (inspired by Awesome-CV)',
        preview: '/templates/awesome-preview.png',
        atsScore: 96,
        features: ['LaTeX-style', 'Clean typography', 'Professional', 'Tabular skills'],
        inspiration: 'posquit0/Awesome-CV',
        styles: {
            headerBg: 'transparent',
            headerTextColor: '#333333',
            sectionTitleColor: '#333333',
            sectionTitleStyle: 'border-bottom: 1px solid; border-image: linear-gradient(to right, #0395DE 30%, #ddd 30%) 1',
            bodyBg: '#ffffff',
            bodyTextColor: '#444444',
            accentColor: '#0395DE',
            linkColor: '#0395DE',
            fontFamily: "'Source Sans Pro', 'Roboto', sans-serif",
            headingFontFamily: "'Source Sans Pro', 'Roboto', sans-serif",
            fontSize: '10pt',
            lineHeight: '1.4',
            sectionSpacing: '18px',
            itemSpacing: '14px'
        }
    },
    pikachu: {
        id: 'pikachu',
        name: 'Pikachu',
        description: 'Bold header with two-column layout (inspired by Reactive Resume)',
        preview: '/templates/pikachu-preview.png',
        atsScore: 91,
        features: ['Bold header', 'Two-column', 'Modern', 'Eye-catching'],
        inspiration: 'AmruthPillai/Reactive-Resume',
        styles: {
            headerBg: '#dc2626',
            headerTextColor: '#ffffff',
            sectionTitleColor: '#dc2626',
            sectionTitleStyle: 'border-bottom: 2px solid #dc2626',
            bodyBg: '#ffffff',
            bodyTextColor: '#333333',
            accentColor: '#dc2626',
            linkColor: '#dc2626',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            headingFontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontSize: '10pt',
            lineHeight: '1.5',
            sectionSpacing: '20px',
            itemSpacing: '16px'
        }
    },
    onyx: {
        id: 'onyx',
        name: 'Onyx',
        description: 'Professional indigo-themed layout (inspired by Reactive Resume)',
        preview: '/templates/onyx-preview.png',
        atsScore: 95,
        features: ['Professional', 'Indigo accents', 'Clean sections', 'Profile links'],
        inspiration: 'AmruthPillai/Reactive-Resume',
        styles: {
            headerBg: '#ffffff',
            headerTextColor: '#111827',
            sectionTitleColor: '#6366f1',
            sectionTitleStyle: 'border-bottom: 1px solid #e5e7eb; text-transform: uppercase',
            bodyBg: '#ffffff',
            bodyTextColor: '#1f2937',
            accentColor: '#6366f1',
            linkColor: '#6366f1',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            headingFontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontSize: '10pt',
            lineHeight: '1.5',
            sectionSpacing: '20px',
            itemSpacing: '14px'
        }
    },
    azurill: {
        id: 'azurill',
        name: 'Azurill',
        description: 'Centered header with emerald theme (inspired by Reactive Resume)',
        preview: '/templates/azurill-preview.png',
        atsScore: 94,
        features: ['Centered header', 'Emerald theme', 'Academic-friendly', 'Clean sections'],
        inspiration: 'AmruthPillai/Reactive-Resume',
        styles: {
            headerBg: '#ffffff',
            headerTextColor: '#111827',
            sectionTitleColor: '#111827',
            sectionTitleStyle: 'border-bottom: 1px solid #e5e7eb',
            bodyBg: '#ffffff',
            bodyTextColor: '#374151',
            accentColor: '#10b981',
            linkColor: '#10b981',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            headingFontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontSize: '10pt',
            lineHeight: '1.5',
            sectionSpacing: '18px',
            itemSpacing: '14px'
        }
    },
    bronzor: {
        id: 'bronzor',
        name: 'Bronzor',
        description: 'Dark sidebar with amber accents (inspired by Reactive Resume)',
        preview: '/templates/bronzor-preview.png',
        atsScore: 89,
        features: ['Dark sidebar', 'Two-column', 'Amber accents', 'Photo support'],
        inspiration: 'AmruthPillai/Reactive-Resume',
        styles: {
            headerBg: '#1e293b',
            headerTextColor: '#ffffff',
            sectionTitleColor: '#0f172a',
            sectionTitleStyle: 'border-bottom: 2px solid #f59e0b',
            bodyBg: '#ffffff',
            bodyTextColor: '#1e293b',
            accentColor: '#f59e0b',
            linkColor: '#f59e0b',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            headingFontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontSize: '10pt',
            lineHeight: '1.5',
            sectionSpacing: '18px',
            itemSpacing: '14px'
        }
    }
};

/**
 * Get all available templates
 * @returns {Array} Array of template objects
 */
export function getAllTemplates() {
    return Object.values(CV_TEMPLATES);
}

/**
 * Get a specific template by ID
 * @param {string} templateId - The template ID
 * @returns {Object|null} The template object or null
 */
export function getTemplate(templateId) {
    return CV_TEMPLATES[templateId] || CV_TEMPLATES.modern;
}

/**
 * Get template styles for rendering
 * @param {string} templateId - The template ID
 * @returns {Object} The template styles
 */
export function getTemplateStyles(templateId) {
    const template = getTemplate(templateId);
    return template.styles;
}

/**
 * ATS Keywords by Industry
 * Common keywords that ATS systems look for
 */
export const ATS_KEYWORDS = {
    technology: {
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Agile', 'Scrum', 'Git', 'REST API', 'SQL', 'NoSQL', 'Machine Learning', 'Cloud Computing'],
        verbs: ['Developed', 'Engineered', 'Architected', 'Implemented', 'Optimized', 'Automated', 'Deployed', 'Integrated', 'Designed', 'Built'],
        terms: ['Full-stack', 'DevOps', 'Microservices', 'Scalability', 'Performance', 'Security', 'Data structures', 'Algorithms']
    },
    marketing: {
        skills: ['SEO', 'SEM', 'Google Analytics', 'Content Marketing', 'Social Media', 'Email Marketing', 'PPC', 'CRM', 'Marketing Automation', 'A/B Testing', 'Brand Management'],
        verbs: ['Launched', 'Increased', 'Generated', 'Grew', 'Managed', 'Executed', 'Analyzed', 'Optimized', 'Created', 'Developed'],
        terms: ['ROI', 'Conversion Rate', 'Lead Generation', 'Brand Awareness', 'Customer Acquisition', 'Market Research']
    },
    finance: {
        skills: ['Financial Analysis', 'Excel', 'Financial Modeling', 'Budgeting', 'Forecasting', 'SAP', 'QuickBooks', 'Risk Management', 'Compliance', 'Auditing'],
        verbs: ['Analyzed', 'Managed', 'Reduced', 'Increased', 'Streamlined', 'Reported', 'Forecasted', 'Audited', 'Reconciled', 'Optimized'],
        terms: ['P&L', 'Balance Sheet', 'Cash Flow', 'GAAP', 'SOX Compliance', 'Cost Reduction', 'Revenue Growth']
    },
    healthcare: {
        skills: ['Patient Care', 'EMR/EHR', 'HIPAA', 'Clinical Documentation', 'Medical Terminology', 'Care Coordination', 'Quality Assurance'],
        verbs: ['Administered', 'Coordinated', 'Assessed', 'Monitored', 'Documented', 'Educated', 'Collaborated', 'Implemented'],
        terms: ['Patient Outcomes', 'Quality Metrics', 'Regulatory Compliance', 'Patient Safety', 'Clinical Excellence']
    },
    sales: {
        skills: ['CRM', 'Salesforce', 'Lead Generation', 'Pipeline Management', 'Negotiation', 'Account Management', 'Business Development'],
        verbs: ['Exceeded', 'Closed', 'Generated', 'Achieved', 'Negotiated', 'Expanded', 'Developed', 'Built', 'Grew', 'Secured'],
        terms: ['Quota', 'Revenue Target', 'Client Retention', 'Market Expansion', 'Strategic Partnerships', 'Sales Funnel']
    },
    general: {
        skills: ['Microsoft Office', 'Project Management', 'Communication', 'Leadership', 'Problem-solving', 'Time Management', 'Teamwork'],
        verbs: ['Led', 'Managed', 'Coordinated', 'Implemented', 'Achieved', 'Improved', 'Developed', 'Created', 'Established', 'Delivered'],
        terms: ['Cross-functional', 'Stakeholder Management', 'Process Improvement', 'Best Practices', 'Strategic Planning']
    }
};

/**
 * Get ATS keywords for a specific industry
 * @param {string} industry - The industry name
 * @returns {Object} Keywords object with skills, verbs, and terms
 */
export function getATSKeywords(industry) {
    const normalizedIndustry = industry?.toLowerCase() || 'general';
    return ATS_KEYWORDS[normalizedIndustry] || ATS_KEYWORDS.general;
}

/**
 * ATS Best Practices
 */
export const ATS_BEST_PRACTICES = [
    {
        category: 'Format',
        tips: [
            'Use standard section headings (Experience, Education, Skills)',
            'Avoid tables, text boxes, and multi-column layouts',
            'Use common fonts (Arial, Calibri, Times New Roman)',
            'Save as PDF for best compatibility',
            'Keep file size under 2MB'
        ]
    },
    {
        category: 'Content',
        tips: [
            'Include keywords from the job description',
            'Use standard job titles',
            'Spell out acronyms at first mention',
            'Include both hard and soft skills',
            'Quantify achievements with numbers and percentages'
        ]
    },
    {
        category: 'Structure',
        tips: [
            'Put most relevant information first',
            'Use reverse chronological order for experience',
            'Keep education section concise unless recent graduate',
            'Include a skills section with relevant keywords',
            'Use bullet points for easy scanning'
        ]
    }
];

/**
 * Default CV structure for new CVs
 */
export const DEFAULT_CV_STRUCTURE = {
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
    projects: [],
    awards: [],
    publications: []
};

/**
 * Calculate completeness score for a CV
 * @param {Object} cvData - The CV data
 * @returns {Object} Completeness score and details
 */
export function calculateCompleteness(cvData) {
    const checks = [
        { name: 'Name', weight: 10, check: () => cvData.personalInfo?.firstName && cvData.personalInfo?.lastName },
        { name: 'Email', weight: 10, check: () => cvData.personalInfo?.email },
        { name: 'Phone', weight: 5, check: () => cvData.personalInfo?.phone },
        { name: 'Location', weight: 5, check: () => cvData.personalInfo?.location },
        { name: 'Summary', weight: 15, check: () => cvData.summary?.length > 50 },
        { name: 'Experience', weight: 25, check: () => cvData.experience?.some(e => e.company && e.title) },
        { name: 'Education', weight: 15, check: () => cvData.education?.some(e => e.school && e.degree) },
        { name: 'Technical Skills', weight: 10, check: () => cvData.skills?.technical?.length >= 3 },
        { name: 'Soft Skills', weight: 5, check: () => cvData.skills?.soft?.length >= 2 }
    ];

    let score = 0;
    const completed = [];
    const missing = [];

    checks.forEach(item => {
        if (item.check()) {
            score += item.weight;
            completed.push(item.name);
        } else {
            missing.push(item.name);
        }
    });

    return {
        score,
        completed,
        missing,
        isComplete: score >= 80
    };
}
