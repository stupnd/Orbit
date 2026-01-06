import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { X } from "lucide-react"
import { useAppState } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import type { Deliverable, DeliverableStatus } from "@/lib/types"

interface DeliverableModalProps {
  isOpen: boolean
  onClose: () => void
  deliverable?: Deliverable // if provided, edit mode
}

export function DeliverableModal({ isOpen, onClose, deliverable }: DeliverableModalProps) {
  const { courses, addDeliverable, updateDeliverable } = useAppState()
  const isEditMode = !!deliverable

  const [title, setTitle] = useState("")
  const [courseId, setCourseId] = useState(courses[0]?.id || "")
  const [dueDate, setDueDate] = useState("")
  const [status, setStatus] = useState<DeliverableStatus>("incomplete")
  const [estimatedHours, setEstimatedHours] = useState("10")
  const [gradeWeight, setGradeWeight] = useState("10")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [targetGrade, setTargetGrade] = useState("85")
  const [actualGrade, setActualGrade] = useState("")

  // Pre-fill form when editing
  useEffect(() => {
    if (deliverable) {
      setTitle(deliverable.title)
      setCourseId(deliverable.courseId)
      setDueDate(deliverable.dueDate)
      setStatus(deliverable.status)
      setEstimatedHours(deliverable.estimatedHours.toString())
      setGradeWeight(deliverable.gradeWeight.toString())
      setPriority(deliverable.priority)
      setTargetGrade(deliverable.targetGrade?.toString() || "85")
      setActualGrade(deliverable.actualGrade?.toString() || "")
    } else {
      // Reset for create mode
      setTitle("")
      setCourseId(courses[0]?.id || "")
      setDueDate("")
      setStatus("incomplete")
      setEstimatedHours("10")
      setGradeWeight("10")
      setPriority("medium")
      setTargetGrade("85")
      setActualGrade("")
    }
  }, [deliverable, courses, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && courseId && dueDate) {
      const course = courses.find((c) => c.id === courseId)
      
      // Auto-set status to graded if actualGrade is entered
      let finalStatus = status
      if (actualGrade && parseFloat(actualGrade) >= 0 && status !== "graded") {
        finalStatus = "graded"
      }
      
      const deliverableData = {
        title: title.trim(),
        courseId,
        courseName: course?.name || "",
        dueDate,
        status: finalStatus,
        priority,
        estimatedHours: parseFloat(estimatedHours) || 0,
        gradeWeight: parseFloat(gradeWeight) || 0,
        targetGrade: parseFloat(targetGrade) || undefined,
        actualGrade: actualGrade ? parseFloat(actualGrade) : undefined,
        riskLevel: "low" as const,
      }

      if (isEditMode) {
        updateDeliverable(deliverable.id, deliverableData)
      } else {
        addDeliverable({
          id: Date.now().toString(),
          ...deliverableData,
        })
      }
      onClose()
    }
  }

  if (!isOpen) return null

  // Show actual grade input when status is graded
  const showActualGradeInput = status === "graded"

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isEditMode ? "Edit Deliverable" : "Add New Deliverable"}</CardTitle>
                  <CardDescription className="mt-1">
                    {isEditMode ? "Update deliverable details" : "Track an assignment, exam, or project"}
                  </CardDescription>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Deliverable Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Midterm Exam"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Course</label>
                  <Select value={courseId} onValueChange={setCourseId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.length === 0 ? (
                        <SelectItem value="" disabled>
                          No courses available
                        </SelectItem>
                      ) : (
                        courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Status
                    </label>
                    <Select
                      value={status}
                      onValueChange={(value) => setStatus(value as DeliverableStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incomplete">Incomplete</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="graded">Grade Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Priority
                    </label>
                    <Select
                      value={priority}
                      onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      min="0"
                      step="0.5"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Weight (% of final grade)
                  </label>
                  <input
                    type="number"
                    value={gradeWeight}
                    onChange={(e) => setGradeWeight(e.target.value)}
                    min="0"
                    max="100"
                    step="1"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Target Grade (%)
                  </label>
                  <input
                    type="number"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    min="0"
                    max="100"
                    step="1"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional: Your goal for this deliverable
                  </p>
                </div>

                {/* Actual Grade Section */}
                <div className="border-t border-border pt-4">
                  <label className="text-sm font-medium mb-2 block">
                    Actual Grade Received
                  </label>
                  
                  {showActualGradeInput ? (
                    <>
                      <input
                        type="number"
                        value={actualGrade}
                        onChange={(e) => setActualGrade(e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="Enter grade received"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Available when status is "Grade Received"
                      </p>
                    </>
                  ) : (
                    <>
                      <input
                        type="number"
                        value={actualGrade}
                        onChange={(e) => {
                          setActualGrade(e.target.value)
                          // Auto-set status to graded when entering a grade
                          if (e.target.value && parseFloat(e.target.value) >= 0) {
                            setStatus("graded")
                          }
                        }}
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="Enter grade to auto-set status to 'Grade Received'"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Entering a grade will automatically set status to "Grade Received"
                      </p>
                    </>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={courses.length === 0}>
                    {isEditMode ? "Save Changes" : "Add Deliverable"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
