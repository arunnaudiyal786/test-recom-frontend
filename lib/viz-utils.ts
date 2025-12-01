/**
 * Shared utility functions for visualization components
 */

/**
 * Get Tailwind color class based on confidence level
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "text-green-600 dark:text-green-400"
  if (confidence >= 0.6) return "text-yellow-600 dark:text-yellow-400"
  if (confidence >= 0.4) return "text-orange-600 dark:text-orange-400"
  return "text-red-600 dark:text-red-400"
}

/**
 * Get background color class based on confidence level
 */
export function getConfidenceBgColor(confidence: number): string {
  if (confidence >= 0.8) return "bg-green-100 dark:bg-green-900"
  if (confidence >= 0.6) return "bg-yellow-100 dark:bg-yellow-900"
  if (confidence >= 0.4) return "bg-orange-100 dark:bg-orange-900"
  return "bg-red-100 dark:bg-red-900"
}

/**
 * Get border color class based on confidence level
 */
export function getConfidenceBorderColor(confidence: number): string {
  if (confidence >= 0.8) return "border-green-500"
  if (confidence >= 0.6) return "border-yellow-500"
  if (confidence >= 0.4) return "border-orange-500"
  return "border-red-500"
}

/**
 * Format duration from hours to human-readable format
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes}m`
  }

  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)

  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Get color for risk levels
 */
export function getRiskLevelColor(risk: string): {
  text: string
  bg: string
  border: string
} {
  const riskLower = risk.toLowerCase()

  if (riskLower === "low") {
    return {
      text: "text-green-700 dark:text-green-300",
      bg: "bg-green-100 dark:bg-green-900",
      border: "border-green-500",
    }
  }

  if (riskLower === "medium") {
    return {
      text: "text-yellow-700 dark:text-yellow-300",
      bg: "bg-yellow-100 dark:bg-yellow-900",
      border: "border-yellow-500",
    }
  }

  // high risk
  return {
    text: "text-red-700 dark:text-red-300",
    bg: "bg-red-100 dark:bg-red-900",
    border: "border-red-500",
  }
}

/**
 * Get color for priority levels
 */
export function getPriorityColor(priority: string): {
  text: string
  bg: string
  border: string
} {
  const priorityLower = priority.toLowerCase()

  if (priorityLower === "critical") {
    return {
      text: "text-red-700 dark:text-red-300",
      bg: "bg-red-100 dark:bg-red-900",
      border: "border-red-500",
    }
  }

  if (priorityLower === "high") {
    return {
      text: "text-orange-700 dark:text-orange-300",
      bg: "bg-orange-100 dark:bg-orange-900",
      border: "border-orange-500",
    }
  }

  if (priorityLower === "medium") {
    return {
      text: "text-yellow-700 dark:text-yellow-300",
      bg: "bg-yellow-100 dark:bg-yellow-900",
      border: "border-yellow-500",
    }
  }

  // low priority
  return {
    text: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-100 dark:bg-blue-900",
    border: "border-blue-500",
  }
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Get chart color for domain
 */
export function getDomainColor(domain: string): string {
  const domainLower = domain.toLowerCase()

  if (domainLower === "mm") return "#3b82f6" // blue
  if (domainLower === "ciw") return "#8b5cf6" // purple
  if (domainLower === "specialty") return "#ec4899" // pink

  return "#6b7280" // gray fallback
}
