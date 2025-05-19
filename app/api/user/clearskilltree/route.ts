import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { characterName } = await req.json()
    if (!characterName) return NextResponse.json({ error: "Falta el nombre del personaje" }, { status: 400 })

    const db = await connectToDB()
    await db
      .request()
      .input("characterName", characterName)
      .query(`
      DELETE FROM SkillTreeData WHERE Name = @characterName
    `)

    return NextResponse.json({ success: true, message: "Árbol de habilidades limpiado correctamente" })
  } catch (error) {
    return NextResponse.json({ error: "Error al procesar la solicitud", details: String(error) }, { status: 500 })
  }
}
