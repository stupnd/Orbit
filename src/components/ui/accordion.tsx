import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface AccordionProps {
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

interface AccordionItemProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

interface AccordionTriggerProps {
  children: React.ReactNode
  onClick?: () => void
}

interface AccordionContentProps {
  children: React.ReactNode
  isOpen: boolean
}

const AccordionContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {},
})

export function AccordionItem({ children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <AccordionContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="border-b border-border last:border-0">{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionTrigger({ children, onClick }: AccordionTriggerProps) {
  const { isOpen, setIsOpen } = React.useContext(AccordionContext)

  const handleClick = () => {
    setIsOpen(!isOpen)
    onClick?.()
  }

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center justify-between py-3 text-sm font-medium transition-all hover:text-foreground text-left"
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  )
}

export function AccordionContent({ children, isOpen }: AccordionContentProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="pb-4 pt-0">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Accordion({ children, className }: AccordionProps) {
  return <div className={cn("w-full", className)}>{children}</div>
}
