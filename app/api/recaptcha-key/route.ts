import { NextResponse } from "next/server"
import { getRecaptchaConfig } from "@/lib/actions"

export async function GET() {
  const config = await getRecaptchaConfig()
  return NextResponse.json(config)
}
