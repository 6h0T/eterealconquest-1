import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { NewsManager } from "@/components/admin/news-manager"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gestión de Noticias - Eternal Conquest Admin",
  description: "Administración de noticias de Eternal Conquest",
}

export default function NewsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1
            className="text-2xl font-medium text-gray-100"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            Gestión de Noticias
          </h1>
          <p className="text-sm text-gray-400 mt-1" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
            Administra las noticias del sitio web
          </p>
        </div>
        <NewsManager />
      </div>
    </DashboardLayout>
  )
}
