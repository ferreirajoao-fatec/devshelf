"use client"

import { Trash2 } from "lucide-react"
import { useState, useTransition } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import { deleteProjectAction } from "../actions"

export function DeleteProjectButton({ projectId, title }: { projectId: string; title: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProjectAction(projectId)
      if (result.error) setError(result.error)
      else setOpen(false)
    })
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setError(undefined)
      }}
    >
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${title}`} title="Excluir" />
        }
      >
        <Trash2 />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{title}&rdquo; será excluído permanentemente, junto com suas tecnologias, imagens e
            favoritos. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
