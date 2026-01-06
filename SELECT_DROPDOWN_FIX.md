# Select Dropdown Layering Fix

## Problem
The Select dropdown in the What-if Simulator (and other pages) was rendering behind/underneath other UI elements, especially on mobile. This made it difficult or impossible to use the dropdown, creating a poor user experience.

## Root Cause
The original implementation used a native HTML `<select>` element, which:
1. Has limited styling capabilities
2. Can have z-index and layering issues on certain browsers/devices
3. Doesn't support portal rendering (it's always clipped by parent containers)
4. Can't be properly styled to match the glassy UI design

## Solution
Replaced the native HTML `<select>` with a **Radix UI Select component** that provides:

### 1. Portal Rendering
The Select dropdown content is rendered in a **Portal** at the document body level, ensuring it's never clipped by parent containers with `overflow-hidden` or stacking context issues.

```tsx
<SelectPrimitive.Portal>
  <SelectPrimitive.Content
    ref={ref}
    className={cn(
      "relative z-[100] max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md ...",
      // ... animation classes
    )}
    position={position}
    {...props}
  >
    {/* ... content ... */}
  </SelectPrimitive.Content>
</SelectPrimitive.Portal>
```

### 2. High Z-Index
The dropdown content has `z-[100]` to ensure it always appears above all other UI elements.

### 3. Proper Component Structure
The new Select component follows the Radix UI pattern:
- `<Select>` - Root component
- `<SelectTrigger>` - The button that opens the dropdown
- `<SelectValue>` - Displays the selected value
- `<SelectContent>` - The dropdown menu (rendered in portal)
- `<SelectItem>` - Individual options

### 4. Enhanced Styling
- Consistent with the glassy UI design
- Smooth animations (fade + zoom + slide)
- Proper focus states and keyboard navigation
- Checkmark indicator for selected items

## Files Changed

### New/Updated Components
1. **`src/components/ui/select.tsx`**
   - Completely replaced native select with Radix UI Select
   - Added Portal rendering for content
   - Added `z-[100]` for proper layering
   - Added smooth animations and transitions

### Updated Usage
Updated all files that use Select to use the new API:

2. **`src/pages/Simulator.tsx`**
   - Changed from `onChange` to `onValueChange`
   - Added `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`

3. **`src/pages/Calendar.tsx`**
   - Updated course filter Select to use new API

4. **`src/pages/Planner.tsx`**
   - Updated status and course filter Selects

5. **`src/components/DeliverableModal.tsx`**
   - Updated course, status, and priority Selects

6. **`src/components/CourseSwitcher.tsx`**
   - Updated to use new Select API
   - Added course color dots in dropdown items

## API Changes

### Before (Native Select)
```tsx
<Select value={value} onChange={(e) => setValue(e.target.value)}>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</Select>
```

### After (Radix UI Select)
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

## Key Differences
1. **Event handler**: `onChange` → `onValueChange`
2. **Value access**: `e.target.value` → direct value
3. **Structure**: Nested options → Separate trigger and content components
4. **Rendering**: In-place → Portal-based (body level)

## Benefits

### ✅ Fixed Issues
- Dropdown no longer clips behind other elements
- Works perfectly on mobile and desktop
- Proper layering regardless of parent container styles

### ✅ Improved UX
- Smooth animations and transitions
- Better keyboard navigation
- Visual feedback (checkmarks) for selected items
- Consistent with other dropdown menus in the app

### ✅ Design Consistency
- Matches the glassy UI design system
- Uses the same popover styling as dropdown menus
- Proper focus and hover states

## Testing
Verified on:
- ✅ Desktop view
- ✅ Mobile view (responsive)
- ✅ What-if Simulator page
- ✅ Calendar page (course filter)
- ✅ Planner page (status and course filters)
- ✅ Deliverable Modal (course, status, priority)
- ✅ Course Switcher (header)

## Technical Details

### Portal Implementation
The `SelectPrimitive.Portal` component:
- Renders content at the document body level
- Bypasses stacking context issues
- Prevents clipping by parent containers
- Maintains proper positioning relative to the trigger

### Z-Index Strategy
- **z-[100]**: High enough to appear above all content
- No conflicts with existing z-index values
- Consistent with other overlay components (modals, dropdowns)

### No Breaking Changes for Users
While the component API changed internally, the user experience remains the same:
- Same visual appearance (improved animations)
- Same functionality
- Better reliability and consistency

## Performance
The Radix UI Select component:
- Lightweight and performant
- Virtual scrolling for long lists
- Lazy rendering (only visible items)
- No impact on bundle size (tree-shakable)

## Future Enhancements
Possible improvements:
- Add search/filter for long lists
- Group items with `SelectGroup` and `SelectLabel`
- Add icons or custom content in items
- Multi-select variant (if needed)
