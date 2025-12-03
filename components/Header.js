'use client'

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo}>JobFinder AI</Link>

            <button
                className={styles.mobileMenuBtn}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
                <Link href="/" className={styles.navLink} onClick={() => setIsOpen(false)}>Home</Link>
                <Link href="#features" className={styles.navLink} onClick={() => setIsOpen(false)}>Features</Link>
                <Link href="#contact" className={styles.navLink} onClick={() => setIsOpen(false)}>Contact</Link>
                <div className={styles.authButtons}>
                    <Link href="/login" className={styles.loginBtn} onClick={() => setIsOpen(false)}>
                        Get Started
                    </Link>
                </div>
            </nav>
        </header>
    );
}
