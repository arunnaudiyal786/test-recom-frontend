/**
 * UI Schema Configuration
 *
 * This file contains all UI-related configuration for the Test Recommendation System.
 * Moved from backend schema_config.yaml for better separation of concerns.
 *
 * To add a new domain:
 * 1. Add it to the DOMAINS object with full_name, description, and color_scheme
 * 2. The color_scheme should reference a key from COLOR_SCHEMES
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface DomainColors {
  bg: string
  text: string
  border: string
  icon: string
}

export interface DomainInfo {
  full_name: string
  description: string
  color_scheme: keyof typeof COLOR_SCHEMES
}

export interface DomainConfig extends DomainInfo {
  colors: DomainColors
}

// =============================================================================
// COLOR SCHEMES
// Tailwind CSS class combinations for different color themes
// =============================================================================

export const COLOR_SCHEMES = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    icon: "text-purple-600 dark:text-purple-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-600 dark:text-amber-400",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
    icon: "text-orange-600 dark:text-orange-400",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-950",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800",
    icon: "text-cyan-600 dark:text-cyan-400",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800",
    icon: "text-indigo-600 dark:text-indigo-400",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-800",
    icon: "text-pink-600 dark:text-pink-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
  },
  slate: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    icon: "text-slate-600 dark:text-slate-400",
  },
} as const

// =============================================================================
// DOMAIN DEFINITIONS
// Each domain has display info and an associated color scheme
// =============================================================================

export const DOMAINS: Record<string, DomainInfo> = {
  Billing: {
    full_name: "Core Billing Services",
    description: "Billing operations, invoicing, payment processing, AWD setup",
    color_scheme: "blue",
  },
  Enrollment: {
    full_name: "Member Enrollment Services",
    description: "Member enrollment, family plans, COBRA, SEP, dependent management",
    color_scheme: "green",
  },
  Claims: {
    full_name: "Claims Processing",
    description: "Claims submission, adjudication, COB, denials, EOB generation",
    color_scheme: "purple",
  },
  Premium: {
    full_name: "Premium Calculation",
    description: "Premium rates, subsidies, rate changes, APTC calculations",
    color_scheme: "amber",
  },
  Renewal: {
    full_name: "Renewal Processing",
    description: "Annual renewals, plan migrations, AWD continuation",
    color_scheme: "orange",
  },
  Integration: {
    full_name: "System Integration",
    description: "EDI transactions, payment gateway, external system interfaces",
    color_scheme: "cyan",
  },
  Reporting: {
    full_name: "Analytics & Reporting",
    description: "Dashboards, reconciliation reports, data analytics",
    color_scheme: "indigo",
  },
  CustomerService: {
    full_name: "Customer Service",
    description: "CSR portal, member support, account updates",
    color_scheme: "pink",
  },
  Security: {
    full_name: "Security & Compliance",
    description: "Data encryption, RBAC, PCI-DSS compliance, audit trails",
    color_scheme: "red",
  },
  Performance: {
    full_name: "Performance Testing",
    description: "Load testing, batch processing SLAs, throughput benchmarks",
    color_scheme: "slate",
  },
  // Legacy domains (for backward compatibility)
  MM: {
    full_name: "Member Management",
    description: "Member management and core operations",
    color_scheme: "blue",
  },
  CIW: {
    full_name: "Claims & Integration",
    description: "Claims processing and system integration",
    color_scheme: "purple",
  },
  Specialty: {
    full_name: "Specialty Services",
    description: "Specialized healthcare services",
    color_scheme: "pink",
  },
  Unknown: {
    full_name: "Unknown Domain",
    description: "Domain could not be determined",
    color_scheme: "slate",
  },
}

// =============================================================================
// PRIORITY CONFIGURATION
// =============================================================================

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const

export type Priority = (typeof PRIORITIES)[number]

// =============================================================================
// UI DEFAULTS
// =============================================================================

export const SAMPLE_TICKET_PLACEHOLDER = `Enter test case description here...

Example:
Verify AWD payment processing when member enrolls in family plan.
Setup includes primary member and 2 dependents with combined premium.`

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get domain info with colors resolved
 */
export function getDomainConfig(domain: string): DomainConfig {
  const info = DOMAINS[domain] || DOMAINS.Unknown
  const colors = COLOR_SCHEMES[info.color_scheme]

  return {
    ...info,
    colors,
  }
}

/**
 * Get just the colors for a domain
 */
export function getDomainColors(domain: string): DomainColors {
  return getDomainConfig(domain).colors
}

/**
 * Get list of all domain names
 */
export function getDomainList(): string[] {
  return Object.keys(DOMAINS).filter((d) => d !== "Unknown")
}

/**
 * Get the full schema config (for compatibility with existing hook)
 */
export function getSchemaConfig() {
  const domains: Record<string, { full_name: string; description: string; colors: DomainColors }> =
    {}

  for (const [key, info] of Object.entries(DOMAINS)) {
    domains[key] = {
      full_name: info.full_name,
      description: info.description,
      colors: COLOR_SCHEMES[info.color_scheme],
    }
  }

  return {
    domains,
    domain_list: getDomainList(),
    priorities: [...PRIORITIES],
    sample_placeholder: SAMPLE_TICKET_PLACEHOLDER,
  }
}
