import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(request: Request, { params }: { params: { lang: string; status: string } }) {
  try {
    const lang = params.lang
    const status = params.status

    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("language", lang)
      .eq("status", status)
      .eq("featured", true)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, news: data })
  } catch (error) {
    console.error("Error al obtener noticias:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
