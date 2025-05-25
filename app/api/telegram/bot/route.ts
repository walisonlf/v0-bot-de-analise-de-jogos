import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      first_name: string
      username?: string
    }
    chat: {
      id: number
      type: string
    }
    date: number
    text?: string
  }
}

class TelegramBettingBot {
  private botToken: string
  private chatId: string

  constructor(botToken: string, chatId: string) {
    this.botToken = botToken
    this.chatId = chatId
  }

  async sendMessage(text: string, parseMode = "HTML", replyMarkup?: any) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: parseMode,
          reply_markup: replyMarkup,
        }),
      })

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  async handleCommand(command: string, chatId: number) {
    switch (command) {
      case "/start":
        return this.sendWelcomeMessage(chatId)
      case "/help":
        return this.sendHelpMessage(chatId)
      case "/analyze":
        return this.sendAnalysisCommand(chatId)
      case "/status":
        return this.sendStatusCommand(chatId)
      case "/opportunities":
        return this.sendOpportunitiesCommand(chatId)
      case "/stats":
        return this.sendStatsCommand(chatId)
      default:
        return this.sendUnknownCommand(chatId)
    }
  }

  async sendWelcomeMessage(chatId: number) {
    const message = `
🤖 <b>Bem-vindo ao Bot de Análise de Apostas!</b>

⚽ Sou seu assistente especializado em análise estatística de jogos de futebol e sugestões de apostas baseadas em value betting.

📊 <b>O que posso fazer:</b>
• Analisar jogos em tempo real
• Identificar oportunidades de value betting
• Enviar sugestões automáticas
• Fornecer estatísticas detalhadas
• Monitorar resultados

🎯 <b>Comandos disponíveis:</b>
/analyze - Executar análise agora
/opportunities - Ver oportunidades atuais
/status - Status do sistema
/stats - Estatísticas gerais
/help - Ajuda completa

⚠️ <b>Lembre-se:</b> Aposte com responsabilidade. Estas são sugestões baseadas em análise automatizada.
    `.trim()

    return this.sendMessageToChat(chatId, message, this.getMainKeyboard())
  }

  async sendHelpMessage(chatId: number) {
    const message = `
📚 <b>GUIA COMPLETO DO BOT</b>

🔍 <b>Análise Automática:</b>
• O bot analisa jogos a cada 12 horas
• Identifica oportunidades de value betting
• Envia sugestões automaticamente

📊 <b>Critérios de Análise:</b>
• Odds entre 1.50 e 5.00
• Value betting mínimo de 5%
• Confiança mínima de 70%
• Múltiplas casas de apostas

🎯 <b>Tipos de Apostas:</b>
• 1X2 (Resultado final)
• Over/Under 2.5 gols
• Handicap asiático
• Ambas marcam

⚙️ <b>Comandos Detalhados:</b>

/analyze - Força análise imediata
/opportunities - Lista oportunidades ativas
/status - Mostra status dos serviços
/stats - Estatísticas de performance
/help - Esta mensagem de ajuda

📈 <b>Interpretando Sugestões:</b>
• ⭐⭐⭐⭐⭐ = Confiança máxima
• Value % = Vantagem sobre a casa
• Probabilidade = Chance calculada

⚠️ <b>Disclaimer:</b>
Este bot fornece análises estatísticas para fins educacionais. Sempre aposte com responsabilidade e dentro de suas possibilidades.
    `.trim()

    return this.sendMessageToChat(chatId, message)
  }

  async sendAnalysisCommand(chatId: number) {
    try {
      // Executar análise
      const analysisResponse = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/bot/analyze`, {
        method: "POST",
      })

      if (analysisResponse.ok) {
        const result = await analysisResponse.json()
        const message = `
🔍 <b>ANÁLISE EXECUTADA!</b>

📊 <b>Resultados:</b>
• Jogos analisados: ${result.gamesAnalyzed || 0}
• Oportunidades encontradas: ${result.opportunitiesFound || 0}
• Oportunidades salvas: ${result.opportunitiesSaved || 0}

${result.opportunitiesFound > 0 ? "🎯 As melhores sugestões foram enviadas automaticamente!" : "ℹ️ Nenhuma oportunidade atende aos critérios no momento."}

⏰ Próxima análise automática em 12 horas.
        `.trim()

        return this.sendMessageToChat(chatId, message)
      } else {
        throw new Error("Falha na análise")
      }
    } catch (error) {
      const message = `
❌ <b>ERRO NA ANÁLISE</b>

🚨 Não foi possível executar a análise no momento.
🔧 Tente novamente em alguns minutos.

<code>${error}</code>
      `.trim()

      return this.sendMessageToChat(chatId, message)
    }
  }

  async sendStatusCommand(chatId: number) {
    try {
      const statusResponse = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/system/status`)
      const status = await statusResponse.json()

      const serviceStatus = (isOnline: boolean) => (isOnline ? "🟢 Online" : "🔴 Offline")

      const message = `
🤖 <b>STATUS DO SISTEMA</b>

📊 <b>Serviços:</b>
• Supabase: ${serviceStatus(status.services?.supabase)}
• Telegram: ${serviceStatus(status.services?.telegram)}
• The Odds API: ${serviceStatus(status.services?.oddsApi)}

🎯 <b>Bot Status:</b>
• Status: ${status.botStatus?.status?.toUpperCase() || "UNKNOWN"}
• Última análise: ${status.botStatus?.last_analysis ? new Date(status.botStatus.last_analysis).toLocaleString("pt-BR") : "Nunca"}

📈 <b>Estatísticas de Hoje:</b>
• Jogos analisados: ${status.botStatus?.games_analyzed_today || 0}
• Oportunidades: ${status.botStatus?.opportunities_found_today || 0}

⏰ <b>Próxima análise:</b> ${status.botStatus?.next_analysis ? new Date(status.botStatus.next_analysis).toLocaleString("pt-BR") : "Não agendada"}
      `.trim()

      return this.sendMessageToChat(chatId, message)
    } catch (error) {
      return this.sendMessageToChat(chatId, "❌ Erro ao obter status do sistema.")
    }
  }

  async sendOpportunitiesCommand(chatId: number) {
    try {
      const opportunities = await DatabaseService.getRecentOpportunities(5)

      if (!opportunities || opportunities.length === 0) {
        const message = `
📭 <b>NENHUMA OPORTUNIDADE ATIVA</b>

ℹ️ Não há oportunidades de apostas no momento que atendam aos critérios estabelecidos.

🔍 Execute /analyze para buscar novas oportunidades.
        `.trim()

        return this.sendMessageToChat(chatId, message)
      }

      let message = `🎯 <b>OPORTUNIDADES ATIVAS</b>\n\n`

      for (let i = 0; i < opportunities.length; i++) {
        const opp = opportunities[i]
        const stars = "⭐".repeat(Math.min(Math.floor(opp.confidence * 5), 5))
        const gameTime = new Date(opp.commence_time).toLocaleString("pt-BR")

        message += `
<b>${i + 1}. ${opp.home_team} vs ${opp.away_team}</b>
🏆 ${opp.league.replace("soccer_", "").replace("_", " ").toUpperCase()}
🕐 ${gameTime}
🎯 ${opp.market}: ${opp.selection}
💰 Odd: ${opp.odds} (${opp.bookmaker})
📊 Value: ${(opp.value * 100).toFixed(1)}% | Confiança: ${stars}

`
      }

      message += `⚠️ <i>Aposte com responsabilidade!</i>`

      return this.sendMessageToChat(chatId, message.trim())
    } catch (error) {
      return this.sendMessageToChat(chatId, "❌ Erro ao buscar oportunidades.")
    }
  }

  async sendStatsCommand(chatId: number) {
    try {
      const analytics = await DatabaseService.getDailyAnalytics(7) // Últimos 7 dias

      if (!analytics || analytics.length === 0) {
        return this.sendMessageToChat(chatId, "📊 Nenhuma estatística disponível ainda.")
      }

      const totalGames = analytics.reduce((sum, day) => sum + (day.games_analyzed || 0), 0)
      const totalOpportunities = analytics.reduce((sum, day) => sum + (day.opportunities_found || 0), 0)
      const avgSuccessRate = analytics.reduce((sum, day) => sum + (day.success_rate || 0), 0) / analytics.length

      const message = `
📊 <b>ESTATÍSTICAS (Últimos 7 dias)</b>

🎯 <b>Resumo Geral:</b>
• Total de jogos analisados: ${totalGames}
• Total de oportunidades: ${totalOpportunities}
• Taxa de sucesso média: ${avgSuccessRate.toFixed(1)}%
• Oportunidades por dia: ${(totalOpportunities / 7).toFixed(1)}

📈 <b>Performance Diária:</b>
${analytics
  .slice(-5)
  .map((day) => {
    const date = new Date(day.date).toLocaleDateString("pt-BR")
    return `• ${date}: ${day.games_analyzed || 0} jogos, ${day.opportunities_found || 0} oportunidades`
  })
  .join("\n")}

🏆 <b>Melhor dia:</b> ${analytics.reduce((best, day) => (day.opportunities_found > best.opportunities_found ? day : best)).date}

💡 <b>Dica:</b> Use /opportunities para ver as oportunidades atuais.
      `.trim()

      return this.sendMessageToChat(chatId, message)
    } catch (error) {
      return this.sendMessageToChat(chatId, "❌ Erro ao buscar estatísticas.")
    }
  }

  async sendUnknownCommand(chatId: number) {
    const message = `
❓ <b>Comando não reconhecido</b>

📚 Use /help para ver todos os comandos disponíveis.

🎯 <b>Comandos principais:</b>
• /analyze - Executar análise
• /opportunities - Ver oportunidades
• /status - Status do sistema
• /stats - Estatísticas
    `.trim()

    return this.sendMessageToChat(chatId, message, this.getMainKeyboard())
  }

  async sendMessageToChat(chatId: number, text: string, replyMarkup?: any) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          reply_markup: replyMarkup,
        }),
      })

      return await response.json()
    } catch (error) {
      console.error("Error sending message to chat:", error)
      throw error
    }
  }

  getMainKeyboard() {
    return {
      keyboard: [
        [{ text: "🔍 Analisar Agora" }, { text: "🎯 Oportunidades" }],
        [{ text: "📊 Status" }, { text: "📈 Estatísticas" }],
        [{ text: "❓ Ajuda" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()
    console.log("Telegram webhook received:", JSON.stringify(update, null, 2))

    if (!update.message || !update.message.text) {
      return NextResponse.json({ ok: true })
    }

    const bot = new TelegramBettingBot(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
    const message = update.message
    const chatId = message.chat.id
    const text = message.text

    // Log da atividade
    await DatabaseService.logActivity("telegram", `Comando recebido: ${text}`, {
      user_id: message.from.id,
      username: message.from.username,
      chat_id: chatId,
    })

    // Processar comandos
    if (text.startsWith("/")) {
      const command = text.split(" ")[0].toLowerCase()
      await bot.handleCommand(command, chatId)
    } else {
      // Processar texto livre (pode implementar NLP aqui)
      const lowerText = text.toLowerCase()

      if (lowerText.includes("analisar") || lowerText.includes("análise")) {
        await bot.handleCommand("/analyze", chatId)
      } else if (lowerText.includes("oportunidade") || lowerText.includes("aposta")) {
        await bot.handleCommand("/opportunities", chatId)
      } else if (lowerText.includes("status") || lowerText.includes("estado")) {
        await bot.handleCommand("/status", chatId)
      } else if (lowerText.includes("estatística") || lowerText.includes("stats")) {
        await bot.handleCommand("/stats", chatId)
      } else if (lowerText.includes("ajuda") || lowerText.includes("help")) {
        await bot.handleCommand("/help", chatId)
      } else {
        await bot.sendUnknownCommand(chatId)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Telegram bot webhook endpoint",
    status: "Active",
    timestamp: new Date().toISOString(),
  })
}
