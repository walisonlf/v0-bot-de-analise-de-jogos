"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DatabaseService,
  type BotStatus,
  type Opportunity,
  type DailyAnalytics,
  type ActivityLog,
} from "@/lib/database-service"
import { RefreshCw, Database, TrendingUp, Activity, Target, BarChart3, AlertCircle } from "lucide-react"

export default function DatabaseDemo() {
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
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false)

  const loadData = async () => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const configured = !!(
        supabaseUrl &&
        supabaseKey &&
        !supabaseUrl.includes("your-project") &&
        !supabaseKey.includes("your-anon-key") &&
        supabaseUrl.startsWith("https://")
      )

      setIsSupabaseConfigured(configured)

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
      await DatabaseService.logActivity("test", "Nova oportunidade de teste criada", {
        opportunity_id: opportunityId,
        test: true,
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

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados do banco...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      {!isSupabaseConfigured && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Usando Dados Simulados
            </CardTitle>
            <CardDescription className="text-yellow-700">Configure o Supabase para usar dados reais</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700">
              O sistema está funcionando com dados simulados. Para conectar com o banco de dados real, configure as
              variáveis de ambiente do Supabase no arquivo .env.local
            </p>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Demonstração do Banco de Dados
          </h1>
          <p className="text-muted-foreground">
            {isSupabaseConfigured ? "Dados em tempo real do Supabase" : "Dados simulados para demonstração"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testDatabaseOperations} variant="outline">
            Testar Operações
          </Button>
          <Button onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Bot</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={botStatus?.status === "online" ? "default" : "secondary"}>
              {botStatus?.status || "offline"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Última análise:{" "}
              {botStatus?.last_analysis ? new Date(botStatus.last_analysis).toLocaleString("pt-BR") : "Nunca"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Oportunidades</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">{statistics.pendingOpportunities} pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Baseado em resultados históricos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jogos Analisados</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalGamesAnalyzed}</div>
            <p className="text-xs text-muted-foreground">Total histórico</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="logs">Logs de Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades Recentes</CardTitle>
              <CardDescription>Últimas 10 oportunidades encontradas pelo bot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div key={opportunity.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">
                          {opportunity.home_team} vs {opportunity.away_team}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.league.replace("soccer_", "").replace("_", " ")}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>Mercado: {opportunity.market}</span>
                          <span>Seleção: {opportunity.selection}</span>
                          <span>Odds: {opportunity.odds}</span>
                          <span>Valor: {(opportunity.value * 100).toFixed(1)}%</span>
                        </div>
                      </div>
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
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

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Atividade</CardTitle>
              <CardDescription>Últimas 20 atividades do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{log.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{log.message}</p>
                    {log.details && (
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
