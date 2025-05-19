// /app/api/admin/accountinfo/route.ts
import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { search } = await req.json()

    if (!search) {
      return NextResponse.json({ success: false, error: "Campo de búsqueda vacío" }, { status: 400 })
    }

    const pool = await connectToDB()

    // Buscar por ID de cuenta o email
    const userResult = await pool
      .request()
      .input("search", search)
      .query(`
        SELECT TOP 1 * FROM MEMB_INFO
        WHERE memb___id = @search OR mail_addr = @search
      `)

    let userData

    if (userResult.recordset.length === 0) {
      // Buscar por nombre de personaje
      const charResult = await pool
        .request()
        .input("search", search)
        .query(`SELECT TOP 1 AccountID FROM Character WHERE Name = @search`)

      if (charResult.recordset.length === 0) {
        return NextResponse.json(
          { success: false, error: "No se encontró ningún usuario con ese valor" },
          { status: 404 },
        )
      }

      const accountId = charResult.recordset[0].AccountID

      const finalUserResult = await pool
        .request()
        .input("accountId", accountId)
        .query(`SELECT TOP 1 * FROM MEMB_INFO WHERE memb___id = @accountId`)

      userData = finalUserResult.recordset[0]
    } else {
      userData = userResult.recordset[0]
    }

    // Traer datos de MEMB_STAT
    const statResult = await pool
      .request()
      .input("id", userData.memb___id)
      .query(`
        SELECT TOP 1 IP, ConnectTM, DisConnectTM
        FROM MEMB_STAT
        WHERE memb___id = @id
      `)

    if (statResult.recordset.length > 0) {
      userData.last_ip = statResult.recordset[0].IP
      userData.last_connect = statResult.recordset[0].ConnectTM
      userData.last_disconnect = statResult.recordset[0].DisConnectTM
    } else {
      userData.last_ip = "N/A"
      userData.last_connect = null
      userData.last_disconnect = null
    }

    // Asegurarse de que bloc_code sea un número
    if (userData.bloc_code !== undefined) {
      userData.bloc_code = Number(userData.bloc_code)
    }

    console.log("Datos de usuario recuperados:", {
      id: userData.memb___id,
      email: userData.mail_addr,
      bloc_code: userData.bloc_code,
      type: typeof userData.bloc_code,
    })

    return NextResponse.json({ success: true, data: userData })
  } catch (error) {
    console.error("[ACCOUNT INFO] Error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
