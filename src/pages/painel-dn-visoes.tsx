import { useState } from 'react'
import { BookOpen, Building2, Eye, FileDown, GraduationCap, School, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable, RowAction, StatCard, type Column } from '@/components/wf'
import { BarList } from '@/components/wf/dash'
import { anosDisponiveis, ctms, semestreDe, semestresDisponiveis, turmasMatricula, type TurmaMatricula } from '@/lib/matriculas'

// Visões do Painel do DN sobre as matrículas nas CTMs: operacional (CTMs e DRs atendidos; estudantes por DR, turma, escola e
// área tecnológica) e relatório (DR × modalidade × CTM). Filtro por ano, semestre ou período (início e fim).
const n = (x: number) => x.toLocaleString('pt-BR')
const soma = (ts: TurmaMatricula[]) => ts.reduce((s, t) => s + t.matriculas, 0)
const br = (iso: string) => iso.split('-').reverse().join('/')

export type FiltroPeriodo = { periodo: string; ini: string; fim: string; ctm: string } // periodo: todos | AAAA | AAAA/S | personalizado
export const filtroInicial: FiltroPeriodo = { periodo: 'todos', ini: '2026-01-01', fim: '2026-12-31', ctm: 'todas' }
export function filtrar(f: FiltroPeriodo) {
  return turmasMatricula.filter((t) =>
    (f.ctm === 'todas' || t.ctm === f.ctm) &&
    (f.periodo === 'todos' ? true
      : f.periodo === 'personalizado' ? t.inicio <= f.fim && t.fim >= f.ini
      : f.periodo.includes('/') ? semestreDe(t.inicio) === f.periodo
      : t.inicio.startsWith(f.periodo)))
}

