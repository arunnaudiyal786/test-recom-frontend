"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Ticket, TrendingUp, Tag as TagIcon, Clock, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimilarTicket {
  ticket_id: string
  title: string
  similarity_score: number
  vector_similarity: number
  metadata_score: number
  priority: string
  labels: string[]
  resolution_time_hours: number
}

interface HistoricalMatchData {
  similar_tickets_count: number
  top_similarity: number
  domain_filter: string
  avg_similarity: number
  top_tickets: SimilarTicket[]
}

interface HistoricalMatchOutputProps {
  data: HistoricalMatchData
}

const priorityConfig = {
  Critical: {
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: "🔴",
  },
  High: {
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: "🟠",
  },
  Medium: {
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: "🟡",
  },
  Low: {
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: "🟢",
  },
}

export function HistoricalMatchOutput({ data }: HistoricalMatchOutputProps) {
  const topSimilarityPercentage = (data.top_similarity || 0) * 100
  const avgSimilarityPercentage = (data.avg_similarity || 0) * 100

  return (
    <div className="space-y-4">
      {/* Methodology Info Box */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Hybrid Scoring with FAISS Vector Search
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Combines 70% vector similarity (semantic meaning via FAISS) + 30% metadata relevance (priority, resolution time).
                Results are filtered by the classified domain for better accuracy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics Card */}
      <Card className="border border-blue-200 dark:border-blue-800 overflow-hidden">
        <div className="h-1 bg-slate-100 dark:bg-slate-800" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Found{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {data.similar_tickets_count}
                  </span>{" "}
                  Similar Tickets
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.domain_filter && `Filtered by ${data.domain_filter} domain`}
                </p>
              </div>
            </div>
            <Badge className="text-sm px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <TrendingUp className="h-3 w-3 mr-1" />
              {topSimilarityPercentage.toFixed(1)}% Match
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Top Similarity Score */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                <Ticket className="h-3 w-3" />
                Highest Similarity Score
              </span>
              <span className="text-muted-foreground">{topSimilarityPercentage.toFixed(2)}%</span>
            </div>
            <Progress value={topSimilarityPercentage} className="h-2" />
          </div>

          {/* Average Similarity Score */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" />
                Average Similarity Score
              </span>
              <span className="text-muted-foreground">{avgSimilarityPercentage.toFixed(2)}%</span>
            </div>
            <Progress value={avgSimilarityPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Top Similar Tickets */}
      {data.top_tickets && data.top_tickets.length > 0 && (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Top {data.top_tickets.length} Most Similar Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.top_tickets.map((ticket, idx) => {
              const priorityConf =
                priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.Medium
              const similarityPercentage = (ticket.similarity_score || 0) * 100
              const vectorPercentage = (ticket.vector_similarity || 0) * 100
              const metadataPercentage = (ticket.metadata_score || 0) * 100

              return (
                <Card
                  key={idx}
                  className={cn(
                    "border transition-all",
                    idx === 0
                      ? "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-slate-800"
                  )}
                >
                  <CardContent className="p-3 space-y-2.5">
                    {/* Ticket Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs bg-slate-100 dark:bg-slate-800"
                          >
                            {ticket.ticket_id}
                          </Badge>
                          {idx === 0 && (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                              Best Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{ticket.title}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={cn("text-xs", priorityConf.color)}>
                          {priorityConf.icon} {ticket.priority}
                        </Badge>
                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {similarityPercentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Similarity Breakdown */}
                    <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Vector (70%)</span>
                          <span className="font-medium">{vectorPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={vectorPercentage} className="h-1" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Metadata (30%)</span>
                          <span className="font-medium">{metadataPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={metadataPercentage * 100} className="h-1" />
                      </div>
                    </div>

                    {/* Metadata Info */}
                    <div className="flex items-center gap-4 pt-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{ticket.resolution_time_hours}h resolution</span>
                      </div>
                      {ticket.labels && ticket.labels.length > 0 && (
                        <div className="flex items-center gap-1">
                          <TagIcon className="h-3 w-3" />
                          <span>{ticket.labels.length} labels</span>
                        </div>
                      )}
                    </div>

                    {/* Labels */}
                    {ticket.labels && ticket.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                        {ticket.labels.slice(0, 4).map((label, labelIdx) => (
                          <Badge
                            key={labelIdx}
                            variant="secondary"
                            className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {label}
                          </Badge>
                        ))}
                        {ticket.labels.length > 4 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            +{ticket.labels.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
