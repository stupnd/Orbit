# Dropdown Menu Clipping Fix

## Problem
The dropdown menu (kebab menu ⋯) on deliverable cards was being clipped by parent containers with `overflow-hidden`. This is a common z-index and stacking context issue where dropdown content rendered inline gets clipped by ancestor containers.

**Visual issue:**
```
┌─────────────────────┐
│ Deliverable Card    │⋯
│                     │ Edit  <- Clipped!
└─────────────────────┘ Mark...
┌─────────────────────┐
│ Another Card        │
```

## Solution
Implemented a **portal-based dropdown** that renders at the document body level, completely outside of any clipping containers.

### Key Changes

#### 1. Portal Rendering
- Uses `React.createPortal()` to render dropdown content at `document.body`
- Content is no longer nested inside cards or any containers with `overflow-hidden`
- Appears above all other UI elements

#### 2. Position Calculation
- Calculates position dynamically based on trigger button's `getBoundingClientRect()`
- Accounts for scroll position (`window.scrollY`, `window.scrollX`)
- Updates position on scroll and resize events
- Supports both `align="start"` and `align="end"`

#### 3. High Z-Index
- Uses `z-[100]` on dropdown content
- Ensures dropdown floats above all cards, modals, and other UI elements
- Standard practice for portal-rendered overlays

#### 4. Preserved Functionality
- ✅ Click outside to close
- ✅ Escape key to close
- ✅ Smooth animations (framer-motion)
- ✅ Keyboard navigation
- ✅ Proper event propagation (stopPropagation on dropdown clicks)

### Technical Implementation

#### Before (Inline Rendering)
```tsx
// Rendered inline, subject to parent's overflow
<div className="relative">
  <button>Trigger</button>
  {open && (
    <div className="absolute top-full right-0 z-50">
      Dropdown content
    </div>
  )}
</div>
```

**Problem:** Parent card has `overflow-hidden` → clips dropdown

#### After (Portal Rendering)
```tsx
// Trigger in place
<div className="relative inline-block">
  <button ref={triggerRef}>Trigger</button>
</div>

// Content portaled to document.body
{open && createPortal(
  <div 
    style={{ 
      position: "absolute", 
      top: calculatedTop, 
      right: calculatedRight 
    }}
    className="z-[100]"
  >
    Dropdown content
  </div>,
  document.body
)}
```

**Result:** Dropdown renders at body level → never clipped

### Code Changes

#### Updated File: `src/components/ui/dropdown-menu.tsx`

**Key additions:**
1. **Import portal**: `import { createPortal } from "react-dom"`
2. **Trigger ref**: Store reference to trigger element
   ```tsx
   const triggerRef = React.useRef<HTMLElement | null>(null)
   ```
3. **Position calculation**: Dynamic positioning based on trigger
   ```tsx
   const rect = triggerRef.current.getBoundingClientRect()
   setPosition({
     top: rect.bottom + window.scrollY + 4,
     left: align === "end" ? rect.right : rect.left,
   })
   ```
4. **Portal rendering**: Render at document.body
   ```tsx
   return createPortal(
     <motion.div style={{ position: "absolute", ... }}>
       {children}
     </motion.div>,
     document.body
   )
   ```

### Visual Result

**Now works correctly:**
```
┌─────────────────────┐
│ Deliverable Card    │⋯
│                     │ 
└─────────────────────┘
┌─────────────────────┐  ┌──────────────┐
│ Another Card        │  │ Edit         │ <- Floats above!
│                     │  │ Mark Complete│
└─────────────────────┘  │ Delete       │
                         └──────────────┘
```

### Testing Checklist

✅ **Dropdown not clipped** by parent cards  
✅ **Z-index correct** - appears above all elements  
✅ **Position accurate** - aligns with trigger button  
✅ **Scroll tracking** - follows trigger on scroll  
✅ **Click outside** - closes dropdown  
✅ **Escape key** - closes dropdown  
✅ **Animations smooth** - fade and scale work  
✅ **Multiple dropdowns** - only one open at a time  
✅ **Responsive** - works on mobile/tablet/desktop  
✅ **No visual glitches** - smooth open/close  

### Performance Considerations

- **Position updates**: Only recalculated when dropdown is open
- **Event listeners**: Added/removed based on open state
- **Portal overhead**: Minimal - only renders when open
- **Memory leaks**: None - proper cleanup in useEffect returns

### Browser Compatibility

✅ Modern browsers (Chrome, Firefox, Safari, Edge)  
✅ Uses standard React portals (built-in React feature)  
✅ getBoundingClientRect() - widely supported  
✅ No polyfills needed  

### Best Practices Applied

1. ✅ **Portal pattern** - Industry standard for overlays
2. ✅ **Dynamic positioning** - Calculates based on trigger, not hardcoded
3. ✅ **High z-index** - Ensures visibility (z-[100])
4. ✅ **Event cleanup** - Removes listeners on unmount
5. ✅ **Accessibility** - Keyboard navigation preserved
6. ✅ **Performance** - Only tracks scroll/resize when open
7. ✅ **No hacks** - Clean, maintainable solution

### Comparison to Other Solutions

| Approach | Pros | Cons | Our Choice |
|----------|------|------|------------|
| Inline rendering | Simple | Gets clipped | ❌ |
| Remove overflow-hidden | Quick fix | Breaks card styles | ❌ |
| Higher z-index | Easy | Doesn't fix clipping | ❌ |
| **Portal rendering** | **Never clipped, clean** | **Slight complexity** | **✅** |

### Why This Is The Right Solution

1. **No compromises**: Preserves glassy card styles (overflow-hidden stays)
2. **Standard pattern**: Used by Radix, shadcn/ui, Material-UI, Ant Design
3. **Future-proof**: Works with any parent styling
4. **Professional**: Matches behavior of Linear, Notion, Figma
5. **Maintainable**: Clear, documented code

### Future Enhancements (Optional)

If needed in the future:
- Collision detection (flip dropdown if near screen edge)
- Custom offset props (adjust gap from trigger)
- Multiple positioning strategies (top, bottom, left, right)
- Animation variants (slide, fade, scale)
- Nested dropdown support

### Related Components

This pattern can be applied to:
- Tooltip components
- Popover components  
- Context menus
- Select dropdowns
- Any overlay that needs to escape parent containers

---

## Summary

✅ **Fixed**: Dropdown menu clipping issue  
✅ **Method**: React portal rendering at document.body  
✅ **Z-index**: 100 (above all content)  
✅ **Positioning**: Dynamic, based on trigger element  
✅ **Build**: Passes with no errors  
✅ **Design**: Maintains glassy, minimal aesthetic  

The dropdown now works like a professional app (Linear, Notion) with proper overlay behavior!
