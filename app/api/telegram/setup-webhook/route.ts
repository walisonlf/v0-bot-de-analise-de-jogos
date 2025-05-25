import { NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

export async function POST() {
  try {
    const webhookUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/api/telegram/bot`

    // Configurar webhook
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message"],
        drop_pending_updates: true,
      }),
    })

    const result = await response.json()

    if (result.ok) {
      // Configurar comandos do bot
      const commandsResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commands: [
            { command: "start", description: "Iniciar o bot" },
            { command: "help", description: "Ajuda e comandos" },
            { command: "analyze", description: "Executar análise agora" },
            { command: "opportunities", description: "Ver oportunidades atuais" },
            { command: "status", description: "Status do sistema" },
            { command: "stats", description: "Estatísticas de performance" },
          ],
        }),
      })

      const commandsResult = await commandsResponse.json()

      return NextResponse.json({
        success: true,
        webhook: result,
        commands: commandsResult,
        webhookUrl,
      })
    } else {
      throw new Error(result.description || "Failed to set webhook")
    }
  } catch (error) {
    console.error("Webhook setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Verificar status do webhook
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`)
    const result = await response.json()

    return NextResponse.json({
      webhookInfo: result.result,
      isConfigured: !!result.result?.url,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get webhook info" }, { status: 500 })
  }
}
