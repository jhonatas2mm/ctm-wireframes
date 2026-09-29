import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Maximize, Maximize2, Minimize, Minus, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/wf'
import { arestas, fases, nos, pools, raias, type No } from '@/lib/processo'
import { cn } from '@/lib/utils'

// Geometria do diagrama (px, antes do zoom).
const COL = 150
const RAIA = 104
const TOPO = 40 // faixa das fases
const POOL_W = 30
const RAIA_W = 132
const ESQ = POOL_W + RAIA_W
const TAREFA = { w: 126, h: 58 }
const cols = Math.max(...nos.map((n) => n.col)) + 1
const LARG = cols * COL + 20
const ALT = TOPO + raias.length * RAIA

const raiaIdx = (id: string) => raias.findIndex((r) => r.id === id)
const poolDe = (raia: string) => pools.find((p) => p.id === raias.find((r) => r.id === raia)?.pool)!
const cx = (n: No) => n.col * COL + COL / 2 + 10
const cy = (n: No) => TOPO + raiaIdx(n.raia) * RAIA + RAIA / 2
const meia = (n: No) => (n.tipo === 'tarefa' ? TAREFA : n.tipo === 'decisao' || n.tipo === 'paralelo' ? { w: 42, h: 42 } : { w: 34, h: 34 })
const tipoNome: Record<No['tipo'], string> = { inicio: 'Evento de início', fim: 'Evento de fim', tarefa: 'Tarefa', decisao: 'Decisão (exclusiva)', paralelo: 'Paralelo', tempo: 'Evento de tempo / alerta' }

// Quebra o rótulo em linhas de até ~17 caracteres.
function linhas(t: string, max = 17) {
  const out: string[] = []
  for (const p of t.split(' ')) {
    const u = out.at(-1)
    if (u !== undefined && (u + ' ' + p).length <= max) out[out.length - 1] = `${u} ${p}`
    else out.push(p)
  }
  return out
}

// Caminho ortogonal: para frente sai pela direita e entra pela esquerda; para trás (retorno) passa por baixo.
function caminho(a: No, b: No) {
  const [ax, ay, bx, by] = [cx(a), cy(a), cx(b), cy(b)]
  const ma = meia(a)
  const mb = meia(b)
  if (b.col > a.col) {
    const sx = ax + ma.w / 2
    const tx = bx - mb.w / 2
    if (ay === by) return { d: `M${sx},${ay} H${tx}`, lx: (sx + tx) / 2, ly: ay - 7 }
    const mx = tx - 16
    return { d: `M${sx},${ay} H${mx} V${by} H${tx}`, lx: sx + (mx - sx) / 2, ly: ay - 7 }
  }
  if (b.col === a.col) {
    const dir = by > ay ? 1 : -1
    return { d: `M${ax},${ay + (dir * ma.h) / 2} V${by - (dir * mb.h) / 2}`, lx: ax + 6, ly: (ay + by) / 2 }
  }
  const baixo = Math.max(ay, by) + RAIA / 2 - 10
  return { d: `M${ax},${ay + ma.h / 2} V${baixo} H${bx} V${by + mb.h / 2}`, lx: (ax + bx) / 2, ly: baixo - 5 }
}

