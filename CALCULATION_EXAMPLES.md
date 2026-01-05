# Calculation Examples

This document shows real examples of how metrics are calculated from user inputs.

## Example Scenario

### User Configuration
- **Weekly Time Budget**: 30 hours

### User's Courses
1. **CS229** - Machine Learning
2. **CS186** - Database Systems
3. **CS162** - Operating Systems

### User's Deliverables

| ID | Title | Course | Due Date | Status | Hours | Weight | Current Grade | Target Grade |
|----|-------|--------|----------|--------|-------|--------|---------------|--------------|
| 1 | Neural Network Project | CS229 | Jan 15 | in_progress | 20 | 25% | - | 90% |
| 2 | Database Design | CS186 | Jan 12 | in_progress | 12 | 15% | - | 88% |
| 3 | Kernel Module | CS162 | Jan 18 | not_started | 15 | 20% | - | 85% |
| 4 | Problem Set | CS229 | Jan 10 | completed | 8 | 10% | 92% | - |
| 5 | Midterm Study | CS229 | Jan 20 | not_started | 16 | 30% | - | 88% |

Today's Date: **January 8, 2024**

---

## Metric Calculations

### 1. Academic Health Score

#### Step 1: Workload Factor (30% weight)
```
Next 7 days = Jan 8 - Jan 14
Upcoming deliverables: #1 (Jan 15), #2 (Jan 12), #4 (completed - skip)
Upcoming hours = 20 + 12 = 32 hours

workloadScore = max(0, 100 - (upcomingHours / weeklyBudget) * 50)
workloadScore = max(0, 100 - (32 / 30) * 50)
workloadScore = max(0, 100 - 53.3)
workloadScore = 46.7
```

#### Step 2: Grade Factor (30% weight)
```
Completed with grades: #4
Average grade = 92%

gradeScore = 92
```

#### Step 3: Timeliness Factor (25% weight)
```
Incomplete deliverables: #1, #2, #3, #5 = 4 items
Overdue deliverables: none (all due dates are future)

timelinessScore = max(0, 100 - (0 / 4) * 100)
timelinessScore = 100
```

#### Step 4: Balance Factor (15% weight)
```
Upcoming hours per day = 32 / 7 = 4.57 hours/day
Daily budget = 30 / 7 = 4.29 hours/day

balanceScore = min(100, (4.29 / 4.57) * 100)
balanceScore = min(100, 93.9)
balanceScore = 93.9
```

#### Final Score
```
healthScore = (46.7 * 0.3) + (92 * 0.3) + (100 * 0.25) + (93.9 * 0.15)
healthScore = 14.0 + 27.6 + 25.0 + 14.1
healthScore = 80.7
healthScore = 81 (rounded)
```

#### Explanation Generated
- "High upcoming workload: 32h needed in next 7 days vs 30h/week budget"
- "Average grade: 92.0% across 1 completed item"

---

### 2. Overload Risk

#### Calculation
```
Upcoming 7 days hours = 32h (from above)
Weekly budget = 30h

utilizationRate = (32 / 30) * 100 = 106.7%

Since 100 <= 106.7 < 150:
  level = "high"
  score = 70 + (106.7 - 100) * 0.6
  score = 70 + 4.0
  score = 74
```

#### Risk Level: **HIGH** (Score: 74)

