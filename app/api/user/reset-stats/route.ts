import { connectToDB } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { characterName } = await req.json()
    if (!characterName) return Response.json({ error: "Nombre de personaje requerido" }, { status: 400 })

    const db = await connectToDB()

    await db
      .request()
      .input("characterName", characterName)
      .query(`
        UPDATE Character SET
          Strength = 18,
          Dexterity = 18,
          Vitality = 15,
          Energy = 30,
          LevelUpPoint = 0
        WHERE Name = @characterName
      `)

    return Response.json({ success: true, message: "Stats reseteados correctamente" })
  } catch (error) {
    console.error("[SERVER] Error en reset-stats:", error)
    return Response.json({ error: "Error al resetear stats" }, { status: 500 })
  }
}
