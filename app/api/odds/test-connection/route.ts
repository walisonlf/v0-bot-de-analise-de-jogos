import { NextResponse } from "next/server"
import { env } from "@/lib/env-validator"

export async function GET() {
  try {
    const oddsApiKey = env.get("ODDS_API_KEY")

    if (!oddsApiKey) {
      return NextResponse.json({
        success: false,
        error: "ODDS_API_KEY not configured",
      })
    }

    console.log("Testing The Odds API connection...")

    // Test sports endpoint
    const sportsResponse = await fetch(`https://api.the-odds-api.com/v4/sports?apiKey=${oddsApiKey}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Football-Betting-Bot/1.0",
      },
    })

    console.log("Sports API response status:", sportsResponse.status)

    if (!sportsResponse.ok) {
      const errorText = await sportsResponse.text()
      let errorMessage = `HTTP ${sportsResponse.status}`

      try {
        const errorData = JSON.parse(errorText)
        if (errorData.message) {
          errorMessage += `: ${errorData.message}`
        }
      } catch {
        errorMessage += `: ${errorText}`
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
      })
    }

    const sportsData = await sportsResponse.json()

    if (!Array.isArray(sportsData)) {
      return NextResponse.json({
        success: false,
        error: "Invalid response format from API",
      })
    }

    // Get rate limiting info
    const remainingRequests = sportsResponse.headers.get("x-requests-remaining")
    const requestsUsed = sportsResponse.headers.get("x-requests-used")

    // Find football/soccer sports
    const footballSports = sportsData.filter(
      (sport) =>
        sport.key.includes("soccer") ||
        sport.key.includes("football") ||
        sport.title.toLowerCase().includes("football") ||
        sport.title.toLowerCase().includes("soccer"),
    )

    // Test odds endpoint with a sample sport
    let oddsTest = null
    if (footballSports.length > 0) {
      const sampleSport = footballSports[0]
      try {
        console.log(`Testing odds for sport: ${sampleSport.key}`)
        const oddsResponse = await fetch(
          `https://api.the-odds-api.com/v4/sports/${sampleSport.key}/odds?apiKey=${oddsApiKey}&regions=eu&markets=h2h&oddsFormat=decimal&bookmakers=bet365`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "Football-Betting-Bot/1.0",
            },
          },
        )

        if (oddsResponse.ok) {
          const oddsData = await oddsResponse.json()
          oddsTest = {
            sport: sampleSport.key,
            gamesFound: Array.isArray(oddsData) ? oddsData.length : 0,
            success: true,
          }
        } else {
          oddsTest = {
            sport: sampleSport.key,
            success: false,
            error: `HTTP ${oddsResponse.status}`,
          }
        }
      } catch (error) {
        oddsTest = {
          sport: sampleSport.key,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "The Odds API connection successful",
      apiInfo: {
        remainingRequests: remainingRequests ? Number.parseInt(remainingRequests) : null,
        requestsUsed: requestsUsed ? Number.parseInt(requestsUsed) : null,
        totalSports: sportsData.length,
        footballSports: footballSports.length,
      },
      availableSports: sportsData.slice(0, 10).map((sport) => ({
        key: sport.key,
        title: sport.title,
        active: sport.active,
        hasOutrights: sport.has_outrights,
      })),
      footballSports: footballSports.slice(0, 5).map((sport) => ({
        key: sport.key,
        title: sport.title,
        active: sport.active,
      })),
      oddsTest,
    })
  } catch (error) {
    console.error("Odds API test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
