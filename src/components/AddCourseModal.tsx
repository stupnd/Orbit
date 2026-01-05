import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import { useAppState } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"

interface AddCourseModalProps {
  isOpen: boolean
  onClose: () => void
}

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#8B5CF6", // purple
  "#EF4444", // red
  "#06B6D4", // cyan
  "#EC4899", // pink
  "#F97316", // orange
]

export function AddCourseModal({ isOpen, onClose }: AddCourseModalProps) {
  const { addCourse } = useAppState()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [color, setColor] = useState(COLORS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && code.trim()) {
      addCourse({
        id: Date.now().toString(),
        name: name.trim(),
        code: code.trim(),
        color,
      })
      setName("")
      setCode("")
      setColor(COLORS[0])
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
                  <CardTitle>Add New Course</CardTitle>
                  <CardDescription className="mt-1">
                    Create a new course to track deliverables
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
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CS229"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Machine Learning"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="w-8 h-8 rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: c,
                          borderColor: color === c ? "#000" : "transparent",
                          transform: color === c ? "scale(1.1)" : "scale(1)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Course
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
