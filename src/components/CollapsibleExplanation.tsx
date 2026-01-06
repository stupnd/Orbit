import { Card, CardContent } from "./ui/card"
import { AccordionItem, AccordionTrigger, AccordionContent, Accordion } from "./ui/accordion"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface CollapsibleExplanationProps {
  title: string
  reasons: string[]
  className?: string
  defaultOpen?: boolean
}

export function CollapsibleExplanation({ 
  title, 
  reasons, 
  className,
  defaultOpen 
}: CollapsibleExplanationProps) {
  const [isDesktop, setIsDesktop] = useState(false)

  // Check if desktop on mount
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener("resize", checkDesktop)
    return () => window.removeEventListener("resize", checkDesktop)
  }, [])

  if (reasons.length === 0) return null

  // Use defaultOpen prop if provided, otherwise collapse on mobile, expand on desktop
  const shouldDefaultOpen = defaultOpen !== undefined ? defaultOpen : isDesktop

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <Accordion>
          <AccordionItem defaultOpen={shouldDefaultOpen}>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-3 flex-shrink-0" />
              <div className="flex-1">
                <AccordionTrigger>
                  <span className="font-medium">{title}</span>
                </AccordionTrigger>
                <AccordionContent isOpen={true}>
                  <ul className="space-y-1.5 mt-2">
                    {reasons.map((reason, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {reason}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
