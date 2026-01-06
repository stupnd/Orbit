import type { Deliverable } from "./types"
import { startOfDay, differenceInDays, addDays, format } from "date-fns"

/**
 * Grade What-if Calculations
 */

export interface GradeWhatIfResult {
  targetFinalGrade: number
  currentWeightedAvg: number
  weightCovered: number
  weightRemaining: number
  neededAvgOnRemaining: number
  explanation: string
  breakdown: {
    item: string
    weight: number
    currentGrade?: number
    neededGrade?: number
  }[]
}

/**
 * Calculate what grades are needed to achieve a target final grade
 */
export function calculateGradeWhatIf(
  deliverables: Deliverable[],
  courseId: string,
  targetFinalGrade: number
): GradeWhatIfResult | null {
  const courseDeliverables = deliverables.filter((d) => d.courseId === courseId)
  if (courseDeliverables.length === 0) return null

  // Get graded items
  const graded = courseDeliverables.filter(
    (d) => d.actualGrade !== undefined || d.currentGrade !== undefined
  )
  const ungraded = courseDeliverables.filter(
    (d) => d.actualGrade === undefined && d.currentGrade === undefined
  )

  // Calculate current weighted average
  const gradedTotal = graded.reduce(
    (sum, d) => sum + (d.actualGrade || d.currentGrade || 0) * d.gradeWeight,
    0
  )
  const totalWeight = courseDeliverables.reduce((sum, d) => sum + d.gradeWeight, 0)
  const weightCovered = graded.reduce((sum, d) => sum + d.gradeWeight, 0)
  const weightRemaining = totalWeight - weightCovered

  const currentWeightedAvg = weightCovered > 0 ? gradedTotal / weightCovered : 0

  // Calculate needed average on remaining items
  const neededTotal = targetFinalGrade * totalWeight
  const neededFromRemaining = neededTotal - gradedTotal
  const neededAvgOnRemaining =
    weightRemaining > 0 ? neededFromRemaining / weightRemaining : 0

  // Build breakdown
  const breakdown = courseDeliverables.map((d) => {
    const hasGrade = d.actualGrade !== undefined || d.currentGrade !== undefined
    return {
      item: d.title,
      weight: d.gradeWeight,
      currentGrade: hasGrade ? d.actualGrade || d.currentGrade : undefined,
      neededGrade: !hasGrade ? neededAvgOnRemaining : undefined,
    }
  })

  // Generate explanation
  let explanation = ""
  if (weightCovered === 0) {
    explanation = `You haven't received any grades yet. To achieve ${targetFinalGrade}%, you'll need an average of ${neededAvgOnRemaining.toFixed(1)}% across all ${ungraded.length} remaining items.`
  } else if (neededAvgOnRemaining < 0) {
    explanation = `Great news! Your current average of ${currentWeightedAvg.toFixed(1)}% (${weightCovered.toFixed(0)}% weight) already puts you above your ${targetFinalGrade}% target. You can score as low as 0% on remaining items and still meet your goal.`
  } else if (neededAvgOnRemaining > 100) {
    explanation = `Your target of ${targetFinalGrade}% is difficult to achieve. You'd need an average of ${neededAvgOnRemaining.toFixed(1)}% on remaining items (${weightRemaining.toFixed(0)}% weight), which is above 100%. Consider adjusting your target or focusing on maximizing grades.`
  } else {
    explanation = `To achieve ${targetFinalGrade}%, you need an average of ${neededAvgOnRemaining.toFixed(1)}% on your remaining ${ungraded.length} item${ungraded.length !== 1 ? "s" : ""} (${weightRemaining.toFixed(0)}% total weight). Your current average is ${currentWeightedAvg.toFixed(1)}% from ${graded.length} graded item${graded.length !== 1 ? "s" : ""}.`
  }

  return {
    targetFinalGrade,
    currentWeightedAvg,
    weightCovered,
    weightRemaining,
    neededAvgOnRemaining: Math.max(0, Math.min(100, neededAvgOnRemaining)),
    explanation,
    breakdown,
  }
}

