'use client';

/**
 * Pikachu Template - Inspired by Reactive Resume (AmruthPillai)
 * Bold header with primary color block, sidebar-style layout
 * Best for: Creative, Tech, Marketing roles
 */
export default function PikachuTemplate({ cvData }) {
    const { personalInfo, summary, experience, education, skills, projects, awards } = cvData || {};

    const formatDate = (date) => {
        if (!date) return '';
        if (date.includes('-')) {
            const [year, month] = date.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(month) - 1] || ''} ${year}`;
        }
        return date;
    };

    return (
        <div className="cv-pikachu">
            {/* Bold Header Block */}
            <header className="cv-header">
                <div className="header-content">
                    {personalInfo?.photo && (
                        <div className="photo-container">
                            <div className="photo" style={{ backgroundImage: `url(${personalInfo.photo})` }}></div>
                        </div>
                    )}
                    <div className="header-info">
                        <h1 className="cv-name">
                            {personalInfo?.firstName || 'Your'} {personalInfo?.lastName || 'Name'}
                        </h1>
                        {personalInfo?.title && <p className="cv-headline">{personalInfo.title}</p>}
                    </div>
                </div>
                
                {/* Contact Info Bar */}
                <div className="contact-bar">
                    {personalInfo?.email && (
                        <span className="contact-item">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
                                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            {personalInfo.email}
                        </span>
                    )}
                    {personalInfo?.phone && (
                        <span className="contact-item">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                            {personalInfo.phone}
                        </span>
                    )}
                    {personalInfo?.location && (
                        <span className="contact-item">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            {personalInfo.location}
                        </span>
                    )}
                    {personalInfo?.linkedin && (
                        <span className="contact-item">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            {personalInfo.linkedin}
                        </span>
                    )}
                    {personalInfo?.github && (
                        <span className="contact-item">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            {personalInfo.github}
                        </span>
                    )}
                </div>
            </header>

            <main className="cv-body">
                {/* Summary */}
                {summary && (
                    <section className="cv-section summary-section">
                        <div className="section-content">
                            <p className="summary-text">{summary}</p>
                        </div>
                    </section>
                )}

                {/* Two Column Layout */}
                <div className="two-columns">
                    {/* Main Column */}
                    <div className="main-column">
                        {/* Experience */}
                        {experience?.some(exp => exp.company || exp.title) && (
                            <section className="cv-section">
                                <h2 className="section-title">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="section-icon">
                                        <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                                    </svg>
                                    Experience
                                </h2>
                                {experience.filter(exp => exp.company || exp.title).map((exp, idx) => (
                                    <div key={idx} className="entry">
                                        <div className="entry-header">
                                            <div className="entry-main">
                                                <h3 className="entry-title">{exp.title}</h3>
                                                <p className="entry-org">{exp.company}</p>
                                            </div>
                                            <div className="entry-meta">
                                                <span className="entry-date">
                                                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                                                </span>
                                                {exp.location && <span className="entry-location">{exp.location}</span>}
                                            </div>
                                        </div>
                                        {exp.description && <p className="entry-desc">{exp.description}</p>}
                                        {exp.bullets?.length > 0 && (
                                            <ul className="entry-bullets">
                                                {exp.bullets.map((bullet, i) => (
                                                    <li key={i}>{bullet}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Projects */}
                        {projects?.length > 0 && projects.some(p => p.name) && (
                            <section className="cv-section">
                                <h2 className="section-title">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="section-icon">
                                        <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10H6v-2h8v2zm4-4H6v-2h12v2z"/>
                                    </svg>
                                    Projects
                                </h2>
                                {projects.filter(p => p.name).map((project, idx) => (
                                    <div key={idx} className="entry">
                                        <div className="entry-header">
                                            <h3 className="entry-title">{project.name}</h3>
                                            {project.url && <span className="entry-link">{project.url}</span>}
                                        </div>
                                        {project.description && <p className="entry-desc">{project.description}</p>}
                                        {project.technologies && (
                                            <div className="tech-tags">
                                                {project.technologies.split(',').map((tech, i) => (
                                                    <span key={i} className="tech-tag">{tech.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>

                    {/* Side Column */}
                    <div className="side-column">
                        {/* Education */}
                        {education?.some(edu => edu.school || edu.degree) && (
                            <section className="cv-section">
                                <h2 className="section-title">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="section-icon">
                                        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                                    </svg>
                                    Education
                                </h2>
                                {education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                                    <div key={idx} className="entry compact">
                                        <h3 className="entry-title">{edu.degree}</h3>
                                        {edu.field && <p className="entry-field">{edu.field}</p>}
                                        <p className="entry-org">{edu.school}</p>
                                        <span className="entry-date">
                                            {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                        </span>
                                        {edu.gpa && <p className="entry-gpa">GPA: {edu.gpa}</p>}
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Skills */}
                        {(skills?.technical?.length > 0 || skills?.soft?.length > 0) && (
                            <section className="cv-section">
                                <h2 className="section-title">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="section-icon">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                    Skills
                                </h2>
                                {skills?.technical?.length > 0 && (
                                    <div className="skill-group">
                                        <h4>Technical</h4>
                                        <div className="skill-tags">
                                            {skills.technical.map((skill, i) => (
                                                <span key={i} className="skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {skills?.soft?.length > 0 && (
                                    <div className="skill-group">
                                        <h4>Soft Skills</h4>
                                        <div className="skill-tags">
                                            {skills.soft.map((skill, i) => (
                                                <span key={i} className="skill-tag soft">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {skills?.languages?.length > 0 && (
                                    <div className="skill-group">
                                        <h4>Languages</h4>
                                        <div className="skill-tags">
                                            {skills.languages.map((lang, i) => (
                                                <span key={i} className="skill-tag lang">{lang}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Awards */}
                        {awards?.length > 0 && awards.some(a => a.title) && (
                            <section className="cv-section">
                                <h2 className="section-title">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="section-icon">
                                        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
                                    </svg>
                                    Awards
                                </h2>
                                {awards.filter(a => a.title).map((award, idx) => (
                                    <div key={idx} className="entry compact">
                                        <h3 className="entry-title">{award.title}</h3>
                                        <p className="entry-org">{award.issuer}</p>
                                        <span className="entry-date">{award.date}</span>
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .cv-pikachu {
                    font-family: 'Inter', 'Segoe UI', sans-serif;
                    background: white;
                    color: #333;
                    min-height: 100%;
                    font-size: 10pt;
                }

                .cv-header {
                    background: #dc2626;
                    color: white;
                    padding: 0;
                }

                .header-content {
                    padding: 24px 32px 16px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .photo-container {
                    flex-shrink: 0;
                }

                .photo {
                    width: 80px;
                    height: 80px;
                    border-radius: 8px;
                    background-size: cover;
                    background-position: center;
                    border: 3px solid rgba(255,255,255,0.3);
                }

                .header-info {
                    flex: 1;
                }

                .cv-name {
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0;
                    letter-spacing: -0.5px;
                }

                .cv-headline {
                    font-size: 13px;
                    opacity: 0.9;
                    margin: 4px 0 0 0;
                    font-weight: 400;
                }

                .contact-bar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    padding: 12px 32px;
                    background: rgba(0,0,0,0.15);
                    font-size: 9pt;
                }

                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .icon {
                    width: 14px;
                    height: 14px;
                    opacity: 0.9;
                }

                .cv-body {
                    padding: 24px 32px;
                }

                .summary-section {
                    margin-bottom: 20px;
                }

                .summary-text {
                    font-size: 10pt;
                    line-height: 1.6;
                    color: #555;
                    margin: 0;
                }

                .two-columns {
                    display: grid;
                    grid-template-columns: 1fr 280px;
                    gap: 32px;
                }

                .cv-section {
                    margin-bottom: 20px;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12pt;
                    font-weight: 700;
                    color: #dc2626;
                    margin: 0 0 12px 0;
                    padding-bottom: 6px;
                    border-bottom: 2px solid #dc2626;
                }

                .section-icon {
                    width: 18px;
                    height: 18px;
                }

                .entry {
                    margin-bottom: 16px;
                }

                .entry.compact {
                    margin-bottom: 12px;
                }

                .entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 4px;
                }

                .entry-title {
                    font-size: 11pt;
                    font-weight: 600;
                    color: #111;
                    margin: 0;
                }

                .entry-org {
                    font-size: 9.5pt;
                    color: #dc2626;
                    margin: 2px 0 0 0;
                    font-weight: 500;
                }

                .entry-field {
                    font-size: 9pt;
                    color: #666;
                    margin: 2px 0 0 0;
                }

                .entry-meta {
                    text-align: right;
                }

                .entry-date {
                    display: block;
                    font-size: 9pt;
                    color: #888;
                }

                .entry-location {
                    display: block;
                    font-size: 8.5pt;
                    color: #999;
                }

                .entry-gpa {
                    font-size: 8.5pt;
                    color: #666;
                    margin: 4px 0 0 0;
                }

                .entry-desc {
                    font-size: 9pt;
                    color: #555;
                    margin: 4px 0;
                    line-height: 1.5;
                }

                .entry-bullets {
                    margin: 6px 0 0 0;
                    padding-left: 16px;
                    font-size: 9pt;
                    color: #555;
                    line-height: 1.5;
                }

                .entry-bullets li {
                    margin-bottom: 3px;
                }

                .entry-link {
                    font-size: 8.5pt;
                    color: #666;
                }

                .tech-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-top: 6px;
                }

                .tech-tag {
                    font-size: 8pt;
                    padding: 2px 8px;
                    background: #fef2f2;
                    color: #dc2626;
                    border-radius: 4px;
                }

                .skill-group {
                    margin-bottom: 12px;
                }

                .skill-group h4 {
                    font-size: 9pt;
                    font-weight: 600;
                    color: #555;
                    margin: 0 0 6px 0;
                }

                .skill-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .skill-tag {
                    font-size: 8.5pt;
                    padding: 3px 8px;
                    background: #dc2626;
                    color: white;
                    border-radius: 4px;
                }

                .skill-tag.soft {
                    background: #f3f4f6;
                    color: #555;
                }

                .skill-tag.lang {
                    background: #fef2f2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                }

                @media print {
                    .cv-pikachu {
                        font-size: 9pt;
                    }
                    
                    .two-columns {
                        grid-template-columns: 1fr 240px;
                    }
                }
            `}</style>
        </div>
    );
}
