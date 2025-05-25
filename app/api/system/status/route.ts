import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"
import { env } from "@/lib/env-validator"

export async function GET() {
  try {
    const envInfo = env.getEnvironmentInfo()

    // Verificar status de todos os serviços
    const systemStatus = {
      timestamp: new Date().toISOString(),
      services: {
        supabase: false,
        telegram: false,
        oddsApi: false,
        cronJobs: true,
      },
      botStatus: { status: "offline" },
      lastAnalysis: null,
      totalOpportunities: 0,
      recentActivity: [],
      environment: {
        nodeEnv: envInfo.nodeEnv,
        vercelUrl: envInfo.hasVercelUrl ? env.get("VERCEL_URL") : "localhost:3000",
        hasAllEnvVars: envInfo.validation.overall.valid,
        baseUrl: envInfo.baseUrl,
        webhookUrl: envInfo.webhookUrl,
      },
      serviceDetails: {
        telegram: { error: null, lastCheck: null },
        oddsApi: { error: null, lastCheck: null, remainingRequests: null },
      },
    }

    // Testar Supabase apenas se configurado
    if (envInfo.validation.supabase.valid) {
      try {
        const botStatus = await DatabaseService.getBotStatus()
        systemStatus.services.supabase = true
        systemStatus.botStatus = botStatus || { status: "offline" }

        const opportunities = await DatabaseService.getRecentOpportunities(10)
        systemStatus.totalOpportunities = opportunities?.length || 0
        systemStatus.lastAnalysis = opportunities?.[0]?.created_at || null

        const activity = await DatabaseService.getActivityLogs(5)
        systemStatus.recentActivity = activity || []
      } catch (error) {
        console.error("Supabase error:", error)
      }
    }

    // Testar Telegram com timeout e retry
    if (envInfo.validation.telegram.valid) {
      const telegramToken = env.get("TELEGRAM_BOT_TOKEN")
      if (telegramToken) {
        try {
          console.log("Testing Telegram connection...")

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

          const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/getMe`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "Football-Betting-Bot/1.0",
            },
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (telegramResponse.ok) {
            const telegramData = await telegramResponse.json()
            console.log("Telegram response:", telegramData)

            if (telegramData.ok && telegramData.result) {
              systemStatus.services.telegram = true
              systemStatus.serviceDetails.telegram = {
                error: null,
                lastCheck: new Date().toISOString(),
                botInfo: {
                  username: telegramData.result.username,
                  firstName: telegramData.result.first_name,
                  canJoinGroups: telegramData.result.can_join_groups,
                  canReadAllGroupMessages: telegramData.result.can_read_all_group_messages,
                },
              }
            } else {
              systemStatus.serviceDetails.telegram.error = "Invalid bot token or bot not found"
            }
          } else {
            const errorText = await telegramResponse.text()
            console.error("Telegram API error:", telegramResponse.status, errorText)
            systemStatus.serviceDetails.telegram.error = `HTTP ${telegramResponse.status}: ${errorText}`
          }
        } catch (error) {
          console.error("Telegram connection error:", error)
          systemStatus.serviceDetails.telegram.error = error instanceof Error ? error.message : "Connection failed"
        }
      }
    }

    // Testar The Odds API com timeout e informações detalhadas
    if (envInfo.validation.oddsApi.valid) {
      const oddsApiKey = env.get("ODDS_API_KEY")
      if (oddsApiKey) {
        try {
          console.log("Testing The Odds API connection...")

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

          const oddsResponse = await fetch(`https://api.the-odds-api.com/v4/sports?apiKey=${oddsApiKey}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "Football-Betting-Bot/1.0",
            },
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          console.log("Odds API response status:", oddsResponse.status)
          console.log("Odds API headers:", Object.fromEntries(oddsResponse.headers.entries()))

          if (oddsResponse.ok) {
            const oddsData = await oddsResponse.json()
            console.log("Odds API data length:", oddsData?.length)

            if (Array.isArray(oddsData) && oddsData.length > 0) {
              systemStatus.services.oddsApi = true

              // Extrair informações dos headers de rate limiting
              const remainingRequests = oddsResponse.headers.get("x-requests-remaining")
              const requestsUsed = oddsResponse.headers.get("x-requests-used")

              systemStatus.serviceDetails.oddsApi = {
                error: null,
                lastCheck: new Date().toISOString(),
                remainingRequests: remainingRequests ? Number.parseInt(remainingRequests) : null,
                requestsUsed: requestsUsed ? Number.parseInt(requestsUsed) : null,
                availableSports: oddsData.length,
                sampleSports: oddsData.slice(0, 3).map((sport) => ({
                  key: sport.key,
                  title: sport.title,
                  active: sport.active,
                })),
              }
            } else {
              systemStatus.serviceDetails.oddsApi.error = "No sports data available"
            }
          } else {
            const errorText = await oddsResponse.text()
            console.error("Odds API error:", oddsResponse.status, errorText)

            let errorMessage = `HTTP ${oddsResponse.status}`

            // Parse specific error messages
            try {
              const errorData = JSON.parse(errorText)
              if (errorData.message) {
                errorMessage += `: ${errorData.message}`
              }
            } catch {
              errorMessage += `: ${errorText}`
            }

            systemStatus.serviceDetails.oddsApi.error = errorMessage
          }
        } catch (error) {
          console.error("Odds API connection error:", error)
          systemStatus.serviceDetails.oddsApi.error = error instanceof Error ? error.message : "Connection failed"
        }
      }
    }

    return NextResponse.json(systemStatus)
  } catch (error) {
    console.error("System status error:", error)

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      services: {
        supabase: false,
        telegram: false,
        oddsApi: false,
        cronJobs: false,
      },
      botStatus: { status: "offline" },
      lastAnalysis: null,
      totalOpportunities: 0,
      recentActivity: [],
      environment: {
        nodeEnv: env.get("NODE_ENV") || "development",
        vercelUrl: env.get("VERCEL_URL") || "localhost:3000",
        hasAllEnvVars: false,
        baseUrl: env.getBaseUrl(),
        webhookUrl: env.getWebhookUrl(),
      },
      error: "Failed to get system status",
      details: error instanceof Error ? error.message : "Unknown error",
      serviceDetails: {
        telegram: { error: "System error", lastCheck: null },
        oddsApi: { error: "System error", lastCheck: null },
      },
    })
  }
}
