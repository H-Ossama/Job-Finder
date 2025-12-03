import { signup } from './actions'
import Link from 'next/link'
import styles from '../login/login.module.css' // Reuse login styles

export default async function SignupPage({ searchParams }) {
    const params = await searchParams
    return (
        <div className={styles.container}>
            <form className={styles.form}>
                <h1 className={styles.title}>Create Account</h1>

                <div className={styles.inputGroup}>
                    <label htmlFor="fullName">Full Name</label>
                    <input id="fullName" name="fullName" type="text" required placeholder="John Doe" />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" required placeholder="you@example.com" />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" required placeholder="••••••••" minLength={6} />
                </div>

                <div className={styles.actions}>
                    <button formAction={signup} className={styles.primaryBtn}>Sign up</button>
                </div>

                <div className={styles.divider}>
                    <span>Already have an account?</span>
                </div>

                <div className={styles.actions}>
                    <Link href="/login" className={styles.secondaryBtn} style={{ textAlign: 'center' }}>
                        Log in
                    </Link>
                </div>

                {params?.error && (
                    <p className={styles.error}>{params.error}</p>
                )}
            </form>
        </div>
    )
}
