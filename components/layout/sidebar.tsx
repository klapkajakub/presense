"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserMenu } from "@/components/user-menu"
import { useSidebar } from "./sidebar-context"
import { useEffect, useRef } from "react"

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
    color: 'text-sky-500'
  },
  {
    label: 'Team',
    icon: Users,
    href: '/team',
    color: 'text-pink-700',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    color: 'text-orange-700',
  }
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { width, setWidth, isDragging, setIsDragging } = useSidebar()
  const dragStartX = useRef<number>(0)
  const dragStartWidth = useRef<number>(0)

  // Handle resize drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()

      requestAnimationFrame(() => {
        const dragDistance = e.clientX - dragStartX.current
        const newWidth = dragStartWidth.current + dragDistance
        setWidth(newWidth)
      })
    }

    const handleMouseUp = () => {
      if (!isDragging) return
      setIsDragging(false)
      document.body.style.removeProperty('user-select')
      document.body.style.removeProperty('cursor')
    }

    if (isDragging) {
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'ew-resize'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.removeProperty('user-select')
      document.body.style.removeProperty('cursor')
    }
  }, [isDragging, setWidth])

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    dragStartX.current = e.clientX
    dragStartWidth.current = width
    setIsDragging(true)
  }

  return (
    <div 
      className={cn("relative flex flex-col h-full bg-background border-r border-border", className)}
      style={{ 
        width,
        transition: isDragging ? 'none' : 'width 300ms ease-in-out'
      }}
    >
      {/* Resize Handle */}
      <div
        className={cn(
          "absolute right-0 inset-y-0 w-4 cursor-ew-resize hover:bg-border/40 transition-colors z-50",
          isDragging && "bg-border/40"
        )}
        onMouseDown={handleDragStart}
        onClick={e => e.stopPropagation()}
      />
      
      <div className="px-3 py-2">
        <h2 className="mb-1 px-4 text-lg font-semibold tracking-tight">
          Presense
        </h2>
        <p className="px-4 text-sm text-muted-foreground">
          AI-powered business content management
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-3">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === route.href && "bg-muted/50"
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="p-3 mt-auto">
        <UserMenu />
      </div>
    </div>
  )
}