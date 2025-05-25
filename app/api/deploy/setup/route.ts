import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST() {
  try {
    console.log("🚀 Iniciando configuração pós-deploy...")

    // 1. Verificar variáveis de ambiente
    const requiredEnvs = {
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
      ODDS_API_KEY: process.env.ODDS_API_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    const missingEnvs = Object.entries(requiredEnvs)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingEnvs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing environment variables",
          missing: missingEnvs,
        },
        { status: 400 },
      )
    }

    // 2. Testar conexão com Supabase
    try {
      const botStatus = await DatabaseService.getBotStatus()
      console.log("✅ Supabase conectado:", !!botStatus)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase connection failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    // 3. Testar conexão com Telegram
    try {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`)
      const telegramData = await telegramResponse.json()

      if (!telegramData.ok) {
        throw new Error("Invalid Telegram bot token")
      }

      console.log("✅ Telegram bot conectado:", telegramData.result.username)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Telegram connection failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    // 4. Testar The Odds API
    try {
      const oddsResponse = await fetch(`https://api.the-odds-api.com/v4/sports?apiKey=${process.env.ODDS_API_KEY}`)
      const oddsData = await oddsResponse.json()

      if (!Array.isArray(oddsData)) {
        throw new Error("Invalid Odds API key")
      }

      console.log("✅ The Odds API conectada:", oddsData.length, "esportes disponíveis")
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Odds API connection failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    // 5. Atualizar status do bot
    await DatabaseService.updateBotStatus({
      status: "online",
      updated_at: new Date().toISOString(),
    })

    // 6. Log de deploy bem-sucedido
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://your-app.vercel.app"
        : "http://localhost:3000"

    await DatabaseService.logActivity("deploy", "Sistema implantado com sucesso na Vercel", {
      timestamp: new Date().toISOString(),
      environment: "production",
      webhook_url: `${baseUrl}/api/telegram/webhook`,
    })

    // 7. Enviar notificação de deploy para Telegram
    const deployMessage = `
🚀 <b>SISTEMA IMPLANTADO COM SUCESSO!</b>

✅ <b>Status:</b> Todos os serviços conectados
🌐 <b>URL:</b> ${baseUrl}
🤖 <b>Bot:</b> Online e pronto para análises
📊 <b>Banco:</b> Supabase conectado
📱 <b>Telegram:</b> Notificações ativas

🔗 <b>Webhook URL:</b>
<code>${baseUrl}/api/telegram/webhook</code>

⚡ Sistema totalmente automatizado e funcional!
    `.trim()

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: deployMessage,
        parse_mode: "HTML",
      }),
    })

    return NextResponse.json({
      success: true,
      message: "Deploy setup completed successfully",
      services: {
        supabase: "✅ Connected",
        telegram: "✅ Connected",
        oddsApi: "✅ Connected",
      },
      webhookUrl: `${baseUrl}/api/telegram/webhook`,
    })
  } catch (error) {
    console.error("❌ Erro no setup:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Setup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Deploy setup endpoint",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}
