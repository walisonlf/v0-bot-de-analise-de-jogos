"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Bot, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { DatabaseService } from "@/lib/database-service"

interface ActivityItem {
  id: string
  type: "analysis" | "opportunity" | "error" | "success"
  message: string
  timestamp: string
  details?: any
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const logsData = await DatabaseService.getActivityLogs(20)

        // Transform the data to match our interface
        const transformedActivities: ActivityItem[] = logsData.map((log) => ({
          id: log.id,
          type: log.type as "analysis" | "opportunity" | "error" | "success",
          message: log.message,
          timestamp: log.created_at,
          details: log.details,
        }))

        setActivities(transformedActivities)
      } catch (error) {
        console.error("Erro ao carregar atividades:", error)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "analysis":
        return <Bot className="h-4 w-4 text-blue-600" />
      case "opportunity":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "analysis":
        return <Badge variant="secondary">Análise</Badge>
      case "opportunity":
        return <Badge variant="default">Oportunidade</Badge>
      case "error":
        return <Badge variant="destructive">Erro</Badge>
      case "success":
        return (
          <Badge variant="default" className="bg-green-600">
            Sucesso
          </Badge>
        )
      default:
        return <Badge variant="outline">Atividade</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Activity className="h-6 w-6 animate-pulse" />
            <span className="ml-2">Carregando atividades...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
        <CardDescription>Últimas ações e eventos do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityBadge(activity.type)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-sm">{activity.message}</p>
                    {activity.details && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(activity.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
