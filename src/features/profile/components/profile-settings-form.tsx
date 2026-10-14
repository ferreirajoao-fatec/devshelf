"use client"

import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { useActionState, useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { updateProfileAction } from "../actions"
import { MAX_BIO_LENGTH, MAX_NAME_LENGTH, MAX_USERNAME_LENGTH, type ProfileFormInput } from "../schema"

type ProfileSettingsFormProps = {
  defaultValues: Required<Pick<ProfileFormInput, "name" | "username" | "bio" | "isPublic">>
}

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null
  return (
    <p id={id} className="text-sm text-destructive">
      {errors[0]}
    </p>
  )
}

export function ProfileSettingsForm({ defaultValues }: ProfileSettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {})
  // Campos não controlados recebem o último valor enviado como padrão: o React reseta
  // o <form> após a action, e o reset volta para esses valores.
  const values = state.values ?? defaultValues
  const errors = state.fieldErrors ?? {}
  // Bio controlada para o contador de caracteres
  const [bio, setBio] = useState(defaultValues.bio)
  // Endereço do perfil: o último username salvo com sucesso
  const savedUsername = state.success && state.values ? state.values.username : defaultValues.username

  const invalid = (field: keyof ProfileFormInput) =>
    errors[field]?.length ? { "aria-invalid": true as const, "aria-describedby": `${field}-error` } : {}

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome de exibição</Label>
          <Input
            id="name"
            name="name"
            defaultValue={values.name}
            maxLength={MAX_NAME_LENGTH}
            placeholder={values.username}
            {...invalid("name")}
          />
          <FieldError id="name-error" errors={errors.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="flex items-center rounded-lg border focus-within:ring-3 focus-within:ring-ring/50">
            <span className="pl-2.5 text-sm text-muted-foreground select-none">/u/</span>
            <Input
              id="username"
              name="username"
              defaultValue={values.username}
              maxLength={MAX_USERNAME_LENGTH}
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              className="border-0 pl-0.5 focus-visible:ring-0"
              {...invalid("username")}
            />
          </div>
          <FieldError id="username-error" errors={errors.username} />
          <p className="text-xs text-muted-foreground">
            Mudar o username muda o endereço do seu perfil; links antigos deixam de funcionar.
          </p>
        </div>
      </div>

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
          aria-invalid={errors.bio?.length ? true : undefined}
          aria-describedby={errors.bio?.length ? "bio-error" : "bio-count"}
        />
        <div className="flex justify-between gap-2 text-xs">
          <span id="bio-error" className="text-destructive">
            {errors.bio?.[0]}
          </span>
          <span id="bio-count" className="text-muted-foreground tabular-nums">
            {bio.length}/{MAX_BIO_LENGTH}
          </span>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
        <input type="checkbox" name="isPublic" defaultChecked={values.isPublic} className="mt-0.5 size-4 accent-primary" />
        <span>
          <span className="font-medium">Ativar perfil público</span>
          <span className="block text-muted-foreground">
            Qualquer pessoa com o link vê seu nome, bio e projetos públicos. Projetos privados nunca
            aparecem.
          </span>
        </span>
      </label>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        {state.message && (
          <p
            role="status"
            className={state.success ? "text-sm text-muted-foreground sm:mr-auto" : "text-sm text-destructive sm:mr-auto"}
          >
            {state.message}
          </p>
        )}
        <Link href={`/u/${savedUsername}`} className={buttonVariants({ variant: "outline" })}>
          <ExternalLink />
          Ver perfil
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
