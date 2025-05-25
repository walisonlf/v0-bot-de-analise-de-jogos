"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Bot,
  Database,
  Send,
  TrendingUp,
  Clock,
  Play,
  Square,
  RefreshCw,
  Trash2,
  TestTube,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
} from "lucide-react"

interface SystemStatus {
  timestamp: string
  services: {
    supabase: boolean
    telegram: boolean
    oddsApi: boolean
    cronJobs: boolean
  }
  botStatus: any
  lastAnalysis: string | null
  totalOpportunities: number
  recentActivity: any[]
  environment: {
    nodeEnv: string
    vercelUrl: string
    hasAllEnvVars: boolean
  }
}

export default function SystemControl() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/system/status")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()

      // Ensure we have a valid status object with default values
      const validStatus: SystemStatus = {
        timestamp: data.timestamp || new Date().toISOString(),
        services: {
          supabase: data.services?.supabase || false,
          telegram: data.services?.telegram || false,
          oddsApi: data.services?.oddsApi || false,
          cronJobs: data.services?.cronJobs || false,
        },
        botStatus: data.botStatus || { status: "unknown" },
        lastAnalysis: data.lastAnalysis || null,
        totalOpportunities: data.totalOpportunities || 0,
        recentActivity: data.recentActivity || [],
        environment: {
          nodeEnv: data.environment?.nodeEnv || "development",
          vercelUrl: data.environment?.vercelUrl || "localhost:3000",
          hasAllEnvVars: data.environment?.hasAllEnvVars || false,
        },
      }

      setStatus(validStatus)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Failed to fetch status:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")

      // Set a default status to prevent crashes
      setStatus({
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
          nodeEnv: "development",
          vercelUrl: "localhost:3000",
          hasAllEnvVars: false,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const executeAction = async (action: string, data?: any) => {
    setActionLoading(action)
    try {
      const response = await fetch("/api/system/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      })
      const result = await response.json()

      if (result.success) {
        alert(`✅ ${result.message}`)
        fetchStatus() // Atualizar status após ação
      } else {
        alert(`❌ ${result.message || "Erro na ação"}`)
      }
    } catch (error) {
      alert("❌ Erro ao executar ação")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  // Loading state
  if (loading && !status) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando status do sistema...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !status) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Erro ao carregar status: {error}</p>
          <Button onClick={fetchStatus} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  // Ensure status exists before proceeding
  if (!status) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Status não disponível</p>
        </div>
      </div>
    )
  }

  const allServicesOnline = Object.values(status.services).every(Boolean)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-green-600" />
            Controle do Sistema
          </h1>
          <p className="text-muted-foreground">Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")}</p>
        </div>
        <Button onClick={fetchStatus} disabled={loading} variant="outline">
          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Atualizar
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Geral */}
      <Alert className={allServicesOnline ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Status Geral:</strong>{" "}
          {allServicesOnline ? (
            <span className="text-green-700">🟢 Todos os serviços online e funcionando</span>
          ) : (
            <span className="text-yellow-700">🟡 Alguns serviços podem estar offline</span>
          )}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="control">Controles</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status do Bot</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.botStatus?.status === "online" ? "🟢" : "🔴"}</div>
                <p className="text-xs text-muted-foreground">
                  {status.botStatus?.status === "online" ? "Online" : "Offline"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.totalOpportunities}</div>
                <p className="text-xs text-muted-foreground">Total encontradas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Última Análise</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.lastAnalysis ? "✅" : "❌"}</div>
                <p className="text-xs text-muted-foreground">
                  {status.lastAnalysis ? new Date(status.lastAnalysis).toLocaleString("pt-BR") : "Nenhuma análise"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ambiente</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.environment.nodeEnv === "production" ? "🚀" : "🧪"}</div>
                <p className="text-xs text-muted-foreground">{status.environment.nodeEnv}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Serviços</CardTitle>
                <CardDescription>Conectividade com serviços externos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>Supabase</span>
                  </div>
                  {status.services.supabase ? (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    <span>Telegram</span>
                  </div>
                  {status.services.telegram ? (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>The Odds API</span>
                  </div>
                  {status.services.oddsApi ? (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Cron Jobs</span>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Configurado
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuração</CardTitle>
                <CardDescription>Variáveis de ambiente e configurações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Variáveis de Ambiente</span>
                  {status.environment.hasAllEnvVars ? (
                    <Badge variant="default">Completas</Badge>
                  ) : (
                    <Badge variant="destructive">Incompletas</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span>URL da Aplicação</span>
                  <Badge variant="outline">{status.environment.vercelUrl ? "Vercel" : "Local"}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Modo</span>
                  <Badge variant={status.environment.nodeEnv === "production" ? "default" : "secondary"}>
                    {status.environment.nodeEnv}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Control Tab */}
        <TabsContent value="control" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Controle do Bot</CardTitle>
                <CardDescription>Iniciar, parar e gerenciar o bot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => executeAction("start_bot")}
                  disabled={actionLoading === "start_bot"}
                  className="w-full"
                  variant={status.botStatus?.status === "online" ? "secondary" : "default"}
                >
                  {actionLoading === "start_bot" ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Iniciar Bot
                </Button>

                <Button
                  onClick={() => executeAction("stop_bot")}
                  disabled={actionLoading === "stop_bot"}
                  className="w-full"
                  variant="destructive"
                >
                  {actionLoading === "stop_bot" ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Square className="h-4 w-4 mr-2" />
                  )}
                  Parar Bot
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações do Sistema</CardTitle>
                <CardDescription>Executar tarefas e testes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => executeAction("force_analysis")}
                  disabled={actionLoading === "force_analysis"}
                  className="w-full"
                  variant="outline"
                >
                  {actionLoading === "force_analysis" ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Executar Análise Agora
                </Button>

                <Button
                  onClick={() => executeAction("send_test_notification")}
                  disabled={actionLoading === "send_test_notification"}
                  className="w-full"
                  variant="outline"
                >
                  {actionLoading === "send_test_notification" ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Testar Notificação
                </Button>

                <Button
                  onClick={() => executeAction("clear_opportunities")}
                  disabled={actionLoading === "clear_opportunities"}
                  className="w-full"
                  variant="outline"
                >
                  {actionLoading === "clear_opportunities" ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Limpar Dados Antigos
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas ações e eventos do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {status.recentActivity && status.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {status.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{activity.action_type || "Ação"}</h4>
                          <span className="text-sm text-muted-foreground">
                            {activity.created_at ? new Date(activity.created_at).toLocaleString("pt-BR") : "Agora"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description || "Sem descrição"}</p>
                        {activity.metadata && (
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma atividade recente encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
