"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, XCircle, Circle, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { DomainClassificationOutput } from "./domain-classification-output"
import { HistoricalMatchOutput } from "./historical-match-output"
import { LabelAssignmentOutput } from "./label-assignment-output"
import { NoveltyDetectionOutput } from "./novelty-detection-output"
import { ResolutionGenerationOutput } from "./resolution-generation-output"
import { PromptViewerDialog } from "./prompt-viewer-dialog"
import { PromptPreviewTooltip } from "./prompt-preview-tooltip"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Simple summary component for resolution generation agent card
function ResolutionSummaryOutput({ data }: { data: any }) {
  const { summary, total_steps, estimated_hours, confidence } = data

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-background border p-2.5">
          <p className="text-xs text-muted-foreground mb-1">Total Steps</p>
          <p className="text-lg font-semibold text-foreground">{total_steps}</p>
        </div>
        <div className="rounded-lg bg-background border p-2.5">
          <p className="text-xs text-muted-foreground mb-1">Est. Time</p>
          <p className="text-lg font-semibold text-foreground">{estimated_hours}h</p>
        </div>
        <div className="rounded-lg bg-background border p-2.5">
          <p className="text-xs text-muted-foreground mb-1">Confidence</p>
          <p className="text-lg font-semibold text-foreground">{Math.round(confidence * 100)}%</p>
        </div>
      </div>

      {/* Note */}
      <div className="rounded-lg bg-muted/50 p-2.5 border border-dashed">
        <p className="text-xs text-muted-foreground">
          View the full detailed resolution plan in the Final Resolution Output section below
        </p>
      </div>
    </div>
  )
}

export type AgentStatus = "idle" | "processing" | "streaming" | "complete" | "error"

// Types for actual prompts
interface ActualLabelingPrompts {
  category?: string
  business?: string
  technical?: string
}

export interface AgentCardProps {
  name: string
  description: string
  icon: React.ReactNode
  status: AgentStatus
  progress?: number
  output?: string
  streamingText?: string
  errorMessage?: string
  toolCalls?: Array<{ name: string; description: string }>
  toolOutputs?: Array<{ name: string; content: string }>
  // Actual prompts with real data filled in (from SSE)
  actualPrompts?: ActualLabelingPrompts | string
}

const statusConfig = {
  idle: {
    icon: Circle,
    color: "text-muted-foreground",
    bgColor: "border-muted",
    badge: "Idle",
    badgeVariant: "outline" as const,
  },
  processing: {
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "border-blue-500 bg-blue-50 dark:bg-blue-950",
    badge: "Processing",
    badgeVariant: "default" as const,
  },
  streaming: {
    icon: Loader2,
    color: "text-purple-500",
    bgColor: "border-purple-500 bg-purple-50 dark:bg-purple-950",
    badge: "Streaming",
    badgeVariant: "default" as const,
  },
  complete: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "border-green-500",
    badge: "Complete",
    badgeVariant: "secondary" as const,
  },
  error: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "border-red-500 bg-red-50 dark:bg-red-950",
    badge: "Error",
    badgeVariant: "destructive" as const,
  },
}

