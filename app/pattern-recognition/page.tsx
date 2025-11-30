"use client"

import { useState } from "react"
import { AgentCard, AgentStatus } from "@/components/agent-card"
import { TicketSubmission, TicketData } from "@/components/ticket-submission"
import { ResolutionGenerationOutput } from "@/components/resolution-generation-output"
import { Brain, Search, Tag, FileText, Download, Eye, EyeOff, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AgentState {
  status: AgentStatus
  progress: number
  output: string
  streamingText: string
  errorMessage?: string
  toolCalls?: Array<{ name: string; description: string }>
  toolOutputs?: Array<{ name: string; content: string }>
}

export default function PatternRecognitionPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [finalOutput, setFinalOutput] = useState<any>(null)
  const [showOutput, setShowOutput] = useState(false)
  const [currentTicketText, setCurrentTicketText] = useState("")
  const [agents, setAgents] = useState<Record<string, AgentState>>({
    classification: {
      status: "idle",
      progress: 0,
      output: "",
      streamingText: "",
    },
    patternRecognition: {
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
    resolutionGeneration: {
      status: "idle",
      progress: 0,
      output: "",
      streamingText: "",
    },
  })

  const handleLoadSample = async (setTicketText: (text: string) => void) => {
    // Load sample ticket from the backend's input file and populate the textarea
    try {
      const response = await fetch("http://localhost:8000/api/load-sample")
      if (response.ok) {
        const sampleTicket = await response.json()
        // Format the ticket as text for the textarea
        const ticketText = formatTicketAsText(sampleTicket)
        setTicketText(ticketText)
      }
    } catch (error) {
      // Fallback to hardcoded sample if API is not available
      const sampleTicket: TicketData = {
        ticket_id: "JIRA-NEW-001",
        title: "MM_ALDER service failing with connection timeout errors",
        description:
          "The MM_ALDER service is experiencing intermittent connection timeout errors when trying to connect to the database. Users are reporting slow response times during peak hours, and we're seeing 504 Gateway Timeout errors in the logs. The issue started happening after yesterday's deployment. Database connection pool metrics show that we're hitting the maximum connection limit (100 connections). Error logs show: 'Connection timeout after 10 seconds' and 'Connection pool exhausted'. This is affecting member eligibility lookups and enrollment processing.",
        priority: "High",
        metadata: {
          reported_by: "ops-team@example.com",
          affected_users: 150,
          environment: "production",
        },
      }
      const ticketText = formatTicketAsText(sampleTicket)
      setTicketText(ticketText)
    }
  }

  const formatTicketAsText = (ticket: TicketData): string => {
    // Format the ticket object as human-readable text
    return `${ticket.title}

${ticket.description}

Priority: ${ticket.priority}
Reported by: ${ticket.metadata.reported_by}
Environment: ${ticket.metadata.environment}
Affected users: ${ticket.metadata.affected_users}`
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

                  return {
                    ...prev,
                    [agentKey]: {
                      ...prev[agentKey],
                      status: "complete",
                      progress: 100,
                      output: combinedOutput,
                      streamingText: "",
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
        <h1 className="text-3xl font-bold tracking-tight">Pattern Recognition</h1>
        <p className="text-muted-foreground mt-2">
          Automated ticket classification, pattern matching, label assignment, and resolution generation
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
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            Agent Workflow Sequence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {/* Step 1: Domain Classification */}
            <div className="flex flex-col items-center min-w-[140px]">
              <div
                className={`rounded-lg p-3 transition-all duration-300 ${
                  agents.classification.status === "processing" ||
                  agents.classification.status === "streaming"
                    ? "bg-blue-500 shadow-lg ring-2 ring-blue-300 animate-pulse"
                    : agents.classification.status === "complete"
                    ? "bg-green-500 shadow-md"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <Brain className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-medium mt-2 text-center">
                Domain
                <br />
                Classification
              </p>
              {agents.classification.status === "complete" && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Complete</p>
              )}
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

            {/* Step 2: Pattern Recognition */}
            <div className="flex flex-col items-center min-w-[140px]">
              <div
                className={`rounded-lg p-3 transition-all duration-300 ${
                  agents.patternRecognition.status === "processing" ||
                  agents.patternRecognition.status === "streaming"
                    ? "bg-blue-500 shadow-lg ring-2 ring-blue-300 animate-pulse"
                    : agents.patternRecognition.status === "complete"
                    ? "bg-green-500 shadow-md"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <Search className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-medium mt-2 text-center">
                Pattern
                <br />
                Recognition
              </p>
              {agents.patternRecognition.status === "complete" && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Complete</p>
              )}
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

            {/* Step 3: Label Assignment */}
            <div className="flex flex-col items-center min-w-[140px]">
              <div
                className={`rounded-lg p-3 transition-all duration-300 ${
                  agents.labelAssignment.status === "processing" ||
                  agents.labelAssignment.status === "streaming"
                    ? "bg-blue-500 shadow-lg ring-2 ring-blue-300 animate-pulse"
                    : agents.labelAssignment.status === "complete"
                    ? "bg-green-500 shadow-md"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <Tag className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-medium mt-2 text-center">
                Label
                <br />
                Assignment
              </p>
              {agents.labelAssignment.status === "complete" && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Complete</p>
              )}
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

            {/* Step 4: Resolution Generation */}
            <div className="flex flex-col items-center min-w-[140px]">
              <div
                className={`rounded-lg p-3 transition-all duration-300 ${
                  agents.resolutionGeneration.status === "processing" ||
                  agents.resolutionGeneration.status === "streaming"
                    ? "bg-blue-500 shadow-lg ring-2 ring-blue-300 animate-pulse"
                    : agents.resolutionGeneration.status === "complete"
                    ? "bg-green-500 shadow-md"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <FileText className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-medium mt-2 text-center">
                Resolution
                <br />
                Generation
              </p>
              {agents.resolutionGeneration.status === "complete" && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Complete</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Progress Dashboard */}
      <div className="grid gap-6 md:grid-cols-2">
        <AgentCard
          name="Domain Classification Agent"
          description="Classifies tickets into MM, CIW, or Specialty domains"
          icon={<Brain className="h-5 w-5" />}
          {...agents.classification}
        />
        <AgentCard
          name="Pattern Recognition Agent"
          description="Finds similar historical tickets using FAISS vector search"
          icon={<Search className="h-5 w-5" />}
          {...agents.patternRecognition}
        />
        <AgentCard
          name="Label Assignment Agent"
          description="Assigns relevant labels based on historical patterns"
          icon={<Tag className="h-5 w-5" />}
          {...agents.labelAssignment}
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
