"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Bot, Webhook, Play, Settings, MessageSquare, RefreshCw } from "lucide-react"

export default function TelegramAutomation() {
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const testTelegramConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/telegram/test", { method: "POST" })
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: "Connection failed" })
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/bot/analyze", { method: "POST" })
      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      setAnalysisResult({ success: false, error: "Analysis failed" })
    } finally {
      setLoading(false)
    }
  }

  const setupWebhooks = async () => {
    // Esta função seria implementada para configurar webhooks no Supabase
    alert(
      "Para configurar webhooks:\n1. Vá no Supabase Dashboard\n2. Database > Webhooks\n3. Adicione: " +
        window.location.origin +
        "/api/telegram/webhook",
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Send className="h-8 w-8 text-blue-600" />
            Automação Telegram
          </h1>
          <p className="text-muted-foreground">Sistema automatizado de notificações</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="bot">Bot Análise</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Telegram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant="default">Configurado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Chat ID:</span>
                    <code className="text-xs">-4980709993</code>
                  </div>
                  <Button onClick={testTelegramConnection} disabled={loading} className="w-full">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Testar Conexão
                  </Button>
                  {testResult && (
                    <div
                      className={`p-2 rounded text-xs ${testResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                    >
                      {testResult.success ? "✅ Teste enviado com sucesso!" : `❌ ${testResult.error}`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhooks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Endpoint:</span>
                    <Badge variant="outline">Ativo</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">/api/telegram/webhook</div>
                  <Button onClick={setupWebhooks} variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Bot Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant="secondary">Pronto</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Análise automatizada de jogos</div>
                  <Button onClick={runAnalysis} disabled={loading} className="w-full">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    Executar Análise
                  </Button>
                  {analysisResult && (
                    <div
                      className={`p-2 rounded text-xs ${analysisResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                    >
                      {analysisResult.success
                        ? `✅ Análise concluída! ${analysisResult.gamesAnalyzed} jogos, ${analysisResult.opportunitiesFound} oportunidades`
                        : `❌ ${analysisResult.error}`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Como Funciona a Automação</CardTitle>
              <CardDescription>Fluxo completo do sistema automatizado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Análise Automatizada</h4>
                    <p className="text-sm text-muted-foreground">
                      Bot coleta dados da API e analisa oportunidades a cada 12 horas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Salvamento no Banco</h4>
                    <p className="text-sm text-muted-foreground">
                      Oportunidades são salvas no Supabase automaticamente
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Webhook Disparado</h4>
                    <p className="text-sm text-muted-foreground">
                      Supabase dispara webhook para cada nova oportunidade
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">Notificação Telegram</h4>
                    <p className="text-sm text-muted-foreground">
                      Mensagem formatada é enviada automaticamente para o grupo
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhooks</CardTitle>
              <CardDescription>Configure webhooks no Supabase para notificações automáticas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">1. Acesse o Supabase Dashboard</h4>
                  <p className="text-sm text-muted-foreground mb-2">Vá para: Database → Webhooks</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. Criar Webhook para Oportunidades</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <strong>Name:</strong> telegram-opportunities
                    </div>
                    <div>
                      <strong>Table:</strong> opportunities
                    </div>
                    <div>
                      <strong>Events:</strong> INSERT, UPDATE
                    </div>
                    <div>
                      <strong>URL:</strong>{" "}
                      <code>
                        {typeof window !== "undefined" ? window.location.origin : "https://your-domain.vercel.app"}
                        /api/telegram/webhook
                      </code>
                    </div>
                    <div>
                      <strong>HTTP Method:</strong> POST
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. Criar Webhook para Status do Bot</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <strong>Name:</strong> telegram-bot-status
                    </div>
                    <div>
                      <strong>Table:</strong> bot_status
                    </div>
                    <div>
                      <strong>Events:</strong> UPDATE
                    </div>
                    <div>
                      <strong>URL:</strong>{" "}
                      <code>
                        {typeof window !== "undefined" ? window.location.origin : "https://your-domain.vercel.app"}
                        /api/telegram/webhook
                      </code>
                    </div>
                    <div>
                      <strong>HTTP Method:</strong> POST
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">4. Criar Webhook para Logs</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <strong>Name:</strong> telegram-activity-logs
                    </div>
                    <div>
                      <strong>Table:</strong> activity_logs
                    </div>
                    <div>
                      <strong>Events:</strong> INSERT
                    </div>
                    <div>
                      <strong>URL:</strong>{" "}
                      <code>
                        {typeof window !== "undefined" ? window.location.origin : "https://your-domain.vercel.app"}
                        /api/telegram/webhook
                      </code>
                    </div>
                    <div>
                      <strong>HTTP Method:</strong> POST
                    </div>
                  </div>
                </div>

                <Button onClick={setupWebhooks} className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Abrir Supabase Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bot de Análise Automatizada</CardTitle>
              <CardDescription>Execute análises manuais ou configure execução automática</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Análise Manual</h4>
                    <p className="text-sm text-muted-foreground mb-4">Execute uma análise imediata</p>
                    <Button onClick={runAnalysis} disabled={loading} className="w-full">
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Executar Agora
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Análise Automática</h4>
                    <p className="text-sm text-muted-foreground mb-4">Configure execução a cada 12 horas</p>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar Cron
                    </Button>
                  </div>
                </div>

                {analysisResult && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Último Resultado</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant={analysisResult.success ? "default" : "destructive"}>
                          {analysisResult.success ? "Sucesso" : "Erro"}
                        </Badge>
                      </div>
                      {analysisResult.success && (
                        <>
                          <div className="flex justify-between">
                            <span>Jogos Analisados:</span>
                            <span>{analysisResult.gamesAnalyzed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Oportunidades:</span>
                            <span>{analysisResult.opportunitiesFound}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Salvas no Banco:</span>
                            <span>{analysisResult.opportunitiesSaved}</span>
                          </div>
                        </>
                      )}
                      {analysisResult.error && <div className="text-red-600">Erro: {analysisResult.error}</div>}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Configurações da Análise</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Ligas Monitoradas:</span>
                      <ul className="mt-1 space-y-1">
                        <li>• Premier League</li>
                        <li>• La Liga</li>
                        <li>• Serie A</li>
                        <li>• Bundesliga</li>
                        <li>• Brasileirão</li>
                      </ul>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Critérios:</span>
                      <ul className="mt-1 space-y-1">
                        <li>• Odds: 1.5 - 5.0</li>
                        <li>• Valor mínimo: 5%</li>
                        <li>• Confiança: 70%+</li>
                        <li>• Janela: 24 horas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>Ajuste parâmetros de notificação e análise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4">Notificações Telegram</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Novas Oportunidades</span>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mudanças de Status</span>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Resultados de Apostas</span>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Erros do Sistema</span>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Parâmetros de Análise</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Odds Mínimas</label>
                      <input type="number" className="w-full mt-1 px-3 py-2 border rounded-md" defaultValue="1.5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Odds Máximas</label>
                      <input type="number" className="w-full mt-1 px-3 py-2 border rounded-md" defaultValue="5.0" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Valor Mínimo (%)</label>
                      <input type="number" className="w-full mt-1 px-3 py-2 border rounded-md" defaultValue="5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Confiança Mínima (%)</label>
                      <input type="number" className="w-full mt-1 px-3 py-2 border rounded-md" defaultValue="70" />
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
