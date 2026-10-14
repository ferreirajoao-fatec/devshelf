# DevShelf

> Organize e apresente tudo o que você já desenvolveu.

DevShelf é um "fichário digital" de projetos para desenvolvedores: faça login com sua conta do GitHub, cadastre ou importe seus repositórios, organize-os por status e tecnologia, e apresente-os em um catálogo visual com página própria para cada projeto e um perfil público compartilhável.

## Status do projeto

🚧 Em desenvolvimento — **Etapa 12: testes**.

- [x] Etapa 0 — Ambiente
- [x] Etapa 1 — Autenticação com GitHub
- [x] Etapa 2 — Dashboard (layout, navegação, tema claro/escuro)
- [x] Etapa 3 — Modelagem de projetos (schema, migration, seed de tecnologias)
- [x] Etapa 4 — CRUD de projetos (Meus Projetos, criar, editar, excluir)
- [x] Etapa 5 — Página do projeto (`/projeto/[slug]`, Markdown, Open Graph)
- [x] Etapa 6 — Importação do GitHub (`/projetos/importar`)
- [x] Etapa 7 — Perfil público (`/u/[username]`)
- [x] Etapa 8 — Explorar (`/explorar`, busca e filtros)
- [x] Etapa 9 — Favoritos (`/favoritos`)
- [x] Etapa 10 — Configurações (`/configuracoes`)
- [x] Etapa 11 — Refinamentos (404, erros, carregamento, acessibilidade)
- [x] Etapa 12 — Testes (Vitest + CI no GitHub Actions)
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
pnpm typecheck         # gera os tipos de rota do Next e roda o TypeScript
pnpm test              # todos os testes (unitários + integração)
pnpm test:unit         # só os testes unitários (não precisam de banco)
pnpm test:integration  # testes dos serviços contra o banco devshelf_test
pnpm test:watch        # testes unitários em modo observação
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
    (public)/  # páginas abertas a visitantes (ex.: /projeto/[slug])
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

### Página do projeto

`/projeto/[slug]` mostra capa, status, links, descrição, autor, tecnologias e datas.

- **Público:** aberto a qualquer pessoa, sem login. **Privado:** só o dono vê (com aviso); para os demais responde 404, e a página recebe `noindex`.
- A descrição aceita Markdown (com tabelas e listas de tarefas via GFM). HTML bruto não é interpretado e links `javascript:` são removidos, então o conteúdo do usuário não executa scripts.
- Título, descrição e capa alimentam os metadados de compartilhamento (Open Graph).
- **Capa com enquadramento:** no formulário, o usuário informa a URL da imagem e escolhe a parte que aparece no quadro 16:9, arrastando a prévia (ou usando as setas do teclado) e ajustando o zoom (1x a 3x). O recorte é salvo como ponto focal e zoom (`coverPositionX`, `coverPositionY`, `coverZoom`) e aplicado por CSS, sem alterar a imagem original. A capa aparece igual, em tamanho menor, nos cards de Meus Projetos.

### Importação do GitHub

Em `/projetos/importar` o usuário vê seus repositórios **públicos** (até 300, do push mais recente ao mais antigo), busca por nome e escolhe um para importar.

- O formulário vem preenchido com nome, descrição, link do repositório, homepage (como demo), data de criação (como início) e tecnologias reconhecidas a partir das linguagens e topics do repositório. Repositório arquivado vira status "Arquivado"; os demais, "Em desenvolvimento".
- **Nada é salvo antes da confirmação**, e o projeto importado sempre começa **privado**.
- A chamada à API usa o token OAuth do login, lido apenas no servidor (`src/lib/github.ts`). Os escopos `read:user` e `user:email` não dão acesso a repositórios privados, e nenhuma permissão extra é pedida.
- Ao salvar, o repositório é lido de novo no GitHub para confirmar que é público e do próprio usuário; os dados de origem (`githubRepoId`, `githubRepoFullName`) nunca vêm do navegador.
- Cada repositório só pode ser importado uma vez por usuário; os já importados aparecem com link para a edição do projeto.
- Se o token não for mais válido (ex.: acesso revogado no GitHub), a página pede para sair e entrar de novo.

## Perfil público

`/u/[username]` mostra avatar, nome, bio, link do GitHub e os projetos **públicos** do usuário (destaques primeiro).

