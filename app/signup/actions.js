'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData) {
    const supabase = await createClient()

    const email = formData.get('email')
    const password = formData.get('password')
    const fullName = formData.get('fullName')

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (error) {
        redirect('/signup?error=' + error.message)
    }

    // If signup is successful and we have a user, try to create a profile
    // Note: If email confirmation is enabled, this might need to happen after confirmation
    // or via a trigger. For now, we'll try to insert if we have a user ID.
    if (data?.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: data.user.id,
                full_name: fullName,
                username: email.split('@')[0], // Default username from email
                updated_at: new Date().toISOString(),
            })

        if (profileError) {
            console.error('Error creating profile:', profileError)
            // Continue anyway, as the auth user was created
        }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
