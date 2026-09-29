import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, ExternalLink, FileDown, Plus, Printer, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState, PageHeader, Req, useConfirmar } from '@/components/wf'
import {
  HOJE, dataBr, nomeParte, useAjustesCobranca, useConfirmacoesDesistencia, useContratos, useProdutos, useTurmas,
  type AjusteCobranca,
} from '@/lib/mock'
import { cn } from '@/lib/utils'
import { cicloBr as mesBr, ciclosDe } from '@/lib/alunos-turma'
import { brl, linhasCobranca, movimentacao } from '@/lib/cobranca'

// Relatório de cobrança (CTM → DR solicitante), no modelo da planilha da CTM: por proposta e ciclo financeiro (mês),
// podendo juntar outras propostas aprovadas da MESMA DR e do MESMO TAA (TAA diferente não entra) — ?propostas=2,6.
// uma linha por turma × escola × UC com a CH cobrada no ciclo, nº de alunos que faturam e valor aluno/hora.
// Regras em docs/fluxo.md.

const horas = (h: number) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`
const proxMes = (c: string) => { const d = new Date(Date.UTC(Number(c.slice(0, 4)), Number(c.slice(5)), 1)); return d.toISOString().slice(0, 7) }

export default function RelatorioCobranca() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const { all: propostas } = useProdutos()
  const p = propostas.find((x) => x.id === id)
  const { all: todas } = useTurmas()
  const { all: taas } = useContratos()
  const aj = useAjustesCobranca()
  const conf = useConfirmacoesDesistencia().all
  const { confirmar, dialogo } = useConfirmar()
  const [novo, setNovo] = useState<Omit<AjusteCobranca, 'id'> | null>(null)
  const turmasDe = (pid: string) => todas.filter((t) => t.propostaId === pid && t.fase !== 'Cancelada')
  // Propostas que podem entrar juntas: aprovadas, com turmas, da mesma DR e do mesmo TAA
  const irmas = p ? propostas.filter((x) => x.taaId === p.taaId && x.drContratante === p.drContratante && x.status === 'Aprovado' && turmasDe(x.id).length) : []
  const pedidas = (params.get('propostas') ?? '').split(',').filter(Boolean)
  const sel = p ? [p, ...irmas.filter((x) => x.id !== p.id && pedidas.includes(x.id))] : []
  const numeros = sel.map((x) => x.numero).join(' + ')
  const crumbs = [{ label: 'Financeiro', to: '/financeiro' }, { label: 'Relatórios de cobrança', to: '/financeiro?aba=cobranca' }, { label: p ? numeros : 'Relatório de cobrança' }]
  if (!p) return (<><PageHeader title="Relatório de cobrança" breadcrumb={crumbs} /><EmptyState title="Proposta não encontrada" /></>)
  const turmas = sel.flatMap((x) => turmasDe(x.id))
  const mudar = (k: string, v: string) => setParams((q) => { const n = new URLSearchParams(q); if (v) n.set(k, v); else n.delete(k); return n }, { replace: true })
  const alternar = (pid: string) => { const ids = sel.slice(1).map((x) => x.id); mudar('propostas', (ids.includes(pid) ? ids.filter((i) => i !== pid) : [...ids, pid]).join(',')) }
  const ciclos = ciclosDe(turmas)
  const ciclo = ciclos.find((c) => c === params.get('ciclo')) ?? ciclos.find((c) => c >= HOJE.slice(0, 7)) ?? ciclos[0] ?? HOJE.slice(0, 7)
  const linhas = sel.flatMap((x) => linhasCobranca(x, turmasDe(x.id), ciclo, conf))
  const idx = ciclos.indexOf(ciclo)
  const anterior = idx > 0 ? ciclos[idx - 1] : undefined
  const mov = movimentacao(turmas, ciclo, anterior, conf)
  const irPara = (c?: string) => c && mudar('ciclo', c)
  const ajustes = aj.all.filter((a) => sel.some((x) => x.id === a.propostaId) && a.ciclo === ciclo)
  const total = linhas.reduce((s, l) => s + l.valor, 0) + ajustes.reduce((s, a) => s + a.ch * a.alunos * a.valorHora, 0)
  const taa = taas.find((t) => t.id === p.taaId)
  const dr = p.drContratante.toLowerCase()
  const vencimento = `${proxMes(ciclo)}-28`
  const ucs = [...new Set(linhas.map((l) => l.uc))]

  // Planilha (CSV) com as mesmas colunas do relatório
  const exportar = () => {
    const cab = ['Proposta', 'Modalidade', 'Curso', 'Escola-Município', 'Turma', 'Unidade Curricular', 'CH Total', 'Início', 'Final', 'Ciclo', 'Ciclo da UC', 'CH Cobrada', 'Nº alunos', 'Valor aluno/hora', 'Valor total']
    const rows = [
      ...linhas.map((l) => [l.proposta, l.modalidade, l.curso, `${l.escola} - ${l.cidade}`, l.codigo, l.uc, l.chTotal, dataBr(l.inicio), dataBr(l.fim), mesBr(ciclo), `${dataBr(l.cicloIni)} a ${dataBr(l.cicloFim)}`, horas(l.chCobrada), l.alunos, l.valorHora.toFixed(2), l.valor.toFixed(2)]),
      ...ajustes.map((a, n) => [propostas.find((x) => x.id === a.propostaId)?.numero ?? '', '', '', a.turma, '', `Ajuste de cobrança ${n + 1} - ${a.uc}`, '', '', '', mesBr(ciclo), '', horas(a.ch), a.alunos, a.valorHora.toFixed(2), (a.ch * a.alunos * a.valorHora).toFixed(2)]),
    ]
    const csv = [cab, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
    Object.assign(document.createElement('a'), { href: url, download: `cobranca-${sel.map((x) => x.numero.replace(/\W+/g, '-')).join('+')}-${ciclo}.csv` }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader
        title="Relatório de cobrança"
        breadcrumb={crumbs}
        actions={
          <>
            <Button variant="outline" onClick={exportar}><FileDown /> Exportar planilha</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer /> Imprimir / PDF</Button>
          </>
        }
      />
      <div className="space-y-6">
        {/* Propostas neste relatório: só as do mesmo TAA e da mesma DR */}
        <section className="rounded-[1.25rem] border bg-card p-4">
          <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
            <h2 className="text-sm font-semibold">Propostas neste relatório <span className="font-normal text-muted-foreground">({sel.length})</span></h2>
            <span className="text-xs text-muted-foreground">Mesma DR ({nomeParte(p.drContratante)}) e mesmo TAA{taas.find((t) => t.id === p.taaId) ? ` ${taas.find((t) => t.id === p.taaId)!.numero}` : ''}; proposta de outro TAA não entra.</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {irmas.map((x) => {
              const on = sel.some((y) => y.id === x.id)
              const fixa = x.id === p.id
              return (
                <button key={x.id} type="button" disabled={fixa} aria-pressed={on} onClick={() => alternar(x.id)} title={fixa ? 'Proposta de origem do relatório' : on ? 'Tirar do relatório' : 'Juntar neste relatório'}
                  className={cn('flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm', on ? 'border-foreground/30 bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/50', fixa && 'cursor-default')}>
                  <span className={cn('flex size-4 items-center justify-center rounded border', on && 'border-foreground bg-foreground text-background')}>{on && <Check className="size-3" />}</span>
                  <span className="font-mono">{x.numero}</span>
                  <span className="text-xs text-muted-foreground">{x.cursos.map((c) => c.nome).join(', ')}</span>
                </button>
              )
            })}
            {irmas.length <= 1 && <span className="text-sm text-muted-foreground">Não há outra proposta aprovada neste TAA para juntar.</span>}
          </div>
        </section>

        <div className="flex flex-wrap items-end gap-4 rounded-[1.25rem] border bg-card p-4">
          <div className="grid gap-1.5">
            <Label>Cobrança do mês <span className="font-normal text-muted-foreground">(cada UC no seu ciclo)</span></Label>
            <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" aria-label="Mês anterior" disabled={!anterior} motivo="Primeiro mês de cobrança" onClick={() => irPara(anterior)}><ChevronLeft /></Button>
            <Select value={ciclo} onValueChange={(v) => mudar('ciclo', v as string)}>
              <SelectTrigger className="w-44"><SelectValue>{(v: string | null) => (v ? mesBr(v) : '—')}</SelectValue></SelectTrigger>
              <SelectContent>{ciclos.map((c) => <SelectItem key={c} value={c}>{mesBr(c)}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="icon" variant="outline" aria-label="Próximo mês" disabled={idx >= ciclos.length - 1} motivo="Último mês de cobrança" onClick={() => irPara(ciclos[idx + 1])}><ChevronRight /></Button>
            </div>
          </div>
          <div className="ml-auto flex gap-8 text-right">
            <div><p className="text-xs text-muted-foreground">Vencimento</p><p className="text-sm font-medium tabular-nums">{dataBr(vencimento)}</p></div>
            <div><p className="text-xs text-muted-foreground">Total do ciclo</p><p className="text-2xl font-semibold tabular-nums">{brl(total)}</p></div>
          </div>
        </div>

        {/* Cobrança mensal: cada mês tem a sua quantidade de alunos */}
        <section className="grid gap-4 rounded-[1.25rem] border bg-card p-4 md:grid-cols-[16rem_1fr]">
          <div>
            <p className="text-xs text-muted-foreground">Alunos cobrados em {mesBr(ciclo)}</p>
            <p className="text-2xl font-semibold tabular-nums">{mov.atual}</p>
            {mov.anterior !== undefined ? (
              <p className={cn('flex items-center gap-1 text-sm tabular-nums', mov.atual < mov.anterior ? 'text-amber-700' : mov.atual > mov.anterior ? 'text-emerald-700' : 'text-muted-foreground')}>
                {mov.atual < mov.anterior ? <ArrowDownRight className="size-4" /> : mov.atual > mov.anterior ? <ArrowUpRight className="size-4" /> : null}
                {mov.atual === mov.anterior ? 'Igual a' : `${mov.atual > mov.anterior ? '+' : ''}${mov.atual - mov.anterior} em relação a`} {mesBr(anterior!)} ({mov.anterior})
              </p>
            ) : <p className="text-sm text-muted-foreground">Primeira cobrança</p>}
          </div>
          <div className="space-y-2 text-sm">
            {mov.anterior !== undefined && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{mov.entraram}</span> entraram (novas UCs/integrações) · <span className="font-medium text-foreground">{mov.saidas.length}</span> saídas de UC por desistência confirmada ou trancamento{mov.outrasSaidas > 0 && <> · <span className="font-medium text-foreground">{mov.outrasSaidas}</span> sem UC no mês</>}
              </p>
            )}
            {mov.saidas.length > 0 ? (
              <ul className="divide-y rounded-lg border">
                {mov.saidas.map(({ aluno: a, turma: t, uc, matricula: m }) => (
                  <li key={`${a.id}-${uc}`} className="flex items-center gap-3 px-3 py-2">
                    <span className="min-w-0 flex-1"><span className="font-medium">{a.nome}</span> <span className="text-muted-foreground">· UC {uc} · {t.codigo} · {a.escola}</span></span>
                    <span className="text-xs text-muted-foreground">{m.status === 'Trancado' ? `Trancado em ${dataBr(m.desde!)}` : `Desistência confirmada pela DR em ${dataBr(m.confirmacaoEm ?? m.desde!)}`}</span>
                  </li>
                ))}
              </ul>
            ) : mov.anterior !== undefined && <p className="text-muted-foreground">Nenhuma saída confirmada para esta cobrança.</p>}
            <p className="text-xs text-muted-foreground">Cada UC tem o seu ciclo: a saída confirmada pela DR fora do ciclo da UC só desconta no próximo ciclo dela. Desistência só no Moodle, sem confirmação, segue cobrada.</p>
          </div>
        </section>

        {/* Dados do cliente e serviço */}
        <section className="rounded-[1.25rem] border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Dados do cliente e serviço</h2>
          <dl className="grid grid-cols-[12rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Instituição</dt><dd>SENAI - Serviço Nacional de Aprendizagem Industrial · {nomeParte(p.drContratante)}</dd>
            <dt className="text-muted-foreground">CNPJ</dt><dd className="tabular-nums">{p.cnpj ?? '—'}</dd>
            <dt className="text-muted-foreground">TAA</dt><dd>{taa ? <span><Badge variant="secondary" className="font-mono">{taa.numero}</Badge> <span className="text-muted-foreground">· Termo de Acordo Administrativo entre a CTM {nomeParte(p.drOfertante)} e o {nomeParte(p.drContratante)}</span></span> : '—'}</dd>
            <dt className="text-muted-foreground">Serviços</dt><dd>Atendimento de Central de Tutoria e Monitoria para cursos EAD e/ou autoinstrucionais</dd>
            <dt className="text-muted-foreground">E-mail da cobrança</dt><dd>financeiro@senai-{dr}.org.br; cobranca@senai-{dr}.org.br</dd>
          </dl>
        </section>

        {/* Realizações financeiras do ciclo */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Realizações do ciclo {mesBr(ciclo)} <span className="text-sm font-normal text-muted-foreground">({linhas.length} linhas)</span></h2>
            <Button variant="outline" size="sm" disabled={!ucs.length} motivo="Sem UCs neste ciclo" onClick={() => setNovo({
              propostaId: p.id, ciclo, uc: ucs[0] ?? '', turma: linhas[0]?.escola ?? '', ch: 10, alunos: 1, valorHora: linhas[0]?.valorHora ?? 0,
              observacao: `Aluno integrado após a cobrança de ${mesBr(ciclos[ciclos.indexOf(ciclo) - 1] ?? ciclo)}.`,
            })}><Plus /> Novo ajuste</Button>
          </div>
          {linhas.length || ajustes.length ? (
            <div className="overflow-x-auto rounded-[1.25rem] border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    {sel.length > 1 && <TableHead>Proposta</TableHead>}
                    <TableHead>Curso</TableHead>
                    <TableHead>Escola</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead>Unidade curricular</TableHead>
                    <TableHead className="text-right">CH total</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Ciclo da UC</TableHead>
                    <TableHead className="text-right">CH cobrada</TableHead>
                    <TableHead className="text-right">Alunos</TableHead>
                    <TableHead className="text-right">Aluno/hora</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Conferência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhas.map((l, n) => (
                    <TableRow key={n} className={cn(!l.alunos && 'text-muted-foreground')}>
                      {sel.length > 1 && <TableCell className="font-mono text-xs">{l.proposta}</TableCell>}
                      <TableCell><span className="block">{l.curso}</span><span className="text-xs text-muted-foreground">{l.modalidade}</span></TableCell>
                      <TableCell><span className="block">{l.escola}</span><span className="text-xs text-muted-foreground">{l.cidade}</span></TableCell>
                      <TableCell className="font-mono text-xs">{l.codigo}</TableCell>
                      <TableCell>{l.uc}</TableCell>
                      <TableCell className="text-right tabular-nums">{l.chTotal}</TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">{dataBr(l.inicio)} a {dataBr(l.fim)}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">{dataBr(l.cicloIni)} a {dataBr(l.cicloFim)}</TableCell>
                      <TableCell className="text-right tabular-nums">{horas(l.chCobrada)}</TableCell>
                      <TableCell className="text-right tabular-nums">{l.alunos}</TableCell>
                      <TableCell className="text-right tabular-nums">{brl(l.valorHora)}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{brl(l.valor)}</TableCell>
                      <TableCell><a href={`#/oferta/${l.turma.id}`} className="inline-flex items-center gap-1 text-xs underline underline-offset-2">Link de acesso <ExternalLink className="size-3" /></a></TableCell>
                    </TableRow>
                  ))}
                  {ajustes.map((a, n) => (
                    <TableRow key={a.id} className="bg-amber-50/60">
                      <TableCell colSpan={sel.length > 1 ? 4 : 3}><Badge variant="outline">Ajuste de cobrança {n + 1}</Badge> <span className="text-sm">{a.turma}</span></TableCell>
                      <TableCell><span className="block">{a.uc}</span><span className="text-xs text-muted-foreground">{a.observacao}</span></TableCell>
                      <TableCell /><TableCell /><TableCell />
                      <TableCell className="text-right tabular-nums">{horas(a.ch)}</TableCell>
                      <TableCell className="text-right tabular-nums">{a.alunos}</TableCell>
                      <TableCell className="text-right tabular-nums">{brl(a.valorHora)}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{brl(a.ch * a.alunos * a.valorHora)}</TableCell>
                      <TableCell>
                        <Button size="icon-sm" variant="ghost" aria-label="Excluir ajuste" onClick={() => confirmar({ titulo: `Excluir o ajuste de cobrança ${n + 1}?`, acao: 'Excluir', onConfirmar: () => aj.remove(a.id) })}><Trash2 /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={sel.length > 1 ? 11 : 10} className="text-right font-semibold">Total · vencimento {dataBr(vencimento)}</TableCell>
                    <TableCell className="text-right text-base font-semibold tabular-nums">{brl(total)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          ) : (
            <EmptyState title="Nenhuma UC em andamento neste ciclo" />
          )}
        </section>

        {ajustes.length > 0 && (
          <section className="rounded-[1.25rem] border bg-card p-4 text-sm">
            <h2 className="mb-2 font-semibold">Observações</h2>
            <ol className="space-y-1">
              {ajustes.map((a, n) => <li key={a.id}>Ajuste {n + 1} — {brl(a.ch * a.alunos * a.valorHora)} · {a.uc}: {a.observacao}</li>)}
            </ol>
          </section>
        )}
      </div>

      <Dialog open={!!novo} onOpenChange={(v) => !v && setNovo(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo ajuste de cobrança</DialogTitle>
            <DialogDescription>Linha extra no ciclo {mesBr(ciclo)} (ex.: aluno integrado depois da cobrança anterior).</DialogDescription>
          </DialogHeader>
          {novo && (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Unidade curricular <Req /></Label>
                  <Select value={novo.uc} onValueChange={(v) => setNovo({ ...novo, uc: v as string, valorHora: linhas.find((l) => l.uc === v)?.valorHora ?? novo.valorHora })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{ucs.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Escola <Req /></Label>
                  <Select value={novo.turma} onValueChange={(v) => setNovo({ ...novo, turma: v as string })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{[...new Set(linhas.map((l) => l.escola))].map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>CH cobrada <Req /></Label><Input inputMode="decimal" value={novo.ch || ''} onChange={(e) => setNovo({ ...novo, ch: Number(e.target.value.replace(',', '.')) || 0 })} /></div>
                <div className="grid gap-1.5"><Label>Nº de alunos <Req /></Label><Input inputMode="numeric" value={novo.alunos || ''} onChange={(e) => setNovo({ ...novo, alunos: Number(e.target.value.replace(/\D/g, '')) })} /></div>
                <div className="grid gap-1.5"><Label>Aluno/hora</Label><p className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm tabular-nums">{brl(novo.valorHora)}</p></div>
              </div>
              <div className="grid gap-1.5"><Label>Observação <Req /></Label><Textarea rows={3} value={novo.observacao} onChange={(e) => setNovo({ ...novo, observacao: e.target.value })} /></div>
              <p className="text-right text-sm">Valor do ajuste <span className="text-lg font-semibold tabular-nums">{brl(novo.ch * novo.alunos * novo.valorHora)}</span></p>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNovo(null)}>Cancelar</Button>
            <Button onClick={() => (novo && aj.add(novo), setNovo(null))}>Salvar ajuste</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogo}
    </>
  )
}
