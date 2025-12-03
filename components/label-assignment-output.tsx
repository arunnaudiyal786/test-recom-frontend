"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Tag as TagIcon,
  CheckCircle2,
  Info,
  Briefcase,
  Wrench,
  Lightbulb,
  AlertCircle,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// INTERFACES
// ============================================================================

interface CategoryLabel {
  id: string
  name: string
  confidence: number
  reasoning?: string
}

interface GeneratedLabel {
  label: string
  confidence: number
  category: string
  reasoning: string
  business_summary?: string
  root_cause_hypothesis?: string
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

interface LabelAssignmentData {
  // Category labels (from predefined taxonomy - replaces historical_labels)
  category_labels?: CategoryLabel[]

  // Novelty Detection (enhanced with multi-signal approach)
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

  // AI-Generated Business Labels
  business_labels?: GeneratedLabel[]

  // AI-Generated Technical Labels
  technical_labels?: GeneratedLabel[]

  // Combined (backward compatibility)
  assigned_labels: string[]
  label_count?: number
}

interface LabelAssignmentOutputProps {
  data: LabelAssignmentData
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
  const categoryLabels = data.category_labels || []
  const businessLabels = data.business_labels || []
  const technicalLabels = data.technical_labels || []

  const categoryCount = categoryLabels.length
  const businessCount = businessLabels.length
  const technicalCount = technicalLabels.length
  const totalLabels = categoryCount + businessCount + technicalCount

  // Novelty detection: explicit flag OR no category labels assigned (indicates novel ticket)
  const noCategoryLabelsAssigned = categoryCount === 0
  const noveltyDetected = data.novelty_detected || noCategoryLabelsAssigned
  const noveltyScore = data.novelty_score || (noCategoryLabelsAssigned ? 1.0 : 0)
  const noveltyReasoning = data.novelty_reasoning || (noCategoryLabelsAssigned
    ? "No predefined category labels could be assigned to this ticket. This may represent a novel category not in the current taxonomy."
    : undefined)
  const noveltyRecommendation = data.novelty_recommendation || (noCategoryLabelsAssigned ? "escalate" : undefined)
  const noveltySignals = data.novelty_signals
  const noveltyDetails = data.novelty_details

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
                  <TagIcon className="h-3 w-3 text-blue-500" />
                  <span><strong>Category:</strong> From predefined taxonomy</span>
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

      {/* Novelty Detection Alert - Matches Resolution Generation Warning Style */}
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

                {/* Signal Details - Collapsible/Detailed Section */}
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
                  Across Category, Business, and Technical classifications
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="text-xs px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <TagIcon className="h-3 w-3 mr-1" />
                {categoryCount}
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
      {/* CATEGORY LABELS SECTION */}
      {/* ================================================================== */}
      <Card className="border border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900">
              <TagIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span>Category Labels</span>
            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {categoryCount}
            </Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground ml-9">
            Categories from predefined taxonomy (25 available categories)
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {categoryLabels.length > 0 ? (
            categoryLabels.map((categoryLabel, idx) => {
              const confidencePercentage = (categoryLabel.confidence || 0) * 100

              return (
                <Card
                  key={idx}
                  className="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20"
                >
                  <CardContent className="p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <Badge className="text-sm px-2.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {categoryLabel.name}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-1.5 py-0 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                          {categoryLabel.id}
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
                      <Progress value={confidencePercentage} className="h-1.5 bg-blue-100 dark:bg-blue-900" />
                    </div>

                    {categoryLabel.reasoning && (
                      <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          📋 {categoryLabel.reasoning}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No category labels assigned
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

    </div>
  )
}
