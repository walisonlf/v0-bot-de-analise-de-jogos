"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function EnvironmentCheck() {
  const [envStatus, setEnvStatus] = useState({
    supabaseUrl: false,
    supabaseKey: false,
    configured: false,
  })

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const urlValid = supabaseUrl && !supabaseUrl.includes("your-project")
    const keyValid = supabaseKey && !supabaseKey.includes("your-anon-key")

    setEnvStatus({
      supabaseUrl: !!urlValid,
      supabaseKey: !!keyValid,
      configured: !!urlValid && !!keyValid,
    })
  }, [])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Status da Configuração
        </CardTitle>
        <CardDescription>Verificação das variáveis de ambiente do Supabase</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Supabase URL</span>
            <Badge variant={envStatus.supabaseUrl ? "default" : "destructive"}>
              {envStatus.supabaseUrl ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" /> Configurado
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" /> Não configurado
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span>Supabase Anon Key</span>
            <Badge variant={envStatus.supabaseKey ? "default" : "destructive"}>
              {envStatus.supabaseKey ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" /> Configurado
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" /> Não configurado
                </>
              )}
            </Badge>
          </div>

          {!envStatus.configured && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Ação necessária:</strong> Configure suas credenciais do Supabase no arquivo .env.local
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
