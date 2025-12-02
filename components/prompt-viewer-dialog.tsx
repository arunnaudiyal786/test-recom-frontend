"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, FileText, History, Briefcase, Wrench, Code, Sparkles } from "lucide-react"

// ============================================================================
// TYPES
// ============================================================================

interface LabelCriteria {
  [key: string]: string
}

interface PromptData {
  template: string
  description: string
  label_criteria?: LabelCriteria
}

interface PromptsResponse {
  label_assignment: {
    historical: PromptData
    business: PromptData
    technical: PromptData
  }
  resolution_generation: PromptData
}

// Actual prompts with filled-in data from processing
interface ActualLabelingPrompts {
  historical?: string
  business?: string
  technical?: string
}

interface PromptViewerDialogProps {
  agentType: "label_assignment" | "resolution_generation"
  trigger: React.ReactNode
  // Optional: actual prompts from processing (with real ticket data filled in)
  actualPrompts?: ActualLabelingPrompts | string
}

// ============================================================================
// PROMPT CODE BLOCK COMPONENT
// ============================================================================

function PromptCodeBlock({ content, title }: { content: string; title?: string }) {
  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</span>
        </div>
      )}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-slate-950 overflow-hidden">
        <ScrollArea className="h-[400px]">
          <pre className="p-4 text-xs text-slate-100 dark:text-slate-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
            {content}
          </pre>
        </ScrollArea>
      </div>
    </div>
  )
}

// ============================================================================
// LABEL CRITERIA DISPLAY
// ============================================================================

