import { Card, CardContent } from "./ui/card"
import { AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface MetricExplanationProps {
  title: string
  reasons: string[]
  className?: string
}

export function MetricExplanation({ title, reasons, className }: MetricExplanationProps) {
  if (reasons.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">{title}</p>
              <ul className="space-y-1">
                {reasons.map((reason, index) => (
                  <li key={index} className="text-xs text-muted-foreground">
                    • {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
