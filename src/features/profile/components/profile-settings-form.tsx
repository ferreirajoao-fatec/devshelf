"use client"

import { ExternalLink, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { useActionState, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { updateProfileAction } from "../actions"
import { MAX_BIO_LENGTH } from "../schema"

type ProfileSettingsCardProps = {
  username: string
  defaultBio: string
  defaultIsPublic: boolean
}

export function ProfileSettingsCard({ username, defaultBio, defaultIsPublic }: ProfileSettingsCardProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {})
  // Bio controlada para o contador de caracteres
  const [bio, setBio] = useState(defaultBio)
  // Selo mostra o último valor salvo, não o que está marcado ainda sem salvar
  const isPublic = state.success ? Boolean(state.values?.isPublic) : defaultIsPublic
  const bioErrors = state.fieldErrors?.bio
  const profilePath = `/u/${username}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil público</CardTitle>
        <CardDescription>
          Sua página em{" "}
          <Link href={profilePath} className="font-medium text-foreground hover:underline">
            {profilePath}
          </Link>
          , com seus projetos públicos.
        </CardDescription>
        <CardAction>
          <Badge variant="secondary" className="gap-1">
            {isPublic ? <Globe /> : <Lock />}
            {isPublic ? "Ativo" : "Desativado"}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
            <input
              type="checkbox"
              name="isPublic"
              // Não controlado: o React reseta o <form> após a action, e o reset volta ao
              // defaultChecked, que aqui é sempre o último valor enviado
              defaultChecked={state.values?.isPublic ?? defaultIsPublic}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              <span className="font-medium">Ativar perfil público</span>
              <span className="block text-muted-foreground">
                Qualquer pessoa com o link vê seu nome, bio e projetos públicos. Projetos privados
                nunca aparecem.
              </span>
            </span>
          </label>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={MAX_BIO_LENGTH}
              rows={3}
              placeholder="Conte em poucas palavras quem você é e o que gosta de construir."
              aria-invalid={bioErrors?.length ? true : undefined}
              aria-describedby={bioErrors?.length ? "bio-error" : "bio-count"}
            />
            <div className="flex justify-between gap-2 text-xs">
              <span id="bio-error" className="text-destructive">
                {bioErrors?.[0]}
              </span>
              <span id="bio-count" className="text-muted-foreground tabular-nums">
                {bio.length}/{MAX_BIO_LENGTH}
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            {state.message && (
              <p
                role="status"
                className={state.success ? "text-sm text-muted-foreground sm:mr-auto" : "text-sm text-destructive sm:mr-auto"}
              >
                {state.message}
              </p>
            )}
            <Link href={profilePath} className={buttonVariants({ variant: "outline" })}>
              <ExternalLink />
              Ver perfil
            </Link>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
