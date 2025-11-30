"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Tag as TagIcon,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Info,
  BarChart3,
  History,
  Briefcase,
  Wrench,
  Lightbulb,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// INTERFACES
// ============================================================================

interface HistoricalLabelDetail {
  label: string
  confidence: number
  distribution: string
  assigned: boolean
}

interface GeneratedLabel {
  label: string
  confidence: number
  category: string
  reasoning: string
  business_summary?: string
  root_cause_hypothesis?: string
}

interface LabelAssignmentData {
  // Historical labels (from similar tickets)
  historical_labels?: string[]
  historical_label_confidence?: Record<string, number>
  historical_label_distribution?: Record<string, string>

  // AI-Generated Business Labels
  business_labels?: GeneratedLabel[]

  // AI-Generated Technical Labels
  technical_labels?: GeneratedLabel[]

  // Combined (backward compatibility)
  assigned_labels: string[]
  label_count: number
  confidence: Record<string, number>
  assigned_with_details: HistoricalLabelDetail[]
  rejected_labels: HistoricalLabelDetail[]
  total_candidates: number
}

interface LabelAssignmentOutputProps {
  data: LabelAssignmentData
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getLabelCategory = (label: string) => {
  if (label.startsWith("#")) {
    return {
      type: "hashtag",
      color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      icon: "#",
    }
  }
  if (label.includes("Fix")) {
    return {
      type: "fix",
      color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      icon: "🔧",
    }
  }
  return {
    type: "general",
    color: "bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300",
    icon: "📌",
  }
}

const getBusinessCategoryStyle = (category: string) => {
  const styles: Record<string, { bg: string; text: string; icon: string }> = {
    "Process Impact": { bg: "bg-emerald-100 dark:bg-emerald-900", text: "text-emerald-700 dark:text-emerald-300", icon: "⚙️" },
    "Customer Impact": { bg: "bg-teal-100 dark:bg-teal-900", text: "text-teal-700 dark:text-teal-300", icon: "👥" },
    "Business Priority": { bg: "bg-amber-100 dark:bg-amber-900", text: "text-amber-700 dark:text-amber-300", icon: "⚡" },
    "Functional Area": { bg: "bg-cyan-100 dark:bg-cyan-900", text: "text-cyan-700 dark:text-cyan-300", icon: "🏢" },
    "Service Category": { bg: "bg-green-100 dark:bg-green-900", text: "text-green-700 dark:text-green-300", icon: "📊" },
  }
  return styles[category] || { bg: "bg-emerald-100 dark:bg-emerald-900", text: "text-emerald-700 dark:text-emerald-300", icon: "💼" }
}

const getTechnicalCategoryStyle = (category: string) => {
  const styles: Record<string, { bg: string; text: string; icon: string }> = {
    "System Component": { bg: "bg-violet-100 dark:bg-violet-900", text: "text-violet-700 dark:text-violet-300", icon: "🔧" },
    "Failure Mode": { bg: "bg-red-100 dark:bg-red-900", text: "text-red-700 dark:text-red-300", icon: "⚠️" },
    "Technology Stack": { bg: "bg-indigo-100 dark:bg-indigo-900", text: "text-indigo-700 dark:text-indigo-300", icon: "🛠️" },
    "Infrastructure Layer": { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-700 dark:text-purple-300", icon: "🏗️" },
    "Resolution Type": { bg: "bg-fuchsia-100 dark:bg-fuchsia-900", text: "text-fuchsia-700 dark:text-fuchsia-300", icon: "✅" },
    "Observability": { bg: "bg-pink-100 dark:bg-pink-900", text: "text-pink-700 dark:text-pink-300", icon: "👁️" },
  }
  return styles[category] || { bg: "bg-violet-100 dark:bg-violet-900", text: "text-violet-700 dark:text-violet-300", icon: "💻" }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LabelAssignmentOutput({ data }: LabelAssignmentOutputProps) {
  // Extract counts
  const historicalLabels = data.historical_labels || data.assigned_with_details?.filter(l => l.assigned).map(l => l.label) || []
  const businessLabels = data.business_labels || []
  const technicalLabels = data.technical_labels || []

  const historicalCount = historicalLabels.length
  const businessCount = businessLabels.length
  const technicalCount = technicalLabels.length
  const totalLabels = historicalCount + businessCount + technicalCount

  const totalCandidates = data.total_candidates || historicalCount
  const rejectedCount = data.rejected_labels?.length || 0

  // Build historical labels with details
  const historicalWithDetails: HistoricalLabelDetail[] = data.assigned_with_details ||
    historicalLabels.map(label => ({
      label,
      confidence: data.historical_label_confidence?.[label] || data.confidence?.[label] || 0,
      distribution: data.historical_label_distribution?.[label] || "N/A",
      assigned: true
    }))

  return (
    <div className="space-y-4">
      {/* Methodology Info Box */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Three-Tier Label Assignment System
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <History className="h-3 w-3 text-blue-500" />
                  <span><strong>Historical:</strong> From similar tickets</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-3 w-3 text-emerald-500" />
                  <span><strong>Business:</strong> AI-generated business view</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wrench className="h-3 w-3 text-violet-500" />
                  <span><strong>Technical:</strong> AI-generated tech view</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics Card */}
      <Card className="border border-blue-200 dark:border-blue-800 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-violet-500" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900 dark:to-violet-900">
                <TagIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Total{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {totalLabels}
                  </span>{" "}
                  {totalLabels === 1 ? "Label" : "Labels"} Assigned
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Across Historical, Business, and Technical categories
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="text-xs px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <History className="h-3 w-3 mr-1" />
                {historicalCount}
              </Badge>
              <Badge className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Briefcase className="h-3 w-3 mr-1" />
                {businessCount}
              </Badge>
              <Badge className="text-xs px-2 py-1 bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                <Wrench className="h-3 w-3 mr-1" />
                {technicalCount}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ================================================================== */}
      {/* HISTORICAL LABELS SECTION */}
      {/* ================================================================== */}
      <Card className="border border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900">
              <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span>Historical Labels</span>
            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {historicalCount}
            </Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground ml-9">
            Labels validated against {totalCandidates} candidates from similar historical tickets
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {historicalWithDetails.filter(l => l.assigned).length > 0 ? (
            historicalWithDetails.filter(l => l.assigned).map((labelDetail, idx) => {
              const category = getLabelCategory(labelDetail.label)
              const confidencePercentage = (labelDetail.confidence || 0) * 100

              return (
                <Card
                  key={idx}
                  className="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20"
                >
                  <CardContent className="p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <Badge className={cn("text-sm px-2.5 py-0.5", category.color)}>
                          {category.icon && <span className="mr-1">{category.icon}</span>}
                          {labelDetail.label}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {confidencePercentage.toFixed(0)}%
                        </span>
                        <p className="text-xs text-muted-foreground">confidence</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Confidence Score</span>
                        <span className="font-medium">{confidencePercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={confidencePercentage} className="h-1.5 bg-blue-100 dark:bg-blue-900" />
                    </div>

                    {labelDetail.distribution && labelDetail.distribution !== "N/A" && (
                      <div className="flex items-center gap-2 pt-1.5 border-t border-blue-200 dark:border-blue-800 text-xs">
                        <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Historical frequency:</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                          {labelDetail.distribution}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No historical labels assigned
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================================================================== */}
      {/* BUSINESS LABELS SECTION */}
      {/* ================================================================== */}
      <Card className="border border-emerald-200 dark:border-emerald-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900">
              <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span>Business Labels</span>
            <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              {businessCount}
            </Badge>
            <span className="text-xs font-normal text-muted-foreground ml-2">AI-Generated</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground ml-9">
            Business impact, process areas, and stakeholder-focused categorization
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {businessLabels.length > 0 ? (
            <>
              {/* Business Summary */}
              {businessLabels[0]?.business_summary && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 mb-3">
                  <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Business Impact Summary</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      {businessLabels[0].business_summary}
                    </p>
                  </div>
                </div>
              )}

              {businessLabels.map((label, idx) => {
                const categoryStyle = getBusinessCategoryStyle(label.category)
                const confidencePercentage = (label.confidence || 0) * 100

                return (
                  <Card
                    key={idx}
                    className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
                  >
                    <CardContent className="p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <Badge className={cn("text-sm px-2.5 py-0.5", categoryStyle.bg, categoryStyle.text)}>
                            <span className="mr-1">{categoryStyle.icon}</span>
                            {label.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1.5 py-0 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700">
                            {label.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                            {confidencePercentage.toFixed(0)}%
                          </span>
                          <p className="text-xs text-muted-foreground">confidence</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Progress value={confidencePercentage} className="h-1.5 bg-emerald-100 dark:bg-emerald-900" />
                      </div>

                      {label.reasoning && (
                        <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            💡 {label.reasoning}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No business labels generated
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================================================================== */}
      {/* TECHNICAL LABELS SECTION */}
      {/* ================================================================== */}
      <Card className="border border-violet-200 dark:border-violet-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-violet-100 dark:bg-violet-900">
              <Wrench className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span>Technical Labels</span>
            <Badge variant="secondary" className="ml-2 bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
              {technicalCount}
            </Badge>
            <span className="text-xs font-normal text-muted-foreground ml-2">AI-Generated</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground ml-9">
            System components, failure modes, and technical categorization for engineers
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {technicalLabels.length > 0 ? (
            <>
              {/* Root Cause Hypothesis */}
              {technicalLabels[0]?.root_cause_hypothesis && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 mb-3">
                  <AlertCircle className="h-4 w-4 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-violet-700 dark:text-violet-300">Root Cause Hypothesis</p>
                    <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                      {technicalLabels[0].root_cause_hypothesis}
                    </p>
                  </div>
                </div>
              )}

              {technicalLabels.map((label, idx) => {
                const categoryStyle = getTechnicalCategoryStyle(label.category)
                const confidencePercentage = (label.confidence || 0) * 100

                return (
                  <Card
                    key={idx}
                    className="border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20"
                  >
                    <CardContent className="p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                          <Badge className={cn("text-sm px-2.5 py-0.5", categoryStyle.bg, categoryStyle.text)}>
                            <span className="mr-1">{categoryStyle.icon}</span>
                            {label.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1.5 py-0 text-violet-600 dark:text-violet-400 border-violet-300 dark:border-violet-700">
                            {label.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-violet-600 dark:text-violet-400">
                            {confidencePercentage.toFixed(0)}%
                          </span>
                          <p className="text-xs text-muted-foreground">confidence</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Progress value={confidencePercentage} className="h-1.5 bg-violet-100 dark:bg-violet-900" />
                      </div>

                      {label.reasoning && (
                        <div className="pt-2 border-t border-violet-200 dark:border-violet-800">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            🔍 {label.reasoning}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No technical labels generated
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================================================================== */}
      {/* REJECTED LABELS SECTION (Historical only) */}
      {/* ================================================================== */}
      {data.rejected_labels && data.rejected_labels.length > 0 && (
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <XCircle className="h-4 w-4 text-slate-500" />
              Not Assigned ({rejectedCount})
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Historical labels below confidence threshold (70%)
            </p>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {data.rejected_labels.map((labelDetail, idx) => {
              const category = getLabelCategory(labelDetail.label)
              const confidencePercentage = (labelDetail.confidence || 0) * 100

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="h-3 w-3 text-slate-400" />
                    <Badge variant="outline" className={cn("text-xs", category.color)}>
                      {category.icon && <span className="mr-1">{category.icon}</span>}
                      {labelDetail.label}
                    </Badge>
                    {labelDetail.distribution && labelDetail.distribution !== "N/A" && (
                      <span className="text-xs text-muted-foreground">
                        ({labelDetail.distribution} in history)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <Progress value={confidencePercentage} className="h-1" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-10 text-right">
                      {confidencePercentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
