"use client"

import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings as SettingsIcon 
} from "lucide-react"

interface PageInfo {
  title: string;
  icon: React.ReactNode;
}

export function Header() {
  const pathname = usePathname()
  const { title, icon } = getPageInfo(pathname)

  return (
    <div className="flex h-14 items-center justify-between px-6">
      <div className="flex items-center gap-2">
        {icon}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="text-sm text-muted-foreground">
        Press <kbd className="pointer-events-none ml-1 select-none rounded border px-1.5 font-mono text-[10px] font-medium opacity-100">⌘</kbd> <kbd className="pointer-events-none select-none rounded border px-1.5 font-mono text-[10px] font-medium opacity-100">K</kbd> to open command menu
      </div>
    </div>
  )
}

function getPageInfo(pathname: string): PageInfo {
  switch (pathname) {
    case '/':
      return {
        title: 'Dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />
      }
    case '/business':
      return {
        title: 'Business',
        icon: <Building2 className="h-5 w-5" />
      }
    case '/team':
      return {
        title: 'Team',
        icon: <Users className="h-5 w-5" />
      }
    case '/settings':
      return {
        title: 'Settings',
        icon: <SettingsIcon className="h-5 w-5" />
      }
    default:
      return {
        title: 'Dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />
      }
  }
}