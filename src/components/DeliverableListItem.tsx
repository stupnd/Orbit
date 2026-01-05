import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import { RiskBadge } from "./RiskBadge"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./ui/dropdown-menu"
import { DeliverableModal } from "./DeliverableModal"
import { ConfirmDialog } from "./ConfirmDialog"
import { Calendar, Clock, Target, MoreVertical, Edit2, Trash2, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppState } from "@/lib/store"
import type { Deliverable } from "@/lib/types"
import { format } from "date-fns"

interface DeliverableListItemProps {
  deliverable: Deliverable
  onClick?: () => void
  className?: string
  showCourseColor?: boolean
}

const statusConfig = {
  not_started: {
    label: "Not Started",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-100 text-red-800 border-red-200",
  },
}

const priorityConfig = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

export function DeliverableListItem({
  deliverable,
  onClick,
  className,
  showCourseColor = false,
}: DeliverableListItemProps) {
  const { courses, updateDeliverable, deleteDeliverable } = useAppState()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const status = statusConfig[deliverable.status]
  const dueDate = new Date(deliverable.dueDate)
  const isOverdue = dueDate < new Date() && deliverable.status !== "completed"

  const course = courses.find((c) => c.id === deliverable.courseId)
  const courseColor = course?.color || "#3B82F6"

  const handleToggleComplete = () => {
    const newStatus = deliverable.status === "completed" ? "in_progress" : "completed"
    updateDeliverable(deliverable.id, { status: newStatus })
  }

  const handleDelete = () => {
    deleteDeliverable(deliverable.id)
  }

  // Determine which grade to show
  const gradeDisplay = deliverable.actualGrade !== undefined
    ? `Grade: ${deliverable.actualGrade}%`
    : deliverable.targetGrade !== undefined
    ? `Target: ${deliverable.targetGrade}%`
    : "No grade yet"

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "p-4 hover:shadow-md transition-all relative overflow-hidden",
          isOverdue && "border-red-200",
          className
        )}
        style={
          showCourseColor
            ? {
                borderLeft: `3px solid ${courseColor}`,
              }
            : undefined
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div 
            className="flex-1 space-y-3 cursor-pointer" 
            onClick={onClick}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-base">{deliverable.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {deliverable.courseName}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
                <RiskBadge level={deliverable.riskLevel} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{format(dueDate, "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{deliverable.estimatedHours}h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                <span className={deliverable.actualGrade !== undefined ? "font-semibold text-foreground" : ""}>
                  {gradeDisplay}
                </span>
              </div>
              <Badge
                variant="outline"
                className={cn("text-xs", priorityConfig[deliverable.priority])}
              >
                {deliverable.priority} priority
              </Badge>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-accent rounded-md transition-colors">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleComplete}>
                  {deliverable.status === "completed" ? (
                    <>
                      <Circle className="h-4 w-4 mr-2" />
                      Mark Incomplete
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Edit Modal */}
        <DeliverableModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          deliverable={deliverable}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          title="Delete Deliverable"
          description={`Are you sure you want to delete "${deliverable.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </Card>
    </motion.div>
  )
}
