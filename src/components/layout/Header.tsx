import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Layers, ShieldCheck } from "lucide-react"

export function Header() {
  return (
    <header className="h-16 border-b px-6 flex items-center justify-between bg-card/60 backdrop-blur sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          EcomPulse Intelligence Console
        </span>
        <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 items-center text-xs font-medium text-muted-foreground border-border/80">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Pipeline Active</span>
        </Badge>
        <Badge variant="secondary" className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-normal text-muted-foreground">
          <Layers className="h-3 w-3 text-primary" />
          <span>Dual-Layer Decoupled Architecture</span>
        </Badge>
      </div>

      <div className="flex items-center gap-3">
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
          <span>Refresh</span>
        </Button>
      </div>
    </header>
  )
}
