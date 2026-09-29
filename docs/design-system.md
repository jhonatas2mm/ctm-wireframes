# Design System SENAI (base: Figma "Design System")

Fonte: arquivo Figma `IggEFikdXEoJKTi9UxnsTI` (SENAI + Google Cloud), lido por prints — **valores aproximados** (objetivo: chegar perto, não pixel-perfect). Hex marcados com `≈` foram estimados pela cor do swatch.
O visual anterior está em [design-system-atual.md](design-system-atual.md).

## Escopo
- Vale **só para o layout do protótipo** (AppShell, menu, telas em `src/pages`, `src/components/wf` e `ui`).
- **Não** se aplica à casca de jornadas (`src/journey/journey-shell.tsx`, seletor, fluxograma, anotações).
- Implementação: classe `ds-senai` no `<html>` do protótipo (iframe `?frame=1`, posta em `src/main.tsx`); tokens em `html.ds-senai` no fim de `src/index.css`. A casca não recebe a classe.

**Cores da marca SENAI: primária laranja, secundária azul.**

## Fundamentos

### Tipografia — Open Sans
Pesos: 400 regular · 500 medium (títulos) · 600 semibold (body) · 700 bold.

| Token | Tamanho | Line-height | Uso sugerido no protótipo |
|---|---|---|---|
| heading-4XL | 60px | 78px | — |
| heading-XXXL | 48px | 64px | — |
| heading-XXL | 34px | 48px | número de destaque grande |
| title-XL | 24px | 34px | título de página (`PageHeader`), números de indicador |
| title-L | 20px | 30px | título de seção / sheet |
| body-M | 18px | 28px | título de card |
| body-S | 16px | 24px | texto base de formulário |
| body-XS | 14px | 20px | texto padrão de tabela e UI |
| body-XXS | 12px | 18px | legendas, badges |
| caption-XXXS | 10px | 14px | micro-rótulos |

### Cores
Tokens no formato `color-<família>-<step>`. ★ = cor base da família.

**Primary — Brand Orange**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 ★ | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| #FFF6ED | #FEEAD6 | #FDD1AB | #FBB076 | #F8833F | #F5631A | #E84910 | #BF340F | #992B14 | #7A2514 | #421008 |

**Secondary — Brand Blue**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 ★ | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| #EEF7FF | #D9EDFF | #BAE0FF | #8BCFFF | #54B2FF | #2D90FF | #1670FA | #0F59E6 | #1348BA | #164194 | #12285A |

**Danger**
| 50 | 100 | 200 | 300 | 400 | 500 | 600 ★ | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|
| #FFF1F1 | #FFE1E1 | #FFC7C7 | #FFA1A1 | #FF6A6A | #F83B3B | #E31A1A | #C11414 | #9F1515 | #841818 |

**Success**
| 50 | 100 | 200 | 300 | 400 | 500 ★ | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|
| #EBFEF4 | #CDFEE4 | #A0FACE | #63F2B5 | #26E197 | #01B574 | #00A369 | #008257 | #006746 | #00543C |

**Warning** (≈ todos)
| 50 | 100 | 200 | 300 | 400 ★ | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|
| #FFF9EB | #FFEAC6 | #FFD289 | #FFB64B | #FE9C20 | #F87607 | #DD5201 | #B63505 | #94270C | #7A230C |

**Info** (≈ parcialmente)
| 50 | 100 | 200 | 300 | 400 ★ | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|
| #E9FAFF | #A8EEFF | #6BE7FF | #26D5FF | #00B1FE | #0087FF | #006BFF | #015CE6 | #0052B4 | #012753 |

**Neutrals (light mode)** — o dark mode inverte a escala (950 ↔ 50).
| 50 | 100 | 150 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| #FFFFFF | #F5F5F5 | #E4E8E9 | #CBD4D6 | #A7B5B9 | #7C8F94 | #617379 | #536167 | #475157 | #3D4448 | #383D41 | #22272A |

**Overlays**: cada família tem versão com opacidade (50 = 5%, 100 = 10% … 900 = 90%) da cor base, usadas em sombras e glassmorphism.