export function FiltrosPeriodo({ f, onChange }: { f: FiltroPeriodo; onChange: (f: FiltroPeriodo) => void }) {
  const rotulo = (v: string) => (v === 'todos' ? 'Todo o período' : v === 'personalizado' ? 'Período personalizado' : v.includes('/') ? `${v.replace('/', ' · ')}º semestre` : `Ano ${v}`)
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-[1.25rem] border bg-card p-4">
      <div className="grid gap-1.5">
        <Label>Período</Label>
        <Select value={f.periodo} onValueChange={(v) => onChange({ ...f, periodo: v as string })}>
          <SelectTrigger className="w-56"><SelectValue>{(v: string | null) => rotulo(v ?? 'todos')}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo o período</SelectItem>
            {anosDisponiveis.map((a) => <SelectItem key={a} value={a}>Ano {a}</SelectItem>)}
            {semestresDisponiveis.map((s) => <SelectItem key={s} value={s}>{rotulo(s)}</SelectItem>)}
            <SelectItem value="personalizado">Período personalizado (início e fim)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {f.periodo === 'personalizado' && (
        <>
          <div className="grid gap-1.5"><Label>Início</Label><Input type="date" className="w-44" value={f.ini} onChange={(e) => onChange({ ...f, ini: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Fim</Label><Input type="date" className="w-44" min={f.ini} value={f.fim} onChange={(e) => onChange({ ...f, fim: e.target.value })} /></div>
        </>
      )}
      <div className="grid gap-1.5">
        <Label>CTM</Label>
        <Select value={f.ctm} onValueChange={(v) => onChange({ ...f, ctm: v as string })}>
          <SelectTrigger className="w-48"><SelectValue>{(v: string | null) => (v && v !== 'todas' ? `CTM ${ctms[v]}` : 'Todas as CTMs')}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as CTMs</SelectItem>
            {Object.entries(ctms).map(([uf, nome]) => <SelectItem key={uf} value={uf}>CTM {nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

type Grupo = 'dr' | 'turma' | 'escola' | 'area'
type Linha = { id: string; nome: string; sub?: string; ctms: string[]; turmas: number; escolas: number; estudantes: number }
const agrupar = (ts: TurmaMatricula[], chave: (t: TurmaMatricula) => string, sub?: (t: TurmaMatricula) => string): Linha[] =>
  Object.values(ts.reduce<Record<string, TurmaMatricula[]>>((r, t) => ((r[chave(t)] ??= []).push(t), r), {}))
    .map((g) => ({ id: chave(g[0]), nome: chave(g[0]), sub: sub?.(g[0]), ctms: [...new Set(g.map((t) => t.ctm))], turmas: g.length, escolas: new Set(g.map((t) => t.escola)).size, estudantes: soma(g) }))
    .sort((a, b) => b.estudantes - a.estudantes)

export function VisaoOperacional({ f, onChange }: { f: FiltroPeriodo; onChange: (f: FiltroPeriodo) => void }) {
  const [grupo, setGrupo] = useState<Grupo>('dr')
  const ts = filtrar(f)
  const porCtm = Object.keys(ctms).map((uf) => {
    const g = ts.filter((t) => t.ctm === uf)
    return { uf, estudantes: soma(g), turmas: g.length, drs: agrupar(g, (t) => t.dr) }
  }).filter((c) => c.turmas)
  const colunasBase: Column<Linha>[] = [
    { header: 'CTMs', value: (l) => l.ctms.map((c) => ctms[c]).join(', '), filter: true, cell: (l) => <span className="flex flex-wrap gap-1">{l.ctms.map((c) => <Badge key={c} variant="outline">{ctms[c]}</Badge>)}</span> },
    { header: 'Turmas', value: (l) => l.turmas, className: 'text-right tabular-nums' },
    { header: 'Estudantes', value: (l) => l.estudantes, className: 'text-right font-semibold tabular-nums', cell: (l) => n(l.estudantes) },
  ]
  const linhas: Record<Grupo, { rotulo: string; linhas: Linha[]; colunas: Column<Linha>[] }> = {
    dr: { rotulo: 'DR', linhas: agrupar(ts, (t) => `SENAI-${t.dr}`), colunas: [{ header: 'DR', value: (l) => l.nome, search: true, className: 'font-medium' }, { header: 'Escolas', value: (l) => l.escolas, className: 'text-right tabular-nums' }, ...colunasBase] },
    turma: {
      rotulo: 'Turma', linhas: ts.map((t) => ({ id: t.id, nome: t.codigo, sub: `${t.curso} · ${t.modalidade} · ${t.escola} (SENAI-${t.dr}) · ${br(t.inicio)} a ${br(t.fim)}`, ctms: [t.ctm], turmas: 1, escolas: 1, estudantes: t.matriculas })).sort((a, b) => b.estudantes - a.estudantes),
      colunas: [{ header: 'Turma', value: (l) => l.nome, search: true, cell: (l) => <span className="block"><span className="font-mono text-xs">{l.nome}</span><span className="block text-xs text-muted-foreground">{l.sub}</span></span> }, colunasBase[0], colunasBase[2]],
    },
    escola: { rotulo: 'Escola', linhas: agrupar(ts, (t) => `${t.escola} · SENAI-${t.dr}`), colunas: [{ header: 'Escola', value: (l) => l.nome, search: true, className: 'font-medium' }, ...colunasBase] },
    area: { rotulo: 'Área tecnológica', linhas: agrupar(ts, (t) => t.area), colunas: [{ header: 'Área tecnológica', value: (l) => l.nome, search: true, className: 'font-medium' }, { header: 'Escolas', value: (l) => l.escolas, className: 'text-right tabular-nums' }, ...colunasBase] },
  }
  const atual = linhas[grupo]
  // Detalhe (side sheet): turmas da linha escolhida
  const chaveDe: Record<Grupo, (t: TurmaMatricula) => string> = { dr: (t) => `SENAI-${t.dr}`, turma: (t) => t.id, escola: (t) => `${t.escola} · SENAI-${t.dr}`, area: (t) => t.area }
  const [aberta, setAberta] = useState<Linha | null>(null)
  const turmasDe = (l: Linha) => ts.filter((t) => chaveDe[grupo](t) === l.id)
  return (
    <div className="space-y-6">
      <FiltrosPeriodo f={f} onChange={onChange} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} tom="blue" label="Estudantes" value={n(soma(ts))} />
        <StatCard icon={GraduationCap} tom="green" label="Turmas" value={n(ts.length)} />
        <StatCard icon={Building2} tom="amber" label="DRs atendidos" value={String(new Set(ts.map((t) => t.dr)).size)} />
        <StatCard icon={School} tom="gray" label="Escolas" value={String(new Set(ts.map((t) => `${t.dr}|${t.escola}`)).size)} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">CTMs e os DRs que cada uma atende</h2>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {porCtm.map((c) => (
            <div key={c.uf} className="rounded-[1.25rem] border bg-card p-5">
              <p className="text-sm font-semibold">CTM {ctms[c.uf]}</p>
              <div className="mt-1 mb-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold tabular-nums">{n(c.estudantes)}</span>
                <span className="text-sm text-muted-foreground">estudantes · {c.turmas} turmas · {c.drs.length} DR(s)</span>
              </div>
              <BarList itens={c.drs.sort((a, b) => b.estudantes - a.estudantes).slice(0, 5).map((d) => ({ rotulo: d.nome, valor: d.estudantes, tom: 'blue' as const }))} formato={n} />
              {c.drs.length > 5 && <p className="mt-3 text-xs text-muted-foreground">+ {c.drs.length - 5} DR(s) · {n(c.drs.slice(5).reduce((x, d) => x + d.estudantes, 0))} estudantes</p>}
            </div>
          ))}
          {!porCtm.length && <p className="text-sm text-muted-foreground">Nenhuma turma no período.</p>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Estudantes por {grupo === 'dr' ? 'DR' : atual.rotulo.toLowerCase()}</h2>
        <Tabs value={grupo} onValueChange={(v) => setGrupo(v as Grupo)}>
          <TabsList variant="line">
            {(Object.keys(linhas) as Grupo[]).map((g) => <TabsTrigger key={g} value={g}>{linhas[g].rotulo}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        <DataTable key={grupo} rows={atual.linhas} columns={atual.colunas} searchPlaceholder={`Buscar ${atual.rotulo.toLowerCase()}…`} onRowClick={setAberta}
          actions={(l) => <RowAction label="Visualizar turmas" icon={Eye} onClick={() => setAberta(l)} />} />
        <Sheet open={!!aberta} onOpenChange={(v) => !v && setAberta(null)}>
          <SheetContent className="w-full gap-0 p-0 sm:max-w-xl">
            <SheetHeader className="border-b px-6 py-4">
              <SheetTitle className="text-lg">{aberta?.nome}</SheetTitle>
              <SheetDescription>{aberta && `${n(aberta.estudantes)} estudantes · ${aberta.turmas} turma(s) · ${aberta.escolas} escola(s)`}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <ul className="divide-y rounded-xl border bg-card">
                {aberta && turmasDe(aberta).sort((a, b) => b.matriculas - a.matriculas).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-semibold">{t.codigo}</p>
                      <p className="truncate text-sm">{t.curso}</p>
                      <p className="text-xs text-muted-foreground">{t.modalidade} · {t.escola} (SENAI-{t.dr}) · CTM {ctms[t.ctm]} · {br(t.inicio)} a {br(t.fim)}</p>
                    </div>
                    <span className="text-lg font-semibold tabular-nums">{n(t.matriculas)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SheetContent>
        </Sheet>
      </section>
    </div>
  )
}

// Relatório no formato da planilha: DR (linha de Total + uma por modalidade) × CTM (matrículas), com total geral
export function VisaoRelatorio({ f, onChange }: { f: FiltroPeriodo; onChange: (f: FiltroPeriodo) => void }) {
  const ts = filtrar(f)
  const cols = Object.keys(ctms).filter((uf) => ts.some((t) => t.ctm === uf))
  const porDr = Object.entries(ts.reduce<Record<string, TurmaMatricula[]>>((r, t) => ((r[t.dr] ??= []).push(t), r), {}))
    .map(([dr, g]) => ({ dr, g, total: soma(g), modalidades: [...new Set(g.map((t) => t.modalidade))].map((m) => ({ m, g: g.filter((t) => t.modalidade === m) })).sort((a, b) => soma(b.g) - soma(a.g)) }))
    .sort((a, b) => b.total - a.total)
  const cel = (g: TurmaMatricula[], uf: string) => { const v = soma(g.filter((t) => t.ctm === uf)); return v ? n(v) : '' }
  const exportar = () => {
    const linhas = [['DR', 'Modalidade', ...cols.map((c) => ctms[c]), 'Total']]
    for (const d of porDr) {
      linhas.push([d.dr, 'Total', ...cols.map((c) => String(soma(d.g.filter((t) => t.ctm === c)) || '')), String(d.total)])
      for (const m of d.modalidades) linhas.push(['', m.m, ...cols.map((c) => String(soma(m.g.filter((t) => t.ctm === c)) || '')), String(soma(m.g))])
    }
    linhas.push(['Total', '', ...cols.map((c) => String(soma(ts.filter((t) => t.ctm === c)))), String(soma(ts))])
    const csv = linhas.map((r) => r.map((x) => `"${x}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
    Object.assign(document.createElement('a'), { href: url, download: 'matriculas-ctm-dr-modalidade.csv' }).click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="space-y-6">
      <FiltrosPeriodo f={f} onChange={onChange} />
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Matrículas por DR, modalidade e CTM</h2>
        <Button variant="outline" onClick={exportar}><FileDown /> Exportar planilha</Button>
      </div>
      <div className="overflow-x-auto rounded-[1.25rem] border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="px-5 py-3 text-left font-semibold">DR / modalidade</th>
              {cols.map((c) => <th key={c} className="px-4 py-3 text-right font-semibold">CTM {ctms[c]}</th>)}
              <th className="bg-muted/50 px-5 py-3 text-right font-semibold text-foreground">Total</th>
            </tr>
          </thead>
          {porDr.map((d) => (
            <tbody key={d.dr} className="border-b last:border-b-0">
              <tr className="bg-muted/30">
                <td className="px-5 py-3 font-semibold">SENAI-{d.dr}</td>
                {cols.map((c) => <td key={c} className="px-4 py-3 text-right font-semibold tabular-nums">{cel(d.g, c) || <span className="text-muted-foreground/50">—</span>}</td>)}
                <td className="bg-muted/50 px-5 py-3 text-right font-bold tabular-nums">{n(d.total)}</td>
              </tr>
              {d.modalidades.map((m) => (
                <tr key={m.m} className="text-muted-foreground">
                  <td className="py-2 pr-5 pl-9">{m.m}</td>
                  {cols.map((c) => <td key={c} className="px-4 py-2 text-right tabular-nums">{cel(m.g, c) || <span className="text-muted-foreground/40">—</span>}</td>)}
                  <td className="bg-muted/50 px-5 py-2 text-right font-medium text-foreground tabular-nums">{n(soma(m.g))}</td>
                </tr>
              ))}
            </tbody>
          ))}
          <tfoot>
            <tr className="border-t-2 bg-muted/50">
              <td className="px-5 py-3 font-bold">Total geral</td>
              {cols.map((c) => <td key={c} className="px-4 py-3 text-right font-bold tabular-nums">{n(soma(ts.filter((t) => t.ctm === c)))}</td>)}
              <td className="px-5 py-3 text-right text-base font-bold tabular-nums">{n(soma(ts))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><BookOpen className="size-3.5" /> Dados fictícios, no formato do relatório de matrículas das CTMs.</p>
    </div>
  )
}
