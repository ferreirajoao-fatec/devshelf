import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/site"

// Páginas privadas não têm o que indexar (e exigem login); o resto fica liberado.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/projetos", "/favoritos", "/configuracoes", "/login"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
