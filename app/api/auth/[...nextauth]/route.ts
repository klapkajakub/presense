import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        try {
          await connectDB()
          const user = await User.findOne({ email: credentials.email }).select('+password')
          if (!user) return null
          
          const isValid = await user.comparePassword(credentials.password)
          if (!isValid) return null
          
          // Update last login
          await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date()
          })
          
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            avatar: user.avatar?.url,
            name: user.displayName || user.username
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.avatar = user.avatar
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.avatar = token.avatar as string
        
        // Debug session data
        console.log('Session being created:', {
          id: session.user.id,
          username: session.user.username,
          avatar: session.user.avatar
        })
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 