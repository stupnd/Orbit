# Dashboard UX Improvements - User-Driven System

## Overview
Transformed the AI Student OS from using mock/hardcoded data to a fully user-driven system where all metrics are derived from explicit user inputs, with transparent explanations.

## Key Changes

### 1. State Management (`src/lib/store.tsx`)
- **Created AppProvider context** with React Context + localStorage persistence
- **User data storage**: Courses, deliverables, weekly time budget
- **CRUD operations**: Add, update, delete for courses and deliverables
- **Persistence**: All data auto-saves to localStorage

### 2. Calculation Engine (`src/lib/calculations.ts`)
All dashboard metrics are now **derived** from user inputs:

#### Academic Health Score
- **Formula**: Weighted average of:
  - Workload (30%): Based on upcoming hours vs weekly budget
  - Grades (30%): Average of completed graded work
  - Timeliness (25%): Ratio of on-time vs overdue deliverables
  - Balance (15%): Distribution of work over time
- **Output**: 0-100 score + trend + explanations

#### Overload Risk
- **Formula**: Based on utilization rate (upcoming hours / weekly budget)
  - Low: < 70% utilization
  - Medium: 70-100% utilization
  - High: 100-150% utilization
  - Critical: > 150% utilization
- **Output**: Risk level + score + specific reasons

#### Weighted Average Grade
- **Formula**: Σ(grade × weight) / Σ(weight)
- **Only uses completed deliverables** with grades
- **Output**: Average + total weight covered + explanation

#### Workload & Grade Projections
- **7-day workload**: Aggregates hours by due date
- **Grade projection**: Current average + projected based on target grades

### 3. Input Components

#### AddCourseModal
- Course code, name, color picker
- Creates foundation for deliverables

#### AddDeliverableModal
- Name, course, due date, priority
- Estimated hours (for workload calculations)
- Grade weight % (for weighted average)
- Target grade (optional, for projections)

#### SettingsModal
- Weekly time budget configuration
- Drives overload risk calculations

### 4. Dashboard Improvements

#### Empty States
- **No courses**: Prompts to add first course
- **No deliverables**: Prompts to add first deliverable
- Clean, actionable CTAs

#### Metric Explanations (New Component)
Shows **why** each metric has its value:
- Academic Health: Lists specific factors affecting score
- Overload Risk: Bullet points with specific deliverables and hours
- Weighted Average: Shows how many deliverables, total weight covered

#### Data Source Indicators
- "Based on your inputs" labels under key metrics
- Chart descriptions reference actual data counts
- Footer shows: "X courses • Y deliverables • Zh/week budget"

#### Charts
- **Workload chart**: Only shows actual due dates from user data
- **Grade projection**: Only renders when graded work exists
- Empty states when no relevant data

### 5. Layout Enhancements
- **Quick Actions in sidebar**:
  - Add Course button
  - Add Deliverable button
- **Footer stats**: Course count, deliverable count, time budget
- **Settings button**: Access to weekly budget configuration

### 6. Updated Pages

#### Dashboard
- All metrics are **calculated, not editable**
- Shows explanations for major metrics
- Graceful empty states throughout

#### Planner
- Empty state if no deliverables
- Filters work on real user data
- Stats show actual counts from user deliverables

#### Simulator
- Empty state if no deliverables
- Real deliverable data for selection
- Parameter comparisons against user estimates

## Technical Implementation

### Data Flow
```
User Input → AppProvider (Context) → localStorage
                ↓
        Calculation Functions
                ↓
        Dashboard Metrics (Derived)
```

### Key Principles
1. **Single source of truth**: User inputs in AppProvider
2. **Derived metrics**: All dashboard values are calculated, never editable
3. **Transparent calculations**: Every metric shows its reasoning
4. **Graceful degradation**: Empty states guide users to add data
5. **Persistence**: Data survives page refreshes

### Files Changed/Added
- `src/lib/store.tsx` - State management (NEW)
- `src/lib/calculations.ts` - Metric calculation engine (NEW)
- `src/components/AddCourseModal.tsx` - Course input (NEW)
- `src/components/AddDeliverableModal.tsx` - Deliverable input (NEW)
- `src/components/SettingsModal.tsx` - Settings input (NEW)
- `src/components/MetricExplanation.tsx` - Explanation component (NEW)
- `src/components/Layout.tsx` - Added quick actions + stats (UPDATED)
- `src/pages/Dashboard.tsx` - Full rewrite with calculations (UPDATED)
- `src/pages/Planner.tsx` - Use real data + empty states (UPDATED)
- `src/pages/Simulator.tsx` - Use real data + empty states (UPDATED)
- `src/App.tsx` - Wrapped with AppProvider (UPDATED)

## User Experience Flow

### First Launch
1. User sees "Welcome to AI Student OS" empty state
2. Click "Add Course" → Enter course details
3. System shows empty deliverables state
4. Click "Add Deliverable" → Enter assignment details
5. Dashboard immediately shows calculated metrics with explanations

### Ongoing Use
1. Add deliverables as they're assigned
2. Update status (not started → in progress → completed)
3. Add grades when received
4. Dashboard automatically recalculates all metrics
5. Explanations show specific items driving each metric

### Trust Building
- Users see **exactly** which deliverables contribute to metrics
- Explanations use concrete numbers: "48h needed vs 30h budget"
- No magic numbers - everything traces back to user input
- Settings accessible to adjust time budget assumptions

## Benefits

1. **Clarity**: Users understand where every number comes from
2. **Trust**: No hidden algorithms or unexplained scores
3. **Actionable**: Explanations point to specific deliverables
4. **Personalized**: Reflects actual user workload and goals
5. **Educational**: Shows relationship between inputs and outcomes

## Next Steps (Future Enhancements)
- Edit deliverable functionality
- Bulk import from syllabus
- Historical tracking (trend over time)
- Smart scheduling recommendations
- Integration with calendar apps
- Grade predictions based on past performance
