"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface UserAvatarProps {
  user: {
    id: string
    email: string
  }
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12"
}

export function UserAvatar({ user, className, size = "md" }: UserAvatarProps) {
  const initials = user.email.split('@')[0].slice(0, 2).toUpperCase()

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt={user.email} />
      <AvatarFallback>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
} 