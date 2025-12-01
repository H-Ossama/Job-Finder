import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.logo}>JobFinder AI</div>
            <nav className={styles.nav}>
                <Link href="/" className={styles.navLink}>Home</Link>
                <Link href="#features" className={styles.navLink}>Features</Link>
                <Link href="#contact" className={styles.navLink}>Contact</Link>
            </nav>
            <div className={styles.authButtons}>
                <Link href="/login" className={styles.loginBtn}>Login</Link>
            </div>
        </header>
    );
}
