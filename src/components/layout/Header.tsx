import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Layers, ShieldCheck, Menu } from "lucide-react"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 border-b px-4 md:px-6 flex items-center justify-between bg-card/60 backdrop-blur sticky top-0 z-10">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:hidden shrink-0"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <span className="text-sm font-semibold tracking-tight text-foreground truncate">
          EcomPulse Intelligence Console
        </span>

        <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 items-center text-xs font-medium text-muted-foreground border-border/80 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Pipeline Active</span>
        </Badge>

        <Badge variant="secondary" className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-normal text-muted-foreground shrink-0">
          <Layers className="h-3 w-3 text-primary" />
          <span>Dual-Layer Decoupled Architecture</span>
        </Badge>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Strict Customer Privacy Enforced</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5 shadow-xs hover:bg-accent"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3 w-3" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </header>
  )
}
