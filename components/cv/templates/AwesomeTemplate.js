'use client';

/**
 * Awesome Template - Inspired by Awesome-CV (posquit0)
 * LaTeX-style professional CV with clean typography and colored accents
 * Best for: All industries, especially professional and corporate roles
 */
export default function AwesomeTemplate({ cvData, themeColor = '#0395DE', fontFamily = 'Source Sans Pro' }) {
    const { personalInfo, summary, experience, education, skills, projects, awards, certifications } = cvData || {};
    
    // Use theme color for accents
    const accentColor = themeColor;

    const formatDate = (date) => {
        if (!date) return '';
        if (date.includes('-')) {
            const [year, month] = date.split('-');
            const monthNames = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
            return `${monthNames[parseInt(month) - 1] || ''} ${year}`;
        }
        return date;
    };

    return (
        <div className="cv-awesome">
            {/* Header - Awesome CV style */}
            <header className="cv-header">
                <h1 className="cv-name">
                    <span className="firstname">{personalInfo?.firstName || 'Your'}</span>{' '}
                    <span className="lastname">{personalInfo?.lastName || 'Name'}</span>
                </h1>
                {personalInfo?.title && (
                    <p className="cv-position">{personalInfo.title}</p>
                )}
                <div className="cv-contact-row">
                    {personalInfo?.location && (
                        <span className="contact-item">
                            <svg className="icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            {personalInfo.location}
                        </span>
                    )}
                    {personalInfo?.phone && (
                        <span className="contact-item">
                            <svg className="icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                            {personalInfo.phone}
                        </span>
                    )}
                    {personalInfo?.email && (
                        <span className="contact-item">
                            <svg className="icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            {personalInfo.email}
                        </span>
                    )}
                </div>
                <div className="cv-social-row">
                    {personalInfo?.linkedin && (
                        <span className="social-item">
                            <svg className="icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            {personalInfo.linkedin}
                        </span>
                    )}
                    {personalInfo?.github && (
                        <span className="social-item">
                            <svg className="icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            {personalInfo.github}
                        </span>
                    )}
                    {personalInfo?.website && (
                        <span className="social-item">
                            <svg className="icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                            {personalInfo.website}
                        </span>
                    )}
                </div>
            </header>

            <main className="cv-body">
                {/* Summary */}
                {summary && (
                    <section className="cv-section">
                        <h2 className="section-title">Summary</h2>
                        <div className="section-divider"></div>
                        <p className="summary-text">{summary}</p>
                    </section>
                )}

                {/* Experience */}
                {experience?.some(exp => exp.company || exp.title) && (
                    <section className="cv-section">
                        <h2 className="section-title">Experience</h2>
                        <div className="section-divider"></div>
                        {experience.filter(exp => exp.company || exp.title).map((exp, idx) => (
                            <div key={idx} className="cv-entry">
                                <div className="entry-header">
                                    <div className="entry-left">
                                        <h3 className="entry-title">{exp.title}</h3>
                                        <p className="entry-org">{exp.company}</p>
                                    </div>
                                    <div className="entry-right">
                                        <span className="entry-location">{exp.location}</span>
                                        <span className="entry-date">
                                            {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                        </span>
                                    </div>
                                </div>
                                {exp.description && <p className="entry-description">{exp.description}</p>}
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
                        <div className="section-divider"></div>
                        {education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                            <div key={idx} className="cv-entry">
                                <div className="entry-header">
                                    <div className="entry-left">
                                        <h3 className="entry-title">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                                        <p className="entry-org">{edu.school}</p>
                                    </div>
                                    <div className="entry-right">
                                        <span className="entry-location">{edu.location}</span>
                                        <span className="entry-date">{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
                                    </div>
                                </div>
                                {edu.gpa && (
                                    <ul className="entry-bullets">
                                        <li>GPA: {edu.gpa}</li>
                                    </ul>
                                )}
                                {edu.honors && (
                                    <ul className="entry-bullets">
                                        <li>{edu.honors}</li>
                                    </ul>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* Skills - Tabular format like Awesome CV */}
                {(skills?.technical?.length > 0 || skills?.soft?.length > 0 || skills?.languages?.length > 0) && (
                    <section className="cv-section">
                        <h2 className="section-title">Skills</h2>
                        <div className="section-divider"></div>
                        <div className="skills-table">
                            {skills?.technical?.length > 0 && (
                                <div className="skill-row">
                                    <span className="skill-category">Technical</span>
                                    <span className="skill-list">{skills.technical.join(', ')}</span>
                                </div>
                            )}
                            {skills?.soft?.length > 0 && (
                                <div className="skill-row">
                                    <span className="skill-category">Soft Skills</span>
                                    <span className="skill-list">{skills.soft.join(', ')}</span>
                                </div>
                            )}
                            {skills?.languages?.length > 0 && (
                                <div className="skill-row">
                                    <span className="skill-category">Languages</span>
                                    <span className="skill-list">{skills.languages.join(', ')}</span>
                                </div>
                            )}
                            {skills?.certifications?.length > 0 && (
                                <div className="skill-row">
                                    <span className="skill-category">Certifications</span>
                                    <span className="skill-list">{skills.certifications.join(', ')}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects?.length > 0 && projects.some(p => p.name) && (
                    <section className="cv-section">
                        <h2 className="section-title">Projects</h2>
                        <div className="section-divider"></div>
                        {projects.filter(p => p.name).map((project, idx) => (
                            <div key={idx} className="cv-entry">
                                <div className="entry-header">
                                    <div className="entry-left">
                                        <h3 className="entry-title">{project.name}</h3>
                                        {project.technologies && (
                                            <p className="entry-tech">
                                                {Array.isArray(project.technologies) 
                                                    ? project.technologies.join(', ') 
                                                    : project.technologies}
                                            </p>
                                        )}
                                    </div>
                                    <div className="entry-right">
                                        {(project.url || project.link) && <span className="entry-link">{project.url || project.link}</span>}
                                        {project.date && <span className="entry-date">{project.date}</span>}
                                    </div>
                                </div>
                                {project.description && <p className="entry-description">{project.description}</p>}
                            </div>
                        ))}
                    </section>
                )}

                {/* Certifications - New detailed format */}
                {certifications?.length > 0 && certifications.some(c => c.name) && (
                    <section className="cv-section">
                        <h2 className="section-title">Certifications</h2>
                        <div className="section-divider"></div>
                        <div className="certs-table">
                            {certifications.filter(c => c.name).map((cert, idx) => (
                                <div key={idx} className="cert-row">
                                    <span className="cert-date">{cert.date ? formatDate(cert.date) : ''}</span>
                                    <span className="cert-name">
                                        {cert.name}
                                        {cert.issuer && <span className="cert-issuer">, {cert.issuer}</span>}
                                    </span>
                                    {cert.credentialId && <span className="cert-id">{cert.credentialId}</span>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Awards/Honors */}
                {awards?.length > 0 && awards.some(a => a.title) && (
                    <section className="cv-section">
                        <h2 className="section-title">Honors & Awards</h2>
                        <div className="section-divider"></div>
                        <div className="honors-table">
                            {awards.filter(a => a.title).map((award, idx) => (
                                <div key={idx} className="honor-row">
                                    <span className="honor-date">{award.date}</span>
                                    <span className="honor-title">
                                        {award.title}
                                        {award.issuer && <span className="honor-issuer">, {award.issuer}</span>}
                                    </span>
                                    <span className="honor-location">{award.location}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <style jsx>{`
                .cv-awesome {
                    font-family: '${fontFamily}', 'Roboto', sans-serif;
                    background: white;
                    color: #333;
                    min-height: 100%;
                    font-size: 10pt;
                    line-height: 1.4;
                }

                .cv-header {
                    text-align: center;
                    padding: 24px 32px 20px;
                }

                .cv-name {
                    font-size: 32px;
                    font-weight: 300;
                    margin: 0 0 4px 0;
                    letter-spacing: 1px;
                }

                .cv-name .firstname {
                    color: #333;
                }

                .cv-name .lastname {
                    font-weight: 700;
                    color: ${accentColor};
                }

                .cv-position {
                    font-size: 11pt;
                    color: #666;
                    margin: 0 0 12px 0;
                    letter-spacing: 0.5px;
                }

                .cv-contact-row, .cv-social-row {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 16px;
                    font-size: 9pt;
                    color: #555;
                }

                .cv-social-row {
                    margin-top: 6px;
                    font-size: 8.5pt;
                    color: #666;
                }

                .contact-item, .social-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .icon {
                    width: 12px;
                    height: 12px;
                    color: ${accentColor};
                }

                .cv-body {
                    padding: 0 32px 28px;
                }

                .cv-section {
                    margin-bottom: 18px;
                }

                .section-title {
                    font-size: 12pt;
                    font-weight: 700;
                    color: #333;
                    margin: 0;
                    text-transform: none;
                }

                .section-divider {
                    height: 1px;
                    background: linear-gradient(to right, ${accentColor}, ${accentColor} 30%, #ddd 30%);
                    margin: 6px 0 12px 0;
                }

                .summary-text {
                    font-size: 9.5pt;
                    line-height: 1.6;
                    color: #444;
                    margin: 0;
                    text-align: justify;
                }

                .cv-entry {
                    margin-bottom: 14px;
                }

                .entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 4px;
                }

                .entry-left {
                    flex: 1;
                }

                .entry-right {
                    text-align: right;
                    min-width: 140px;
                }

                .entry-title {
                    font-size: 10pt;
                    font-weight: 700;
                    color: #333;
                    margin: 0;
                }

                .entry-org {
                    font-size: 9.5pt;
                    font-weight: 600;
                    color: ${accentColor};
                    margin: 1px 0 0 0;
                }

                .entry-location {
                    display: block;
                    font-size: 9pt;
                    color: #666;
                }

                .entry-date {
                    display: block;
                    font-size: 9pt;
                    color: #888;
                }

                .entry-tech {
                    font-size: 8.5pt;
                    color: #666;
                    font-style: italic;
                    margin: 2px 0 0 0;
                }

                .entry-description {
                    font-size: 9pt;
                    color: #555;
                    margin: 4px 0;
                    line-height: 1.5;
                }

                .entry-bullets {
                    margin: 4px 0 0 0;
                    padding-left: 16px;
                    font-size: 9pt;
                    color: #555;
                    line-height: 1.5;
                }

                .entry-bullets li {
                    margin-bottom: 2px;
                }

                .entry-bullets li::marker {
                    color: ${accentColor};
                }

                .skills-table {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .skill-row {
                    display: flex;
                    font-size: 9pt;
                }

                .skill-category {
                    font-weight: 700;
                    color: #333;
                    min-width: 100px;
                }

                .skill-list {
                    color: #555;
                    flex: 1;
                }

                .honors-table {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .honor-row {
                    display: flex;
                    font-size: 9pt;
                    align-items: baseline;
                }

                .honor-date {
                    min-width: 70px;
                    color: #888;
                }

                .honor-title {
                    flex: 1;
                    font-weight: 600;
                    color: #333;
                }

                .honor-issuer {
                    font-weight: 400;
                    color: #555;
                }

                .honor-location {
                    min-width: 100px;
                    text-align: right;
                    color: #666;
                }

                .certs-table {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .cert-row {
                    display: flex;
                    font-size: 9pt;
                    align-items: baseline;
                    gap: 8px;
                }

                .cert-date {
                    min-width: 70px;
                    color: #888;
                }

                .cert-name {
                    flex: 1;
                    font-weight: 600;
                    color: #333;
                }

                .cert-issuer {
                    font-weight: 400;
                    color: #555;
                }

                .cert-id {
                    font-size: 8pt;
                    color: #888;
                }
            `}</style>
        </div>
    );
}
