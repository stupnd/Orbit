import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/EmptyState"
import { DeliverableModal } from "@/components/DeliverableModal"
import { useAppState } from "@/lib/store"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Calculator,
  Clock,
  Plus,
  Target,
  Calendar,
} from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  calculateGradeWhatIf,
  calculateScoreOnItem,
  calculateDropLowest,
  calculateEffortTradeoff,
  calculateSchedulePlan,
} from "@/lib/simulator-calculations"

export function Simulator() {
  const { courses, deliverables, weeklyTimeBudget } = useAppState()
  const [activeTab, setActiveTab] = useState<"grade" | "effort" | "schedule">("grade")
  const [showDeliverableModal, setShowDeliverableModal] = useState(false)

  // Grade What-if state
  const [selectedCourseForGrade, setSelectedCourseForGrade] = useState<string>("")
  const [targetFinalGrade, setTargetFinalGrade] = useState(85)
  const [selectedItemForScore, setSelectedItemForScore] = useState<string>("")
  const [scoreOnItem, setScoreOnItem] = useState(85)

  // Effort Tradeoff state
  const [selectedDeliverablesForEffort, setSelectedDeliverablesForEffort] = useState<string[]>([])
  const [availableHours, setAvailableHours] = useState(10)

  // Schedule Planner state
  const [selectedCourseForSchedule, setSelectedCourseForSchedule] = useState<string>("")
  const [weeklyHours, setWeeklyHours] = useState(weeklyTimeBudget)

  // If no deliverables exist, show empty state
  if (deliverables.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">What-if Simulator</h1>
          <p className="text-muted-foreground mt-1">
            Answer real questions: what grades are needed, how to focus effort, and how to schedule work
          </p>
        </div>

        <EmptyState
          icon={Calculator}
          title="No deliverables to simulate"
          description="Add some deliverables first to explore different scenarios and plan your work."
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

  // Set default course if not set
  if (!selectedCourseForGrade && courses.length > 0) {
    setSelectedCourseForGrade(courses[0].id)
  }
  if (!selectedCourseForSchedule && courses.length > 0) {
    setSelectedCourseForSchedule(courses[0].id)
  }

  // Grade What-if calculations
  const gradeWhatIfResult = useMemo(() => {
    if (!selectedCourseForGrade) return null
    return calculateGradeWhatIf(deliverables, selectedCourseForGrade, targetFinalGrade)
  }, [deliverables, selectedCourseForGrade, targetFinalGrade])

  const scoreOnItemResult = useMemo(() => {
    if (!selectedCourseForGrade || !selectedItemForScore) return null
    return calculateScoreOnItem(
      deliverables,
      selectedCourseForGrade,
      selectedItemForScore,
      scoreOnItem,
      targetFinalGrade
    )
  }, [deliverables, selectedCourseForGrade, selectedItemForScore, scoreOnItem, targetFinalGrade])

  const dropLowestResult = useMemo(() => {
    if (!selectedCourseForGrade) return null
    return calculateDropLowest(deliverables, selectedCourseForGrade)
  }, [deliverables, selectedCourseForGrade])

  // Effort Tradeoff calculation
  const effortTradeoffResult = useMemo(() => {
    if (selectedDeliverablesForEffort.length === 0) return null
    return calculateEffortTradeoff(deliverables, selectedDeliverablesForEffort, availableHours)
  }, [deliverables, selectedDeliverablesForEffort, availableHours])

  // Schedule Planner calculation
  const schedulePlan = useMemo(() => {
    if (!selectedCourseForSchedule) return null
    const course = courses.find((c) => c.id === selectedCourseForSchedule)
    return calculateSchedulePlan(
      deliverables.filter((d) => d.courseId === selectedCourseForSchedule),
      weeklyHours,
      course?.scheduleBlocks || []
    )
  }, [deliverables, selectedCourseForSchedule, weeklyHours, courses])

  const courseDeliverables = useMemo(() => {
    if (!selectedCourseForGrade) return []
    return deliverables.filter((d) => d.courseId === selectedCourseForGrade)
  }, [deliverables, selectedCourseForGrade])

  const availableDeliverables = useMemo(() => {
    return deliverables.filter(
      (d) => d.status !== "graded" && d.status !== "submitted"
    )
  }, [deliverables])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">What-if Simulator</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Answer real questions: what grades are needed, how to focus effort, and how to schedule work
        </p>
      </div>

      <Tabs defaultValue="grade" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grade">
            <Target className="h-4 w-4 mr-2" />
            Grade What-if
          </TabsTrigger>
          <TabsTrigger value="effort">
            <Clock className="h-4 w-4 mr-2" />
            Effort Tradeoff
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Planner
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Grade What-if */}
        <TabsContent value="grade" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Grade Scenarios
                </CardTitle>
                <CardDescription>
                  Explore what grades you need to achieve your target
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Course Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Course</label>
                  <Select
                    value={selectedCourseForGrade}
                    onValueChange={setSelectedCourseForGrade}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Final Grade */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Target Final Grade (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={targetFinalGrade}
                    onChange={(e) => setTargetFinalGrade(Number(e.target.value))}
                  />
                </div>

                {/* Score on Specific Item */}
                {courseDeliverables.length > 0 && (
                  <div className="space-y-3 border-t pt-4">
                    <label className="text-sm font-medium block">
                      What if I score X on a specific item?
                    </label>
                    <Select
                      value={selectedItemForScore}
                      onValueChange={setSelectedItemForScore}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseDeliverables.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.title} ({d.gradeWeight}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedItemForScore && (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={scoreOnItem}
                        onChange={(e) => setScoreOnItem(Number(e.target.value))}
                        placeholder="Score on this item"
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>Calculated outcomes based on your inputs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main What-if Result */}
                {gradeWhatIfResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border border-border bg-card"
                  >
                    <h4 className="font-semibold mb-3">
                      To achieve {targetFinalGrade}% final grade:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current average:</span>
                        <span className="font-medium">
                          {gradeWhatIfResult.currentWeightedAvg.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight covered:</span>
                        <span className="font-medium">
                          {gradeWhatIfResult.weightCovered.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight remaining:</span>
                        <span className="font-medium">
                          {gradeWhatIfResult.weightRemaining.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-medium">Needed average on remaining:</span>
                        <span
                          className={`font-bold text-lg ${
                            gradeWhatIfResult.neededAvgOnRemaining > 100
                              ? "text-red-600"
                              : gradeWhatIfResult.neededAvgOnRemaining > 90
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {gradeWhatIfResult.neededAvgOnRemaining.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                      {gradeWhatIfResult.explanation}
                    </p>
                  </motion.div>
                )}

                {/* Score on Item Result */}
                {scoreOnItemResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-lg border border-border bg-card"
                  >
                    <h4 className="font-semibold mb-3">
                      If you score {scoreOnItem}% on selected item:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Resulting final grade:</span>
                        <span className="font-bold text-lg">
                          {scoreOnItemResult.resultingFinalGrade.toFixed(1)}%
                        </span>
                      </div>
                      {scoreOnItemResult.neededOnOtherRemaining > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Needed on other remaining:
                          </span>
                          <span className="font-medium">
                            {scoreOnItemResult.neededOnOtherRemaining.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                      {scoreOnItemResult.explanation}
                    </p>
                  </motion.div>
                )}

                {/* Drop Lowest Result */}
                {dropLowestResult && dropLowestResult.droppedItem && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-lg border border-border bg-card"
                  >
                    <h4 className="font-semibold mb-3">Drop Lowest Item:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dropped item:</span>
                        <span className="font-medium">
                          {dropLowestResult.droppedItem.title} (
                          {dropLowestResult.droppedItem.actualGrade ||
                            dropLowestResult.droppedItem.currentGrade}
                          %)
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-medium">New final grade:</span>
                        <span
                          className={`font-bold text-lg ${
                            dropLowestResult.gradeChange > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {dropLowestResult.newFinalGrade.toFixed(1)}%
                          {dropLowestResult.gradeChange !== 0 && (
                            <span className="text-sm ml-2">
                              ({dropLowestResult.gradeChange >= 0 ? "+" : ""}
                              {dropLowestResult.gradeChange.toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                      {dropLowestResult.explanation}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Effort Tradeoff */}
        <TabsContent value="effort" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Effort Allocation
                </CardTitle>
                <CardDescription>
                  Choose 1-2 deliverables and available hours to get a recommended focus split
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Available Hours */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Available Hours
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="40"
                    value={availableHours}
                    onChange={(e) => setAvailableHours(Number(e.target.value))}
                  />
                </div>

                {/* Deliverable Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Select Deliverables (1-2)
                  </label>
                  <div className="space-y-2">
                    {[0, 1].map((index) => (
                      <Select
                        key={index}
                        value={selectedDeliverablesForEffort[index] || ""}
                        onValueChange={(value) => {
                          const newSelection = [...selectedDeliverablesForEffort]
                          if (value === "") {
                            newSelection.splice(index, 1)
                          } else {
                            newSelection[index] = value
                            if (newSelection.length > 2) newSelection.pop()
                          }
                          setSelectedDeliverablesForEffort(newSelection.filter(Boolean))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Deliverable ${index + 1} (optional)`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {availableDeliverables.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.title} - {d.courseName} ({d.estimatedHours}h, due{" "}
                              {format(new Date(d.dueDate), "MMM d")})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Split</CardTitle>
                <CardDescription>Optimized allocation based on priority</CardDescription>
              </CardHeader>
              <CardContent>
                {effortTradeoffResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm leading-relaxed">{effortTradeoffResult.explanation}</p>
                    </div>

                    <div className="space-y-3">
                      {effortTradeoffResult.recommendedSplit.map((split, index) => (
                        <motion.div
                          key={split.deliverableId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg border border-border bg-card"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-semibold">{split.deliverableTitle}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {split.reasoning}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">{split.recommendedHours}h</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total allocated:</span>
                        <span className="font-semibold">
                          {effortTradeoffResult.totalHours}h of {availableHours}h
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Select 1-2 deliverables and enter available hours to see recommendations
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Schedule Planner */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Setup
                </CardTitle>
                <CardDescription>
                  Set weekly hours and course schedule to get a 7-day plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Course Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Course</label>
                  <Select
                    value={selectedCourseForSchedule}
                    onValueChange={setSelectedCourseForSchedule}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Weekly Hours */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Weekly Available Hours
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="80"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Average: {(weeklyHours / 7).toFixed(1)}h per day
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                  <p>
                    Schedule blocks (class times) can be added in Course settings. The planner will
                    automatically account for class time when suggesting work blocks.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <CardTitle>7-Day Schedule Plan</CardTitle>
                <CardDescription>Suggested time blocks and priorities</CardDescription>
              </CardHeader>
              <CardContent>
                {schedulePlan ? (
                  <div className="space-y-4">
                    {/* Top 3 Priorities */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <h4 className="font-semibold mb-3">Top 3 Priorities</h4>
                      <div className="space-y-2">
                        {schedulePlan.top3Priorities.map((priority, index) => (
                          <div key={priority.deliverableId} className="text-sm">
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-muted-foreground">
                                {index + 1}.
                              </span>
                              <div className="flex-1">
                                <p className="font-medium">{priority.deliverableTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  {priority.courseName} • {priority.hoursNeeded}h needed •{" "}
                                  {priority.reasoning}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 7-Day Schedule */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Daily Schedule</h4>
                      {schedulePlan.days.map((day, index) => (
                        <motion.div
                          key={day.date}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 rounded-lg border border-border bg-card"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-sm">{day.dayName}</p>
                            <p className="text-xs text-muted-foreground">
                              {day.availableHours.toFixed(1)}h available
                            </p>
                          </div>
                          <div className="space-y-1">
                            {day.suggestedBlocks.map((block, blockIndex) => (
                              <div
                                key={blockIndex}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="text-muted-foreground w-24">
                                  {block.time}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded ${
                                    block.type === "class"
                                      ? "bg-blue-100 text-blue-800"
                                      : block.type === "work"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {block.type === "class"
                                    ? "Class"
                                    : block.type === "work"
                                    ? block.deliverableTitle || "Work"
                                    : "Break"}
                                </span>
                                {block.hours > 0 && (
                                  <span className="text-muted-foreground">
                                    ({block.hours.toFixed(1)}h)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        {schedulePlan.explanation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Select a course and set weekly hours to see your schedule plan
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <DeliverableModal
        isOpen={showDeliverableModal}
        onClose={() => setShowDeliverableModal(false)}
      />
    </div>
  )
}
