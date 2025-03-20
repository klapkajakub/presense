import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { connectToDatabase } from '@/lib/mongodb'
import { User } from '@/models/User'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function POST(request: Request) {
  try {
    const { email, password, action } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    if (action === 'signup') {
      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        )
      }

      // Create new user
      const user = await User.create({
        email,
        password,
      })

      // Generate JWT token
      const token = await new SignJWT({ userId: user._id })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret)

      return NextResponse.json({ token })
    }

    if (action === 'signin') {
      // Find user
      const user = await User.findOne({ email })
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Generate JWT token
      const token = await new SignJWT({ userId: user._id })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret)

      return NextResponse.json({ token })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 