# CTM — Wireframes navegáveis (SENAI)

MVP clicável para validar wireframes: TAAs (Termos de Acordo Administrativo), editais e propostas comerciais entre DRs.
Dados são **fictícios**. Respostas em pt-BR, curtas.

## Stack
Vite + React 19 + TS, Tailwind v4, shadcn/ui **base-nova** (Base UI), React Router **HashRouter**.
- Base UI: use `render={<Link …/>}` em vez de `asChild`; Button com Link precisa `nativeButton={false}`.
- Dev: `npm run dev` (porta 5173, `.claude/launch.json`). Deploy: GitHub Pages (repo `jhonatas2mm/ctm-wireframes`), atualiza a cada **push** no `main`.

## Como trabalhar
- Verificar só com `npx tsc -b`. **Não rodar o projeto nem testar no navegador** — nem em lógica arriscada — a menos que eu peça explicitamente. Avisar "não testei no navegador".
- **Toda mudança pedida vai para o `main`** (commit + push, para o GitHub Pages atualizar), sem precisar pedir. Ao levar para o `main`: antes, `git fetch` + merge do `origin/main` (outras pessoas mexem no projeto), resolver conflitos, `npx tsc -b`, e só então push.
- **Regras de fluxo e decisões do sistema prototipado** vão para `docs/fluxo.md` (regra + linha datada em "Percurso") a cada mudança de comportamento. **Não registrar** detalhes visuais nem nada da casca de jornadas.
- A **casca de jornadas** (`src/journey/journey-shell.tsx`) nunca pode ser removida. Se testar no browser, fazer pela casca (`/`), não por `?frame=1`.

## Estrutura
- `src/screens.ts` — registro de telas (rota + menu). `hidden` tira do menu; `profiles` limita a quais perfis a tela aparece no menu.
- `src/journeys.ts` — jornadas/fluxos (etapas `path`/`note`/`focus`, perfil por etapa). `note` vira o texto do Guia; `focus` (seletor CSS ou `text=Texto`) é o que o Guia destaca na tela. **A ordem do array é a ordem dos fluxos** (ordem em que acontecem no sistema; a casca numera dentro de cada perfil inicial); manter igual à lista em `docs/fluxo.md`.
- `src/journey/profiles.ts` — perfis (nome, cor, usuário do avatar, DR, grupo e caixa). Três grupos: **DN**, **CTM** (caixas Gestor de contrato, PCP, Gestor de oferta, Pedagógico, Tutor, Monitor) e **DR solicitante** (caixa Gestor SENAI → TAA; o Gestor pode ser coordenador, interlocutor…; **sem SESI na v1**), mais o **Super admin**. Nome do perfil = `Grupo: Caixa` (ex.: `CTM: PCP`). Só o Claude edita, a pedido.
- `src/lib/mock.ts` — seeds + `useCollection` (`src/lib/db.ts`, localStorage). Ao mudar o formato de uma coleção, trocar a chave (ex.: `'editais-v7'`) para descartar dados antigos.
- `src/components/wf/` — DataTable, PageHeader, RowAction, EmptyState etc.
- `src/annotations/` — pinos de anotação, salvos no Supabase (projeto `ctm-wireframes`, tabela `pins`: leitura, criação e exclusão públicas; editar só pelo painel).

