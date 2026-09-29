import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, LayoutList, Maximize2, Minimize2, Search, SlidersHorizontal, Table2, X, type LucideIcon } from 'lucide-react'
import { Popover } from '@base-ui/react/popover'
import { useLocation } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { useSheetLateralAberta } from '@/components/ui/sheet'
import { useSidebarOpcional } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { EmptyState } from './empty-state'

// Padrão de tabela do projeto: busca por texto + filtro por coluna + contador + "limpar filtros".
//
//   <DataTable rows={contratos} columns={[
//     { header: 'Contrato', value: (c) => c.numero, search: true },
//     { header: 'Status', value: (c) => c.status, filter: true, cell: (c) => <Badge>{c.status}</Badge> },
//   ]} />
//
// value: texto da coluna (usado na busca, no filtro e como célula padrão).
// search: entra na busca por texto. Todos os filtros ficam dentro do botão Filtros (popover); fora dele, só a busca e
// as etiquetas dos filtros aplicados (removíveis). filter: true = aparece no topo da lista de filtros.
// Toda coluna com cabeçalho pode virar filtro pelo botão "Filtros" (gestão de filtros).
// filters (prop): filtros extras, sem coluna visível, que aceitam vários valores por linha (ex.: estados de um edital).
export type FilterDef<T> = { label: string; values: (row: T) => string[] }

export type Column<T> = {
  header: string
  value: (row: T) => string | number
  cell?: (row: T) => ReactNode
  search?: boolean
  filter?: boolean
  className?: string
  quebra?: boolean // texto longo: largura limitada e quebra de linha (célula e cabeçalho)
  align?: 'left' | 'center' // padrão: centralizado em colunas de versão e numéricas; o resto à esquerda
}

// Coluna centralizada: versão ou conteúdo numérico (número, valor, %); vazio e "—" não contam.
const ehNumerico = (v: string | number) => typeof v === 'number' || /^(R\$\s?)?-?\d[\d.,]*\s?%?$/.test(v)
const centraliza = <T,>(c: Column<T>, rows: T[]) => {
  if (c.align) return c.align === 'center'
  if (/vers[ãa]o/i.test(c.header)) return true
  const vs = rows.map((r) => c.value(r)).filter((v) => v !== '' && v !== '—')
  return vs.length > 0 && vs.every(ehNumerico)
}
const QUEBRA = 'min-w-40 max-w-64 whitespace-normal'
// Colunas de nome de curso/produto (texto longo): largura limitada e texto quebrando linha.
const colunaLonga = (header: string) => /^(Cursos?|Produtos?)$/i.test(header) ? 'max-w-64 min-w-48 whitespace-normal' : ''
// Filtro com vários valores (campo de busca): valores juntados por SEP no mesmo texto do filtro.
const SEP = '\u001f'
const partes = (v: string) => v.split(SEP).filter(Boolean)
// Filtros de DR/estado/nomes (muitos valores possíveis) viram campo de busca com vários escolhidos; os demais, pílulas/select.
const ehBusca = (label: string, n: number) => n > 10 || /\b(DRs?|CTMs?|Estados?|UF|Contratante|Ofertante|Destinat[aá]ri[oa]s?|Nome|Empresa|Escolas?|Tutor|Cidade|Alunos?|Usu[aá]rios?|Respons[aá]vel|Pessoa|Cursos?|Produtos?|UCs?|Unidades?|Turmas?|Modalidades?|[AÁ]reas?( tecnol[oó]gicas?)?)\b/i.test(label)

