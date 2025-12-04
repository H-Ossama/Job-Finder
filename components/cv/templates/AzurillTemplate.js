'use client';

/**
 * Azurill Template - Inspired by Reactive Resume (AmruthPillai)
 * Centered header with clean typography, minimalist style
 * Best for: Academic, Research, Professional roles
 */
export default function AzurillTemplate({ cvData }) {
    const { personalInfo, summary, experience, education, skills, projects, awards, publications, certifications } = cvData || {};

    const formatDate = (date) => {
        if (!date) return '';
        if (date.includes('-')) {
            const [year, month] = date.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(month) - 1] || ''} ${year}`;
        }
        return date;
    };

    const renderRating = (level) => {
        const maxLevel = 5;
        const normalizedLevel = Math.min(Math.max(level || 0, 0), maxLevel);
        return (
            <div className="rating">
                {Array.from({ length: maxLevel }).map((_, i) => (
                    <span 
                        key={i} 
                        className={`rating-dot ${i < normalizedLevel ? 'filled' : ''}`}
                    ></span>
                ))}
            </div>
        );
    };

    return (
        <div className="cv-azurill">
            {/* Centered Header */}
            <header className="cv-header">
                {personalInfo?.photo && (
                    <div className="photo" style={{ backgroundImage: `url(${personalInfo.photo})` }}></div>
                )}
                <h1 className="cv-name">
                    {personalInfo?.firstName || 'Your'} {personalInfo?.lastName || 'Name'}
                </h1>
                {personalInfo?.title && <p className="cv-title">{personalInfo.title}</p>}
                
                <div className="contact-row">
                    {personalInfo?.email && (
                        <span className="contact-item">{personalInfo.email}</span>
                    )}
                    {personalInfo?.phone && (
                        <span className="contact-item">{personalInfo.phone}</span>
                    )}
                    {personalInfo?.location && (
                        <span className="contact-item">{personalInfo.location}</span>
                    )}
                </div>
                
                <div className="links-row">
                    {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
                    {personalInfo?.github && <span>{personalInfo.github}</span>}
                    {personalInfo?.website && <span>{personalInfo.website}</span>}
                </div>
            </header>

            <main className="cv-body">
                {/* Summary */}
                {summary && (
                    <section className="cv-section">
                        <h2 className="section-title">Summary</h2>
                        <div className="section-content">
                            <p className="summary-text">{summary}</p>
                        </div>
                    </section>
                )}

                {/* Experience */}
                {experience?.some(exp => exp.company || exp.title) && (
                    <section className="cv-section">
                        <h2 className="section-title">Experience</h2>
                        <div className="section-content">
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
                        </div>
                    </section>
                )}

                {/* Education */}
                {education?.some(edu => edu.school || edu.degree) && (
                    <section className="cv-section">
                        <h2 className="section-title">Education</h2>
                        <div className="section-content">
                            {education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                                <div key={idx} className="entry">
                                    <div className="entry-header">
                                        <div className="entry-main">
                                            <h3 className="entry-title">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                                            <p className="entry-org">{edu.school}</p>
                                        </div>
                                        <div className="entry-meta">
                                            <span className="entry-date">
                                                {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                            </span>
                                        </div>
                                    </div>
                                    {edu.gpa && <p className="entry-gpa">GPA: {edu.gpa}</p>}
                                    {edu.honors && <p className="entry-honors">{edu.honors}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills with ratings */}
                {(skills?.technical?.length > 0 || skills?.soft?.length > 0 || skills?.languages?.length > 0) && (
                    <section className="cv-section">
                        <h2 className="section-title">Skills</h2>
                        <div className="section-content">
                            <div className="skills-container">
                                {skills?.technical?.length > 0 && (
                                    <div className="skill-group">
                                        <h4>Technical</h4>
                                        <div className="skill-list">
                                            {skills.technical.map((skill, i) => (
                                                <span key={i} className="skill-chip">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {skills?.soft?.length > 0 && (
                                    <div className="skill-group">
                                        <h4>Soft Skills</h4>
                                        <div className="skill-list">
                                            {skills.soft.map((skill, i) => (
                                                <span key={i} className="skill-chip soft">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {skills?.languages?.length > 0 && (
                                    <div className="skill-group">
                                        <h4>Languages</h4>
                                        <div className="skill-list">
                                            {skills.languages.map((lang, i) => (
                                                <span key={i} className="skill-chip lang">{lang}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects?.length > 0 && projects.some(p => p.name) && (
                    <section className="cv-section">
                        <h2 className="section-title">Projects</h2>
                        <div className="section-content">
                            {projects.filter(p => p.name).map((project, idx) => (
                                <div key={idx} className="entry">
                                    <div className="entry-header">
                                        <h3 className="entry-title">{project.name}</h3>
                                        {project.date && <span className="entry-date">{project.date}</span>}
                                    </div>
                                    {project.description && <p className="entry-desc">{project.description}</p>}
                                    {project.technologies && (
                                        <div className="tech-tags">
                                            {(Array.isArray(project.technologies) ? project.technologies : project.technologies.split(',')).map((tech, i) => (
                                                <span key={i} className="tech-tag">{typeof tech === 'string' ? tech.trim() : tech}</span>
                                            ))}
                                        </div>
                                    )}
                                    {(project.url || project.link) && <p className="entry-url">{project.url || project.link}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certifications */}
                {certifications?.some(cert => cert.name) && (
                    <section className="cv-section">
                        <h2 className="section-title">Certifications</h2>
                        <div className="section-content">
                            {certifications.filter(cert => cert.name).map((cert, idx) => (
                                <div key={idx} className="entry cert-entry">
                                    <div className="entry-header">
                                        <div className="entry-main">
                                            <h3 className="entry-title">{cert.name}</h3>
                                            {cert.issuer && <p className="entry-org">{cert.issuer}</p>}
                                        </div>
                                        <div className="entry-meta">
                                            {cert.date && <span className="entry-date">{formatDate(cert.date)}</span>}
                                        </div>
                                    </div>
                                    {cert.credentialId && <p className="entry-credential">Credential ID: {cert.credentialId}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Publications */}
                {publications?.length > 0 && publications.some(p => p.title) && (
                    <section className="cv-section">
                        <h2 className="section-title">Publications</h2>
                        <div className="section-content">
                            {publications.filter(p => p.title).map((pub, idx) => (
                                <div key={idx} className="entry publication">
                                    <h3 className="entry-title">{pub.title}</h3>
                                    {pub.journal && <p className="entry-journal">{pub.journal}</p>}
                                    {pub.date && <span className="entry-date">{pub.date}</span>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Awards */}
                {awards?.length > 0 && awards.some(a => a.title) && (
                    <section className="cv-section">
                        <h2 className="section-title">Awards & Honors</h2>
                        <div className="section-content">
                            {awards.filter(a => a.title).map((award, idx) => (
                                <div key={idx} className="entry award">
                                    <div className="award-content">
                                        <h3 className="entry-title">{award.title}</h3>
                                        {award.issuer && <p className="entry-org">{award.issuer}</p>}
                                    </div>
                                    <span className="entry-date">{award.date}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <style jsx>{`
                .cv-azurill {
                    font-family: 'Inter', 'Segoe UI', sans-serif;
                    background: white;
                    color: #374151;
                    min-height: 100%;
                    font-size: 10pt;
                }

                .cv-header {
                    text-align: center;
                    padding: 28px 32px 20px;
                    border-bottom: 2px solid #10b981;
                }

                .photo {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background-size: cover;
                    background-position: center;
                    margin: 0 auto 12px;
                    border: 3px solid #10b981;
                }

                .cv-name {
                    font-size: 28px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                }

                .cv-title {
                    font-size: 12pt;
                    color: #10b981;
                    margin: 4px 0 12px 0;
                    font-weight: 500;
                }

                .contact-row {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 20px;
                    font-size: 9.5pt;
                    color: #6b7280;
                }

                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .links-row {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-top: 8px;
                    font-size: 9pt;
                    color: #10b981;
                }

                .cv-body {
                    padding: 20px 32px;
                }

                .cv-section {
                    margin-bottom: 18px;
                }

                .section-title {
                    font-size: 11pt;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 12px 0;
                    padding-bottom: 4px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .section-content {
                    padding-left: 0;
                }

                .summary-text {
                    font-size: 9.5pt;
                    line-height: 1.6;
                    color: #4b5563;
                    margin: 0;
                }

                .entry {
                    margin-bottom: 14px;
                }

                .entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .entry-main {
                    flex: 1;
                }

                .entry-meta {
                    text-align: right;
                    min-width: 110px;
                }

                .entry-title {
                    font-size: 10.5pt;
                    font-weight: 600;
                    color: #111827;
                    margin: 0;
                }

                .entry-org {
                    font-size: 9.5pt;
                    color: #10b981;
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

                .entry-gpa, .entry-honors {
                    font-size: 8.5pt;
                    color: #6b7280;
                    margin: 4px 0 0 0;
                }

                .entry-url {
                    font-size: 8.5pt;
                    color: #10b981;
                    margin: 4px 0 0 0;
                }

                .entry-journal {
                    font-size: 9pt;
                    color: #6b7280;
                    font-style: italic;
                    margin: 2px 0 0 0;
                }

                .skills-container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .skill-group h4 {
                    font-size: 9pt;
                    font-weight: 600;
                    color: #374151;
                    margin: 0 0 6px 0;
                }

                .skill-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .skill-chip {
                    font-size: 8.5pt;
                    padding: 4px 10px;
                    background: #10b981;
                    color: white;
                    border-radius: 12px;
                }

                .skill-chip.soft {
                    background: #f3f4f6;
                    color: #374151;
                }

                .skill-chip.lang {
                    background: #d1fae5;
                    color: #065f46;
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
                    background: #f0fdf4;
                    color: #10b981;
                    border-radius: 4px;
                    border: 1px solid #d1fae5;
                }

                .entry.publication {
                    padding-bottom: 10px;
                    border-bottom: 1px dashed #e5e7eb;
                }

                .entry.award {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .award-content {
                    flex: 1;
                }

                .rating {
                    display: flex;
                    gap: 4px;
                }

                .rating-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    border: 1px solid #10b981;
                    background: transparent;
                }

                .rating-dot.filled {
                    background: #10b981;
                }

                .cert-entry {
                    margin-bottom: 12px;
                }

                .entry-credential {
                    font-size: 8.5pt;
                    color: #6b7280;
                    margin: 4px 0 0 0;
                }

                @media print {
                    .cv-azurill {
                        font-size: 9pt;
                    }
                }
            `}</style>
        </div>
    );
}
