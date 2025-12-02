"use client"

import { Check, X } from "lucide-react"

// Types for actual prompts
interface ActualLabelingPrompts {
  historical?: string
  business?: string
  technical?: string
}

interface PromptPreviewTooltipProps {
  agentType: "label_assignment" | "resolution_generation"
  actualPrompts?: ActualLabelingPrompts | string
}

function truncateText(text: string, maxLength: number = 200): string {
  if (!text || text.length <= maxLength) return text || ""
  return text.slice(0, maxLength).trim() + "..."
}

function PromptAvailabilityIndicator({
  label,
  available
}: {
  label: string
  available: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      {available ? (
        <Check className="h-3 w-3 text-emerald-400" />
      ) : (
        <X className="h-3 w-3 text-slate-500" />
      )}
      <span className={available ? "text-slate-200" : "text-slate-500"}>
        {label}
      </span>
    </div>
  )
}

export function PromptPreviewTooltip({ agentType, actualPrompts }: PromptPreviewTooltipProps) {
  const isLabelAssignment = agentType === "label_assignment"

  // Parse prompts based on agent type
  const labelingPrompts = typeof actualPrompts === 'object' ? actualPrompts as ActualLabelingPrompts : null
  const resolutionPrompt = typeof actualPrompts === 'string' ? actualPrompts : null

  // Get first available prompt for preview
  let previewText = ""
  if (isLabelAssignment && labelingPrompts) {
    previewText = labelingPrompts.historical || labelingPrompts.business || labelingPrompts.technical || ""
  } else if (resolutionPrompt) {
    previewText = resolutionPrompt
  }

  return (
    <div className="max-w-md space-y-2">
      {/* Header */}
      <div className="font-medium text-slate-100 text-sm border-b border-slate-700 pb-1.5">
        {isLabelAssignment ? "Label Assignment Prompts" : "Resolution Prompt"}
      </div>

      {/* Label Assignment: Show availability for all three */}
      {isLabelAssignment && labelingPrompts && (
        <div className="flex gap-4 text-xs">
          <PromptAvailabilityIndicator
            label="Historical"
            available={!!labelingPrompts.historical}
          />
          <PromptAvailabilityIndicator
            label="Business"
            available={!!labelingPrompts.business}
          />
          <PromptAvailabilityIndicator
            label="Technical"
            available={!!labelingPrompts.technical}
          />
        </div>
      )}

      {/* Preview snippet */}
      {previewText && (
        <div className="rounded bg-slate-800 p-2 text-xs font-mono text-slate-300 leading-relaxed">
          {truncateText(previewText, 200)}
        </div>
      )}

      {/* Click hint */}
      <div className="text-[10px] text-slate-400 italic pt-1">
        Click to view full prompt
      </div>
    </div>
  )
}
