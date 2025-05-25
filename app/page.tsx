"use client"
import RealTimeDashboard from "@/components/real-time-dashboard"

interface DashboardData {
  botStatus: "online" | "offline" | "analyzing"
  totalGamesAnalyzed: number
  opportunitiesFound: number
  successRate: number
  lastAnalysis: string
  nextAnalysis: string
  recentOpportunities: Opportunity[]
  analytics: AnalyticsData[]
}

interface Opportunity {
  id: string
  homeTeam: string
  awayTeam: string
  league: string
  market: string
  selection: string
  odds: number
  value: number
  confidence: number
  bookmaker: string
  commenceTime: string
  status: "pending" | "won" | "lost" | "void"
}

interface AnalyticsData {
  date: string
  gamesAnalyzed: number
  opportunitiesFound: number
  successRate: number
}

export default function Home() {
  return <RealTimeDashboard />
}
