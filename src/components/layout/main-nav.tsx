"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { isActivePath, NAV_ITEMS } from "./nav-items"

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
      {NAV_ITEMS.map(({ href, label, soon }) => {
        if (soon) {
          return (
            <span
              key={href}
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground/60"
            >
              {label}
              <Badge variant="outline" className="text-[10px]">
                Em breve
              </Badge>
            </span>
          )
        }

        const active = isActivePath(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted hover:text-foreground",
              active ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
