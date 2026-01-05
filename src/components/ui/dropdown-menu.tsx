import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType>({
  open: false,
  setOpen: () => {},
})

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode
  asChild?: boolean
}) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    } as any)
  }

  return <button onClick={handleClick}>{children}</button>
}

export function DropdownMenuContent({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode
  className?: string
  align?: "start" | "end"
}) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = () => setOpen(false)
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("click", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.1 }}
          className={cn(
            "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
            align === "end" ? "right-0" : "left-0",
            "top-full mt-1",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    if (disabled) return
    onClick?.()
    setOpen(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-border", className)} />
}
