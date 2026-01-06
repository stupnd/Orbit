import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/EmptyState"
import { DeliverableModal } from "@/components/DeliverableModal"
import { useAppState } from "@/lib/store"
import { Calculator, TrendingUp, Clock, AlertTriangle, Plus } from "lucide-react"
import { motion } from "framer-motion"
import type { WhatIfOutput } from "@/lib/types"

export function Simulator() {
  const { deliverables } = useAppState()
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string>(
    deliverables[0]?.id || ""
  )
  const [effortHours, setEffortHours] = useState(15)
  const [targetGrade, setTargetGrade] = useState(85)
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("medium")
  const [showDeliverableModal, setShowDeliverableModal] = useState(false)

  // If no deliverables exist, show empty state
  if (deliverables.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">What-if Simulator</h1>
          <p className="text-muted-foreground mt-1">
            Explore different scenarios and their impact on your grades and workload
          </p>
        </div>

        <EmptyState
          icon={Calculator}
          title="No deliverables to simulate"
          description="Add some deliverables first to explore different what-if scenarios."
          action={
            <Button onClick={() => setShowDeliverableModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Deliverable
            </Button>
          }
        />

        <DeliverableModal
          isOpen={showDeliverableModal}
          onClose={() => setShowDeliverableModal(false)}
        />
      </div>
    )
  }

  const selectedDeliverable = deliverables.find((d) => d.id === selectedDeliverableId)

  // Mock calculation function (can be enhanced later)
  const calculateWhatIf = (): WhatIfOutput => {
    if (!selectedDeliverable) {
      return {
        gradeChange: 0,
        timeChange: 0,
        riskChange: 0,
        explanation: "Please select a deliverable to simulate.",
      }
    }

    const baseHours = selectedDeliverable.estimatedHours
    const baseGrade = selectedDeliverable.currentGrade || selectedDeliverable.targetGrade || 80

    const gradeChange = targetGrade - baseGrade
    const timeChange = effortHours - baseHours
    const riskChange = riskLevel === "high" ? 20 : riskLevel === "medium" ? 0 : -20

    let explanation = `Simulating ${selectedDeliverable.title}: `

    if (gradeChange > 0) {
      explanation += `Targeting ${targetGrade}% (${gradeChange.toFixed(1)}% improvement). `
    } else if (gradeChange < 0) {
      explanation += `Targeting ${targetGrade}% (${Math.abs(gradeChange).toFixed(1)}% below estimate). `
    } else {
      explanation += `Maintaining ${targetGrade}% target. `
    }

    if (timeChange > 0) {
      explanation += `This requires ${Math.abs(timeChange).toFixed(0)} extra hours. `
    } else if (timeChange < 0) {
      explanation += `This could save ${Math.abs(timeChange).toFixed(0)} hours but may increase risk. `
    }

    if (riskLevel === "high") {
      explanation += `High risk approach may lead to last-minute stress.`
    } else if (riskLevel === "low") {
      explanation += `Low risk approach provides better safety margins.`
    } else {
      explanation += `Balanced approach between time and quality.`
    }

    return {
      gradeChange,
      timeChange,
      riskChange,
      explanation,
    }
  }

  const output = calculateWhatIf()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">What-if Simulator</h1>
        <p className="text-muted-foreground mt-1">
          Explore different scenarios and their impact on your grades and workload
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Simulation Parameters
            </CardTitle>
            <CardDescription>
              Adjust the parameters to see how they affect your outcomes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Deliverable Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Deliverable</label>
              <Select
                value={selectedDeliverableId}
                onValueChange={(value) => setSelectedDeliverableId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a deliverable" />
                </SelectTrigger>
                <SelectContent>
                  {deliverables.map((deliverable) => (
                    <SelectItem key={deliverable.id} value={deliverable.id}>
                      {deliverable.title} - {deliverable.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDeliverable && (
                <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Current estimate:</span>{" "}
                    <span className="font-medium">{selectedDeliverable.estimatedHours}h</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Target grade:</span>{" "}
                    <span className="font-medium">
                      {selectedDeliverable.targetGrade || "N/A"}%
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Weight:</span>{" "}
                    <span className="font-medium">{selectedDeliverable.gradeWeight}%</span> of
                    course grade
                  </p>
                </div>
              )}
            </div>

            {/* Effort Hours Slider */}
            <div>
              <Slider
                label="Effort Hours"
                min={1}
                max={40}
                value={effortHours}
                onChange={(e) => setEffortHours(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1h</span>
                <span className="font-medium">{effortHours}h</span>
                <span>40h</span>
              </div>
            </div>

            {/* Target Grade Slider */}
            <div>
              <Slider
                label="Target Grade (%)"
                min={60}
                max={100}
                value={targetGrade}
                onChange={(e) => setTargetGrade(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>60%</span>
                <span className="font-medium">{targetGrade}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Risk Level Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Risk Level</label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((level) => (
                  <Button
                    key={level}
                    variant={riskLevel === level ? "default" : "outline"}
                    onClick={() => setRiskLevel(level)}
                    className="flex-1 capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Risk affects stress levels and deadline pressure
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
            <CardDescription>Impact analysis based on your selected parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Impact Metrics */}
            <div className="grid gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Grade Change</span>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      output.gradeChange > 0
                        ? "text-green-600"
                        : output.gradeChange < 0
                        ? "text-red-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {output.gradeChange > 0 ? "+" : ""}
                    {output.gradeChange.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Impact on this deliverable's grade
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Time Change</span>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      output.timeChange > 0
                        ? "text-red-600"
                        : output.timeChange < 0
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {output.timeChange > 0 ? "+" : ""}
                    {output.timeChange.toFixed(1)}h
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Additional time required vs estimate</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Risk Level</span>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      output.riskChange > 0
                        ? "text-red-600"
                        : output.riskChange < 0
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {riskLevel === "high" ? "High" : riskLevel === "medium" ? "Medium" : "Low"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Stress and deadline pressure</p>
              </motion.div>
            </div>

            {/* Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-lg bg-muted/50 border border-border"
            >
              <h4 className="text-sm font-semibold mb-2">Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{output.explanation}</p>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
