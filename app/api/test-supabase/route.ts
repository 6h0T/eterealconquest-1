import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Verificar conexión básica
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json(
        {
          success: false,
          error: "Error al listar buckets",
          details: bucketsError,
        },
        { status: 500 },
      )
    }

    // Verificar si existe el bucket 'images'
    const imagesBucket = buckets.find((bucket) => bucket.name === "images")

    if (!imagesBucket) {
      return NextResponse.json(
        {
          success: false,
          error: "El bucket 'images' no existe",
          buckets: buckets.map((b) => b.name),
        },
        { status: 404 },
      )
    }

    // Verificar permisos listando archivos
    const { data: files, error: filesError } = await supabase.storage.from("images").list()

    if (filesError) {
      return NextResponse.json(
        {
          success: false,
          error: "Error al listar archivos",
          details: filesError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Conexión a Supabase exitosa",
      bucketExists: true,
      fileCount: files.length,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Error al conectar con Supabase",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
