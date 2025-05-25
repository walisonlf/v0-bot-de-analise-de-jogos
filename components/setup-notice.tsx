"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Database, ExternalLink } from "lucide-react"

export function SetupNotice() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="h-5 w-5" />
          Configuração Necessária
        </CardTitle>
        <CardDescription className="text-yellow-700">
          Para usar todas as funcionalidades, configure o Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-yellow-700">
          <p className="mb-3">Atualmente usando dados simulados. Para conectar com dados reais:</p>

          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Crie uma conta no Supabase</li>
            <li>Execute o SQL do schema para criar as tabelas</li>
            <li>Configure as variáveis de ambiente no .env.local</li>
            <li>Reinicie a aplicação</li>
          </ol>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://supabase.com", "_blank")}
            className="flex items-center gap-1"
          >
            <Database className="h-4 w-4" />
            Ir para Supabase
            <ExternalLink className="h-3 w-3" />
          </Button>

          <Button variant="outline" size="sm" onClick={() => setDismissed(true)}>
            Entendi
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
