import React, { useState, useCallback } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const openDrawer = useCallback(() => setMobileOpen(true), [])
  const closeDrawer = useCallback(() => setMobileOpen(false), [])

  return (
    <div className="min-h-screen flex bg-background text-foreground antialiased">
      {/* ── Desktop: fixed sidebar (md and up) ── */}
      <div className="hidden md:block">
        <Sidebar onNavClick={() => {}} />
      </div>

      {/* ── Mobile: slide-in drawer ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar onNavClick={closeDrawer} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={openDrawer} />
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
