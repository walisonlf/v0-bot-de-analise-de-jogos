import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"

interface BotStatusProps {
  status: "online" | "offline" | "analyzing"
}

export function BotStatus({ status }: BotStatusProps) {
  const statusConfig = {
    online: {
      label: "Online",
      color: "bg-green-500",
      icon: CheckCircle,
      variant: "default" as const,
    },
    offline: {
      label: "Offline",
      color: "bg-red-500",
      icon: AlertCircle,
      variant: "destructive" as const,
    },
    analyzing: {
      label: "Analisando",
      color: "bg-blue-500",
      icon: Clock,
      variant: "secondary" as const,
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    </div>
  )
}
