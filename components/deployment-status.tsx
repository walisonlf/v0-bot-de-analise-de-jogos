"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  Rocket,
  Clock,
  Database,
  Send,
  TrendingUp,
} from "lucide-react"

interface ServiceStatus {
  supabase: boolean
  telegram: boolean
  oddsApi: boolean
  webhooks: boolean
}

export default function DeploymentStatus() {
  const [status, setStatus] = useState<ServiceStatus>({
    supabase: false,
    telegram: false,
    oddsApi: false,
    webhooks: false,
  })
  const [loading, setLoading] = useState(false)
  const [setupResult, setSetupResult] = useState<any>(null)
  const [webhookUrl, setWebhookUrl] = useState("")

  useEffect(() => {
    // Detectar URL do webhook baseado no ambiente
    const getWebhookUrl = () => {
      if (typeof window !== "undefined") {
        return window.location.origin + "/api/telegram/webhook"
      }
      return "https://your-app.vercel.app/api/telegram/webhook"
    }

    setWebhookUrl(getWebhookUrl())
  }, [])

  const runDeploySetup = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/deploy/setup", { method: "POST" })
      const result = await response.json()
      setSetupResult(result)

      if (result.success) {
        setStatus({
          supabase: true,
          telegram: true,
          oddsApi: true,
          webhooks: false, // Precisa ser configurado manualmente
        })
      }
    } catch (error) {
      setSetupResult({
        success: false,
        error: "Setup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    alert("URL copiada para a área de transferência!")
  }

  const testCronJob = async () => {
    try {
      const response = await fetch("/api/cron/analyze", { method: "POST" })
      const result = await response.json()
      alert(result.success ? "Cron job executado com sucesso!" : "Erro no cron job: " + result.error)
    } catch (error) {
      alert("Erro ao testar cron job")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Rocket className="h-8 w-8 text-blue-600" />
            Status do Deploy
          </h1>
          <p className="text-muted-foreground">Verificação e configuração dos serviços</p>
        </div>
        <Button onClick={runDeploySetup} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
          Verificar Serviços
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supabase</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {status.supabase ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <Badge variant={status.supabase ? "default" : "destructive"}>
                {status.supabase ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telegram</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {status.telegram ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <Badge variant={status.telegram ? "default" : "destructive"}>
                {status.telegram ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">The Odds API</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {status.oddsApi ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <Badge variant={status.oddsApi ? "default" : "destructive"}>
                {status.oddsApi ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cron Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <Badge variant="default">Configurado</Badge>
            </div>
            <Button onClick={testCronJob} variant="outline" size="sm" className="mt-2 w-full">
              Testar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Setup Result */}
      {setupResult && (
        <Alert className={setupResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription>
            {setupResult.success ? (
              <div>
                <strong>✅ Setup concluído com sucesso!</strong>
                <br />
                Todos os serviços estão conectados e funcionando.
              </div>
            ) : (
              <div>
                <strong>❌ Erro no setup:</strong>
                <br />
                {setupResult.error}: {setupResult.details}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Webhooks</CardTitle>
          <CardDescription>Configure os webhooks no Supabase para ativar notificações automáticas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">URL do Webhook:</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
                />
                <Button onClick={copyWebhookUrl} variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Webhook 1: Oportunidades</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Tabela:</strong> opportunities
                  </div>
                  <div>
                    <strong>Eventos:</strong> INSERT, UPDATE
                  </div>
                  <div>
                    <strong>Método:</strong> POST
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Webhook 2: Status do Bot</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Tabela:</strong> bot_status
                  </div>
                  <div>
                    <strong>Eventos:</strong> UPDATE
                  </div>
                  <div>
                    <strong>Método:</strong> POST
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Webhook 3: Logs</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Tabela:</strong> activity_logs
                  </div>
                  <div>
                    <strong>Eventos:</strong> INSERT
                  </div>
                  <div>
                    <strong>Método:</strong> POST
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
              className="w-full"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Supabase Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cron Jobs Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Automática (Cron Jobs)</CardTitle>
          <CardDescription>Execução automática a cada 12 horas (6h e 18h)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Agendamento Configurado</h4>
                <p className="text-sm text-muted-foreground">Executa às 6:00 e 18:00 (UTC) todos os dias</p>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">O que acontece automaticamente:</h5>
              <ul className="text-sm space-y-1">
                <li>• Coleta dados de jogos das principais ligas</li>
                <li>• Analisa oportunidades de value betting</li>
                <li>• Salva resultados no Supabase</li>
                <li>• Dispara webhooks para Telegram</li>
                <li>• Atualiza analytics e status do bot</li>
              </ul>
            </div>

            <Button onClick={testCronJob} variant="outline" className="w-full">
              <Clock className="h-4 w-4 mr-2" />
              Executar Análise Agora (Teste)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
          <CardDescription>Complete a configuração para ativar toda a automação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold">Verificar Serviços</h4>
                <p className="text-sm text-muted-foreground">Clique em "Verificar Serviços" para testar conexões</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold">Configurar Webhooks</h4>
                <p className="text-sm text-muted-foreground">
                  Copie a URL e configure os 3 webhooks no Supabase Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold">Testar Sistema</h4>
                <p className="text-sm text-muted-foreground">Execute uma análise manual para verificar funcionamento</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="font-semibold">Sistema Ativo</h4>
                <p className="text-sm text-muted-foreground">
                  Aguarde as análises automáticas a cada 12 horas ou execute manualmente
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
