const DEFAULT_REDIRECT = "/dashboard"

// Aceita só caminhos internos ("/algo"), evitando open redirect para outros domínios.
export function safeRedirectPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return DEFAULT_REDIRECT
  }
  return path
}
