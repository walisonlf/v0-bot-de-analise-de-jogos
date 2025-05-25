import { type NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!

interface BettingSuggestion {
  game_id: string
  home_team: string
  away_team: string
  league: string
  market: string
  selection: string
  odds: number
  value: number
  confidence: number
  bookmaker: string
  commence_time: string
  analysis?: {
    home_form?: string[]
    away_form?: string[]
    head_to_head?: any[]
    key_stats?: any
    injury_report?: string[]
  }
}

function formatAdvancedSuggestion(suggestion: BettingSuggestion): string {
  const gameTime = new Date(suggestion.commence_time).toLocaleString("pt-BR")
  const stars = "⭐".repeat(Math.min(Math.floor(suggestion.confidence * 5), 5))
  const leagueName = suggestion.league.replace("soccer_", "").replace("_", " ").toUpperCase()

  // Emojis baseados no tipo de aposta
  const marketEmojis: { [key: string]: string } = {
    "1X2": "⚽",
    "Over/Under": "🎯",
    Handicap: "📊",
    "Both Teams Score": "🥅",
  }

  const emoji = marketEmojis[suggestion.market] || "💰"

  // Análise de valor
  let valueAnalysis = ""
  if (suggestion.value > 0.15) {
    valueAnalysis = "🔥 VALOR EXCEPCIONAL"
  } else if (suggestion.value > 0.1) {
    valueAnalysis = "🚀 ALTO VALOR"
  } else if (suggestion.value > 0.05) {
    valueAnalysis = "✨ BOM VALOR"
  }

  // Nível de confiança
  let confidenceLevel = ""
  if (suggestion.confidence > 0.9) {
    confidenceLevel = "🎯 CONFIANÇA MÁXIMA"
  } else if (suggestion.confidence > 0.8) {
    confidenceLevel = "💪 ALTA CONFIANÇA"
  } else if (suggestion.confidence > 0.7) {
    confidenceLevel = "👍 BOA CONFIANÇA"
  }

  let message = `
${emoji} <b>SUGESTÃO DE APOSTA PREMIUM</b> ${emoji}

🏆 <b>Liga:</b> ${leagueName}
⚽ <b>Confronto:</b> ${suggestion.home_team} vs ${suggestion.away_team}
🕐 <b>Horário:</b> ${gameTime}

💡 <b>Aposta Sugerida:</b>
🎯 <b>Mercado:</b> ${suggestion.market}
🎪 <b>Seleção:</b> ${suggestion.selection}
💰 <b>Melhor Odd:</b> ${suggestion.odds.toFixed(2)} (${suggestion.bookmaker})

📊 <b>Análise Estatística:</b>
• <b>Value Betting:</b> ${(suggestion.value * 100).toFixed(2)}% ${valueAnalysis}
• <b>Confiança:</b> ${(suggestion.confidence * 100).toFixed(1)}% ${stars}
• <b>Probabilidade Calculada:</b> ${((1 / suggestion.odds) * (1 + suggestion.value) * 100).toFixed(1)}%
• <b>Probabilidade Implícita:</b> ${((1 / suggestion.odds) * 100).toFixed(1)}%

${confidenceLevel}
  `

  // Adicionar análise detalhada se disponível
  if (suggestion.analysis) {
    message += `\n📈 <b>Análise Detalhada:</b>\n`

    if (suggestion.analysis.home_form) {
      message += `🏠 <b>Forma Casa:</b> ${suggestion.analysis.home_form.join(" ")}\n`
    }

    if (suggestion.analysis.away_form) {
      message += `✈️ <b>Forma Fora:</b> ${suggestion.analysis.away_form.join(" ")}\n`
    }

    if (suggestion.analysis.key_stats) {
      message += `📊 <b>Estatísticas Chave:</b>\n`
      Object.entries(suggestion.analysis.key_stats).forEach(([key, value]) => {
        message += `• ${key}: ${value}\n`
      })
    }

    if (suggestion.analysis.injury_report && suggestion.analysis.injury_report.length > 0) {
      message += `🏥 <b>Lesões:</b> ${suggestion.analysis.injury_report.join(", ")}\n`
    }
  }

  message += `
🎲 <b>Gestão de Banca:</b>
• <b>Stake Sugerido:</b> ${suggestion.confidence > 0.8 ? "2-3%" : "1-2%"} da banca
• <b>Retorno Potencial:</b> ${((suggestion.odds - 1) * 100).toFixed(0)}%

⚠️ <b>Disclaimer:</b> <i>Esta é uma sugestão baseada em análise estatística automatizada. Aposte sempre com responsabilidade e dentro de suas possibilidades financeiras.</i>

🤖 <i>Análise gerada em ${new Date().toLocaleString("pt-BR")}</i>
  `

  return message.trim()
}

export async function POST(request: NextRequest) {
  try {
    const suggestion: BettingSuggestion = await request.json()

    const message = formatAdvancedSuggestion(suggestion)

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📊 Ver Mais Detalhes", callback_data: `details_${suggestion.game_id}` },
              { text: "🎯 Outras Oportunidades", callback_data: "more_opportunities" },
            ],
            [
              { text: "📈 Estatísticas", callback_data: "stats" },
              { text: "⚙️ Configurações", callback_data: "settings" },
            ],
          ],
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message_id: result.result.message_id,
      suggestion_sent: true,
    })
  } catch (error) {
    console.error("Error sending suggestion:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
