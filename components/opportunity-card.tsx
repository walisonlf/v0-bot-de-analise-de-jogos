import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, TrendingUp, DollarSign } from "lucide-react"

interface Opportunity {
  id: string
  homeTeam: string
  awayTeam: string
  league: string
  market: string
  selection: string
  odds: number
  value: number
  confidence: number
  bookmaker: string
  commenceTime: string
  status: "pending" | "won" | "lost" | "void"
}

interface OpportunityCardProps {
  opportunity: Opportunity
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const statusColors = {
    pending: "bg-yellow-500",
    won: "bg-green-500",
    lost: "bg-red-500",
    void: "bg-gray-500",
  }

  const statusLabels = {
    pending: "Pendente",
    won: "Ganhou",
    lost: "Perdeu",
    void: "Anulada",
  }

  const confidenceStars = "⭐".repeat(Math.min(Math.floor(opportunity.confidence * 5), 5))

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-sm">
                {opportunity.homeTeam} vs {opportunity.awayTeam}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {opportunity.league.replace("soccer_", "").replace("_", " ").toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[opportunity.status]}`} />
            <Badge variant="outline" className="text-xs">
              {statusLabels[opportunity.status]}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Mercado</p>
            <p className="font-medium text-sm">{opportunity.market}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Seleção</p>
            <p className="font-medium text-sm">{opportunity.selection}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="text-xs text-muted-foreground">Odd</span>
            </div>
            <p className="font-bold text-sm">{opportunity.odds.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-muted-foreground">Valor</span>
            </div>
            <p className="font-bold text-sm text-green-600">{(opportunity.value * 100).toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-xs text-muted-foreground">Confiança</span>
            </div>
            <p className="font-bold text-sm">{confidenceStars}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(opportunity.commenceTime).toLocaleString("pt-BR")}
          </div>
          <span>{opportunity.bookmaker}</span>
        </div>
      </CardContent>
    </Card>
  )
}
