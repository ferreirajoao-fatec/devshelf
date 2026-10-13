import { NextResponse, type NextRequest } from "next/server"

// Cookies de sessão do Auth.js (o prefixo __Secure- é usado em HTTPS).
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"]

// Checagem otimista: só confere se existe cookie de sessão, sem consultar o banco.
// A validação real acontece nas páginas via requireUser().
export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name))
  if (hasSession) return NextResponse.next()

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
