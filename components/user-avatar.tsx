"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface UserAvatarProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12"
}

export function UserAvatar({ className, size = "md" }: UserAvatarProps) {
  const { data: session } = useSession()

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={session?.user?.avatar} alt="User avatar" />
      <AvatarFallback>
        <User className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  )
} 