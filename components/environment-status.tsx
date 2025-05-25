"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Settings,
  Database,
  Send,
  TrendingUp,
  Shield,
} from "lucide-react"

interface EnvironmentInfo {
  isClient: boolean
  nodeEnv: string
  hasVercelUrl: boolean
  baseUrl: string
  webhookUrl: string
  validation: {
    supabase: { valid: boolean; missing: string[] }
    telegram: { valid: boolean; missing: string[] }
    oddsApi: { valid: boolean; missing: string[] }
    overall: { valid: boolean; missing: string[] }
  }
}

export default function EnvironmentStatus() {
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchEnvironmentInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/environment/info")
      const data = await response.json()
      setEnvInfo(data)
    } catch (error) {
      console.error("Failed to fetch environment info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnvironmentInfo()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copiado para a área de transferência!")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!envInfo) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4" />
        <AlertDescription>Erro ao carregar informações do ambiente</AlertDescription>
      </Alert>
    )
  }

  const { validation } = envInfo

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            Variáveis de Ambiente
          </h1>
          <p className="text-muted-foreground">Status e configuração das variáveis do sistema</p>
        </div>
        <Button onClick={fetchEnvironmentInfo} disabled={loading} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Status Geral */}
      <Alert className={validation.overall.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        {validation.overall.valid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        <AlertDescription>
          <strong>Status Geral:</strong>{" "}
          {validation.overall.valid ? (
            <span className="text-green-700">✅ Todas as variáveis configuradas</span>
          ) : (
            <span className="text-red-700">❌ {validation.overall.missing.length} variáveis faltando</span>
          )}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="help">Ajuda</TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Supabase */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Supabase</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  {validation.supabase.valid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge variant={validation.supabase.valid ? "default" : "destructive"}>
                    {validation.supabase.valid ? "Configurado" : "Incompleto"}
                  </Badge>
                </div>
                {validation.supabase.missing.length > 0 && (
                  <div className="text-xs text-red-600">Faltando: {validation.supabase.missing.join(", ")}</div>
                )}
              </CardContent>
            </Card>

            {/* Telegram */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Telegram</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  {validation.telegram.valid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge variant={validation.telegram.valid ? "default" : "destructive"}>
                    {validation.telegram.valid ? "Configurado" : "Incompleto"}
                  </Badge>
                </div>
                {validation.telegram.missing.length > 0 && (
                  <div className="text-xs text-red-600">Faltando: {validation.telegram.missing.join(", ")}</div>
                )}
              </CardContent>
            </Card>

            {/* Odds API */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">The Odds API</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  {validation.oddsApi.valid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge variant={validation.oddsApi.valid ? "default" : "destructive"}>
                    {validation.oddsApi.valid ? "Configurado" : "Incompleto"}
                  </Badge>
                </div>
                {validation.oddsApi.missing.length > 0 && (
                  <div className="text-xs text-red-600">Faltando: {validation.oddsApi.missing.join(", ")}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* URLs do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>URLs do Sistema</CardTitle>
              <CardDescription>URLs geradas automaticamente baseadas no ambiente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">URL Base da Aplicação:</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={envInfo.baseUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                  />
                  <Button onClick={() => copyToClipboard(envInfo.baseUrl)} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => window.open(envInfo.baseUrl, "_blank")} variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">URL do Webhook (para Supabase):</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={envInfo.webhookUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                  />
                  <Button onClick={() => copyToClipboard(envInfo.webhookUrl)} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Ambiente</CardTitle>
              <CardDescription>Detalhes técnicos da configuração atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ambiente:</span>
                  <Badge variant={envInfo.nodeEnv === "production" ? "default" : "secondary"}>{envInfo.nodeEnv}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Contexto:</span>
                  <Badge variant="outline">{envInfo.isClient ? "Client-side" : "Server-side"}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">VERCEL_URL:</span>
                  <Badge variant={envInfo.hasVercelUrl ? "default" : "secondary"}>
                    {envInfo.hasVercelUrl ? "Disponível" : "Local"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plataforma:</span>
                  <Badge variant="outline">{envInfo.hasVercelUrl ? "Vercel" : "Local"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variáveis Faltando */}
          {validation.overall.missing.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Variáveis Faltando</CardTitle>
                <CardDescription>Configure estas variáveis para ativar todas as funcionalidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validation.overall.missing.map((variable) => (
                    <div key={variable} className="flex items-center gap-2 p-2 border rounded-md bg-red-50">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <code className="text-sm font-mono">{variable}</code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Help Tab */}
        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Como Configurar as Variáveis</CardTitle>
              <CardDescription>Guia passo a passo para configurar cada serviço</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Supabase */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Supabase
                </h4>
                <div className="text-sm space-y-1 ml-6">
                  <p>
                    1. Acesse{" "}
                    <a href="https://supabase.com" target="_blank" className="text-blue-600 underline" rel="noreferrer">
                      supabase.com
                    </a>
                  </p>
                  <p>2. Crie um novo projeto</p>
                  <p>3. Vá em Settings → API</p>
                  <p>4. Copie a URL e a chave anônima</p>
                  <p>5. Configure as variáveis:</p>
                  <code className="block bg-gray-100 p-2 rounded text-xs">
                    NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
                    <br />
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
                  </code>
                </div>
              </div>

              {/* Telegram */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Telegram
                </h4>
                <div className="text-sm space-y-1 ml-6">
                  <p>1. Fale com @BotFather no Telegram</p>
                  <p>2. Use /newbot para criar um bot</p>
                  <p>3. Copie o token fornecido</p>
                  <p>4. Para o Chat ID, use @userinfobot</p>
                  <p>5. Configure as variáveis:</p>
                  <code className="block bg-gray-100 p-2 rounded text-xs">
                    TELEGRAM_BOT_TOKEN=seu-token-aqui
                    <br />
                    TELEGRAM_CHAT_ID=seu-chat-id-aqui
                  </code>
                </div>
              </div>

              {/* The Odds API */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  The Odds API
                </h4>
                <div className="text-sm space-y-1 ml-6">
                  <p>
                    1. Acesse{" "}
                    <a
                      href="https://the-odds-api.com"
                      target="_blank"
                      className="text-blue-600 underline"
                      rel="noreferrer"
                    >
                      the-odds-api.com
                    </a>
                  </p>
                  <p>2. Crie uma conta gratuita</p>
                  <p>3. Copie sua API key</p>
                  <p>4. Configure a variável:</p>
                  <code className="block bg-gray-100 p-2 rounded text-xs">ODDS_API_KEY=sua-chave-aqui</code>
                </div>
              </div>

              {/* Cron Secret */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Cron Secret
                </h4>
                <div className="text-sm space-y-1 ml-6">
                  <p>1. Gere uma string aleatória segura</p>
                  <p>2. Use para proteger endpoints de cron</p>
                  <p>3. Configure a variável:</p>
                  <code className="block bg-gray-100 p-2 rounded text-xs">CRON_SECRET=sua-string-secreta-aqui</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
