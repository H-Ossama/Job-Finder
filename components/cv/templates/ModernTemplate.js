'use client';

/**
 * Modern Template - Clean single column with accent header
 * Best for: Tech, Startup, Creative roles
 */
export default function ModernTemplate({ cvData, themeColor = '#667eea', fontFamily = 'Inter' }) {
    const { personalInfo, summary, experience, education, skills } = cvData || {};
    
    // Use theme color for accents
    const accentColor = themeColor;

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
        <div className="cv-modern">
            {/* Header with gradient */}
            <header className="cv-header">
                <h1 className="cv-name">
                    {personalInfo?.firstName || 'Your'} {personalInfo?.lastName || 'Name'}
                </h1>
                {personalInfo?.title && <p className="cv-title">{personalInfo.title}</p>}
                <div className="cv-contact">
                    {personalInfo?.email && <span>{personalInfo.email}</span>}
                    {personalInfo?.phone && <span>{personalInfo.phone}</span>}
                    {personalInfo?.location && <span>{personalInfo.location}</span>}
                </div>
                <div className="cv-links">
                    {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
                    {personalInfo?.github && <span>{personalInfo.github}</span>}
                    {personalInfo?.website && <span>{personalInfo.website}</span>}
                </div>
            </header>

            <main className="cv-body">
                {/* Summary */}
                {summary && (
                    <section className="cv-section">
                        <h2>Professional Summary</h2>
                        <p className="summary-text">{summary}</p>
                    </section>
                )}

                {/* Experience */}
                {experience?.some(exp => exp.company || exp.title) && (
                    <section className="cv-section">
                        <h2>Experience</h2>
                        {experience.filter(exp => exp.company || exp.title).map((exp, idx) => (
                            <div key={idx} className="experience-item">
                                <div className="exp-header">
                                    <div>
                                        <h3>{exp.title}</h3>
                                        <p className="company">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                                    </div>
                                    <span className="date">
                                        {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                    </span>
                                </div>
                                {exp.description && <p className="description">{exp.description}</p>}
                                {exp.bullets?.length > 0 && (
                                    <ul className="bullets">
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
                        <h2>Education</h2>
                        {education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                            <div key={idx} className="education-item">
                                <div className="edu-header">
                                    <div>
                                        <h3>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                                        <p className="school">{edu.school}</p>
                                    </div>
                                    <span className="date">{edu.startDate} – {edu.endDate}</span>
                                </div>
                                {edu.gpa && <p className="gpa">GPA: {edu.gpa}</p>}
                            </div>
                        ))}
                    </section>
                )}

                {/* Skills */}
                {(skills?.technical?.length > 0 || skills?.soft?.length > 0) && (
                    <section className="cv-section">
                        <h2>Skills</h2>
                        <div className="skills-container">
                            {skills?.technical?.length > 0 && (
                                <div className="skill-group">
                                    <span className="skill-label">Technical:</span>
                                    <div className="skill-tags">
                                        {skills.technical.map((skill, i) => (
                                            <span key={i} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {skills?.soft?.length > 0 && (
                                <div className="skill-group">
                                    <span className="skill-label">Soft Skills:</span>
                                    <div className="skill-tags">
                                        {skills.soft.map((skill, i) => (
                                            <span key={i} className="skill-tag soft">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>

            <style jsx>{`
                .cv-modern {
                    font-family: '${fontFamily}', 'Segoe UI', sans-serif;
                    background: white;
                    color: #1a1a2e;
                    min-height: 100%;
                }

                .cv-header {
                    background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%);
                    color: white;
                    padding: 32px;
                    text-align: center;
                }

                .cv-name {
                    font-size: 32px;
                    font-weight: 700;
                    margin: 0 0 4px 0;
                }

                .cv-title {
                    font-size: 16px;
                    opacity: 0.9;
                    margin: 0 0 16px 0;
                }

                .cv-contact {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 20px;
                    font-size: 13px;
                    opacity: 0.95;
                }

                .cv-links {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 20px;
                    font-size: 12px;
                    margin-top: 8px;
                    opacity: 0.85;
                }

                .cv-body {
                    padding: 28px 32px;
                }

                .cv-section {
                    margin-bottom: 24px;
                }

                .cv-section h2 {
                    font-size: 14px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: ${accentColor};
                    border-bottom: 2px solid ${accentColor};
                    padding-bottom: 8px;
                    margin: 0 0 16px 0;
                }

                .summary-text {
                    font-size: 13px;
                    line-height: 1.7;
                    color: #4a4a4a;
                    margin: 0;
                }

                .experience-item, .education-item {
                    margin-bottom: 20px;
                }

                .exp-header, .edu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }

                .experience-item h3, .education-item h3 {
                    font-size: 15px;
                    font-weight: 600;
                    margin: 0;
                    color: #1a1a2e;
                }

                .company, .school {
                    font-size: 13px;
                    color: ${accentColor};
                    margin: 2px 0 0 0;
                }

                .date {
                    font-size: 12px;
                    color: #888;
                    white-space: nowrap;
                }

                .description {
                    font-size: 13px;
                    color: #555;
                    margin: 0 0 8px 0;
                    line-height: 1.5;
                }

                .bullets {
                    margin: 0;
                    padding-left: 18px;
                    font-size: 13px;
                    color: #555;
                    line-height: 1.6;
                }

                .bullets li {
                    margin-bottom: 4px;
                }

                .gpa {
                    font-size: 12px;
                    color: #666;
                    margin: 4px 0 0 0;
                }

                .skills-container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .skill-group {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }

                .skill-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #555;
                    min-width: 80px;
                }

                .skill-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .skill-tag {
                    font-size: 11px;
                    padding: 4px 10px;
                    background: ${accentColor};
                    color: white;
                    border-radius: 12px;
                }

                .skill-tag.soft {
                    background: #f0f0f0;
                    color: #555;
                }
            `}</style>
        </div>
    );
}
