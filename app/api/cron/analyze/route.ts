import { NextResponse } from "next/server"

// Esta função será chamada pelo Vercel Cron
export async function GET() {
  try {
    console.log("⏰ Cron job iniciado - Análise automática")

    // Chamar a API de análise
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const response = await fetch(`${baseUrl}/api/bot/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Adicionar header de autenticação se necessário
        Authorization: `Bearer ${process.env.CRON_SECRET || "cron-secret"}`,
      },
    })

    const result = await response.json()

    if (result.success) {
      console.log("✅ Análise automática concluída:", result)
      return NextResponse.json({
        success: true,
        message: "Automated analysis completed",
        result,
      })
    } else {
      console.error("❌ Erro na análise automática:", result)
      return NextResponse.json(
        {
          success: false,
          error: "Analysis failed",
          details: result,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Erro no cron job:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Também permitir POST para testes manuais
export async function POST() {
  return GET()
}
