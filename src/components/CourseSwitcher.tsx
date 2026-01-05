import { Select } from "./ui/select"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Course } from "@/lib/types"

interface CourseSwitcherProps {
  courses: Course[]
  selectedCourseId?: string
  onCourseChange?: (courseId: string) => void
  className?: string
}

export function CourseSwitcher({
  courses,
  selectedCourseId,
  onCourseChange,
  className,
}: CourseSwitcherProps) {
  return (
    <div className={cn("relative", className)}>
      <Select
        value={selectedCourseId || courses[0]?.id}
        onChange={(e) => onCourseChange?.(e.target.value)}
        className="w-[200px] appearance-none pr-8"
      >
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.code} - {course.name}
          </option>
        ))}
      </Select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}
