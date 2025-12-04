'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { calculateCompleteness } from '@/utils/cv/templates'

/**
 * Save a new CV to the database
 */
export async function saveCV(cvData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Calculate completeness score
    const completeness = calculateCompleteness(cvData.content || {})

    // Build insert data - only use columns that exist in the database
    // Note: template and ats_score columns may not exist - we'll try to update them separately
    const insertData = {
        user_id: user.id,
        title: cvData.title,
        content: cvData.content,
        is_primary: cvData.is_primary || false
    }

    const { data, error } = await supabase
        .from('cvs')
        .insert(insertData)
        .select()
        .single()

    if (error) {
        console.error('Error saving CV:', error)
        throw new Error('Failed to save CV')
    }

    // Try to update optional columns separately (will silently fail if columns don't exist)
    try {
        const optionalUpdates = {}
        if (cvData.template) optionalUpdates.template = cvData.template
        if (cvData.ats_score !== undefined) optionalUpdates.ats_score = cvData.ats_score
        else optionalUpdates.ats_score = completeness.score
        
        if (Object.keys(optionalUpdates).length > 0) {
            await supabase
                .from('cvs')
                .update(optionalUpdates)
                .eq('id', data.id)
        }
    } catch (e) {
        // Optional columns might not exist yet - that's okay
        console.log('Optional columns not available:', e.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/resumes')
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

    // Build update data - only use columns that definitely exist
    const updateData = {
        title: cvData.title,
        content: cvData.content,
        is_primary: cvData.is_primary,
        updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
        .from('cvs')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating CV:', error)
        throw new Error('Failed to update CV')
    }

    // Try to update optional columns separately if provided
    try {
        const optionalUpdates = {}
        if (cvData.template) optionalUpdates.template = cvData.template
        if (cvData.ats_score !== undefined) {
            const completeness = calculateCompleteness(cvData.content || {})
            optionalUpdates.ats_score = cvData.ats_score || completeness.score
        }
        
        if (Object.keys(optionalUpdates).length > 0) {
            await supabase
                .from('cvs')
                .update(optionalUpdates)
                .eq('id', id)
        }
    } catch (e) {
        // Optional columns might not exist yet
        console.log('Optional columns not available:', e.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/resumes')
    revalidatePath(`/cv-builder/result/${id}`)
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
    revalidatePath('/resumes')
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
 * Set a CV as primary (main CV)
 */
export async function setPrimaryCV(id) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // First, unset all other CVs as primary
    await supabase
        .from('cvs')
        .update({ is_primary: false })
        .eq('user_id', user.id)

    // Set the selected CV as primary
    const { data, error } = await supabase
        .from('cvs')
        .update({ is_primary: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error setting primary CV:', error)
        throw new Error('Failed to set primary CV')
    }

    revalidatePath('/dashboard')
    revalidatePath('/resumes')
    return data
}

/**
 * Duplicate a CV
 */
export async function duplicateCV(id) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Get the original CV
    const { data: original, error: fetchError } = await supabase
        .from('cvs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !original) {
        throw new Error('CV not found')
    }

    // Create a copy without optional columns initially
    const insertData = {
        user_id: user.id,
        title: `${original.title} (Copy)`,
        content: original.content,
        is_primary: false
    }

    const { data, error } = await supabase
        .from('cvs')
        .insert(insertData)
        .select()
        .single()

    if (error) {
        console.error('Error duplicating CV:', error)
        throw new Error('Failed to duplicate CV')
    }

    // Try to copy optional columns if they exist
    try {
        const optionalUpdates = {}
        if (original.template) optionalUpdates.template = original.template
        if (original.ats_score) optionalUpdates.ats_score = original.ats_score
        
        if (Object.keys(optionalUpdates).length > 0) {
            await supabase
                .from('cvs')
                .update(optionalUpdates)
                .eq('id', data.id)
        }
    } catch (e) {
        // Optional columns might not exist yet - that's okay
        console.log('Optional columns not available for duplicate')
    }

    revalidatePath('/dashboard')
    revalidatePath('/resumes')
    return data
}

/**
 * Update CV ATS score
 */
export async function updateATSScore(id, score, analysis) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
        .from('cvs')
        .update({
            ats_score: score,
            ats_analysis: analysis,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating ATS score:', error)
        throw new Error('Failed to update ATS score')
    }

    revalidatePath(`/cv-builder/result/${id}`)
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
