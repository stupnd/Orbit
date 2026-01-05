import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
  accentColor?: string
}

export function ChartCard({
  title,
  description,
  children,
  className,
  action,
  accentColor,
}: ChartCardProps) {
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  )
}
