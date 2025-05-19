// ✅ /app/api/user/characters/route.ts
import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { accountId } = await req.json()
    if (!accountId) {
      return NextResponse.json({ error: "Falta el nombre de la cuenta" }, { status: 400 })
    }

    const db = await connectToDB()
    const result = await db
      .request()
      .input("accountId", accountId)
      .query(`
        SELECT Name, cLevel, Class, LevelUpPoint, Strength, Dexterity, Vitality, Energy
        FROM Character
        WHERE AccountID = @accountId
      `)

    return NextResponse.json({ success: true, characters: result.recordset })
  } catch (error) {
    console.error("Error al obtener personajes:", error)
    return NextResponse.json({ error: "Error al obtener los personajes", details: String(error) }, { status: 500 })
  }
}
