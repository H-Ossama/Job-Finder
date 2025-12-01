import { login, signup } from './actions'
import styles from './login.module.css'

export default function LoginPage({ searchParams }) {
    return (
        <div className={styles.container}>
            <form className={styles.form}>
                <h1 className={styles.title}>Welcome Back</h1>
                <div className={styles.inputGroup}>
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" required />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" required />
                </div>
                <div className={styles.actions}>
                    <button formAction={login} className={styles.primaryBtn}>Log in</button>
                    <button formAction={signup} className={styles.secondaryBtn}>Sign up</button>
                </div>
                {searchParams?.error && (
                    <p className={styles.error}>{searchParams.error}</p>
                )}
            </form>
        </div>
    )
}
