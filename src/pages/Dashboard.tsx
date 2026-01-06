import { useState } from "react"
import { ChartCard } from "@/components/ChartCard"
import { CollapsibleExplanation } from "@/components/CollapsibleExplanation"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddCourseModal } from "@/components/AddCourseModal"
import { DeliverableModal } from "@/components/DeliverableModal"
import { useAppState } from "@/lib/store"
import { Link, useNavigate } from "react-router-dom"
import {
  calculateAcademicHealth,
  calculateOverloadRisk,
  getWorkloadData,
  getGradeProjection,
  getNextDeadline,
  getOverdueAndAtRisk,
  getHoursDue7Days,
  getGradeTracking,
  getTodaysFocus,
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
import {
  AlertTriangle,
  BookOpen,
  Clock,
  Target,
  BookMarked,
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
} from "lucide-react"
import { format, differenceInDays, startOfDay } from "date-fns"
import { motion } from "framer-motion"
import type { Deliverable } from "@/lib/types"

export function Dashboard() {
  const { courses, deliverables, weeklyTimeBudget, updateDeliverable } = useAppState()
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showDeliverableModal, setShowDeliverableModal] = useState(false)
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | undefined>()
  const [showEditModal, setShowEditModal] = useState(false)
  const navigate = useNavigate()

  // If no data exists, show empty state
  if (courses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Your command center for academic success
          </p>
        </div>

        <EmptyState
          icon={BookMarked}
          title="Welcome to Orbit"
          description="Get started by adding your first course and deliverables. We'll help you stay on track and make smart decisions about your workload."
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
            Your command center for academic success
          </p>
        </div>

        <EmptyState
          icon={BookOpen}
          title="Add your first deliverable"
          description="Start tracking assignments, exams, and projects to see actionable insights about your workload and grades."
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

  // Calculate new actionable metrics
  const nextDeadline = getNextDeadline(deliverables)
  const { overdueCount, atRiskCount } = getOverdueAndAtRisk(deliverables, weeklyTimeBudget)
  const { hours: hoursDue7Days, utilization } = getHoursDue7Days(deliverables, weeklyTimeBudget)
  const gradeTracking = getGradeTracking(deliverables, 85) // 85% default target
  const todaysFocus = getTodaysFocus(deliverables)

  // Calculate existing metrics for explanations
  const academicHealth = calculateAcademicHealth(deliverables, weeklyTimeBudget)
  const overloadRisk = calculateOverloadRisk(deliverables, weeklyTimeBudget)
  const workloadData = getWorkloadData(deliverables)
  const gradeProjection = getGradeProjection(deliverables)

  const activeDeliverables = deliverables.filter((d) => d.status !== "graded")

  // Check for mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Days until next deadline
  const daysUntilNext = nextDeadline
    ? differenceInDays(new Date(nextDeadline.dueDate), startOfDay(new Date()))
    : null

  const isOverdue = daysUntilNext !== null && daysUntilNext < 0

  // Status config for badges
  const statusConfig = {
    incomplete: { label: "Incomplete", className: "bg-gray-100 text-gray-800" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800" },
    submitted: { label: "Submitted", className: "bg-purple-100 text-purple-800" },
    graded: { label: "Grade Received", className: "bg-green-100 text-green-800" },
  }

  const handleQuickStatusUpdate = (deliverable: Deliverable, newStatus: Deliverable["status"]) => {
    updateDeliverable(deliverable.id, { status: newStatus })
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Your command center for academic success
        </p>
      </div>

      {/* Actionable Metrics - 2x2 Grid on Mobile */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {/* 1. Next Deadline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="col-span-2 lg:col-span-1"
        >
          <Card
            className="cursor-pointer hover:bg-accent/50 transition-colors h-full"
            onClick={() => {
              if (nextDeadline) {
                setSelectedDeliverable(nextDeadline)
                setShowEditModal(true)
              }
            }}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Next Deadline</p>
                  {nextDeadline ? (
                    <>
                      <p className="font-semibold text-base md:text-lg mt-1 truncate">
                        {nextDeadline.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {nextDeadline.courseName}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <p className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-foreground"}`}>
                          {isOverdue
                            ? `Overdue by ${Math.abs(daysUntilNext!)} day${Math.abs(daysUntilNext!) !== 1 ? "s" : ""}`
                            : daysUntilNext === 0
                            ? "Due today"
                            : `In ${daysUntilNext} day${daysUntilNext !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(nextDeadline.dueDate), "MMM d, yyyy")}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      No upcoming deadlines
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. Overdue / At-Risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className="cursor-pointer hover:bg-accent/50 transition-colors h-full"
            onClick={() => navigate("/planner")}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${overdueCount > 0 || atRiskCount > 0 ? "bg-red-500/10" : "bg-green-500/10"}`}>
                  <AlertTriangle className={`h-5 w-5 ${overdueCount > 0 || atRiskCount > 0 ? "text-red-600" : "text-green-600"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Overdue / At-Risk</p>
                  {overdueCount === 0 && atRiskCount === 0 ? (
                    <p className="text-base md:text-lg font-semibold mt-1">
                      All clear
                    </p>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-xl md:text-2xl font-bold text-red-600">
                          {overdueCount + atRiskCount}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {overdueCount} overdue • {atRiskCount} at-risk
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3. Hours Due (7 days) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Hours Due (7 days)</p>
                  {hoursDue7Days === 0 ? (
                    <p className="text-base md:text-lg font-semibold mt-1">
                      No work due
                    </p>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1 mt-1">
                        <p className="text-xl md:text-2xl font-bold">
                          {Math.round(hoursDue7Days)}h
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(hoursDue7Days)}h of {weeklyTimeBudget}h weekly budget
                      </p>
                      <p className={`text-xs font-medium mt-0.5 ${utilization > 100 ? "text-red-600" : utilization > 70 ? "text-orange-600" : "text-green-600"}`}>
                        {Math.round(utilization)}% utilization
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 4. On-Track Grade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Grade Tracking</p>
                  {gradeTracking.currentAvg === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">
                      No grades yet
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xl md:text-2xl font-bold">
                          {gradeTracking.currentAvg.toFixed(1)}%
                        </p>
                        {gradeTracking.status === "on-track" && (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        )}
                        {gradeTracking.status === "slightly-behind" && (
                          <Minus className="h-4 w-4 text-orange-600" />
                        )}
                        {gradeTracking.status === "at-risk" && (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Projected: {gradeTracking.projectedFinal.toFixed(1)}%
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs mt-1 ${
                          gradeTracking.status === "on-track"
                            ? "bg-green-100 text-green-800"
                            : gradeTracking.status === "slightly-behind"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {gradeTracking.status === "on-track"
                          ? "On track"
                          : gradeTracking.status === "slightly-behind"
                          ? "Slightly behind"
                          : "At risk"}
                      </Badge>
                      {gradeTracking.hint && (
                        <p className="text-xs text-muted-foreground mt-2 leading-tight">
                          {gradeTracking.hint}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Explanations - Collapsible on Mobile */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-2">
        <CollapsibleExplanation
          title="Academic Health Score Factors"
          reasons={academicHealth.explanation}
          defaultOpen={!isMobile}
        />
        <CollapsibleExplanation
          title={`Overload Risk is ${overloadRisk.level}`}
          reasons={overloadRisk.explanation}
          defaultOpen={!isMobile}
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
              ) : nextDeadline ? (
                <div className="space-y-3 text-sm">
                  <p className="text-center text-muted-foreground">
                    No deadlines in the next 7 days
                  </p>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                    <p className="font-medium text-foreground">Next due:</p>
                    <p className="text-muted-foreground">{nextDeadline.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(nextDeadline.dueDate), "EEE, MMM d")}
                      {daysUntilNext !== null && ` (in ${daysUntilNext} day${daysUntilNext !== 1 ? "s" : ""})`}
                    </p>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Total active: {activeDeliverables.length}
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  No work due soon
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-semibold text-lg">
                    {Math.round(workloadData.reduce((sum, d) => sum + d.hours, 0))}h
                  </p>
                  <p className="text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {Math.round(Math.max(...workloadData.map((d) => d.hours)))}h
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
                    tickFormatter={(value) => format(new Date(value), "EEE")}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    labelFormatter={(value) => format(new Date(value as string), "EEE, MMM d")}
                    formatter={(value) => {
                      const num = typeof value === "number" ? value : 0
                      return [`${Math.round(num)}h`, "Hours"]
                    }}
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
          description={`${gradeTracking.weightCovered.toFixed(0)}% of course weight graded`}
        >
          {gradeTracking.currentAvg === 0 ? (
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
                    {gradeTracking.currentAvg.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground">Current Avg</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {gradeTracking.weightCovered.toFixed(0)}%
                  </p>
                  <p className="text-muted-foreground">Weight Done</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {gradeTracking.projectedFinal.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground">Projected</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={gradeProjection}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), "M/d")}
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
                    labelFormatter={(value) => format(new Date(value as string), "MMM d")}
                    formatter={(value) => {
                      const num = typeof value === "number" ? value : 0
                      return [`${num.toFixed(1)}%`, ""]
                    }}
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

      {/* Today's Focus */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg md:text-xl">Today's Focus</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Prioritized by urgency, hours, and weight
              </p>
            </div>
            <Link to="/planner">
              <Button variant="ghost" size="sm" className="text-xs">
                View all
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {todaysFocus.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No active deliverables - you're all caught up!
            </div>
          ) : (
            <div className="space-y-2">
              {todaysFocus.map((deliverable, index) => {
                const remainingHours =
                  deliverable.status === "submitted" || deliverable.status === "graded"
                    ? 0
                    : deliverable.estimatedHours
                const daysUntil = differenceInDays(
                  new Date(deliverable.dueDate),
                  startOfDay(new Date())
                )
                const isOverdue = daysUntil < 0

                return (
                  <motion.div
                    key={deliverable.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{deliverable.title}</p>
                              {isOverdue && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 text-xs">
                                  Overdue
                                </Badge>
                              )}
                            </div>
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
                          <span>
                            📅{" "}
                            {isOverdue
                              ? `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""} overdue`
                              : daysUntil === 0
                              ? "Due today"
                              : `Due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`}
                          </span>
                          <span>•</span>
                          <span>
                            ⏱️ {remainingHours}h {remainingHours === 0 ? "(done)" : "left"}
                          </span>
                          <span>•</span>
                          <span>📊 {deliverable.gradeWeight}%</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {deliverable.status === "incomplete" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => handleQuickStatusUpdate(deliverable, "in_progress")}
                            >
                              Start Working
                            </Button>
                          )}
                          {deliverable.status === "in_progress" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => handleQuickStatusUpdate(deliverable, "submitted")}
                            >
                              Mark Submitted
                            </Button>
                          )}
                          {deliverable.status === "submitted" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => {
                                setSelectedDeliverable(deliverable)
                                setShowEditModal(true)
                              }}
                            >
                              Enter Grade
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSelectedDeliverable(deliverable)
                              setShowEditModal(true)
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <DeliverableModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedDeliverable(undefined)
        }}
        deliverable={selectedDeliverable}
      />
    </div>
  )
}
