"use client"

import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { PendingAccountsManager } from "@/components/admin/pending-accounts-manager"
import type { Metadata } from "next"

export default function PendingAccountsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1
            className="text-2xl font-medium text-gray-100"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            Cuentas Pendientes de Verificación
          </h1>
          <p className="text-sm text-gray-400 mt-1" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
            Administra y valida manualmente las cuentas que esperan verificación por email
          </p>
        </div>
        <PendingAccountsManager />
      </div>
    </DashboardLayout>
  )
} 