import { DashboardLayout } from "@/components/admin/dashboard-layout"
import StreamersManager from "@/components/admin/streamers-manager"

export default function StreamersPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Streamers</h1>
        <StreamersManager />
      </div>
    </DashboardLayout>
  )
}
