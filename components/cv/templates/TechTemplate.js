'use client';

/**
 * Tech Template - Modern design for tech professionals
 * Best for: Software Engineers, Data Scientists, DevOps, IT
 */
export default function TechTemplate({ cvData }) {
    const { personalInfo, summary, experience, education, skills, projects, certifications: detailedCertifications } = cvData || {};

    const formatDate = (date) => {
        if (!date) return '';
        if (date.includes('-')) {
            const [year, month] = date.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(month) - 1] || ''} ${year}`;
        }
        return date;
    };

    // Split skills into columns
    const technicalSkills = skills?.technical || [];
    const softSkills = skills?.soft || [];
    const skillsCertifications = skills?.certifications || [];
    const languages = skills?.languages || [];
    
    // Combine certifications from both sources
    const allCertifications = [
        ...(detailedCertifications || []).filter(c => c.name).map(c => c.name + (c.issuer ? ` (${c.issuer})` : '')),
        ...skillsCertifications
    ];

    return (
        <div className="cv-tech">
            {/* Terminal-style Header */}
            <header className="cv-header">
                <div className="terminal-bar">
                    <div className="terminal-buttons">
                        <span className="btn red"></span>
                        <span className="btn yellow"></span>
                        <span className="btn green"></span>
                    </div>
                    <span className="terminal-title">~/profile/{(personalInfo?.firstName || 'developer').toLowerCase()}</span>
                </div>
                <div className="terminal-content">
                    <div className="name-block">
                        <span className="prompt">$</span>
                        <h1>{personalInfo?.firstName || 'Your'} {personalInfo?.lastName || 'Name'}</h1>
                    </div>
                    {personalInfo?.title && <p className="title">{personalInfo.title}</p>}
                    <div className="contact-line">
                        {personalInfo?.email && <span className="contact">{personalInfo.email}</span>}
                        {personalInfo?.phone && <span className="contact">{personalInfo.phone}</span>}
                        {personalInfo?.location && <span className="contact">{personalInfo.location}</span>}
                    </div>
                    <div className="links-line">
                        {personalInfo?.linkedin && <span className="link">LinkedIn: {personalInfo.linkedin}</span>}
                        {personalInfo?.github && <span className="link">GitHub: {personalInfo.github}</span>}
                        {personalInfo?.portfolio && <span className="link">Portfolio: {personalInfo.portfolio}</span>}
                    </div>
                </div>
            </header>

            <main className="cv-main">
                {/* Tech Stack Bar */}
                {technicalSkills.length > 0 && (
                    <div className="tech-stack-bar">
                        {technicalSkills.slice(0, 8).map((skill, i) => (
                            <span key={i} className="tech-badge">{skill}</span>
                        ))}
                        {technicalSkills.length > 8 && (
                            <span className="tech-badge more">+{technicalSkills.length - 8}</span>
                        )}
                    </div>
                )}

                <div className="content-grid">
                    <div className="main-column">
                        {/* Summary */}
                        {summary && (
                            <section className="section">
                                <h2><span className="hash">//</span> About</h2>
                                <p className="summary">{summary}</p>
                            </section>
                        )}

                        {/* Experience */}
                        {experience?.some(exp => exp.company || exp.title) && (
                            <section className="section">
                                <h2><span className="hash">//</span> Experience</h2>
                                {experience.filter(exp => exp.company || exp.title).map((exp, idx) => (
                                    <div key={idx} className="experience-card">
                                        <div className="exp-header">
                                            <div className="exp-title-row">
                                                <h3>{exp.title}</h3>
                                                <span className="date">
                                                    {formatDate(exp.startDate)} → {exp.current ? 'Present' : formatDate(exp.endDate)}
                                                </span>
                                            </div>
                                            <p className="company">
                                                <span className="at">@</span>{exp.company}
                                                {exp.location && <span className="location"> • {exp.location}</span>}
                                            </p>
                                        </div>
                                        {exp.description && <p className="desc">{exp.description}</p>}
                                        {exp.bullets?.length > 0 && (
                                            <ul className="bullets">
                                                {exp.bullets.map((bullet, i) => (
                                                    <li key={i}><span className="bullet-icon">▹</span>{bullet}</li>
                                                ))}
                                            </ul>
                                        )}
                                        {exp.technologies && (
                                            <div className="exp-tech">
                                                {exp.technologies.split(',').map((tech, i) => (
                                                    <span key={i} className="exp-tech-tag">{tech.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Projects */}
                        {projects?.some(proj => proj.name || proj.description) && (
                            <section className="section">
                                <h2><span className="hash">//</span> Projects</h2>
                                <div className="projects-grid">
                                    {projects.filter(proj => proj.name || proj.description).map((proj, idx) => (
                                        <div key={idx} className="project-card">
                                            <div className="project-header">
                                                <h4>{proj.name}</h4>
                                                {(proj.url || proj.link) && <a href={proj.url || proj.link} className="project-link">↗</a>}
                                            </div>
                                            {proj.description && <p>{proj.description}</p>}
                                            {proj.technologies && (
                                                <div className="project-tech">
                                                    {(Array.isArray(proj.technologies) ? proj.technologies : proj.technologies.split(',')).map((tech, i) => (
                                                        <span key={i}>{typeof tech === 'string' ? tech.trim() : tech}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="side-column">
                        {/* Education */}
                        {education?.some(edu => edu.school || edu.degree) && (
                            <section className="section">
                                <h2><span className="hash">//</span> Education</h2>
                                {education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                                    <div key={idx} className="edu-entry">
                                        <h4>{edu.degree}</h4>
                                        {edu.field && <p className="field">{edu.field}</p>}
                                        <p className="school">{edu.school}</p>
                                        <span className="year">{edu.endDate}</span>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Full Skills */}
                        {technicalSkills.length > 0 && (
                            <section className="section">
                                <h2><span className="hash">//</span> Tech Stack</h2>
                                <div className="skills-list">
                                    {technicalSkills.map((skill, i) => (
                                        <span key={i} className="skill-item">{skill}</span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Certifications */}
                        {allCertifications.length > 0 && (
                            <section className="section">
                                <h2><span className="hash">//</span> Certifications</h2>
                                <div className="certs-list">
                                    {allCertifications.map((cert, i) => (
                                        <div key={i} className="cert">
                                            <span className="cert-icon">✓</span> {cert}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Languages */}
                        {languages.length > 0 && (
                            <section className="section">
                                <h2><span className="hash">//</span> Languages</h2>
                                <div className="languages-list">
                                    {languages.map((lang, i) => (
                                        <span key={i} className="lang-item">{lang}</span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .cv-tech {
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    background: #0d1117;
                    color: #e6edf3;
                    min-height: 100%;
                }

                .cv-header {
                    background: #161b22;
                }

                .terminal-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 16px;
                    background: #21262d;
                    border-bottom: 1px solid #30363d;
                }

                .terminal-buttons {
                    display: flex;
                    gap: 6px;
                }

                .btn {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }

                .btn.red { background: #f85149; }
                .btn.yellow { background: #f0883e; }
                .btn.green { background: #3fb950; }

                .terminal-title {
                    font-size: 11px;
                    color: #7d8590;
                }

                .terminal-content {
                    padding: 24px;
                }

                .name-block {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .prompt {
                    color: #3fb950;
                    font-size: 24px;
                }

                .name-block h1 {
                    font-size: 28px;
                    font-weight: 600;
                    margin: 0;
                    color: #58a6ff;
                }

                .title {
                    font-size: 14px;
                    color: #7d8590;
                    margin: 6px 0 0 32px;
                }

                .contact-line, .links-line {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    margin: 8px 0 0 32px;
                }

                .contact, .link {
                    font-size: 11px;
                    color: #8b949e;
                }

                .link {
                    color: #58a6ff;
                }

                .tech-stack-bar {
                    display: flex;
                    gap: 8px;
                    padding: 12px 24px;
                    background: #21262d;
                    border-bottom: 1px solid #30363d;
                    overflow-x: auto;
                }

                .tech-badge {
                    font-size: 10px;
                    padding: 4px 10px;
                    background: #238636;
                    color: white;
                    border-radius: 20px;
                    white-space: nowrap;
                }

                .tech-badge.more {
                    background: #30363d;
                    color: #7d8590;
                }

                .cv-main {
                    padding: 0;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 280px;
                }

                .main-column {
                    padding: 24px;
                    border-right: 1px solid #30363d;
                }

                .side-column {
                    padding: 24px;
                    background: #161b22;
                }

                .section {
                    margin-bottom: 24px;
                }

                .section h2 {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: #7d8590;
                    margin: 0 0 14px 0;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .hash {
                    color: #3fb950;
                }

                .summary {
                    font-size: 12px;
                    line-height: 1.7;
                    color: #8b949e;
                    margin: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .experience-card {
                    background: #161b22;
                    border: 1px solid #30363d;
                    border-radius: 6px;
                    padding: 16px;
                    margin-bottom: 14px;
                }

                .exp-header {
                    margin-bottom: 10px;
                }

                .exp-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .experience-card h3 {
                    font-size: 14px;
                    font-weight: 600;
                    color: #e6edf3;
                    margin: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .date {
                    font-size: 10px;
                    color: #7d8590;
                    background: #21262d;
                    padding: 2px 8px;
                    border-radius: 3px;
                }

                .company {
                    font-size: 12px;
                    color: #58a6ff;
                    margin: 4px 0 0 0;
                }

                .at {
                    color: #f0883e;
                    margin-right: 2px;
                }

                .location {
                    color: #7d8590;
                }

                .desc {
                    font-size: 11px;
                    color: #8b949e;
                    margin: 0 0 10px 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .bullets {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                .bullets li {
                    font-size: 11px;
                    color: #8b949e;
                    margin-bottom: 4px;
                    display: flex;
                    align-items: flex-start;
                    gap: 6px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .bullet-icon {
                    color: #3fb950;
                    flex-shrink: 0;
                }

                .exp-tech {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                    margin-top: 10px;
                }

                .exp-tech-tag {
                    font-size: 9px;
                    padding: 2px 6px;
                    background: #30363d;
                    color: #8b949e;
                    border-radius: 3px;
                }

                .projects-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .project-card {
                    background: #161b22;
                    border: 1px solid #30363d;
                    border-radius: 6px;
                    padding: 14px;
                }

                .project-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 6px;
                }

                .project-card h4 {
                    font-size: 13px;
                    font-weight: 600;
                    margin: 0;
                    color: #58a6ff;
                }

                .project-link {
                    color: #3fb950;
                    text-decoration: none;
                    font-size: 16px;
                }

                .project-card p {
                    font-size: 11px;
                    color: #8b949e;
                    margin: 0 0 8px 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .project-tech {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                }

                .project-tech span {
                    font-size: 9px;
                    padding: 2px 6px;
                    background: #21262d;
                    color: #7d8590;
                    border-radius: 3px;
                }

                .edu-entry {
                    margin-bottom: 14px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #30363d;
                }

                .edu-entry:last-child {
                    border-bottom: none;
                }

                .edu-entry h4 {
                    font-size: 12px;
                    font-weight: 600;
                    margin: 0;
                    color: #e6edf3;
                }

                .field {
                    font-size: 11px;
                    color: #58a6ff;
                    margin: 2px 0;
                }

                .school {
                    font-size: 11px;
                    color: #8b949e;
                    margin: 2px 0;
                }

                .year {
                    font-size: 10px;
                    color: #7d8590;
                }

                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .skill-item {
                    font-size: 10px;
                    padding: 3px 8px;
                    background: #21262d;
                    color: #58a6ff;
                    border: 1px solid #30363d;
                    border-radius: 3px;
                }

                .certs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .cert {
                    font-size: 11px;
                    color: #8b949e;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .cert-icon {
                    color: #3fb950;
                }

                .languages-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .lang-item {
                    font-size: 10px;
                    padding: 2px 8px;
                    background: #21262d;
                    color: #8b949e;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
