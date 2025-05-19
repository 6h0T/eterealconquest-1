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
          MapNumber = 0,
          MapPosX = 125,
          MapPosY = 125
        WHERE Name = @characterName
      `)

    return Response.json({ success: true, message: "Personaje movido a Lorencia" })
  } catch (error) {
    console.error("[SERVER] Error en unstick:", error)
    return Response.json({ error: "Error al desatascar personaje" }, { status: 500 })
  }
}
