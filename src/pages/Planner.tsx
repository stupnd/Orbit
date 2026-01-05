import { useState } from "react"
import { DeliverableListItem } from "@/components/DeliverableListItem"
import { EmptyState } from "@/components/EmptyState"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DeliverableModal } from "@/components/DeliverableModal"
import { useAppState } from "@/lib/store"
import type { DeliverableStatus } from "@/lib/types"
import { Calendar, Filter, Plus } from "lucide-react"
import { motion } from "framer-motion"

export function Planner() {
  const { deliverables, courses } = useAppState()
  const [statusFilter, setStatusFilter] = useState<DeliverableStatus | "all">("all")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "priority">("date")
  const [showDeliverableModal, setShowDeliverableModal] = useState(false)

  const filteredDeliverables = deliverables
    .filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false
      if (courseFilter !== "all" && d.courseId !== courseFilter) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      } else {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
    })

  // If no deliverables exist, show empty state
  if (deliverables.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planner</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your course deliverables
          </p>
        </div>

        <EmptyState
          icon={Calendar}
          title="No deliverables yet"
          description="Add your first assignment, exam, or project to start tracking your workload."
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planner</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your course deliverables
          </p>
        </div>
        <Button onClick={() => setShowDeliverableModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Deliverable
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DeliverableStatus | "all")}
          className="w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </Select>

        <Select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="w-[180px]"
        >
          <option value="all">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name}
            </option>
          ))}
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "date" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("date")}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Date
            </Button>
            <Button
              variant={sortBy === "priority" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("priority")}
            >
              Priority
            </Button>
          </div>
        </div>
      </div>

      {/* Deliverables List */}
      {filteredDeliverables.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No deliverables match your filters"
          description="Try adjusting your filters to see more results."
        />
      ) : (
        <div className="space-y-4">
          {filteredDeliverables.map((deliverable) => (
            <DeliverableListItem
              key={deliverable.id}
              deliverable={deliverable}
              showCourseColor={true}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-4 p-4 bg-card rounded-lg border border-border"
      >
        <div className="text-center">
          <div className="text-2xl font-bold">{filteredDeliverables.length}</div>
          <div className="text-sm text-muted-foreground">
            {statusFilter === "all" ? "Total" : "Filtered"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {deliverables.filter((d) => d.status === "in_progress").length}
          </div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {deliverables.filter((d) => d.status === "completed").length}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {deliverables.reduce((sum, d) => sum + d.estimatedHours, 0).toFixed(0)}h
          </div>
          <div className="text-sm text-muted-foreground">Total Hours</div>
        </div>
      </motion.div>

      <DeliverableModal
        isOpen={showDeliverableModal}
        onClose={() => setShowDeliverableModal(false)}
      />
    </div>
  )
}
