'use client';

/**
 * Professional Template - Classic two-column layout
 * Best for: Corporate, Finance, Legal, Management roles
 */
export default function ProfessionalTemplate({ cvData, themeColor = '#1a365d', fontFamily = 'Georgia' }) {
    const { personalInfo, summary, experience, education, skills } = cvData || {};
    
    // Use theme color for sidebar
    const sidebarColor = themeColor;

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
        <div className="cv-professional">
            <div className="cv-container">
                {/* Sidebar */}
                <aside className="cv-sidebar">
                    <div className="sidebar-header">
                        <div className="initials">
                            {(personalInfo?.firstName?.[0] || 'J')}{(personalInfo?.lastName?.[0] || 'D')}
                        </div>
                        <h1 className="name">
                            {personalInfo?.firstName || 'Your'}<br/>
                            {personalInfo?.lastName || 'Name'}
                        </h1>
                        {personalInfo?.title && <p className="title">{personalInfo.title}</p>}
                    </div>

                    <div className="sidebar-section">
                        <h3>Contact</h3>
                        <ul className="contact-list">
                            {personalInfo?.email && (
                                <li>
                                    <span className="icon">✉</span>
                                    {personalInfo.email}
                                </li>
                            )}
                            {personalInfo?.phone && (
                                <li>
                                    <span className="icon">☎</span>
                                    {personalInfo.phone}
                                </li>
                            )}
                            {personalInfo?.location && (
                                <li>
                                    <span className="icon">⚲</span>
                                    {personalInfo.location}
                                </li>
                            )}
                            {personalInfo?.linkedin && (
                                <li>
                                    <span className="icon">in</span>
                                    {personalInfo.linkedin}
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Skills in sidebar */}
                    {skills?.technical?.length > 0 && (
                        <div className="sidebar-section">
                            <h3>Technical Skills</h3>
                            <ul className="skills-list">
                                {skills.technical.map((skill, i) => (
                                    <li key={i}>{skill}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {skills?.soft?.length > 0 && (
                        <div className="sidebar-section">
                            <h3>Soft Skills</h3>
                            <ul className="skills-list">
                                {skills.soft.map((skill, i) => (
                                    <li key={i}>{skill}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {skills?.certifications?.length > 0 && (
                        <div className="sidebar-section">
                            <h3>Certifications</h3>
                            <ul className="skills-list">
                                {skills.certifications.map((cert, i) => (
                                    <li key={i}>{cert}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main className="cv-main">
                    {/* Summary */}
                    {summary && (
                        <section className="main-section">
                            <h2>Professional Profile</h2>
                            <p className="summary">{summary}</p>
                        </section>
                    )}

                    {/* Experience */}
                    {experience?.some(exp => exp.company || exp.title) && (
                        <section className="main-section">
                            <h2>Professional Experience</h2>
                            {experience.filter(exp => exp.company || exp.title).map((exp, idx) => (
                                <div key={idx} className="experience-item">
                                    <div className="exp-top">
                                        <h3>{exp.title}</h3>
                                        <span className="date">
                                            {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                        </span>
                                    </div>
                                    <p className="company">{exp.company}{exp.location ? ` | ${exp.location}` : ''}</p>
                                    {exp.description && <p className="desc">{exp.description}</p>}
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
                        <section className="main-section">
                            <h2>Education</h2>
                            {education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                                <div key={idx} className="education-item">
                                    <div className="edu-top">
                                        <h3>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                                        <span className="date">{edu.startDate} – {edu.endDate}</span>
                                    </div>
                                    <p className="school">{edu.school}</p>
                                    {edu.gpa && <p className="gpa">GPA: {edu.gpa}</p>}
                                    {edu.honors && <p className="honors">{edu.honors}</p>}
                                </div>
                            ))}
                        </section>
                    )}
                </main>
            </div>

            <style jsx>{`
                .cv-professional {
                    font-family: '${fontFamily}', 'Times New Roman', serif;
                    background: white;
                    color: #2d3748;
                    min-height: 100%;
                }

                .cv-container {
                    display: grid;
                    grid-template-columns: 220px 1fr;
                    min-height: 100%;
                }

                .cv-sidebar {
                    background: ${sidebarColor};
                    color: white;
                    padding: 28px 20px;
                }

                .sidebar-header {
                    text-align: center;
                    margin-bottom: 28px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.2);
                }

                .initials {
                    width: 70px;
                    height: 70px;
                    background: rgba(255,255,255,0.15);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 auto 12px;
                    letter-spacing: 2px;
                }

                .name {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0;
                    line-height: 1.3;
                }

                .title {
                    font-size: 12px;
                    opacity: 0.85;
                    margin: 8px 0 0 0;
                    font-style: italic;
                }

                .sidebar-section {
                    margin-bottom: 24px;
                }

                .sidebar-section h3 {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin: 0 0 12px 0;
                    padding-bottom: 6px;
                    border-bottom: 1px solid rgba(255,255,255,0.3);
                    color: #90cdf4;
                }

                .contact-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    font-size: 11px;
                }

                .contact-list li {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    margin-bottom: 10px;
                    line-height: 1.4;
                    word-break: break-word;
                }

                .contact-list .icon {
                    opacity: 0.7;
                    flex-shrink: 0;
                    width: 14px;
                }

                .skills-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    font-size: 11px;
                }

                .skills-list li {
                    padding: 4px 0;
                    border-bottom: 1px dotted rgba(255,255,255,0.15);
                }

                .skills-list li:last-child {
                    border-bottom: none;
                }

                .cv-main {
                    padding: 28px 32px;
                }

                .main-section {
                    margin-bottom: 24px;
                }

                .main-section h2 {
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    color: #1a365d;
                    margin: 0 0 16px 0;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #1a365d;
                }

                .summary {
                    font-size: 13px;
                    line-height: 1.7;
                    color: #4a5568;
                    margin: 0;
                }

                .experience-item, .education-item {
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .experience-item:last-child, .education-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .exp-top, .edu-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                }

                .experience-item h3, .education-item h3 {
                    font-size: 14px;
                    font-weight: 700;
                    margin: 0;
                    color: #2d3748;
                }

                .date {
                    font-size: 11px;
                    color: #718096;
                    font-style: italic;
                }

                .company, .school {
                    font-size: 12px;
                    color: #4a5568;
                    margin: 4px 0 8px 0;
                    font-weight: 600;
                }

                .desc {
                    font-size: 12px;
                    color: #4a5568;
                    line-height: 1.6;
                    margin: 0 0 8px 0;
                }

                .bullets {
                    margin: 0;
                    padding-left: 16px;
                    font-size: 12px;
                    color: #4a5568;
                    line-height: 1.6;
                }

                .bullets li {
                    margin-bottom: 4px;
                }

                .gpa, .honors {
                    font-size: 11px;
                    color: #718096;
                    margin: 4px 0 0 0;
                }
            `}</style>
        </div>
    );
}