function LabelCriteriaDisplay({ criteria }: { criteria: LabelCriteria }) {
  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Label-Specific Criteria
        </span>
      </div>
      <div className="grid gap-2">
        {Object.entries(criteria).map(([label, criteria]) => (
          <details key={label} className="group rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Badge variant="outline" className="ml-2 text-xs">
                {label}
              </Badge>
            </summary>
            <div className="px-3 pb-3">
              <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono">
                {criteria}
              </pre>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PromptViewerDialog({ agentType, trigger, actualPrompts }: PromptViewerDialogProps) {
  const [open, setOpen] = useState(false)
  const [prompts, setPrompts] = useState<PromptsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if we have actual prompts (with real data filled in)
  const hasActualPrompts = actualPrompts !== undefined && actualPrompts !== null

  // For label assignment, actualPrompts is an object with historical, business, technical
  // For resolution, actualPrompts is a string
  const actualLabelingPrompts = typeof actualPrompts === 'object' ? actualPrompts as ActualLabelingPrompts : null
  const actualResolutionPrompt = typeof actualPrompts === 'string' ? actualPrompts : null

  // Fetch template prompts when dialog opens (only if we don't have actual prompts)
  useEffect(() => {
    if (open && !prompts && !hasActualPrompts) {
      setLoading(true)
      setError(null)

      fetch("http://localhost:8000/api/prompts")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch prompts")
          return res.json()
        })
        .then((data) => {
          setPrompts(data)
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message)
          setLoading(false)
        })
    }
  }, [open, prompts, hasActualPrompts])

  const isLabelAssignment = agentType === "label_assignment"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            {isLabelAssignment ? "Label Assignment Prompts" : "Resolution Generation Prompt"}
          </DialogTitle>
          <DialogDescription>
            {isLabelAssignment
              ? "View the prompts used by the Label Assignment agent to classify and generate labels"
              : "View the Chain-of-Thought prompt used to generate resolution plans"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Loading State - only show when fetching templates */}
          {loading && !hasActualPrompts && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-muted-foreground">Loading prompts...</span>
            </div>
          )}

          {/* Error State - only show when fetching templates */}
          {error && !hasActualPrompts && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
              <p className="text-sm text-red-600 dark:text-red-400">
                Error loading prompts: {error}
              </p>
              <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                Make sure the backend server is running on http://localhost:8000
              </p>
            </div>
          )}

          {/* ============================================================ */}
          {/* ACTUAL PROMPTS (with real ticket data filled in) */}
          {/* ============================================================ */}

          {/* Label Assignment - Actual Prompts */}
          {hasActualPrompts && isLabelAssignment && actualLabelingPrompts && (
            <div className="space-y-4">
              {/* Indicator that these are actual prompts */}
              <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Actual Prompts Sent to LLM
                  </p>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  These are the exact prompts that were sent to the AI with your ticket data filled in
                </p>
              </div>

              <Tabs defaultValue="historical" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="historical" className="flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Historical</span>
                  </TabsTrigger>
                  <TabsTrigger value="business" className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Business</span>
                  </TabsTrigger>
                  <TabsTrigger value="technical" className="flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Technical</span>
                  </TabsTrigger>
                </TabsList>

                {/* Historical Labels Tab - Actual */}
                <TabsContent value="historical" className="mt-4 space-y-4">
                  {actualLabelingPrompts.historical ? (
                    <PromptCodeBlock
                      content={actualLabelingPrompts.historical}
                      title="Actual Historical Label Evaluation Prompt"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      No historical label prompt available
                    </div>
                  )}
                </TabsContent>

                {/* Business Labels Tab - Actual */}
                <TabsContent value="business" className="mt-4 space-y-4">
                  {actualLabelingPrompts.business ? (
                    <PromptCodeBlock
                      content={actualLabelingPrompts.business}
                      title="Actual Business Label Generation Prompt"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      No business label prompt available
                    </div>
                  )}
                </TabsContent>

                {/* Technical Labels Tab - Actual */}
                <TabsContent value="technical" className="mt-4 space-y-4">
                  {actualLabelingPrompts.technical ? (
                    <PromptCodeBlock
                      content={actualLabelingPrompts.technical}
                      title="Actual Technical Label Generation Prompt"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      No technical label prompt available
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Resolution Generation - Actual Prompt */}
          {hasActualPrompts && !isLabelAssignment && actualResolutionPrompt && (
            <div className="space-y-4">
              {/* Indicator that this is the actual prompt */}
              <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Actual Prompt Sent to LLM
                  </p>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  This is the exact prompt that was sent to the AI with your ticket data and similar tickets filled in
                </p>
              </div>
              <PromptCodeBlock
                content={actualResolutionPrompt}
                title="Actual Resolution Generation Prompt"
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* TEMPLATE PROMPTS (fallback when no actual prompts) */}
          {/* ============================================================ */}

          {/* Label Assignment Prompts (Tabbed) - Templates */}
          {!loading && !error && prompts && isLabelAssignment && !hasActualPrompts && (
            <Tabs defaultValue="historical" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="historical" className="flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Historical</span>
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Business</span>
                </TabsTrigger>
                <TabsTrigger value="technical" className="flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Technical</span>
                </TabsTrigger>
              </TabsList>

              {/* Historical Labels Tab */}
              <TabsContent value="historical" className="mt-4 space-y-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {prompts.label_assignment.historical.description}
                  </p>
                </div>
                <PromptCodeBlock
                  content={prompts.label_assignment.historical.template}
                  title="Prompt Template"
                />
                {prompts.label_assignment.historical.label_criteria && (
                  <LabelCriteriaDisplay criteria={prompts.label_assignment.historical.label_criteria} />
                )}
              </TabsContent>

              {/* Business Labels Tab */}
              <TabsContent value="business" className="mt-4 space-y-4">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    {prompts.label_assignment.business.description}
                  </p>
                </div>
                <PromptCodeBlock
                  content={prompts.label_assignment.business.template}
                  title="Prompt Template"
                />
              </TabsContent>

              {/* Technical Labels Tab */}
              <TabsContent value="technical" className="mt-4 space-y-4">
                <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
                  <p className="text-sm text-violet-700 dark:text-violet-300">
                    {prompts.label_assignment.technical.description}
                  </p>
                </div>
                <PromptCodeBlock
                  content={prompts.label_assignment.technical.template}
                  title="Prompt Template"
                />
              </TabsContent>
            </Tabs>
          )}

          {/* Resolution Generation Prompt (Single View) - Template */}
          {!loading && !error && prompts && !isLabelAssignment && !hasActualPrompts && (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {prompts.resolution_generation.description}
                </p>
              </div>
              <PromptCodeBlock
                content={prompts.resolution_generation.template}
                title="Resolution Generation Prompt Template"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
