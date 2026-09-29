# Design system atual (snapshot 2026-09-28)

Registro do visual **em uso hoje**, para poder trocar por outro (ex.: o do Figma) e voltar se precisar.
Para restaurar: copie o bloco de `src/index.css` abaixo de volta para o arquivo e mantenha os componentes de `src/components/ui/` como estão (shadcn base-nova).

## Escopo
- O design system vale **só para o layout do protótipo** (AppShell, menu, telas em `src/pages`, `src/components/wf` e `ui`).
- A **casca de jornadas** (`src/journey/journey-shell.tsx`, seletor de jornada/perfil, fluxograma, anotações) **não** muda: mantém o visual atual deste documento.
- Ao trocar de design system, os tokens novos devem ficar escopados ao contêiner do layout (ex.: uma classe no wrapper do AppShell que redefine as variáveis), e não em `:root`, para não vazar para a casca.

## Base
- **Kit**: shadcn/ui estilo `base-nova` (Base UI), `baseColor: neutral`, variáveis CSS, ícones **lucide**.
- **Fonte**: Geist Variable (`@fontsource-variable/geist`); títulos usam a mesma fonte.
- **Raio base**: `--radius: 0.625rem` (10px); escala sm 0.6× · md 0.8× · lg 1× · xl 1.4× · 2xl 1.8× · 3xl 2.2× · 4xl 2.6×.
- **Paleta**: neutra (cinzas em oklch, sem matiz), preto como primária; `destructive` vermelho existe mas **não é usado** em botões de excluir.
- Cores por perfil (casca/avatar) em `src/journey/profiles.ts`: DN `#0284c7`, CTM: Supervisor `#ea580c`, DR solicitante `#ca8a04`, CTM: Comercial `#059669`, Super admin `#dc2626`.

## Tipografia em uso
| Uso | Classe |
|---|---|
| Título de página (`PageHeader`) | `text-2xl font-semibold tracking-tight` |
| Seção | `text-lg font-semibold` |
| Número de indicador (`StatCard`) | `text-3xl tabular-nums` |
| Totais em sheet | `text-2xl` |
| Texto padrão | `text-sm` |
| Legenda / apoio | `text-xs text-muted-foreground` |
| Identificadores | `font-mono` dentro de `Badge variant="secondary"` |

## Componentes base (src/components/ui)
- **Button** — variantes `default` (primária preta), `outline`, `secondary`, `ghost`, `destructive` (não usar), `link`. Tamanhos `xs` h-6 · `sm` h-7 · `default` h-8 · `lg` h-9 · `icon` 8 (e `icon-xs/sm/lg`). Raio `rounded-lg`, `text-sm font-medium`, foco com `ring-3 ring-ring/50`.
- **Badge** — pílula `rounded-4xl`, h-5, `text-xs font-medium`; variantes `default`, `secondary`, `outline`, `ghost`, `link`.
- **Table** — cabeçalho `bg-muted/60`, `TableHead` h-10 **font-bold**; linha com `hover:bg-muted/50`.
- **Card**, **Sheet**, **Dialog**, **Select**, **Input**, **Tabs**, **Progress**, **Tooltip**, **DropdownMenu** etc. no padrão base-nova.
- **Sheet lateral**: padrão `sm:max-w-lg`; telas usam de `xl` a `5xl`. Sheet de criação vem de baixo (`h-[95vh]`, `rounded-t-xl`).

## Componentes do protótipo (src/components/wf)
`PageHeader` (título + breadcrumb na barra superior + ações) · `DataTable` (busca, botão Filtros em popover, etiquetas de filtros aplicados, coluna de ações fixa à direita) · `RowAction` (ícone com tooltip) · `StatCard` · `EmptyState` · `useConfirmar` (modal de confirmação) · `AttachField` · `Req` (asterisco) · `ModulosEditor` · `status-proposta`.