// Mapa do processo: visão BPMN de ponta a ponta (atores em raias, fases no topo). Clique numa etapa para ver os detalhes
// e abrir a tela correspondente no protótipo.
export default function Processo() {
  const navigate = useNavigate()
  const area = useRef<HTMLDivElement>(null)
  const tela = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(0.8)
  const [sel, setSel] = useState<No | null>(null)
  const [ator, setAtor] = useState('todos')
  // Tela cheia: pede ao navegador; se não for permitido, o mapa cobre a janela toda.
  const [cheia, setCheia] = useState(false)
  const alternarCheia = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else if (cheia) setCheia(false)
    else tela.current?.requestFullscreen().then(() => setCheia(true), () => setCheia(true))
  }
  // Ajustar: na tela cheia encaixa largura e altura; fora dela, só a largura.
  const ajustar = () => {
    const el = area.current
    if (!el) return
    const w = (el.clientWidth - 8) / LARG
    const h = ((el.parentElement?.clientHeight ?? el.clientHeight) - 20) / ALT
    setZoom(Math.max(0.3, Math.min(1.2, cheia ? Math.min(w, h) : w)))
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (sel) setSel(null)
      else if (cheia && !document.fullscreenElement) setCheia(false)
    }
    const onFs = () => setCheia(!!document.fullscreenElement)
    addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onFs)
    return () => (removeEventListener('keydown', onKey), document.removeEventListener('fullscreenchange', onFs))
  }, [sel, cheia])
  // Ao entrar ou sair da tela cheia, reencaixa o diagrama.
  useEffect(() => { requestAnimationFrame(ajustar) }, [cheia]) // eslint-disable-line react-hooks/exhaustive-deps
  const apagado = (n: No) => ator !== 'todos' && n.raia !== ator
  const faixas = fases.map((f) => {
    const cs = nos.filter((n) => n.fase === f.id).map((n) => n.col)
    return { ...f, de: Math.min(...cs), ate: Math.max(...cs) }
  }).filter((f) => Number.isFinite(f.de))
  const porId = Object.fromEntries(nos.map((n) => [n.id, n]))

  return (
    <>
      <PageHeader title="Mapa do processo" />
      <div ref={tela} className={cn(cheia && 'fixed inset-0 z-50 flex flex-col gap-3 bg-background p-3')}>
        <div className={cn('mb-3 flex flex-wrap items-center justify-end gap-2', cheia && 'mb-0')}>
            {cheia && <h1 className="mr-auto text-lg font-semibold">Mapa do processo</h1>}
            <Select value={ator} onValueChange={(v) => setAtor(v as string)}>
              <SelectTrigger className="w-56"><SelectValue>{(v: string) => (v === 'todos' ? 'Todos os atores' : raias.find((r) => r.id === v)?.nome)}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os atores</SelectItem>
                {raias.map((r) => <SelectItem key={r.id} value={r.id}>{poolDe(r.id).nome} · {r.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center rounded-md border">
              <Button size="icon-sm" variant="ghost" aria-label="Diminuir zoom" onClick={() => setZoom((z) => Math.max(0.35, +(z - 0.1).toFixed(2)))}><Minus /></Button>
              <span className="w-12 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
              <Button size="icon-sm" variant="ghost" aria-label="Aumentar zoom" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))}><Plus /></Button>
            </div>
            <Button variant="outline" size="sm" onClick={ajustar}><Maximize2 /> Ajustar</Button>
            <Button variant={cheia ? 'default' : 'outline'} size="sm" onClick={alternarCheia}>{cheia ? <><Minimize /> Sair da tela cheia</> : <><Maximize /> Tela cheia</>}</Button>
        </div>

      <div className={cn('relative flex overflow-hidden rounded-lg border bg-card', cheia && 'min-h-0 flex-1 overflow-auto')}>
        {/* Coluna fixa: pools e raias */}
        <svg width={ESQ * zoom} height={ALT * zoom} viewBox={`0 0 ${ESQ} ${ALT}`} className="shrink-0 border-r">
          <rect x={0} y={0} width={ESQ} height={TOPO} className="fill-muted/60" />
          <text x={10} y={TOPO / 2 + 4} className="fill-muted-foreground text-[11px] font-semibold uppercase">Atores</text>
          {pools.map((p) => {
            const rs = raias.filter((r) => r.pool === p.id)
            const y = TOPO + raiaIdx(rs[0].id) * RAIA
            const h = rs.length * RAIA
            return (
              <g key={p.id}>
                <rect x={0} y={y} width={POOL_W} height={h} fill={p.cor} opacity={0.9} />
                <text transform={`translate(${POOL_W / 2 + 4},${y + h / 2}) rotate(-90)`} textAnchor="middle" className="fill-white text-[11px] font-semibold">{p.nome}</text>
              </g>
            )
          })}
          {raias.map((r, i) => (
            <g key={r.id} className="cursor-pointer" onClick={() => setAtor(ator === r.id ? 'todos' : r.id)}>
              <rect x={POOL_W} y={TOPO + i * RAIA} width={RAIA_W} height={RAIA} fill={poolDe(r.id).cor} opacity={ator === r.id ? 0.22 : 0.08} />
              <line x1={0} x2={ESQ} y1={TOPO + (i + 1) * RAIA} y2={TOPO + (i + 1) * RAIA} className="stroke-border" />
              {linhas(r.nome, 16).map((l, k, arr) => (
                <text key={k} x={POOL_W + 10} y={TOPO + i * RAIA + RAIA / 2 + 4 + (k - (arr.length - 1) / 2) * 14} className="fill-foreground text-[12px] font-medium">{l}</text>
              ))}
              {r.perfil && <text x={POOL_W + 10} y={TOPO + (i + 1) * RAIA - 8} className="fill-muted-foreground text-[9px]">perfil: {r.perfil}</text>}
            </g>
          ))}
        </svg>

        {/* Diagrama (rola na horizontal) */}
        <div ref={area} className="min-w-0 flex-1 overflow-x-auto">
          <svg width={LARG * zoom} height={ALT * zoom} viewBox={`0 0 ${LARG} ${ALT}`} className="block select-none">
            <defs>
              <marker id="seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="fill-foreground/70" /></marker>
              <marker id="seta-aberta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="fill-card stroke-foreground/60" /></marker>
              <marker id="bolinha" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6"><circle cx="5" cy="5" r="4" className="fill-card stroke-foreground/60" /></marker>
            </defs>
            {/* Raias e fases */}
            {raias.map((r, i) => (
              <g key={r.id}>
                <rect x={0} y={TOPO + i * RAIA} width={LARG} height={RAIA} fill={poolDe(r.id).cor} opacity={ator === r.id ? 0.1 : i % 2 ? 0.03 : 0.015} />
                <line x1={0} x2={LARG} y1={TOPO + (i + 1) * RAIA} y2={TOPO + (i + 1) * RAIA} className="stroke-border" />
              </g>
            ))}
            {faixas.map((f, i) => {
              const x = f.de * COL + 10
              const w = (f.ate - f.de + 1) * COL
              return (
                <g key={f.id}>
                  <rect x={x + 2} y={4} width={w - 4} height={TOPO - 8} rx={6} className={i % 2 ? 'fill-muted' : 'fill-muted/60'} />
                  <text x={x + w / 2} y={TOPO / 2 + 4} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">{i + 1}. {f.nome}</text>
                  {i > 0 && <line x1={x} x2={x} y1={TOPO} y2={ALT} className="stroke-border" strokeDasharray="4 4" />}
                </g>
              )
            })}

            {/* Fluxos: sequência (mesmo pool, linha cheia) e mensagem (entre pools, tracejada) */}
            {arestas.map((e, i) => {
              const a = porId[e.de]
              const b = porId[e.para]
              const msg = poolDe(a.raia).id !== poolDe(b.raia).id
              const { d, lx, ly } = caminho(a, b)
              const fraco = apagado(a) && apagado(b)
              return (
                <g key={i} opacity={fraco ? 0.15 : 1}>
                  <path d={d} fill="none" className={msg ? 'stroke-foreground/50' : 'stroke-foreground/70'} strokeWidth={1.4} strokeDasharray={msg ? '6 4' : undefined} markerEnd={`url(#${msg ? 'seta-aberta' : 'seta'})`} markerStart={msg ? 'url(#bolinha)' : undefined} />
                  {e.rotulo && <text x={lx} y={ly} textAnchor="middle" className="fill-muted-foreground text-[10px] italic">{e.rotulo}</text>}
                </g>
              )
            })}

            {/* Etapas */}
            {nos.map((n) => {
              const x = cx(n)
              const y = cy(n)
              const cor = poolDe(n.raia).cor
              const ativo = sel?.id === n.id
              const ls = linhas(n.rotulo)
              return (
                <g key={n.id} className="cursor-pointer" opacity={apagado(n) ? 0.2 : 1} onClick={() => setSel(n)}>
                  {n.tipo === 'tarefa' && (
                    <>
                      <rect x={x - TAREFA.w / 2} y={y - TAREFA.h / 2} width={TAREFA.w} height={TAREFA.h} rx={10} className="fill-card" stroke={cor} strokeWidth={ativo ? 3 : 1.5} strokeDasharray={n.fora ? '5 3' : undefined} />
                      {ls.map((l, k) => <text key={k} x={x} y={y + 4 + (k - (ls.length - 1) / 2) * 13} textAnchor="middle" className="fill-foreground text-[11px] font-medium">{l}</text>)}
                      {n.tela && <circle cx={x + TAREFA.w / 2 - 8} cy={y - TAREFA.h / 2 + 8} r={3.5} fill={cor} />}
                    </>
                  )}
                  {(n.tipo === 'decisao' || n.tipo === 'paralelo') && (
                    <>
                      <rect x={x - 15} y={y - 15} width={30} height={30} transform={`rotate(45 ${x} ${y})`} className="fill-card" stroke={cor} strokeWidth={ativo ? 3 : 1.5} />
                      <text x={x} y={y + 5} textAnchor="middle" className="fill-foreground text-[15px] font-bold">{n.tipo === 'paralelo' ? '+' : '×'}</text>
                    </>
                  )}
                  {(n.tipo === 'inicio' || n.tipo === 'fim' || n.tipo === 'tempo') && (
                    <>
                      <circle cx={x} cy={y} r={16} className="fill-card" stroke={cor} strokeWidth={n.tipo === 'fim' ? 4 : ativo ? 3 : 1.5} />
                      {n.tipo === 'tempo' && (
                        <>
                          <circle cx={x} cy={y} r={12} fill="none" stroke={cor} strokeWidth={1} />
                          <path d={`M${x},${y - 7} V${y} H${x + 5}`} fill="none" stroke={cor} strokeWidth={1.4} />
                        </>
                      )}
                    </>
                  )}
                  {n.tipo !== 'tarefa' && n.rotulo && linhas(n.rotulo, 16).map((l, k) => (
                    <text key={k} x={x} y={y + 32 + k * 12} textAnchor="middle" className="fill-foreground text-[10px]">{l}</text>
                  ))}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Detalhes da etapa */}
        {sel && (
          <aside className="absolute top-3 right-3 w-80 rounded-lg border bg-background p-4 shadow-lg">
            <div className="mb-2 flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{fases.find((f) => f.id === sel.fase)?.nome} · {tipoNome[sel.tipo]}</p>
                <h3 className="font-semibold">{sel.rotulo || tipoNome[sel.tipo]}</h3>
              </div>
              <Button size="icon-sm" variant="ghost" aria-label="Fechar" onClick={() => setSel(null)}><X /></Button>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <Badge variant="outline" style={{ borderColor: poolDe(sel.raia).cor, color: poolDe(sel.raia).cor }}>{poolDe(sel.raia).nome} · {raias.find((r) => r.id === sel.raia)?.nome}</Badge>
              {sel.fora && <Badge variant="secondary">Fora do sistema</Badge>}
            </div>
            {sel.descricao && <p className="text-sm">{sel.descricao}</p>}
            {!!sel.regras?.length && (
              <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {sel.regras.map((r) => <li key={r}>{r}</li>)}
              </ul>
            )}
            {sel.tela && <Button className="mt-4 w-full" onClick={() => navigate(sel.tela!)}><ExternalLink /> Abrir no protótipo</Button>}
          </aside>
        )}
      </div>

      {/* Legenda */}
      <div className={cn('flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground', !cheia && 'mt-4')}>
        <Legenda><svg width="34" height="20"><rect x="1" y="1" width="32" height="18" rx="5" className="fill-card stroke-foreground/60" /></svg> Tarefa no sistema</Legenda>
        <Legenda><svg width="34" height="20"><rect x="1" y="1" width="32" height="18" rx="5" className="fill-card stroke-foreground/60" strokeDasharray="4 2" /></svg> Tarefa fora do sistema</Legenda>
        <Legenda><svg width="20" height="20"><circle cx="10" cy="10" r="8" className="fill-card stroke-foreground/60" /></svg> Início</Legenda>
        <Legenda><svg width="20" height="20"><circle cx="10" cy="10" r="7" className="fill-card stroke-foreground/70" strokeWidth={3} /></svg> Fim</Legenda>
        <Legenda><svg width="20" height="20"><circle cx="10" cy="10" r="8" className="fill-card stroke-foreground/60" /><path d="M10,5 V10 H14" fill="none" className="stroke-foreground/60" /></svg> Prazo / alerta</Legenda>
        <Legenda><svg width="22" height="22"><rect x="5" y="5" width="12" height="12" transform="rotate(45 11 11)" className="fill-card stroke-foreground/60" /></svg> Decisão (×) · Paralelo (+)</Legenda>
        <Legenda><svg width="40" height="10"><path d="M2,5 H36" className="stroke-foreground/70" strokeWidth={1.4} markerEnd="url(#seta)" /></svg> Sequência</Legenda>
        <Legenda><svg width="40" height="10"><path d="M2,5 H36" className="stroke-foreground/50" strokeWidth={1.4} strokeDasharray="5 3" /></svg> Mensagem entre organizações</Legenda>
        <Legenda><svg width="10" height="10"><circle cx="5" cy="5" r="3.5" className="fill-foreground/60" /></svg> Tem tela no protótipo</Legenda>
      </div>
      </div>
    </>
  )
}

function Legenda({ children }: { children: React.ReactNode }) {
  return <span className={cn('inline-flex items-center gap-2')}>{children}</span>
}