#### Reasons Generated
- "2 deliverables due within 7 days" (#1, #2)
- "32h work needed vs 30h weekly capacity (107% utilization)"
- "0 high-priority items"

---

### 3. Weighted Average Grade

#### Calculation
```
Completed with grades: #4 (92%, 10% weight)

totalWeightedGrade = 92 * 10 = 920
totalWeight = 10

average = 920 / 10 = 92.0%
```

#### Result: **92.0%**

#### Explanation
- "Based on 1 graded deliverable"
- "Representing 10% of total course weight"

---

### 4. Active Deliverables Count

```
Incomplete deliverables: #1, #2, #3, #5 = 4
In progress: #1, #2 = 2

Result: 4 active (2 in progress)
```

---

## Workload Chart Data

For next 7 days (Jan 8 - Jan 14):

| Date | Deliverables Due | Total Hours |
|------|------------------|-------------|
| Jan 8 | - | 0 |
| Jan 9 | - | 0 |
| Jan 10 | Problem Set (#4 - completed) | 0 |
| Jan 11 | - | 0 |
| Jan 12 | Database Design (#2) | 12 |
| Jan 13 | - | 0 |
| Jan 14 | - | 0 |

Note: Only incomplete deliverables contribute to workload

---

## Grade Projection Data

Since only 1 deliverable is graded (10% weight), projection includes upcoming target grades:

```
Current weighted average = 92.0% (10% weight covered)

Projected average if targets are achieved:
  = (92 * 10 + 90 * 25 + 88 * 15 + 85 * 20 + 88 * 30) / (10 + 25 + 15 + 20 + 30)
  = (920 + 2250 + 1320 + 1700 + 2640) / 100
  = 8830 / 100
  = 88.3%
```

Chart shows:
- Current line: flat at 92.0%
- Projected line: trends toward 88.3%

---

## What-If Simulation Example

**User selects:** Neural Network Project (#1)
**Adjusts:**
- Effort: 25 hours (original: 20h)
- Target: 95% (original: 90%)
- Risk: Low (original: medium)

### Calculations
```
gradeChange = 95 - 90 = +5.0%
timeChange = 25 - 20 = +5.0h
riskChange = low vs medium = -20 points

Explanation:
"Simulating Neural Network Project: Targeting 95% (5.0% improvement). 
This requires 5 extra hours compared to your estimate. 
Low risk approach provides better safety margins."
```

---

## How Explanations Are Generated

### Academic Health
```typescript
const explanation = []

if (workloadScore < 70) {
  explanation.push(`High upcoming workload: ${upcomingHours}h needed in next 7 days vs ${weeklyBudget}h/week budget`)
}

if (overdueCount > 0) {
  explanation.push(`${overdueCount} overdue deliverable(s)`)
}

if (completedWithGrades.length > 0) {
  explanation.push(`Average grade: ${avgGrade}% across ${completedWithGrades.length} completed item(s)`)
}
```

### Overload Risk
```typescript
const explanation = []

if (upcoming.length > 0) {
  explanation.push(`${upcoming.length} upcoming deliverable(s)`)
}

if (totalHours > 0) {
  explanation.push(`${totalHours}h work needed vs ${weeklyBudget}h weekly capacity (${utilizationRate}% utilization)`)
}

if (highPriorityCount > 0) {
  explanation.push(`${highPriorityCount} high-priority item(s)`)
}
```

---

## Edge Cases

### No Data
```
Courses: 0
Deliverables: 0

Result: Empty state shown
Message: "Welcome to AI Student OS"
Action: "Add Course" button
```

### No Graded Work
```
Deliverables: 5
Completed: 2 (but no grades entered)

Weighted Average: N/A
Grade Chart: "Complete and grade deliverables to see projections"
```

### All Work Complete
```
Status: All deliverables completed

Overload Risk: Low (0% utilization)
Workload Chart: "No work due in the next 7 days"
Message: "Light workload - good time to get ahead"
```

### Extreme Overload
```
Upcoming hours: 60h
Weekly budget: 30h
Utilization: 200%

Overload Risk: CRITICAL (score: 94)
Explanation: "CRITICAL overload - 60h needed vs 30h capacity"
```

---

## Validation Rules

### Course Input
- Code: Required, string
- Name: Required, string
- Color: Required, hex color

### Deliverable Input
- Title: Required, string
- Course: Required, must be existing course ID
- Due Date: Required, date
- Estimated Hours: Required, number > 0
- Grade Weight: Required, 0-100%
- Target Grade: Optional, 0-100%
- Current Grade: Optional, 0-100% (for completed items)

### Weekly Budget
- Range: 1-168 hours (1 hour to full week)
- Default: 30 hours
- Common values:
  - Full-time student: 30-40h
  - Part-time student: 15-20h
  - Working student: 10-15h

---

## Testing Scenarios

### Test 1: New User
1. No data exists
2. Add course "CS101"
3. Add deliverable "Assignment 1" (10h, 20%, due tomorrow)
4. Check dashboard shows:
   - Health score based on 1 deliverable
   - Overload risk reflects tomorrow's deadline
   - 1 active deliverable
   - N/A weighted average (not graded yet)

### Test 2: Heavy Workload
1. Add 5 deliverables all due within 3 days
2. Total 50 hours, budget 30h
3. Check dashboard shows:
   - Health score decreases
   - Overload risk = HIGH or CRITICAL
   - Explanation mentions 50h vs 30h

### Test 3: Completed Work
1. Mark 3 deliverables complete
2. Add grades: 85%, 90%, 95%
3. Check dashboard shows:
   - Weighted average calculated correctly
   - Grade projection updates
   - Explanations reference completed work

### Test 4: Empty States
1. Have courses but no deliverables
2. Check Planner shows "Add your first deliverable"
3. Check Simulator shows "No deliverables to simulate"
4. Both show Add Deliverable button
