import type { IronSessionOptions } from 'iron-session'

export interface SessionData {
  user?: {
    id: string
    email: string
  }
}

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'presense_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
} 