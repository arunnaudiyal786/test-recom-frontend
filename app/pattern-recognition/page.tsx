"use client"

import { useState, useEffect } from "react"
import { AgentCard, AgentStatus } from "@/components/agent-card"
import { TicketSubmission, TicketData } from "@/components/ticket-submission"
import { ResolutionGenerationOutput } from "@/components/resolution-generation-output"
import { Brain, Search, Tag, FileText, Download, Eye, EyeOff, ChevronRight, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

// Actual prompts from SSE (with real ticket data filled in)
interface ActualLabelingPrompts {
  category?: string
  business?: string
  technical?: string
}

interface AgentState {
  status: AgentStatus
  progress: number
  output: string
  streamingText: string
  errorMessage?: string
  toolCalls?: Array<{ name: string; description: string }>
  toolOutputs?: Array<{ name: string; content: string }>
  // Actual prompts with real data filled in
  actualPrompts?: ActualLabelingPrompts | string
}

export default function PatternRecognitionPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [finalOutput, setFinalOutput] = useState<any>(null)
  const [showOutput, setShowOutput] = useState(false)
  const [currentTicketText, setCurrentTicketText] = useState("")
  // Configuration state - tracks if domain classification is disabled
  const [skipClassification, setSkipClassification] = useState(true)
  const [agents, setAgents] = useState<Record<string, AgentState>>({
    classification: {
      status: "idle",
      progress: 0,
      output: "",
      streamingText: "",
    },
    historicalMatch: {
      status: "idle",
      progress: 0,
      output: "",
      streamingText: "",
    },
    labelAssignment: {
      status: "idle",
      progress: 0,
      output: "",
      streamingText: "",
    },
    noveltyDetection: {
      status: "idle",
      progress: 0,
      output: "",
      streamingText: "",
    },
    resolutionGeneration: {
      status: "idle",
      progress: 0,
      output: "",
      streamingText: "",
    },
  })

  // Fetch config on mount to check if classification is enabled
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/config")
        if (response.ok) {
          const config = await response.json()
          setSkipClassification(config.skip_domain_classification)
        }
      } catch (error) {
        console.log("Could not fetch config, using defaults")
      }
    }
    fetchConfig()
  }, [])

  const handleLoadSample = async (setTicketText: (text: string) => void) => {
    // Load sample ticket from the backend's input file (mandatory - no fallback)
    try {
      const response = await fetch("http://localhost:8000/api/load-sample")
      if (!response.ok) {
        const errorDetail = await response.text()
        throw new Error(`Failed to load sample ticket: ${response.status} - ${errorDetail}`)
      }
      const sampleTicket = await response.json()
      // Format the ticket as text for the textarea (dynamic - handles any JSON structure)
      const ticketText = formatAnyJsonAsText(sampleTicket)
      setTicketText(ticketText)
    } catch (error) {
      // Show error to user - do NOT fallback to hardcoded sample
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      alert(`Could not load sample ticket from backend.\n\nPlease ensure:\n1. Backend is running on http://localhost:8000\n2. File exists at test-recom-backend/input/current_ticket.json\n\nError: ${errorMessage}`)
      console.error("Failed to load sample ticket:", error)
    }
  }

  // Dynamic formatter - handles any JSON structure from current_ticket.json
  const formatAnyJsonAsText = (obj: Record<string, any>, indent: number = 0): string => {
    const lines: string[] = []
    const prefix = "  ".repeat(indent)

    for (const [key, value] of Object.entries(obj)) {
      const formattedKey = key
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim()

      if (value === null || value === undefined) {
        continue
      } else if (typeof value === "object" && !Array.isArray(value)) {
        // Nested object - recurse
        lines.push(`${prefix}${formattedKey}:`)
        lines.push(formatAnyJsonAsText(value, indent + 1))
      } else if (Array.isArray(value)) {
        // Array - format as comma-separated or bullet list
        lines.push(`${prefix}${formattedKey}: ${value.join(", ")}`)
      } else {
        // Primitive value
        lines.push(`${prefix}${formattedKey}: ${value}`)
      }
    }

    return lines.join("\n")
  }

  const updateAgentState = (agentKey: string, updates: Partial<AgentState>) => {
    setAgents((prev) => ({
      ...prev,
      [agentKey]: { ...prev[agentKey], ...updates },
    }))
  }

  const handleSubmit = async (ticket: TicketData) => {
    setIsProcessing(true)
    setFinalOutput(null)
    setShowOutput(false)

    // Reset all agents
    Object.keys(agents).forEach((key) => {
      updateAgentState(key, {
        status: "idle",
        progress: 0,
        output: "",
        streamingText: "",
        errorMessage: undefined,
        toolCalls: [],
        toolOutputs: [],
      })
    })

    try {
      // Call the Python FastAPI backend with SSE streaming
      const response = await fetch("http://localhost:8000/api/process-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticket),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Process SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))

            // Handle different event types
            if (data.status === "workflow_complete") {
              console.log("Workflow completed successfully!")
              // Fetch the final output
              if (data.output_available) {
                try {
                  const outputResponse = await fetch("http://localhost:8000/api/output")
                  if (outputResponse.ok) {
                    const output = await outputResponse.json()
                    setFinalOutput(output)
                    setShowOutput(true)
                  }
                } catch (err) {
                  console.error("Error fetching final output:", err)
                }
              }
              break
            } else if (data.status === "error") {
              console.error("Workflow error:", data.message)
              // Update the relevant agent with error status
              break
            } else if (data.agent) {
              // Update agent state based on the event
              const agentKey = data.agent

              if (data.status === "processing") {
                updateAgentState(agentKey, {
                  status: "processing",
                  progress: data.progress || 0,
                  streamingText: data.message || "",
                })
              } else if (data.status === "streaming") {
                setAgents((prev) => {
                  const currentText = prev[agentKey]?.streamingText || ""
                  const newMessage = data.message || ""

                  // Only append if this is a new message (not duplicate)
                  const updatedText = currentText.includes(newMessage)
                    ? currentText
                    : currentText + (currentText ? "\n" : "") + newMessage

                  return {
                    ...prev,
                    [agentKey]: {
                      ...prev[agentKey],
                      status: "streaming",
                      streamingText: updatedText,
                      progress: data.progress || 50,
                      toolCalls: data.tool_calls || prev[agentKey]?.toolCalls || [],
                      toolOutputs: data.tool_outputs || prev[agentKey]?.toolOutputs || [],
                    },
                  }
                })
              } else if (data.status === "complete") {
                setAgents((prev) => {
                  const finalOutput = formatAgentOutput(agentKey, data.data)
                  const streamedMessages = prev[agentKey]?.streamingText || ""

                  // Combine streaming text with final output
                  const combinedOutput = streamedMessages
                    ? `${streamedMessages}\n\n--- Final Output ---\n${finalOutput}`
                    : finalOutput

                  // Extract actual prompts from SSE data
                  let actualPrompts: ActualLabelingPrompts | string | undefined = undefined
                  if (agentKey === "labelAssignment" && data.data?.actual_prompts) {
                    // Label assignment: object with category, business, technical
                    actualPrompts = data.data.actual_prompts as ActualLabelingPrompts
                  } else if (agentKey === "resolutionGeneration" && data.data?.actual_prompt) {
                    // Resolution generation: single string
                    actualPrompts = data.data.actual_prompt as string
                  }

                  return {
                    ...prev,
                    [agentKey]: {
                      ...prev[agentKey],
                      status: "complete",
                      progress: 100,
                      output: combinedOutput,
                      streamingText: "",
                      actualPrompts,
                    },
                  }
                })
              } else if (data.status === "error") {
                updateAgentState(agentKey, {
                  status: "error",
                  errorMessage: data.message,
                })
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing ticket:", error)
      // Show error in UI
      updateAgentState("classification", {
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatAgentOutput = (agentKey: string, data: any): string => {
    if (!data) return "No data available"

    return JSON.stringify(data, null, 2)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Plan Recommendation</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered test plan recommendations based on historical ticket analysis and pattern matching
        </p>
      </div>

      {/* Ticket Submission */}
      <TicketSubmission
        onSubmit={handleSubmit}
        onLoadSample={handleLoadSample}
        isProcessing={isProcessing}
        onTextChange={setCurrentTicketText}
      />

      {/* Workflow Sequence Visualization */}
      <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Agent Workflow Sequence
            {skipClassification && (
              <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                (Domain Classification disabled)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {/* Step 1: Domain Classification - Only shown if not skipped */}
            {!skipClassification && (
              <>
                <div className="flex flex-col items-center min-w-[140px]">
                  <div
                    className={`rounded-lg p-3 transition-all duration-300 ${
                      agents.classification.status === "processing" ||
                      agents.classification.status === "streaming"
                        ? "bg-blue-500 shadow-md"
                        : agents.classification.status === "complete"
                        ? "bg-emerald-500 shadow-sm"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-xs font-medium mt-2 text-center text-slate-700 dark:text-slate-300">
                    Domain
                    <br />
                    Classification
                  </p>
                  {agents.classification.status === "complete" && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">✓ Complete</p>
                  )}
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </>
            )}

            {/* Step 2: Similar Cases (Step 1 when classification is skipped) */}
            <div className="flex flex-col items-center min-w-[140px]">
              <div
                className={`rounded-lg p-3 transition-all duration-300 ${
                  agents.historicalMatch.status === "processing" ||
                  agents.historicalMatch.status === "streaming"
                    ? "bg-blue-500 shadow-md"
                    : agents.historicalMatch.status === "complete"
                    ? "bg-emerald-500 shadow-sm"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <Search className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-medium mt-2 text-center text-slate-700 dark:text-slate-300">
                Similar
                <br />
                Tickets
              </p>
              {agents.historicalMatch.status === "complete" && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">✓ Complete</p>
              )}
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

            {/* Step 3: Label Assignment */}
            <div className="flex flex-col items-center min-w-[140px]">
              <div
                className={`rounded-lg p-3 transition-all duration-300 ${
                  agents.labelAssignment.status === "processing" ||
                  agents.labelAssignment.status === "streaming"
                    ? "bg-blue-500 shadow-md"
                    : agents.labelAssignment.status === "complete"
                    ? "bg-emerald-500 shadow-sm"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <Tag className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-medium mt-2 text-center text-slate-700 dark:text-slate-300">
                Label
                <br />
                Assignment
              </p>
              {agents.labelAssignment.status === "complete" && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">✓ Complete</p>
              )}
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

            {/* Step 4: Novelty Detection */}
            <div className="flex flex-col items-center min-w-[140px]">
              <div
                className={`rounded-lg p-3 transition-all duration-300 ${
                  agents.noveltyDetection.status === "processing" ||
                  agents.noveltyDetection.status === "streaming"
                    ? "bg-amber-500 shadow-md"
                    : agents.noveltyDetection.status === "complete"
                    ? "bg-emerald-500 shadow-sm"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-medium mt-2 text-center text-slate-700 dark:text-slate-300">
                Novelty
                <br />
                Detection
              </p>
              {agents.noveltyDetection.status === "complete" && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">✓ Complete</p>
              )}
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

            {/* Step 5: Resolution Generation */}
            <div className="flex flex-col items-center min-w-[140px]">
              <div
                className={`rounded-lg p-3 transition-all duration-300 ${
                  agents.resolutionGeneration.status === "processing" ||
                  agents.resolutionGeneration.status === "streaming"
                    ? "bg-blue-500 shadow-md"
                    : agents.resolutionGeneration.status === "complete"
                    ? "bg-emerald-500 shadow-sm"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <FileText className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-medium mt-2 text-center text-slate-700 dark:text-slate-300">
                Test Plan
                <br />
                Generation
              </p>
              {agents.resolutionGeneration.status === "complete" && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">✓ Complete</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Progress Dashboard */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Domain Classification Agent - Only shown if not skipped */}
        {!skipClassification && (
          <AgentCard
            name="Domain Classification Agent"
            description="Classifies tickets into MM, CIW, or Specialty domains"
            icon={<Brain className="h-5 w-5" />}
            {...agents.classification}
          />
        )}
        <AgentCard
          name="Historical Match Agent"
          description="Finds similar historical tickets using FAISS vector search"
          icon={<Search className="h-5 w-5" />}
          {...agents.historicalMatch}
        />
        <AgentCard
          name="Label Assignment Agent"
          description="Assigns relevant labels based on historical patterns"
          icon={<Tag className="h-5 w-5" />}
          {...agents.labelAssignment}
        />
        <AgentCard
          name="Novelty Detection Agent"
          description="Detects if ticket represents a new category not in taxonomy"
          icon={<Sparkles className="h-5 w-5" />}
          {...agents.noveltyDetection}
        />
        <AgentCard
          name="Resolution Generation Agent"
          description="Generates detailed resolution plans with steps and estimates"
          icon={<FileText className="h-5 w-5" />}
          {...agents.resolutionGeneration}
        />
      </div>

      {/* Final JSON Output */}
      {finalOutput && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Final Resolution Output
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOutput(!showOutput)}
                >
                  {showOutput ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(finalOutput, null, 2)], {
                      type: "application/json",
                    })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `ticket_resolution_${finalOutput.ticket_id || "output"}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Download CSV from API endpoint
                    window.open("http://localhost:8000/api/download-csv", "_blank")
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          {showOutput && (
            <CardContent>
              {finalOutput.resolution_plan ? (
                <ResolutionGenerationOutput data={finalOutput} />
              ) : (
                <ScrollArea className="h-96 rounded-md border bg-background p-4">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(finalOutput, null, 2)}
                  </pre>
                </ScrollArea>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
