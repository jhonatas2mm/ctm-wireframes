import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type * as React from 'react'
import { CalendarRange, CheckCircle2, Eye, GraduationCap, MonitorSmartphone, TrendingUp, TriangleAlert, UserX, Users } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTable, EmptyState, PageHeader, RowAction, StatCard, type Column } from '@/components/wf'
import {
  HOJE, alertasAluno, dataBr, diasEntre, diasSemAcesso, mediaAluno, progressoEsperado, situacaoAluno, statusTurmaEad,
  useAlunosEad, useContratosCtm, useTurmasEad,
  type AlunoEad, type ContratoCtm, type SituacaoAluno, type TurmaEad, nomeParte,
} from '@/lib/mock'

// Acompanhamento da DR solicitante: contratos com o CTM (operação EAD), turmas e alunos. Somente leitura.
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const periodo = (i: string, f: string) => `${dataBr(i)} a ${dataBr(f)}`
const corSituacao: Record<SituacaoAluno, 'default' | 'secondary' | 'outline'> = { 'Em dia': 'secondary', 'Em risco': 'outline', Evadido: 'default' }

// Escopo dos dados: a DR solicitante vê só a própria DR; o Super admin (e o protótipo livre) vê a plataforma toda.
function useDados() {
  const perfil = useProfile()
  const uf = perfil.startsWith('DR solicitante') ? profileOf(perfil).dr?.sigla.replace('SENAI-', '') : undefined
  const global = !uf
  const contratos = useContratosCtm().all.filter((c) => !uf || c.dr === uf)
  const turmas = useTurmasEad().all.filter((t) => contratos.some((c) => c.id === t.contratoId))
  const alunos = useAlunosEad().all.filter((a) => turmas.some((t) => t.id === a.turmaId))
  const turmaDe = (a: AlunoEad) => turmas.find((t) => t.id === a.turmaId)!
  const contratoDe = (t: TurmaEad) => contratos.find((c) => c.id === t.contratoId)
  const alunosDa = (t: TurmaEad) => alunos.filter((a) => a.turmaId === t.id)
  return { contratos, turmas, alunos, turmaDe, contratoDe, alunosDa, global }
}

const ultimoAcesso = (a: AlunoEad) => {
  if (!a.acessos[0]) return 'Nunca acessou'
  const n = diasSemAcesso(a)
  return n === 0 ? 'Hoje' : n === 1 ? 'Há 1 dia' : `Há ${n} dias`
}

function Barra({ valor, esperado }: { valor: number; esperado?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Progress value={valor} className="w-24 shrink-0" />
      {/* número colado à barra (alinhado à esquerda) */}
      <span className="text-xs whitespace-nowrap tabular-nums text-muted-foreground">{valor}%{esperado !== undefined && ` / ${esperado}%`}</span>
    </div>
  )
}

// ── Colunas reaproveitadas ───────────────────────────────────────────────────
function colunasTurma(d: ReturnType<typeof useDados>): Column<TurmaEad>[] {
  return [
    { header: 'Turma', value: (t) => t.codigo, search: true, cell: (t) => <Badge variant="secondary" className="font-mono">{t.codigo}</Badge> },
    { header: 'Curso', value: (t) => t.curso, search: true },
    ...(d.global ? [{ header: 'DR', value: (t: TurmaEad) => `SENAI-${d.contratoDe(t)?.dr ?? ''}`, filter: true } as Column<TurmaEad>] : []),
    { header: 'Empresa', value: (t) => d.contratoDe(t)?.empresa ?? '—', filter: true },
    { header: 'Alunos', value: (t) => d.alunosDa(t).length, className: 'text-right tabular-nums' },
    { header: 'Em risco', value: (t) => d.alunosDa(t).filter((a) => situacaoAluno(a, t) !== 'Em dia').length, className: 'text-right tabular-nums' },
    { header: 'Execução', value: (t) => `${progressoEsperado(t)}%`, cell: (t) => <Barra valor={progressoEsperado(t)} /> },
    { header: 'Situação', value: (t) => statusTurmaEad(t), filter: true, cell: (t) => <Badge variant="outline">{statusTurmaEad(t)}</Badge> },
  ]
}

