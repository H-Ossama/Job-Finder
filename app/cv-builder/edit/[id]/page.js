import { getCV } from '../../actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './edit.module.css'

export default async function EditCV({ params }) {
    const { id } = await params

    try {
        const cv = await getCV(id)

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Edit CV: {cv.title}</h1>
                    <Link href="/dashboard" className={styles.backLink}>
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className={styles.content}>
                    <div className={styles.comingSoon}>
                        <h2>Full CV Editor Coming Soon!</h2>
                        <p>Your CV has been saved successfully. The comprehensive editor with all sections is being built.</p>
                        <div className={styles.cvData}>
                            <h3>Current CV Data:</h3>
                            <pre>{JSON.stringify(cv.content, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        redirect('/dashboard')
    }
}
