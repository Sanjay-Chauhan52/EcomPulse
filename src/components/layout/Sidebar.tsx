import React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  UserCheck,
  CircleDollarSign,
  Scale,
  Filter,
  Dna,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const crmNavItems = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Customer 360", path: "/customer-360", icon: UserCheck },
  { name: "Customer Value", path: "/customer-value", icon: CircleDollarSign },
  { name: "Relationship Risk", path: "/relationship-risk", icon: Scale },
]

const behavioralNavItems = [
  { name: "Purchase Friction", path: "/purchase-friction", icon: Filter },
  { name: "Behavioural DNA", path: "/behavioural-dna", icon: Dna },
]

interface SidebarProps {
  /** Called when a nav link is clicked — used to close the mobile drawer */
  onNavClick: () => void
}

export function Sidebar({ onNavClick }: SidebarProps) {
  return (
    <aside className="w-64 border-r bg-card/60 backdrop-blur flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-sm">
          <Zap className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
        </div>
        <div>
          <div className="font-bold text-lg leading-tight tracking-tight flex items-center gap-1.5">
            EcomPulse
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              v2.0
            </Badge>
          </div>
          <div className="text-[11px] text-muted-foreground leading-tight">
            Decoupled Intelligence Engine
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Section 1: CRM Layer */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              CRM &amp; Commercial Layer
            </span>
            <span className="text-[11px] font-medium text-muted-foreground/70">
              10K Accounts
            </span>
          </div>
          <nav className="space-y-1">
            {crmNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Section 2: Behavioral Layer */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Clickstream &amp; Behavioral
            </span>
            <span className="text-[11px] font-medium text-muted-foreground/70">
              1.02M Users
            </span>
          </div>
          <nav className="space-y-1">
            {behavioralNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t bg-muted/20">
        <div className="rounded-lg border bg-background/60 p-2.5 text-xs shadow-xs">
          <div className="flex items-center justify-between font-medium mb-1">
            <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Engine Status
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Active</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-snug">
            Strict population decoupling enforced (Zero user-level merges)
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar