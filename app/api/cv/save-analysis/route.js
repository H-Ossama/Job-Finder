'use server';

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const supabase = await createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not authenticated' },
                { status: 401 }
            );
        }

        const { cvId, atsScore, analysis } = await request.json();

        if (!cvId || atsScore === undefined || !analysis) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Update the CV with the analysis data
        const { data, error } = await supabase
            .from('cvs')
            .update({
                ats_score: atsScore,
                ats_analysis: analysis
            })
            .eq('id', cvId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error saving analysis:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to save analysis' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error in save-analysis API:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
