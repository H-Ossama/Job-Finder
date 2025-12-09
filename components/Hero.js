import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.content}>
                <h1 className={styles.title}>
                    Secure Your Dream Job <br />
                    <span className={styles.gradientText}>Powered by AI</span>
                </h1>
                <p className={styles.subtitle}>
                    Create ATS-optimized CVs, find matching jobs, and streamline your applications with our intelligent career assistant.
                </p>
                <div className={styles.ctaGroup}>
                    <button className={styles.primaryBtn}>Create CV Now</button>
                    <button className={styles.secondaryBtn}>Learn More</button>
                </div>
            </div>
        </section>
    );
}
