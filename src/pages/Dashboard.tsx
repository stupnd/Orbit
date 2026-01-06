import { useState } from "react"
import { MetricCard } from "@/components/MetricCard"
import { ChartCard } from "@/components/ChartCard"
import { CollapsibleExplanation } from "@/components/CollapsibleExplanation"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddCourseModal } from "@/components/AddCourseModal"
import { DeliverableModal } from "@/components/DeliverableModal"
import { useAppState } from "@/lib/store"
import { Link } from "react-router-dom"
import {
  calculateAcademicHealth,
  calculateOverloadRisk,
  calculateWeightedAverage,
  getWorkloadData,
  getGradeProjection,
} from "@/lib/calculations"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, AlertTriangle, BookOpen, Target, BookMarked, Plus } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"

export function Dashboard() {
  const { courses, deliverables, weeklyTimeBudget } = useAppState()
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showDeliverableModal, setShowDeliverableModal] = useState(false)

  // If no data exists, show empty state
  if (courses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your academic performance and workload
          </p>
        </div>

        <EmptyState
          icon={BookMarked}
          title="Welcome to AI Student OS"
          description="Get started by adding your first course and deliverables. We'll help you track your workload and stay on top of deadlines."
          action={
            <div className="flex gap-3">
              <Button onClick={() => setShowCourseModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
          }
        />

        <AddCourseModal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} />
      </div>
    )
  }

  if (deliverables.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your academic performance and workload
          </p>
        </div>

        <EmptyState
          icon={BookOpen}
          title="Add your first deliverable"
          description="Start tracking assignments, exams, and projects to see your personalized academic insights."
          action={
            <Button onClick={() => setShowDeliverableModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Deliverable
            </Button>
          }
        />

        <DeliverableModal
          isOpen={showDeliverableModal}
          onClose={() => setShowDeliverableModal(false)}
        />
      </div>
    )
  }

  // Calculate metrics from real data
  const academicHealth = calculateAcademicHealth(deliverables, weeklyTimeBudget)
  const overloadRisk = calculateOverloadRisk(deliverables, weeklyTimeBudget)
  const { average: weightedAverage, totalWeight, explanation: gradeExplanation } =
    calculateWeightedAverage(deliverables)
  const workloadData = getWorkloadData(deliverables)
  const gradeProjection = getGradeProjection(deliverables)

  const activeDeliverables = deliverables.filter((d) => d.status !== "graded")
  const inProgress = deliverables.filter((d) => d.status === "in_progress")

  // Get top 3 upcoming deliverables as action items
  const upcomingActions = deliverables
    .filter((d) => d.status !== "graded")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  // Get next deliverable info for better empty states
  const nextDeliverable = deliverables
    .filter((d) => d.status !== "graded")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

  const daysUntilNext = nextDeliverable 
    ? Math.ceil((new Date(nextDeliverable.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Overview of your academic performance and workload
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <MetricCard
          title="Academic Health Score"
          value={academicHealth.score}
          subtitle="Based on your inputs"
          trend={academicHealth.trend}
          trendValue={`${academicHealth.score >= 75 ? "Good" : academicHealth.score >= 50 ? "Fair" : "Needs attention"}`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Overload Risk"
          value={overloadRisk.score}
          subtitle={`${overloadRisk.level} risk level`}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Deliverables"
          value={activeDeliverables.length}
          subtitle={`${inProgress.length} in progress`}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <MetricCard
          title="Weighted Average"
          value={weightedAverage > 0 ? `${weightedAverage.toFixed(1)}%` : "N/A"}
          subtitle="Across graded work"
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      {/* Metric Explanations - Collapsible */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-2">
        <CollapsibleExplanation
          title="Academic Health Score Factors"
          reasons={academicHealth.explanation}
        />
        <CollapsibleExplanation
          title={`Overload Risk is ${overloadRisk.level}`}
          reasons={overloadRisk.explanation}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <ChartCard
          title="Next 7 Days Workload"
          description={`Based on ${activeDeliverables.length} active deliverable${activeDeliverables.length !== 1 ? "s" : ""}`}
        >
          {workloadData.every((d) => d.hours === 0) ? (
            <div className="py-6 md:py-8">
              {activeDeliverables.length === 0 ? (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No active deliverables
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add a deliverable to see your workload
                  </p>
                </div>
              ) : nextDeliverable ? (
                <div className="space-y-3 text-sm">
                  <p className="text-center text-muted-foreground">
                    No deadlines in the next 7 days
                  </p>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                    <p className="font-medium text-foreground">Next due:</p>
                    <p className="text-muted-foreground">{nextDeliverable.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(nextDeliverable.dueDate), "MMM d, yyyy")}
                      {daysUntilNext !== null && ` (in ${daysUntilNext} day${daysUntilNext !== 1 ? "s" : ""})`}
                    </p>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Total active: {activeDeliverables.length} deliverable{activeDeliverables.length !== 1 ? "s" : ""}
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  No work due in the next 7 days
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-semibold text-lg">
                    {workloadData.reduce((sum, d) => sum + d.hours, 0)}h
                  </p>
                  <p className="text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {Math.max(...workloadData.map((d) => d.hours))}h
                  </p>
                  <p className="text-muted-foreground">Peak Day</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {workloadData.filter((d) => d.deliverables > 0).length}
                  </p>
                  <p className="text-muted-foreground">Days w/ Due</p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={workloadData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), "MMM d")}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHours)"
                    name="Hours"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Grade Projection"
          description={gradeExplanation.join(" • ")}
        >
          {weightedAverage === 0 ? (
            <div className="py-6 md:py-8 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Complete and grade deliverables to see projections
              </p>
              <p className="text-xs text-muted-foreground">
                Enter actual grades as you receive them
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-semibold text-lg">
                    {weightedAverage.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground">Current Avg</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {totalWeight.toFixed(0)}%
                  </p>
                  <p className="text-muted-foreground">Weight Done</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {gradeProjection[gradeProjection.length - 1]?.projected.toFixed(1) || "N/A"}%
                  </p>
                  <p className="text-muted-foreground">Projected</p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={gradeProjection}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), "MMM d")}
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis className="text-xs" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Current"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Projected"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Top 3 Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg md:text-xl">Top 3 Upcoming Deliverables</CardTitle>
            <Link to="/planner">
              <Button variant="ghost" size="sm" className="text-xs">
                View all →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {upcomingActions.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No upcoming deliverables
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingActions.map((deliverable, index) => {
                const remainingHours = 
                  deliverable.status === "submitted" || deliverable.status === "graded"
                    ? 0
                    : deliverable.estimatedHours

                const statusConfig = {
                  incomplete: { label: "Incomplete", className: "bg-gray-100 text-gray-800" },
                  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800" },
                  submitted: { label: "Submitted", className: "bg-purple-100 text-purple-800" },
                  graded: { label: "Grade Received", className: "bg-green-100 text-green-800" },
                }

                return (
                  <motion.div
                    key={deliverable.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{deliverable.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {deliverable.courseName}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${statusConfig[deliverable.status].className} flex-shrink-0`}
                        >
                          {statusConfig[deliverable.status].label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>📅 {format(new Date(deliverable.dueDate), "MMM d")}</span>
                        <span>•</span>
                        <span>⏱️ {remainingHours}h {remainingHours === 0 ? "(done)" : "left"}</span>
                        <span>•</span>
                        <span>📊 {deliverable.gradeWeight}%</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
