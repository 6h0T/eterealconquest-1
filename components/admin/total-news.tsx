"use client"

import { useState, useEffect } from "react"
import { FileText } from "lucide-react"
import { useAdminNews } from "@/contexts/admin-news-context"

export function TotalNews() {
  const { news, loading } = useAdminNews()
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    if (!loading) {
      setTotal(news.length)
    }
  }, [news, loading])

  return (
    <div
      className="bg-bunker-800 rounded-lg border border-bunker-700 shadow-sm p-6"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <div className="flex justify-between items-start">
        <h3
          className="text-sm font-medium text-gray-400"
          style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
        >
          Noticias Publicadas
        </h3>
        <FileText className="h-5 w-5 text-gold-500" />
      </div>
      <div className="mt-2">
        {loading || total === null ? (
          <div className="animate-pulse h-6 bg-bunker-700 rounded-full w-24"></div>
        ) : (
          <div
            className="text-2xl font-semibold text-gray-100"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            {total}
          </div>
        )}
      </div>
    </div>
  )
}
