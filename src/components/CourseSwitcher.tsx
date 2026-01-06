import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Circle } from "lucide-react"
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
        onValueChange={onCourseChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {courses.map((course) => (
            <SelectItem key={course.id} value={course.id}>
              <div className="flex items-center gap-2">
                <Circle
                  className="h-2 w-2 fill-current"
                  style={{ color: course.color }}
                />
                <span>{course.code} - {course.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
