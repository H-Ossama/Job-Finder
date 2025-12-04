/**
 * CV Templates Index
 * Export all template components for easy importing
 * Includes templates inspired by:
 * - Awesome-CV (posquit0)
 * - Reactive Resume (AmruthPillai)
 */

// Original Templates
export { default as ModernTemplate } from './ModernTemplate';
export { default as CreativeTemplate } from './CreativeTemplate';
export { default as MinimalistTemplate } from './MinimalistTemplate';
export { default as ExecutiveTemplate } from './ExecutiveTemplate';
export { default as TechTemplate } from './TechTemplate';

// New Templates (Inspired by Open Source Projects)
export { default as AwesomeTemplate } from './AwesomeTemplate';
export { default as PikachuTemplate } from './PikachuTemplate';
export { default as OnyxTemplate } from './OnyxTemplate';
export { default as AzurillTemplate } from './AzurillTemplate';

/**
 * Template mapping for dynamic rendering
 */
export const TEMPLATE_COMPONENTS = {
    modern: 'ModernTemplate',
    creative: 'CreativeTemplate',
    minimalist: 'MinimalistTemplate',
    executive: 'ExecutiveTemplate',
    tech: 'TechTemplate',
    // New templates
    awesome: 'AwesomeTemplate',
    pikachu: 'PikachuTemplate',
    onyx: 'OnyxTemplate',
    azurill: 'AzurillTemplate'
};

/**
 * Get template display info
 */
export const TEMPLATE_INFO = {
    modern: {
        id: 'modern',
        name: 'Modern',
        description: 'Clean single-column layout with gradient header',
        bestFor: 'Tech, Startup, Creative roles',
        thumbnail: '/templates/modern-thumb.png',
        hasPhoto: false
    },
    creative: {
        id: 'creative',
        name: 'Creative',
        description: 'Bold sidebar with accent colors and visual elements',
        bestFor: 'Design, Marketing, Media roles',
        thumbnail: '/templates/creative-thumb.png',
        hasPhoto: true
    },
    minimalist: {
        id: 'minimalist',
        name: 'Minimalist',
        description: 'Simple, clean, content-focused design',
        bestFor: 'Academic, Research, Consulting roles',
        thumbnail: '/templates/minimalist-thumb.png',
        hasPhoto: false
    },
    executive: {
        id: 'executive',
        name: 'Executive',
        description: 'Premium design with elegant header and gold accents',
        bestFor: 'C-Level, Directors, Senior Management',
        thumbnail: '/templates/executive-thumb.png',
        hasPhoto: false
    },
    tech: {
        id: 'tech',
        name: 'Tech',
        description: 'Terminal-style design with dark theme',
        bestFor: 'Software Engineers, DevOps, Data Scientists',
        thumbnail: '/templates/tech-thumb.png',
        hasPhoto: false
    },
    // New Templates
    awesome: {
        id: 'awesome',
        name: 'Awesome CV',
        description: 'LaTeX-inspired professional design with clean typography',
        bestFor: 'All industries, Corporate, Professional roles',
        thumbnail: '/templates/awesome-thumb.png',
        inspiration: 'posquit0/Awesome-CV',
        hasPhoto: true
    },
    pikachu: {
        id: 'pikachu',
        name: 'Pikachu',
        description: 'Bold header with primary color block and two-column layout',
        bestFor: 'Creative, Tech, Marketing roles',
        thumbnail: '/templates/pikachu-thumb.png',
        inspiration: 'Reactive Resume',
        hasPhoto: true
    },
    onyx: {
        id: 'onyx',
        name: 'Onyx',
        description: 'Clean professional layout with horizontal header and profiles',
        bestFor: 'Business, Corporate, Finance roles',
        thumbnail: '/templates/onyx-thumb.png',
        inspiration: 'Reactive Resume',
        hasPhoto: false
    },
    azurill: {
        id: 'azurill',
        name: 'Azurill',
        description: 'Centered header with emerald accents, minimalist style',
        bestFor: 'Academic, Research, Professional roles',
        thumbnail: '/templates/azurill-thumb.png',
        inspiration: 'Reactive Resume',
        hasPhoto: false
    }
};
