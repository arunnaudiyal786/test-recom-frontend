"use client"

import { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/components/sidebar-context"
import { cn } from "@/lib/utils"

export function LayoutContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className={cn(
          "flex-1 bg-background p-8 transition-all duration-300",
          isCollapsed ? "ml-16" : "ml-58"
        )}
      >
        {children}
      </main>
    </div>
  )
}
