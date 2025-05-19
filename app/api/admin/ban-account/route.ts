// /app/api/admin/ban-account/route.ts
import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { accountId, action } = await req.json()

    if (!accountId || !action) {
      return NextResponse.json({ success: false, error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    if (action !== "ban" && action !== "unban") {
      return NextResponse.json({ success: false, error: "Acción no válida" }, { status: 400 })
    }

    const pool = await connectToDB()

    // Establecer bloc_code = 1 para bloquear, bloc_code = 0 para desbloquear
    const blocCode = action === "ban" ? 1 : 0

    const result = await pool
      .request()
      .input("accountId", accountId)
      .input("blocCode", blocCode)
      .query(`
        UPDATE MEMB_INFO
        SET bloc_code = @blocCode
        WHERE memb___id = @accountId
      `)

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { success: false, error: "No se encontró la cuenta o no se pudo actualizar" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Cuenta ${action === "ban" ? "bloqueada" : "desbloqueada"} correctamente`,
    })
  } catch (error) {
    console.error("[BAN ACCOUNT] Error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
