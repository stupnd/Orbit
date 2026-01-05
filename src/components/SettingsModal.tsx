import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import { useAppState } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { weeklyTimeBudget, setWeeklyTimeBudget } = useAppState()
  const [budget, setBudget] = useState(weeklyTimeBudget.toString())

  useEffect(() => {
    setBudget(weeklyTimeBudget.toString())
  }, [weeklyTimeBudget])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const hours = parseFloat(budget)
    if (hours > 0 && hours <= 168) {
      setWeeklyTimeBudget(hours)
      onClose()
    }
  }

  if (!isOpen) return null

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
          className="relative z-10 w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription className="mt-1">
                    Configure your time budget and preferences
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
                    Weekly Time Budget (hours)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min="1"
                    max="168"
                    step="1"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How many hours per week can you dedicate to coursework?
                  </p>
                </div>

                <div className="bg-muted/50 p-3 rounded-md text-sm">
                  <p className="font-medium mb-1">Common budgets:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Full-time student: 30-40 hours/week</li>
                    <li>• Part-time student: 15-20 hours/week</li>
                    <li>• Working student: 10-15 hours/week</li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Save Changes
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
