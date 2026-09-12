import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, Sparkles, RefreshCw } from "lucide-react"

export function Header() {
  return (
    <header className="h-16 border-b px-6 flex items-center justify-between bg-card/40 backdrop-blur sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          E-Commerce Behavioral & Commercial Intelligence
        </span>
        <Badge variant="outline" className="hidden sm:inline-flex gap-1 items-center text-xs">
          <Database className="h-3 w-3 text-emerald-500" />
          <span>Static Data Store: <code>/data/*.json</code></span>
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          Streamlit Parity Mode
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reload</span>
        </Button>
      </div>
    </header>
  )
}
