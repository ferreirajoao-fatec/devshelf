import { Library } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { ThemeToggle } from "@/features/theme/theme-toggle"
import { getCurrentUser } from "@/lib/session"

import { UserMenu } from "./user-menu"

// Header das páginas abertas a visitantes (projeto, perfil, explorar).
export async function PublicHeader() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-semibold">
          <Library className="size-5" />
          DevShelf
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <Link href="/explorar" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Explorar
          </Link>
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Dashboard
              </Link>
              <UserMenu name={user.name} username={user.username} image={user.image} />
            </>
          ) : (
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
