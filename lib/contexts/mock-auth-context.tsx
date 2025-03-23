'use client'

import { createContext, useContext } from 'react'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => void
}

// Create a mock auth context with a dummy user
const AuthContext = createContext<AuthContextType>({
  user: {
    id: 'mock-user-id',
    email: 'user@example.com'
  },
  isLoading: false,
  signOut: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mock user that's always logged in
  const mockUser = {
    id: 'mock-user-id',
    email: 'user@example.com'
  }
  
  // Mock signOut function that does nothing
  const signOut = () => {
    console.log('Auth system has been removed. SignOut is non-functional.')
  }

  return (
    <AuthContext.Provider value={{ user: mockUser, isLoading: false, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)