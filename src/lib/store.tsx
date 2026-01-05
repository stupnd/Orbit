import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import type { Course, Deliverable, DeliverableStatus } from "./types"

interface AppState {
  courses: Course[]
  deliverables: Deliverable[]
  weeklyTimeBudget: number // hours per week
}

interface AppContextType extends AppState {
  addCourse: (course: Course) => void
  updateCourse: (id: string, course: Partial<Course>) => void
  deleteCourse: (id: string) => void
  addDeliverable: (deliverable: Deliverable) => void
  updateDeliverable: (id: string, deliverable: Partial<Deliverable>) => void
  deleteDeliverable: (id: string) => void
  setWeeklyTimeBudget: (hours: number) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEY = "ai-student-os-data"

// Migration helper to convert old status values to new ones
function migrateDeliverableStatus(deliverable: any): any {
  if (!deliverable.status) {
    return { ...deliverable, status: 'incomplete' }
  }

  // Map old statuses to new ones
  const statusMap: Record<string, DeliverableStatus> = {
    'not_started': 'incomplete',
    'completed': deliverable.actualGrade !== undefined || deliverable.currentGrade !== undefined 
      ? 'graded' 
      : 'submitted',
    'overdue': 'incomplete', // Overdue items should be marked incomplete
    'in_progress': 'in_progress',
    // New statuses pass through
    'incomplete': 'incomplete',
    'submitted': 'submitted',
    'graded': 'graded',
  }

  return {
    ...deliverable,
    status: statusMap[deliverable.status] || 'incomplete',
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    // Load from localStorage or use defaults
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Migrate deliverable statuses if needed
        if (parsed.deliverables) {
          parsed.deliverables = parsed.deliverables.map(migrateDeliverableStatus)
        }
        return parsed
      } catch (e) {
        console.error("Failed to parse stored data:", e)
      }
    }
    return {
      courses: [],
      deliverables: [],
      weeklyTimeBudget: 30,
    }
  })

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const addCourse = (course: Course) => {
    setState((prev) => ({ ...prev, courses: [...prev.courses, course] }))
  }

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }))
  }

  const deleteCourse = (id: string) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== id),
      deliverables: prev.deliverables.filter((d) => d.courseId !== id),
    }))
  }

  const addDeliverable = (deliverable: Deliverable) => {
    setState((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, deliverable],
    }))
  }

  const updateDeliverable = (id: string, updates: Partial<Deliverable>) => {
    setState((prev) => ({
      ...prev,
      deliverables: prev.deliverables.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    }))
  }

  const deleteDeliverable = (id: string) => {
    setState((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((d) => d.id !== id),
    }))
  }

  const setWeeklyTimeBudget = (hours: number) => {
    setState((prev) => ({ ...prev, weeklyTimeBudget: hours }))
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        addCourse,
        updateCourse,
        deleteCourse,
        addDeliverable,
        updateDeliverable,
        deleteDeliverable,
        setWeeklyTimeBudget,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppState must be used within AppProvider")
  }
  return context
}
