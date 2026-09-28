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
- `src/pages/components.tsx` — catálogo vivo (rota `#/componentes`).

## Notas de uso (Base UI, não Radix)
- Composição usa `render`, não `asChild`: `<Button nativeButton={false} render={<Link to="/x" />}>…</Button>`.
- Triggers: `<DialogTrigger render={<Button />}>Abrir</DialogTrigger>`.
