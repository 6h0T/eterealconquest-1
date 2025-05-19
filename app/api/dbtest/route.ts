import { NextResponse } from "next/server"
import { connectToDB, executeQuery } from "@/lib/db"

export async function GET() {
  let pool = null
  try {
    console.log("Testing database connection")

    // Log configuration (without password)
    console.log("Configuration:", {
      host: process.env.SQL_DB_HOST,
      port: process.env.SQL_DB_PORT,
      database: process.env.SQL_DB_NAME,
      user: process.env.SQL_DB_USER,
    })

    // Connect using our improved function
    pool = await connectToDB()
    console.log("Connection successful using connectToDB()")

    // Test a simple query
    const result = await executeQuery("SELECT TOP 1 * FROM MEMB_INFO")
    console.log("Query successful. Rows found:", result.recordset.length)

    return NextResponse.json({
      success: true,
      message: "Database connection established successfully",
      config: {
        host: process.env.SQL_DB_HOST,
        port: process.env.SQL_DB_PORT,
        database: process.env.SQL_DB_NAME,
        user: process.env.SQL_DB_USER,
      },
      rowCount: result.recordset.length,
    })
  } catch (err: any) {
    console.error("Database connection error:", err)
    console.error("Type:", err.name)
    console.error("Message:", err.message)
    console.error("Code:", err.code || "UNKNOWN")

    return NextResponse.json(
      {
        success: false,
        error: "Database connection error",
        message: err.message,
        code: err.code || "UNKNOWN",
        name: err.name,
      },
      { status: 500 },
    )
  } finally {
    if (pool && pool !== (await connectToDB())) {
      try {
        await pool.close()
        console.log("Database connection closed successfully")
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr)
      }
    }
  }
}
