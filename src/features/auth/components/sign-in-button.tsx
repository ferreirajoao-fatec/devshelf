import { GitHubIcon } from "@/components/icons/github-icon"
import { Button } from "@/components/ui/button"

import { signInWithGitHub } from "../actions"

export function SignInButton({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <form action={signInWithGitHub}>
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
      <Button type="submit" size="lg" className="w-full">
        <GitHubIcon />
        Entrar com GitHub
      </Button>
    </form>
  )
}
