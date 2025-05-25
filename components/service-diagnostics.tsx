"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw, Send, TrendingUp, TestTube, Info, AlertTriangle } from "lucide-react"

interface TestResult {
  success: boolean
  message?: string
  error?: string
  [key: string]: any
}

export default function ServiceDiagnostics() {
  const [telegramTest, setTelegramTest] = useState<TestResult | null>(null)
  const [oddsTest, setOddsTest] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const testTelegram = async () => {
    setLoading("telegram")
    try {
      const response = await fetch("/api/telegram/test-connection")
      const result = await response.json()
      setTelegramTest(result)
    } catch (error) {
      setTelegramTest({
        success: false,
        error: error instanceof Error ? error.message : "Connection failed",
      })
    } finally {
      setLoading(null)
    }
  }

  const testOddsApi = async () => {
    setLoading("odds")
    try {
      const response = await fetch("/api/odds/test-connection")
      const result = await response.json()
      setOddsTest(result)
    } catch (error) {
      setOddsTest({
        success: false,
        error: error instanceof Error ? error.message : "Connection failed",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Diagnóstico de Serviços</h2>
        <p className="text-muted-foreground">Teste detalhado de conectividade com APIs externas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Telegram Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Telegram Bot
            </CardTitle>
            <CardDescription>Teste de conectividade e envio de mensagens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testTelegram} disabled={loading === "telegram"} className="w-full" variant="outline">
              {loading === "telegram" ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Testar Conexão
            </Button>

            {telegramTest && (
              <div className="space-y-3">
                <Alert className={telegramTest.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {telegramTest.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>
                    <strong>Status:</strong>{" "}
                    {telegramTest.success ? (
                      <span className="text-green-700">✅ Conexão bem-sucedida</span>
                    ) : (
                      <span className="text-red-700">❌ {telegramTest.error}</span>
                    )}
                  </AlertDescription>
                </Alert>

                {telegramTest.success && telegramTest.botInfo && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Informações do Bot
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Username:</span>
                        <Badge variant="outline">@{telegramTest.botInfo.username}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Nome:</span>
                        <span>{telegramTest.botInfo.firstName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pode entrar em grupos:</span>
                        <Badge variant={telegramTest.botInfo.canJoinGroups ? "default" : "secondary"}>
                          {telegramTest.botInfo.canJoinGroups ? "Sim" : "Não"}
                        </Badge>
                      </div>
                    </div>

                    {telegramTest.messageInfo && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          ✅ Mensagem de teste enviada com sucesso!
                          <br />
                          ID da mensagem: {telegramTest.messageInfo.messageId}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* The Odds API Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              The Odds API
            </CardTitle>
            <CardDescription>Teste de conectividade e dados de apostas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testOddsApi} disabled={loading === "odds"} className="w-full" variant="outline">
              {loading === "odds" ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Testar Conexão
            </Button>

            {oddsTest && (
              <div className="space-y-3">
                <Alert className={oddsTest.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {oddsTest.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertDescription>
                    <strong>Status:</strong>{" "}
                    {oddsTest.success ? (
                      <span className="text-green-700">✅ Conexão bem-sucedida</span>
                    ) : (
                      <span className="text-red-700">❌ {oddsTest.error}</span>
                    )}
                  </AlertDescription>
                </Alert>

                {oddsTest.success && oddsTest.apiInfo && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Informações da API
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Requests restantes:</span>
                        <Badge variant={oddsTest.apiInfo.remainingRequests > 100 ? "default" : "destructive"}>
                          {oddsTest.apiInfo.remainingRequests || "N/A"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Requests usados:</span>
                        <span>{oddsTest.apiInfo.requestsUsed || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Esportes disponíveis:</span>
                        <Badge variant="outline">{oddsTest.apiInfo.totalSports}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Esportes de futebol:</span>
                        <Badge variant="default">{oddsTest.apiInfo.footballSports}</Badge>
                      </div>
                    </div>

                    {oddsTest.footballSports && oddsTest.footballSports.length > 0 && (
                      <div className="mt-3">
                        <h5 className="font-medium text-sm mb-2">Ligas de Futebol Disponíveis:</h5>
                        <div className="space-y-1">
                          {oddsTest.footballSports.slice(0, 3).map((sport: any) => (
                            <div key={sport.key} className="flex justify-between text-xs">
                              <span>{sport.title}</span>
                              <Badge variant={sport.active ? "default" : "secondary"} className="text-xs">
                                {sport.active ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {oddsTest.oddsTest && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                          ✅ Teste de odds realizado com sucesso!
                          <br />
                          Esporte: {oddsTest.oddsTest.sport}
                          <br />
                          Jogos encontrados: {oddsTest.oddsTest.gamesFound}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {oddsTest.apiInfo && oddsTest.apiInfo.remainingRequests < 100 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Atenção:</strong> Poucas requisições restantes ({oddsTest.apiInfo.remainingRequests}).
                      Considere fazer upgrade do plano.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
