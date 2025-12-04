import { NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { parseCV } from '@/utils/ai/openrouter'

// PDF parsing is temporarily disabled due to build issues with pdf-parse in Next.js
// const pdf = require('pdf-parse');

export async function POST(request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file')

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        let text = ''

        // Parse based on file type
        if (file.type === 'application/pdf') {
            // PDF parsing - use the lib directly to avoid test runner issues
            try {
                const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
                const data = await pdfParse(buffer);
                text = data.text;
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                return NextResponse.json(
                    { error: 'PDF parsing failed. Please ensure the PDF contains selectable text (not just images).' },
                    { status: 400 }
                );
            }
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.name.endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer })
            text = result.value
        } else {
            return NextResponse.json(
                { error: 'Unsupported file type. Please upload PDF or DOCX' },
                { status: 400 }
            )
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'Could not extract text from file' },
                { status: 400 }
            )
        }

        // Use AI to parse the extracted text into structured data
        const parsedData = await parseCV(text)

        return NextResponse.json({
            success: true,
            data: parsedData,
            rawText: text
        })

    } catch (error) {
        console.error('File parsing error:', error)
        return NextResponse.json(
            { error: 'Failed to parse file: ' + error.message },
            { status: 500 }
        )
    }
}
