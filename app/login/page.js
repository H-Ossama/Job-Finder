import { redirect } from 'next/navigation'

// Old login page - redirect to homepage where the new auth modal is used
export default function LoginPage() {
    redirect('/')
}
