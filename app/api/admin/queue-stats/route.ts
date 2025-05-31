import { NextResponse } from "next/server"
import { getQueueStats } from "@/lib/registration-queue"

export async function GET(req: Request) {
  try {
    const stats = getQueueStats()
    
    // Calcular métricas adicionales
    const totalJobs = stats.completed + stats.failed + stats.pending + stats.processing
    const successRate = totalJobs > 0 ? (stats.completed / (stats.completed + stats.failed)) * 100 : 0
    const throughput = stats.totalProcessed // Jobs procesados en total
    
    // Información del sistema
    const systemInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version
    }

    return NextResponse.json({
      success: true,
      queue: {
        ...stats,
        metrics: {
          totalJobs,
          successRate: Math.round(successRate * 100) / 100,
          throughput,
          averageProcessingTime: "N/A" // Se puede implementar con más tracking
        }
      },
      system: systemInfo,
      recommendations: generateRecommendations(stats)
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// Generar recomendaciones basadas en las estadísticas
function generateRecommendations(stats: any): string[] {
  const recommendations: string[] = []
  
  if (stats.pending > 100) {
    recommendations.push("⚠️ Cola alta: Considera aumentar la concurrencia o añadir más workers")
  }
  
  if (stats.failed > stats.completed * 0.1) {
    recommendations.push("🔴 Alta tasa de fallos: Revisar logs de errores y conexión a BD")
  }
  
  if (stats.processing > 40) {
    recommendations.push("🟡 Muchos trabajos procesando: El sistema está cerca del límite")
  }
  
  if (stats.pending === 0 && stats.processing === 0) {
    recommendations.push("✅ Sistema funcionando óptimamente")
  }
  
  return recommendations
}

// Endpoint para limpiar estadísticas (solo para desarrollo)
export async function DELETE(req: Request) {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        error: "No permitido en producción"
      }, { status: 403 })
    }

    const { registrationQueue } = await import("@/lib/registration-queue")
    registrationQueue.clear()
    
    return NextResponse.json({
      success: true,
      message: "Estadísticas limpiadas"
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
} 