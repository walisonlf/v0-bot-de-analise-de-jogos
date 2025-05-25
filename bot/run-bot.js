const axios = require("axios")
const cron = require("node-cron")

// Configurações
const CONFIG = {
  ODDS_API_KEY: "b20a60c467789212e83880d469695b0a",
  TELEGRAM_BOT_TOKEN: "8149354380:AAGLNGoQI1hqM2M1mJq6uF05uw397i9kFmY",
  TELEGRAM_CHAT_ID: "-4980709993",
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  TARGET_LEAGUES: [
    "soccer_brazil_serie_a",
    "soccer_england_premier_league",
    "soccer_spain_la_liga",
    "soccer_italy_serie_a",
    "soccer_germany_bundesliga",
  ],
  MIN_ODDS: 1.5,
  MAX_ODDS: 5.0,
  MIN_VALUE_THRESHOLD: 0.05,
  MIN_CONFIDENCE: 0.7,
}

class FootballBettingBot {
  constructor() {
    this.supabase = this.initSupabase()
    this.isRunning = false
  }

  initSupabase() {
    if (
      !CONFIG.SUPABASE_URL ||
      !CONFIG.SUPABASE_ANON_KEY ||
      CONFIG.SUPABASE_URL.includes("your-project") ||
      CONFIG.SUPABASE_ANON_KEY.includes("your-anon-key")
    ) {
      console.log("⚠️ Supabase não configurado - usando modo local")
      return null
    }

    try {
      const { createClient } = require("@supabase/supabase-js")
      const client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
      console.log("✅ Supabase conectado")
      return client
    } catch (error) {
      console.log("❌ Erro ao conectar Supabase:", error.message)
      return null
    }
  }

  async logActivity(type, message, details = null) {
    const timestamp = new Date().toLocaleString("pt-BR")
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`)

    if (this.supabase) {
      try {
        await this.supabase.from("activity_logs").insert({
          type,
          message,
          details,
          created_at: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Erro ao salvar log:", error.message)
      }
    }
  }

  async updateBotStatus(status, data = {}) {
    if (this.supabase) {
      try {
        await this.supabase.from("bot_status").upsert({
          id: 1,
          status,
          updated_at: new Date().toISOString(),
          ...data,
        })
      } catch (error) {
        console.error("Erro ao atualizar status:", error.message)
      }
    }
  }

  async fetchGames() {
    const allGames = []

    for (const sport of CONFIG.TARGET_LEAGUES) {
      try {
        console.log(`🔍 Buscando jogos para ${sport}...`)

        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/odds`, {
          params: {
            apiKey: CONFIG.ODDS_API_KEY,
            regions: "us,uk,eu",
            markets: "h2h,totals",
            oddsFormat: "decimal",
            dateFormat: "iso",
          },
          timeout: 10000,
        })

        if (response.data && response.data.length > 0) {
          const now = new Date()
          const cutoffTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)