// Campo de busca com resultados logo abaixo; escolhidos viram etiquetas (como o EstadosInput).
function FiltroBusca({ opts, valor, set }: { opts: string[]; valor: string; set: (v: string) => void }) {
  const [t, setT] = useState('')
  const sel = partes(valor)
  const achados = t.trim() ? opts.filter((o) => !sel.includes(o) && norm(o).includes(norm(t.trim()))).slice(0, 8) : []
  const por = (v: string[]) => set(v.join(SEP))
  return (
    <div className="space-y-1.5">
      {sel.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {sel.map((o) => (
            <span key={o} className="inline-flex items-center gap-1 rounded-full border border-primary bg-accent py-0.5 pr-1 pl-2.5 text-xs font-medium text-accent-foreground">
              {o}
              <button type="button" aria-label={`Remover ${o}`} className="rounded-full p-0.5 hover:bg-foreground/10" onClick={() => por(sel.filter((x) => x !== o))}><X className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-8 pl-8 text-xs" placeholder={`Buscar (${opts.length} opções)…`} value={t} onChange={(e) => setT(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && achados[0]) (por([...sel, achados[0]]), setT('')) }} />
      </div>
      {achados.length > 0 && (
        <div className="overflow-hidden rounded-lg border bg-card">
          {achados.map((o) => (
            <button key={o} type="button" className="block w-full px-3 py-1.5 text-left text-xs hover:bg-muted" onClick={() => (por([...sel, o]), setT(''))}>{o}</button>
          ))}
        </div>
      )}
      {t.trim() && !achados.length && <p className="px-1 text-xs text-muted-foreground">Nada encontrado.</p>}
    </div>
  )
}
// Filtro de data: coluna em que todos os valores são datas (dd/mm/aaaa ou aaaa-mm-dd) vira intervalo De/Até com campos de data.
// Valor guardado como "DATA:<de>|<até>" (ISO; lados vazios = sem limite).
const DATA = 'DATA:'
const iso = (v: string) => { const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})/); return m ? `${m[3]}-${m[2]}-${m[1]}` : /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : '' }
const ehData = (opts: string[]) => { const d = opts.filter((o) => o && o !== '—'); return d.length > 0 && d.every((o) => iso(o)) }
const br = (v: string) => v.split('-').reverse().join('/')
const intervalo = (v: string) => { const [de = '', ate = ''] = v.slice(DATA.length).split('|'); return { de, ate } }
// Filtro de valor (coluna só com valores em R$): barra de ajuste com mínimo e máximo. Guardado como "VALOR:<min>|<max>".
const VALOR = 'VALOR:'
const reais = (v: string) => { const m = v.match(/^R\$\s?(-?[\d.]+(?:,\d{1,2})?)$/); return m ? Number(m[1].replace(/\./g, '').replace(',', '.')) : NaN }
const ehValor = (opts: string[]) => { const d = opts.filter((o) => o && o !== '—'); return d.length > 1 && d.every((o) => !Number.isNaN(reais(o))) }
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const faixa = (v: string) => { const [a, b] = v.slice(VALOR.length).split('|').map(Number); return { min: a, max: b } }
// Códigos/identificadores (nº de proposta, TAA, turma, edital…): sempre busca com vários escolhidos, nunca pílulas.
const ehCodigo = (opts: string[]) => { const d = opts.filter((o) => o && o !== '—'); return d.length > 0 && d.every((o) => /\d/.test(o) && /[/-]/.test(o) && !iso(o)) }
const textoFiltro = (v: string) => {
  if (v.startsWith(VALOR)) { const { min, max } = faixa(v); return `${brl(min)} a ${brl(max)}` }
  if (!v.startsWith(DATA)) return partes(v).join(', ')
  const { de, ate } = intervalo(v)
  return de && ate ? `${br(de)} a ${br(ate)}` : de ? `a partir de ${br(de)}` : `até ${br(ate)}`
}
const casa = (filtro: string, valores: string[]) => {
  if (filtro.startsWith(VALOR)) { const { min, max } = faixa(filtro); return valores.some((v) => { const n = reais(v); return n >= min && n <= max }) }
  if (!filtro.startsWith(DATA)) return partes(filtro).some((v) => valores.includes(v))
  const { de, ate } = intervalo(filtro)
  return valores.some((v) => { const d = iso(v); return !!d && (!de || d >= de) && (!ate || d <= ate) })
}

// Barra de ajuste com dois pontos (mínimo e máximo), entre o menor e o maior valor da coluna.
function FiltroValor({ opts, valor, set }: { opts: string[]; valor: string; set: (v: string) => void }) {
  const ns = opts.map(reais).filter((n) => !Number.isNaN(n))
  const lo = Math.min(...ns), hi = Math.max(...ns)
  const passo = Math.max(1, Math.round((hi - lo) / 100))
  const { min, max } = valor.startsWith(VALOR) ? faixa(valor) : { min: lo, max: hi }
  const por = (a: number, b: number) => set(a <= lo && b >= hi ? '' : `${VALOR}${Math.min(a, b)}|${Math.max(a, b)}`)
  const pct = (n: number) => (hi === lo ? 0 : ((n - lo) / (hi - lo)) * 100)
  const trilho = 'pointer-events-none absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-white'
  return (
    <div className="space-y-2">
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-2 h-1 rounded-full bg-muted" />
        <div className="absolute top-2 h-1 rounded-full bg-primary" style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }} />
        <input type="range" aria-label="Valor mínimo" min={lo} max={hi} step={passo} value={min} onChange={(e) => por(Math.min(Number(e.target.value), max), max)} className={trilho} />
        <input type="range" aria-label="Valor máximo" min={lo} max={hi} step={passo} value={max} onChange={(e) => por(min, Math.max(Number(e.target.value), min))} className={trilho} />
      </div>
      <div className="flex justify-between text-xs tabular-nums text-muted-foreground"><span>{brl(min)}</span><span>{brl(max)}</span></div>
    </div>
  )
}

