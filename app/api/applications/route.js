import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch user's applications
export async function GET(request) {
    console.log('📋 [APPLICATIONS API] GET request received');
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.log('❌ [APPLICATIONS API] Unauthorized');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('✅ [APPLICATIONS API] User:', user.id);

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = searchParams.get('limit') || 50;
        console.log('🔍 [APPLICATIONS API] Filters:', { status, limit });

        // Build query for job_applications table
        // Start with simplest query, no joins that might fail
        let query = supabase
            .from('job_applications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data: applications, error } = await query;

        if (error) {
            console.error('❌ [APPLICATIONS API] Error fetching:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        console.log('✅ [APPLICATIONS API] Found', applications?.length || 0, 'applications');

        // Transform data to match frontend expectations
        const transformedApplications = applications.map(app => ({
            id: app.id,
            company: app.job?.company || app.company_name || 'Unknown Company',
            logo: app.job?.company_logo || `https://logo.clearbit.com/${(app.job?.company || app.company_name || 'company').toLowerCase().replace(/\s/g, '')}.com`,
            title: app.job?.title || app.job_title || 'Unknown Position',
            location: app.job?.location || app.location || 'Remote',
            salary: app.job?.salary_min && app.job?.salary_max 
                ? `${app.job.salary_currency || '$'}${app.job.salary_min.toLocaleString()} - ${app.job.salary_currency || '$'}${app.job.salary_max.toLocaleString()}`
                : app.salary || 'Not specified',
            status: app.status,
            appliedDate: app.applied_at,
            lastUpdate: getRelativeTime(app.updated_at),
            resumeUsed: app.cv?.title || null,
            coverLetter: !!app.cover_letter || !!app.ai_cover_letter,
            source: app.source || 'Manual',
            notes: app.notes,
            nextStep: app.interview_date ? `Interview - ${new Date(app.interview_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : null,
            interviewType: app.interview_type,
            interviewNotes: app.interview_notes,
            offerDetails: app.offer_details,
            rejectionReason: app.rejection_reason,
            jobUrl: app.job?.apply_url || app.job_url,
            jobId: app.job_id,
            externalJobId: app.external_job_id,
            // Additional raw data
            raw: {
                cover_letter: app.cover_letter,
                ai_cover_letter: app.ai_cover_letter,
                created_at: app.created_at,
                updated_at: app.updated_at
            }
        }));

        console.log('📤 [APPLICATIONS API] Returning', transformedApplications.length, 'applications');
        return NextResponse.json({ 
            applications: transformedApplications,
            total: transformedApplications.length 
        });
    } catch (error) {
        console.error('❌ [APPLICATIONS API] Unhandled error:', error);
        console.error('Applications API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new application
export async function POST(request) {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { 
            job_id, 
            job_title,
            company_name,
            location,
            salary,
            job_url,
            cv_id, 
            status = 'applied', 
            cover_letter, 
            notes,
            source = 'Manual'
        } = body;

        // Validate required fields
        if (!job_title || !company_name) {
            return NextResponse.json({ 
                error: 'Job title and company name are required' 
            }, { status: 400 });
        }

        const applicationData = {
            user_id: user.id,
            job_id: job_id || null,
            job_title,
            company_name,
            location,
            salary,
            job_url,
            cv_id: cv_id || null,
            status,
            cover_letter,
            notes,
            source,
            applied_at: status === 'saved' ? null : new Date().toISOString()
        };

        const { data: newApplication, error } = await supabase
            .from('job_applications')
            .insert(applicationData)
            .select()
            .single();

        if (error) {
            console.error('Error creating application:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Log activity
        await supabase.from('activity_log').insert({
            user_id: user.id,
            activity_type: status === 'saved' ? 'job_saved' : 'application_sent',
            title: status === 'saved' ? `Saved job at ${company_name}` : `Applied to ${company_name}`,
            description: job_title,
            metadata: { application_id: newApplication.id, company: company_name }
        });

        // Create notification
        await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'application',
            title: status === 'saved' ? 'Job Saved' : 'Application Submitted',
            description: `${job_title} at ${company_name}`,
            action_url: '/applications',
            action_text: 'View Applications'
        });

        return NextResponse.json({ 
            application: newApplication,
            message: 'Application created successfully' 
        }, { status: 201 });
    } catch (error) {
        console.error('Applications POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Update application
export async function PATCH(request) {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
        }

        // Filter allowed update fields
        const allowedFields = [
            'status', 'notes', 'cover_letter', 'ai_cover_letter',
            'interview_date', 'interview_type', 'interview_notes',
            'offer_details', 'rejection_reason', 'cv_id'
        ];

        const filteredUpdates = {};
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        }

        // If status is changing to applied, set applied_at
        if (filteredUpdates.status === 'applied') {
            filteredUpdates.applied_at = new Date().toISOString();
        }

        const { data: updatedApplication, error } = await supabase
            .from('job_applications')
            .update(filteredUpdates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating application:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Log status change activity
        if (filteredUpdates.status) {
            await supabase.from('activity_log').insert({
                user_id: user.id,
                activity_type: 'application_status_changed',
                title: `Application status updated to ${filteredUpdates.status}`,
                description: updatedApplication.job_title,
                metadata: { application_id: id, new_status: filteredUpdates.status }
            });
        }

        return NextResponse.json({ 
            application: updatedApplication,
            message: 'Application updated successfully' 
        });
    } catch (error) {
        console.error('Applications PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete application
export async function DELETE(request) {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('job_applications')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting application:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Applications DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper function to get relative time
function getRelativeTime(dateString) {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks === 1) return '1 week ago';
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
