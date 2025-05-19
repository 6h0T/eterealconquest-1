import { DashboardLayout } from "@/components/admin/dashboard-layout"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 bg-bunker-700 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-bunker-700 rounded animate-pulse mt-2"></div>
        </div>

        <div className="bg-bunker-800 border border-bunker-700 rounded-xl p-6">
          <div className="h-6 w-48 bg-bunker-700 rounded animate-pulse mb-4"></div>
          <div className="h-4 w-full bg-bunker-700 rounded animate-pulse mb-6"></div>
          <div className="flex gap-2">
            <div className="h-10 flex-1 bg-bunker-700 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-bunker-700 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="bg-bunker-800 border border-bunker-700 rounded-xl p-6">
          <div className="h-6 w-48 bg-bunker-700 rounded animate-pulse mb-6"></div>
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex justify-between items-center border-b border-bunker-700 pb-2">
                <div className="h-4 w-24 bg-bunker-700 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-bunker-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
