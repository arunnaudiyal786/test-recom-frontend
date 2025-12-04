"use client"

import { Clock, AlertTriangle, CheckCircle2, Terminal, Shield, RotateCcw, FileText, Link2, Lightbulb, TrendingUp, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ResolutionStep {
  step_number: number
  description: string
  commands: string[]
  validation: string
  estimated_time_minutes: number
  risk_level: "low" | "medium" | "high"
  rollback_procedure: string
  source_ticket?: string
  source_similarity?: number
}

interface Reference {
  ticket_id: string
  similarity: number
  note: string
}

interface NoveltyWarning {
  type: string
  severity: "high" | "medium" | "low"
  score: number
  recommendation: string
  message: string
}

interface ResolutionPlan {
  summary: string
  resolution_steps: ResolutionStep[]
  additional_considerations?: string[]
  references?: Reference[]
  total_estimated_time_hours: number
  confidence: number
  alternative_approaches?: string[]
  warnings?: NoveltyWarning[]
}

interface NoveltySignal {
  name: string
  fires: boolean
  value: number
  threshold: number
  actual: number
  reasoning: string
}

interface NoveltyDetails {
  signals_fired?: number
  nearest_category?: string
  decision_factors?: {
    is_novel_by_confidence: boolean
    is_novel_by_score: boolean
    novelty_score_threshold: number
  }
}

interface ResolutionGenerationOutputProps {
  data: {
    resolution_plan: ResolutionPlan
    resolution_confidence: number
    status: string
    current_agent: string
    messages: Array<{ role: string; content: string }>
    // Novelty detection fields from backend
    novelty_detected?: boolean
    novelty_score?: number
    novelty_reasoning?: string
    novelty_recommendation?: "proceed" | "flag_for_review" | "escalate"
    novelty_signals?: {
      signal_1_max_confidence?: NoveltySignal
      signal_2_entropy?: NoveltySignal
      signal_3_centroid_distance?: NoveltySignal
    }
    novelty_details?: NoveltyDetails
  }
}

export function ResolutionGenerationOutput({ data }: ResolutionGenerationOutputProps) {
  // Guard against undefined resolution_plan
  if (!data || !data.resolution_plan) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Test plan is not available yet. Please wait for the agent to complete processing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { resolution_plan } = data
  const {
    summary,
    resolution_steps = [],
    additional_considerations = [],
    references = [],
    total_estimated_time_hours,
    confidence,
    alternative_approaches = [],
    warnings = []
  } = resolution_plan

  // Extract top-level novelty detection fields from backend (single source of truth)
  const noveltyDetected = data.novelty_detected ?? false
  const noveltyScore = data.novelty_score ?? 0
  const noveltyReasoning = data.novelty_reasoning
  const noveltyRecommendation = data.novelty_recommendation
  const noveltySignals = data.novelty_signals
  const noveltyDetails = data.novelty_details

  // Determine confidence level
  const getConfidenceLevel = (conf: number) => {
    if (conf >= 0.9) return { label: "Very High", color: "bg-blue-500" }
    if (conf >= 0.75) return { label: "High", color: "bg-blue-500" }
    if (conf >= 0.6) return { label: "Medium", color: "bg-blue-400" }
    return { label: "Low", color: "bg-slate-500" }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
      case "medium": return "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
      case "low": return "border-slate-400 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400"
      default: return "border-slate-400 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400"
    }
  }

  const confidenceLevel = getConfidenceLevel(confidence)
  const confidencePercentage = Math.round(confidence * 100)

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/30 dark:to-slate-900">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                  Test Plan Generated
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {summary}
              </p>
            </div>

            {/* Confidence Badge */}
            <div className="flex flex-col items-center gap-2 min-w-[100px]">
              <div className="relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - confidence)}`}
                    className="text-blue-500 dark:text-blue-400 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {confidencePercentage}%
                    </div>
                  </div>
                </div>
              </div>
              <Badge className={`${confidenceLevel.color} text-white border-0 text-xs px-2 py-0.5`}>
                {confidenceLevel.label}
              </Badge>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/50 p-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Test Steps</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {resolution_steps.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/50 p-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Estimated Time</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {total_estimated_time_hours}h
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/50 p-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">References</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {references.length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Novelty Detection Alert - Uses top-level novelty_detected from backend */}
      {noveltyDetected && (
        <Card className={`border-2 ${
          noveltyScore > 0.8
            ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
            : "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20"
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                noveltyScore > 0.8
                  ? "bg-amber-100 dark:bg-amber-900"
                  : "bg-amber-100/50 dark:bg-amber-900/50"
              }`}>
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 space-y-2">
                {/* Header with Score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                      Novelty Detected
                    </h4>
                    <Badge
                      className={`text-xs ${
                        noveltyScore > 0.8
                          ? "bg-amber-500 text-white"
                          : "bg-amber-400 text-white"
                      }`}
                    >
                      {noveltyScore > 0.8 ? "HIGH" : "MEDIUM"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                    <span className="font-medium">Score:</span>
                    <span className="font-bold">{(noveltyScore * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Reasoning/Message */}
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {noveltyReasoning || `This ticket may represent a novel category (score: ${noveltyScore.toFixed(2)}). Consider reviewing the category taxonomy.`}
                </p>

                {/* Recommendation Badge */}
                {noveltyRecommendation && (
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className="text-xs border-amber-400 text-amber-700 dark:text-amber-300">
                      Recommendation: {noveltyRecommendation.replace(/_/g, " ")}
                    </Badge>
                  </div>
                )}

                {/* Signal Details */}
                {noveltySignals && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200 dark:border-amber-800 mt-2">
                    {noveltySignals.signal_1_max_confidence && (
                      <div className={`p-2 rounded text-center ${
                        noveltySignals.signal_1_max_confidence.fires
                          ? "bg-amber-200 dark:bg-amber-900/50"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}>
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Max Confidence</p>
                        <p className={`text-sm font-bold ${
                          noveltySignals.signal_1_max_confidence.fires
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-500"
                        }`}>
                          {(noveltySignals.signal_1_max_confidence.actual * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {noveltySignals.signal_1_max_confidence.fires ? "⚠ Fires" : "✓ OK"}
                        </p>
                      </div>
                    )}
                    {noveltySignals.signal_2_entropy && (
                      <div className={`p-2 rounded text-center ${
                        noveltySignals.signal_2_entropy.fires
                          ? "bg-amber-200 dark:bg-amber-900/50"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}>
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Entropy</p>
                        <p className={`text-sm font-bold ${
                          noveltySignals.signal_2_entropy.fires
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-500"
                        }`}>
                          {(noveltySignals.signal_2_entropy.actual * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {noveltySignals.signal_2_entropy.fires ? "⚠ Fires" : "✓ OK"}
                        </p>
                      </div>
                    )}
                    {noveltySignals.signal_3_centroid_distance && (
                      <div className={`p-2 rounded text-center ${
                        noveltySignals.signal_3_centroid_distance.fires
                          ? "bg-amber-200 dark:bg-amber-900/50"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}>
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Distance</p>
                        <p className={`text-sm font-bold ${
                          noveltySignals.signal_3_centroid_distance.fires
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-500"
                        }`}>
                          {(noveltySignals.signal_3_centroid_distance.actual * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {noveltySignals.signal_3_centroid_distance.fires ? "⚠ Fires" : "✓ OK"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Nearest Category */}
                {noveltyDetails?.nearest_category && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 pt-1">
                    Nearest category: <span className="font-medium">{noveltyDetails.nearest_category}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Plan (synthesized from similar tickets) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Test Plan
          </h4>
          <Badge variant="outline" className="text-xs text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600">
            Max 5 Steps
          </Badge>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
        </div>

        <div className="space-y-3">
          {resolution_steps.map((step) => (
            <Card key={step.step_number} className={`border-l-4 ${getRiskColor(step.risk_level)} border-r border-t border-b`}>
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {step.step_number}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {step.description}
                      </p>
                      <Badge variant="outline" className={`text-xs ${getRiskColor(step.risk_level)} border-current whitespace-nowrap`}>
                        {step.risk_level.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Source Tickets Reference */}
                    {step.source_ticket && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Link2 className="h-3 w-3" />
                        <span>Synthesized from: </span>
                        <code className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">
                          {step.source_ticket}
                        </code>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ~{step.estimated_time_minutes} minutes
                      </span>
                    </div>

                    {/* Commands */}
                    {step.commands.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Terminal className="h-3 w-3 text-slate-500" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Commands
                          </span>
                        </div>
                        {step.commands.map((cmd, idx) => (
                          <pre key={idx} className="bg-slate-900 dark:bg-slate-950 text-slate-100 dark:text-slate-300 p-2 rounded text-xs overflow-x-auto font-mono">
{cmd}
                          </pre>
                        ))}
                      </div>
                    )}

                    {/* Validation */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-2.5">
                      <div className="flex items-start gap-2">
                        <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                            Validation
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {step.validation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rollback */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded p-2.5">
                      <div className="flex items-start gap-2">
                        <RotateCcw className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Rollback Procedure
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {step.rollback_procedure}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Considerations */}
      {additional_considerations.length > 0 && (
        <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                  Additional Considerations
                </h4>
                <ul className="space-y-1.5">
                  {additional_considerations.map((consideration, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300">
                      <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                      <span>{consideration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* References */}
      {references.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Similar Historical Tickets
            </h4>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
          </div>

          <div className="grid gap-3">
            {references.map((ref, idx) => (
              <Card key={idx} className="border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded">
                          {ref.ticket_id}
                        </code>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {Math.round(ref.similarity * 100)}% match
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {ref.note}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Approaches */}
      {alternative_approaches.length > 0 && (
        <Card className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-4 w-4 text-slate-600 dark:text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Alternative Approaches
                </h4>
                <ul className="space-y-1.5">
                  {alternative_approaches.map((approach, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-400 mt-0.5">•</span>
                      <span>{approach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
