import type { Deliverable, AcademicHealth, OverloadRisk } from "./types"
import { addDays, startOfDay } from "date-fns"

/**
 * Calculate academic health score based on user data
 */
export function calculateAcademicHealth(
  deliverables: Deliverable[],
  weeklyBudget: number
): AcademicHealth & { explanation: string[] } {
  const now = startOfDay(new Date())
  const graded = deliverables.filter((d) => d.status === "graded")
  const active = deliverables.filter((d) => d.status !== "graded")
  const overdue = active.filter((d) => new Date(d.dueDate) < now)

  // Workload factor (0-100)
  const next7Days = addDays(now, 7)
  const upcomingDeliverables = active.filter(
    (d) => new Date(d.dueDate) <= next7Days
  )
  const upcomingHours = upcomingDeliverables.reduce(
    (sum, d) => {
      if (d.status === "submitted" || d.status === "graded") return sum
      return sum + d.estimatedHours
    },
    0
  )
  const workloadScore = Math.max(0, 100 - (upcomingHours / weeklyBudget) * 50)

  // Grade factor (0-100)
  const gradedWithScores = graded.filter((d) => d.actualGrade !== undefined || d.currentGrade !== undefined)
  const avgGrade =
    gradedWithScores.length > 0
      ? gradedWithScores.reduce((sum, d) => sum + (d.actualGrade || d.currentGrade || 0), 0) /
        gradedWithScores.length
      : 80
  const gradeScore = avgGrade

  // Timeliness factor (0-100)
  const timelinessScore = active.length > 0
    ? Math.max(0, 100 - (overdue.length / active.length) * 100)
    : 100

  // Balance factor (based on distribution of work)
  const balanceScore =
    active.length > 0
      ? Math.min(100, (weeklyBudget / (upcomingHours / 7)) * 100)
      : 100

  // Overall score (weighted average)
  const score = Math.round(
    workloadScore * 0.3 + gradeScore * 0.3 + timelinessScore * 0.25 + balanceScore * 0.15
  )

  // Determine trend (simplified for now)
  const trend = score >= 75 ? "up" : score >= 50 ? "stable" : "down"

  const explanation: string[] = []
  
  if (workloadScore < 70) {
    explanation.push(
      `High upcoming workload: ${upcomingHours.toFixed(0)}h needed in next 7 days vs ${weeklyBudget}h/week budget`
    )
  }
  
  if (overdue.length > 0) {
    explanation.push(`${overdue.length} overdue deliverable${overdue.length > 1 ? "s" : ""}`)
  }
  
  if (gradedWithScores.length > 0) {
    explanation.push(`Average grade: ${avgGrade.toFixed(1)}% across ${gradedWithScores.length} graded item${gradedWithScores.length > 1 ? "s" : ""}`)
  }
  
  if (explanation.length === 0) {
    explanation.push("Looking good! Stay on track with your schedule.")
  }

  return {
    score,
    trend,
    factors: {
      workload: Math.round(workloadScore),
      grades: Math.round(gradeScore),
      timeliness: Math.round(timelinessScore),
      balance: Math.round(balanceScore),
    },
    explanation,
  }
}

/**
 * Calculate overload risk based on upcoming deliverables
 */
export function calculateOverloadRisk(
  deliverables: Deliverable[],
  weeklyBudget: number
): OverloadRisk & { explanation: string[] } {
  const now = startOfDay(new Date())
  const next7Days = addDays(now, 7)
  
  // Active deliverables are those not graded yet
  const active = deliverables.filter((d) => d.status !== "graded")
  const upcoming = active.filter((d) => new Date(d.dueDate) <= next7Days)
  const highPriority = upcoming.filter((d) => d.priority === "high")
  const highRisk = upcoming.filter((d) => d.riskLevel === "high")

  // Calculate remaining hours (submitted/graded have 0 remaining)
  const totalHours = upcoming.reduce((sum, d) => {
    if (d.status === "submitted" || d.status === "graded") return sum
    return sum + d.estimatedHours
  }, 0)
  const utilizationRate = (totalHours / weeklyBudget) * 100

  // Determine risk level
  let level: "low" | "medium" | "high" | "critical"
  let score: number

  if (utilizationRate < 70) {
    level = "low"
    score = Math.round(utilizationRate * 0.5)
  } else if (utilizationRate < 100) {
    level = "medium"
    score = Math.round(50 + (utilizationRate - 70) * 1.5)
  } else if (utilizationRate < 150) {
    level = "high"
    score = Math.round(70 + (utilizationRate - 100) * 0.6)
  } else {
    level = "critical"
    score = Math.min(100, Math.round(85 + (utilizationRate - 150) * 0.3))
  }

  const reasons: string[] = []
  const explanation: string[] = []

  if (upcoming.length > 0) {
    reasons.push(`${upcoming.length} deliverable${upcoming.length > 1 ? "s" : ""} due within 7 days`)
    explanation.push(`${upcoming.length} upcoming deliverable${upcoming.length > 1 ? "s" : ""}`)
  }

  if (totalHours > 0) {
    reasons.push(`Estimated ${totalHours.toFixed(0)} hours of work remaining`)
    explanation.push(`${totalHours.toFixed(0)}h work needed vs ${weeklyBudget}h weekly capacity (${utilizationRate.toFixed(0)}% utilization)`)
  }

  if (highPriority.length > 0) {
    reasons.push(`${highPriority.length} high-priority deliverable${highPriority.length > 1 ? "s" : ""}`)
    explanation.push(`${highPriority.length} high-priority item${highPriority.length > 1 ? "s" : ""}`)
  }

  if (highRisk.length > 0) {
    reasons.push(`${highRisk.length} deliverable${highRisk.length > 1 ? "s" : ""} marked as high risk`)
    explanation.push(`${highRisk.length} high-risk deliverable${highRisk.length > 1 ? "s" : ""}`)
  }

  if (reasons.length === 0) {
    reasons.push("No upcoming deadlines in the next 7 days")
    explanation.push("Light workload - good time to get ahead")
  }

  return { level, score, reasons, explanation }
}

