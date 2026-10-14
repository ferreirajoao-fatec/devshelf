import { AlertCircle } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { GitHubErrorReason } from "@/lib/github"

import { githubErrorMessage } from "../errors"

export function GitHubErrorCard({ reason, backHref }: { reason: GitHubErrorReason; backHref: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <p role="alert" className="max-w-md text-sm text-muted-foreground">
          {githubErrorMessage(reason)}
        </p>
        <Link href={backHref} className={buttonVariants({ variant: "outline" })}>
          Voltar
        </Link>
      </CardContent>
    </Card>
  )
}