/**
 * Calculate what final grade is needed if you score X on a specific item
 */
export function calculateScoreOnItem(
  deliverables: Deliverable[],
  courseId: string,
  itemId: string,
  scoreOnItem: number,
  targetFinalGrade: number
): {
  resultingFinalGrade: number
  neededOnOtherRemaining: number
  explanation: string
} {
  const courseDeliverables = deliverables.filter((d) => d.courseId === courseId)
  const targetItem = courseDeliverables.find((d) => d.id === itemId)
  if (!targetItem) {
    return {
      resultingFinalGrade: 0,
      neededOnOtherRemaining: 0,
      explanation: "Item not found",
    }
  }

  // Calculate with the new score on target item
  const graded = courseDeliverables
    .filter((d) => d.actualGrade !== undefined || d.currentGrade !== undefined)
    .filter((d) => d.id !== itemId) // Exclude target item
  const ungraded = courseDeliverables.filter(
    (d) => d.actualGrade === undefined && d.currentGrade === undefined && d.id !== itemId
  )

  const gradedTotal = graded.reduce(
    (sum, d) => sum + (d.actualGrade || d.currentGrade || 0) * d.gradeWeight,
    0
  )
  const totalWithNewScore = gradedTotal + scoreOnItem * targetItem.gradeWeight

  const totalWeight = courseDeliverables.reduce((sum, d) => sum + d.gradeWeight, 0)
  const weightCovered = graded.reduce((sum, d) => sum + d.gradeWeight, 0) + targetItem.gradeWeight
  const weightRemaining = totalWeight - weightCovered

  const resultingFinalGrade = totalWeight > 0 ? totalWithNewScore / totalWeight : 0

  // What's needed on other remaining items to hit target?
  const neededTotal = targetFinalGrade * totalWeight
  const neededFromOtherRemaining = neededTotal - totalWithNewScore
  const neededOnOtherRemaining =
    weightRemaining > 0 ? neededFromOtherRemaining / weightRemaining : 0

  let explanation = ""
  if (weightRemaining === 0) {
    explanation = `If you score ${scoreOnItem}% on ${targetItem.title}, your final grade will be ${resultingFinalGrade.toFixed(1)}%. This is your final grade since all items are accounted for.`
  } else {
    explanation = `If you score ${scoreOnItem}% on ${targetItem.title} (${targetItem.gradeWeight}% weight), your final grade will be ${resultingFinalGrade.toFixed(1)}%. To reach ${targetFinalGrade}%, you'd need an average of ${Math.max(0, neededOnOtherRemaining).toFixed(1)}% on the remaining ${ungraded.length} item${ungraded.length !== 1 ? "s" : ""}.`
  }

  return {
    resultingFinalGrade: Math.max(0, Math.min(100, resultingFinalGrade)),
    neededOnOtherRemaining: Math.max(0, Math.min(100, neededOnOtherRemaining)),
    explanation,
  }
}

/**
 * Calculate impact of dropping lowest item
 */
