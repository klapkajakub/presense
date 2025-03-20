"use client"

import { cn } from "@/lib/utils"

interface IconContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
}

export function IconContainer({ icon, className, ...props }: IconContainerProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg bg-muted",
        className
      )}
      {...props}
    >
      {icon}
    </div>
  )
}