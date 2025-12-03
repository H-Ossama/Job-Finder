'use client';

/**
 * Bronzor Template - Inspired by Reactive Resume (AmruthPillai)
 * Modern two-column layout with left sidebar
 * Best for: Creative, Design, Tech roles
 */
export default function BronzorTemplate({ cvData }) {
    const { personalInfo, summary, experience, education, skills, projects, awards, certifications } = cvData || {};

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
        <div className="cv-bronzor">
            <div className="cv-layout">
                {/* Left Sidebar */}
                <aside className="sidebar">
                    {/* Profile Photo */}
                    <div className="profile-section">
                        {personalInfo?.photo ? (
                            <div className="photo" style={{ backgroundImage: `url(${personalInfo.photo})` }}></div>
                        ) : (
                            <div className="photo-placeholder">
                                <span>{personalInfo?.firstName?.charAt(0) || 'Y'}{personalInfo?.lastName?.charAt(0) || 'N'}</span>
                            </div>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Contact</h3>
                        <div className="contact-list">
                            {personalInfo?.email && (
                                <div className="contact-item">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
                                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                    </svg>
                                    <span>{personalInfo.email}</span>
                                </div>
                            )}
                            {personalInfo?.phone && (
                                <div className="contact-item">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
                                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                                    </svg>
                                    <span>{personalInfo.phone}</span>
                                </div>
                            )}
                            {personalInfo?.location && (
                                <div className="contact-item">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                    <span>{personalInfo.location}</span>
                                </div>
                            )}
                            {personalInfo?.website && (
                                <div className="contact-item">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                    </svg>
                                    <span>{personalInfo.website}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    {(personalInfo?.linkedin || personalInfo?.github) && (
                        <div className="sidebar-section">
                            <h3 className="sidebar-title">Links</h3>
                            <div className="contact-list">
                                {personalInfo?.linkedin && (
                                    <div className="contact-item">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                        </svg>
                                        <span>{personalInfo.linkedin}</span>
                                    </div>
                                )}
                                {personalInfo?.github && (
                                    <div className="contact-item">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                        <span>{personalInfo.github}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {(skills?.technical?.length > 0 || skills?.soft?.length > 0) && (
                        <div className="sidebar-section">
                            <h3 className="sidebar-title">Skills</h3>
                            {skills?.technical?.length > 0 && (
                                <div className="skill-category">
                                    <h4>Technical</h4>
                                    <div className="skill-tags">
                                        {skills.technical.map((skill, i) => (
                                            <span key={i} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {skills?.soft?.length > 0 && (
                                <div className="skill-category">
                                    <h4>Soft Skills</h4>
                                    <div className="skill-tags">
                                        {skills.soft.map((skill, i) => (
                                            <span key={i} className="skill-tag soft">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Languages */}
                    {skills?.languages?.length > 0 && (
                        <div className="sidebar-section">
                            <h3 className="sidebar-title">Languages</h3>
                            <div className="languages-list">
                                {skills.languages.map((lang, i) => (
                                    <div key={i} className="language-item">
                                        <span>{lang}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {skills?.certifications?.length > 0 && (
                        <div className="sidebar-section">
                            <h3 className="sidebar-title">Certifications</h3>
                            <div className="cert-list">
                                {skills.certifications.map((cert, i) => (
                                    <div key={i} className="cert-item">{cert}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    {/* Header */}
                    <header className="cv-header">
                        <h1 className="cv-name">
                            {personalInfo?.firstName || 'Your'} {personalInfo?.lastName || 'Name'}
                        </h1>
                        {personalInfo?.title && <p className="cv-title">{personalInfo.title}</p>}
                    </header>

                    {/* Summary */}
                    {summary && (
                        <section className="cv-section">
                            <h2 className="section-title">About Me</h2>
                            <p className="summary-text">{summary}</p>
                        </section>
                    )}

                    {/* Experience */}
                    {experience?.some(exp => exp.company || exp.title) && (
                        <section className="cv-section">
                            <h2 className="section-title">Experience</h2>
                            {experience.filter(exp => exp.company || exp.title).map((exp, idx) => (
                                <div key={idx} className="entry">
                                    <div className="entry-header">
                                        <div>
                                            <h3 className="entry-title">{exp.title}</h3>
                                            <p className="entry-org">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
                                        </div>
                                        <span className="entry-date">
                                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                                        </span>
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

                    {/* Education */}
                    {education?.some(edu => edu.school || edu.degree) && (
                        <section className="cv-section">
                            <h2 className="section-title">Education</h2>
                            {education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                                <div key={idx} className="entry">
                                    <div className="entry-header">
                                        <div>
                                            <h3 className="entry-title">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                                            <p className="entry-org">{edu.school}</p>
                                        </div>
                                        <span className="entry-date">
                                            {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                        </span>
                                    </div>
                                    {edu.gpa && <p className="entry-gpa">GPA: {edu.gpa}</p>}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Projects */}
                    {projects?.length > 0 && projects.some(p => p.name) && (
                        <section className="cv-section">
                            <h2 className="section-title">Projects</h2>
                            {projects.filter(p => p.name).map((project, idx) => (
                                <div key={idx} className="entry">
                                    <div className="entry-header">
                                        <h3 className="entry-title">{project.name}</h3>
                                        {project.date && <span className="entry-date">{project.date}</span>}
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

                    {/* Awards */}
                    {awards?.length > 0 && awards.some(a => a.title) && (
                        <section className="cv-section">
                            <h2 className="section-title">Awards</h2>
                            {awards.filter(a => a.title).map((award, idx) => (
                                <div key={idx} className="entry compact">
                                    <div className="entry-header">
                                        <div>
                                            <h3 className="entry-title">{award.title}</h3>
                                            {award.issuer && <p className="entry-org">{award.issuer}</p>}
                                        </div>
                                        <span className="entry-date">{award.date}</span>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}
                </main>
            </div>

            <style jsx>{`
                .cv-bronzor {
                    font-family: 'Inter', 'Segoe UI', sans-serif;
                    background: white;
                    min-height: 100%;
                    font-size: 10pt;
                }

                .cv-layout {
                    display: grid;
                    grid-template-columns: 220px 1fr;
                    min-height: 100%;
                }

                .sidebar {
                    background: #1e293b;
                    color: white;
                    padding: 24px 18px;
                }

                .profile-section {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .photo {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background-size: cover;
                    background-position: center;
                    margin: 0 auto;
                    border: 3px solid rgba(255,255,255,0.2);
                }

                .photo-placeholder {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: #475569;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: 700;
                    color: white;
                }

                .sidebar-section {
                    margin-bottom: 20px;
                }

                .sidebar-title {
                    font-size: 10pt;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0 0 10px 0;
                    padding-bottom: 6px;
                    border-bottom: 2px solid #f59e0b;
                    color: #f59e0b;
                }

                .contact-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .contact-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    font-size: 8.5pt;
                    color: #cbd5e1;
                    word-break: break-word;
                }

                .contact-icon {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                    margin-top: 1px;
                    color: #f59e0b;
                }

                .skill-category {
                    margin-bottom: 12px;
                }

                .skill-category h4 {
                    font-size: 8.5pt;
                    font-weight: 600;
                    color: #94a3b8;
                    margin: 0 0 6px 0;
                }

                .skill-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .skill-tag {
                    font-size: 8pt;
                    padding: 3px 8px;
                    background: #f59e0b;
                    color: #1e293b;
                    border-radius: 4px;
                    font-weight: 500;
                }

                .skill-tag.soft {
                    background: #475569;
                    color: #e2e8f0;
                }

                .languages-list {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .language-item {
                    font-size: 9pt;
                    color: #cbd5e1;
                }

                .cert-list {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .cert-item {
                    font-size: 8.5pt;
                    color: #cbd5e1;
                    padding-left: 10px;
                    border-left: 2px solid #f59e0b;
                }

                .main-content {
                    padding: 24px 28px;
                    color: #1e293b;
                }

                .cv-header {
                    margin-bottom: 20px;
                }

                .cv-name {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                }

                .cv-title {
                    font-size: 12pt;
                    color: #f59e0b;
                    margin: 4px 0 0 0;
                    font-weight: 500;
                }

                .cv-section {
                    margin-bottom: 18px;
                }

                .section-title {
                    font-size: 11pt;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 12px 0;
                    padding-bottom: 4px;
                    border-bottom: 2px solid #f59e0b;
                }

                .summary-text {
                    font-size: 9.5pt;
                    line-height: 1.6;
                    color: #475569;
                    margin: 0;
                }

                .entry {
                    margin-bottom: 14px;
                }

                .entry.compact {
                    margin-bottom: 10px;
                }

                .entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .entry-title {
                    font-size: 10.5pt;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0;
                }

                .entry-org {
                    font-size: 9.5pt;
                    color: #64748b;
                    margin: 2px 0 0 0;
                }

                .entry-date {
                    font-size: 9pt;
                    color: #94a3b8;
                    white-space: nowrap;
                }

                .entry-desc {
                    font-size: 9pt;
                    color: #475569;
                    margin: 6px 0 0 0;
                    line-height: 1.5;
                }

                .entry-bullets {
                    margin: 6px 0 0 0;
                    padding-left: 18px;
                    font-size: 9pt;
                    color: #475569;
                    line-height: 1.5;
                }

                .entry-bullets li {
                    margin-bottom: 3px;
                }

                .entry-gpa {
                    font-size: 8.5pt;
                    color: #64748b;
                    margin: 4px 0 0 0;
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
                    background: #fef3c7;
                    color: #92400e;
                    border-radius: 4px;
                }

                @media print {
                    .cv-bronzor {
                        font-size: 9pt;
                    }
                    
                    .cv-layout {
                        grid-template-columns: 180px 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