export function calculateDropLowest(
  deliverables: Deliverable[],
  courseId: string
): {
  droppedItem: Deliverable | null
  newFinalGrade: number
  gradeChange: number
  explanation: string
} {
  const courseDeliverables = deliverables.filter((d) => d.courseId === courseId)
  const graded = courseDeliverables.filter(
    (d) => d.actualGrade !== undefined || d.currentGrade !== undefined
  )

  if (graded.length === 0) {
    return {
      droppedItem: null,
      newFinalGrade: 0,
      gradeChange: 0,
      explanation: "No graded items to drop",
    }
  }

  // Find lowest grade
  const sortedByGrade = [...graded].sort(
    (a, b) => (a.actualGrade || a.currentGrade || 0) - (b.actualGrade || b.currentGrade || 0)
  )
  const droppedItem = sortedByGrade[0]

  // Calculate current final grade
  const totalWeight = courseDeliverables.reduce((sum, d) => sum + d.gradeWeight, 0)
  const currentTotal = graded.reduce(
    (sum, d) => sum + (d.actualGrade || d.currentGrade || 0) * d.gradeWeight,
    0
  )
  const currentFinal = totalWeight > 0 ? currentTotal / totalWeight : 0

  // Calculate new final grade without lowest
  const newTotal = currentTotal - (droppedItem.actualGrade || droppedItem.currentGrade || 0) * droppedItem.gradeWeight
  const newWeight = totalWeight - droppedItem.gradeWeight
  const newFinalGrade = newWeight > 0 ? newTotal / newWeight : 0

  const gradeChange = newFinalGrade - currentFinal

  const explanation = `Dropping your lowest item (${droppedItem.title}, ${droppedItem.actualGrade || droppedItem.currentGrade}%, ${droppedItem.gradeWeight}% weight) would change your final grade from ${currentFinal.toFixed(1)}% to ${newFinalGrade.toFixed(1)}% (${gradeChange >= 0 ? "+" : ""}${gradeChange.toFixed(1)}%).`

  return {
    droppedItem,
    newFinalGrade: Math.max(0, Math.min(100, newFinalGrade)),
    gradeChange,
    explanation,
  }
}

/**
 * Effort Tradeoff Calculations
 */

export interface EffortTradeoffResult {
  recommendedSplit: {
    deliverableId: string
    deliverableTitle: string
    recommendedHours: number
    reasoning: string
  }[]
  totalHours: number
  explanation: string
}

/**
 * Recommend how to split available hours between 1-2 deliverables
 */
export function calculateEffortTradeoff(
  deliverables: Deliverable[],
  selectedDeliverableIds: string[],
  availableHours: number
): EffortTradeoffResult | null {
  if (selectedDeliverableIds.length === 0 || selectedDeliverableIds.length > 2) {
    return null
  }

  const selected = deliverables.filter((d) => selectedDeliverableIds.includes(d.id))
  if (selected.length === 0) return null

  const now = startOfDay(new Date())
  const recommendedSplit: EffortTradeoffResult["recommendedSplit"] = []

  if (selected.length === 1) {
    const d = selected[0]
    const daysUntil = Math.max(1, differenceInDays(new Date(d.dueDate), now))
    const isOverdue = daysUntil < 0
    const remainingHours = d.status === "submitted" || d.status === "graded" ? 0 : d.estimatedHours

    const recommendedHours = Math.min(availableHours, remainingHours)

    let reasoning = ""
    if (isOverdue) {
      reasoning = `Overdue and worth ${d.gradeWeight}% - highest priority`
    } else if (daysUntil <= 3) {
      reasoning = `Due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""} and worth ${d.gradeWeight}% - urgent`
    } else {
      reasoning = `Due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""} and worth ${d.gradeWeight}%`
    }

    recommendedSplit.push({
      deliverableId: d.id,
      deliverableTitle: d.title,
      recommendedHours,
      reasoning,
    })
  } else {
    // Two deliverables - split based on priority
    const scored = selected.map((d) => {
      const daysUntil = Math.max(1, differenceInDays(new Date(d.dueDate), now))
      const isOverdue = daysUntil < 0
      const remainingHours = d.status === "submitted" || d.status === "graded" ? 0 : d.estimatedHours

      const urgency = isOverdue ? 2 : daysUntil <= 3 ? 1.5 : daysUntil <= 7 ? 1.2 : 1
      const priority = d.gradeWeight * urgency

      return {
        deliverable: d,
        priority,
        daysUntil,
        isOverdue,
        remainingHours,
      }
    })

    // Sort by priority
    scored.sort((a, b) => b.priority - a.priority)

    // Split hours proportionally to priority, but ensure minimum viable hours
    const totalPriority = scored.reduce((sum, s) => sum + s.priority, 0)
    const minHours = 2 // Minimum 2 hours per item

    let remainingHours = availableHours
    const allocations: number[] = []

    // First pass: allocate proportionally
    for (let i = 0; i < scored.length; i++) {
      const proportion = scored[i].priority / totalPriority
      const allocated = Math.min(
        Math.floor(proportion * availableHours),
        scored[i].remainingHours,
        remainingHours
      )
      allocations.push(Math.max(minHours, allocated))
      remainingHours -= allocations[i]
    }

    // Second pass: distribute remaining hours to highest priority
    if (remainingHours > 0) {
      for (let i = 0; i < scored.length && remainingHours > 0; i++) {
        const canTake = Math.min(
          remainingHours,
          scored[i].remainingHours - allocations[i]
        )
        allocations[i] += canTake
        remainingHours -= canTake
      }
    }

    // Generate reasoning for each
    for (let i = 0; i < scored.length; i++) {
      const s = scored[i]
      let reasoning = ""
      if (s.isOverdue) {
        reasoning = `Overdue, worth ${s.deliverable.gradeWeight}% (highest priority)`
      } else if (s.daysUntil <= 3) {
        reasoning = `Due in ${s.daysUntil} day${s.daysUntil !== 1 ? "s" : ""}, worth ${s.deliverable.gradeWeight}% (urgent)`
      } else {
        reasoning = `Due in ${s.daysUntil} day${s.daysUntil !== 1 ? "s" : ""}, worth ${s.deliverable.gradeWeight}%`
      }

      recommendedSplit.push({
        deliverableId: s.deliverable.id,
        deliverableTitle: s.deliverable.title,
        recommendedHours: allocations[i],
        reasoning,
      })
    }
  }

  // Generate overall explanation
  let explanation = ""
  if (selected.length === 1) {
    const d = selected[0]
    explanation = `Focus all ${availableHours}h on ${d.title}. ${recommendedSplit[0].reasoning}.`
  } else {
    const total = recommendedSplit.reduce((sum, r) => sum + r.recommendedHours, 0)
    explanation = `Split ${total}h between ${selected.length} items: ${recommendedSplit.map((r) => `${r.recommendedHours}h on ${r.deliverableTitle}`).join(", ")}. Prioritized by due date, weight, and remaining hours.`
  }

  return {
    recommendedSplit,
    totalHours: recommendedSplit.reduce((sum, r) => sum + r.recommendedHours, 0),
    explanation,
  }
}

