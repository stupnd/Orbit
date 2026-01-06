# What-if Simulator Redesign

## Overview
Completely redesigned the What-if Simulator to answer real student questions: what grades are needed, how to focus effort, and how to schedule work. Replaced the abstract slider-based interface with three actionable tabs.

## Problem with Old Simulator
- **Abstract sliders**: Effort hours, target grade, risk level - disconnected from real decisions
- **Vague outputs**: "Grade change 0%" - not helpful
- **No actionable insights**: Didn't answer "what should I do?"
- **Disconnected from reality**: Sliders didn't relate to actual deliverables

## New Design: 3-Tab Simulator

### Tab 1: Grade What-if
Answers: **"What grades do I need to achieve my target?"**

#### Features:
1. **Target Final Grade Calculator**
   - Input: Course + Target final grade (e.g., 85%)
   - Output:
     - Current weighted average
     - Weight covered vs remaining
     - **Needed average on remaining items** (clear number)
     - Human-friendly explanation

2. **Score on Specific Item**
   - Input: Select an item + hypothetical score
   - Output:
     - Resulting final grade if you score X on that item
     - What you'd need on other remaining items to still hit target
     - Clear explanation

3. **Drop Lowest Item**
   - Automatically finds lowest graded item
   - Shows impact on final grade
   - Explains the change

#### Example Output:
```
To achieve 85% final grade:
- Current average: 87.3%
- Weight covered: 60%
- Weight remaining: 40%
- Needed average on remaining: 81.5%

Explanation: "To achieve 85%, you need an average of 81.5% on your remaining 3 items (40% total weight). Your current average is 87.3% from 2 graded items."
```

### Tab 2: Effort Tradeoff
Answers: **"How should I split my time between deliverables?"**

#### Features:
- Select 1-2 deliverables
- Enter available hours
- Get recommended focus split based on:
  - **Priority**: Overdue > Due soon > Others
  - **Weight**: Higher weight = more important
  - **Hours remaining**: Realistic allocation

#### Algorithm:
1. **Single deliverable**: Allocate all hours (up to remaining hours needed)
2. **Two deliverables**: 
   - Calculate priority score: `weight × urgency × hours`
   - Split proportionally to priority
   - Ensure minimum 2 hours per item
   - Distribute remaining hours to highest priority

#### Example Output:
```
Recommended Split:
- Assignment 3: 6h
  Reasoning: "Due in 2 days, worth 15% (urgent)"
- Lab Report: 4h
  Reasoning: "Due in 5 days, worth 10%"

Total: 10h of 10h allocated
```

### Tab 3: Schedule Planner
Answers: **"How should I schedule my week?"**

#### Features:
- Select course
- Set weekly available hours
- Automatically accounts for class schedule blocks (if set in course)
- Generates 7-day plan with:
  - **Top 3 priorities** (same algorithm as Dashboard)
  - **Daily schedule** with time blocks
  - **Class times** (if configured)
  - **Work blocks** (morning, afternoon)
  - **Break times**

#### Schedule Generation:
- Daily hours = weekly hours / 7
- Subtracts class time from available hours
- Allocates work blocks to top priorities
- Suggests 2 work blocks per day (max 3h each)
- Includes break time

#### Example Output:
```
Top 3 Priorities:
1. Midterm Exam - Due in 2 days, worth 30%
2. Assignment 3 - Due in 5 days, worth 15%
3. Lab Report - Due in 7 days, worth 10%

Monday:
- 9:00 AM - 12:00 PM: Midterm Exam (3.0h)
- 2:00 PM - 5:00 PM: Assignment 3 (2.5h)
- 12:00 PM - 1:00 PM: Break (1.0h)
```

## Technical Implementation

### New Calculation Functions

#### `/src/lib/simulator-calculations.ts`

**Grade What-if Functions:**
- `calculateGradeWhatIf()`: Main target grade calculator
- `calculateScoreOnItem()`: "What if I score X on this item?"
- `calculateDropLowest()`: Impact of dropping lowest grade

**Effort Tradeoff Functions:**
- `calculateEffortTradeoff()`: Recommended hour split between 1-2 deliverables

**Schedule Planner Functions:**
- `calculateSchedulePlan()`: 7-day schedule with priorities and time blocks

### Type Updates

#### `/src/lib/types.ts`
Added:
- `GradingGroup`: Category-based grading (name, totalWeightPercent, itemCount)
- `ScheduleBlock`: Class schedule (dayOfWeek, startTime, endTime, type)
- Updated `Course` to include optional `gradingGroups` and `scheduleBlocks`

### New Components

#### `/src/components/ui/input.tsx`
Simple input component for number inputs (target grade, hours, etc.)

### UI Components

#### `/src/pages/Simulator.tsx`
Complete redesign with:
- **Tabs component** for 3-tab interface
- **Clear input/output panels** for each tab
- **Human-friendly explanations** (deterministic, not AI)
- **Color-coded results** (green = good, orange = warning, red = critical)
- **Responsive design** (mobile-friendly)

## Key Features

### ✅ Clear Outputs
- No vague "grade change 0%"
- Specific numbers: "Need 81.5% average on remaining items"
- Clear explanations: "To achieve 85%, you need..."

### ✅ Input → Output Relationship
- Shows what you input
- Shows calculated results
- Explains the relationship

### ✅ Actionable Insights
- **Grade What-if**: "You need 81.5% on remaining items"
- **Effort Tradeoff**: "Focus 6h on Assignment 3, 4h on Lab Report"
- **Schedule Planner**: "Monday: 3h on Midterm, 2.5h on Assignment 3"

