import { IconContainer } from "@/components/ui/icon-container"

export function Header() {
  return (
    <div className="h-full flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd> to open command menu
        </div>
      </div>
    </div>
  )
}