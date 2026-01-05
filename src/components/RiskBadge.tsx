import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { AlertTriangle, AlertCircle, CheckCircle2, XCircle } from "lucide-react"

interface RiskBadgeProps {
  level: "low" | "medium" | "high" | "critical"
  className?: string
}

const riskConfig = {
  low: {
    label: "Low Risk",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  },
  medium: {
    label: "Medium Risk",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: AlertCircle,
  },
  high: {
    label: "High Risk",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    icon: AlertTriangle,
  },
  critical: {
    label: "Critical Risk",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = riskConfig[level]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn("flex items-center gap-1.5", config.className, className)}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  )
}
