import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Calendar, 
  Calculator,
  Menu,
  X,
  Plus,
  Settings,
  CalendarDays
} from "lucide-react"
import { Button } from "./ui/button"
import { AddCourseModal } from "./AddCourseModal"
import { DeliverableModal } from "./DeliverableModal"
import { SettingsModal } from "./SettingsModal"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useAppState } from "@/lib/store"

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Planner", href: "/planner", icon: Calendar },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "What-if Simulator", href: "/simulator", icon: Calculator },
]

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showDeliverableModal, setShowDeliverableModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const { courses, deliverables, weeklyTimeBudget } = useAppState()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : "-100%",
        }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border",
          "lg:translate-x-0 lg:static lg:z-auto",
          "transition-transform duration-300 ease-in-out"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <h1 className="text-xl font-bold">AI Student OS</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Quick Actions */}
          <div className="border-t border-border px-3 py-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setShowCourseModal(true)
                setSidebarOpen(false)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setShowDeliverableModal(true)
                setSidebarOpen(false)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Deliverable
            </Button>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-3 py-3">
            <button
              onClick={() => {
                setShowSettingsModal(true)
                setSidebarOpen(false)
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <div className="text-xs text-muted-foreground mt-2 px-3">
              {courses.length} course{courses.length !== 1 ? "s" : ""} • {deliverables.length} deliverable{deliverables.length !== 1 ? "s" : ""}
              <br />
              {weeklyTimeBudget}h/week budget
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Modals */}
      <AddCourseModal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} />
      <DeliverableModal
        isOpen={showDeliverableModal}
        onClose={() => setShowDeliverableModal(false)}
      />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="text-sm text-muted-foreground hidden sm:block">
              {courses.length} course{courses.length !== 1 ? "s" : ""} • {deliverables.length} deliverable{deliverables.length !== 1 ? "s" : ""}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
