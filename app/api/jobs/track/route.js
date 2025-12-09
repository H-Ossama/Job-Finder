import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// POST - Quick apply or save job for later
export async function POST(request) {
    console.log('📥 [TRACK API] POST request received');
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.log('❌ [TRACK API] Unauthorized - no user');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('✅ [TRACK API] User authenticated:', user.id);

        const body = await request.json();
        const { jobId, jobData, action } = body; // action: 'apply' or 'save'
        console.log('📋 [TRACK API] Request body:', { jobId, action, company: jobData?.company });

        if (!jobId || !action) {
            return NextResponse.json({ 
                error: 'jobId and action are required' 
            }, { status: 400 });
        }

        // Validate action
        if (!['apply', 'save'].includes(action)) {
            return NextResponse.json({ 
                error: 'action must be "apply" or "save"' 
            }, { status: 400 });
        }

        // Create application in job_applications table
        const applicationData = {
            user_id: user.id,
            external_job_id: jobId,
            job_title: jobData?.title || 'Unknown Position',
            company_name: jobData?.company || 'Unknown Company',
            location: jobData?.location || null,
            salary: jobData?.salary || null,
            job_url: jobData?.apply_url || null,
            source: jobData?.source || 'Job Search',
            status: action === 'apply' ? 'applied' : 'saved',
            applied_at: action === 'apply' ? new Date().toISOString() : null,
            notes: `Found via ${jobData?.source || 'job search'}${jobData?.postedAt ? ' on ' + new Date(jobData.postedAt).toLocaleDateString() : ''}`
        };

        // Check if already exists to prevent duplicates
        console.log('🔍 [TRACK API] Checking for existing application...');
        const { data: existingApp, error: checkError } = await supabase
            .from('job_applications')
            .select('id')
            .eq('user_id', user.id)
            .eq('external_job_id', jobId)
            .maybeSingle();

        if (checkError) {
            console.error('❌ [TRACK API] Error checking existing:', checkError);
        }

        if (existingApp) {
            console.log('ℹ️ [TRACK API] Job already tracked:', existingApp.id);
            return NextResponse.json({
                success: true,
                message: 'Job already tracked',
                application: existingApp
            });
        }

        console.log('💾 [TRACK API] Inserting new application...');
        const { data: newApplication, error: appError } = await supabase
            .from('job_applications')
            .insert(applicationData)
            .select()
            .single();

        if (appError) {
            console.error('❌ [TRACK API] Error creating application:', appError);
            return NextResponse.json({ error: appError.message }, { status: 500 });
        }
        console.log('✅ [TRACK API] Application created:', newApplication.id);

        // Create notification ONLY for 'apply' action
        if (action === 'apply') {
            await supabase.from('notifications').insert({
                user_id: user.id,
                type: 'application',
                title: `Applied to ${jobData?.company || 'company'}`,
                description: jobData?.title || 'New job',
                action_url: '/applications',
                action_text: 'View Applications'
            });
        }

        // Log activity
        await supabase.from('activity_log').insert({
            user_id: user.id,
            activity_type: action === 'apply' ? 'application_sent' : 'job_saved',
            title: action === 'apply'
                ? `Applied to ${jobData?.company || 'company'}`
                : `Saved job at ${jobData?.company || 'company'}`,
            description: jobData?.title || 'New job',
            metadata: { 
                application_id: newApplication.id,
                company: jobData?.company,
                source: jobData?.source
            }
        });

        console.log('🎉 [TRACK API] Success! Returning response');
        return NextResponse.json({
            success: true,
            application: newApplication,
            message: action === 'apply' 
                ? 'Application tracked successfully!' 
                : 'Job saved successfully!'
        }, { status: 201 });
    } catch (error) {
        console.error('❌ [TRACK API] Unhandled error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove tracked job (unsave)
export async function DELETE(request) {
    console.log('📤 [TRACK API] DELETE request received');
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.log('❌ [TRACK API] DELETE - Unauthorized');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId'); // external_job_id
        console.log('🗑️ [TRACK API] Deleting job:', jobId);

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('job_applications')
            .delete()
            .eq('user_id', user.id)
            .eq('external_job_id', jobId);

        if (error) {
            console.error('❌ [TRACK API] Error deleting application:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('✅ [TRACK API] Job removed successfully');
        return NextResponse.json({ success: true, message: 'Job removed from applications' });
    } catch (error) {
        console.error('Job delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET - Check if job is already tracked
export async function GET(request) {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId'); // external_job_id
        const jobTitle = searchParams.get('title');
        const company = searchParams.get('company');

        let query = supabase
            .from('job_applications')
            .select('id, status, external_job_id')
            .eq('user_id', user.id);

        if (jobId) {
            query = query.eq('external_job_id', jobId);
        } else if (jobTitle && company) {
            query = query.eq('job_title', jobTitle).eq('company_name', company);
        } else {
            return NextResponse.json({ 
                error: 'jobId OR (title and company) are required' 
            }, { status: 400 });
        }

        const { data: existingApp, error } = await query.maybeSingle();

        if (error) {
            console.error('Error checking application:', error);
        }

        return NextResponse.json({
            tracked: !!existingApp,
            application: existingApp || null
        });
    } catch (error) {
        console.error('Check job action error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
