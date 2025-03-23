'use client'

import { Session } from "next-auth"
import { signOut as nextAuthSignOut, useSession } from 'next-auth/react'
import { createContext, useContext } from 'react'

interface AuthContextType {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  isLoading: boolean
  signOut: () => Promise<void>
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  
  const isLoading = status === 'loading'
  
  const handleSignOut = async () => {
    await nextAuthSignOut()
  }
  
  return (
    <AuthContext.Provider 
      value={{ 
        user: session?.user || null, 
        isLoading, 
        signOut: handleSignOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 