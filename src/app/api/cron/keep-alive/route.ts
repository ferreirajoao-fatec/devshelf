import { prisma } from "@/lib/prisma"

// Chamada uma vez por dia pelo Vercel Cron (ver vercel.json). No plano gratuito,
// o Supabase pausa o banco após ~7 dias sem atividade; uma consulta diária evita isso.
// A Vercel envia `Authorization: Bearer <CRON_SECRET>` quando a variável existe.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return Response.json({ error: "CRON_SECRET não configurado." }, { status: 503 })
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Não autorizado." }, { status: 401 })
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ ok: true })
  } catch (cause) {
    console.error("Keep-alive: falha ao consultar o banco", cause)
    return Response.json({ error: "Banco indisponível." }, { status: 503 })
  }
}
