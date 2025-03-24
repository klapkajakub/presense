"use client"

import { AvatarProps } from "@radix-ui/react-avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/contexts/mock-auth-context"
import { User } from "lucide-react"

interface UserAvatarProps extends AvatarProps {
  user?: {
    image?: string | null
    name?: string | null
    email?: string | null
  } | null
  fallback?: React.ReactNode
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({
  user,
  fallback,
  size = "md",
  ...props
}: UserAvatarProps) {
  const { user: authUser } = useAuth()
  const currentUser = user || authUser

  // Size classes mapping
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14"
  }

  // Get user initials for fallback
  const getUserInitials = () => {
    if (!currentUser?.name) return ""
    
    const nameParts = currentUser.name.split(" ")
    if (nameParts.length === 1 && nameParts[0]) {
      return nameParts[0].substring(0, 2).toUpperCase()
    }
    
    return `${nameParts[0]?.charAt(0) || ''}${nameParts[1]?.charAt(0) || ''}`.toUpperCase()
  }

  const initials = getUserInitials()
  const defaultFallback = currentUser?.name ? initials : <User className="h-5 w-5" />

  return (
    <Avatar className={sizeClasses[size]} {...props}>
      {currentUser?.image ? (
        <AvatarImage
          src={currentUser.image}
          alt={`${currentUser.name || "User"}'s profile picture`}
        />
      ) : null}
      <AvatarFallback>
        {fallback || defaultFallback}
      </AvatarFallback>
    </Avatar>
  )
}