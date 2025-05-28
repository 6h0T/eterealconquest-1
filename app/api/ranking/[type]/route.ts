import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { type: string } }) {
  try {
    const type = params.type
    console.log(`[RANKING ${type.toUpperCase()}] Iniciando consulta de ranking tipo: ${type}`)

    // Redirigir a los endpoints específicos si existen
    if (["level", "online", "killers", "guilds"].includes(type)) {
      const response = await fetch(`${request.url.split("/api/")[0]}/api/ranking/${type}`)
      return response
    }

    let query = ""

    // Define queries based on ranking type
    switch (type) {
      case "resets":
        query = `
          SELECT TOP 50 Name, Class, cLevel, Resets
          FROM Character
          WHERE Name IS NOT NULL 
            AND cLevel IS NOT NULL
            AND Resets > 0
            AND (ctlcode = 0 OR ctlcode IS NULL)
          ORDER BY Resets DESC, cLevel DESC
        `
        break
      case "grandresets":
        query = `
          SELECT TOP 50 Name, Class, Resets, GrandResets
          FROM Character
          WHERE Name IS NOT NULL
            AND GrandResets > 0
            AND (ctlcode = 0 OR ctlcode IS NULL)
          ORDER BY GrandResets DESC, Resets DESC
        `
        break
      case "gens":
        query = `
          SELECT TOP 50 Name, Class, GensFamily, GensContribution
          FROM Character
          WHERE Name IS NOT NULL
            AND GensFamily > 0
            AND GensContribution > 0
          ORDER BY GensContribution DESC
        `
        break
      case "votes":
        query = `
          SELECT TOP 50 username as Name, votes
          FROM webengine_votes
          WHERE username IS NOT NULL
            AND votes > 0
          ORDER BY votes DESC
        `
        break
      case "master":
        query = `
          SELECT TOP 50 Name, Class, cLevel, Resets, MasterLevel
          FROM Character
          WHERE Name IS NOT NULL
            AND MasterLevel > 0
            AND (ctlcode = 0 OR ctlcode IS NULL)
          ORDER BY MasterLevel DESC, Resets DESC
        `
        break
      default:
        return NextResponse.json({ success: false, error: "Tipo de ranking no válido" }, { status: 404 })
    }

    try {
      // Connect to the database
      const db = await connectToDB()
      const result = await db.query(query)

      console.log(
        `[RANKING ${type.toUpperCase()}] Consulta ejecutada correctamente, registros encontrados:`,
        result.recordset.length,
      )

      // After getting the results from the database
      const processedResults = result.recordset.map((record) => {
        if (record.Guild === "Sin Guil" || record.Guild === "Sin Gui" || record.Guild === "Sin G") {
          record.Guild = "Sin Guild"
        }
        return record
      })

      // Return the database results
      return NextResponse.json({
        success: true,
        ranking: processedResults,
      })
    } catch (dbError) {
      console.error(`[RANKING ${type.toUpperCase()}] Error en la consulta SQL:`, dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Error al ejecutar la consulta de ranking",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error(`[RANKING ${params.type.toUpperCase()}] Error general:`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