function colunasAluno(d: ReturnType<typeof useDados>, comTurma = true): Column<AlunoEad>[] {
  return [
    { header: 'Aluno', value: (a) => a.nome, search: true },
    ...(comTurma ? [{ header: 'Turma', value: (a: AlunoEad) => d.turmaDe(a).codigo, filter: true, search: true, cell: (a: AlunoEad) => <Link to={`/turmas-ead/${a.turmaId}`} onClick={(e) => e.stopPropagation()} className="font-mono text-sm underline underline-offset-4 hover:text-primary">{d.turmaDe(a).codigo}</Link> } as Column<AlunoEad>] : []),
    { header: 'Progresso', value: (a) => `${a.progresso}%`, cell: (a) => <Barra valor={a.progresso} esperado={progressoEsperado(d.turmaDe(a))} /> },
    { header: 'Média', value: (a) => mediaAluno(a).toFixed(1), className: 'text-right tabular-nums' },
    { header: 'Último acesso', value: (a) => ultimoAcesso(a), className: 'tabular-nums text-muted-foreground' },
    { header: 'Situação', value: (a) => situacaoAluno(a, d.turmaDe(a)), filter: true, cell: (a) => <Badge variant={corSituacao[situacaoAluno(a, d.turmaDe(a))]}>{situacaoAluno(a, d.turmaDe(a))}</Badge> },
  ]
}

// Card de turma (Painel e detalhe do contrato): números grandes + execução + ver alunos.
function TurmaCard({ t, d }: { t: TurmaEad; d: ReturnType<typeof useDados> }) {
  const navigate = useNavigate()
  const n = d.alunosDa(t)
  const atencao = n.filter((a) => alertasAluno(a, t).length).length
  const exec = progressoEsperado(t)
  return (
    <div className="flex flex-col gap-4 rounded-[1.25rem] border bg-card p-4">
      <div className="space-y-1.5">
        <div className="line-clamp-2 min-h-10 font-semibold leading-5" title={t.curso}>{t.curso}</div>
        <div className="flex items-center justify-between gap-2">
          <Link to={`/turmas-ead/${t.id}`} className="font-mono text-xs text-muted-foreground hover:underline">{t.codigo}</Link>
          <Badge variant="outline" className="shrink-0">{statusTurmaEad(t)}</Badge>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x rounded-xl bg-muted/60 py-3 text-center">
        <Metrica valor={n.length} rotulo="alunos" />
        <button type="button" disabled={!atencao} onClick={() => navigate(`/turmas-ead/${t.id}?ver=alunos`)} className="enabled:hover:opacity-80">
          <Metrica valor={atencao} rotulo="atenção" destaque={atencao > 0} />
        </button>
        <Metrica valor={`${exec}%`} rotulo="execução" />
      </div>
      <Progress value={exec} />
      <Button variant="ghost" size="sm" className="-mb-1 self-end" onClick={() => navigate(`/turmas-ead/${t.id}?ver=alunos`)}>
        <Users /> Ver alunos
      </Button>
    </div>
  )
}

function Metrica({ valor, rotulo, destaque }: { valor: React.ReactNode; rotulo: string; destaque?: boolean }) {
  return (
    <div className="px-2">
      <div className={cn('text-2xl font-bold tabular-nums', destaque && 'text-[#C23C0D]')}>{valor}</div>
      <div className="text-xs text-muted-foreground">{rotulo}</div>
    </div>
  )
}

