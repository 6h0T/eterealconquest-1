import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { characterName, type, amount } = await req.json()

    if (!characterName || !type || !amount)
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })

    const db = await connectToDB()
    const statsResult = await db
      .request()
      .input("characterName", characterName)
      .query(`SELECT LevelUpPoint FROM Character WHERE Name = @characterName`)

    if (statsResult.recordset.length === 0) {
      return NextResponse.json({ error: "Personaje no encontrado" }, { status: 404 })
    }

    const available = statsResult.recordset[0].LevelUpPoint
    if (amount > available) {
      return NextResponse.json({ error: "No tienes suficientes puntos" }, { status: 400 })
    }

    const allowedTypes = {
      str: "Strength",
      agi: "Dexterity",
      vit: "Vitality",
      ene: "Energy",
    }

    const column = allowedTypes[type as keyof typeof allowedTypes]
    if (!column) {
      return NextResponse.json({ error: "Tipo de stat inválido" }, { status: 400 })
    }

    await db
      .request()
      .input("characterName", characterName)
      .input("amount", amount)
      .query(`
        UPDATE Character
        SET ${column} = ${column} + @amount,
            LevelUpPoint = LevelUpPoint - @amount
        WHERE Name = @characterName
      `)

    // Añadir registro en el log
    await db
      .request()
      .input("characterName", characterName)
      .input("statType", column)
      .input("amount", amount)
      .query(`
        INSERT INTO CharacterStatsLog (
          CharacterName, 
          StatType, 
          AmountAdded, 
          DateAdded
        ) VALUES (
          @characterName,
          @statType,
          @amount,
          GETDATE()
        )
      `)

    return NextResponse.json({ success: true, message: `Se sumaron ${amount} puntos a ${column}` })
  } catch (error) {
    console.error("Error al aplicar stat:", error)
    return NextResponse.json({ error: "Error interno", details: String(error) }, { status: 500 })
  }
}
