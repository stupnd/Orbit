import { useState } from "react"
import { MetricCard } from "@/components/MetricCard"
import { ChartCard } from "@/components/ChartCard"
import { MetricExplanation } from "@/components/MetricExplanation"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddCourseModal } from "@/components/AddCourseModal"
import { DeliverableModal } from "@/components/DeliverableModal"
import { useAppState } from "@/lib/store"
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
  const { average: weightedAverage, explanation: gradeExplanation } =
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your academic performance and workload
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Metric Explanations */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricExplanation
          title="Academic Health Score Factors:"
          reasons={academicHealth.explanation}
        />
        <MetricExplanation
          title={`Overload Risk is ${overloadRisk.level} because:`}
          reasons={overloadRisk.explanation}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Next 7 Days Workload"
          description={`Based on ${activeDeliverables.length} active deliverable${activeDeliverables.length !== 1 ? "s" : ""}`}
        >
          {workloadData.every((d) => d.hours === 0) ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
              No work due in the next 7 days
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
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
                  fillOpacity={1}
                  fill="url(#colorHours)"
                  name="Hours"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Grade Projection"
          description={gradeExplanation.join(" • ")}
        >
          {weightedAverage === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
              Complete and grade deliverables to see projections
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={gradeProjection}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), "MMM d")}
                  className="text-xs"
                />
                <YAxis className="text-xs" domain={[0, 100]} />
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
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Projected"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Top 3 Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Upcoming Deliverables</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingActions.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No upcoming deliverables
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingActions.map((deliverable, index) => (
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
                    <p className="font-medium text-sm">{deliverable.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {deliverable.courseName}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Due: {format(new Date(deliverable.dueDate), "MMM d, yyyy")}</span>
                      <span>•</span>
                      <span>{deliverable.estimatedHours}h estimated</span>
                      <span>•</span>
                      <span>{deliverable.gradeWeight}% of grade</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
