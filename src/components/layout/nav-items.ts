import { Compass, FolderKanban, LayoutDashboard, Star, type LucideIcon } from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  // Itens de etapas futuras aparecem desabilitados com o selo "Em breve"
  soon?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projetos", label: "Meus Projetos", icon: FolderKanban },
  { href: "/explorar", label: "Explorar", icon: Compass },
  { href: "/favoritos", label: "Favoritos", icon: Star },
]

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
