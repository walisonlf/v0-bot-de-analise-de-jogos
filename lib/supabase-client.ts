import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = (() => {
  // Check if Supabase is properly configured
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "your_supabase_url_here" ||
    supabaseAnonKey === "your_supabase_anon_key_here" ||
    supabaseUrl.includes("your-project") ||
    supabaseAnonKey.includes("your-anon-key")
  ) {
    console.warn("Supabase not configured - using mock data")
    return null
  }

  try {
    // Validate URL format
    new URL(supabaseUrl)

    return createSupabaseClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return null
  }
})()

// Type definitions for our database tables
export interface BotStatus {
  id: number
  status: "online" | "offline" | "analyzing"
  last_analysis?: string
  next_analysis?: string
  games_analyzed_today: number
  opportunities_found_today: number
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  game_id?: string
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
  status: "pending" | "won" | "lost" | "void"
  created_at: string
}

export interface DailyAnalytics {
  id: number
  date: string
  games_analyzed: number
  opportunities_found: number
  success_rate: number
  total_value: number
  created_at: string
}

export interface ActivityLog {
  id: string
  type: string
  message: string
  details?: any
  created_at: string
}
