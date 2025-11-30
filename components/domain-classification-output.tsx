"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Brain, Tag as TagIcon, MessageSquare, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface DomainClassificationData {
  classified_domain: string
  confidence: number
  reasoning: string
  keywords: string[]
}

interface DomainClassificationOutputProps {
  data: DomainClassificationData
}

const domainConfig = {
  MM: {
    fullName: "Member Management",
    color: "bg-slate-100 dark:bg-slate-800",
    badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  CIW: {
    fullName: "Customer Integration Workflow",
    color: "bg-slate-100 dark:bg-slate-800",
    badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  Specialty: {
    fullName: "Specialty Services",
    color: "bg-slate-100 dark:bg-slate-800",
    badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
}

const parseReasoning = (reasoning: string) => {
  // Parse the reasoning string to extract domain-specific confidence info
  const lines = reasoning.split("\n").filter((line) => line.trim())
  const domainResults: Array<{ domain: string; confidence: number; selected: boolean }> = []

  lines.forEach((line) => {
    const checkMatch = line.match(/^✓\s+(\w+)\s+\(([\d.]+)\):/)
    const crossMatch = line.match(/^✗\s+(\w+)\s+\(([\d.]+)\):/)

    if (checkMatch) {
      domainResults.push({
        domain: checkMatch[1],
        confidence: parseFloat(checkMatch[2]) * 100,
        selected: true,
      })
    } else if (crossMatch) {
      domainResults.push({
        domain: crossMatch[1],
        confidence: parseFloat(crossMatch[2]) * 100,
        selected: false,
      })
    }
  })

  return domainResults
}

export function DomainClassificationOutput({ data }: DomainClassificationOutputProps) {
  const config = domainConfig[data.classified_domain as keyof typeof domainConfig] || domainConfig.MM
  const confidencePercentage = data.confidence * 100
  const domainResults = parseReasoning(data.reasoning)

  return (
    <div className="space-y-4">
      {/* Methodology Info Box */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                MTC-LLM Binary Classification Method
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Uses 3 parallel binary classifiers (MM, CIW, Specialty) to independently evaluate the ticket.
                The final domain is selected based on the highest confidence score.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Domain Classification Result Card */}
      <Card className={cn("border", config.borderColor, "overflow-hidden")}>
        <div className={cn("h-1", config.color)} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", config.color)}>
                <Brain className={cn("h-5 w-5", config.iconColor)} />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Classified as{" "}
                  <span className={cn("font-semibold", config.iconColor)}>{data.classified_domain}</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{config.fullName}</p>
              </div>
            </div>
            <Badge className={cn("text-sm px-3 py-1", config.badgeColor)}>
              {confidencePercentage.toFixed(0)}% Confidence
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Confidence Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">Classification Confidence</span>
              <span className="text-muted-foreground">{confidencePercentage.toFixed(2)}%</span>
            </div>
            <Progress value={confidencePercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Domain Comparison Results */}
      {domainResults.length > 0 && (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Domain Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {domainResults.map((result, idx) => {
              const resultConfig =
                domainConfig[result.domain as keyof typeof domainConfig] || domainConfig.MM

              return (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    result.selected
                      ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {result.selected ? (
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="font-medium text-sm">{result.domain}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          result.selected
                            ? resultConfig.badgeColor
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        )}
                      >
                        {resultConfig.fullName}
                      </Badge>
                    </div>
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        result.selected
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-500 dark:text-slate-500"
                      )}
                    >
                      {result.confidence.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={result.confidence}
                    className={cn(
                      "h-1.5",
                      result.selected ? "" : "opacity-50"
                    )}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Keywords Card */}
      {data.keywords && data.keywords.length > 0 && (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              Extracted Keywords ({data.keywords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((keyword, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
