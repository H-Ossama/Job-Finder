'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Save a new CV to the database
 */
export async function saveCV(cvData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
        .from('cvs')
        .insert({
            user_id: user.id,
            title: cvData.title,
            content: cvData.content,
            is_primary: cvData.is_primary || false
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving CV:', error)
        throw new Error('Failed to save CV')
    }

    revalidatePath('/dashboard')
    return data
}

/**
 * Update an existing CV
 */
export async function updateCV(id, cvData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
        .from('cvs')
        .update({
            title: cvData.title,
            content: cvData.content,
            is_primary: cvData.is_primary
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating CV:', error)
        throw new Error('Failed to update CV')
    }

    revalidatePath('/dashboard')
    revalidatePath(`/cv-builder/edit/${id}`)
    return data
}

/**
 * Delete a CV
 */
export async function deleteCV(id) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('cvs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting CV:', error)
        throw new Error('Failed to delete CV')
    }

    revalidatePath('/dashboard')
}

/**
 * Get all CVs for the current user
 */
export async function getUserCVs() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching CVs:', error)
        return []
    }

    return data || []
}

/**
 * Get a single CV by ID
 */
export async function getCV(id) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('Error fetching CV:', error)
        throw new Error('CV not found')
    }

    return data
}

/**
 * Upload CV file to Supabase Storage
 */
export async function uploadCVFile(formData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const file = formData.get('file')

    if (!file) {
        throw new Error('No file provided')
    }

    // Create unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
        .from('cv-uploads')
        .upload(fileName, file)

    if (error) {
        console.error('Error uploading file:', error)
        throw new Error('Failed to upload file')
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('cv-uploads')
        .getPublicUrl(fileName)

    return { path: data.path, url: publicUrl }
}
