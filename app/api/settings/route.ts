import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

const UPLOAD_DIR = join(process.cwd(), 'public/uploads')
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const secret = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyAuth(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]
  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const payload = await verifyAuth(request)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findById(payload.userId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      email: user.email,
      // Add other settings as needed
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await verifyAuth(request)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    await connectDB()

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { $set: body },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      email: user.email,
      // Add other settings as needed
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth.getServerSession()
    if (!session?.user?.id) {
      console.error('No user ID in session:', session)
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    const formData = await req.formData()
    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const displayName = formData.get('displayName') as string
    const bio = formData.get('bio') as string
    const avatar = formData.get('avatar') as File | null

    // Validate required fields
    if (!username || !email) {
      return NextResponse.json(
        { message: 'Username and email are required' },
        { status: 400 }
      )
    }

    // Get current user data
    const currentUser = await User.findById(session.user.id)
    if (!currentUser) {
      console.error('User not found for ID:', session.user.id)
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Only check for username conflicts if username is being changed
    if (username.toLowerCase() !== currentUser.username.toLowerCase()) {
      const existingUsername = await User.findOne({
        _id: { $ne: session.user.id },
        username: username.toLowerCase()
      })

      if (existingUsername) {
        return NextResponse.json(
          { message: 'Username already taken' },
          { status: 400 }
        )
      }
    }

    // Only check for email conflicts if email is being changed
    if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const existingEmail = await User.findOne({
        _id: { $ne: session.user.id },
        email: email.toLowerCase()
      })

      if (existingEmail) {
        return NextResponse.json(
          { message: 'Email already taken' },
          { status: 400 }
        )
      }
    }

    // Handle avatar upload
    let avatarUrl = undefined
    if (avatar) {
      // Validate file size
      if (avatar.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: 'Avatar image must be less than 2MB' },
          { status: 400 }
        )
      }

      // Validate file type
      if (!avatar.type.startsWith('image/')) {
        return NextResponse.json(
          { message: 'Invalid file type. Please upload an image.' },
          { status: 400 }
        )
      }

      try {
        // Ensure upload directory exists
        await mkdir(UPLOAD_DIR, { recursive: true })

        const bytes = await avatar.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        const filename = `avatar-${uniqueSuffix}${avatar.name.match(/\.[^.]+$/)?.[0] || ''}`
        const filepath = join(UPLOAD_DIR, filename)

        await writeFile(filepath, buffer)
        avatarUrl = `/uploads/${filename}`
      } catch (error) {
        console.error('File upload error:', error)
        return NextResponse.json(
          { message: 'Failed to upload avatar' },
          { status: 500 }
        )
      }
    }

    // Update user
    try {
      const updatedUser = await User.findByIdAndUpdate(
        session.user.id,
        {
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          displayName,
          bio,
          ...(avatarUrl && { avatar: { url: avatarUrl } }),
        },
        { new: true }
      )

      if (!updatedUser) {
        console.error('Failed to update user:', session.user.id)
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.displayName,
        avatar: updatedUser.avatar?.url,
      })
    } catch (error) {
      console.error('Database update error:', error)
      return NextResponse.json(
        { message: 'Failed to update user data' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}