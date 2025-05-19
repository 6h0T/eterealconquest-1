import { NextResponse } from "next/server"
import { getOnlineTimeRanking } from "@/lib/admin/online-time"

export async function GET() {
  try {
    const ranking = await getOnlineTimeRanking()
    return NextResponse.json(ranking)
  } catch (error) {
    console.error("Error al obtener ranking de tiempo online:", error)
    return NextResponse.json([], { status: 500 })
  }
}
