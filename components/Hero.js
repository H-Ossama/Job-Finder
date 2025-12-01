import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <h1 className={styles.title}>
                Secure Your Dream Job <br />
                <span className={styles.gradientText}>Powered by AI</span>
            </h1>
            <p className={styles.subtitle}>
                Create ATS-optimized CVs, automate job applications, and get hired faster with our intelligent career assistant.
            </p>
            <div className={styles.ctaGroup}>
                <button className={styles.primaryBtn}>Create CV Now</button>
                <button className={styles.secondaryBtn}>Learn More</button>
            </div>
        </section>
    );
}