/**
 * Schedule Planner Calculations
 */

export interface ScheduleDay {
  date: string
  dayName: string
  availableHours: number
  suggestedBlocks: {
    time: string
    deliverableId?: string
    deliverableTitle?: string
    hours: number
    type: "work" | "break" | "class"
  }[]
}

export interface SchedulePlan {
  days: ScheduleDay[]
  top3Priorities: {
    deliverableId: string
    deliverableTitle: string
    courseName: string
    dueDate: string
    hoursNeeded: number
    reasoning: string
  }[]
  totalHoursAllocated: number
  explanation: string
}

/**
 * Generate a 7-day schedule plan
 */
export function calculateSchedulePlan(
  deliverables: Deliverable[],
  weeklyAvailableHours: number,
  scheduleBlocks: { dayOfWeek: number; startTime: string; endTime: string; type: string }[] = []
): SchedulePlan {
  const now = startOfDay(new Date())
  const days: ScheduleDay[] = []
  const active = deliverables.filter((d) => d.status !== "graded" && d.status !== "submitted")

  // Get top 3 priorities (same logic as Dashboard)
  const scored = active.map((d) => {
    const dueDate = new Date(d.dueDate)
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isOverdue = daysUntilDue < 0
    const dueSoon = daysUntilDue >= 0 && daysUntilDue <= 3
    const remainingHours = d.estimatedHours

    let score = 0
    if (isOverdue) score += 1000 + Math.abs(daysUntilDue) * 10
    else if (dueSoon) score += 500 - daysUntilDue * 100
    score += remainingHours * 2
    score += d.gradeWeight

    return { deliverable: d, score, daysUntilDue, isOverdue }
  })

  const top3 = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => {
      let reasoning = ""
      if (s.isOverdue) {
        reasoning = `Overdue by ${Math.abs(s.daysUntilDue)} day${Math.abs(s.daysUntilDue) !== 1 ? "s" : ""}`
      } else if (s.daysUntilDue <= 3) {
        reasoning = `Due in ${s.daysUntilDue} day${s.daysUntilDue !== 1 ? "s" : ""}`
      } else {
        reasoning = `Due in ${s.daysUntilDue} day${s.daysUntilDue !== 1 ? "s" : ""}`
      }
      reasoning += `, worth ${s.deliverable.gradeWeight}%`

      return {
        deliverableId: s.deliverable.id,
        deliverableTitle: s.deliverable.title,
        courseName: s.deliverable.courseName,
        dueDate: s.deliverable.dueDate,
        hoursNeeded: s.deliverable.estimatedHours,
        reasoning,
      }
    })

  // Generate 7-day schedule
  const dailyHours = weeklyAvailableHours / 7
  let totalAllocated = 0

  for (let i = 0; i < 7; i++) {
    const date = addDays(now, i)
    const dayOfWeek = date.getDay()
    const dayName = format(date, "EEEE")

    // Get class blocks for this day
    const classBlocks = scheduleBlocks.filter((b) => b.dayOfWeek === dayOfWeek)

    // Calculate available hours (subtract class time)
    let availableHours = dailyHours
    classBlocks.forEach((block) => {
      const [startH, startM] = block.startTime.split(":").map(Number)
      const [endH, endM] = block.endTime.split(":").map(Number)
      const blockHours = (endH * 60 + endM - (startH * 60 + startM)) / 60
      availableHours -= blockHours
    })

    const suggestedBlocks: ScheduleDay["suggestedBlocks"] = []

    // Add class blocks
    classBlocks.forEach((block) => {
      const [startH, startM] = block.startTime.split(":").map(Number)
      const [endH, endM] = block.endTime.split(":").map(Number)
      const blockHours = (endH * 60 + endM - (startH * 60 + startM)) / 60

      suggestedBlocks.push({
        time: `${block.startTime} - ${block.endTime}`,
        hours: blockHours,
        type: "class",
      })
    })

    // Allocate work blocks (prioritize top 3)
    let remainingWorkHours = availableHours
    const workBlocks = 2 // 2 work blocks per day (morning, afternoon)

    for (let j = 0; j < workBlocks && remainingWorkHours > 0 && j < top3.length; j++) {
      const workItem = top3[j]
      if (!workItem) break

      const hoursPerBlock = Math.min(remainingWorkHours / (workBlocks - j), 3) // Max 3h per block
      if (hoursPerBlock > 0.5) {
        // Only add if meaningful (>30 min)
        suggestedBlocks.push({
          time: j === 0 ? "9:00 AM - 12:00 PM" : "2:00 PM - 5:00 PM",
          deliverableId: workItem.deliverableId,
          deliverableTitle: workItem.deliverableTitle,
          hours: hoursPerBlock,
          type: "work",
        })
        remainingWorkHours -= hoursPerBlock
        totalAllocated += hoursPerBlock
      }
    }

    // Add break if there's time
    if (remainingWorkHours > 0.5) {
      suggestedBlocks.push({
        time: "12:00 PM - 1:00 PM",
        hours: 1,
        type: "break",
      })
    }

    days.push({
      date: format(date, "yyyy-MM-dd"),
      dayName,
      availableHours: Math.max(0, availableHours),
      suggestedBlocks: suggestedBlocks.sort((a, b) => {
        // Sort by time
        const timeA = a.time.split(" - ")[0]
        const timeB = b.time.split(" - ")[0]
        return timeA.localeCompare(timeB)
      }),
    })
  }

  // Generate explanation
  const explanation = `7-day schedule with ${weeklyAvailableHours}h/week available (${dailyHours.toFixed(1)}h/day average). Focus on top 3 priorities: ${top3.map((t) => t.deliverableTitle).join(", ")}. Total ${totalAllocated.toFixed(1)}h allocated across the week.`

  return {
    days,
    top3Priorities: top3,
    totalHoursAllocated: totalAllocated,
    explanation,
  }
}
