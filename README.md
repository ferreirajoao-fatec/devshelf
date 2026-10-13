# DevShelf

> Organize e apresente tudo o que você já desenvolveu.

DevShelf é um "fichário digital" de projetos para desenvolvedores: faça login com sua conta do GitHub, cadastre ou importe seus repositórios, organize-os por status e tecnologia, e apresente-os em um catálogo visual com página própria para cada projeto e um perfil público compartilhável.

## Status do projeto

🚧 Em desenvolvimento — **Etapa 4: CRUD de projetos**.

- [x] Etapa 0 — Ambiente
- [x] Etapa 1 — Autenticação com GitHub
- [x] Etapa 2 — Dashboard (layout, navegação, tema claro/escuro)
- [x] Etapa 3 — Modelagem de projetos (schema, migration, seed de tecnologias)
- [x] Etapa 4 — CRUD de projetos (Meus Projetos, criar, editar, excluir)
- [ ] Próximas etapas — ver [Roadmap](#roadmap)

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
pnpm db:migrate         # aplica as migrations e gera o cliente Prisma
pnpm db:seed            # cadastra as tecnologias iniciais (pode rodar mais de uma vez)
```

### Modelo de dados

| Model | Função |
|---|---|
| `User`, `Account`, `Session` | Usuário e sessões do Auth.js; `User` guarda também `username`, `bio` e `isPublic` |
| `Project` | Projeto do usuário: status, visibilidade (privado por padrão), links, capa e dados do repositório importado |
| `Technology` | Tecnologias compartilhadas entre todos os usuários (tags e filtros) |
| `ProjectTechnology` | Relação N:N entre projetos e tecnologias |
| `ProjectImage` | Galeria de imagens de um projeto, com ordem |
| `Favorite` | Projetos favoritados por um usuário |

O `slug` de projeto é único em todo o sistema, já que a página pública é `/projeto/[slug]`.

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
pnpm db:seed     # popula dados iniciais (tecnologias)
```

## Estrutura geral

```
src/
  app/         # rotas (App Router)
    (app)/     # páginas privadas: exigem login e usam o header do app
  components/  # componentes de UI reutilizáveis
  features/    # lógica e componentes por funcionalidade
  lib/         # clients e configuração (prisma, auth, github)
  services/    # regras de negócio / acesso a dados
  hooks/
  types/
  utils/
prisma/
  schema.prisma
  migrations/
  seed.ts      # tecnologias iniciais
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

## Projetos

Em **Meus Projetos** (`/projetos`) o usuário cadastra, edita, filtra por status e exclui seus projetos.

- Validação com Zod (`src/features/projects/schema.ts`), compartilhada entre cliente e servidor; as server actions revalidam tudo no servidor.
- Todo acesso de leitura, edição e exclusão filtra pelo `userId` da sessão (`src/services/projects.ts`): projeto de outro usuário se comporta como inexistente (404).
- O slug é gerado a partir do título (`meu-app`, `meu-app-2`...) e não muda na edição, para não quebrar links.
- Projetos são criados como **privados**; o usuário escolhe quando torná-los públicos.

## Tema

Claro, escuro ou do sistema, escolhido no header. A preferência fica no `localStorage`, e um script inline no `<head>` (`src/features/theme/theme.ts`) aplica a classe `.dark` antes da primeira pintura, evitando o flash de tema errado.

## Componentes shadcn/ui

O estilo `base-nova` (Base UI) gera componentes importando o helper do pacote `cn`. Depois de `pnpm shadcn add <componente>`, troque o import para `@/lib/utils` e remova o pacote `cn` caso ele seja reinstalado:

```bash
sed -i 's|import { cn } from "cn"|import { cn } from "@/lib/utils"|' src/components/ui/*.tsx
pnpm remove cn
```

## Deploy

Aplicação hospedada na Vercel; banco de produção em Neon ou Supabase.

## Roadmap

Etapa 0 (ambiente) → Autenticação → Dashboard → CRUD de Projetos → Página do Projeto → Importação GitHub → Perfil Público → Explorar → Favoritos → Configurações → Refinamentos → Testes → Deploy.
