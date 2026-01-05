import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="text-sm font-medium mb-2 block">{label}</label>
        )}
        <input
          type="range"
          className={cn(
            "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
