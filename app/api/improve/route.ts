import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import { getIronSession } from 'iron-session'
import { sessionOptions } from '@/lib/session'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const session = await getIronSession(cookieStore, sessionOptions)

    if (!session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { currentText, maxLength, platform } = await request.json()

    if (!currentText?.trim()) {
      return NextResponse.json(
        { error: 'Missing required text content' },
        { status: 400 }
      )
    }

    await connectDB()

    // Example improvement logic
    const improvedText = currentText.slice(0, Math.min(currentText.length, maxLength || 2000))

    return NextResponse.json({
      improvedText: improvedText + ' (enhanced)'
    })

  } catch (error) {
    console.error('Improvement error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Improvement failed' },
      { status: 500 }
    )
  }
}