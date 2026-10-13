import { PublicHeader } from "@/components/layout/public-header"

// Layout das páginas abertas a visitantes: não exige login.
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PublicHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">{children}</div>
    </>
  )
}
