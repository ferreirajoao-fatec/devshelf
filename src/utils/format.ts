// O app é em pt-BR; formatar no servidor com locale e fuso fixos evita
// divergência de hidratação entre servidor e navegador.
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeZone: "America/Sao_Paulo",
})

export function formatDate(date: Date) {
  return dateFormatter.format(date)
}

const dateOnlyFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeZone: "UTC",
})

// Datas sem horário (início/conclusão) são salvas como meia-noite UTC;
// formatar em UTC evita que "15/03" vire "14/03" no fuso do Brasil.
export function formatDateOnly(date: Date) {
  return dateOnlyFormatter.format(date)
}

export function toDateInputValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : ""
}
