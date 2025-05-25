"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import {
  Activity,
  TrendingUp,
  Target,
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Bot,
  Database,
  Send,
  ExternalLink,
} from "lucide-react"
import {
  DatabaseService,
  type BotStatus,
  type Opportunity,
  type DailyAnalytics,
  type ActivityLog,
} from "@/lib/database"

export default function RealTimeDashboard() {
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [analytics, setAnalytics] = useState<DailyAnalytics[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [statistics, setStatistics] = useState({
    totalOpportunities: 0,
    pendingOpportunities: 0,
    successRate: 0,
    totalGamesAnalyzed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const [statusData, opportunitiesData, analyticsData, logsData, statsData] = await Promise.all([
        DatabaseService.getBotStatus(),
        DatabaseService.getRecentOpportunities(10),
        DatabaseService.getDailyAnalytics(7),
        DatabaseService.getActivityLogs(20),
        DatabaseService.getStatistics(),
      ])

      setBotStatus(statusData)
      setOpportunities(opportunitiesData)
      setAnalytics(analyticsData)
      setActivityLogs(logsData)
      setStatistics(statsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadData()
  }

  const testDatabaseOperations = async () => {
    // Test creating a new opportunity
    const newOpportunity = {
      game_id: "test_" + Date.now(),
      home_team: "Test Team A",
      away_team: "Test Team B",
      league: "test_league",
      market: "1X2",
      selection: "Test Team A",
      odds: 2.5,
      value: 0.1,
      confidence: 0.8,
      bookmaker: "Test Bookmaker",
      commence_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      status: "pending" as const,
    }

    const opportunityId = await DatabaseService.createOpportunity(newOpportunity)

    if (opportunityId) {
      // Log the activity
      await DatabaseService.logActivity("test", "Nova oportunidade de teste criada via dashboard", {
        opportunity_id: opportunityId,
        test: true,
        created_from: "dashboard",
      })

      // Update bot status
      await DatabaseService.updateBotStatus({
        status: "online",
        opportunities_found_today: (botStatus?.opportunities_found_today || 0) + 1,
        updated_at: new Date().toISOString(),
      })

      // Refresh data to show changes
      await refreshData()
    }
  }

  const runAutomatedAnalysis = async () => {
    try {
      const response = await fetch("/api/bot/analyze", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        await refreshData()
      }
    } catch (error) {
      console.error("Error running analysis:", error)
    }
  }

  useEffect(() => {
    loadData()

    // Set up real-time subscriptions
    const opportunitiesSubscription = DatabaseService.subscribeToOpportunities((payload) => {
      console.log("Real-time opportunity update:", payload)
      loadData() // Reload data when changes occur
    })

    const botStatusSubscription = DatabaseService.subscribeToBotStatus((payload) => {
      console.log("Real-time bot status update:", payload)
      loadData() // Reload data when changes occur
    })

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)

    return () => {
      clearInterval(interval)
      opportunitiesSubscription.unsubscribe()
      botStatusSubscription.unsubscribe()
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "analyzing":
        return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "analysis":
        return <Bot className="h-4 w-4 text-blue-600" />
      case "opportunity":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Conectando com Supabase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="h-8 w-8 text-blue-600" />
              Dashboard - Bot de Análise (Supabase Conectado)
            </h1>
            <p className="text-gray-600 mt-1">Dados em tempo real do banco de dados</p>
          </div>
          <div className="flex gap-2">
            <Link href="/telegram">
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Automação Telegram
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Button onClick={runAutomatedAnalysis} variant="outline">
              <Bot className="h-4 w-4 mr-2" />
              Executar Análise
            </Button>
            <Button onClick={testDatabaseOperations} variant="outline">
              Testar Operações
            </Button>
            <Button onClick={refreshData} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Sistema Totalmente Automatizado
            </CardTitle>
            <CardDescription className="text-green-700">
              Supabase conectado + Webhooks + Telegram + Análise automática
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
              <Badge variant="default">Supabase ✓</Badge>
              <Badge variant="default">Webhooks ✓</Badge>
              <Badge variant="default">Telegram ✓</Badge>
              <Badge variant="default">API Odds ✓</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status do Bot</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(botStatus?.status || "offline")}
                <Badge variant={botStatus?.status === "online" ? "default" : "secondary"}>
                  {botStatus?.status || "offline"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Última análise:{" "}
                {botStatus?.last_analysis ? new Date(botStatus.last_analysis).toLocaleString("pt-BR") : "Nunca"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jogos Analisados</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalGamesAnalyzed}</div>
              <p className="text-xs text-muted-foreground">Hoje: {botStatus?.games_analyzed_today || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalOpportunities}</div>
              <p className="text-xs text-muted-foreground">Pendentes: {statistics.pendingOpportunities}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.successRate.toFixed(1)}%</div>
              <Progress value={statistics.successRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Oportunidades Recentes</CardTitle>
                <CardDescription>
                  Últimas {opportunities.length} oportunidades do banco de dados (notificações automáticas via Telegram)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {opportunities.map((opportunity) => (
                      <div key={opportunity.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {opportunity.home_team} vs {opportunity.away_team}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {opportunity.league.replace("soccer_", "").replace("_", " ")}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Mercado:</span>
                                <p className="font-medium">{opportunity.market}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Seleção:</span>
                                <p className="font-medium">{opportunity.selection}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Odds:</span>
                                <p className="font-medium">{opportunity.odds}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Valor:</span>
                                <p className="font-medium text-green-600">{(opportunity.value * 100).toFixed(1)}%</p>
                              </div>
                            </div>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Confiança: {(opportunity.confidence * 100).toFixed(1)}%</span>
                              <span>Casa: {opportunity.bookmaker}</span>
                              <span>Jogo: {new Date(opportunity.commence_time).toLocaleString("pt-BR")}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge
                              variant={
                                opportunity.status === "won"
                                  ? "default"
                                  : opportunity.status === "lost"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {opportunity.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Send className="h-3 w-3 mr-1" />
                              Telegram
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Diários</CardTitle>
                <CardDescription>Performance dos últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.map((day) => (
                    <div key={day.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <span className="font-medium">{new Date(day.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <span>Jogos: {day.games_analyzed}</span>
                        <span>Oportunidades: {day.opportunities_found}</span>
                        <span>Taxa: {day.success_rate.toFixed(1)}%</span>
                        <span>Valor: R$ {day.total_value.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Atividade</CardTitle>
                <CardDescription>Últimas {activityLogs.length} atividades do sistema (tempo real)</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className="mt-0.5">{getActivityIcon(log.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{log.type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <p className="text-sm">{log.message}</p>
                          {log.details && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