/**
 * Calculate weighted average grade
 */
export function calculateWeightedAverage(deliverables: Deliverable[]): {
  average: number
  totalWeight: number
  explanation: string[]
} {
  // Use actualGrade if available, fallback to currentGrade for backwards compatibility
  const completedWithGrades = deliverables.filter(
    (d) => d.actualGrade !== undefined || d.currentGrade !== undefined
  )

  if (completedWithGrades.length === 0) {
    return {
      average: 0,
      totalWeight: 0,
      explanation: ["No graded deliverables yet"],
    }
  }

  const totalWeightedGrade = completedWithGrades.reduce(
    (sum, d) => sum + (d.actualGrade || d.currentGrade || 0) * d.gradeWeight,
    0
  )
  const totalWeight = completedWithGrades.reduce((sum, d) => sum + d.gradeWeight, 0)
  const average = totalWeight > 0 ? totalWeightedGrade / totalWeight : 0

  const explanation = [
    `Based on ${completedWithGrades.length} deliverable${completedWithGrades.length > 1 ? "s" : ""} with recorded grades`,
    `Representing ${totalWeight.toFixed(0)}% of total course weight`,
  ]

  return { average, totalWeight, explanation }
}

/**
 * Get workload data for the next 7 days
 */
export function getWorkloadData(deliverables: Deliverable[]) {
  const now = startOfDay(new Date())
  const data = []

  for (let i = 0; i < 7; i++) {
    const date = addDays(now, i)
    const dateStr = date.toISOString().split("T")[0]
    
    // Find deliverables due on this day (not graded yet)
    const dueDateStr = dateStr
    const dueToday = deliverables.filter((d) => {
      const dueDate = new Date(d.dueDate).toISOString().split("T")[0]
      return dueDate === dueDateStr && d.status !== "graded"
    })

    // Calculate remaining hours (submitted has 0 remaining)
    const hours = dueToday.reduce((sum, d) => {
      if (d.status === "submitted" || d.status === "graded") return sum
      return sum + d.estimatedHours
    }, 0)

    data.push({
      date: dateStr,
      hours,
      deliverables: dueToday.length,
    })
  }

  return data
}

/**
 * Get grade projection data
 */
export function getGradeProjection(deliverables: Deliverable[]) {
  const now = startOfDay(new Date())
  const data = []

  // Get current weighted average
  const { average: currentAvg } = calculateWeightedAverage(deliverables)

  // Project future grades (simplified)
  for (let i = 0; i < 7; i++) {
    const date = addDays(now, i)
    const dateStr = date.toISOString().split("T")[0]

    // For projection, assume target grades will be achieved
    const completedWeight = deliverables
      .filter((d) => d.actualGrade !== undefined || d.currentGrade !== undefined)
      .reduce((sum, d) => sum + d.gradeWeight, 0)

    const upcomingWeight = deliverables
      .filter((d) => d.actualGrade === undefined && d.currentGrade === undefined && d.targetGrade !== undefined)
      .reduce((sum, d) => sum + d.gradeWeight, 0)

    const projectedTotal =
      deliverables
        .filter((d) => d.actualGrade !== undefined || d.currentGrade !== undefined)
        .reduce((sum, d) => sum + (d.actualGrade || d.currentGrade || 0) * d.gradeWeight, 0) +
      deliverables
        .filter((d) => d.actualGrade === undefined && d.currentGrade === undefined && d.targetGrade !== undefined)
        .reduce((sum, d) => sum + (d.targetGrade || 0) * d.gradeWeight, 0)

    const totalWeight = completedWeight + upcomingWeight
    const projected = totalWeight > 0 ? projectedTotal / totalWeight : currentAvg

    data.push({
      date: dateStr,
      current: currentAvg,
      projected: projected,
      min: Math.max(0, projected - 5),
      max: Math.min(100, projected + 5),
    })
  }

  return data
}
