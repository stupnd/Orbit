import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: "up" | "down" | "stable"
  trendValue?: string
  className?: string
  icon?: React.ReactNode
  accentColor?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  className,
  icon,
  accentColor,
}: MetricCardProps) {
  const trendIcon =
    trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : trend === "down" ? (
      <TrendingDown className="h-4 w-4 text-red-600" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground" />
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn("hover:shadow-md transition-shadow relative overflow-hidden", className)}
        style={
          accentColor
            ? {
                borderTop: `2px solid ${accentColor}20`,
              }
            : undefined
        }
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2 text-xs">
              {trendIcon}
              <span
                className={cn(
                  trend === "up" && "text-green-600",
                  trend === "down" && "text-red-600",
                  trend === "stable" && "text-muted-foreground"
                )}
              >
                {trendValue}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
