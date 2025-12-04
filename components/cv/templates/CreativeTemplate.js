'use client';

/**
 * Creative Template - Bold sidebar with accent colors
 * Best for: Design, Marketing, Creative roles
 */
export default function CreativeTemplate({ cvData }) {
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
        <div className="cv-creative">
            <div className="cv-layout">
                {/* Left accent bar */}
                <div className="accent-bar"></div>

                {/* Main content */}
                <div className="cv-content">
                    {/* Header */}
                    <header className="cv-header">
                        <div className="name-block">
                            <h1>
                                <span className="first">{personalInfo?.firstName || 'Your'}</span>
                                <span className="last">{personalInfo?.lastName || 'Name'}</span>
                            </h1>
                            {personalInfo?.title && <p className="job-title">{personalInfo.title}</p>}
                        </div>
                        <div className="contact-block">
                            {personalInfo?.email && <span>{personalInfo.email}</span>}
                            {personalInfo?.phone && <span>{personalInfo.phone}</span>}
                            {personalInfo?.location && <span>{personalInfo.location}</span>}
                            {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
                            {personalInfo?.github && <span>{personalInfo.github}</span>}
                        </div>
                    </header>

                    {/* Summary with highlight */}
                    {summary && (
                        <section className="section summary-section">
                            <div className="summary-box">
                                <span className="quote-mark">"</span>
                                <p>{summary}</p>
                            </div>
                        </section>
                    )}

                    {/* Two column layout for experience and skills */}
                    <div className="two-columns">
                        <div className="main-column">
                            {/* Experience */}
                            {experience?.some(exp => exp.company || exp.title) && (
                                <section className="section">
                                    <h2>
                                        <span className="icon">💼</span>
                                        Experience
                                    </h2>
                                    {experience.filter(exp => exp.company || exp.title).map((exp, idx) => (
                                        <div key={idx} className="timeline-item">
                                            <div className="timeline-marker"></div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <h3>{exp.title}</h3>
                                                    <span className="period">
                                                        {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                                    </span>
                                                </div>
                                                <p className="company">{exp.company}</p>
                                                {exp.description && <p className="desc">{exp.description}</p>}
                                                {exp.bullets?.length > 0 && (
                                                    <ul>
                                                        {exp.bullets.map((bullet, i) => (
                                                            <li key={i}>{bullet}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </section>
                            )}

                            {/* Education */}
                            {education?.some(edu => edu.school || edu.degree) && (
                                <section className="section">
                                    <h2>
                                        <span className="icon">🎓</span>
                                        Education
                                    </h2>
                                    {education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                                        <div key={idx} className="education-item">
                                            <h3>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                                            <p className="school">{edu.school}</p>
                                            <span className="year">{edu.startDate} – {edu.endDate}</span>
                                        </div>
                                    ))}
                                </section>
                            )}

                            {/* Projects */}
                            {projects?.some(proj => proj.name || proj.description) && (
                                <section className="section">
                                    <h2>
                                        <span className="icon">🚀</span>
                                        Projects
                                    </h2>
                                    {projects.filter(proj => proj.name || proj.description).map((proj, idx) => (
                                        <div key={idx} className="project-item">
                                            <div className="project-header">
                                                <h3>{proj.name}</h3>
                                                {proj.date && <span className="year">{proj.date}</span>}
                                            </div>
                                            {proj.link && <a href={proj.link} className="proj-link">{proj.link}</a>}
                                            {proj.description && <p className="desc">{proj.description}</p>}
                                            {proj.technologies?.length > 0 && (
                                                <div className="proj-tech">
                                                    {proj.technologies.map((tech, i) => (
                                                        <span key={i} className="tech-tag">{tech}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </section>
                            )}
                        </div>

                        <div className="side-column">
                            {/* Skills */}
                            {skills?.technical?.length > 0 && (
                                <section className="section skills-section">
                                    <h2>
                                        <span className="icon">⚡</span>
                                        Skills
                                    </h2>
                                    <div className="skill-bars">
                                        {skills.technical.slice(0, 6).map((skill, i) => (
                                            <div key={i} className="skill-item">
                                                <span className="skill-name">{skill}</span>
                                                <div className="skill-bar">
                                                    <div className="skill-fill" style={{ width: `${90 - i * 8}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {skills?.soft?.length > 0 && (
                                <section className="section">
                                    <h2>
                                        <span className="icon">✨</span>
                                        Soft Skills
                                    </h2>
                                    <div className="tags">
                                        {skills.soft.map((skill, i) => (
                                            <span key={i} className="tag">{skill}</span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {skills?.certifications?.length > 0 && (
                                <section className="section">
                                    <h2>
                                        <span className="icon">🏆</span>
                                        Certifications
                                    </h2>
                                    <ul className="cert-list">
                                        {skills.certifications.map((cert, i) => (
                                            <li key={i}>{cert}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* New Certifications with details */}
                            {certifications?.some(cert => cert.name) && (
                                <section className="section">
                                    <h2>
                                        <span className="icon">🏆</span>
                                        Certifications
                                    </h2>
                                    <ul className="cert-list detailed">
                                        {certifications.filter(cert => cert.name).map((cert, i) => (
                                            <li key={i}>
                                                <span className="cert-name">{cert.name}</span>
                                                {cert.issuer && <span className="cert-issuer">{cert.issuer}</span>}
                                                {cert.date && <span className="cert-date">{cert.date}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .cv-creative {
                    font-family: 'Poppins', 'Segoe UI', sans-serif;
                    background: white;
                    color: #333;
                    min-height: 100%;
                }

                .cv-layout {
                    display: flex;
                    min-height: 100%;
                }

                .accent-bar {
                    width: 8px;
                    background: linear-gradient(180deg, #f59e0b 0%, #ef4444 50%, #8b5cf6 100%);
                }

                .cv-content {
                    flex: 1;
                    padding: 28px;
                }

                .cv-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #f59e0b;
                }

                .name-block h1 {
                    font-size: 28px;
                    font-weight: 800;
                    margin: 0;
                    line-height: 1.1;
                }

                .first {
                    color: #333;
                    display: block;
                }

                .last {
                    color: #f59e0b;
                    display: block;
                }

                .job-title {
                    font-size: 14px;
                    color: #666;
                    margin: 8px 0 0 0;
                    font-weight: 500;
                }

                .contact-block {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    font-size: 11px;
                    color: #666;
                    gap: 4px;
                }

                .summary-section {
                    margin-bottom: 24px;
                }

                .summary-box {
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    padding: 16px 20px;
                    border-radius: 8px;
                    position: relative;
                }

                .quote-mark {
                    font-size: 48px;
                    color: #f59e0b;
                    opacity: 0.5;
                    position: absolute;
                    top: -5px;
                    left: 10px;
                    font-family: Georgia, serif;
                }

                .summary-box p {
                    font-size: 13px;
                    line-height: 1.6;
                    margin: 0;
                    color: #555;
                    padding-left: 20px;
                }

                .two-columns {
                    display: grid;
                    grid-template-columns: 1fr 180px;
                    gap: 24px;
                }

                .section {
                    margin-bottom: 20px;
                }

                .section h2 {
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #333;
                    margin: 0 0 14px 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .icon {
                    font-size: 14px;
                }

                .timeline-item {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 16px;
                    position: relative;
                }

                .timeline-marker {
                    width: 10px;
                    height: 10px;
                    background: #f59e0b;
                    border-radius: 50%;
                    flex-shrink: 0;
                    margin-top: 4px;
                }

                .timeline-item::before {
                    content: '';
                    position: absolute;
                    left: 4px;
                    top: 14px;
                    bottom: -8px;
                    width: 2px;
                    background: #fde68a;
                }

                .timeline-item:last-child::before {
                    display: none;
                }

                .timeline-content {
                    flex: 1;
                }

                .timeline-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                }

                .timeline-content h3 {
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0;
                }

                .period {
                    font-size: 10px;
                    color: #888;
                }

                .company {
                    font-size: 12px;
                    color: #f59e0b;
                    margin: 2px 0 6px 0;
                    font-weight: 500;
                }

                .desc {
                    font-size: 11px;
                    color: #666;
                    line-height: 1.5;
                    margin: 0 0 6px 0;
                }

                .timeline-content ul {
                    margin: 0;
                    padding-left: 14px;
                    font-size: 11px;
                    color: #666;
                }

                .timeline-content li {
                    margin-bottom: 2px;
                }

                .education-item {
                    margin-bottom: 12px;
                }

                .education-item h3 {
                    font-size: 13px;
                    font-weight: 600;
                    margin: 0;
                }

                .school {
                    font-size: 12px;
                    color: #666;
                    margin: 2px 0;
                }

                .year {
                    font-size: 10px;
                    color: #888;
                }

                .skill-bars {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .skill-item {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .skill-name {
                    font-size: 10px;
                    font-weight: 500;
                }

                .skill-bar {
                    height: 6px;
                    background: #f3f4f6;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .skill-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);
                    border-radius: 3px;
                }

                .tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .tag {
                    font-size: 9px;
                    padding: 3px 8px;
                    background: #fef3c7;
                    color: #92400e;
                    border-radius: 10px;
                }

                .cert-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    font-size: 10px;
                }

                .cert-list li {
                    padding: 4px 0;
                    border-bottom: 1px dotted #e5e7eb;
                }

                .cert-list.detailed li {
                    padding: 6px 0;
                }

                .cert-name {
                    display: block;
                    font-weight: 600;
                }

                .cert-issuer {
                    display: block;
                    font-size: 9px;
                    opacity: 0.8;
                    margin-top: 2px;
                }

                .cert-date {
                    display: block;
                    font-size: 9px;
                    opacity: 0.6;
                }

                .project-item {
                    margin-bottom: 14px;
                }

                .project-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                }

                .project-item h3 {
                    font-size: 13px;
                    font-weight: 600;
                    margin: 0;
                }

                .proj-link {
                    font-size: 10px;
                    color: #f59e0b;
                    text-decoration: none;
                    display: block;
                    margin: 2px 0 4px 0;
                }

                .proj-link:hover {
                    text-decoration: underline;
                }

                .proj-tech {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-top: 6px;
                }

                .tech-tag {
                    font-size: 9px;
                    padding: 2px 6px;
                    background: #fef3c7;
                    color: #92400e;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
}
