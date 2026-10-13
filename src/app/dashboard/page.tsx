import Image from "next/image"
import type { Metadata } from "next"

import { SignOutButton } from "@/features/auth/components/sign-out-button"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const user = await requireUser()

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user.image && (
            <Image
              src={user.image}
              alt=""
              width={56}
              height={56}
              className="rounded-full border"
            />
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Olá, {user.name ?? user.username}!
            </h1>
            {user.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
          </div>
        </div>
        <SignOutButton />
      </div>
    </main>
  )
}