**Gradientes**
- `gradient-1/2`: laranja → azul em diagonal (#FBB076 · #A7B5B9 · #54B2FF · #0F6?FF); o 2 é a versão clara.
- `gradient-3..6`: manchas radiais claras sobre branco (azul, vermelho, laranja, verde).
- **Fundo holográfico** (usado atrás de Bottom Bar e FAB): pêssego #F6C9B8 → branco → azul acinzentado #9FB0D3 → rosado #C9A5A6, bem suave e desfocado.

### Fundo do protótipo
Liso, cinza claro #F5F5F7 (estilo iOS). **Sem gradiente no fundo** (decisão 2026-09-28); o gradiente holográfico fica só para componentes que o usam no Figma (Bottom Bar, FAB, Snackbar).

### Containers
Cards e tabelas planos: branco, borda 1px neutral-150 #E4E8E9, **sem sombra** (decisão 2026-09-28), raio 20px.

### Menu lateral
Flutuante (`Sidebar variant="floating"`): afastado 12px das bordas, cantos 28px, branco com borda neutral-150, sem sombra. Item ativo em pílula orange-100 com texto orange-800.

### Indicadores (StatCard)
Ícone em caixa arredondada (raio 12px, 44px) com fundo suave e ícone na cor do tom (orange, blue, green, red, amber, gray) + rótulo body-XXS neutral-500 + número 24px bold.

### Filtros (DataTable)
Popover raio 16px: cabeçalho com ícone, "Filtros", contador laranja e "Limpar"; cada filtro com rótulo semibold e, até 6 valores, pílulas (ativa: borda laranja, fundo orange-50); acima disso, select.

### Tabelas
Card branco raio 20px, borda neutral-150, sem sombra. Cabeçalho branco, texto 12px semibold neutral-500, divisória abaixo. Linhas de 56px, divisórias bem leves (#F0F2F3), hover #FAFAFB; 1ª coluna semibold neutral-950, demais neutral-800. Ações da linha: ícones soltos neutral-500, círculo laranja-claro no hover.

### Modais e sheets
Flutuantes estilo iOS: afastados 12px das bordas da tela, todos os cantos arredondados (28px), vidro branco ~88% com blur e fundo escurecido/desfocado atrás.

### Glassmorphism
Superfícies claras semitransparentes (branco ~70–80%) com blur de fundo, sobre o fundo holográfico. Botões dentro de barras: fundo branco translúcido, raio ~12px.

### Raio (aprox.)
| Uso | Raio |
|---|---|
| Botão de texto | 8px |
| Botão ícone LG/MD | 12–14px · SM/XS 8px |
| Input / tag | 8px |
| Card, calendário, alert box, modal | 16px |
| Avatar, badge numérico, ícone circular | 9999px |

### Espaçamento
Escala de 4px (4, 8, 12, 16, 24, 32, 40, 48). Cards com padding 32px; gap interno 16–24px.

### Elevação
- Card "flat": borda 1px `neutral-150`, sem sombra.
- Card elevado: sem borda, sombra suave `0 2px 12px rgb(34 39 42 / 8%)`.
- Popovers/tooltip: sombra média `0 8px 24px rgb(34 39 42 / 12%)`.

## Componentes

### Button
Variantes × estados (Default · Hover · Click · Disable):

| Variante | Default | Hover | Click | Disable |
|---|---|---|---|---|
| **Filled** | bg orange-700 #BF340F, texto branco | bg orange-600 #E84910 | bg orange-800 #992B14 | bg orange-200 #FDD1AB (≈ opaco 60%), texto branco |
| **Outline** | borda + texto orange-700, fundo branco | fundo orange-50, borda orange-600 | fundo orange-100, borda orange-800 | borda e texto neutral-800 |
| **Subtle** (ghost) | só texto orange-700 | fundo orange-50 | fundo orange-100 | texto neutral-800 |
| **Light** | só texto orange-700 | vira Filled orange-600 | Filled orange-800 | Filled desabilitado |
| **Light gradient** | borda em gradiente laranja→azul, texto orange | + brilho radial laranja interno | + brilho azul claro | borda azul clara, texto blue-300 |

Tamanhos: **LG** h-48 · **MD** h-40 · **SM** h-32 · **XS** h-24 (texto 16/14/12/10px, semibold). Ícone opcional à esquerda ou à direita (`+`). Versão só-ícone quadrada nos mesmos tamanhos.

### Avatar
Círculo; iniciais em branco sobre brand-blue-500 (#2D90FF) ou foto. Tamanhos ~32 · 40 · 48 · 72 · 96px. Variações: sem borda · anel em gradiente laranja→azul · anel cinza (neutral-400) · com badge de remover (pílula branca com "−" vermelho no canto superior direito).

### Badge numérico / ponto
Círculo 32px com número branco bold (ou ponto 8px) nas cores: danger-600, orange-600, blue-600, success-700, neutral-300 (texto escuro).

### Bottom Bar / FAB
- Barra horizontal de botões-ícone brancos translúcidos (raio 12px) sobre fundo holográfico.
- Botão central destacado: quadrado grande orange-400 com ícone branco, tooltip claro acima ("Text Exemple").
- FAB lateral: coluna de botões; opção com rótulo em pílula branca ("Nome da opção"), estados orange-600 e orange-800, contador em círculo orange-800 com número branco; variante mascote "Fale comigo".

### Card
Branco, raio 16px, padding 32px (flat com borda ou elevado com sombra).
Estrutura: ícone circular (fundo orange-50, ícone orange-800) + chip cinza "Text Content" no topo → imagem raio 16px → título body-M bold (#22272A) + subtítulo → indicador circular de progresso (anel orange-600, % bold no centro) → texto body-S neutral-800 → lista de itens com ícone neutral-500 → rodapé com botão Subtle + botão Filled.

### Calendar / Date picker
Card branco raio 16px. Cabeçalho "Maio de 2025" em orange-700 com setas `‹ ›` laranja. Dias da semana D S T Q Q S S. Dias de outros meses em neutral-500. Selecionado: fundo orange-100 raio 8px com pontinhos coloridos (eventos). Intervalo: faixa orange-50 contínua, extremos orange-100. Visões de meses (Jan…Dez) e décadas (2020 - 2029).

### Alert Box (modal de confirmação)
Fundo escuro neutral-950 (#22272A), raio 16px, conteúdo centralizado. Ícone em círculo com fundo translúcido da cor do tipo: erro (danger, ⊗), info (blue, ⓘ), sucesso (success, ✓), aviso (warning, ⓘ). Título title-L bold branco; descrição body-S clara. Ações: horizontal (Subtle branco + Filled laranja) ou vertical (Filled largura total + Subtle abaixo).

### Collapse (collapsible)
- Item em card branco, raio 16px, borda 1px neutral-150, padding 32px, sobre fundo neutral-100.
- Cabeçalho: título body-M semibold (#22272A) + descrição body-XS neutral-700; ícone `+` neutral-700 à direita (vira `−` aberto).
- Variante com progresso: barra fina (h-8, raio total) success-500 sobre trilho neutral-100 + "100%" body-XS neutral-500 à direita.
- Variante "media content": `+` laranja à esquerda do título; conteúdo expandido abaixo (texto body-S) e slot para outro componente.

### Cropper (foto de perfil)
Modal branco raio 16px, título title-L bold + subtítulo body-XXS neutral-600, `×` no canto.
Círculo grande neutral-150 com ícone de câmera neutral-600. Três etapas:
1. **Alterar foto** — ações Subtle laranja "Remover" (lixeira) e "Editar" (lápis).
2. **Atualizar foto** — "Fazer upload" e "Tire uma foto".
3. **Visualizar** — foto recortada no círculo, slider de zoom (trilho neutral-150, preenchido orange-600, thumb laranja) com `−`/`+`; rodapé "Cancelar" (Subtle) + "Salvar" (Filled).

### Date Picker
Campo com rótulo body-XS semibold + asterisco danger-600; input branco, borda neutral-150, raio 8–12px, placeholder `dd/mm/aaaa` neutral-600 e ícone de calendário à direita. Tamanhos XS/SM/MD/LG (≈ h-40, 48, 56, 64). Abre o **Calendar** logo abaixo, mesma largura do campo (seleção de data única ou intervalo).

### Data Viz
Regra do Figma: não há limite de indicadores no código; as cores vêm **só da paleta do DS**; novos tipos de gráfico podem ser sugeridos e, se aprovados, entram no DS.

**Container**: card branco, borda 1px neutral-150, raio 12px, padding 16px. Título body-S semibold (#22272A) + subtítulo body-XXS neutral-500; legenda no canto superior direito (bolinha 8px + "Indicator" body-XXS).

**KPI (indicador numérico)**: título body-XS · valor title-XL bold (`000.000`) · chip de variação (↗ fundo success-50, texto success-700 / ↙ fundo danger-50, texto danger-700, raio 6px) + "em relação ao … anterior" body-XXS neutral-500. Em linha de 4.

**Paleta de séries** (ordem): orange-900 #7A2514 · orange-600 #E84910 · orange-400 #F8833F · orange-300 #FBB076 · orange-200 #FDD1AB; azul (blue-400 #54B2FF) só como série de contraste em áreas empilhadas.

**Tipos**
- Linhas suaves (curvas), pontos pequenos nos vértices.
- Área empilhada (laranjas + azul), com crosshair vertical e tooltip multi-série (data, % por série, Total).
- Barras agrupadas por mês (3–4 séries) e barras positivas/negativas com eixo zero.
- Meia-rosca (gauge) segmentada, anéis concêntricos (progresso), radar/teia, pizza e rosca segmentada com gaps e cantos arredondados.
- Gráficos circulares têm lista de legenda abaixo: bolinha + nome à esquerda, valor à direita, divisória fina.

**Eixos e grade**: rótulos body-XXS neutral-500 (meses Jan…Dez); grade tracejada neutral-150; sem linhas de eixo fortes.
**Tooltip**: card branco raio 8px, sombra média, título body-XXS neutral-500, valor bold.

### Feedback Alert (inline)
Faixa de largura total, raio 16px, padding ~24px, **sem borda**. Ícone outline 24px à esquerda, centralizado na altura; título body-M bold e subtítulo body-S regular, ambos na cor do tipo.

| Tipo | Fundo | Ícone + texto | Ícone |
|---|---|---|---|
| Erro | ≈ #FBE6E5 (danger-50/100) | danger-700 #C11414 | círculo com `!` |
| Aviso | ≈ #FDF0E6 (orange-50) | orange-700 #BF340F | triângulo com `!` |
| Sucesso | ≈ #E3F5EE (success-50) | success-700 #008257 | círculo com ✓ |
| Info | ≈ #E3F0FD (blue-50) | blue-700 #0F59E6 | círculo com `i` |
| Neutro | ≈ #E6E7E7 (neutral-150) | neutral-800 #3D4448 | círculo com `i` |

Uso no protótipo: substitui o `Alert` do shadcn (continua valendo: sem toasts/snackbars).

### List Section Item
Item de lista em card (exemplo no Figma em **dark mode**): fundo neutral-950 #22272A, borda 1px neutral-800, raio 16px, padding ~32px.
- Esquerda: checkbox quadrado (raio 8px, borda neutral-700) centralizado na altura.
- Topo do conteúdo: ícone (`+`) **ou** avatar 32–40px.
- Título title-XL semibold (branco) · descrição 1 body-M (neutral-100) · descrição 2 body-S (neutral-300).
- Tag de conteúdo: pílula raio 8px, fundo success-900 translúcido (≈ #1E4038) e texto claro, com ícones `+` opcionais.
- Direita: toggle (trilho escuro, thumb orange-700 #BF340F) + menu kebab `⋮`.
- Em light mode: fundo branco, borda neutral-150, textos neutral-950/700/500 (inferido pela inversão dos neutros).

### Pagination
Seta `‹` · botões numéricos quadrados (~40px, raio 8px, borda neutral-700 no dark / neutral-150 no light) · reticências `…` · página ativa **Filled orange-700** com número bold branco · seta `›`. À direita: "Ir para página" + input curto (mesma altura) + `›`.

### Progress Bar
Título body-S à esquerda e percentual body-S semibold neutral-300/500 à direita (acima da barra ou ao lado dela). Barra h-16, raio total, preenchimento orange-600 #E84910; trilho neutral-100.

### Select
- Rótulo body-XS semibold + asterisco danger-600 acima do campo.
- Campo branco, borda 1px neutral-150, raio 8px (LG ~12px), chevron `⌄` neutral-500 à direita (`⌃` aberto). Tamanhos LG/MD/SM/XS ≈ h-44/36/30/24.
- Estados: **Active** borda orange-600; **Disable** texto e chevron neutral-300; **Error** borda + texto danger-700 e "Error Mensage" body-XXS danger-700 abaixo.
- Lista: card branco, borda neutral-150, raio 8px, colado ao campo; cada opção com rádio circular neutral-300 à esquerda; hover com fundo orange-50 e rádio com borda orange-600.

### Snackbar
> **No protótipo não se usa** (regra do projeto: sem toasts/snackbars). Documentado para fidelidade ao DS.

Card branco com glass (borda branca translúcida ~4px, sombra suave), raio 16px, com **brilho radial da cor do tipo** vindo da esquerda (danger-50, success-50, orange-50, blue-50).
- Ícone circular preenchido 24px (erro danger-600 ✕, sucesso success-700 ✓, aviso orange-700 !, info blue-600 i) dentro de halo claro.
- Título body-M semibold #22272A + mensagem body-S neutral-800.
- Ação "Text Button" (Subtle neutro, semibold) + `×` para fechar.
- Layouts: horizontal (ação e fechar à direita) ou empilhado (ação abaixo do texto).
- Comportamento no Figma: temporário, some sozinho após alguns segundos.

### Tags
Etiquetas para status, categorias e filtros. Raio 8px, altura ~28px (LG) / 24px, padding 12–16px, texto body-S regular **neutral-800 #3D4448** (o texto não muda de cor — só o fundo), ícones `+` opcionais nas pontas.

| Cor | Suave (padrão) | Forte (hover/selecionada) |
|---|---|---|
| Verde (ex.: "Novo", "Em dia") | ≈ #E3F5EE | ≈ #C8EEDF |
| Azul (ex.: "Certificação") | ≈ #E3F0FD | ≈ #CFE4FB |
| Laranja (atenção) | ≈ #FDF0E6 | ≈ #FDE0C8 |
| Vermelho (ex.: "Esgotado", "Evadido") | ≈ #FBE6E5 | ≈ #F7D2D1 |
| Cinza (neutro) | ≈ #F2F2F2 | ≈ #E6E6E6 |
| Outline | branco, borda 1.5px neutral-800 | fundo neutral-100 |

Uso no protótipo: o `Badge` aplica o tom sozinho pelo texto do status (`data-tone`, mapa em `src/components/ui/badge.tsx`): verde = Vigente/Ativo/Aceita/Em dia/Em andamento · azul = A iniciar/Aceita pelo contratante · laranja = Em análise/Em risco · vermelho = Recusada/Evadido · cinza = Em elaboração/Encerrado/Finalizada/Inativo. Identificadores continuam em `font-mono` no azul suave.

### Textfield · Text Input · Search · Text Area · Password
Mesmo padrão de campo do Select.
- Rótulo body-S semibold #22272A + asterisco danger-600.
- Campo branco, borda 1px neutral-150, raio 8px (LG ~12px). Tamanhos LG/MD/SM/XS ≈ h-56/48/40/32.
- Estados: **Focus** e **Typing** borda orange-600 (focus um tom mais escuro, orange-700); **Disable** fundo neutral-100, texto e ícone neutral-300; **Error** borda danger-600 + "Error Mensage" body-XS danger-600 abaixo.
- Password: pontos `•••••••` e ícone de olho neutral-800 à direita para mostrar/ocultar.
- **Text Input**: estados Default · Focus (borda orange-700) · Active (borda orange-600) · Typing (borda orange-400) · Disable · Error (ícone ⓘ danger à direita) · **Success** (borda success-700 + ícone ✓ verde à direita). Ícone de ação opcional à direita (`+`).
- **Search**: mesmo campo com lupa neutral-600 à direita; estados Default · Active · Typing · Disable.
- **Text Area**: campo alto (~3 linhas, placeholder no topo), mesmos estados; contador abaixo em body-XXS neutral-600 ("Você pode usar até 000 caracteres"); erro substitui o contador.

### Demais páginas do Figma (não detalhadas ainda)
Breadcrumbs, Number button, Chat, Checkbox + Radio, Empty State, Filter, Footer, Guided Tour, Header, Highlight Term Tooltip, Icons, Logo SENAI, Modal, Outline Item, Rich Text Editor, Scroll Bars, Section Header, Segmented, Slider Dots, Skeleton, Stepper, Tab, Table, Time Picker, Toggle, Tooltip, Upload file modal.

## Mapeamento para os tokens do projeto (shadcn)
| Token shadcn | Valor SENAI |
|---|---|
| `--primary` | orange-600 #E84910 (hover orange-500 #F5631A, click orange-700 #BF340F) |
| `--primary-foreground` | #FFFFFF |
| `--foreground` | neutral-950 #22272A |
| `--muted-foreground` | neutral-500 #617379 |
| `--secondary` | **azul SENAI**: fundo blue-50 #EEF7FF, texto blue-900 #164194 |
| `--muted` | neutral-100 #F5F5F5 |
| `--accent` | orange-50 #FFF6ED (texto orange-700) |
| `--border` / `--input` | neutral-150 #E4E8E9 |
| `--ring` | orange-400 #F8833F |
| `--destructive` | danger-600 #E31A1A (não usar em excluir) |
| `--radius` | 0.5rem (8px); cards `rounded-2xl` (16px) |
| fonte | Open Sans |
