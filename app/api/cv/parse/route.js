import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { parseCV } from '@/utils/ai/client';

/**
 * CV Parse API - Upload and parse existing CV
 * Extracts structured data and identifies missing fields
 */
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        // Parse based on file type
        if (file.type === 'application/pdf') {
            // PDF parsing - using a simpler approach for now
            // Note: pdf-parse has issues in Edge runtime, so we'll use fallback
            try {
                const pdfParse = require('pdf-parse/lib/pdf-parse.js');
                const data = await pdfParse(buffer);
                text = data.text;
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                return NextResponse.json(
                    { error: 'PDF parsing is currently unavailable. Please use Word document (.docx)' },
                    { status: 400 }
                );
            }
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.name.endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (file.type === 'application/msword' || file.name.endsWith('.doc')) {
            return NextResponse.json(
                { error: 'Legacy .doc format is not supported. Please save as .docx or PDF' },
                { status: 400 }
            );
        } else {
            return NextResponse.json(
                { error: 'Unsupported file type. Please upload PDF or DOCX' },
                { status: 400 }
            );
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'Could not extract text from file. The document may be empty or image-based.' },
                { status: 400 }
            );
        }

        // Use AI to parse the extracted text into structured data
        const parsedData = await parseCV(text);

        // Analyze what fields are present and what's missing
        const missingFields = analyzeMissingFields(parsedData);
        
        // Determine which step user should start from
        const startStep = determineStartStep(missingFields);

        return NextResponse.json({
            success: true,
            data: parsedData,
            missingFields,
            startStep,
            rawText: text.substring(0, 500) // Include first 500 chars for debugging
        });

    } catch (error) {
        console.error('File parsing error:', error);
        return NextResponse.json(
            { error: 'Failed to parse file: ' + error.message },
            { status: 500 }
        );
    }
}

/**
 * Analyze which fields are missing from parsed CV data
 */
function analyzeMissingFields(data) {
    const missing = [];

    // Check personal info
    if (!data.personalInfo?.firstName || !data.personalInfo?.lastName) {
        missing.push({ field: 'name', step: 2, message: 'Your name is missing' });
    }
    if (!data.personalInfo?.email) {
        missing.push({ field: 'email', step: 2, message: 'Email address is missing' });
    }
    if (!data.personalInfo?.phone) {
        missing.push({ field: 'phone', step: 2, message: 'Phone number is missing' });
    }

    // Check experience
    if (!data.experience || data.experience.length === 0) {
        missing.push({ field: 'experience', step: 3, message: 'Work experience is missing' });
    } else {
        const incompleteExp = data.experience.some(exp => !exp.title || !exp.company);
        if (incompleteExp) {
            missing.push({ field: 'experience', step: 3, message: 'Some experience details are incomplete' });
        }
    }

    // Check education
    if (!data.education || data.education.length === 0) {
        missing.push({ field: 'education', step: 4, message: 'Education is missing' });
    } else {
        const incompleteEdu = data.education.some(edu => !edu.degree || !edu.school);
        if (incompleteEdu) {
            missing.push({ field: 'education', step: 4, message: 'Some education details are incomplete' });
        }
    }

    // Check skills
    if (!data.skills?.technical || data.skills.technical.length === 0) {
        missing.push({ field: 'skills', step: 5, message: 'Technical skills are missing' });
    }

    // Check summary
    if (!data.summary || data.summary.length < 50) {
        missing.push({ field: 'summary', step: 2, message: 'Professional summary is too short or missing' });
    }

    return missing;
}

/**
 * Determine which step user should start from based on missing fields
 */
function determineStartStep(missingFields) {
    if (missingFields.length === 0) {
        return 6; // Go directly to settings
    }

    // Find the earliest step with missing data
    const steps = missingFields.map(f => f.step);
    return Math.min(...steps);
}
