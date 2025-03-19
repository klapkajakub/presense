"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Building2, Home, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserMenu } from "@/components/user-menu"

const routes = [
  {
    label: 'Home',
    icon: Home,
    href: '/',
    color: 'text-sky-500'
  },
  {
    label: 'Business',
    icon: Building2,
    href: '/business',
    color: 'text-violet-500',
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

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
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