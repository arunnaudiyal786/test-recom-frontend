"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Search, Save, RotateCcw, Loader2, Settings2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SearchConfig,
  SimilarTicketPreview,
  SearchMetadata,
  SearchPreviewResponse,
  DEFAULT_SEARCH_CONFIG,
  DOMAIN_OPTIONS,
  domainValueToApi,
  domainValueFromApi,
} from "@/types/search-config"

interface SearchTuningPanelProps {
  ticketTitle: string
  ticketDescription: string
  onConfigSaved?: (config: SearchConfig) => void
  disabled?: boolean
}

export function SearchTuningPanel({
  ticketTitle,
  ticketDescription,
  onConfigSaved,
  disabled = false,
}: SearchTuningPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [config, setConfig] = useState<SearchConfig>(DEFAULT_SEARCH_CONFIG)
  const [previewResults, setPreviewResults] = useState<SimilarTicketPreview[]>([])
  const [searchMetadata, setSearchMetadata] = useState<SearchMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [configSaved, setConfigSaved] = useState(false)

  // Load saved config on mount
  useEffect(() => {
    loadSavedConfig()
  }, [])

  const loadSavedConfig = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/load-search-config")
      if (response.ok) {
        const savedConfig = await response.json()
        setConfig(savedConfig)
      }
    } catch (err) {
      // Use defaults if loading fails
      console.log("Using default config")
    }
  }

  const handleTestSearch = async () => {
    if (!ticketTitle.trim() || !ticketDescription.trim()) {
      setError("Please enter ticket title and description first")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8000/api/preview-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ticketTitle,
          description: ticketDescription,
          config: {
            ...config,
            domain_filter: domainValueToApi(config.domain_filter || "auto"),
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data: SearchPreviewResponse = await response.json()
      setPreviewResults(data.similar_tickets)
      setSearchMetadata(data.search_metadata)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("http://localhost:8000/api/save-search-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          domain_filter: domainValueToApi(config.domain_filter || "auto"),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save config")
      }

      setConfigSaved(true)
      setTimeout(() => setConfigSaved(false), 2000)
      onConfigSaved?.(config)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setConfig(DEFAULT_SEARCH_CONFIG)
    setPreviewResults([])
    setSearchMetadata(null)
    setError(null)
  }

  const updateConfig = (updates: Partial<SearchConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  const updatePriorityWeight = (priority: keyof SearchConfig["priority_weights"], value: number) => {
    setConfig((prev) => ({
      ...prev,
      priority_weights: {
        ...prev.priority_weights,
        [priority]: value,
      },
    }))
  }

  // Auto-adjust metadata weight when vector weight changes
  const handleVectorWeightChange = (value: number) => {
    updateConfig({
      vector_weight: value,
      metadata_weight: Math.round((1 - value) * 100) / 100,
    })
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`border-dashed ${isOpen ? "border-blue-300" : "border-gray-300"}`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Search Tuning</CardTitle>
                  <CardDescription className="text-xs">
                    Test and tune similarity search parameters before processing
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {configSaved && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    Config Saved
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Main Controls Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column - Parameters */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Basic Parameters</h4>

                {/* Top K Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Similar Tickets (Top K)</Label>
                    <span className="text-sm text-muted-foreground">{config.top_k}</span>
                  </div>
                  <Slider
                    value={[config.top_k]}
                    onValueChange={([value]) => updateConfig({ top_k: value })}
                    min={5}
                    max={50}
                    step={1}
                    disabled={disabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of similar tickets to retrieve
                  </p>
                </div>

                {/* Vector Weight Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Vector Similarity Weight</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(config.vector_weight * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[config.vector_weight * 100]}
                    onValueChange={([value]) => handleVectorWeightChange(value / 100)}
                    min={0}
                    max={100}
                    step={5}
                    disabled={disabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Metadata weight: {Math.round(config.metadata_weight * 100)}%
                  </p>
                </div>

                {/* Domain Filter */}
                <div className="space-y-2">
                  <Label>Domain Filter</Label>
                  <Select
                    value={domainValueFromApi(config.domain_filter)}
                    onValueChange={(value) =>
                      updateConfig({ domain_filter: value === "auto" ? null : value })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAIN_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Force domain or auto-classify from ticket content
                  </p>
                </div>

                {/* Advanced Toggle */}
                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      Advanced Settings
                      {showAdvanced ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    {/* Priority Weights */}
                    <div className="space-y-3">
                      <Label>Priority Weights</Label>
                      {(["Critical", "High", "Medium", "Low"] as const).map((priority) => (
                        <div key={priority} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{priority}</span>
                            <span className="text-muted-foreground">
                              {config.priority_weights[priority].toFixed(1)}
                            </span>
                          </div>
                          <Slider
                            value={[config.priority_weights[priority] * 100]}
                            onValueChange={([value]) =>
                              updatePriorityWeight(priority, value / 100)
                            }
                            min={0}
                            max={100}
                            step={10}
                            disabled={disabled}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Time Normalization */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Time Normalization (hours)</Label>
                        <span className="text-sm text-muted-foreground">
                          {config.time_normalization_hours}h
                        </span>
                      </div>
                      <Slider
                        value={[config.time_normalization_hours]}
                        onValueChange={([value]) =>
                          updateConfig({ time_normalization_hours: value })
                        }
                        min={10}
                        max={500}
                        step={10}
                        disabled={disabled}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Right Column - Preview Results */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Preview Results</h4>
                  {searchMetadata && (
                    <Badge variant="secondary">
                      {searchMetadata.total_found} found | avg{" "}
                      {(searchMetadata.avg_similarity * 100).toFixed(1)}%
                    </Badge>
                  )}
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
                )}

                {searchMetadata && (
                  <div className="flex gap-2 flex-wrap text-xs">
                    <Badge variant="outline">
                      Domain: {searchMetadata.query_domain}
                    </Badge>
                    <Badge variant="outline">
                      Top: {(searchMetadata.top_similarity * 100).toFixed(1)}%
                    </Badge>
                    {searchMetadata.classification_confidence && (
                      <Badge variant="outline">
                        Classification:{" "}
                        {(searchMetadata.classification_confidence * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                )}

                <ScrollArea className="h-[300px] rounded-md border p-2">
                  {previewResults.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Click &quot;Test Search&quot; to preview results
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {previewResults.map((ticket, index) => (
                        <div
                          key={ticket.ticket_id}
                          className="rounded-md border p-3 space-y-2 bg-card"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-muted-foreground">
                                #{index + 1} {ticket.ticket_id}
                              </p>
                              <p className="text-sm font-medium truncate">{ticket.title}</p>
                            </div>
                            <Badge
                              variant={
                                ticket.similarity_score >= 0.8
                                  ? "default"
                                  : ticket.similarity_score >= 0.6
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {(ticket.similarity_score * 100).toFixed(1)}%
                            </Badge>
                          </div>

                          {/* Score Breakdown */}
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>
                              Vector: {(ticket.vector_similarity * 100).toFixed(0)}%
                            </span>
                            <span>
                              Metadata: {(ticket.metadata_score * 100).toFixed(0)}%
                            </span>
                            <span>Priority: {ticket.priority}</span>
                          </div>

                          {/* Score Bar */}
                          <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${ticket.vector_similarity * config.vector_weight * 100}%`,
                              }}
                            />
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${ticket.metadata_score * config.metadata_weight * 100}%`,
                              }}
                            />
                          </div>

                          {/* Labels */}
                          {ticket.labels.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {ticket.labels.slice(0, 3).map((label) => (
                                <Badge key={label} variant="outline" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                              {ticket.labels.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{ticket.labels.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end border-t pt-4">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={disabled}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSearch}
                disabled={disabled || isLoading || !ticketTitle.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Test Search
              </Button>
              <Button
                size="sm"
                onClick={handleSaveConfig}
                disabled={disabled || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Config
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
