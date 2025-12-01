"use client"

import { useState, useEffect } from "react"

interface DomainColors {
  bg: string
  text: string
  border: string
  icon: string
}

interface DomainInfo {
  full_name: string
  description: string
  colors: DomainColors
}

interface SchemaConfig {
  domains: Record<string, DomainInfo>
  domain_list: string[]
  priorities: string[]
  sample_placeholder: string
}

// Default fallback config for when API is unavailable
const defaultConfig: SchemaConfig = {
  domains: {
    Unknown: {
      full_name: "Unknown Domain",
      description: "Domain could not be determined",
      colors: {
        bg: "bg-slate-100 dark:bg-slate-800",
        text: "text-slate-700 dark:text-slate-300",
        border: "border-slate-200 dark:border-slate-700",
        icon: "text-slate-600 dark:text-slate-400",
      },
    },
  },
  domain_list: ["Unknown"],
  priorities: ["Low", "Medium", "High", "Critical"],
  sample_placeholder: "Enter ticket description...",
}

export function useSchemaConfig() {
  const [config, setConfig] = useState<SchemaConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("http://localhost:8000/api/schema-config")
        if (!response.ok) {
          throw new Error(`Failed to load schema config: ${response.status}`)
        }
        const data = await response.json()
        setConfig(data)
        setError(null)
      } catch (err) {
        console.warn("Could not load schema config from API, using defaults:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        // Keep using default config
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  // Helper function to get domain info with fallback
  const getDomainInfo = (domain: string): DomainInfo => {
    return (
      config.domains[domain] || {
        full_name: domain,
        description: "",
        colors: defaultConfig.domains.Unknown.colors,
      }
    )
  }

  // Helper function to get domain colors with fallback
  const getDomainColors = (domain: string): DomainColors => {
    const info = getDomainInfo(domain)
    return info.colors
  }

  return {
    config,
    loading,
    error,
    getDomainInfo,
    getDomainColors,
    domains: config.domain_list,
    priorities: config.priorities,
    samplePlaceholder: config.sample_placeholder,
  }
}