function FiltroData({ valor, set }: { valor: string; set: (v: string) => void }) {
  const { de, ate } = valor.startsWith(DATA) ? intervalo(valor) : { de: '', ate: '' }
  const por = (d: string, a: string) => set(d || a ? `${DATA}${d}|${a}` : '')
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="grid gap-1 text-xs text-muted-foreground">De<Input type="date" className="h-8 text-xs" value={de} onChange={(e) => por(e.target.value, ate)} /></label>
      <label className="grid gap-1 text-xs text-muted-foreground">Até<Input type="date" className="h-8 text-xs" value={ate} onChange={(e) => por(de, e.target.value)} /></label>
    </div>
  )
}
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchPlaceholder = 'Buscar…',
  onRowClick,
  actions,
  filters: extra = [],
  cards = false,
}: {
  rows: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  actions?: (row: T) => ReactNode // botões na última coluna (use RowAction)
  filters?: FilterDef<T>[]
  cards?: boolean // habilita a 2ª visualização em cards (uma linha por registro, sem rolagem horizontal); abre em cards
}) {
  const centro = useMemo(() => columns.map((c) => centraliza(c, rows)), [columns, rows])
  // Linha clicada (ou com ação clicada): fica em foco, como no hover, enquanto o detalhe (sheet lateral) estiver aberto.
  const [foco, setFoco] = useState<string | null>(null)
  const detalheAberto = useSheetLateralAberta()
  // Expandir tabela: só aparece quando a tabela tem rolagem horizontal (muitas colunas); fecha o menu lateral para dar espaço.
  const menu = useSidebarOpcional()
  const areaRef = useRef<HTMLDivElement>(null)
  const barraRef = useRef<HTMLDivElement>(null) // âncora do popover de filtros: ele ocupa a largura da tabela
  const [transborda, setTransborda] = useState(false)
  const [expandindo, setExpandindo] = useState(false)
  const expandida = expandindo && !!menu && !menu.open // se o menu for reaberto por outro caminho, volta ao normal
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Filtros salvos (por tabela, no navegador): nome → combinação de filtros.
  const { pathname } = useLocation()
  const chaveSalvos = `filtros-salvos:${pathname.replace(/\/[^/]*\d[^/]*$/, '')}:${columns.map((c) => c.header).join('|')}`
  const [salvos, setSalvos] = useState<{ nome: string; filtros: Record<string, string> }[]>(() => {
    try { return JSON.parse(localStorage.getItem(chaveSalvos) ?? '[]') } catch { return [] }
  })
  const [nomeSalvo, setNomeSalvo] = useState('')
  const gravar = (v: typeof salvos) => {
    setSalvos(v)
    try { localStorage.setItem(chaveSalvos, JSON.stringify(v)) } catch { /* sem armazenamento */ }
  }
  const salvarAtual = () => {
    const nome = nomeSalvo.trim() || `Filtro ${salvos.length + 1}`
    gravar([...salvos.filter((x) => x.nome !== nome), { nome, filtros: Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }])
    setNomeSalvo('')
  }
  const igual = (f: Record<string, string>) => JSON.stringify(f) === JSON.stringify(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)))

  // Todos os filtros possíveis (colunas com cabeçalho + extras); os marcados aparecem na barra.
  const all: FilterDef<T>[] = useMemo(
    () => [...[...columns.filter((c) => c.header)].sort((x, y) => Number(!!y.filter) - Number(!!x.filter)).map((c) => ({ label: c.header, values: (r: T) => [String(c.value(r))] })), ...extra],
    [columns, extra],
  )
  const defs = all
  const options = useMemo(
    () => Object.fromEntries(defs.map((d) => [d.label, [...new Set(rows.flatMap(d.values))].sort()])),
    [rows, defs],
  )

  const visible = useMemo(() => {
    const t = norm(q.trim())
    return rows.filter(
      (r) =>
        (!t || columns.some((c) => c.search && norm(String(c.value(r))).includes(t))) &&
        defs.every((d) => !filters[d.label] || casa(filters[d.label], d.values(r))),
    )
  }, [rows, columns, defs, q, filters])

  // Paginação: 10 por página; volta à 1ª página quando busca/filtros mudam.
  // Visualização (tabela ou cards), lembrada por tela no navegador.
  const chaveVisao = `visao:${pathname.replace(/\/[^/]*\d[^/]*$/, '')}`
  const [visao, setVisaoState] = useState<'tabela' | 'cards'>(() => { try { return (localStorage.getItem(chaveVisao) as 'tabela' | 'cards') || 'cards' } catch { return 'cards' } })
  const setVisao = (v: 'tabela' | 'cards') => { setVisaoState(v); try { localStorage.setItem(chaveVisao, v) } catch { /* sem armazenamento */ } }
  const emCards = cards && visao === 'cards'
  const [pagina, setPagina] = useState(1)
  const porPagina = 10
  const totalPag = Math.max(1, Math.ceil(visible.length / porPagina))
  const pag = Math.min(pagina, totalPag)
  const daPagina = visible.slice((pag - 1) * porPagina, pag * porPagina)
  useEffect(() => setPagina(1), [q, filters])

  const nAtivos = Object.values(filters).filter(Boolean).length
  const active = q !== '' || nAtivos > 0
  const hasSearch = columns.some((c) => c.search)
  const semLinhas = visible.length === 0
  useEffect(() => {
    const c = areaRef.current?.querySelector('[data-slot="table-container"]')
    if (!c) { setTransborda(false); return }
    const medir = () => setTransborda(c.scrollWidth > c.clientWidth + 1)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(c)
    const t = c.querySelector('table')
    if (t) ro.observe(t)
    return () => ro.disconnect()
  }, [emCards, semLinhas])
  const alternarExpandir = () => {
    if (!menu) return
    menu.setOpen(expandida)
    setExpandindo(!expandida)
  }
  return (
    <div data-slot="data-table" className="overflow-hidden rounded-lg border bg-card">
      <div ref={barraRef} className="flex flex-wrap items-center gap-2 border-b p-3">
        {hasSearch && (
          <div className="relative w-96">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder={searchPlaceholder} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        )}
        {cards && (
          <div className="order-last ml-auto flex rounded-lg border p-0.5">
            {([['cards', LayoutList, 'Cards'], ['tabela', Table2, 'Tabela']] as const).map(([v, Icone, rot]) => (
              <button key={v} type="button" aria-pressed={visao === v} title={`Ver em ${rot.toLowerCase()}`} onClick={() => setVisao(v)}
                className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground', visao === v ? 'bg-accent text-accent-foreground' : 'hover:bg-muted')}>
                <Icone className="size-3.5" /> {rot}
              </button>
            ))}
          </div>
        )}
        {all.length > 0 && (
          <Popover.Root>
            <Popover.Trigger render={<Button variant="outline" />}>
              <SlidersHorizontal /> Filtros{nAtivos > 0 && <span className="text-muted-foreground tabular-nums">({nAtivos})</span>}
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner anchor={barraRef} align="start" side="bottom" sideOffset={0} className="z-50">
                <Popover.Popup className="w-[var(--anchor-width)] overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-lg outline-none">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <SlidersHorizontal className="size-4 text-muted-foreground" /> Filtros
                      {nAtivos > 0 && <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums">{nAtivos}</span>}
                    </span>
                    <button type="button" disabled={!nAtivos} onClick={() => setFilters({})} className="text-xs font-medium text-primary disabled:text-muted-foreground/60">
                      Limpar
                    </button>
                  </div>
                  <div className="max-h-[60vh] space-y-5 overflow-y-auto p-4">
                    {salvos.length > 0 && (
                      <div className="space-y-2 border-b pb-4">
                        <span className="text-xs font-semibold text-muted-foreground">Filtros salvos</span>
                        <div className="flex flex-wrap gap-1.5">
                          {salvos.map((f) => (
                            <span key={f.nome} className={cn('inline-flex items-center gap-1 rounded-full border py-1 pr-1 pl-3 text-xs', igual(f.filtros) && 'border-primary bg-accent font-semibold text-accent-foreground')}>
                              <button type="button" onClick={() => setFilters(f.filtros)}>★ {f.nome}</button>
                              <button type="button" aria-label={`Apagar filtro ${f.nome}`} onClick={() => gravar(salvos.filter((x) => x.nome !== f.nome))} className="rounded-full p-0.5 text-muted-foreground hover:bg-muted">
                                <X className="size-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Filtros em 4 colunas separadas por linhas verticais */}
                    <div className="grid grid-cols-4 [&>*]:border-l [&>*]:px-5 [&>*]:py-2.5 [&>*:nth-child(4n+1)]:border-l-0 [&>*:nth-child(4n+1)]:pl-0 [&>*:nth-child(4n)]:pr-0">
                    {all.map((d) => {
                      const opts = options[d.label]
                      const atual = filters[d.label] || ''
                      const set = (v: string) => setFilters({ ...filters, [d.label]: v })
                      return (
                        <div key={d.label} className="space-y-2">
                          <span className="text-xs font-semibold text-foreground">{d.label}</span>
                          {ehData(opts) ? (
                            <FiltroData valor={atual} set={set} />
                          ) : ehValor(opts) ? (
                            <FiltroValor opts={opts} valor={atual} set={set} />
                          ) : ehBusca(d.label, opts.length) || ehCodigo(opts) ? (
                            <FiltroBusca opts={opts} valor={atual} set={set} />
                          ) : (
                            // Pílulas com seleção múltipla (clicar de novo desmarca).
                            <div className="flex flex-wrap gap-1.5">
                              {opts.map((o) => {
                                const marcado = partes(atual).includes(o)
                                const alternar = () => set((marcado ? partes(atual).filter((x) => x !== o) : [...partes(atual), o]).join(SEP))
                                return (
                                  <button
                                    key={o}
                                    type="button"
                                    aria-pressed={marcado}
                                    onClick={alternar}
                                    className={cn(
                                      'rounded-full border px-3 py-1 text-xs transition-colors',
                                      marcado ? 'border-primary bg-accent font-semibold text-accent-foreground' : 'hover:bg-muted',
                                    )}
                                  >
                                    {o}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    </div>
                  </div>
                  {nAtivos > 0 && (
                    <div className="flex items-center gap-2 border-t bg-muted/40 px-4 py-3">
                      <Input value={nomeSalvo} onChange={(e) => setNomeSalvo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && salvarAtual()} placeholder="Nome do filtro (ex.: Em risco Panvel)" className="h-8 bg-card text-xs" />
                      <Button size="sm" onClick={salvarAtual}>Salvar filtro</Button>
                    </div>
                  )}
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        )}
        {menu && (transborda || expandida) && !emCards && (
          // Ativo (tabela expandida, menu fechado): botão na cor principal. Sem o seletor Cards/Tabela, ele encosta na direita.
          <Button type="button" variant={expandida ? 'default' : 'outline'} className={cn('order-last', !cards && 'ml-auto')} aria-pressed={expandida} title={expandida ? 'Recolher tabela (reabre o menu lateral)' : 'Expandir tabela (fecha o menu lateral)'} onClick={alternarExpandir}>
            {expandida ? <><Minimize2 /> Recolher tabela</> : <><Maximize2 /> Expandir tabela</>}
          </Button>
        )}
      </div>
      {/* Filtros aplicados: sempre numa linha abaixo da barra, em etiquetas cinza */}
      {active && (
        <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/30 px-3 py-2">
          {Object.entries(filters)
            .filter(([, v]) => v)
            .map(([label, v]) => (
              <span key={label} className="inline-flex items-center gap-1 rounded-lg bg-[#EEF0F1] py-1 pr-1 pl-2.5 text-xs text-[#3D4448]">
                <span className="text-muted-foreground">{label}:</span> <span className="font-medium">{textoFiltro(v)}</span>
                <button type="button" aria-label={`Remover filtro ${label}`} className="rounded p-0.5 hover:bg-foreground/10" onClick={() => setFilters(({ [label]: _, ...rest }) => rest)}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
          <button type="button" onClick={() => (setQ(''), setFilters({}))} className="ml-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            Limpar tudo
          </button>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="p-6"><EmptyState title="Nenhum resultado" description="Ajuste a busca ou os filtros." /></div>
      ) : (
        <div ref={areaRef}>
          {emCards ? (
            // Cards: 1ª e 2ª colunas no cabeçalho (título e situação), ações à direita; demais colunas em grade de rótulo/valor.
            <div className="space-y-2 p-3">
              {daPagina.map((r) => (
                <div key={r.id} className={cn('rounded-[1.25rem] border bg-card p-4', onRowClick && 'cursor-pointer hover:border-foreground/20', detalheAberto && foco === r.id && 'border-foreground/20')} onClickCapture={() => setFoco(r.id)} onClick={onRowClick && (() => onRowClick(r))}>
                  <div className="flex items-center gap-3">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 font-semibold">
                      {columns.slice(0, 2).map((c) => <span key={c.header}>{c.cell ? c.cell(r) : c.value(r)}</span>)}
                    </div>
                    {actions && <div data-acoes className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>{actions(r)}</div>}
                  </div>
                  <dl className="mt-3 grid grid-cols-4 gap-x-6 gap-y-3">
                    {columns.slice(2).map((c) => (
                      <div key={c.header} className="min-w-0">
                        <dt className="text-xs text-muted-foreground">{c.header}</dt>
                        <dd className="truncate text-sm">{c.cell ? c.cell(r) : c.value(r)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c, i) => (
                  <TableHead key={c.header} className={cn(c.className, centro[i] && 'text-center', c.quebra && QUEBRA)}>
                    {c.header}
                  </TableHead>
                ))}
                {actions && <TableHead className="sticky right-0 z-10 w-px bg-muted text-center shadow-[-8px_0_8px_-8px_rgb(0_0_0/0.15)]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {daPagina.map((r) => (
                <TableRow
                  key={r.id}
                  className={cn(onRowClick && 'cursor-pointer', detalheAberto && foco === r.id && 'bg-muted/50')}
                  data-foco={detalheAberto && foco === r.id ? '' : undefined}
                  onClickCapture={() => setFoco(r.id)}
                  onClick={onRowClick && (() => onRowClick(r))}
                >
                  {columns.map((c, i) => (
                    <TableCell key={c.header} className={cn(colunaLonga(c.header), c.className, centro[i] && 'text-center', c.quebra && QUEBRA)}>
                      {c.cell ? c.cell(r) : c.value(r)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="sticky right-0 z-10 w-px bg-background shadow-[-8px_0_8px_-8px_rgb(0_0_0/0.15)]" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-0.5">{actions(r)}</div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
          <Paginador pagina={pag} total={totalPag} de={(pag - 1) * porPagina + 1} ate={Math.min(pag * porPagina, visible.length)} n={visible.length} ir={setPagina} />
        </div>
      )}
    </div>
  )
}

// Paginador (DS SENAI: setas, números com reticências, página ativa preenchida).
function Paginador({ pagina, total, de, ate, n, ir }: { pagina: number; total: number; de: number; ate: number; n: number; ir: (p: number) => void }) {
  const nums: (number | '…')[] = []
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - pagina) <= 1) nums.push(p)
    else if (nums.at(-1) !== '…') nums.push('…')
  }
  const btn = 'flex size-8 items-center justify-center rounded-lg text-sm tabular-nums transition-colors'
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2.5">
      <span className="text-xs text-muted-foreground tabular-nums">Mostrando {de}–{ate} de {n}</span>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Página anterior" disabled={pagina === 1} onClick={() => ir(pagina - 1)} className={cn(btn, 'text-muted-foreground hover:bg-muted disabled:opacity-40')}>
          <ChevronLeft className="size-4" />
        </button>
        {nums.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1 text-sm text-muted-foreground">…</span>
          ) : (
            <button key={p} type="button" onClick={() => ir(p)} className={cn(btn, p === pagina ? 'bg-primary font-semibold text-primary-foreground' : 'border hover:bg-muted')}>
              {p}
            </button>
          ),
        )}
        <button type="button" aria-label="Próxima página" disabled={pagina === total} onClick={() => ir(pagina + 1)} className={cn(btn, 'text-muted-foreground hover:bg-muted disabled:opacity-40')}>
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

/** Botão de ação de linha: ícone com tooltip. */
// Ação de clique dentro de uma célula (fora da coluna Ações): 3º nível — outline neutro, menos destaque que as Ações.
export const cellButton = 'h-6 border-neutral-300 bg-white px-2 text-xs font-normal text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
// icone: só ícone (ex.: Info para "Detalhes"), logo após o texto da célula; label vira tooltip/aria-label.
export function CellButton({ onClick, children, className, icone, label }: { onClick: () => void; children: ReactNode; className?: string; icone?: boolean; label?: string }) {
  return (
    <Button type="button" size={icone ? 'icon-xs' : 'xs'} variant="outline" aria-label={label} title={label} className={cn(cellButton, icone && 'size-6 px-0', className)} onClick={(e) => (e.stopPropagation(), onClick())}>
      {children}
    </Button>
  )
}

export function RowAction({
  label,
  icon: Icon,
  onClick,
  disabled,
  motivo,
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
  destructive?: boolean // mantido por compatibilidade; sem cor vermelha (padrão do projeto)
  disabled?: boolean
  motivo?: string // por que está desabilitado (mostrado no tooltip)
}) {
  const botao = (
    <Button
      size="icon-sm"
      variant="outline"
      className="text-primary"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      semTooltip
    >
      <Icon />
    </Button>
  )
  return (
    <Tooltip>
      {/* Botão desabilitado não recebe o mouse: o tooltip fica num invólucro para ainda mostrar o motivo */}
      {disabled ? (
        <TooltipTrigger render={<span tabIndex={0} className="inline-flex cursor-not-allowed" />}>{botao}</TooltipTrigger>
      ) : (
        <TooltipTrigger
          render={<Button size="icon-sm" variant="outline" className="text-primary" aria-label={label} onClick={onClick} />}
        >
          <Icon />
        </TooltipTrigger>
      )}
      <TooltipContent>{disabled && motivo ? motivo : label}</TooltipContent>
    </Tooltip>
  )
}
