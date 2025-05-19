import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { characterName, stats } = await req.json()

    if (!characterName || !stats) {
      console.error("[ADDSTATS] Faltan datos: ", { characterName, stats })
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    const db = await connectToDB()

    console.log("[ADDSTATS] Buscando personaje:", characterName)
    const checkResult = await db
      .request()
      .input("Name", characterName)
      .query(`
        SELECT LevelUpPoint
        FROM Character
        WHERE Name = @Name
      `)

    if (checkResult.recordset.length === 0) {
      console.error("[ADDSTATS] Personaje no encontrado:", characterName)
      return NextResponse.json({ error: "Personaje no encontrado" }, { status: 404 })
    }

    const availablePoints = checkResult.recordset[0].LevelUpPoint
    const pointsToAdd = (stats.str || 0) + (stats.agi || 0) + (stats.vit || 0) + (stats.ene || 0)

    console.log("[ADDSTATS] Puntos disponibles:", availablePoints, "- Puntos a añadir:", pointsToAdd)

    if (pointsToAdd > availablePoints) {
      console.warn("[ADDSTATS] No hay suficientes puntos para añadir")
      return NextResponse.json({ error: "No tienes suficientes puntos" }, { status: 400 })
    }

    await db
      .request()
      .input("Name", characterName)
      .input("str", stats.str || 0)
      .input("agi", stats.agi || 0)
      .input("vit", stats.vit || 0)
      .input("ene", stats.ene || 0)
      .input("used", pointsToAdd)
      .query(`
        UPDATE Character SET
          Strength = Strength + @str,
          Dexterity = Dexterity + @agi,
          Vitality = Vitality + @vit,
          Energy = Energy + @ene,
          LevelUpPoint = LevelUpPoint - @used
        WHERE Name = @Name
      `)

    console.log("[ADDSTATS] Puntos añadidos correctamente a:", characterName)
    return NextResponse.json({ success: true, message: "Puntos añadidos correctamente" })
  } catch (error: any) {
    console.error("[ADDSTATS] Error fatal:", error)
    return NextResponse.json({ error: "Error interno", details: error.message || error }, { status: 500 })
  }
}
