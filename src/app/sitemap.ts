import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/site"
import { listSitemapEntries } from "@/services/sitemap"

// Gerado a cada pedido, e não no build: assim o build não depende do banco e o
// sitemap sempre reflete os projetos e perfis públicos atuais.
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const { projects, profiles } = await listSitemapEntries()

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/explorar`, changeFrequency: "daily", priority: 0.8 },
    ...projects.map((p) => ({ url: `${base}/projeto/${p.slug}`, lastModified: p.updatedAt })),
    ...profiles.map((u) => ({ url: `${base}/u/${u.username}`, lastModified: u.updatedAt })),
  ]
}
