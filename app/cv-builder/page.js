import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Upload, PlusCircle } from 'lucide-react'
import styles from './cv-builder.module.css'

export default async function CVBuilder() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>CV Builder</h1>
                <p className={styles.subtitle}>Create your professional, ATS-compliant resume with AI assistance</p>
            </div>

            <div className={styles.optionsGrid}>
                <Link href="/cv-builder/create" className={styles.optionCard}>
                    <div className={styles.iconWrapper}>
                        <PlusCircle size={48} />
                    </div>
                    <h2 className={styles.optionTitle}>Create from Scratch</h2>
                    <p className={styles.optionDescription}>
                        Build your CV step-by-step with AI-powered suggestions and professional templates
                    </p>
                    <div className={styles.badge}>AI Assisted</div>
                </Link>

                <Link href="/cv-builder/upload" className={styles.optionCard}>
                    <div className={styles.iconWrapper}>
                        <Upload size={48} />
                    </div>
                    <h2 className={styles.optionTitle}>Upload Existing CV</h2>
                    <p className={styles.optionDescription}>
                        Upload your current CV (PDF/DOCX) and let AI enhance it for better results
                    </p>
                    <div className={styles.badge}>Smart Parse</div>
                </Link>

                <Link href="/cv-builder/manual" className={styles.optionCard}>
                    <div className={styles.iconWrapper}>
                        <FileText size={48} />
                    </div>
                    <h2 className={styles.optionTitle}>Manual Entry</h2>
                    <p className={styles.optionDescription}>
                        Fill in your information manually with complete control over every detail
                    </p>
                    <div className={styles.badge}>Full Control</div>
                </Link>
            </div>

            <div className={styles.footer}>
                <Link href="/dashboard" className={styles.backLink}>
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    )
}
