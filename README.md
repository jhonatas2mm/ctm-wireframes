# CTM · Wireframes

MVP navegável para validar wireframes. Não tem backend: dados vêm de `src/lib/mock.ts`.

```bash
npm install
npm run dev   # http://localhost:5173
```

## Stack
Vite + React 19 + TypeScript · Tailwind v4 · [shadcn/ui](https://ui.shadcn.com) (estilo `base-nova`, sobre Base UI) · React Router (HashRouter) · lucide-react · sonner.

## Estrutura
- `src/screens.ts` — **registro de telas**. Criou uma página em `src/pages/`? Adicione aqui e ela ganha rota e item no menu.
- `src/components/ui/` — componentes shadcn (gerados; edite à vontade). Mais: `npx shadcn@latest add <nome>`.
- `src/components/wf/` — blocos de wireframe:
  - `Placeholder` caixa com X para imagem/gráfico/mapa
  - `TextLines` linhas cinzas no lugar de texto
  - `Annotation` nota amarela de intenção/regra (toggle "Notas" no topo)
  - `PageHeader`, `StatCard`, `EmptyState`
  - `DataTable` **padrão para toda tabela**: busca por texto, filtro por coluna, contador e "limpar filtros"
- `src/pages/components.tsx` — catálogo vivo (rota `#/componentes`).

## Notas de uso (Base UI, não Radix)
- Composição usa `render`, não `asChild`: `<Button nativeButton={false} render={<Link to="/x" />}>…</Button>`.
- Triggers: `<DialogTrigger render={<Button />}>Abrir</DialogTrigger>`.

## Jornadas e anotações
- `src/journeys.ts` — jornadas (sequência de telas) exibidas na casca preta.
- **Anotações**: rodando `npm run dev`, clique em **Anotar** e depois num ponto do protótipo para registrar
  requisito, regra ou observação. Ficam em `annotations.json` (commite junto). No site publicado são só leitura.
- Pinos valem por tela (padrão de rota, ex. `/itens/:id`) e ficam ancorados no elemento clicado. Se a estrutura
  da tela mudar muito, um pino pode sumir — edite/exclua pelo painel.

## Dados e perfis
- **Dados mockados** (`src/lib/mock.ts` = seed, `src/lib/db.ts` = store): o que for criado/editado no protótipo
  fica salvo no localStorage do navegador. "Restaurar dados mockados" (casca) volta ao seed.
  Nova coleção: `export const useX = () => useCollection<X>('x', seedX)`.
- **Perfis** em `src/journey/profiles.ts` (nome + cor), mantidos pelo Claude — peça para criar.
  A cor aparece no selo do topo e na borda do protótipo. Nas telas: `useProfile()` retorna o nome ativo.
