import { Card, CardContent, CardHeader } from "./ui/card"
import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  className?: string
  showHeader?: boolean
}

export function SkeletonCard({ className, showHeader = true }: SkeletonCardProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      {showHeader && (
        <CardHeader>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </CardContent>
    </Card>
  )
}
