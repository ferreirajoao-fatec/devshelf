import { Library } from "lucide-react"
import Link from "next/link"

import { ThemeToggle } from "@/features/theme/theme-toggle"

import { MainNav } from "./main-nav"
import { MobileNav } from "./mobile-nav"
import { UserMenu } from "./user-menu"

type AppHeaderProps = {
  user: { name?: string | null; username: string | null; image?: string | null }
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4">
        <MobileNav />
        <Link href="/dashboard" className="mr-4 flex items-center gap-2 font-semibold">
          <Library className="size-5" />
          DevShelf
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <UserMenu name={user.name} username={user.username} image={user.image} />
        </div>
      </div>
    </header>
  )
}
