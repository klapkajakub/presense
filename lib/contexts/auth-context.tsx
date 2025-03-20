'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getToken, removeToken, setToken } from '@/lib/auth'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      // Decode the JWT token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({
          id: payload.userId,
          email: payload.email,
        })
      } catch (error) {
        console.error('Error decoding token:', error)
        removeToken()
      }
    }
    setIsLoading(false)
  }, [])

  const signOut = () => {
    removeToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 