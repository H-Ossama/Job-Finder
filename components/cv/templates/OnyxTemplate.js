'use client';

/**
 * Onyx Template - Inspired by Reactive Resume (AmruthPillai)
 * Clean professional layout with horizontal header and profiles
 * Best for: Business, Corporate, Finance roles
 */
export default function OnyxTemplate({ cvData }) {
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
        <div className="cv-onyx">
            {/* Header */}
            <header className="cv-header">
                <div className="header-main">
                    {personalInfo?.photo && (
                        <div className="photo" style={{ backgroundImage: `url(${personalInfo.photo})` }}></div>
                    )}
                    <div className="header-info">
                        <h1 className="cv-name">
                            {personalInfo?.firstName || 'Your'} {personalInfo?.lastName || 'Name'}
                        </h1>
                        {personalInfo?.title && <p className="cv-title">{personalInfo.title}</p>}
                        <div className="contact-info">
                            {personalInfo?.email && <span>{personalInfo.email}</span>}
                            {personalInfo?.phone && <span>{personalInfo.phone}</span>}
                            {personalInfo?.location && <span>{personalInfo.location}</span>}
                        </div>
                    </div>
                </div>
                
                {/* Profiles Row */}
                {(personalInfo?.linkedin || personalInfo?.github || personalInfo?.website) && (
                    <div className="profiles-row">
                        {personalInfo?.linkedin && (
                            <a className="profile-link">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="profile-icon">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                                {personalInfo.linkedin}
                            </a>
                        )}
                        {personalInfo?.github && (
                            <a className="profile-link">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="profile-icon">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                {personalInfo.github}
                            </a>
                        )}
                        {personalInfo?.website && (
                            <a className="profile-link">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="profile-icon">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                </svg>
                                {personalInfo.website}
                            </a>
                        )}
                    </div>
                )}
            </header>

            <main className="cv-body">
                {/* Summary */}
                {summary && (
                    <section className="cv-section">
                        <h2 className="section-title">Summary</h2>
                        <p className="summary-text">{summary}</p>
                    </section>
                )}

                {/* Experience */}
                {experience?.some(exp => exp.company || exp.title) && (
                    <section className="cv-section">
                        <h2 className="section-title">Experience</h2>
                        {experience.filter(exp => exp.company || exp.title).map((exp, idx) => (
                            <div key={idx} className="entry">
                                <div className="entry-row">
                                    <div className="entry-left">
                                        <h3 className="entry-title">{exp.title}</h3>
                                        <p className="entry-org">{exp.company}</p>
                                    </div>
                                    <div className="entry-right">
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

                {/* Education */}
                {education?.some(edu => edu.school || edu.degree) && (
                    <section className="cv-section">
                        <h2 className="section-title">Education</h2>
                        {education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                            <div key={idx} className="entry">
                                <div className="entry-row">
                                    <div className="entry-left">
                                        <h3 className="entry-title">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                                        <p className="entry-org">{edu.school}</p>
                                    </div>
                                    <div className="entry-right">
                                        <span className="entry-date">
                                            {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                        </span>
                                    </div>
                                </div>
                                {edu.gpa && <p className="entry-gpa">GPA: {edu.gpa}</p>}
                            </div>
                        ))}
                    </section>
                )}

                {/* Skills */}
                {(skills?.technical?.length > 0 || skills?.soft?.length > 0) && (
                    <section className="cv-section">
                        <h2 className="section-title">Skills</h2>
                        <div className="skills-grid">
                            {skills?.technical?.length > 0 && (
                                <div className="skill-category">
                                    <h4>Technical Skills</h4>
                                    <div className="skill-items">
                                        {skills.technical.map((skill, i) => (
                                            <span key={i} className="skill-item">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {skills?.soft?.length > 0 && (
                                <div className="skill-category">
                                    <h4>Soft Skills</h4>
                                    <div className="skill-items">
                                        {skills.soft.map((skill, i) => (
                                            <span key={i} className="skill-item soft">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {skills?.languages?.length > 0 && (
                                <div className="skill-category">
                                    <h4>Languages</h4>
                                    <div className="skill-items">
                                        {skills.languages.map((lang, i) => (
                                            <span key={i} className="skill-item lang">{lang}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects?.length > 0 && projects.some(p => p.name) && (
                    <section className="cv-section">
                        <h2 className="section-title">Projects</h2>
                        {projects.filter(p => p.name).map((project, idx) => (
                            <div key={idx} className="entry">
                                <div className="entry-row">
                                    <h3 className="entry-title">{project.name}</h3>
                                    {project.date && <span className="entry-date">{project.date}</span>}
                                </div>
                                {project.description && <p className="entry-desc">{project.description}</p>}
                                {project.technologies && (
                                    <p className="entry-tech">Technologies: {project.technologies}</p>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* Awards & Certifications */}
                {(awards?.length > 0 || skills?.certifications?.length > 0) && (
                    <section className="cv-section">
                        <h2 className="section-title">Awards & Certifications</h2>
                        <div className="awards-grid">
                            {awards?.filter(a => a.title).map((award, idx) => (
                                <div key={`award-${idx}`} className="award-item">
                                    <h4>{award.title}</h4>
                                    <p>{award.issuer}</p>
                                    <span>{award.date}</span>
                                </div>
                            ))}
                            {skills?.certifications?.map((cert, idx) => (
                                <div key={`cert-${idx}`} className="award-item">
                                    <h4>{cert}</h4>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <style jsx>{`
                .cv-onyx {
                    font-family: 'Inter', 'Segoe UI', sans-serif;
                    background: white;
                    color: #1f2937;
                    min-height: 100%;
                    font-size: 10pt;
                }

                .cv-header {
                    border-bottom: 3px solid #6366f1;
                    padding: 24px 32px;
                }

                .header-main {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .photo {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background-size: cover;
                    background-position: center;
                    border: 2px solid #6366f1;
                }

                .header-info {
                    flex: 1;
                }

                .cv-name {
                    font-size: 26px;
                    font-weight: 700;
                    margin: 0;
                    color: #111827;
                }

                .cv-title {
                    font-size: 12pt;
                    color: #6366f1;
                    margin: 2px 0 0 0;
                    font-weight: 500;
                }

                .contact-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-top: 8px;
                    font-size: 9pt;
                    color: #6b7280;
                }

                .profiles-row {
                    display: flex;
                    gap: 20px;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #e5e7eb;
                }

                .profile-link {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 9pt;
                    color: #6366f1;
                    text-decoration: none;
                }

                .profile-icon {
                    width: 14px;
                    height: 14px;
                }

                .cv-body {
                    padding: 24px 32px;
                }

                .cv-section {
                    margin-bottom: 20px;
                }

                .section-title {
                    font-size: 11pt;
                    font-weight: 700;
                    color: #6366f1;
                    margin: 0 0 12px 0;
                    padding-bottom: 4px;
                    border-bottom: 1px solid #e5e7eb;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .summary-text {
                    font-size: 9.5pt;
                    line-height: 1.6;
                    color: #4b5563;
                    margin: 0;
                }

                .entry {
                    margin-bottom: 14px;
                    padding-bottom: 14px;
                    border-bottom: 1px dashed #e5e7eb;
                }

                .entry:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .entry-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .entry-left {
                    flex: 1;
                }

                .entry-right {
                    text-align: right;
                    min-width: 120px;
                }

                .entry-title {
                    font-size: 10.5pt;
                    font-weight: 600;
                    color: #111827;
                    margin: 0;
                }

                .entry-org {
                    font-size: 9.5pt;
                    color: #6366f1;
                    margin: 2px 0 0 0;
                }

                .entry-date {
                    display: block;
                    font-size: 9pt;
                    color: #6b7280;
                }

                .entry-location {
                    display: block;
                    font-size: 8.5pt;
                    color: #9ca3af;
                }

                .entry-desc {
                    font-size: 9pt;
                    color: #4b5563;
                    margin: 6px 0 0 0;
                    line-height: 1.5;
                }

                .entry-bullets {
                    margin: 6px 0 0 0;
                    padding-left: 18px;
                    font-size: 9pt;
                    color: #4b5563;
                    line-height: 1.5;
                }

                .entry-bullets li {
                    margin-bottom: 3px;
                }

                .entry-gpa {
                    font-size: 8.5pt;
                    color: #6b7280;
                    margin: 4px 0 0 0;
                }

                .entry-tech {
                    font-size: 8.5pt;
                    color: #6b7280;
                    font-style: italic;
                    margin: 4px 0 0 0;
                }

                .skills-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .skill-category h4 {
                    font-size: 9pt;
                    font-weight: 600;
                    color: #374151;
                    margin: 0 0 8px 0;
                }

                .skill-items {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .skill-item {
                    font-size: 8.5pt;
                    padding: 4px 10px;
                    background: #6366f1;
                    color: white;
                    border-radius: 4px;
                }

                .skill-item.soft {
                    background: #f3f4f6;
                    color: #374151;
                }

                .skill-item.lang {
                    background: #eef2ff;
                    color: #6366f1;
                }

                .awards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 12px;
                }

                .award-item {
                    padding: 10px;
                    background: #f9fafb;
                    border-radius: 6px;
                    border-left: 3px solid #6366f1;
                }

                .award-item h4 {
                    font-size: 9pt;
                    font-weight: 600;
                    color: #111827;
                    margin: 0;
                }

                .award-item p {
                    font-size: 8.5pt;
                    color: #6b7280;
                    margin: 2px 0 0 0;
                }

                .award-item span {
                    font-size: 8pt;
                    color: #9ca3af;
                }

                @media print {
                    .cv-onyx {
                        font-size: 9pt;
                    }
                }
            `}</style>
        </div>
    );
}
