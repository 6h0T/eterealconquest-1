import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"

// Esta ruta se puede llamar al iniciar la aplicación para asegurar que la tabla News existe
export async function GET() {
  try {
    const pool = await connectToDB()

    // Verificar si la tabla existe
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'News')
      BEGIN
        CREATE TABLE News (
          id INT IDENTITY(1,1) PRIMARY KEY,
          title NVARCHAR(255) NOT NULL,
          content NVARCHAR(MAX) NOT NULL,
          image_url NVARCHAR(255),
          language NVARCHAR(10) NOT NULL DEFAULT 'es',
          status NVARCHAR(20) NOT NULL DEFAULT 'active',
          featured BIT NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE()
        )
      END
    `)

    // Verificar si la columna featured existe
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'News' AND COLUMN_NAME = 'featured'
      )
      BEGIN
        ALTER TABLE News ADD featured BIT NOT NULL DEFAULT 0
      END
    `)

    return NextResponse.json({ message: "News table checked/created successfully" })
  } catch (error) {
    console.error("Error checking/creating News table:", error)
    return NextResponse.json(
      {
        message: "Error checking/creating News table",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
