"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, Globe, Server, Smartphone } from "lucide-react"

interface EnvironmentInfo {
  isProduction: boolean
  baseUrl: string
  webhookUrl: string
  platform: string
  hasVercelUrl: boolean
}

export default function EnvironmentDetector() {
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null)

  useEffect(() => {
    const detectEnvironment = () => {
      const isProduction = process.env.NODE_ENV === "production"
      const hasVercelUrl = !!process.env.VERCEL_URL

      let baseUrl = ""
      let platform = "Local"

      if (typeof window !== "undefined") {
        baseUrl = window.location.origin
        if (window.location.hostname.includes("vercel.app")) {
          platform = "Vercel"
        } else if (window.location.hostname === "localhost") {
          platform = "Local"
        } else {
          platform = "Custom Domain"
        }
      } else {
        // Server-side fallback
        baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
        platform = process.env.VERCEL_URL ? "Vercel" : "Local"
      }

      setEnvInfo({
        isProduction,
        baseUrl,
        webhookUrl: `${baseUrl}/api/telegram/webhook`,
        platform,
        hasVercelUrl,
      })
    }

    detectEnvironment()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copiado para a área de transferência!")
  }

  if (!envInfo) {
    return <div>Detectando ambiente...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Informações do Ambiente
        </CardTitle>
        <CardDescription>Detecção automática da configuração atual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Ambiente:</span>
            <Badge variant={envInfo.isProduction ? "default" : "secondary"}>
              {envInfo.isProduction ? "Produção" : "Desenvolvimento"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plataforma:</span>
            <Badge variant="outline">{envInfo.platform}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">VERCEL_URL:</span>
            <Badge variant={envInfo.hasVercelUrl ? "default" : "secondary"}>
              {envInfo.hasVercelUrl ? "Disponível" : "Local"}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
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
        </div>

        {!envInfo.hasVercelUrl && envInfo.isProduction && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertDescription>
              <strong>Nota:</strong> A variável VERCEL_URL será automaticamente disponibilizada quando o deploy for
              feito na Vercel. Em desenvolvimento local, usamos localhost:3000.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <Server className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h4 className="font-medium">Dashboard</h4>
            <p className="text-sm text-muted-foreground">Interface principal</p>
            <Button
              onClick={() => window.open(`${envInfo.baseUrl}/`, "_blank")}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Abrir
            </Button>
          </div>

          <div className="text-center">
            <Smartphone className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h4 className="font-medium">Telegram</h4>
            <p className="text-sm text-muted-foreground">Automação</p>
            <Button
              onClick={() => window.open(`${envInfo.baseUrl}/telegram`, "_blank")}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Abrir
            </Button>
          </div>

          <div className="text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h4 className="font-medium">Controle</h4>
            <p className="text-sm text-muted-foreground">Sistema</p>
            <Button
              onClick={() => window.open(`${envInfo.baseUrl}/control`, "_blank")}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Abrir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
