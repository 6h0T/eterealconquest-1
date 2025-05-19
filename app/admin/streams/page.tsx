import type { Metadata } from "next"
import DashboardLayout from "@/components/admin/dashboard-layout"
import StreamsManagement from "@/components/admin/streams-management"

export const metadata: Metadata = {
  title: "Administración de Streams | Panel de Administración",
  description: "Gestiona las transmisiones en vivo de diferentes plataformas",
}

export default function StreamsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Administración de Streams</h1>
        <StreamsManagement />
      </div>
    </DashboardLayout>
  )
}
