import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/database'
import { User } from '@/models/User'

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get('session')?.value

    if (!sessionId) {
      return NextResponse.json({ user: null })
    }

    await connectDB()
    const user = await User.findById(sessionId)

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json({ user: null })
  }
}