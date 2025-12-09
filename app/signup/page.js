import { redirect } from 'next/navigation'

// Old signup page - redirect to homepage where the new auth modal is used
export default function SignupPage() {
    redirect('/')
}
