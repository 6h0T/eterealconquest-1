import { AdminLoginForm } from "@/components/admin/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Login - Eternal Conquest",
  description: "Panel de administración de Eternal Conquest",
}

export default function AdminPage() {
  return (
    <div
      className="min-h-screen flex flex-col md:flex-row bg-bunker-950"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      {/* Formulario de login */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <AdminLoginForm />
      </div>
    </div>
  )
}
