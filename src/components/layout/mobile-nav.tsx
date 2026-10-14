"use client"

import { Library, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { isActivePath, NAV_ITEMS } from "./nav-items"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu" />}
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Library className="size-5" />
            DevShelf
          </SheetTitle>
        </SheetHeader>
        <nav aria-label="Principal" className="flex flex-col gap-1 px-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon, soon }) => {
            if (soon) {
              return (
                <span
                  key={href}
                  aria-disabled="true"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground/60"
                >
                  <Icon className="size-4" />
                  {label}
                  <Badge variant="outline" className="ml-auto text-[10px]">
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
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted",
                  active ? "bg-muted font-medium" : "text-muted-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
