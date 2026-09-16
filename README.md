# DevShelf

> Organize e apresente tudo o que você já desenvolveu.

DevShelf é um "fichário digital" de projetos para desenvolvedores: faça login com sua conta do GitHub, cadastre ou importe seus repositórios, organize-os por status e tecnologia, e apresente-os em um catálogo visual com página própria para cada projeto e um perfil público compartilhável.

## Status do projeto

🚧 Em desenvolvimento — **Etapa 0: preparação do ambiente**.

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
| `AUTH_SECRET` | Segredo usado pelo Auth.js para assinar sessões/tokens |
| `GITHUB_ID` | Client ID do GitHub OAuth App |
| `GITHUB_SECRET` | Client Secret do GitHub OAuth App |

## Banco de dados local

```bash
docker compose up -d
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

Login exclusivo via GitHub OAuth (detalhado a partir da Etapa 1).

## Deploy

Aplicação hospedada na Vercel; banco de produção em Neon ou Supabase.

## Roadmap

Etapa 0 (ambiente) → Autenticação → Dashboard → CRUD de Projetos → Página do Projeto → Importação GitHub → Perfil Público → Explorar → Favoritos → Configurações → Refinamentos → Testes → Deploy.
