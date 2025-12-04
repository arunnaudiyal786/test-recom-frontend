"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Brain, TestTube, Wrench, Database, ChevronLeft, ChevronRight, SearchCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSidebar } from "./sidebar-context"

const navigationItems = [
  {
    name: "Data Preprocessing",
    href: "/data-preprocessing",
    icon: Database,
    status: "active" as const,
  },
  {
    name: "Retrieval Engine",
    href: "/retrieval-engine",
    icon: SearchCheck,
    status: "active" as const,
  },
  {
    name: "Test Plan Recommendation",
    href: "/pattern-recognition",
    icon: Brain,
    status: "active" as const,
  },
  {
    name: "Test Case Recommendation",
    href: "/test-recommendation",
    icon: TestTube,
    status: "wip" as const,
  },
  {
    name: "Code Fix Recommendation",
    href: "/code-fix",
    icon: Wrench,
    status: "wip" as const,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed } = useSidebar()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm transition-all duration-300 ease-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo/Header */}
        <div className="flex h-16 items-center border-b border-slate-200 dark:border-slate-800 px-4 justify-between">
          {!isCollapsed && (
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              L3 Dashboard
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200",
              isCollapsed && "mx-auto"
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const isDisabled = item.status === "wip"
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={isDisabled ? "#" : item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                  isDisabled && "pointer-events-none opacity-50",
                  isCollapsed && "justify-center px-2"
                )}
                aria-disabled={isDisabled}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                  isActive
                    ? "text-white dark:text-slate-900"
                    : "text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                )} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.status === "wip" && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                      >
                        WIP
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Intelligent Ticket Management System
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
