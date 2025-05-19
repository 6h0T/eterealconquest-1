import { NextResponse } from "next/server"
import { connectToDB } from "@/lib/db"
import { headers } from "next/headers"

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const headersList = headers()
    const validationUrl =
      process.env.PAYPAL_ENV === "live"
        ? "https://ipnpb.paypal.com/cgi-bin/webscr"
        : "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr"

    const validationBody = `cmd=_notify-validate&${rawBody}`
    const paypalRes = await fetch(validationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: validationBody,
    })

    const validationResponse = await paypalRes.text()
    if (validationResponse !== "VERIFIED") {
      return NextResponse.json({ success: false, error: "IPN no verificado" }, { status: 400 })
    }

    const params = new URLSearchParams(rawBody)
    const account = params.get("custom")
    const amount = Number.parseFloat(params.get("mc_gross") || "0")
    const txnId = params.get("txn_id")

    if (!account || !amount || !txnId) {
      return NextResponse.json({ success: false, error: "Datos de IPN incompletos" }, { status: 400 })
    }

    const pool = await connectToDB()

    const configResult = await pool.request().query(`
      SELECT TOP 1 * FROM WEBENGINE_CREDITS_CONFIG
      WHERE config_display = 1
    `)

    if (configResult.recordset.length === 0) {
      return NextResponse.json({ success: false, error: "Configuración de créditos no encontrada" }, { status: 500 })
    }

    const config = configResult.recordset[0]
    const credits = Math.floor(amount * 1000) // ejemplo: 1 USD = 1000 WCoinC

    await pool
      .request()
      .input("account", account)
      .input("credits", credits)
      .query(`
        UPDATE ${config.config_table}
        SET ${config.config_credits_col} = ${config.config_credits_col} + @credits
        WHERE ${config.config_user_col} = @account
      `)

    await pool
      .request()
      .input("account", account)
      .input("txnId", txnId)
      .input("amount", amount)
      .query(`
        INSERT INTO WEBENGINE_PAYPAL_LOGS (account, txn_id, amount, timestamp)
        VALUES (@account, @txnId, @amount, GETDATE())
      `)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PAYPAL IPN ERROR]", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
