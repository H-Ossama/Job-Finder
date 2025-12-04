'use client';

/**
 * Minimalist Template - Clean, simple, content-focused
 * Best for: Academic, Research, Technical writing
 */
export default function MinimalistTemplate({ cvData }) {
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
        <div className="cv-minimalist">
            {/* Header - Simple centered */}
            <header className="cv-header">
                <h1>{personalInfo?.firstName || 'Your'} {personalInfo?.lastName || 'Name'}</h1>
                <div className="contact-line">
                    {[
                        personalInfo?.email,
                        personalInfo?.phone,
                        personalInfo?.location,
                        personalInfo?.linkedin,
                        personalInfo?.github
                    ].filter(Boolean).join(' · ')}
                </div>
            </header>

            <div className="cv-body">
                {/* Summary */}
                {summary && (
                    <section>
                        <p className="summary">{summary}</p>
                    </section>
                )}

                {/* Experience */}
                {experience?.some(exp => exp.company || exp.title) && (
                    <section>
                        <h2>Experience</h2>
                        {experience.filter(exp => exp.company || exp.title).map((exp, idx) => (
                            <div key={idx} className="entry">
                                <div className="entry-header">
                                    <span className="entry-title">
                                        <strong>{exp.title}</strong>, {exp.company}
                                    </span>
                                    <span className="entry-date">
                                        {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                    </span>
                                </div>
                                {exp.description && <p>{exp.description}</p>}
                                {exp.bullets?.length > 0 && (
                                    <ul>
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
                    <section>
                        <h2>Education</h2>
                        {education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                            <div key={idx} className="entry">
                                <div className="entry-header">
                                    <span className="entry-title">
                                        <strong>{edu.degree}</strong>{edu.field ? ` in ${edu.field}` : ''}, {edu.school}
                                    </span>
                                    <span className="entry-date">{edu.endDate}</span>
                                </div>
                                {edu.gpa && <p>GPA: {edu.gpa}{edu.honors ? ` — ${edu.honors}` : ''}</p>}
                            </div>
                        ))}
                    </section>
                )}

                {/* Skills - inline */}
                {(skills?.technical?.length > 0 || skills?.soft?.length > 0) && (
                    <section>
                        <h2>Skills</h2>
                        {skills?.technical?.length > 0 && (
                            <p><strong>Technical:</strong> {skills.technical.join(', ')}</p>
                        )}
                        {skills?.soft?.length > 0 && (
                            <p><strong>Soft Skills:</strong> {skills.soft.join(', ')}</p>
                        )}
                        {skills?.certifications?.length > 0 && (
                            <p><strong>Certifications:</strong> {skills.certifications.join(', ')}</p>
                        )}
                    </section>
                )}

                {/* Projects */}
                {projects?.some(proj => proj.name || proj.description) && (
                    <section>
                        <h2>Projects</h2>
                        {projects.filter(proj => proj.name || proj.description).map((proj, idx) => (
                            <div key={idx} className="entry">
                                <div className="entry-header">
                                    <span className="entry-title">
                                        <strong>{proj.name}</strong>
                                        {proj.link && <a href={proj.link} className="proj-link"> ↗</a>}
                                    </span>
                                    {proj.date && <span className="entry-date">{proj.date}</span>}
                                </div>
                                {proj.description && <p>{proj.description}</p>}
                                {proj.technologies?.length > 0 && (
                                    <p className="tech-line"><strong>Technologies:</strong> {proj.technologies.join(', ')}</p>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* Certifications */}
                {certifications?.some(cert => cert.name) && (
                    <section>
                        <h2>Certifications</h2>
                        {certifications.filter(cert => cert.name).map((cert, idx) => (
                            <div key={idx} className="entry">
                                <div className="entry-header">
                                    <span className="entry-title">
                                        <strong>{cert.name}</strong>{cert.issuer ? ` — ${cert.issuer}` : ''}
                                    </span>
                                    {cert.date && <span className="entry-date">{formatDate(cert.date)}</span>}
                                </div>
                                {cert.credentialId && <p className="credential">Credential ID: {cert.credentialId}</p>}
                            </div>
                        ))}
                    </section>
                )}
            </div>

            <style jsx>{`
                .cv-minimalist {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    background: white;
                    color: #111;
                    padding: 40px;
                    min-height: 100%;
                    line-height: 1.5;
                }

                .cv-header {
                    text-align: center;
                    margin-bottom: 28px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #111;
                }

                .cv-header h1 {
                    font-size: 28px;
                    font-weight: 400;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    margin: 0 0 12px 0;
                }

                .contact-line {
                    font-size: 11px;
                    color: #555;
                    letter-spacing: 0.5px;
                }

                .cv-body {
                    max-width: 100%;
                }

                section {
                    margin-bottom: 24px;
                }

                h2 {
                    font-size: 12px;
                    font-weight: 400;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    color: #111;
                    margin: 0 0 14px 0;
                    padding-bottom: 6px;
                    border-bottom: 1px solid #ddd;
                }

                .summary {
                    font-size: 13px;
                    color: #444;
                    line-height: 1.7;
                    margin: 0;
                    text-align: justify;
                }

                .entry {
                    margin-bottom: 16px;
                }

                .entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 4px;
                }

                .entry-title {
                    font-size: 13px;
                }

                .entry-title strong {
                    font-weight: 600;
                }

                .entry-date {
                    font-size: 11px;
                    color: #777;
                }

                .entry p {
                    font-size: 12px;
                    color: #555;
                    margin: 4px 0;
                    line-height: 1.6;
                }

                .entry ul {
                    margin: 8px 0 0 0;
                    padding-left: 16px;
                    font-size: 12px;
                    color: #555;
                }

                .entry li {
                    margin-bottom: 3px;
                }

                section > p {
                    font-size: 12px;
                    color: #444;
                    margin: 0 0 6px 0;
                    line-height: 1.6;
                }

                section > p strong {
                    font-weight: 600;
                    color: #111;
                }

                .proj-link {
                    color: #555;
                    text-decoration: none;
                    font-size: 11px;
                }

                .proj-link:hover {
                    text-decoration: underline;
                }

                .tech-line {
                    font-size: 11px;
                    color: #666;
                    margin: 4px 0 0 0;
                }

                .credential {
                    font-size: 10px;
                    color: #777;
                    margin: 2px 0 0 0;
                }
            `}</style>
        </div>
    );
}
