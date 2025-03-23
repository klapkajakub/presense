'use client'

import { createContext, useContext, useEffect, useState } from 'react'

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
    // Check if token exists in localStorage
    const token = localStorage.getItem('token')
    
    if (!token) {
      setIsLoading(false)
      return
    }
    
    // Verify token with the server
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        if (data.valid && data.user) {
          setUser(data.user)
        } else {
          // Invalid token, remove it
          localStorage.removeItem('token')
        }
      })
      .catch(error => {
        console.error('Error verifying token:', error)
        localStorage.removeItem('token')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      localStorage.removeItem('token')
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)