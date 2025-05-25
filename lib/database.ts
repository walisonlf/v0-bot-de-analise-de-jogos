import { supabase, type BotStatus, type Opportunity, type DailyAnalytics, type ActivityLog } from "./supabase"

export class DatabaseService {
  // Bot Status Operations
  static async getBotStatus(): Promise<BotStatus | null> {
    const { data, error } = await supabase.from("bot_status").select("*").eq("id", 1).single()

    if (error) {
      console.error("Error fetching bot status:", error)
      return null
    }

    return data
  }

  static async updateBotStatus(updates: Partial<BotStatus>): Promise<boolean> {
    const { error } = await supabase.from("bot_status").upsert({ id: 1, ...updates })

    if (error) {
      console.error("Error updating bot status:", error)
      return false
    }

    return true
  }

  // Opportunities Operations
  static async getRecentOpportunities(limit = 10): Promise<Opportunity[]> {
    const { data, error } = await supabase
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
    const { data, error } = await supabase.from("opportunities").insert(opportunity).select("id").single()

    if (error) {
      console.error("Error creating opportunity:", error)
      return null
    }

    return data.id
  }

  static async updateOpportunityStatus(id: string, status: Opportunity["status"]): Promise<boolean> {
    const { error } = await supabase.from("opportunities").update({ status }).eq("id", id)

    if (error) {
      console.error("Error updating opportunity status:", error)
      return false
    }

    return true
  }

  // Analytics Operations
  static async getDailyAnalytics(days = 7): Promise<DailyAnalytics[]> {
    const { data, error } = await supabase
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
    const { error } = await supabase.from("daily_analytics").upsert({ date, ...analytics })

    if (error) {
      console.error("Error updating analytics:", error)
      return false
    }

    return true
  }

  // Activity Logs Operations
  static async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
    const { data, error } = await supabase
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
    const { error } = await supabase.from("activity_logs").insert({
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
    // Get total opportunities
    const { count: totalOpportunities } = await supabase
      .from("opportunities")
      .select("*", { count: "exact", head: true })

    // Get pending opportunities
    const { count: pendingOpportunities } = await supabase
      .from("opportunities")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    // Get won opportunities for success rate
    const { count: wonOpportunities } = await supabase
      .from("opportunities")
      .select("*", { count: "exact", head: true })
      .eq("status", "won")

    // Get total games analyzed from analytics
    const { data: analyticsData } = await supabase.from("daily_analytics").select("games_analyzed")

    const totalGamesAnalyzed = analyticsData?.reduce((sum, day) => sum + day.games_analyzed, 0) || 0
    const successRate = totalOpportunities ? ((wonOpportunities || 0) / totalOpportunities) * 100 : 0

    return {
      totalOpportunities: totalOpportunities || 0,
      pendingOpportunities: pendingOpportunities || 0,
      successRate,
      totalGamesAnalyzed,
    }
  }

  // Real-time subscriptions
  static subscribeToOpportunities(callback: (payload: any) => void) {
    return supabase
      .channel("opportunities")
      .on("postgres_changes", { event: "*", schema: "public", table: "opportunities" }, callback)
      .subscribe()
  }

  static subscribeToBotStatus(callback: (payload: any) => void) {
    return supabase
      .channel("bot_status")
      .on("postgres_changes", { event: "*", schema: "public", table: "bot_status" }, callback)
      .subscribe()
  }
}
