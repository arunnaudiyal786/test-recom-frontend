"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, TrendingUp, Activity, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NoveltySignal {
  name: string
  fires: boolean
  value: number
  threshold: number
  actual: number
  reasoning: string
  num_categories?: number
  nearest_category?: string
}

interface NoveltyData {
  novelty_detected: boolean
  novelty_score: number
  novelty_signals: {
    signal_1_max_confidence: NoveltySignal
    signal_2_entropy: NoveltySignal
    signal_3_centroid_distance: NoveltySignal
  }
  novelty_recommendation: "proceed" | "flag_for_review" | "escalate"
  novelty_reasoning: string
  novelty_details: {
    signals_fired: number
    decision_factors: {
      is_novel_by_confidence: boolean
      is_novel_by_score: boolean
      novelty_score_threshold: number
    }
    recommendation_reason: string
    nearest_category: string
  }
}

interface NoveltyDetectionOutputProps {
  data: NoveltyData
}

// Signal weight constants for the formula display
const SIGNAL_WEIGHTS = {
  signal_1: 0.4,
  signal_2: 0.3,
  signal_3: 0.3,
}

function SignalCard({
  signal,
  signalNumber,
  weight,
  icon: Icon,
  title
}: {
  signal: NoveltySignal
  signalNumber: number
  weight: number
  icon: React.ElementType
  title: string
}) {
  const contribution = signal.value * weight

  return (
    <div className={cn(
      "rounded-lg border p-3 transition-all",
      signal.fires
        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
        : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn(
            "h-4 w-4",
            signal.fires ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
          )} />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {title}
          </span>
        </div>
        <Badge
          variant={signal.fires ? "default" : "outline"}
          className={cn(
            "text-xs",
            signal.fires
              ? "bg-amber-500 hover:bg-amber-500 text-white"
              : "text-slate-500"
          )}
        >
          {signal.fires ? "Fired" : "Not Fired"}
        </Badge>
      </div>

      {/* Progress visualization for threshold comparison */}
      <div className="space-y-1.5 mb-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Actual: <span className="font-mono font-medium text-foreground">{signal.actual.toFixed(3)}</span></span>
          <span>Threshold: <span className="font-mono font-medium">{signal.threshold}</span></span>
        </div>
        <div className="relative h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          {/* Threshold marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-500 dark:bg-slate-400 z-10"
            style={{ left: `${Math.min(signal.threshold * 100, 100)}%` }}
          />
          {/* Actual value bar */}
          <div
            className={cn(
              "absolute top-0 left-0 h-full transition-all rounded-full",
              signal.fires
                ? "bg-amber-500"
                : "bg-emerald-500"
            )}
            style={{ width: `${Math.min(signal.actual * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Formula contribution */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Weight: <span className="font-mono">{(weight * 100).toFixed(0)}%</span>
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn(
                "font-mono font-medium px-1.5 py-0.5 rounded",
                signal.fires
                  ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}>
                +{contribution.toFixed(2)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {signal.value.toFixed(1)} × {weight.toFixed(1)} = {contribution.toFixed(2)}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Additional context for specific signals */}
      {signal.nearest_category && (
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs text-muted-foreground">
            Nearest: <span className="font-medium text-foreground">{signal.nearest_category}</span>
          </span>
        </div>
      )}
      {signal.num_categories && (
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs text-muted-foreground">
            Categories: <span className="font-medium text-foreground">{signal.num_categories}</span>
          </span>
        </div>
      )}
    </div>
  )
}

export function NoveltyDetectionOutput({ data }: NoveltyDetectionOutputProps) {
  const {
    novelty_detected,
    novelty_score,
    novelty_signals,
    novelty_recommendation,
    novelty_details,
  } = data

  // Calculate individual contributions
  const s1_contrib = novelty_signals.signal_1_max_confidence.value * SIGNAL_WEIGHTS.signal_1
  const s2_contrib = novelty_signals.signal_2_entropy.value * SIGNAL_WEIGHTS.signal_2
  const s3_contrib = novelty_signals.signal_3_centroid_distance.value * SIGNAL_WEIGHTS.signal_3

  const recommendationConfig = {
    proceed: {
      color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      icon: CheckCircle2,
      label: "Proceed",
    },
    flag_for_review: {
      color: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      icon: AlertTriangle,
      label: "Review",
    },
    escalate: {
      color: "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
      icon: XCircle,
      label: "Escalate",
    },
  }

  const recConfig = recommendationConfig[novelty_recommendation]
  const RecIcon = recConfig.icon

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      {!novelty_detected ? (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900 p-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                No Novelty Detected
              </h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                This ticket matches existing categories in the taxonomy
              </p>
            </div>
            <div className={cn(
              "rounded-md border px-3 py-1.5 flex items-center gap-1.5",
              recConfig.color
            )}>
              <RecIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{recConfig.label}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-2">
              <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Novelty Detected
              </h4>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                This ticket may represent a new category not in taxonomy
              </p>
            </div>
            <div className={cn(
              "rounded-md border px-3 py-1.5 flex items-center gap-1.5",
              recConfig.color
            )}>
              <RecIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{recConfig.label}</span>
            </div>
          </div>
        </div>
      )}

      {/* Score Formula Card */}
      <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Novelty Score Calculation
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Threshold: 0.6</span>
            <Badge
              variant={novelty_score > 0.6 ? "default" : "secondary"}
              className={cn(
                "font-mono",
                novelty_score > 0.6
                  ? "bg-amber-500 hover:bg-amber-500"
                  : "bg-emerald-500 hover:bg-emerald-500 text-white"
              )}
            >
              {novelty_score.toFixed(2)}
            </Badge>
          </div>
        </div>

        {/* Visual formula */}
        <div className="flex items-center justify-center gap-1 text-sm font-mono bg-white dark:bg-slate-800 rounded-md p-3 border">
          <span className="text-slate-500">score =</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded",
            novelty_signals.signal_1_max_confidence.fires
              ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
              : "text-slate-400"
          )}>
            0.4×{novelty_signals.signal_1_max_confidence.value.toFixed(1)}
          </span>
          <span className="text-slate-400">+</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded",
            novelty_signals.signal_2_entropy.fires
              ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
              : "text-slate-400"
          )}>
            0.3×{novelty_signals.signal_2_entropy.value.toFixed(1)}
          </span>
          <span className="text-slate-400">+</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded",
            novelty_signals.signal_3_centroid_distance.fires
              ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
              : "text-slate-400"
          )}>
            0.3×{novelty_signals.signal_3_centroid_distance.value.toFixed(1)}
          </span>
          <span className="text-slate-500">=</span>
          <span className={cn(
            "font-bold px-2 py-0.5 rounded",
            novelty_score > 0.6
              ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
              : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
          )}>
            {novelty_score.toFixed(2)}
          </span>
        </div>

        {/* Score progress bar */}
        <div className="mt-3 space-y-1">
          <div className="relative h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            {/* Threshold marker at 0.6 */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-500 dark:bg-slate-400 z-10"
              style={{ left: "60%" }}
            />
            {/* Score bar */}
            <div
              className={cn(
                "absolute top-0 left-0 h-full transition-all rounded-full",
                novelty_score > 0.6 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${Math.min(novelty_score * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span className="font-medium">Threshold (0.6)</span>
            <span>1</span>
          </div>
        </div>
      </div>

      {/* Signal Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SignalCard
          signal={novelty_signals.signal_1_max_confidence}
          signalNumber={1}
          weight={SIGNAL_WEIGHTS.signal_1}
          icon={Target}
          title="Max Confidence"
        />
        <SignalCard
          signal={novelty_signals.signal_2_entropy}
          signalNumber={2}
          weight={SIGNAL_WEIGHTS.signal_2}
          icon={Activity}
          title="Entropy"
        />
        <SignalCard
          signal={novelty_signals.signal_3_centroid_distance}
          signalNumber={3}
          weight={SIGNAL_WEIGHTS.signal_3}
          icon={TrendingUp}
          title="Centroid Distance"
        />
      </div>

      {/* Summary Stats */}
      <div className="rounded-lg bg-muted/50 p-3 border border-dashed">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Signals Fired: <span className="font-semibold text-foreground">{novelty_details.signals_fired}/3</span>
          </span>
          <span className="text-muted-foreground">
            Nearest Category: <span className="font-semibold text-foreground">{novelty_details.nearest_category}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