## Padrões visuais
- Sem toasts; ação concluída = a tela muda.
- Indicadores: cards com número grande; no Painel, blocos `rounded-lg bg-muted/50 p-3` com `text-2xl`/`text-3xl font-semibold`.
- Alerta leve: `text-amber-600` (ex.: "requer atenção"). Sem vermelho para excluir.
- Barras de progresso: `Progress` + percentual `text-xs tabular-nums`.
- Números sempre `tabular-nums`.

## Tokens (cópia literal de `src/index.css`)
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/geist";

@custom-variant dark (&:is(.dark *));

@theme inline {
    --font-heading: var(--font-sans);
    --font-sans: 'Geist Variable', sans-serif;
    --color-sidebar-ring: var(--sidebar-ring);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar: var(--sidebar);
    --color-chart-5: var(--chart-5);
    --color-chart-4: var(--chart-4);
    --color-chart-3: var(--chart-3);
    --color-chart-2: var(--chart-2);
    --color-chart-1: var(--chart-1);
    --color-ring: var(--ring);
    --color-input: var(--input);
    --color-border: var(--border);
    --color-destructive: var(--destructive);
    --color-accent-foreground: var(--accent-foreground);
    --color-accent: var(--accent);
    --color-muted-foreground: var(--muted-foreground);
    --color-muted: var(--muted);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-secondary: var(--secondary);
    --color-primary-foreground: var(--primary-foreground);
    --color-primary: var(--primary);
    --color-popover-foreground: var(--popover-foreground);
    --color-popover: var(--popover);
    --color-card-foreground: var(--card-foreground);
    --color-card: var(--card);
    --color-foreground: var(--foreground);
    --color-background: var(--background);
    --radius-sm: calc(var(--radius) * 0.6);
    --radius-md: calc(var(--radius) * 0.8);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) * 1.4);
    --radius-2xl: calc(var(--radius) * 1.8);
    --radius-3xl: calc(var(--radius) * 2.2);
    --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.97 0 0);
    --secondary-foreground: oklch(0.205 0 0);
    --muted: oklch(0.97 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --accent: oklch(0.97 0 0);
    --accent-foreground: oklch(0.205 0 0);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.922 0 0);
    --input: oklch(0.922 0 0);
    --ring: oklch(0.708 0 0);
    --chart-1: oklch(0.87 0 0);
    --chart-2: oklch(0.556 0 0);
    --chart-3: oklch(0.439 0 0);
    --chart-4: oklch(0.371 0 0);
    --chart-5: oklch(0.269 0 0);
    --radius: 0.625rem;
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.145 0 0);
    --sidebar-primary: oklch(0.205 0 0);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.97 0 0);
    --sidebar-accent-foreground: oklch(0.205 0 0);
    --sidebar-border: oklch(0.922 0 0);
    --sidebar-ring: oklch(0.708 0 0);
}

.dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.205 0 0);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.205 0 0);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.922 0 0);
    --primary-foreground: oklch(0.205 0 0);
    --secondary: oklch(0.269 0 0);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.269 0 0);
    --muted-foreground: oklch(0.708 0 0);
    --accent: oklch(0.269 0 0);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.556 0 0);
    --chart-1: oklch(0.87 0 0);
    --chart-2: oklch(0.556 0 0);
    --chart-3: oklch(0.439 0 0);
    --chart-4: oklch(0.371 0 0);
    --chart-5: oklch(0.269 0 0);
    --sidebar: oklch(0.205 0 0);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.269 0 0);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
    }
  body {
    @apply bg-background text-foreground;
    }
  html {
    @apply font-sans;
    }
}
/* Casca de wireframe: fundo pontilhado estilo "canvas" de ferramenta de design,
   para não se confundir com a interface apresentada. */
.shell-canvas {
  background-color: #0a0a0a;
  background-image: radial-gradient(rgb(255 255 255 / 0.22) 1px, transparent 1px);
  background-size: 14px 14px;
}
```
