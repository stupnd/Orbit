import { useState, useMemo } from "react"
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay, startOfDay, isSameDay } from "date-fns"
import { enUS } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useAppState } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DeliverableModal } from "@/components/DeliverableModal"
import { EmptyState } from "@/components/EmptyState"
import { Calendar as CalendarIcon, List, Plus, Circle } from "lucide-react"
import type { Deliverable } from "@/lib/types"
import { motion } from "framer-motion"

const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Deliverable
}

const statusConfig = {
  incomplete: { label: "Incomplete", color: "bg-gray-500", className: "bg-gray-100 text-gray-800" },
  in_progress: { label: "In Progress", color: "bg-blue-500", className: "bg-blue-100 text-blue-800" },
  submitted: { label: "Submitted", color: "bg-purple-500", className: "bg-purple-100 text-purple-800" },
  graded: { label: "Grade Received", color: "bg-green-500", className: "bg-green-100 text-green-800" },
}

export function Calendar() {
  const { courses, deliverables } = useAppState()
  const [view, setView] = useState<"month" | "agenda">("month")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | undefined>()
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Filter deliverables by course
  const filteredDeliverables = useMemo(() => {
    if (courseFilter === "all") return deliverables
    return deliverables.filter((d) => d.courseId === courseFilter)
  }, [deliverables, courseFilter])

  // Convert deliverables to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return filteredDeliverables.map((deliverable) => {
      const dueDate = new Date(deliverable.dueDate)
      return {
        id: deliverable.id,
        title: deliverable.title,
        start: dueDate,
        end: dueDate,
        resource: deliverable,
      }
    })
  }, [filteredDeliverables])

  // Group deliverables by date for agenda view
  const agendaGroups = useMemo(() => {
    const groups: { [key: string]: Deliverable[] } = {}
    const sortedDeliverables = [...filteredDeliverables]
      .filter((d) => d.status !== "graded")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    sortedDeliverables.forEach((deliverable) => {
      const dateKey = format(new Date(deliverable.dueDate), "yyyy-MM-dd")
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(deliverable)
    })

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredDeliverables])

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedDeliverable(event.resource)
    setShowEditModal(true)
  }

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate)
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    const course = courses.find((c) => c.id === event.resource.courseId)
    const courseColor = course?.color || "#3B82F6"

    return {
      style: {
        backgroundColor: `${courseColor}20`,
        borderLeft: `3px solid ${courseColor}`,
        color: "hsl(var(--foreground))",
        border: "none",
        borderRadius: "4px",
        padding: "2px 4px",
        fontSize: "12px",
      },
    }
  }

  const dayPropGetter = (date: Date) => {
    const isToday = isSameDay(date, new Date())
    if (isToday) {
      return {
        className: "rbc-today-highlight",
        style: {
          backgroundColor: "hsl(var(--accent))",
        },
      }
    }
    return {}
  }

  // Empty state
  if (deliverables.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            View your deliverables on a calendar
          </p>
        </div>

        <EmptyState
          icon={CalendarIcon}
          title="No deliverables yet"
          description="Add your first deliverable to see it on the calendar."
          action={
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Deliverable
            </Button>
          }
        />

        <DeliverableModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            View your deliverables on a calendar
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Deliverable
        </Button>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Tabs defaultValue="month" value={view} onValueChange={(v) => setView(v as "month" | "agenda")}>
            <TabsList>
              <TabsTrigger value="month">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Month
              </TabsTrigger>
              <TabsTrigger value="agenda">
                <List className="h-4 w-4 mr-2" />
                Agenda
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter:</span>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Calendar Views */}
      <Card className="p-4 md:p-6 calendar-container">
        {view === "month" ? (
          <div className="min-h-[600px]">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              onNavigate={handleNavigate}
              date={currentDate}
              view="month"
              views={["month"]}
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dayPropGetter}
              toolbar={true}
              components={{
                event: ({ event }: { event: CalendarEvent }) => {
                  const status = event.resource.status as keyof typeof statusConfig
                  const statusColor = statusConfig[status].color
                  return (
                    <div className="flex items-center gap-1">
                      <Circle className={`h-2 w-2 fill-current ${statusColor}`} />
                      <span className="truncate text-xs">{event.title}</span>
                    </div>
                  )
                },
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {agendaGroups.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No upcoming deliverables
              </div>
            ) : (
              agendaGroups.map(([dateKey, items], groupIndex) => {
                const date = new Date(dateKey)
                const isToday = isSameDay(date, new Date())
                const isPast = date < startOfDay(new Date())

                return (
                  <motion.div
                    key={dateKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.05 }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-semibold ${
                            isToday ? "text-primary" : isPast ? "text-muted-foreground" : ""
                          }`}
                        >
                          {format(date, "EEEE, MMMM d, yyyy")}
                        </h3>
                        {isToday && (
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            Today
                          </Badge>
                        )}
                        {isPast && !isToday && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive">
                            Past Due
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 pl-4">
                        {items.map((deliverable) => {
                          const course = courses.find((c) => c.id === deliverable.courseId)
                          const courseColor = course?.color || "#3B82F6"
                          const status = statusConfig[deliverable.status]

                          return (
                            <motion.div
                              key={deliverable.id}
                              whileHover={{ scale: 1.01 }}
                              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                              style={{
                                borderLeft: `3px solid ${courseColor}`,
                              }}
                              onClick={() => {
                                setSelectedDeliverable(deliverable)
                                setShowEditModal(true)
                              }}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{deliverable.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {course?.name}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className={`text-xs ${status.className}`}>
                                    {status.label}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <span>⏱️ {deliverable.estimatedHours}h</span>
                                  <span>•</span>
                                  <span>📊 {deliverable.gradeWeight}%</span>
                                  {deliverable.actualGrade !== undefined && (
                                    <>
                                      <span>•</span>
                                      <span className="font-semibold text-foreground">
                                        Grade: {deliverable.actualGrade}%
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        )}
      </Card>

      {/* Modals */}
      <DeliverableModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
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
