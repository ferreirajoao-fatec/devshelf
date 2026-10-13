import { AppHeader } from "@/components/layout/app-header"
import { requireUser } from "@/lib/session"

// Layout das páginas privadas: exige sessão válida e renderiza o header do app.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser()

  return (
    <>
      <AppHeader user={user} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">{children}</div>
    </>
  )
}
