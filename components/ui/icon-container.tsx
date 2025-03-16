"use client"

import { cn } from "@/lib/utils"

interface IconContainerProps {
  icon: string // Font Awesome class names e.g. "fa-solid fa-brain"
  className?: string
  containerClassName?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: {
    container: "p-2",
    icon: "text-xs"
  },
  md: {
    container: "h-6 w-6",
    icon: "text-xs"
  },
  lg: {
    container: "w-8 h-8",
    icon: "text-base"
  }
}

export function IconContainer({ 
  icon,
  className, 
  containerClassName,
  size = "md" 
}: IconContainerProps) {
  return (
    <div className={cn(
      "flex items-center justify-center rounded-full bg-primary/10",
      sizeClasses[size].container,
      containerClassName
    )}>
      <i 
        className={cn(
          icon,
          "text-primary",
          sizeClasses[size].icon,
          className
        )}
        aria-hidden="true"
      />
    </div>
  )
}