// URL pública do site, usada em metadados (Open Graph), robots.txt e sitemap.xml.
// Ordem: SITE_URL (domínio próprio, se houver) → domínio de produção da Vercel
// (variável criada pela própria Vercel) → localhost no desenvolvimento.
export function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "")
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return "http://localhost:3000"
}
