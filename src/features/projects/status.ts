// Status de um projeto. As chaves serão o enum ProjectStatus do Prisma na Etapa 4.
export const PROJECT_STATUSES = [
  "IDEA",
  "PLANNING",
  "IN_PROGRESS",
  "PAUSED",
  "COMPLETED",
  "ARCHIVED",
] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  IDEA: "Ideia",
  PLANNING: "Planejamento",
  IN_PROGRESS: "Em desenvolvimento",
  PAUSED: "Pausado",
  COMPLETED: "Concluído",
  ARCHIVED: "Arquivado",
}

// Cor do indicador de cada status (classes Tailwind)
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  IDEA: "bg-violet-500",
  PLANNING: "bg-sky-500",
  IN_PROGRESS: "bg-amber-500",
  PAUSED: "bg-zinc-400",
  COMPLETED: "bg-emerald-500",
  ARCHIVED: "bg-zinc-600",
}
