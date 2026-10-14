"use client"

import Link from "next/link"
import { useActionState, useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ProjectVisibility } from "@/generated/prisma/enums"

import type { ProjectFormState } from "../actions"
import type { ProjectFormInput } from "../schema"
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES, type ProjectStatus } from "../status"
import { TechnologyPicker } from "./technology-picker"

const VISIBILITY_LABELS: Record<ProjectVisibility, string> = {
  PRIVATE: "Privado — só você vê",
  PUBLIC: "Público — aparece no seu perfil e no Explorar",
}

type ProjectFormProps = {
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>
  defaultValues: ProjectFormInput
  technologies: { id: string; name: string; color: string | null }[]
  submitLabel: string
  cancelHref?: string
}

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null
  return (
    <p id={id} className="text-sm text-destructive">
      {errors[0]}
    </p>
  )
}

export function ProjectForm({
  action,
  defaultValues,
  technologies,
  submitLabel,
  cancelHref = "/projetos",
}: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(action, {})
  const values = state.values ?? defaultValues
  const errors = state.fieldErrors ?? {}

  const [status, setStatus] = useState<ProjectStatus>(defaultValues.status)
  const [visibility, setVisibility] = useState<ProjectVisibility>(defaultValues.visibility)
  const [technologyIds, setTechnologyIds] = useState(defaultValues.technologyIds)

  // Props de acessibilidade para campos com erro
  const invalid = (field: keyof ProjectFormInput) =>
    errors[field]?.length
      ? { "aria-invalid": true as const, "aria-describedby": `${field}-error` }
      : {}

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.message && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações básicas</CardTitle>
          <CardDescription>Como o projeto aparece nos cards e na página dele.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" defaultValue={values.title} maxLength={100} required {...invalid("title")} />
            <FieldError id="title-error" errors={errors.title} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Descrição curta</Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              defaultValue={values.shortDescription}
              maxLength={200}
              placeholder="Uma frase sobre o projeto"
              {...invalid("shortDescription")}
            />
            <FieldError id="shortDescription-error" errors={errors.shortDescription} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={values.description}
              maxLength={5000}
              rows={6}
              placeholder="Objetivo, funcionalidades, aprendizados... (aceita Markdown)"
              {...invalid("description")}
            />
            <FieldError id="description-error" errors={errors.description} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status e visibilidade</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              name="status"
              value={status}
              onValueChange={(value) => value && setStatus(value as ProjectStatus)}
              items={PROJECT_STATUS_LABELS}
            >
              <SelectTrigger id="status" className="w-full" {...invalid("status")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {PROJECT_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="status-error" errors={errors.status} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibilidade</Label>
            <Select
              name="visibility"
              value={visibility}
              onValueChange={(value) => value && setVisibility(value as ProjectVisibility)}
              items={VISIBILITY_LABELS}
            >
              <SelectTrigger id="visibility" className="w-full" {...invalid("visibility")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProjectVisibility).map((v) => (
                  <SelectItem key={v} value={v}>
                    {VISIBILITY_LABELS[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="visibility-error" errors={errors.visibility} />
          </div>

          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={values.featured}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              <span className="font-medium">Destacar no perfil</span>
              <span className="block text-muted-foreground">
                Projetos em destaque aparecem primeiro na sua lista e no seu perfil público.
              </span>
            </span>
          </label>

          <div className="space-y-2">
            <Label htmlFor="startedAt">Início</Label>
            <Input id="startedAt" name="startedAt" type="date" defaultValue={values.startedAt} {...invalid("startedAt")} />
            <FieldError id="startedAt-error" errors={errors.startedAt} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="completedAt">Conclusão</Label>
            <Input
              id="completedAt"
              name="completedAt"
              type="date"
              defaultValue={values.completedAt}
              {...invalid("completedAt")}
            />
            <FieldError id="completedAt-error" errors={errors.completedAt} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              ["repositoryUrl", "Repositório", "https://github.com/usuario/projeto"],
              ["demoUrl", "Demo / deploy", "https://meu-projeto.vercel.app"],
              ["coverImageUrl", "Imagem de capa (URL)", "https://..."],
            ] as const
          ).map(([field, label, placeholder]) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>{label}</Label>
              <Input
                id={field}
                name={field}
                type="url"
                inputMode="url"
                defaultValue={values[field]}
                placeholder={placeholder}
                {...invalid(field)}
              />
              <FieldError id={`${field}-error`} errors={errors[field]} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tecnologias</CardTitle>
          <CardDescription>O que foi usado para construir o projeto.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <TechnologyPicker
            technologies={technologies}
            selectedIds={technologyIds}
            onChange={setTechnologyIds}
            invalid={Boolean(errors.technologyIds?.length)}
          />
          <FieldError id="technologyIds-error" errors={errors.technologyIds} />
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className={buttonVariants({ variant: "outline" })}>
          Cancelar
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
