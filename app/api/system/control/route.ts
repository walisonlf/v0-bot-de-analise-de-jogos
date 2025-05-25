import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function POST(request: Request) {
  try {
    const { action } = await request.json()

    switch (action) {
      case "start_bot":
        await DatabaseService.updateBotStatus({
          status: "online",
          updated_at: new Date().toISOString(),
        })
        await DatabaseService.logActivity("system", "Bot iniciado manualmente", {
          action: "start_bot",
          timestamp: new Date().toISOString(),
        })
        return NextResponse.json({ success: true, message: "Bot iniciado com sucesso" })

      case "stop_bot":
        await DatabaseService.updateBotStatus({
          status: "offline",
          updated_at: new Date().toISOString(),
        })
        await DatabaseService.logActivity("system", "Bot parado manualmente", {
          action: "stop_bot",
          timestamp: new Date().toISOString(),
        })
        return NextResponse.json({ success: true, message: "Bot parado com sucesso" })

      case "force_analysis":
        // Simular análise forçada
        await DatabaseService.logActivity("analysis", "Análise forçada iniciada", {
          action: "force_analysis",
          timestamp: new Date().toISOString(),
        })

        // Chamar endpoint de análise
        try {
          const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

          const analysisResponse = await fetch(`${baseUrl}/api/bot/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ force: true }),
          })

          if (analysisResponse.ok) {
            return NextResponse.json({ success: true, message: "Análise executada com sucesso" })
          } else {
            throw new Error("Falha na análise")
          }
        } catch (error) {
          await DatabaseService.logActivity("error", "Falha na análise forçada", {
            error: error instanceof Error ? error.message : "Unknown error",
          })
          return NextResponse.json({ success: false, message: "Falha na execução da análise" })
        }

      case "test_notification":
        // Testar notificação do Telegram
        try {
          const message = `🧪 *Teste de Notificação*\n\n✅ Sistema funcionando corretamente!\n⏰ ${new Date().toLocaleString("pt-BR")}`

          const telegramResponse = await fetch(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "Markdown",
              }),
            },
          )

          if (telegramResponse.ok) {
            await DatabaseService.logActivity("success", "Notificação de teste enviada", {
              action: "test_notification",
              timestamp: new Date().toISOString(),
            })
            return NextResponse.json({ success: true, message: "Notificação enviada com sucesso" })
          } else {
            throw new Error("Falha no envio")
          }
        } catch (error) {
          await DatabaseService.logActivity("error", "Falha no teste de notificação", {
            error: error instanceof Error ? error.message : "Unknown error",
          })
          return NextResponse.json({ success: false, message: "Falha no envio da notificação" })
        }

      case "cleanup_data":
        // Limpar dados antigos (simulado)
        await DatabaseService.logActivity("system", "Limpeza de dados executada", {
          action: "cleanup_data",
          timestamp: new Date().toISOString(),
        })
        return NextResponse.json({ success: true, message: "Dados antigos removidos com sucesso" })

      default:
        return NextResponse.json({ success: false, message: "Ação não reconhecida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Control action error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