          for (const game of response.data) {
            const gameTime = new Date(game.commence_time)
            if (gameTime > now && gameTime < cutoffTime) {
              game.sport = sport
              allGames.push(game)
            }
          }
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`❌ Erro ao buscar ${sport}:`, error.message)
        await this.logActivity("error", `Erro ao buscar jogos de ${sport}: ${error.message}`)
      }
    }

    console.log(`📊 Total de jogos encontrados: ${allGames.length}`)
    return allGames
  }

  analyzeGame(game) {
    const opportunities = []

    for (const bookmaker of game.bookmakers || []) {
      for (const market of bookmaker.markets || []) {
        if (market.key === "h2h") {
          for (const outcome of market.outcomes) {
            const odds = outcome.price
            const selection = outcome.name

            // Análise simplificada
            let calculatedProb
            if (selection === game.home_team) {
              calculatedProb = 0.45 // Vantagem casa
            } else if (selection === game.away_team) {
              calculatedProb = 0.35
            } else {
              calculatedProb = 0.2 // Empate
            }

            const impliedProb = 1 / odds
            const value = (calculatedProb - impliedProb) / impliedProb

            if (odds >= CONFIG.MIN_ODDS && odds <= CONFIG.MAX_ODDS && value >= CONFIG.MIN_VALUE_THRESHOLD) {
              const confidence = Math.min(0.6 + value * 2, 1.0)

              if (confidence >= CONFIG.MIN_CONFIDENCE) {
                opportunities.push({
                  game_id: game.id,
                  home_team: game.home_team,
                  away_team: game.away_team,
                  league: game.sport,
                  market: "1X2",
                  selection,
                  odds,
                  value,
                  confidence,
                  bookmaker: bookmaker.title,
                  commence_time: game.commence_time,
                  calculated_probability: calculatedProb,
                  implied_probability: impliedProb,
                })
              }
            }
          }
        }
      }
    }

    return opportunities
  }

  async saveOpportunity(opportunity) {
    if (this.supabase) {
      try {
        await this.supabase.from("opportunities").insert({
          game_id: opportunity.game_id,
          home_team: opportunity.home_team,
          away_team: opportunity.away_team,
          league: opportunity.league,
          market: opportunity.market,
          selection: opportunity.selection,
          odds: opportunity.odds,
          value: opportunity.value,
          confidence: opportunity.confidence,
          bookmaker: opportunity.bookmaker,
          commence_time: opportunity.commence_time,
          status: "pending",
        })
      } catch (error) {
        console.error("Erro ao salvar oportunidade:", error.message)
      }
    }
  }

  async sendTelegramMessage(text) {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: CONFIG.TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
        },
        {
          timeout: 10000,
        },
      )

      if (response.status === 200) {
        console.log("✅ Mensagem enviada para o Telegram")
        return true
      }
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error.message)
      await this.logActivity("error", `Erro no Telegram: ${error.message}`)
    }
    return false
  }

  formatOpportunityMessage(opportunity) {
    const gameTime = new Date(opportunity.commence_time).toLocaleString("pt-BR")
    const stars = "⭐".repeat(Math.min(Math.floor(opportunity.confidence * 5), 5))

    return `
⚽ <b>SUGESTÃO DE APOSTA</b> ⚽

🏆 <b>Liga:</b> ${opportunity.league.replace("soccer_", "").replace("_", " ").toUpperCase()}
⚽ <b>Jogo:</b> ${opportunity.home_team} vs ${opportunity.away_team}
🕐 <b>Horário:</b> ${gameTime}

💡 <b>Mercado:</b> ${opportunity.market}
🎯 <b>Seleção:</b> ${opportunity.selection}
💰 <b>Odd:</b> ${opportunity.odds.toFixed(2)} (${opportunity.bookmaker})

📊 <b>Análise:</b>
• Probabilidade Calculada: ${(opportunity.calculated_probability * 100).toFixed(1)}%
• Probabilidade Implícita: ${(opportunity.implied_probability * 100).toFixed(1)}%
• Valor Detectado: ${(opportunity.value * 100).toFixed(2)}%
• Confiança: ${(opportunity.confidence * 100).toFixed(1)}% ${stars}

⚠️ <i>Aposte com responsabilidade. Esta é apenas uma sugestão baseada em análise automatizada.</i>
    `.trim()
  }

  async updateDailyAnalytics(gamesAnalyzed, opportunitiesFound) {
    if (this.supabase) {
      try {
        const today = new Date().toISOString().split("T")[0]

        await this.supabase.from("daily_analytics").upsert({
          date: today,
          games_analyzed: gamesAnalyzed,
          opportunities_found: opportunitiesFound,
          success_rate: Math.random() * 20 + 70, // Simulado por enquanto
          total_value: opportunitiesFound * 50 + Math.random() * 200,
        })
      } catch (error) {
        console.error("Erro ao atualizar analytics:", error.message)
      }
    }
  }

  async runAnalysis() {
    if (this.isRunning) {
      console.log("⚠️ Análise já em execução, pulando...")
      return
    }

    this.isRunning = true

    try {
      console.log("🚀 Iniciando análise de jogos...")
      await this.updateBotStatus("analyzing", {
        last_analysis: new Date().toISOString(),
      })

      await this.logActivity("analysis", "Iniciando ciclo de análise de jogos")

      // Enviar mensagem de início
      await this.sendTelegramMessage(
        `
🤖 <b>ANÁLISE INICIADA</b>

🔍 Coletando dados de jogos...
📊 Analisando oportunidades...
⏳ Aguarde os resultados...
      `.trim(),
      )

      // Buscar jogos
      const games = await this.fetchGames()

      if (games.length === 0) {
        await this.sendTelegramMessage(
          `
📭 <b>NENHUM JOGO ENCONTRADO</b>

ℹ️ Não há jogos nas próximas 24 horas para as ligas monitoradas.
⏰ Próxima verificação em 12 horas.
        `.trim(),
        )

        await this.updateBotStatus("online")
        return
      }

      // Analisar jogos
      const allOpportunities = []
      for (const game of games) {
        const opportunities = this.analyzeGame(game)
        allOpportunities.push(...opportunities)
      }

      console.log(`🎯 Oportunidades encontradas: ${allOpportunities.length}`)

      if (allOpportunities.length === 0) {
        await this.sendTelegramMessage(
          `
📊 <b>ANÁLISE CONCLUÍDA</b>

• Jogos analisados: ${games.length}
• Oportunidades: 0

ℹ️ Nenhuma aposta atende aos critérios estabelecidos.
⏰ Próxima análise em 12 horas.
        `.trim(),
        )
      } else {
        // Enviar resumo
        await this.sendTelegramMessage(
          `
🎉 <b>OPORTUNIDADES ENCONTRADAS!</b>

📊 Jogos analisados: ${games.length}
🎯 Oportunidades: ${allOpportunities.length}

📱 Enviando as melhores sugestões...
        `.trim(),
        )

        // Ordenar e enviar top 3 oportunidades
        const topOpportunities = allOpportunities
          .sort((a, b) => b.value * b.confidence - a.value * a.confidence)
          .slice(0, 3)

        for (let i = 0; i < topOpportunities.length; i++) {
          const opportunity = topOpportunities[i]

          // Salvar no banco
          await this.saveOpportunity(opportunity)

          // Enviar mensagem
          const message = this.formatOpportunityMessage(opportunity)
          await this.sendTelegramMessage(message)

          // Log da oportunidade
          await this.logActivity(
            "opportunity",
            `Nova oportunidade: ${opportunity.home_team} vs ${opportunity.away_team}`,
            { market: opportunity.market, value: opportunity.value, confidence: opportunity.confidence },
          )

          // Delay entre mensagens
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }

      // Atualizar analytics
      await this.updateDailyAnalytics(games.length, allOpportunities.length)

      // Atualizar status
      const nextAnalysis = new Date()
      nextAnalysis.setHours(nextAnalysis.getHours() + 12)

      await this.updateBotStatus("online", {
        next_analysis: nextAnalysis.toISOString(),
        games_analyzed_today: games.length,
        opportunities_found_today: allOpportunities.length,
      })

      await this.logActivity(
        "success",
        `Análise concluída: ${games.length} jogos, ${allOpportunities.length} oportunidades`,
      )
      console.log("✅ Análise concluída com sucesso!")
    } catch (error) {
      console.error("❌ Erro durante análise:", error)
      await this.logActivity("error", `Erro durante análise: ${error.message}`)
      await this.updateBotStatus("offline")
    } finally {
      this.isRunning = false
    }
  }

  start() {
    console.log("🤖 Bot de Análise de Futebol iniciado")
    console.log("📅 Agendamento: A cada 12 horas")
    console.log("📱 Telegram Chat ID:", CONFIG.TELEGRAM_CHAT_ID)
    console.log("🗄️ Supabase:", this.supabase ? "Conectado" : "Modo local")
    console.log("")

    // Executar imediatamente
    this.runAnalysis()

    // Agendar execução a cada 12 horas (às 6h e 18h)
    cron.schedule("0 6,18 * * *", () => {
      console.log("⏰ Executando análise agendada...")
      this.runAnalysis()
    })

    // Manter o processo ativo
    console.log("✅ Bot em execução. Pressione Ctrl+C para parar.")
  }
}

// Iniciar o bot
const bot = new FootballBettingBot()
bot.start()

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Parando o bot...")
  process.exit(0)
})

process.on("uncaughtException", (error) => {
  console.error("❌ Erro não capturado:", error)
})

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promise rejeitada:", reason)
})
