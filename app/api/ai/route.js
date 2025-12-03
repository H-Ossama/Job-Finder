import { NextResponse } from 'next/server'
import { generateCVContent, improveCVContent, generateProfessionalSummary } from '@/utils/ai/client'

export async function POST(request) {
    try {
        const body = await request.json()
        const { action, ...params } = body

        let result

        switch (action) {
            case 'generate':
                result = await generateCVContent(params)
                break
            case 'improve':
                result = await improveCVContent(params)
                break
            case 'summary':
                result = await generateProfessionalSummary(params)
                break
            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }

        return NextResponse.json({
            success: true,
            content: result
        })

    } catch (error) {
        console.error('AI generation error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate content' },
            { status: 500 }
        )
    }
}
