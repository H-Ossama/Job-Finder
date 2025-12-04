'use client';

/**
 * Executive Template - Premium design for senior roles
 * Best for: C-Level, Directors, Senior Management
 */
export default function ExecutiveTemplate({ cvData }) {
    const { personalInfo, summary, experience, education, skills, projects, certifications } = cvData || {};

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
        <div className="cv-executive">
            {/* Elegant Header */}
            <header className="cv-header">
                <div className="header-content">
                    <div className="name-section">
                        <h1>{personalInfo?.firstName || 'Your'} {personalInfo?.lastName || 'Name'}</h1>
                        {personalInfo?.title && <p className="title">{personalInfo.title}</p>}
                    </div>
                    <div className="contact-section">
                        <div className="contact-grid">
                            {personalInfo?.email && (
                                <div className="contact-item">
                                    <span className="label">Email</span>
                                    <span className="value">{personalInfo.email}</span>
                                </div>
                            )}
                            {personalInfo?.phone && (
                                <div className="contact-item">
                                    <span className="label">Phone</span>
                                    <span className="value">{personalInfo.phone}</span>
                                </div>
                            )}
                            {personalInfo?.location && (
                                <div className="contact-item">
                                    <span className="label">Location</span>
                                    <span className="value">{personalInfo.location}</span>
                                </div>
                            )}
                            {personalInfo?.linkedin && (
                                <div className="contact-item">
                                    <span className="label">LinkedIn</span>
                                    <span className="value">{personalInfo.linkedin}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="header-line"></div>
            </header>

            <main className="cv-main">
                {/* Executive Summary */}
                {summary && (
                    <section className="section">
                        <h2>Executive Summary</h2>
                        <div className="summary-block">
                            <p>{summary}</p>
                        </div>
                    </section>
                )}

                {/* Professional Experience */}
                {experience?.some(exp => exp.company || exp.title) && (
                    <section className="section">
                        <h2>Professional Experience</h2>
                        {experience.filter(exp => exp.company || exp.title).map((exp, idx) => (
                            <div key={idx} className="experience-entry">
                                <div className="entry-header">
                                    <div className="entry-left">
                                        <h3>{exp.title}</h3>
                                        <p className="company">{exp.company}{exp.location ? ` — ${exp.location}` : ''}</p>
                                    </div>
                                    <div className="entry-right">
                                        <span className="date-badge">
                                            {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                        </span>
                                    </div>
                                </div>
                                {exp.description && <p className="description">{exp.description}</p>}
                                {exp.bullets?.length > 0 && (
                                    <div className="achievements">
                                        <span className="achievements-label">Key Achievements:</span>
                                        <ul>
                                            {exp.bullets.map((bullet, i) => (
                                                <li key={i}>{bullet}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* Two column footer */}
                <div className="footer-columns">
                    {/* Education */}
                    {education?.some(edu => edu.school || edu.degree) && (
                        <section className="section">
                            <h2>Education</h2>
                            {education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                                <div key={idx} className="education-entry">
                                    <h4>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h4>
                                    <p className="school">{edu.school}</p>
                                    <span className="year">{edu.endDate}</span>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Core Competencies */}
                    {(skills?.technical?.length > 0 || skills?.soft?.length > 0) && (
                        <section className="section">
                            <h2>Core Competencies</h2>
                            <div className="competencies">
                                {[...(skills?.technical || []), ...(skills?.soft || [])].map((skill, i) => (
                                    <span key={i} className="competency">{skill}</span>
                                ))}
                            </div>
                            {skills?.certifications?.length > 0 && (
                                <div className="certifications">
                                    <span className="cert-label">Certifications:</span>
                                    {skills.certifications.join(' · ')}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Projects */}
                    {projects?.some(proj => proj.name || proj.description) && (
                        <section className="section">
                            <h2>Key Projects</h2>
                            {projects.filter(proj => proj.name || proj.description).map((proj, idx) => (
                                <div key={idx} className="project-entry">
                                    <div className="proj-header">
                                        <h4>{proj.name}</h4>
                                        {proj.date && <span className="proj-date">{proj.date}</span>}
                                    </div>
                                    {proj.description && <p className="proj-desc">{proj.description}</p>}
                                    {proj.technologies?.length > 0 && (
                                        <div className="proj-tech">
                                            {proj.technologies.map((tech, i) => (
                                                <span key={i} className="tech-badge">{tech}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Detailed Certifications */}
                    {certifications?.some(cert => cert.name) && (
                        <section className="section">
                            <h2>Professional Certifications</h2>
                            <div className="detailed-certs">
                                {certifications.filter(cert => cert.name).map((cert, idx) => (
                                    <div key={idx} className="cert-entry">
                                        <span className="cert-badge">✓</span>
                                        <div className="cert-info">
                                            <span className="cert-title">{cert.name}</span>
                                            {cert.issuer && <span className="cert-issuer">{cert.issuer}</span>}
                                            {cert.date && <span className="cert-date">{formatDate(cert.date)}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <style jsx>{`
                .cv-executive {
                    font-family: 'Crimson Text', Georgia, serif;
                    background: white;
                    color: #1a202c;
                    min-height: 100%;
                }

                .cv-header {
                    background: #0f172a;
                    color: white;
                    padding: 32px;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .name-section h1 {
                    font-size: 32px;
                    font-weight: 400;
                    margin: 0;
                    letter-spacing: 1px;
                }

                .title {
                    font-size: 14px;
                    color: #94a3b8;
                    margin: 8px 0 0 0;
                    font-style: italic;
                }

                .contact-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px 24px;
                }

                .contact-item {
                    display: flex;
                    flex-direction: column;
                }

                .label {
                    font-size: 9px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #64748b;
                }

                .value {
                    font-size: 11px;
                    color: #e2e8f0;
                }

                .header-line {
                    height: 3px;
                    background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
                    margin-top: 24px;
                }

                .cv-main {
                    padding: 28px 32px;
                }

                .section {
                    margin-bottom: 24px;
                }

                .section h2 {
                    font-size: 13px;
                    font-weight: 400;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    color: #0f172a;
                    margin: 0 0 14px 0;
                    padding-left: 12px;
                    border-left: 3px solid #0f172a;
                }

                .summary-block {
                    background: #f8fafc;
                    padding: 16px 20px;
                    border-radius: 4px;
                }

                .summary-block p {
                    font-size: 13px;
                    line-height: 1.8;
                    color: #475569;
                    margin: 0;
                }

                .experience-entry {
                    margin-bottom: 22px;
                    padding-bottom: 18px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .experience-entry:last-child {
                    border-bottom: none;
                }

                .entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 10px;
                }

                .experience-entry h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0;
                    color: #1e293b;
                }

                .company {
                    font-size: 13px;
                    color: #64748b;
                    margin: 4px 0 0 0;
                }

                .date-badge {
                    font-size: 10px;
                    background: #0f172a;
                    color: white;
                    padding: 4px 10px;
                    border-radius: 2px;
                }

                .description {
                    font-size: 12px;
                    color: #475569;
                    line-height: 1.6;
                    margin: 0 0 10px 0;
                }

                .achievements {
                    background: #fffbeb;
                    padding: 12px 16px;
                    border-radius: 4px;
                    border-left: 3px solid #f59e0b;
                }

                .achievements-label {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #92400e;
                    display: block;
                    margin-bottom: 6px;
                }

                .achievements ul {
                    margin: 0;
                    padding-left: 16px;
                    font-size: 12px;
                    color: #78350f;
                }

                .achievements li {
                    margin-bottom: 4px;
                }

                .footer-columns {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                    margin-top: 24px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                }

                .education-entry {
                    margin-bottom: 12px;
                }

                .education-entry h4 {
                    font-size: 13px;
                    font-weight: 600;
                    margin: 0;
                }

                .school {
                    font-size: 12px;
                    color: #64748b;
                    margin: 2px 0;
                }

                .year {
                    font-size: 10px;
                    color: #94a3b8;
                }

                .competencies {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .competency {
                    font-size: 10px;
                    padding: 4px 10px;
                    background: #0f172a;
                    color: white;
                    border-radius: 2px;
                }

                .certifications {
                    margin-top: 12px;
                    font-size: 11px;
                    color: #64748b;
                }

                .cert-label {
                    font-weight: 600;
                    color: #475569;
                }

                .project-entry {
                    margin-bottom: 14px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .project-entry:last-child {
                    border-bottom: none;
                }

                .proj-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                }

                .project-entry h4 {
                    font-size: 13px;
                    font-weight: 600;
                    margin: 0;
                    color: #1e293b;
                }

                .proj-date {
                    font-size: 10px;
                    color: #94a3b8;
                }

                .proj-desc {
                    font-size: 11px;
                    color: #64748b;
                    margin: 4px 0 8px 0;
                    line-height: 1.5;
                }

                .proj-tech {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .tech-badge {
                    font-size: 9px;
                    padding: 2px 8px;
                    background: #f1f5f9;
                    color: #475569;
                    border-radius: 2px;
                }

                .detailed-certs {
                    display: grid;
                    gap: 10px;
                }

                .cert-entry {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                }

                .cert-badge {
                    color: #f59e0b;
                    font-weight: bold;
                }

                .cert-info {
                    display: flex;
                    flex-direction: column;
                }

                .cert-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: #1e293b;
                }

                .cert-issuer {
                    font-size: 11px;
                    color: #64748b;
                }

                .cert-date {
                    font-size: 10px;
                    color: #94a3b8;
                }
            `}</style>
        </div>
    );
}