### ✅ Deterministic Calculations
- All math is deterministic (no AI randomness)
- Explanations are template-based (human-friendly but consistent)
- Results are reproducible

### ✅ Glassy/Minimal Design
- Card-based layout
- Subtle borders and shadows
- Clean typography
- Smooth animations (framer-motion)

### ✅ Portal Fixes
- All Select dropdowns use Radix UI portals
- No clipping issues
- Proper z-index layering

## Example Scenarios

### Scenario 1: "What do I need for an A?"
**Input**: Course = CS 2110, Target = 90%
**Output**: 
- Current: 87.3% (60% weight)
- Remaining: 40% weight
- **Need: 94.2% average on remaining items**
- Explanation: "To achieve 90%, you need an average of 94.2% on your remaining 2 items (40% total weight). This is challenging but achievable with focused effort."

### Scenario 2: "If I get 85% on the midterm, what do I need on the final?"
**Input**: Midterm (30% weight) = 85%
**Output**:
- Resulting final: 86.5%
- **Need: 87.8% on final (40% weight) to hit 90% target**
- Explanation: "If you score 85% on the midterm, your final grade will be 86.5%. To reach your 90% target, you'd need 87.8% on the final exam."

### Scenario 3: "I have 10 hours this weekend. What should I focus on?"
**Input**: Assignment 3 + Lab Report, 10 hours available
**Output**:
- Assignment 3: 6h (due in 2 days, worth 15%, urgent)
- Lab Report: 4h (due in 5 days, worth 10%)
- Explanation: "Focus 6h on Assignment 3 because it's due soon and worth more. Allocate 4h to Lab Report."

### Scenario 4: "How should I schedule my week?"
**Input**: CS 2110, 30 hours/week, class schedule configured
**Output**:
- Top 3 priorities listed
- 7-day schedule with time blocks
- Daily breakdown with class times and work blocks
- Total hours allocated

## Future Enhancements

### Grading Groups (Partially Implemented)
- Type definitions added for `GradingGroup`
- Course model supports `gradingGroups` array
- **TODO**: Update AddCourseModal to allow creating grading groups
- **TODO**: Auto-generate placeholder deliverables from groups

### Schedule Blocks (Partially Implemented)
- Type definitions added for `ScheduleBlock`
- Course model supports `scheduleBlocks` array
- Schedule planner uses blocks if configured
- **TODO**: UI to add/edit schedule blocks in course settings

### AI Explanations (Future)
- Currently using deterministic template-based explanations
- Could enhance with AI for more personalized, contextual advice
- **Important**: AI should only explain, never change the math

## Design Decisions

### Why 3 Tabs?
- **Separation of concerns**: Each tab answers a different question
- **Focused UX**: Users aren't overwhelmed with options
- **Clear mental model**: "I want to know about grades" → Grade What-if tab

### Why Deterministic Explanations?
- **Trust**: Users can verify the math
- **Consistency**: Same inputs = same outputs
- **Transparency**: No "black box" AI decisions

### Why Template-Based Text?
- **Reliable**: No AI hallucinations
- **Fast**: No API calls
- **Consistent**: Same format every time
- **Future**: Can enhance with AI later without breaking existing logic

## Testing Checklist

### Grade What-if
- ✅ Calculate needed average on remaining items
- ✅ Handle edge cases (no grades yet, impossible targets)
- ✅ Score on specific item calculation
- ✅ Drop lowest item impact

### Effort Tradeoff
- ✅ Single deliverable allocation
- ✅ Two deliverables proportional split
- ✅ Priority-based recommendations
- ✅ Minimum hours per item

### Schedule Planner
- ✅ 7-day schedule generation
- ✅ Top 3 priorities calculation
- ✅ Class time accounting
- ✅ Work block allocation

### UI/UX
- ✅ Tab switching works
- ✅ Inputs update results in real-time
- ✅ Clear explanations displayed
- ✅ Mobile responsive
- ✅ Dropdowns render correctly (portal fix)

## Files Changed

### New Files
- `/src/lib/simulator-calculations.ts` - All calculation functions
- `/src/components/ui/input.tsx` - Input component
- `/SIMULATOR_REDESIGN.md` - This documentation

### Modified Files
- `/src/lib/types.ts` - Added GradingGroup, ScheduleBlock, updated Course
- `/src/pages/Simulator.tsx` - Complete redesign with 3 tabs

### Future Work
- `/src/components/AddCourseModal.tsx` - Add grading groups UI (optional)
- Course settings page - Add schedule blocks UI (optional)

## Success Metrics

### User Goals Achieved
✅ **Answer "what grades do I need?"** - Grade What-if tab
✅ **Answer "how should I focus effort?"** - Effort Tradeoff tab
✅ **Answer "how should I schedule work?"** - Schedule Planner tab
✅ **Clear, actionable outputs** - No vague numbers
✅ **Understandable** - Human-friendly explanations

### Technical Goals Achieved
✅ **Deterministic calculations** - All math is reproducible
✅ **Type-safe** - Full TypeScript coverage
✅ **Build success** - No errors, clean compilation
✅ **Portal fixes** - Dropdowns render correctly
✅ **Responsive design** - Works on mobile and desktop

## Conclusion

The redesigned Simulator transforms abstract sliders into actionable insights. Students can now:
- **Plan grades**: "What do I need to get an A?"
- **Prioritize effort**: "How should I split 10 hours between 2 assignments?"
- **Schedule work**: "What should my week look like?"

Every calculation is deterministic, every output is clear, and every explanation is human-friendly. The simulator is now a true planning tool, not just a curiosity. 🎯
