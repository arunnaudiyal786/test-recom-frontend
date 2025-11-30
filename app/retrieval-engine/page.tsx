"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Loader2,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Info,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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

export default function RetrievalEnginePage() {
  // Query state
  const [queryText, setQueryText] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Config state
  const [config, setConfig] = useState<SearchConfig>(DEFAULT_SEARCH_CONFIG)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [configSaved, setConfigSaved] = useState(false)

  // Results state
  const [results, setResults] = useState<SimilarTicketPreview[]>([])
  const [searchMetadata, setSearchMetadata] = useState<SearchMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Expanded tickets tracking
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set())

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
      console.log("Using default config")
    }
  }

  const handleLoadSample = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/load-sample")
      if (response.ok) {
        const sampleTicket = await response.json()
        const ticketText = `${sampleTicket.title}\n\n${sampleTicket.description}\n\nPriority: ${sampleTicket.priority}\nReported by: ${sampleTicket.metadata?.reported_by || "N/A"}\nEnvironment: ${sampleTicket.metadata?.environment || "N/A"}`
        setQueryText(ticketText)
      }
    } catch (err) {
      setError("Failed to load sample ticket")
    }
  }

  const handleSearch = async () => {
    if (!queryText.trim()) {
      setError("Please enter a query or ticket description")
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const title = queryText.split("\n")[0] || "Query"
      const response = await fetch("http://localhost:8000/api/preview-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          description: queryText,
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
      setResults(data.similar_tickets)
      setSearchMetadata(data.search_metadata)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setIsSearching(false)
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setConfig(DEFAULT_SEARCH_CONFIG)
    setResults([])
    setSearchMetadata(null)
    setError(null)
    setExpandedTickets(new Set())
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

  const handleVectorWeightChange = (value: number) => {
    updateConfig({
      vector_weight: value,
      metadata_weight: Math.round((1 - value) * 100) / 100,
    })
  }

  const toggleTicketExpanded = (ticketId: string) => {
    setExpandedTickets((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId)
      } else {
        newSet.add(ticketId)
      }
      return newSet
    })
  }

  const exportResults = () => {
    const exportData = {
      query: queryText,
      config: config,
      search_metadata: searchMetadata,
      similar_tickets: results,
      exported_at: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `retrieval_results_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Retrieval Engine</h1>
        <p className="text-muted-foreground mt-2">
          Test and visualize the FAISS vector search retrieval system. See exactly what tickets get
          retrieved for your query.
        </p>
      </div>

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Query Input
          </CardTitle>
          <CardDescription>
            Enter a ticket description or query to search for similar historical tickets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter ticket description or search query...

Example: The MM_ALDER service is experiencing intermittent connection timeout errors when trying to connect to the database. Users are reporting slow response times during peak hours."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="min-h-[150px] font-mono text-sm"
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleLoadSample}>
              Load Sample Ticket
            </Button>
            <Button onClick={handleSearch} disabled={isSearching || !queryText.trim()}>
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout: Config + Query Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Search Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Search Configuration</CardTitle>
              <div className="flex gap-2">
                {configSaved && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    Saved
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
              />
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
            </div>

            {/* Advanced Toggle */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  Advanced Settings
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                        onValueChange={([value]) => updatePriorityWeight(priority, value / 100)}
                        min={0}
                        max={100}
                        step={10}
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
                    onValueChange={([value]) => updateConfig({ time_normalization_hours: value })}
                    min={10}
                    max={500}
                    step={10}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSaveConfig} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Config
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Query Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5" />
              Query Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchMetadata ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Detected Domain</p>
                    <Badge variant="default" className="text-sm">
                      {searchMetadata.query_domain}
                    </Badge>
                  </div>
                  {searchMetadata.classification_confidence && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Classification Confidence</p>
                      <Badge
                        variant={
                          searchMetadata.classification_confidence >= 0.8
                            ? "default"
                            : searchMetadata.classification_confidence >= 0.6
                            ? "secondary"
                            : "outline"
                        }
                        className="text-sm"
                      >
                        {(searchMetadata.classification_confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tickets Found</p>
                    <p className="text-lg font-semibold">{searchMetadata.total_found}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Avg Similarity</p>
                    <p className="text-lg font-semibold">
                      {(searchMetadata.avg_similarity * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Top Similarity Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${searchMetadata.top_similarity * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {(searchMetadata.top_similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Run a search to see query analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Retrieval Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Retrieved Tickets
                  <Badge variant="secondary">{results.length} tickets</Badge>
                </CardTitle>
                <CardDescription>
                  Click on any ticket to expand and see full details including description and
                  resolution
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {results.map((ticket, index) => {
                  const isExpanded = expandedTickets.has(ticket.ticket_id)
                  return (
                    <Collapsible
                      key={ticket.ticket_id}
                      open={isExpanded}
                      onOpenChange={() => toggleTicketExpanded(ticket.ticket_id)}
                    >
                      <div className="rounded-lg border bg-card">
                        <CollapsibleTrigger asChild>
                          <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    #{index + 1}
                                  </span>
                                  <span className="text-sm font-medium">{ticket.ticket_id}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {ticket.domain}
                                  </Badge>
                                  <Badge
                                    variant={
                                      ticket.priority === "Critical"
                                        ? "destructive"
                                        : ticket.priority === "High"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {ticket.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium truncate">{ticket.title}</p>

                                {/* Score Breakdown */}
                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>
                                    Vector: {(ticket.vector_similarity * 100).toFixed(0)}%
                                  </span>
                                  <span>Metadata: {(ticket.metadata_score * 100).toFixed(0)}%</span>
                                  <span>
                                    Resolution Time: {ticket.resolution_time_hours.toFixed(0)}h
                                  </span>
                                </div>

                                {/* Score Bar */}
                                <div className="h-2 rounded-full bg-secondary overflow-hidden flex mt-2">
                                  <div
                                    className="h-full bg-blue-500"
                                    style={{
                                      width: `${ticket.vector_similarity * config.vector_weight * 100}%`,
                                    }}
                                    title="Vector similarity contribution"
                                  />
                                  <div
                                    className="h-full bg-green-500"
                                    style={{
                                      width: `${ticket.metadata_score * config.metadata_weight * 100}%`,
                                    }}
                                    title="Metadata score contribution"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Badge
                                  variant={
                                    ticket.similarity_score >= 0.8
                                      ? "default"
                                      : ticket.similarity_score >= 0.6
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="text-sm"
                                >
                                  {(ticket.similarity_score * 100).toFixed(1)}%
                                </Badge>
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-4 border-t pt-4">
                            {/* Labels */}
                            {ticket.labels.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Labels</p>
                                <div className="flex gap-1 flex-wrap">
                                  {ticket.labels.map((label) => (
                                    <Badge key={label} variant="outline" className="text-xs">
                                      {label}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Full Description */}
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Description
                              </p>
                              <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">
                                {ticket.description || "No description available"}
                              </div>
                            </div>

                            {/* Resolution */}
                            {ticket.resolution && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Resolution Steps
                                </p>
                                <div className="rounded-md bg-green-50 dark:bg-green-950 p-3 text-sm whitespace-pre-wrap border border-green-200 dark:border-green-800">
                                  {ticket.resolution}
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isSearching && results.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Search Results Yet</h3>
              <p className="text-sm max-w-md mx-auto">
                Enter a ticket description above and click &quot;Search&quot; to find similar
                historical tickets from the FAISS vector index.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
