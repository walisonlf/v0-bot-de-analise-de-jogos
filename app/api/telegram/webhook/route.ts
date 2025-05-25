import { type NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!

async function sendTelegramMessage(text: string, parseMode = "HTML") {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: parseMode,
      }),
    })

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending Telegram message:", error)
    throw error
  }
}

function formatOpportunityMessage(opportunity: any) {
  const gameTime = new Date(opportunity.commence_time).toLocaleString("pt-BR")
  const stars = "⭐".repeat(Math.min(Math.floor(opportunity.confidence * 5), 5))
  const leagueName = opportunity.league.replace("soccer_", "").replace("_", " ").toUpperCase()

  return `
⚽ <b>NOVA OPORTUNIDADE DETECTADA!</b> ⚽

🏆 <b>Liga:</b> ${leagueName}
⚽ <b>Jogo:</b> ${opportunity.home_team} vs ${opportunity.away_team}
🕐 <b>Horário:</b> ${gameTime}

💡 <b>Mercado:</b> ${opportunity.market}
🎯 <b>Seleção:</b> ${opportunity.selection}
💰 <b>Odd:</b> ${opportunity.odds} (${opportunity.bookmaker})

📊 <b>Análise:</b>
• Valor Detectado: ${(opportunity.value * 100).toFixed(2)}%
• Confiança: ${(opportunity.confidence * 100).toFixed(1)}% ${stars}

⚠️ <i>Aposte com responsabilidade. Esta é uma sugestão automatizada.</i>
  `.trim()
}

function formatBotStatusMessage(status: any) {
  const statusEmoji = {
    online: "🟢",
    offline: "🔴",
    analyzing: "🔵",
  }

  const lastAnalysis = status.last_analysis ? new Date(status.last_analysis).toLocaleString("pt-BR") : "Nunca"

  return `
🤖 <b>STATUS DO BOT ATUALIZADO</b>

${statusEmoji[status.status as keyof typeof statusEmoji]} <b>Status:</b> ${status.status.toUpperCase()}

📊 <b>Estatísticas de Hoje:</b>
• Jogos Analisados: ${status.games_analyzed_today || 0}
• Oportunidades: ${status.opportunities_found_today || 0}

🕐 <b>Última Análise:</b> ${lastAnalysis}

${status.status === "analyzing" ? "🔍 <i>Análise em andamento...</i>" : ""}
  `.trim()
}

function formatActivityMessage(activity: any) {
  const typeEmojis = {
    analysis: "🔍",
    opportunity: "💰",
    success: "✅",
    error: "❌",
    test: "🧪",
  }

  const emoji = typeEmojis[activity.type as keyof typeof typeEmojis] || "📝"

  return `
${emoji} <b>ATIVIDADE DO SISTEMA</b>

<b>Tipo:</b> ${activity.type.toUpperCase()}
<b>Mensagem:</b> ${activity.message}

🕐 <b>Horário:</b> ${new Date(activity.created_at).toLocaleString("pt-BR")}

${activity.details ? `<b>Detalhes:</b> <code>${JSON.stringify(activity.details, null, 2)}</code>` : ""}
  `.trim()
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    console.log("Webhook received:", JSON.stringify(payload, null, 2))

    // Verificar se é um webhook do Supabase
    if (!payload.table || !payload.record) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 })
    }

    const { table, type, record } = payload

    let message = ""

    switch (table) {
      case "opportunities":
        if (type === "INSERT") {
          message = formatOpportunityMessage(record)
        } else if (type === "UPDATE" && record.status !== "pending") {
          const statusEmoji = record.status === "won" ? "🎉" : record.status === "lost" ? "😞" : "⚪"
          message = `
${statusEmoji} <b>RESULTADO DA APOSTA</b>

⚽ <b>Jogo:</b> ${record.home_team} vs ${record.away_team}
🎯 <b>Seleção:</b> ${record.selection}
📊 <b>Status:</b> ${record.status.toUpperCase()}
💰 <b>Odd:</b> ${record.odds}

${record.status === "won" ? "🎉 <b>Parabéns! Aposta vencedora!</b>" : ""}
          `.trim()
        }
        break

      case "bot_status":
        if (type === "UPDATE") {
          message = formatBotStatusMessage(record)
        }
        break

      case "activity_logs":
        if (type === "INSERT" && ["error", "success"].includes(record.type)) {
          message = formatActivityMessage(record)
        }
        break

      default:
        console.log(`Unhandled table: ${table}`)
        return NextResponse.json({ message: "Table not configured for notifications" })
    }

    if (message) {
      await sendTelegramMessage(message)
      console.log("Telegram message sent successfully")
    }

    return NextResponse.json({ message: "Webhook processed successfully" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Telegram webhook endpoint is active",
    timestamp: new Date().toISOString(),
  })
}
