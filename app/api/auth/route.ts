import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import { User } from '@/models/User'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    console.log('Starting auth request...')
    const { email, password, action } = await request.json()
    console.log('Action:', action)

    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Connecting to database...')
    try {
      await connectDB()
      console.log('Database connected successfully')
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    if (action === 'signin') {
      console.log('Processing signin...')
      // Find user
      let user
      try {
        user = await User.findOne({ email: email.toLowerCase() })
        console.log('User found:', !!user)
      } catch (findError) {
        console.error('Error finding user:', findError)
        return NextResponse.json(
          { error: 'Database query failed' },
          { status: 500 }
        )
      }

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Verify password
      try {
        console.log('Comparing password...')
        const isValidPassword = await user.comparePassword(password)
        console.log('Password valid:', isValidPassword)
        
        if (!isValidPassword) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          )
        }
      } catch (error) {
        console.error('Password comparison error:', error)
        return NextResponse.json(
          { error: 'Password verification failed' },
          { status: 500 }
        )
      }

      // Set session cookie
      const cookieStore = cookies()
      cookieStore.set('session', user._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
      })

      return NextResponse.json({ 
        success: true,
        user: {
          id: user._id,
          email: user.email
        }
      })
    }

    if (action === 'signup') {
      console.log('Processing signup...')
      // Check if user already exists
      try {
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
          return NextResponse.json(
            { error: 'User already exists' },
            { status: 400 }
          )
        }
      } catch (findError) {
        console.error('Error checking existing user:', findError)
        return NextResponse.json(
          { error: 'Database query failed' },
          { status: 500 }
        )
      }

      // Create new user
      let user
      try {
        user = await User.create({
          email: email.toLowerCase(),
          password,
        })
        console.log('User created successfully')
      } catch (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      // Set session cookie
      const cookieStore = cookies()
      cookieStore.set('session', user._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
      })

      return NextResponse.json({ 
        success: true,
        user: {
          id: user._id,
          email: user.email
        }
      })
    }

    console.log('Invalid action:', action)
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Unhandled auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 