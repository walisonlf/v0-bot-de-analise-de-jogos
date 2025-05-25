import { supabase, type BotStatus, type Opportunity, type DailyAnalytics, type ActivityLog } from "./supabase-client"

export class DatabaseService {
  // Check if Supabase is available
  private static isSupabaseAvailable(): boolean {
    return supabase !== null
  }

  // Bot Status Operations
  static async getBotStatus(): Promise<BotStatus | null> {
    if (!this.isSupabaseAvailable()) {
      console.log("Using mock bot status - Supabase not configured")
      return {
        id: 1,
        status: "online",
        last_analysis: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        next_analysis: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
        games_analyzed_today: 12,
        opportunities_found_today: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    const { data, error } = await supabase!.from("bot_status").select("*").eq("id", 1).single()

    if (error) {
      console.error("Error fetching bot status:", error)
      return null
    }

    return data
  }

  static async updateBotStatus(updates: Partial<BotStatus>): Promise<boolean> {
    if (!this.isSupabaseAvailable()) {
      console.log("Mock: Bot status updated")
      return true
    }

    const { error } = await supabase!.from("bot_status").upsert({ id: 1, ...updates })

    if (error) {
      console.error("Error updating bot status:", error)
      return false
    }

    return true
  }

  // Opportunities Operations
  static async getRecentOpportunities(limit = 10): Promise<Opportunity[]> {
    if (!this.isSupabaseAvailable()) {
      console.log("Using mock opportunities - Supabase not configured")
      return [
        {
          id: "1",
          game_id: "mock_1",
          home_team: "Manchester City",
          away_team: "Liverpool",
          league: "soccer_england_premier_league",
          market: "1X2",
          selection: "Manchester City",
          odds: 2.1,
          value: 0.085,
          confidence: 0.75,
          bookmaker: "Bet365",
          commence_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          game_id: "mock_2",
          home_team: "Barcelona",
          away_team: "Real Madrid",
          league: "soccer_spain_la_liga",
          market: "Over/Under",
          selection: "Over 2.5",
          odds: 1.85,
          value: 0.12,
          confidence: 0.82,
          bookmaker: "Betfair",
          commence_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]
    }

    const { data, error } = await supabase!
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching opportunities:", error)
      return []
    }

    return data || []
  }

  static async createOpportunity(opportunity: Omit<Opportunity, "id" | "created_at">): Promise<string | null> {
    if (!this.isSupabaseAvailable()) {
      console.log("Mock: Opportunity created")
      return "mock_id_" + Date.now()
    }

    const { data, error } = await supabase!.from("opportunities").insert(opportunity).select("id").single()

    if (error) {
      console.error("Error creating opportunity:", error)
      return null
    }

    return data.id
  }

  static async updateOpportunityStatus(id: string, status: Opportunity["status"]): Promise<boolean> {
    if (!this.isSupabaseAvailable()) {
      console.log("Mock: Opportunity status updated")
      return true
    }

    const { error } = await supabase!.from("opportunities").update({ status }).eq("id", id)

    if (error) {
      console.error("Error updating opportunity status:", error)
      return false
    }

    return true
  }

  // Analytics Operations
  static async getDailyAnalytics(days = 7): Promise<DailyAnalytics[]> {
    if (!this.isSupabaseAvailable()) {
      console.log("Using mock analytics - Supabase not configured")
      return [
        {
          id: 1,
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          games_analyzed: 15,
          opportunities_found: 3,
          success_rate: 75.5,
          total_value: 245.8,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          games_analyzed: 22,
          opportunities_found: 5,
          success_rate: 82.1,
          total_value: 412.3,
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          games_analyzed: 18,
          opportunities_found: 2,
          success_rate: 68.3,
          total_value: 156.9,
          created_at: new Date().toISOString(),
        },
        {
          id: 4,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          games_analyzed: 25,
          opportunities_found: 7,
          success_rate: 89.2,
          total_value: 623.4,
          created_at: new Date().toISOString(),
        },
        {
          id: 5,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          games_analyzed: 20,
          opportunities_found: 4,
          success_rate: 76.8,
          total_value: 298.7,
          created_at: new Date().toISOString(),
        },
        {
          id: 6,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          games_analyzed: 19,
          opportunities_found: 6,
          success_rate: 91.4,
          total_value: 534.2,
          created_at: new Date().toISOString(),
        },
        {
          id: 7,
          date: new Date().toISOString().split("T")[0],
          games_analyzed: 12,
          opportunities_found: 2,
          success_rate: 85.0,
          total_value: 187.6,
          created_at: new Date().toISOString(),
        },
      ]
    }

    const { data, error } = await supabase!
      .from("daily_analytics")
      .select("*")
      .order("date", { ascending: false })
      .limit(days)

    if (error) {
      console.error("Error fetching analytics:", error)
      return []
    }

    return data || []
  }

  static async updateDailyAnalytics(date: string, analytics: Partial<DailyAnalytics>): Promise<boolean> {
    if (!this.isSupabaseAvailable()) {
      console.log("Mock: Daily analytics updated")
      return true
    }

    const { error } = await supabase!.from("daily_analytics").upsert({ date, ...analytics })

    if (error) {
      console.error("Error updating analytics:", error)
      return false
    }

    return true
  }

  // Activity Logs Operations
  static async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
    if (!this.isSupabaseAvailable()) {
      console.log("Using mock activity logs - Supabase not configured")
      return [
        {
          id: "1",
          type: "analysis",
          message: "Análise iniciada para 25 jogos das principais ligas europeias",
          details: { leagues: ["Premier League", "La Liga", "Serie A"], games_count: 25 },
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          type: "opportunity",
          message: "Nova oportunidade identificada: Manchester City vs Liverpool",
          details: { market: "1X2", value: "8.5%", confidence: "75%" },
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          type: "success",
          message: "Aposta vencedora: Barcelona vs Real Madrid - Over 2.5 gols",
          details: { odds: 1.85, profit: "12.3%" },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          type: "error",
          message: "Falha na conexão com The Odds API - tentando novamente",
          details: { error_code: "TIMEOUT", retry_count: 2 },
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
      ]
    }

    const { data, error } = await supabase!
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching activity logs:", error)
      return []
    }

    return data || []
  }

  static async logActivity(type: string, message: string, details?: any): Promise<boolean> {
    if (!this.isSupabaseAvailable()) {
      console.log(`Mock Log [${type}]: ${message}`)
      return true
    }

    const { error } = await supabase!.from("activity_logs").insert({
      type,
      message,
      details,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error logging activity:", error)
      return false
    }

    return true
  }

  // Statistics and Aggregations
  static async getStatistics(): Promise<{
    totalOpportunities: number
    pendingOpportunities: number
    successRate: number
    totalGamesAnalyzed: number
  }> {
    if (!this.isSupabaseAvailable()) {
      console.log("Using mock statistics - Supabase not configured")
      return {
        totalOpportunities: 23,
        pendingOpportunities: 5,
        successRate: 78.5,
        totalGamesAnalyzed: 156,
      }
    }

    // Get total opportunities
    const { count: totalOpportunities } = await supabase!
      .from("opportunities")
      .select("*", { count: "exact", head: true })

    // Get pending opportunities
    const { count: pendingOpportunities } = await supabase!
      .from("opportunities")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    // Get won opportunities for success rate
    const { count: wonOpportunities } = await supabase!
      .from("opportunities")
      .select("*", { count: "exact", head: true })
      .eq("status", "won")

    // Get total games analyzed from analytics
    const { data: analyticsData } = await supabase!.from("daily_analytics").select("games_analyzed")

    const totalGamesAnalyzed = analyticsData?.reduce((sum, day) => sum + day.games_analyzed, 0) || 0
    const successRate = totalOpportunities ? ((wonOpportunities || 0) / totalOpportunities) * 100 : 0

    return {
      totalOpportunities: totalOpportunities || 0,
      pendingOpportunities: pendingOpportunities || 0,
      successRate,
      totalGamesAnalyzed,
    }
  }
}
