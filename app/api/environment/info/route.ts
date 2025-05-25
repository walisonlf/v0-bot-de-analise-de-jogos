import { NextResponse } from "next/server"
import { env } from "@/lib/env-validator"

export async function GET() {
  try {
    const envInfo = env.getEnvironmentInfo()
    return NextResponse.json(envInfo)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get environment info",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