export function AgentCard({
  name,
  description,
  icon,
  status,
  progress = 0,
  output = "",
  streamingText = "",
  errorMessage,
  toolCalls = [],
  toolOutputs = [],
  actualPrompts,
}: AgentCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon
  const isAnimating = status === "processing" || status === "streaming"

  // Helper function to parse domain classification output
  const parseDomainClassificationOutput = (outputText: string) => {
    try {
      // Extract JSON from the output (it might be after "--- Final Output ---")
      const jsonMatch = outputText.match(/\{[\s\S]*"classified_domain"[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.classified_domain && parsed.confidence !== undefined && parsed.keywords) {
          return parsed
        }
      }
    } catch (e) {
      return null
    }
    return null
  }

  // Helper function to parse historical match output
  const parseHistoricalMatchOutput = (outputText: string) => {
    try {
      // Extract JSON from the output (it might be after "--- Final Output ---")
      const jsonMatch = outputText.match(/\{[\s\S]*"similar_tickets_count"[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.similar_tickets_count !== undefined && parsed.top_similarity !== undefined) {
          return parsed
        }
      }
    } catch (e) {
      return null
    }
    return null
  }

  // Helper function to parse label assignment output
  const parseLabelAssignmentOutput = (outputText: string) => {
    try {
      // Extract JSON from the output (it might be after "--- Final Output ---")
      const jsonMatch = outputText.match(/\{[\s\S]*"assigned_labels"[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.assigned_labels !== undefined && parsed.label_count !== undefined) {
          return parsed
        }
      }
    } catch (e) {
      return null
    }
    return null
  }

  // Helper function to parse resolution generation output
  const parseResolutionGenerationOutput = (outputText: string) => {
    try {
      // Extract JSON from the output (it might be after "--- Final Output ---")
      // Look for the summary format that comes from SSE
      const jsonMatch = outputText.match(/\{[\s\S]*"summary"[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        // Check if this is the summary format from SSE
        if (parsed.summary !== undefined && parsed.confidence !== undefined) {
          return parsed
        }
      }
    } catch (e) {
      return null
    }
    return null
  }

  // Helper function to parse novelty detection output
  const parseNoveltyDetectionOutput = (outputText: string) => {
    try {
      // Extract JSON from the output (it might be after "--- Final Output ---")
      const jsonMatch = outputText.match(/\{[\s\S]*"novelty_detected"[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        // Check if this has the novelty detection structure
        if (parsed.novelty_detected !== undefined && parsed.novelty_signals !== undefined) {
          return parsed
        }
      }
    } catch (e) {
      return null
    }
    return null
  }

  // Check if this is domain classification agent output
  const isDomainClassification = name.toLowerCase().includes("domain classification")
  const domainData = isDomainClassification && status === "complete"
    ? parseDomainClassificationOutput(output)
    : null

  // Check if this is historical match / similar tickets agent output
  const isHistoricalMatch = name.toLowerCase().includes("historical match") || name.toLowerCase().includes("similar tickets")
  const matchData = isHistoricalMatch && status === "complete"
    ? parseHistoricalMatchOutput(output)
    : null

  // Check if this is label assignment agent output
  const isLabelAssignment = name.toLowerCase().includes("label assignment")
  const labelData = isLabelAssignment && status === "complete"
    ? parseLabelAssignmentOutput(output)
    : null

  // Check if this is resolution generation agent output
  const isResolutionGeneration = name.toLowerCase().includes("resolution generation")
  const resolutionData = isResolutionGeneration && status === "complete"
    ? parseResolutionGenerationOutput(output)
    : null

  // Check if this is novelty detection agent output
  const isNoveltyDetection = name.toLowerCase().includes("novelty detection")
  const noveltyData = isNoveltyDetection && status === "complete"
    ? parseNoveltyDetectionOutput(output)
    : null

  // Determine if this agent should show the prompt info button
  const shouldShowPromptButton = (isLabelAssignment || isResolutionGeneration) && status === "complete" && actualPrompts

  return (
    <Card
      className={cn(
        "transition-all duration-300",
        config.bgColor,
        status !== "idle" && "shadow-md"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("rounded-lg bg-background p-2", config.color)}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{name}</CardTitle>
                {/* Info button for viewing actual prompts - with hover tooltip */}
                {shouldShowPromptButton && (
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <span>
                          <PromptViewerDialog
                            agentType={isLabelAssignment ? "label_assignment" : "resolution_generation"}
                            actualPrompts={actualPrompts}
                            trigger={
                              <button
                                className="p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                              >
                                <HelpCircle className="h-4 w-4 text-blue-500 hover:text-blue-600" />
                              </button>
                            }
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="p-3 max-w-md">
                        <PromptPreviewTooltip
                          agentType={isLabelAssignment ? "label_assignment" : "resolution_generation"}
                          actualPrompts={actualPrompts}
                        />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <Badge variant={config.badgeVariant}>
            <StatusIcon
              className={cn("mr-1 h-3 w-3", isAnimating && "animate-spin")}
            />
            {config.badge}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress Bar */}
        {(status === "processing" || status === "streaming") && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Output Area */}
        {status !== "idle" && (
          <div className={cn(
            "rounded-md border bg-background p-4 overflow-auto",
            domainData || matchData || labelData || resolutionData || noveltyData ? "max-h-[600px]" : "h-48"
          )}>
            <div className="space-y-2 text-sm">
              {/* Error Message */}
              {status === "error" && errorMessage && (
                <div className="rounded-md bg-destructive/10 p-3 text-destructive">
                  <p className="font-semibold">Error:</p>
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Streaming Text with Typing Effect */}
              {status === "streaming" && streamingText && (
                <div className="font-mono text-xs">
                  <span className="animate-pulse">{streamingText}</span>
                  <span className="inline-block h-4 w-1 animate-pulse bg-current ml-0.5" />
                </div>
              )}

              {/* Final Output */}
              {status === "complete" && output && (
                <>
                  {domainData ? (
                    <DomainClassificationOutput data={domainData} />
                  ) : matchData ? (
                    <HistoricalMatchOutput data={matchData} />
                  ) : labelData ? (
                    <LabelAssignmentOutput data={labelData} />
                  ) : noveltyData ? (
                    <NoveltyDetectionOutput data={noveltyData} />
                  ) : resolutionData ? (
                    <ResolutionSummaryOutput data={resolutionData} />
                  ) : (
                    <div className="whitespace-pre-wrap font-mono text-xs">
                      {output}
                    </div>
                  )}
                </>
              )}

              {/* Tool Calls */}
              {toolCalls && toolCalls.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-xs text-muted-foreground">Tool Calls:</p>
                  {toolCalls.map((tool, idx) => (
                    <div key={idx} className="rounded-md bg-blue-50 dark:bg-blue-950 p-2 text-xs">
                      <span className="font-mono text-blue-700 dark:text-blue-300">
                        {tool.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tool Outputs */}
              {toolOutputs && toolOutputs.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-xs text-muted-foreground">Tool Outputs:</p>
                  {toolOutputs.map((output, idx) => (
                    <div key={idx} className="rounded-md bg-green-50 dark:bg-green-950 p-2">
                      <p className="font-mono text-xs text-green-700 dark:text-green-300 mb-1">
                        {output.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {output.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Processing State */}
              {status === "processing" && !streamingText && toolCalls.length === 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing ticket data...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
