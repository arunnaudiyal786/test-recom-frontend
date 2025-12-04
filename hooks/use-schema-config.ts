"use client"

import { useMemo } from "react"
import {
  getSchemaConfig,
  getDomainConfig,
  getDomainColors as getColors,
  getDomainList,
  PRIORITIES,
  SAMPLE_TICKET_PLACEHOLDER,
  type DomainColors,
} from "@/config/schema-config"

interface DomainInfo {
  full_name: string
  description: string
  colors: DomainColors
}

/**
 * Hook to access schema configuration.
 *
 * Configuration is now loaded from local TypeScript file (config/schema-config.ts)
 * instead of fetching from the backend API. This provides:
 * - No loading state needed
 * - Full type safety
 * - Better separation of concerns (UI config in frontend)
 */
export function useSchemaConfig() {
  // Memoize the config to avoid recalculating on every render
  const config = useMemo(() => getSchemaConfig(), [])

  // Helper function to get domain info with fallback
  const getDomainInfo = (domain: string): DomainInfo => {
    const domainConfig = getDomainConfig(domain)
    return {
      full_name: domainConfig.full_name,
      description: domainConfig.description,
      colors: domainConfig.colors,
    }
  }

  // Helper function to get domain colors with fallback
  const getDomainColors = (domain: string): DomainColors => {
    return getColors(domain)
  }

  return {
    config,
    // No more loading state needed - config is synchronous
    loading: false,
    error: null,
    getDomainInfo,
    getDomainColors,
    domains: getDomainList(),
    priorities: [...PRIORITIES],
    samplePlaceholder: SAMPLE_TICKET_PLACEHOLDER,
  }
}
