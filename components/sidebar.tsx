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
    name: "Pattern Recognition",
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
        "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-58"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo/Header */}
        <div className="flex h-16 items-center border-b px-4 justify-between">
          {!isCollapsed && (
            <h1 className="text-lg font-bold">RRE Dashboard</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
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
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isDisabled && "pointer-events-none opacity-60"
                )}
                aria-disabled={isDisabled}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.status === "wip" && (
                      <Badge variant="outline" className="text-xs">
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
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">
              Intelligent Ticket Management System
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
