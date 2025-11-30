/**
 * TypeScript types for search configuration tuning.
 * These mirror the Pydantic models in src/models/retrieval_config.py
 */

export interface PriorityWeights {
  Critical: number
  High: number
  Medium: number
  Low: number
}

export interface SearchConfig {
  top_k: number
  vector_weight: number
  metadata_weight: number
  priority_weights: PriorityWeights
  time_normalization_hours: number
  domain_filter: string | null
}

export interface SimilarTicketPreview {
  ticket_id: string
  title: string
  description: string
  similarity_score: number
  vector_similarity: number
  metadata_score: number
  priority: string
  labels: string[]
  resolution_time_hours: number
  domain: string
  resolution?: string | null
}

export interface SearchMetadata {
  query_domain: string
  total_found: number
  avg_similarity: number
  top_similarity: number
  classification_confidence: number | null
}

export interface SearchPreviewRequest {
  title: string
  description: string
  config: SearchConfig
}

export interface SearchPreviewResponse {
  similar_tickets: SimilarTicketPreview[]
  search_metadata: SearchMetadata
  config_used: SearchConfig
}

// Default configuration values
export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  top_k: 20,
  vector_weight: 0.7,
  metadata_weight: 0.3,
  priority_weights: {
    Critical: 1.0,
    High: 0.8,
    Medium: 0.5,
    Low: 0.3,
  },
  time_normalization_hours: 100,
  domain_filter: null,
}

// Domain options for dropdown
// Note: "auto" is used instead of empty string because Radix UI Select doesn't allow empty values
export const DOMAIN_OPTIONS = [
  { value: "auto", label: "Auto-detect" },
  { value: "MM", label: "MM" },
  { value: "CIW", label: "CIW" },
  { value: "Specialty", label: "Specialty" },
] as const

// Helper to convert UI value to API value (auto -> null)
export const domainValueToApi = (value: string): string | null => {
  return value === "auto" ? null : value
}

// Helper to convert API value to UI value (null -> auto)
export const domainValueFromApi = (value: string | null): string => {
  return value === null ? "auto" : value
}