## Padrões de UI
- **Área central usa toda a largura da tela** (sem `max-w` no conteúdo das páginas).
- **Sem versão responsiva**: tudo é desenhado só para desktop; não criar ajustes para telas menores.
- Botões de excluir sem vermelho (sem `destructive`), por enquanto.
- **Excluir/inativar sempre pede confirmação em modal** (`useConfirmar()` de `@/components/wf`); nunca `confirm()` nativo.
- **Sem snackbars/toasts** em nenhum lugar (o `<Toaster />` foi removido). Ação concluída = a tela muda (modal fecha, status/linha atualiza, tela de sucesso quando for etapa).
- **Formulários de criação já abrem preenchidos** com dados de exemplo (para validar os fluxos sem digitar); o usuário pode alterar. Ao criar um formulário novo, incluir esse preenchimento.
- **Nenhum campo bloqueia o protótipo**: não validar nem desabilitar "Salvar" por campo vazio, sem atributo `required`. Manter o asterisco (`<Req />`) nos rótulos que seriam obrigatórios. Só bloquear o que é estrutural (ex.: salvar sem nenhum item selecionado).
- Tabelas (DS SENAI, em `src/index.css`): card branco raio 20px, cabeçalho branco com texto pequeno semibold cinza, linhas de 56px, 1ª coluna semibold, ações em ícones soltos.
- **Filtros de DR, estado, curso/produto, turma, modalidade, área tecnológica, nomes e outros com muitos valores** (ou mais de 10 opções) são campo de busca com vários escolhidos em etiquetas (automático no `DataTable`).
- **Filtros de data** (coluna só com datas): intervalo De/Até com campos de data (automático no `DataTable`).
- Colunas de **Curso/Produto** nas tabelas: largura limitada e texto quebrando linha (automático no `DataTable`).
- **Toda tabela usa `DataTable`** com busca, botão **Filtros** (popover com todos os filtros, um por coluna; `filter: true` = topo da lista; prop `filters` para valores múltiplos; fora do botão só a busca e etiquetas dos filtros aplicados) e ações via `RowAction`.
- **Nomenclatura**: botões de criação "Novo X / Nova X"; botão final "Salvar X". Nunca "Cadastrar/Gerar".
- **Formulários de criação**: Sheet **de baixo** (`side="bottom"`, `data-[side=bottom]:h-[95vh]`, `rounded-t-xl`), cabeçalho e rodapé fixos, colunas que rolam por dentro; rota própria (`/x/novo`) para virar etapa de jornada.
- Sem textos de ajuda sob títulos; sem numeração de seções.
- **Hierarquia de botões**: 1) principal preenchido; 2) outline com ícone na cor principal; 3) **só outline, cor neutra** (ex.: "Detalhes" dentro de uma célula). **Toda ação de clique dentro das células** (fora da coluna Ações) usa `CellButton`/`cellButton` de `@/components/wf` — nunca link sublinhado; "Detalhes" numa célula com texto vira **ícone Info logo após o texto** (`CellButton icone label="…"`). Exceção: na **coluna Ações** das tabelas todos os botões são iguais — contorno neutro com ícone e texto na cor principal.
- **Botão desabilitado sempre tem tooltip** com o que está pendente: `<Button disabled={…} motivo="…">` (sem `motivo` mostra "Indisponível no momento"); em `RowAction`, prop `motivo`.
- **Cores de status (badges) centralizadas** em `src/components/ui/badge.tsx` (`tones`): verde = concluído, azul = em curso, laranja = aguardando/atenção (todo "Aguardando…"), vermelho = negativo, cinza = inicial/encerrado. Status novo → incluir lá; badge nunca na cor principal.
- **Arredondamento único de containers: 20px** (`rounded-[1.25rem]`) — blocos dos painéis, cards, tabelas, caixas de informação; itens internos (linhas, campos, botões) usam raios menores.
- **Nada direto sobre o fundo cinza da página**: caixas com borda têm fundo (`bg-card`); campos (input, select, textarea) têm fundo branco; blocos de campos/texto ficam dentro de uma caixa (`rounded-lg border bg-card p-4`).
- Dados vindos do catálogo/itinerário são **somente leitura** (etiqueta com cadeado); só o que é do usuário é editável (ex.: valor).
- Seleção múltipla com "Selecionar todos" + botão **"Replicar valores (N)"** que abre modal; desfazer/avançar quando houver edição em lote.
- Totais em destaque (`text-2xl`) no rodapé da sheet.
- Números/identificadores em `Badge` com botão de copiar dentro.
- Telas internas usam `PageHeader` com `breadcrumb` (`[{ label, to }, { label }]`).
- Buscas de estado/DR: campo com resultados logo abaixo e escolhidos como etiquetas (`EstadosInput`).

## Domínio
- **TAA** = Termo de Acordo Administrativo: sempre vinculado a um edital; **um TAA por edital para cada par CTM × DR** (outro edital = novo TAA, mesmo com um em andamento), com produtos do edital; a CTM é a aprovada para eles. Normalmente a CTM vencedora envia e o **Gestor** da DR solicitante analisa (a DR também pode criar). Status: Encaminhado, Em análise, Retornado para ajuste, Aceito, Cancelado; saldo = valor − executado. Aceito só destrava a negociação/propostas. Só SENAI ↔ SENAI (**SESI fora da v1**). DN não contrata CTM. Nunca "TA"/"Termo de Adesão".
- **Edital** (DN): só o DN faz a gestão; as CTMs apenas participam (oferecem custo, fora do sistema) e consultam em leitura. Vigência + cursos; cada curso tem valor, DRs credenciados e a **CTM aprovada** (menor custo). Área, modalidade e CH são fixas do catálogo.
- **Portfólio**: cada CTM registra produtos com versões; novo produto/nova versão = solicitação que o **DN aprova** (Aprovação de portfólio); só o aprovado entra no Portfólio das CTMs (todas as DRs veem) e na oferta. Produto tem vínculo com o itinerário (outro sistema) e documentos/materiais (links).
- **Proposta comercial** (CTM): sempre criada pela CTM, vinculada a um TAA/contrato aceito, depois da negociação (fora do sistema); responsável = Gestor de contrato. Cursos do TAA com alunos e início, matriz do portfólio, valor = valor do edital × alunos. Status: Rascunho, Em andamento, Aguardando retorno do cliente, Aprovado, Cancelado (o Gestor de contrato muda). Versões (vai e vem) com histórico. Aprovada: executa o saldo do TAA, vincula a equipe técnica (supervisor e analista) e segue para as turmas. Nº `PC-<UF>-<seq>/<ano>`.
