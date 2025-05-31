import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar variables de entorno
    const hasResendKey = !!process.env.RESEND_API_KEY
    const hasBaseUrl = !!process.env.NEXT_PUBLIC_BASE_URL
    
    console.log("[TEST-RESEND] Variables de entorno:")
    console.log("- RESEND_API_KEY:", hasResendKey ? "✅ Configurada" : "❌ No configurada")
    console.log("- NEXT_PUBLIC_BASE_URL:", hasBaseUrl ? "✅ Configurada" : "❌ No configurada")
    console.log("- NEXT_PUBLIC_BASE_URL value:", process.env.NEXT_PUBLIC_BASE_URL)
    
    return NextResponse.json({
      success: true,
      config: {
        hasResendKey,
        hasBaseUrl,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL
      }
    })
  } catch (error: any) {
    console.error("[TEST-RESEND] Error:", error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
} 