- O perfil vem **desativado**. O usuário ativa e edita nome, username e bio em **Configurações** (`/configuracoes`); o dashboard mostra um resumo com o status e o link.
- Perfil desativado responde 404 para visitantes e recebe `noindex`; o dono continua vendo a página, com um aviso.
- Projetos privados nunca aparecem no perfil, nem para o dono: a página mostra exatamente o que os visitantes veem.
- O `username` vem do login do GitHub e é guardado em minúsculas; o endereço não diferencia maiúsculas.
- Na página de um projeto, o nome do autor leva ao perfil quando ele está ativo.

## Explorar

`/explorar` lista os projetos **públicos** de todos os usuários, do mais recentemente atualizado ao mais antigo, 24 por página. Aberto a visitantes, sem login.

- **Busca** por título, descrição curta ou nome de tecnologia (sem diferenciar maiúsculas).
- **Filtros** por status e por tecnologia; só aparecem tecnologias usadas em algum projeto público, com a quantidade.
- Busca, filtros e página ficam na URL (`?q=&tech=&status=&page=`), então dá para compartilhar uma busca. Valores inválidos são ignorados, e uma página além da última redireciona para a última.
- Cada card mostra o autor, com link para o perfil quando ele está ativo. Um projeto público aparece no Explorar mesmo que o perfil do autor esteja desativado.

## Favoritos

Usuários logados guardam projetos de outras pessoas com a estrela, na página do projeto e nos cards do Explorar e dos perfis. A lista fica em `/favoritos`.

- Só projetos **públicos** de **outros usuários** podem ser favoritados; a regra é verificada no servidor (`src/services/favorites.ts`).
- A estrela responde na hora (atualização otimista) e volta ao estado anterior se o servidor recusar.
- A página do projeto mostra quantas pessoas o favoritaram. Visitantes veem "Favoritar", que leva ao login e volta para o projeto.
- Se um projeto favoritado ficar privado, ele some da lista; desfavoritar continua permitido.

## Configurações

`/configuracoes` (menu do avatar → Configurações) reúne:

- **Perfil:** nome de exibição (vazio = usa o username), username, bio e perfil público.
- **Aparência:** tema claro, escuro ou do sistema, salvo no navegador (o mesmo do botão de tema do header).

Sobre o username:

- Começa igual ao login do GitHub e pode ser trocado: letras, números e hífens, até 39 caracteres, sempre em minúsculas. Trocar muda o endereço do perfil, e links antigos deixam de funcionar.
- É único. Se alguém já adotou o login do GitHub de uma pessoa nova, ela entra com uma variação livre (`login-2`...) em vez de o cadastro falhar (`createUser` em `src/lib/auth.ts`).

## Páginas de erro e carregamento

- **404 em português** (`not-found.tsx` na raiz e nos grupos `(app)` e `(public)`). Projeto privado, perfil desativado e endereço inexistente mostram a mesma página, para não revelar o que existe.
- **Erro inesperado** (`error.tsx`): mensagem amigável, botão "Tentar de novo" (`retry()` do Next 16) e código do erro para cruzar com o log. `global-error.tsx` cobre falhas no próprio layout raiz.
- **Carregamento** (`loading.tsx`): esqueleto nas páginas privadas e no Explorar. As páginas `/projeto/[slug]` e `/u/[username]` ficam sem esqueleto de propósito: com streaming o Next já enviaria `200` antes do `notFound()`, e elas deixariam de responder `404`.
- **Capa indisponível:** se a URL da imagem falhar, o quadro mostra um aviso em vez do ícone de imagem quebrada.
- **Acessibilidade:** link "Pular para o conteúdo" no primeiro Tab e conteúdo dentro de `<main id="conteudo">`.

## Testes

Testes com [Vitest](https://vitest.dev), em dois projetos (`vitest.config.ts`):

| Projeto | Arquivos | O que cobre |
|---|---|---|
| `unit` | `src/**/*.test.ts` | Validações Zod, slug, redirecionamento seguro, mapeamento do GitHub, filtros do Explorar |
| `integration` | `src/**/*.int.test.ts` | Serviços contra um Postgres real: posse e visibilidade de projetos, favoritos, perfis e username, busca do Explorar |

Os testes de integração usam o banco **`devshelf_test`** no mesmo Postgres do `docker compose` (crie/atualize com `pnpm test:integration`, que aplica as migrations antes de rodar). Cada teste começa com as tabelas vazias. Por segurança, eles se recusam a rodar se o nome do banco não terminar em `_test`; para outro banco, use `TEST_DATABASE_URL`.

```bash
docker compose up -d
pnpm test
```

### CI

`.github/workflows/ci.yml` roda em todo PR e nos pushes para `develop` e `main`: lint, tipos, testes unitários, testes de integração (com Postgres como serviço) e build.

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