// ── Gráficos simples em SVG (sem dependência) ──────────────────────────────
// Curva suave passando pelos pontos (Catmull-Rom → Bézier).
function curva(pts: [number, number][]) {
  if (pts.length < 2) return ''
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`
  }
  return d
}
const pontos = (v: number[], w: number, h: number, max = Math.max(1, ...v), pad = 4): [number, number][] =>
  v.map((y, i) => [(i / Math.max(1, v.length - 1)) * w, pad + (h - 2 * pad) * (1 - y / max)])

function Sparkline({ v, cor }: { v: number[]; cor: string }) {
  const w = 200, h = 56, pts = pontos(v, w, h), id = `sp${cor.slice(1)}`
  const linha = curva(pts)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" preserveAspectRatio="none">
      <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={cor} stopOpacity=".18" /><stop offset="1" stopColor={cor} stopOpacity="0" /></linearGradient></defs>
      <path d={`${linha} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={linha} fill="none" stroke={cor} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function GraficoLinhas({ series, rotulos }: { series: { nome: string; cor: string; v: number[] }[]; rotulos: string[] }) {
  const w = 600, h = 200, max = Math.max(4, ...series.flatMap((s) => s.v))
  const topo = Math.ceil(max / 4) * 4
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-52 w-full" preserveAspectRatio="none">
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="0" x2={w} y1={4 + (i * (h - 8)) / 4} y2={4 + (i * (h - 8)) / 4} stroke="#E4E8E9" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />)}
        {series.map((s) => {
          const pts = pontos(s.v, w, h, topo), linha = curva(pts), id = `gl${s.cor.slice(1)}`
          return (
            <g key={s.nome}>
              <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={s.cor} stopOpacity=".16" /><stop offset="1" stopColor={s.cor} stopOpacity="0" /></linearGradient></defs>
              <path d={`${linha} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
              <path d={linha} fill="none" stroke={s.cor} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            </g>
          )
        })}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        {rotulos.map((r, i) => <span key={i} className={cn(i === rotulos.length - 1 && 'font-semibold text-[#E84910]')}>{r}</span>)}
      </div>
    </div>
  )
}

function Variacao({ pct }: { pct: number }) {
  const sobe = pct >= 0
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold', sobe ? 'bg-[#E3F5EE] text-[#008257]' : 'bg-[#FBE6E5] text-[#C11414]')}>
      {sobe ? '↑' : '↓'} {Math.abs(pct)}%
    </span>
  )
}

// Ícone em caixa arredondada colorida, ao lado de números grandes.
const tons = {
  orange: 'bg-[#FFF6ED] text-[#E84910]', blue: 'bg-[#EEF7FF] text-[#1670FA]', green: 'bg-[#E3F5EE] text-[#008257]',
  red: 'bg-[#FBE6E5] text-[#C11414]', amber: 'bg-[#FDF0E6] text-[#C23C0D]', gray: 'bg-[#F0F1F2] text-[#536167]',
}
export type Tom = keyof typeof tons

const Bloco = ({ className, ...p }: React.ComponentProps<'section'>) => <section className={cn('rounded-[1.25rem] bg-card p-5', className)} {...p} />

// ── Painel ───────────────────────────────────────────────────────────────────
// Dashboard da DR solicitante: filtro por contrato, indicadores com tendência, acessos ao portal,
// turmas com execução e alunos que requerem atenção.
export function Painel() {
  const d = useDados()
  const navigate = useNavigate()
  const [contrato, setContrato] = useState('todos')
  const [aberto, setAberto] = useState<string | null>(null)
  const turmas = d.turmas.filter((t) => d.contratoDe(t)?.status !== 'Em elaboração' && (contrato === 'todos' || t.contratoId === contrato))
  const ativas = turmas.filter((t) => statusTurmaEad(t) === 'Em andamento')
  const alunos = d.alunos.filter((a) => ativas.some((t) => t.id === a.turmaId))
  const atencao = alunos.map((a) => ({ a, m: alertasAluno(a, d.turmaDe(a)) })).filter((x) => x.m.length).sort((x, y) => diasSemAcesso(y.a) - diasSemAcesso(x.a))
  const evadidos = alunos.filter((a) => situacaoAluno(a, d.turmaDe(a)) === 'Evadido').length

  // Acessos por dia (últimos 14 dias) e por portal.
  const dias = Array.from({ length: 14 }, (_, i) => new Date(Date.parse(HOJE) - (13 - i) * 86_400_000).toISOString().slice(0, 10))
  const porDia = (portal?: string) => dias.map((dia) => alunos.reduce((n, a) => n + a.acessos.filter((x) => x.data === dia && (!portal || x.portal === portal)).length, 0))
  const total = porDia(), ava = porDia('AVA'), portal = porDia('Portal do aluno')
  const soma = (v: number[]) => v.reduce((n, x) => n + x, 0)
  const sem7 = soma(total.slice(7)), ant7 = soma(total.slice(0, 7))
  const varAcessos = ant7 ? Math.round(((sem7 - ant7) / ant7) * 100) : 0
  const ativos7 = alunos.filter((a) => diasSemAcesso(a) <= 7).length

  return (
    <div className="space-y-5">
      <PageHeader
        title="Painel"
        actions={
          <Select value={contrato} onValueChange={(v) => setContrato(String(v))}>
            <SelectTrigger className="min-w-56 bg-card">
              <SelectValue>{(v: string) => (v === 'todos' ? (d.global ? 'Todas as DRs e contratos' : 'Todos os contratos') : d.contratos.find((c) => c.id === v)?.empresa)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os contratos</SelectItem>
              {d.contratos.filter((c) => c.status !== 'Em elaboração').map((c) => <SelectItem key={c.id} value={c.id}>{d.global && `SENAI-${c.dr} · `}{c.empresa} · {c.numero}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[2fr_3fr]">
        <div className="grid gap-5">
          <Bloco className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Alunos ativos</span>
              <Button variant="outline" size="sm" render={<Link to="/alunos" />} nativeButton={false}>Ver alunos</Button>
            </div>
            <div className="flex items-center gap-3"><span className="text-3xl font-bold tabular-nums">{alunos.length}</span><span className="text-sm text-muted-foreground">em {ativas.length} turmas</span></div>
            <div className="grid grid-cols-[1fr_auto] items-end gap-4">
              <Sparkline v={total} cor="#E84910" />
              <p className="w-32 text-xs text-muted-foreground"><b className="text-foreground">{ativos7}</b> acessaram o portal nos últimos 7 dias</p>
            </div>
          </Bloco>
          <Bloco className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Requer atenção</span>
              <Button variant="outline" size="sm" render={<Link to="/alunos" />} nativeButton={false}>Ver detalhes</Button>
            </div>
            <div className="flex items-center gap-3"><span className="text-3xl font-bold tabular-nums">{atencao.length}</span><span className="text-sm text-muted-foreground">alunos · {evadidos} evadidos</span></div>
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              <div className="bg-[#00A369]" style={{ width: `${((alunos.length - atencao.length) / Math.max(1, alunos.length)) * 100}%` }} />
              <div className="bg-[#F8833F]" style={{ width: `${((atencao.length - evadidos) / Math.max(1, alunos.length)) * 100}%` }} />
              <div className="bg-[#E31A1A]" style={{ width: `${(evadidos / Math.max(1, alunos.length)) * 100}%` }} />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#00A369]" />Em dia</span>
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#F8833F]" />Em risco</span>
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#E31A1A]" />Evadidos</span>
            </div>
          </Bloco>
        </div>

        <Bloco className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-lg font-bold">Acessos ao portal</div>
              <div className="mt-1 text-xs text-muted-foreground">Últimos 7 dias</div>
              <div className="mt-1 flex items-center gap-3"><span className="text-3xl font-bold tabular-nums">{sem7}</span><Variacao pct={varAcessos} /></div>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-[#E84910]" />AVA</span>
              <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-[#00A369]" />Portal do aluno</span>
            </div>
          </div>
          <GraficoLinhas
            series={[{ nome: 'AVA', cor: '#E84910', v: ava }, { nome: 'Portal do aluno', cor: '#00A369', v: portal }]}
            rotulos={dias.filter((_, i) => i % 2 === 1).map((x) => dataBr(x).slice(0, 5))}
          />
        </Bloco>
      </div>

      <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
        <Bloco>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg font-bold">Turmas</span>
            <Button variant="outline" size="sm" render={<Link to="/turmas-ead" />} nativeButton={false}>Ver todas</Button>
          </div>
          <div className="divide-y">
            {turmas.map((t) => {
              const n = d.alunosDa(t), exec = progressoEsperado(t), risco = n.filter((a) => alertasAluno(a, t).length).length
              return (
                <button key={t.id} type="button" onClick={() => navigate(`/turmas-ead/${t.id}`)} className="grid w-full grid-cols-[1fr_auto] items-center gap-3 py-3.5 text-left sm:grid-cols-[2fr_1fr_1.3fr]">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{t.curso}</div>
                    <div className="truncate text-xs text-muted-foreground">{d.contratoDe(t)?.empresa} · <span className="font-mono">{t.codigo}</span></div>
                  </div>
                  <div className="hidden text-sm sm:block">
                    <div className="text-xs text-muted-foreground">Alunos</div>
                    <div className="font-semibold tabular-nums">{n.length}{risco > 0 && <span className="ml-1.5 text-xs font-medium text-[#C23C0D]">· {risco} atenção</span>}</div>
                  </div>
                  <div className="w-28 sm:w-auto">
                    <div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">{statusTurmaEad(t)}</span><span className="font-semibold tabular-nums">{exec}%</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#E84910]" style={{ width: `${exec}%` }} /></div>
                  </div>
                </button>
              )
            })}
          </div>
        </Bloco>

        <Bloco>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-lg font-bold">Requer atenção</span>
            <Badge variant="secondary" className="tabular-nums">{atencao.length}</Badge>
          </div>
          <div className="max-h-[26rem] space-y-4 overflow-y-auto pr-1">
            {atencao.slice(0, 8).map(({ a, m }) => (
              <button key={a.id} type="button" onClick={() => setAberto(a.id)} className="flex w-full gap-3 text-left">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold">{a.nome}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{ultimoAcesso(a)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{d.turmaDe(a).curso}</div>
                  <div className="rounded-xl bg-muted/70 px-3 py-2 text-sm">{m.join(' · ')}</div>
                </div>
              </button>
            ))}
            {atencao.length === 0 && <EmptyState title="Nenhum aluno requer atenção" />}
          </div>
        </Bloco>
      </div>
      <AlunoSheet aluno={d.alunos.find((a) => a.id === aberto) ?? null} d={d} onClose={() => setAberto(null)} />
    </div>
  )
}

// ── Contratos ────────────────────────────────────────────────────────────────
export function Contratos() {
  const d = useDados()
  const navigate = useNavigate()
  const { id } = useParams()

  const colunas: Column<ContratoCtm>[] = [
    { header: 'Contrato', value: (c) => c.numero, search: true, cell: (c) => <Badge variant="secondary" className="font-mono">{c.numero}</Badge> },
    ...(d.global ? [{ header: 'DR solicitante', value: (c: ContratoCtm) => nomeParte(c.dr), filter: true } as Column<ContratoCtm>] : []),
    { header: 'Empresa', value: (c) => c.empresa, search: true },
    { header: 'Cursos EAD', value: (c) => c.cursos.length, className: 'text-right tabular-nums' },
    { header: 'Turmas', value: (c) => d.turmas.filter((t) => t.contratoId === c.id).length, className: 'text-right tabular-nums' },
    { header: 'Vigência', value: (c) => periodo(c.inicio, c.fim), className: 'tabular-nums text-muted-foreground' },
    { header: 'Valor', value: (c) => brl(c.valor), className: 'text-right tabular-nums' },
    { header: 'Status', value: (c) => c.status, filter: true, cell: (c) => <Badge variant={c.status === 'Vigente' ? 'default' : 'outline'}>{c.status}</Badge> },
  ]
  return (
    <div className="space-y-6">
      <PageHeader title="Gestão de Contratos" />
      <DataTable rows={d.contratos} columns={colunas} searchPlaceholder="Buscar contrato ou empresa…" onRowClick={(c) => navigate(`/contratos/${c.id}`)} actions={(c) => <RowAction label="Visualizar" icon={Eye} onClick={() => navigate(`/contratos/${c.id}`)} />} />
      <Sheet open={!!id} onOpenChange={(o) => !o && navigate('/contratos')}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-5xl">{d.contratos.find((x) => x.id === id) && <ContratoDetalhe c={d.contratos.find((x) => x.id === id)!} d={d} />}</SheetContent>
      </Sheet>
    </div>
  )
}

// Detalhe do contrato em side nav (direita); /contratos/:id = lista com a side nav aberta.
function ContratoDetalhe({ c, d }: { c: ContratoCtm; d: ReturnType<typeof useDados> }) {
  const turmas = d.turmas.filter((t) => t.contratoId === c.id)
  const alunos = turmas.flatMap(d.alunosDa)
  const conta = (x: SituacaoAluno) => alunos.filter((a) => situacaoAluno(a, d.turmaDe(a)) === x).length
  const tempo = Math.max(0, Math.min(100, Math.round((diasEntre(c.inicio, HOJE) / diasEntre(c.inicio, c.fim)) * 100)))
  const Dado = ({ l, v }: { l: string; v: React.ReactNode }) => (
    <div><dt className="text-xs text-muted-foreground">{l}</dt><dd className="font-medium">{v}</dd></div>
  )
  return (
    <>
      <SheetHeader className="border-b">
        <SheetTitle className="flex flex-wrap items-center gap-3 text-xl">
          {c.empresa}
          <Badge variant="secondary" className="font-mono">{c.numero}</Badge>
          <Badge variant={c.status === 'Vigente' ? 'default' : 'outline'}>{c.status}</Badge>
        </SheetTitle>
      </SheetHeader>
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <Dado l="CNPJ" v={c.cnpj} />
          <Dado l="Valor do contrato" v={brl(c.valor)} />
          <Dado l="Contratado" v="CTM · tutoria e monitoria EAD" />
          <Dado l="Cursos EAD" v={<div className="mt-1 flex flex-wrap gap-1">{c.cursos.map((x) => <Badge key={x} variant="outline">{x}</Badge>)}</div>} />
        </dl>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-[1.25rem] border p-4 bg-card">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vigência</span><span className="tabular-nums">{periodo(c.inicio, c.fim)}</span></div>
            <Progress value={tempo} />
            <div className="text-xs text-muted-foreground tabular-nums">{tempo}% do período decorrido</div>
          </div>
          <div className="space-y-2 rounded-[1.25rem] border p-4 bg-card">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vagas ocupadas</span><span className="tabular-nums">{alunos.length} / {c.vagas}</span></div>
            <Progress value={c.vagas ? Math.round((alunos.length / c.vagas) * 100) : 0} />
            <div className="text-xs text-muted-foreground tabular-nums">{c.vagas - alunos.length} vagas disponíveis</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[['Turmas', turmas.length], ['Em dia', conta('Em dia')], ['Em risco', conta('Em risco')], ['Evadidos', conta('Evadido')]].map(([l, v]) => (
            <div key={l} className="rounded-lg bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">{l}</div>
              <div className="text-2xl font-semibold tabular-nums">{v}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Turmas</h3>
          {turmas.length === 0 ? (
            <EmptyState title="Nenhuma turma neste contrato" />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
              {turmas.map((t) => <TurmaCard key={t.id} t={t} d={d} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Turmas ───────────────────────────────────────────────────────────────────
export function Turmas() {
  const d = useDados()
  const navigate = useNavigate()
  const { id } = useParams()
  const t = d.turmas.find((x) => x.id === id)
  if (id) return t ? <TurmaDetalhe t={t} d={d} /> : <EmptyState title="Turma não encontrada" />
  return (
    <div className="space-y-6">
      <PageHeader title="Turmas" />
      <DataTable rows={d.turmas} columns={colunasTurma(d)} searchPlaceholder="Buscar turma ou curso…" onRowClick={(t) => navigate(`/turmas-ead/${t.id}`)} actions={(t) => (<><RowAction label="Visualizar" icon={Eye} onClick={() => navigate(`/turmas-ead/${t.id}`)} /><RowAction label="Ver alunos" icon={Users} onClick={() => navigate(`/turmas-ead/${t.id}?ver=alunos`)} /></>)} />
    </div>
  )
}

function TurmaDetalhe({ t, d }: { t: TurmaEad; d: ReturnType<typeof useDados> }) {
  const [aberto, setAberto] = useState<string | null>(null)
  const [params] = useSearchParams()
  const alunosRef = useRef<HTMLHeadingElement>(null)
  // ?ver=alunos (ação "Ver alunos" na lista de turmas): rola direto para os alunos da turma.
  useEffect(() => {
    if (params.get('ver') === 'alunos') alunosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [params])
  const c = d.contratoDe(t)
  const alunos = d.alunosDa(t)
  const media = (f: (a: AlunoEad) => number) => (alunos.length ? alunos.reduce((s, a) => s + f(a), 0) / alunos.length : 0)
  return (
    <div className="space-y-6">
      <PageHeader title={<span className="flex items-center gap-3">{t.curso} <Badge variant="secondary" className="font-mono">{t.codigo}</Badge></span>} breadcrumb={[{ label: 'Turmas', to: '/turmas-ead' }, { label: t.codigo }]} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarRange} tom="blue" label="Situação" value={statusTurmaEad(t)} hint={periodo(t.inicio, t.fim)} />
        <StatCard icon={TrendingUp} tom="orange" label="Execução do calendário" value={`${progressoEsperado(t)}%`} />
        <StatCard icon={GraduationCap} tom="green" label="Progresso médio dos alunos" value={`${Math.round(media((a) => a.progresso))}%`} />
        <StatCard icon={CheckCircle2} tom="blue" label="Média de notas" value={media(mediaAluno).toFixed(1)} />
      </div>
      <Card>
        <CardContent className="grid gap-2 pt-6 text-sm sm:grid-cols-3">
          <div><span className="text-muted-foreground">Contrato: </span>{c ? <Link className="underline" to={`/contratos/${c.id}`}>{c.numero} · {c.empresa}</Link> : '—'}</div>
          <div><span className="text-muted-foreground">Tutor (CTM): </span>{t.tutor}</div>
          <div><span className="text-muted-foreground">Alunos: </span>{alunos.length}</div>
        </CardContent>
      </Card>
      <h2 ref={alunosRef} className="scroll-mt-4 text-lg font-semibold">Alunos</h2>
      {alunos.length ? (
        <DataTable rows={alunos} columns={colunasAluno(d, false)} searchPlaceholder="Buscar aluno…" onRowClick={(a) => setAberto(a.id)} actions={(a) => <RowAction label="Visualizar" icon={Eye} onClick={() => setAberto(a.id)} />} />
      ) : (
        <EmptyState title="Turma ainda não iniciada" />
      )}
      <AlunoSheet aluno={alunos.find((a) => a.id === aberto) ?? null} d={d} onClose={() => setAberto(null)} />
    </div>
  )
}

// ── Alunos ───────────────────────────────────────────────────────────────────
export function Alunos() {
  const d = useDados()
  const navigate = useNavigate()
  const { id } = useParams()
  const porSituacao = (x: SituacaoAluno) => d.alunos.filter((a) => situacaoAluno(a, d.turmaDe(a)) === x).length
  return (
    <div className="space-y-6">
      <PageHeader title="Alunos" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} tom="blue" label="Alunos" value={String(d.alunos.length)} />
        <StatCard icon={CheckCircle2} tom="green" label="Em dia" value={String(porSituacao('Em dia'))} />
        <StatCard icon={TriangleAlert} tom="amber" label="Em risco" value={String(porSituacao('Em risco'))} />
        <StatCard icon={UserX} tom="red" label="Evadidos" value={String(porSituacao('Evadido'))} />
        <StatCard icon={MonitorSmartphone} tom="gray" label="Sem acesso há mais de 7 dias" value={String(d.alunos.filter((a) => statusTurmaEad(d.turmaDe(a)) !== 'Finalizada' && diasSemAcesso(a) > 7).length)} />
      </div>
      <DataTable
        rows={d.alunos}
        columns={colunasAluno(d)}
        searchPlaceholder="Buscar aluno ou turma…"
        filters={[
          ...(d.global ? [{ label: 'DR', values: (a: AlunoEad) => [`SENAI-${d.contratoDe(d.turmaDe(a))?.dr ?? ''}`] }] : []),
          { label: 'Empresa', values: (a) => [d.contratoDe(d.turmaDe(a))?.empresa ?? '—'] },
        ]}
        onRowClick={(a) => navigate(`/alunos/${a.id}`)}
        actions={(a) => <RowAction label="Visualizar" icon={Eye} onClick={() => navigate(`/alunos/${a.id}`)} />}
      />
      <AlunoSheet aluno={d.alunos.find((x) => x.id === id) ?? null} d={d} onClose={() => navigate('/alunos')} />
    </div>
  )
}

// Detalhe do aluno em side nav (direita), aberta pelo "Visualizar" em qualquer lista de alunos.
function AlunoSheet({ aluno, d, onClose }: { aluno: AlunoEad | null; d: ReturnType<typeof useDados>; onClose: () => void }) {
  return (
    <Sheet open={!!aluno} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-4xl">{aluno && <AlunoDetalhe a={aluno} d={d} />}</SheetContent>
    </Sheet>
  )
}

function AlunoDetalhe({ a, d }: { a: AlunoEad; d: ReturnType<typeof useDados> }) {
  const t = d.turmaDe(a)
  const s = situacaoAluno(a, t)
  const motivos = alertasAluno(a, t)
  return (
    <>
    <SheetHeader className="border-b">
      <SheetTitle className="flex items-center gap-3">{a.nome} <Badge variant={corSituacao[s]}>{s}</Badge></SheetTitle>
    </SheetHeader>
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {motivos.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Requer atenção</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">{motivos.map((m) => <Badge key={m} variant="outline">{m}</Badge>)}</CardContent>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={TrendingUp} tom="orange" label="Progresso" value={`${a.progresso}%`} hint={`Esperado pelo calendário: ${progressoEsperado(t)}%`} />
        <StatCard icon={CheckCircle2} tom="blue" label="Média" value={mediaAluno(a).toFixed(1)} />
        <StatCard icon={MonitorSmartphone} tom="green" label="Último acesso" value={ultimoAcesso(a)} hint={a.acessos[0] ? dataBr(a.acessos[0].data) : undefined} />
        <StatCard icon={GraduationCap} tom="gray" label="Turma" value={t.codigo} hint={t.curso} />
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle>Desempenho</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Atividade</TableHead><TableHead className="text-right">Nota</TableHead></TableRow></TableHeader>
              <TableBody>
                {a.atividades.map((x) => (
                  <TableRow key={x.nome}><TableCell>{x.nome}</TableCell><TableCell className="text-right tabular-nums">{x.nota === null ? <Badge variant="outline">Não entregue</Badge> : x.nota.toFixed(1)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Histórico de acessos</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Portal</TableHead><TableHead className="text-right">Tempo</TableHead></TableRow></TableHeader>
              <TableBody>
                {a.acessos.map((x, i) => (
                  <TableRow key={i}><TableCell className="tabular-nums">{dataBr(x.data)}</TableCell><TableCell>{x.portal}</TableCell><TableCell className="text-right tabular-nums">{x.minutos} min</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}
