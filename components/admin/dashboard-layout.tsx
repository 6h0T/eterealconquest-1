"use client"

import type { ReactNode } from "react"
import { AdminSidebar } from "./sidebar"
import { AdminNewsProvider } from "@/contexts/admin-news-context"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AdminNewsProvider>
      <div
        className="flex h-screen bg-bunker-950 text-gray-100"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <div className="w-64 flex-shrink-0">
          <AdminSidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <div style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>{children}</div>
        </main>
      </div>
    </AdminNewsProvider>
  )
}

export default DashboardLayout
