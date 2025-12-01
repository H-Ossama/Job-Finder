import { Mail, Linkedin, Github, Globe } from 'lucide-react';
import styles from './Contact.module.css';

export default function Contact() {
    return (
        <section id="contact" className={styles.contact}>
            <h2 className={styles.title}>Get in Touch</h2>
            <p className={styles.text}>
                This is an open source project. Feel free to reach out for collaboration or inquiries.
            </p>
            <div className={styles.links}>
                <a href="mailto:ossamahattan@gmail.com" className={styles.link}>
                    <Mail size={20} />
                    Email Me
                </a>
                <a href="https://www.linkedin.com/in/h-oussama" target="_blank" rel="noopener noreferrer" className={styles.link}>
                    <Linkedin size={20} />
                    LinkedIn
                </a>
                <a href="https://github.com/H-Ossama" target="_blank" rel="noopener noreferrer" className={styles.link}>
                    <Github size={20} />
                    GitHub
                </a>
                <a href="https://portfolio-v2-eight-lovat.vercel.app/en" target="_blank" rel="noopener noreferrer" className={styles.link}>
                    <Globe size={20} />
                    Portfolio
                </a>
            </div>
        </section>
    );
}
