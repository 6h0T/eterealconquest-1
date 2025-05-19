import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { user, coins } = await req.json()

    if (!user || !coins) {
      return NextResponse.json({ success: false, error: "Usuario y cantidad de coins son requeridos" }, { status: 400 })
    }

    const pool = await connectToDB()

    // Obtenemos la configuración dinámica
    const configQuery = await pool.request().query(`
      SELECT TOP 1 * FROM WEBENGINE_CREDITS_CONFIG WHERE config_display = 1
    `)

    const config = configQuery.recordset[0]

    if (!config) {
      return NextResponse.json(
        { success: false, error: "No hay configuración activa para donaciones" },
        { status: 500 },
      )
    }

    const table = config.config_table // Ej: CashShopData
    const creditColumn = config.config_credits_col // Ej: WCoinC
    const userColumn = config.config_user_col // Ej: AccountID

    // Validar existencia del usuario
    const checkUser = await pool
      .request()
      .input("user", user)
      .query(`SELECT * FROM ${table} WHERE ${userColumn} = @user`)

    if (checkUser.recordset.length === 0) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 })
    }

    // Acreditar coins
    await pool
      .request()
      .input("user", user)
      .input("coins", coins)
      .query(`
        UPDATE ${table}
        SET ${creditColumn} = ISNULL(${creditColumn}, 0) + @coins
        WHERE ${userColumn} = @user
      `)

    return NextResponse.json({
      success: true,
      message: `Se acreditaron ${coins} coins a ${user}`,
    })
  } catch (error) {
    console.error("[DONATION MODULE ERROR]", error)
    return NextResponse.json({ success: false, error: "Error del servidor" }, { status: 500 })
  }
}
