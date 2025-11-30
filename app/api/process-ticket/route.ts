import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface TicketInput {
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

/**
 * API route to process tickets using the Python LangGraph backend
 *
 * This endpoint will stream agent updates back to the client as they process
 */
export async function POST(req: NextRequest) {
  try {
    const ticket: TicketInput = await req.json()

    // Create a streaming response
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // TODO: In production, this should call your Python backend
          // For now, we'll simulate the agent processing

          // Agent 1: Classification
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                agent: "classification",
                status: "processing",
                message: "Starting domain classification...",
              })}\n\n`
            )
          )

          await sleep(1000)

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                agent: "classification",
                status: "complete",
                data: {
                  classified_domain: "MM",
                  confidence: 0.92,
                  reasoning: "Ticket contains MM_ALDER service references",
                },
              })}\n\n`
            )
          )

          // Agent 2: Pattern Recognition
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                agent: "patternRecognition",
                status: "processing",
                message: "Searching for similar tickets...",
              })}\n\n`
            )
          )

          await sleep(1000)

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                agent: "patternRecognition",
                status: "complete",
                data: {
                  similar_tickets_count: 20,
                  top_similarity: 0.87,
                },
              })}\n\n`
            )
          )

          // Agent 3: Label Assignment
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                agent: "labelAssignment",
                status: "processing",
                message: "Assigning labels based on patterns...",
              })}\n\n`
            )
          )

          await sleep(1000)

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                agent: "labelAssignment",
                status: "complete",
                data: {
                  assigned_labels: ["Configuration Fix", "#MM_ALDER", "Performance"],
                },
              })}\n\n`
            )
          )

          // Agent 4: Resolution Generation
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                agent: "resolutionGeneration",
                status: "processing",
                message: "Generating resolution plan...",
              })}\n\n`
            )
          )

          await sleep(2000)

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                agent: "resolutionGeneration",
                status: "complete",
                data: {
                  summary: "Increase database connection pool size and add monitoring",
                  estimated_hours: 2,
                  confidence: 0.88,
                },
              })}\n\n`
            )
          )

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                status: "workflow_complete",
                message: "All agents completed successfully",
              })}\n\n`
            )
          )

          controller.close()
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                status: "error",
                message: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
