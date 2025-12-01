"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Send } from "lucide-react"
import { useSchemaConfig } from "@/hooks/use-schema-config"

export interface TicketData {
  ticket_id: string
  title: string
  description: string
  priority: string
  metadata: {
    reported_by: string
    affected_users: number
    environment: string
  }
}

interface TicketSubmissionProps {
  onSubmit: (ticket: TicketData) => void
  onLoadSample: (setTicketText: (text: string) => void) => void
  isProcessing: boolean
  onTextChange?: (text: string) => void
}

export function TicketSubmission({ onSubmit, onLoadSample, isProcessing, onTextChange }: TicketSubmissionProps) {
  const [ticketText, setTicketText] = useState("")
  const { samplePlaceholder } = useSchemaConfig()

  const handleTextChange = (text: string) => {
    setTicketText(text)
    onTextChange?.(text)
  }

  const handleSubmit = () => {
    if (!ticketText.trim()) return

    // Parse the ticket text into structured data
    // For now, create a simple ticket structure
    const ticket: TicketData = {
      ticket_id: `JIRA-NEW-${Date.now()}`,
      title: ticketText.split("\n")[0] || "New Ticket",
      description: ticketText,
      priority: "High",
      metadata: {
        reported_by: "user@example.com",
        affected_users: 0,
        environment: "production",
      },
    }

    onSubmit(ticket)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Support Ticket</CardTitle>
        <CardDescription>
          Enter ticket details or load a sample ticket to begin automated processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder={samplePlaceholder || "Enter ticket description here..."}
            value={ticketText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            disabled={isProcessing}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {ticketText.length} characters
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onLoadSample(handleTextChange)}
            disabled={isProcessing}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Load Sample Ticket
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || !ticketText.trim()}
            className="flex-1"
          >
            <Send className="mr-2 h-4 w-4" />
            {isProcessing ? "Processing..." : "Submit Ticket"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
