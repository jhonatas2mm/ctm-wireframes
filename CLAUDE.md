# CTM — Wireframes navegáveis (SENAI)

MVP clicável para validar wireframes: TAAs (Termos de Acordo Administrativo), editais e propostas comerciais entre DRs.
Dados são **fictícios**. Respostas em pt-BR, curtas.

## Stack
Vite + React 19 + TS, Tailwind v4, shadcn/ui **base-nova** (Base UI), React Router **HashRouter**.
- Base UI: use `render={<Link …/>}` em vez de `asChild`; Button com Link precisa `nativeButton={false}`.
- Dev: `npm run dev` (porta 5173, `.claude/launch.json`). Deploy: GitHub Pages (repo `jhonatas2mm/ctm-wireframes`), atualiza a cada **push** no `main`.

## Como trabalhar
- Verificar só com `npx tsc -b`. **Não rodar o projeto nem testar no navegador** — nem em lógica arriscada — a menos que eu peça explicitamente. Avisar "não testei no navegador".
- Commit só quando pedido.
- **Regras de fluxo e decisões** vão para `docs/fluxo.md` (regra + linha datada em "Percurso") a cada mudança de comportamento.
- A **casca de jornadas** (`src/journey/journey-shell.tsx`) nunca pode ser removida. Se testar no browser, fazer pela casca (`/`), não por `?frame=1`.

## Estrutura
- `src/screens.ts` — registro de telas (rota + menu). `hidden` tira do menu; `profiles` limita a quais perfis a tela aparece no menu.
- `src/journeys.ts` — jornadas/fluxos (etapas `path`/`note`, perfil por etapa). **A ordem do array é a ordem dos fluxos** (ordem em que acontecem no sistema; a casca numera dentro de cada perfil inicial); manter igual à lista em `docs/fluxo.md`.
- `src/journey/profiles.ts` — perfis (nome, cor, usuário do avatar, DR). Hoje: **DN**, **CTM: Supervisor** (antiga DR credenciada, SENAI-MG), **CTM: Comercial** (mesmas telas do Supervisor, SENAI-MG) e **Super admin**. Só o Claude edita, a pedido.
- `src/lib/mock.ts` — seeds + `useCollection` (`src/lib/db.ts`, localStorage). Ao mudar o formato de uma coleção, trocar a chave (ex.: `'editais-v7'`) para descartar dados antigos.
- `src/components/wf/` — DataTable, PageHeader, RowAction, EmptyState etc.
- `src/annotations/` — pinos de anotação, salvos no Supabase (projeto `ctm-wireframes`, tabela `pins`: leitura e criação públicas; editar/excluir só pelo painel).

## Padrões de UI
- Botões de excluir sem vermelho (sem `destructive`), por enquanto.
- **Excluir/inativar sempre pede confirmação em modal** (`useConfirmar()` de `@/components/wf`); nunca `confirm()` nativo.
- **Sem snackbars/toasts** em nenhum lugar (o `<Toaster />` foi removido). Ação concluída = a tela muda (modal fecha, status/linha atualiza, tela de sucesso quando for etapa).
- **Formulários de criação já abrem preenchidos** com dados de exemplo (para validar os fluxos sem digitar); o usuário pode alterar. Ao criar um formulário novo, incluir esse preenchimento.
- **Nenhum campo bloqueia o protótipo**: não validar nem desabilitar "Salvar" por campo vazio, sem atributo `required`. Manter o asterisco (`<Req />`) nos rótulos que seriam obrigatórios. Só bloquear o que é estrutural (ex.: salvar sem nenhum item selecionado).
- Cabeçalho das tabelas: fundo leve e texto em **bold** (padrão em `ui/table.tsx`).
- **Toda tabela usa `DataTable`** com busca, filtros (`filter: true` na coluna ou prop `filters` para valores múltiplos) e ações via `RowAction`.
- **Nomenclatura**: botões de criação "Novo X / Nova X"; botão final "Salvar X". Nunca "Cadastrar/Gerar".
- **Formulários de criação**: Sheet **de baixo** (`side="bottom"`, `data-[side=bottom]:h-[95vh]`, `rounded-t-xl`), cabeçalho e rodapé fixos, colunas que rolam por dentro; rota própria (`/x/novo`) para virar etapa de jornada.
- Sem textos de ajuda sob títulos; sem numeração de seções.
- Dados vindos do catálogo/itinerário são **somente leitura** (etiqueta com cadeado); só o que é do usuário é editável (ex.: valor).
- Seleção múltipla com "Selecionar todos" + botão **"Replicar valores (N)"** que abre modal; desfazer/avançar quando houver edição em lote.
- Totais em destaque (`text-2xl`) no rodapé da sheet.
- Números/identificadores em `Badge` com botão de copiar dentro.
- Telas internas usam `PageHeader` com `breadcrumb` (`[{ label, to }, { label }]`).
- Buscas de estado/DR: campo com resultados logo abaixo e escolhidos como etiquetas (`EstadosInput`).

## Domínio
- **TAA** = Termo de Acordo Administrativo (DN ↔ DR). Nunca "TA"/"Termo de Adesão".
- **Edital** (DN): vigência + cursos; cada curso tem valor e DRs credenciados. Área, modalidade e CH são fixas do catálogo.
- **Proposta comercial** (Supervisor): DR ofertante (própria, fixa) → DR contratante; vários cursos, cada um com valor previsto; Nº `PC-<UF>-<seq>/<ano>`. Cada curso só entra uma vez nas propostas.
