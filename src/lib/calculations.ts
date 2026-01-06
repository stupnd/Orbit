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

/**
 * Get next deadline
 */
export function getNextDeadline(deliverables: Deliverable[]): Deliverable | null {
  const active = deliverables.filter((d) => d.status !== "graded")
  
  if (active.length === 0) return null
  
  // Sort by due date ascending
  const sorted = [...active].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )
  
  return sorted[0]
}

/**
 * Get overdue and at-risk counts
 */
export function getOverdueAndAtRisk(
  deliverables: Deliverable[],
  weeklyBudget: number
): { overdueCount: number; atRiskCount: number } {
  const now = startOfDay(new Date())
  const active = deliverables.filter((d) => d.status !== "graded")
  
  const overdueCount = active.filter((d) => new Date(d.dueDate) < now).length
  
  // At-risk: due within 7 days AND remaining hours > available capacity
  const next7Days = addDays(now, 7)
  const atRisk = active.filter((d) => {
    const dueDate = new Date(d.dueDate)
    if (dueDate > next7Days || dueDate < now) return false
    
    const daysRemaining = Math.max(1, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    const remainingHours = d.status === "submitted" ? 0 : d.estimatedHours
    const availableCapacity = (weeklyBudget / 7) * daysRemaining
    
    return remainingHours > availableCapacity
  })
  
  return { overdueCount, atRiskCount: atRisk.length }
}

/**
 * Get hours due in next 7 days with utilization
 */
export function getHoursDue7Days(
  deliverables: Deliverable[],
  weeklyBudget: number
): { hours: number; utilization: number } {
  const now = startOfDay(new Date())
  const next7Days = addDays(now, 7)
  const active = deliverables.filter((d) => d.status !== "graded")
  
  const upcoming = active.filter((d) => {
    const dueDate = new Date(d.dueDate)
    return dueDate >= now && dueDate <= next7Days
  })
  
  const hours = upcoming.reduce((sum, d) => {
    if (d.status === "submitted" || d.status === "graded") return sum
    return sum + d.estimatedHours
  }, 0)
  
  const utilization = (hours / weeklyBudget) * 100
  
  return { hours, utilization }
}

/**
 * Get grade tracking info (current, projected, target)
 */
export function getGradeTracking(
  deliverables: Deliverable[],
  targetGrade: number = 85
): {
  currentAvg: number
  projectedFinal: number
  status: "on-track" | "slightly-behind" | "at-risk"
  weightCovered: number
  hint: string
} {
  const { average: currentAvg, totalWeight: weightCovered } = calculateWeightedAverage(deliverables)
  
  // Calculate projected final (use targets for ungraded items)
  const gradedTotal = deliverables
    .filter((d) => d.actualGrade !== undefined || d.currentGrade !== undefined)
    .reduce((sum, d) => sum + (d.actualGrade || d.currentGrade || 0) * d.gradeWeight, 0)
  
  const ungradedTotal = deliverables
    .filter((d) => d.actualGrade === undefined && d.currentGrade === undefined)
    .reduce((sum, d) => sum + (d.targetGrade || 85) * d.gradeWeight, 0)
  
  const totalWeight = deliverables.reduce((sum, d) => sum + d.gradeWeight, 0)
  const projectedFinal = totalWeight > 0 ? (gradedTotal + ungradedTotal) / totalWeight : 0
  
  // Determine status
  let status: "on-track" | "slightly-behind" | "at-risk"
  if (projectedFinal >= targetGrade) {
    status = "on-track"
  } else if (projectedFinal >= targetGrade - 5) {
    status = "slightly-behind"
  } else {
    status = "at-risk"
  }
  
  // Generate hint: what grade needed on next high-weight ungraded item
  const ungraded = deliverables
    .filter((d) => d.actualGrade === undefined && d.currentGrade === undefined)
    .sort((a, b) => b.gradeWeight - a.gradeWeight)
  
  let hint = ""
  if (ungraded.length > 0 && weightCovered > 0) {
    const nextItem = ungraded[0]
    const remainingWeight = 100 - weightCovered
    const neededTotal = targetGrade * 100 - (currentAvg * weightCovered)
    const neededOnNext = neededTotal / nextItem.gradeWeight
    
    if (remainingWeight > 0 && neededOnNext > 0 && neededOnNext <= 100) {
      hint = `Need ~${Math.round(neededOnNext)}% on next ${nextItem.gradeWeight}% to stay on track`
    } else if (neededOnNext > 100) {
      hint = `Target may be difficult to reach - focus on maximizing grades`
    } else {
      hint = `On pace to meet ${targetGrade}% target`
    }
  } else if (weightCovered === 0) {
    hint = "No grades recorded yet"
  } else {
    hint = "All deliverables graded"
  }
  
  return {
    currentAvg,
    projectedFinal,
    status,
    weightCovered,
    hint,
  }
}

/**
 * Get today's focus items (top priority actions)
 */
export function getTodaysFocus(deliverables: Deliverable[]): Deliverable[] {
  const active = deliverables.filter((d) => d.status !== "graded")
  const now = startOfDay(new Date())
  
  // Prioritize: overdue first, then due soon with high hours, then highest weight
  const scored = active.map((d) => {
    const dueDate = new Date(d.dueDate)
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isOverdue = daysUntilDue < 0
    const dueSoon = daysUntilDue >= 0 && daysUntilDue <= 3
    const remainingHours = d.status === "submitted" ? 0 : d.estimatedHours
    
    let score = 0
    if (isOverdue) score += 1000 + Math.abs(daysUntilDue) * 10 // Most urgent
    else if (dueSoon) score += 500 - daysUntilDue * 100 // Due soon
    score += remainingHours * 2 // High hours adds urgency
    score += d.gradeWeight // Weight adds importance
    
    return { deliverable: d, score }
  })
  
  // Sort by score descending and take top 3
  const sorted = scored.sort((a, b) => b.score - a.score)
  return sorted.slice(0, 3).map((item) => item.deliverable)
}
