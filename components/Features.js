import { FileText, Search, Send, Cpu } from 'lucide-react';
import styles from './Features.module.css';

const features = [
    {
        icon: <FileText size={24} />,
        title: 'AI CV Builder',
        desc: 'Create ATS-optimized resumes from scratch or improve existing ones with advanced AI analysis.',
    },
    {
        icon: <Search size={24} />,
        title: 'Smart Job Search',
        desc: 'Automatically find jobs that match your profile and preferences across multiple platforms.',
    },
    {
        icon: <Send size={24} />,
        title: 'Auto-Apply System',
        desc: 'Let our agent submit applications for you with personalized cover letters and daily summaries.',
    },
    {
        icon: <Cpu size={24} />,
        title: 'Multi-Model AI',
        desc: 'Choose your preferred AI model (OpenAI, Gemini, etc.) for the best results and customization.',
    },
];

export default function Features() {
    return (
        <section id="features" className={styles.features}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Why Choose JobFinder AI?</h2>
                    <p className={styles.description}>
                        Powerful features designed to accelerate your job search
                    </p>
                </div>
                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.iconWrapper}>{feature.icon}</div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDesc}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
