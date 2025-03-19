"use client"

import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  const title = getTitle(pathname)

  return (
    <div className="flex h-14 items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="text-sm text-muted-foreground">
        Press <kbd className="pointer-events-none ml-1 select-none rounded border px-1.5 font-mono text-[10px] font-medium opacity-100">⌘</kbd> <kbd className="pointer-events-none select-none rounded border px-1.5 font-mono text-[10px] font-medium opacity-100">K</kbd> to open command menu
      </div>
    </div>
  )
}

function getTitle(pathname: string): string {
  switch (pathname) {
    case '/':
      return 'Dashboard'
    case '/business':
      return 'Business'
    case '/team':
      return 'Team'
    case '/settings':
      return 'Settings'
    default:
      return 'Dashboard'
  }
}