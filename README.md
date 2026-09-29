# CTM · Wireframes (SENAI)

Protótipo de wireframes para validar telas e fluxos do CTM: **TAAs** (Termos de Acordo Administrativo),
**editais**, **portfólio de produtos**, **propostas comerciais** entre DRs e **oferta**.

> ⚠️ **É só um protótipo navegável.** Dá para percorrer as telas e os fluxos, mas não existe backend:
> sem banco de dados, login ou integração. Nada é salvo de verdade. Os dados são **fictícios**, e o que se cria
> ou edita fica apenas no navegador de quem está usando, só para a demonstração funcionar. Serve para validar as telas
> e a ordem dos passos, não para operar o sistema. Telas e fluxos ainda estão em definição.

```bash
npm install
npm run dev   # http://localhost:5173
```

Publicado no GitHub Pages (repo `jhonatas2mm/ctm-wireframes`), que atualiza a cada push no `main`.

---

## A casca em volta do wireframe

O protótipo roda dentro de uma **casca** (moldura escura, `src/journey/journey-shell.tsx`). A casca não faz parte
do sistema: é a ferramenta usada para apresentar e validar as telas.

- **Seletor de jornada**: lista os fluxos na ordem em que acontecem no sistema, agrupados pelo perfil que inicia cada um.
  Cada jornada tem etapas (telas e notas) com botões de avançar e voltar.
- **Seletor de perfil**: troca o usuário simulado (Super admin, DN, Supervisor, Comercial). O menu, o avatar e a cor
  da borda mudam conforme o perfil.
- **Anotações**: pinos presos a elementos da tela com requisitos, regras e dúvidas, compartilhados via **Supabase**
  (projeto `ctm-wireframes`, tabela `pins`). Qualquer visitante do site publicado cria e vê anotações, informando o nome;
  qualquer um pode excluir (com confirmação); editar só pelo painel do Supabase.
- **Restaurar dados mockados**: descarta o que foi criado e volta aos dados iniciais.

Dentro da moldura fica o **wireframe**, com menu lateral, cabeçalho e as telas do sistema.

## Estrutura

| Caminho | O que é |
|---|---|
| `src/screens.ts` | Registro das telas: rota, item de menu, perfis que veem a tela |
| `src/journeys.ts` | Jornadas (etapas `path`/`note`, perfil por etapa), na mesma ordem de `docs/fluxo.md` |
| `src/journey/` | Casca, perfis (`profiles.ts`) e perfil ativo |
| `src/pages/` | Telas, sheets e modais |
| `src/components/wf/` | Blocos do wireframe: `DataTable`, `PageHeader`, `RowAction`, `EmptyState`, `useConfirmar`… |
| `src/components/ui/` | Componentes shadcn/ui |
| `src/lib/mock.ts` · `db.ts` | Dados iniciais e armazenamento em localStorage (`useCollection`) |
| `src/annotations/` | Pinos de anotação |
| `docs/fluxo.md` | **Regras de fluxo, perfis, domínio e histórico de decisões** (leia primeiro) |
| `CLAUDE.md` | Instruções completas para a IA |

**Stack:** Vite + React 19 + TypeScript, Tailwind v4, shadcn/ui estilo `base-nova` (sobre **Base UI**, não Radix),
React Router com `HashRouter`.

## Domínio (resumo)

- **TAA**: Termo de Acordo Administrativo entre o DN e um DR. Nunca chamar de "TA" ou "Termo de Adesão".
- **Edital** (DN): vigência e cursos. Cada curso tem valor e DRs credenciados. Área, modalidade e carga horária vêm fixas do catálogo.
- **Proposta comercial** (Supervisor): feita da DR ofertante para a DR contratante, com vários cursos e o valor previsto de cada um.
  O número segue o formato `PC-<UF>-<seq>/<ano>`.

---

## Padrões para a IA (e para quem editar)

Tratar como **protótipo**: valem a rapidez e a consistência visual, não a robustez.

**Como trabalhar**
- Verificar com `npx tsc -b`. Não rodar nem testar no navegador sem pedido explícito, e avisar "não testei no navegador".
- Commit só quando for pedido.
- Toda mudança de comportamento entra em `docs/fluxo.md`: atualizar a regra e acrescentar uma linha datada em "Percurso".
- **Nunca remover a casca de jornadas.** Testar pela casca (`/`), não por `?frame=1`.
- Tela nova: registrar em `src/screens.ts` e, se fizer parte de um fluxo, em `src/journeys.ts`, na ordem certa.
- Mudou o formato de uma coleção mockada? Trocar a chave (ex.: `'editais-v7'` → `'editais-v8'`).
- Perfis (`profiles.ts`) só mudam a pedido.

**Base UI**
- Usar `render={<Link …/>}` no lugar de `asChild`. Um `Button` com `Link` precisa de `nativeButton={false}`.

**Padrão visual: shadcn/ui**
- Toda a interface usa **shadcn/ui** no estilo `base-nova`, com cor base `neutral`, variáveis CSS em `src/index.css`,
  fonte Geist, raio de `0.625rem` e ícones **lucide-react**. A configuração está em `components.json`.
- Montar as telas **só com componentes de `src/components/ui/`** e com os blocos de `src/components/wf/`. Não criar botões,
  inputs ou modais do zero nem trazer outra biblioteca de componentes.
- Se faltar algum componente, adicionar com `npx shadcn@latest add <nome>`.
- Cores só pelos tokens do tema (`bg-muted`, `text-muted-foreground`, `border`…), sem cores fixas em hex nem paleta própria.
  Visual neutro, de wireframe, sem estilização de marca.
- Antes de criar uma tela, olhar uma tela parecida que já existe (ex.: `src/pages/editais.tsx`) e seguir o mesmo layout.

**UI**
- Toda tabela usa `DataTable`, com busca, filtros e ações via `RowAction`. Cabeçalho com fundo leve e texto em bold.
- Excluir ou inativar sempre pede **confirmação em modal** (`useConfirmar()`). Botões de excluir sem vermelho.
- **Sem toasts/snackbars.** Uma ação concluída aparece na própria tela: o modal fecha, a linha muda ou surge uma tela de sucesso.
- Formulários de criação: Sheet que abre **de baixo** (`side="bottom"`, 95vh, `rounded-t-xl`), com cabeçalho e rodapé fixos,
  colunas que rolam por dentro e rota própria (`/x/novo`).
- Os formulários **já abrem preenchidos** com dados de exemplo.
- **Nenhum campo bloqueia o fluxo**: sem validação e sem `required`, mas com asterisco (`<Req />`) nos campos que seriam obrigatórios.
- Nomes dos botões: "Novo X / Nova X" para criar e "Salvar X" para concluir. Nunca "Cadastrar" nem "Gerar".
- Sem textos de ajuda sob títulos e sem numeração de seções.
- Dados que vêm do catálogo são somente leitura (etiqueta com cadeado). Só o que é do usuário é editável.
- Seleção múltipla com "Selecionar todos" e "Replicar valores (N)" em modal, com desfazer/avançar quando houver edição em lote.
- Totais em `text-2xl` no rodapé. Números e identificadores em `Badge` com botão de copiar.
- Telas internas usam `PageHeader` com `breadcrumb`.
