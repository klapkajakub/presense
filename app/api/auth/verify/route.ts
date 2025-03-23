import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { connectDB } from '@/lib/database'
import { User } from '@/models/User'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ valid: false, user: null })
    }
    
    // Verify the JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development')
    
    try {
      const { payload } = await jwtVerify(token, secret)
      const userId = payload.sub
      
      // Get user data
      await connectDB()
      const user = await User.findById(userId)
      
      if (!user) {
        return NextResponse.json({ valid: false, user: null })
      }
      
      return NextResponse.json({
        valid: true,
        user: {
          id: user._id,
          email: user.email
        }
      })
    } catch (verifyError) {
      console.error('Token verification error:', verifyError)
      return NextResponse.json({ valid: false, user: null })
    }
  } catch (error) {
    console.error('Error verifying token:', error)
    return NextResponse.json({ valid: false, user: null })
  }
}