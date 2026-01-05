import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Dialog } from "./ui/dialog"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {cancelText}
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Dialog>
  )
}
