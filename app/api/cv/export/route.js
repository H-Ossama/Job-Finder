import { NextResponse } from 'next/server';
import { getTemplateStyles } from '@/utils/cv/templates';

/**
 * POST /api/cv/export
 * Generate CV HTML for PDF export
 */
export async function POST(request) {
    try {
        const { cvData, templateId } = await request.json();
        
        if (!cvData) {
            return NextResponse.json(
                { error: 'CV data is required' },
                { status: 400 }
            );
        }

        const styles = getTemplateStyles(templateId || 'modern');
        const html = generateCVHTML(cvData, styles);

        return NextResponse.json({
            success: true,
            html
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json(
            { error: 'Failed to generate CV' },
            { status: 500 }
        );
    }
}

/**
 * Generate print-ready HTML for the CV
 */
function generateCVHTML(cvData, styles) {
    const { personalInfo, summary, experience, education, skills, projects } = cvData;

    const formatDate = (date) => {
        if (!date) return '';
        if (date.includes('-')) {
            const [year, month] = date.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(month) - 1] || ''} ${year}`;
        }
        return date;
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''} - CV</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Georgia&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${styles.fontFamily};
            font-size: ${styles.fontSize};
            line-height: ${styles.lineHeight};
            color: ${styles.bodyTextColor};
            background: ${styles.bodyBg};
            padding: 40px;
        }
        
        .cv-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
        }
        
        header {
            background: ${styles.headerBg};
            color: ${styles.headerTextColor};
            padding: ${styles.headerBg === 'transparent' ? '0 0 20px 0' : '24px'};
            margin-bottom: ${styles.sectionSpacing};
            border-radius: ${styles.headerBg === 'transparent' ? '0' : '8px'};
        }
        
        h1 {
            font-family: ${styles.headingFontFamily};
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 12px;
        }
        
        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            font-size: 0.85em;
            opacity: 0.9;
        }
        
        .social-links {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            font-size: 0.8em;
            margin-top: 8px;
            opacity: 0.85;
        }
        
        section {
            margin-bottom: ${styles.sectionSpacing};
        }
        
        h2 {
            font-family: ${styles.headingFontFamily};
            font-size: 14px;
            font-weight: 700;
            color: ${styles.sectionTitleColor};
            margin-bottom: 12px;
            padding-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 1px;
            ${styles.sectionTitleStyle}
        }
        
        .experience-item, .education-item {
            margin-bottom: ${styles.itemSpacing};
            padding-bottom: ${styles.itemSpacing};
            border-bottom: 1px solid #eee;
        }
        
        .experience-item:last-child, .education-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4px;
        }
        
        .item-title {
            font-weight: 600;
            color: ${styles.bodyTextColor};
        }
        
        .item-date {
            font-size: 0.85em;
            color: #6b7280;
            white-space: nowrap;
        }
        
        .item-subtitle {
            font-size: 0.9em;
            color: ${styles.accentColor};
            margin-bottom: 8px;
        }
        
        .item-description {
            font-size: 0.9em;
            line-height: 1.5;
            color: #4b5563;
        }
        
        .bullets {
            margin: 8px 0 0 0;
            padding-left: 20px;
            font-size: 0.9em;
            line-height: 1.5;
            color: #4b5563;
        }
        
        .bullets li {
            margin-bottom: 4px;
        }
        
        .skills-row {
            margin-bottom: 8px;
        }
        
        .skills-row strong {
            font-size: 0.9em;
        }
        
        .skills-row span {
            font-size: 0.9em;
            color: #4b5563;
        }
        
        @media print {
            body {
                padding: 0;
            }
            .cv-container {
                padding: 20px;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="cv-container">
        <header>
            <h1>${personalInfo?.firstName || 'Your'} ${personalInfo?.lastName || 'Name'}</h1>
            <div class="contact-info">
                ${personalInfo?.email ? `<span>📧 ${personalInfo.email}</span>` : ''}
                ${personalInfo?.phone ? `<span>📱 ${personalInfo.phone}</span>` : ''}
                ${personalInfo?.location ? `<span>📍 ${personalInfo.location}</span>` : ''}
            </div>
            ${(personalInfo?.linkedin || personalInfo?.github || personalInfo?.website) ? `
            <div class="social-links">
                ${personalInfo?.linkedin ? `<span>LinkedIn: ${personalInfo.linkedin}</span>` : ''}
                ${personalInfo?.github ? `<span>GitHub: ${personalInfo.github}</span>` : ''}
                ${personalInfo?.website ? `<span>Web: ${personalInfo.website}</span>` : ''}
            </div>
            ` : ''}
        </header>

        ${summary ? `
        <section>
            <h2>Professional Summary</h2>
            <p>${summary}</p>
        </section>
        ` : ''}

        ${experience?.some(exp => exp.company || exp.title) ? `
        <section>
            <h2>Professional Experience</h2>
            ${experience.filter(exp => exp.company || exp.title).map(exp => `
                <div class="experience-item">
                    <div class="item-header">
                        <span class="item-title">${exp.title || 'Position Title'}</span>
                        <span class="item-date">${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                    </div>
                    <div class="item-subtitle">${exp.company}${exp.location ? ` • ${exp.location}` : ''}</div>
                    ${exp.description ? `<p class="item-description">${exp.description}</p>` : ''}
                    ${exp.bullets?.length ? `
                        <ul class="bullets">
                            ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}

        ${education?.some(edu => edu.school || edu.degree) ? `
        <section>
            <h2>Education</h2>
            ${education.filter(edu => edu.school || edu.degree).map(edu => `
                <div class="education-item">
                    <div class="item-header">
                        <span class="item-title">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</span>
                        <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
                    </div>
                    <div class="item-subtitle">${edu.school}</div>
                    ${edu.gpa ? `<p class="item-description">GPA: ${edu.gpa}</p>` : ''}
                    ${edu.honors ? `<p class="item-description">${edu.honors}</p>` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}

        ${(skills?.technical?.length || skills?.soft?.length || skills?.certifications?.length) ? `
        <section>
            <h2>Skills</h2>
            ${skills?.technical?.length ? `
                <div class="skills-row">
                    <strong>Technical: </strong>
                    <span>${skills.technical.join(' • ')}</span>
                </div>
            ` : ''}
            ${skills?.soft?.length ? `
                <div class="skills-row">
                    <strong>Soft Skills: </strong>
                    <span>${skills.soft.join(' • ')}</span>
                </div>
            ` : ''}
            ${skills?.languages?.length ? `
                <div class="skills-row">
                    <strong>Languages: </strong>
                    <span>${skills.languages.join(' • ')}</span>
                </div>
            ` : ''}
            ${skills?.certifications?.length ? `
                <div class="skills-row">
                    <strong>Certifications: </strong>
                    <span>${skills.certifications.join(' • ')}</span>
                </div>
            ` : ''}
        </section>
        ` : ''}

        ${projects?.length ? `
        <section>
            <h2>Projects</h2>
            ${projects.map(project => `
                <div class="experience-item">
                    <div class="item-header">
                        <span class="item-title">${project.name}</span>
                        ${project.link ? `<span class="item-date">${project.link}</span>` : ''}
                    </div>
                    ${project.description ? `<p class="item-description">${project.description}</p>` : ''}
                    ${project.technologies?.length ? `
                        <p class="item-description" style="margin-top: 4px;">
                            <strong>Technologies:</strong> ${project.technologies.join(', ')}
                        </p>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}
    </div>
</body>
</html>
`;
}
