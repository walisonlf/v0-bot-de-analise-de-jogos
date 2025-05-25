"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface AnalyticsData {
  date: string
  gamesAnalyzed: number
  opportunitiesFound: number
  successRate: number
}

interface AnalyticsChartProps {
  data: AnalyticsData[]
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const formattedData = data
    .map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
    }))
    .reverse()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Jogos Analisados */}
      <Card>
        <CardHeader>
          <CardTitle>Jogos Analisados</CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip labelFormatter={(label) => `Data: ${label}`} formatter={(value) => [value, "Jogos"]} />
              <Bar dataKey="gamesAnalyzed" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Taxa de Sucesso */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Sucesso</CardTitle>
          <CardDescription>Evolução da performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                labelFormatter={(label) => `Data: ${label}`}
                formatter={(value) => [`${Number(value).toFixed(1)}%`, "Taxa de Sucesso"]}
              />
              <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Oportunidades */}
      <Card>
        <CardHeader>
          <CardTitle>Oportunidades Encontradas</CardTitle>
          <CardDescription>Distribuição por dia</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip labelFormatter={(label) => `Data: ${label}`} formatter={(value) => [value, "Oportunidades"]} />
              <Bar dataKey="opportunitiesFound" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resumo Estatístico */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Estatístico</CardTitle>
          <CardDescription>Métricas dos últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total de jogos:</span>
              <span className="font-bold">{data.reduce((sum, day) => sum + day.gamesAnalyzed, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total de oportunidades:</span>
              <span className="font-bold">{data.reduce((sum, day) => sum + day.opportunitiesFound, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Taxa média de sucesso:</span>
              <span className="font-bold">
                {(data.reduce((sum, day) => sum + day.successRate, 0) / data.length || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Oportunidades por jogo:</span>
              <span className="font-bold">
                {(
                  data.reduce((sum, day) => sum + day.opportunitiesFound, 0) /
                    data.reduce((sum, day) => sum + day.gamesAnalyzed, 0) || 0
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
