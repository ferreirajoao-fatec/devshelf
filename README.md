# DevShelf

> Organize e apresente tudo o que você já desenvolveu.

DevShelf é um "fichário digital" de projetos para desenvolvedores: faça login com sua conta do GitHub, cadastre ou importe seus repositórios, organize-os por status e tecnologia, e apresente-os em um catálogo visual com página própria para cada projeto e um perfil público compartilhável.

## Status do projeto

🚧 Em desenvolvimento — **Etapa 1: autenticação com GitHub**.

## Objetivo

Transformar os sistemas que você já construiu em um portfólio organizado, visual e fácil de compartilhar, com importação direta do GitHub.

## Tecnologias

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend:** Next.js API Routes / Server Actions
- **Banco de dados:** PostgreSQL
- **ORM:** Prisma
- **Validação:** Zod
- **Autenticação:** Auth.js (NextAuth) com provider GitHub OAuth
- **Integração externa:** GitHub REST API
- **Deploy:** Vercel (app) + Neon/Supabase (Postgres produção)

## Requisitos

- Node.js 20+
- pnpm
- Docker (para o banco de dados local)

## Instalação

```bash
pnpm install
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores:

```bash
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `AUTH_SECRET` | Segredo usado pelo Auth.js para assinar sessões/tokens (gere com `npx auth secret`) |
| `GITHUB_ID` | Client ID do GitHub OAuth App |
| `GITHUB_SECRET` | Client Secret do GitHub OAuth App |

## Banco de dados local

```bash
docker compose up -d   # sobe o PostgreSQL
pnpm db:migrate         # aplica as migrations
```

## Execução local

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Comandos disponíveis

```bash
pnpm dev      # inicia o servidor de desenvolvimento
pnpm build    # build de produção
pnpm start    # inicia o build de produção
pnpm lint     # roda o ESLint
pnpm db:migrate  # cria/aplica migrations (desenvolvimento)
pnpm db:deploy   # aplica migrations pendentes (produção)
pnpm db:studio   # abre o Prisma Studio
```

## Estrutura geral

```
src/
  app/         # rotas (App Router)
  components/  # componentes de UI reutilizáveis
  features/    # lógica e componentes por funcionalidade
  lib/         # clients e configuração (prisma, auth, github)
  services/    # regras de negócio / acesso a dados
  hooks/
  types/
  utils/
prisma/
  schema.prisma
```

## Autenticação GitHub

Login exclusivo via GitHub OAuth, com sessões salvas no banco (Auth.js + Prisma).

1. Em GitHub → Settings → Developer settings → **OAuth Apps** → New OAuth App:
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
   - **Expire user authorization tokens:** desmarcado
2. Copie o Client ID para `GITHUB_ID` e gere um Client Secret para `GITHUB_SECRET` no `.env`.

Cada OAuth App aceita uma única callback URL; crie outro app para produção apontando para o domínio real.

Rotas privadas (ex.: `/dashboard`) passam por uma checagem otimista no `src/proxy.ts` e por validação real da sessão no servidor via `requireUser()` (`src/lib/session.ts`).

## Deploy

Aplicação hospedada na Vercel; banco de produção em Neon ou Supabase.

## Roadmap

Etapa 0 (ambiente) → Autenticação → Dashboard → CRUD de Projetos → Página do Projeto → Importação GitHub → Perfil Público → Explorar → Favoritos → Configurações → Refinamentos → Testes → Deploy.
