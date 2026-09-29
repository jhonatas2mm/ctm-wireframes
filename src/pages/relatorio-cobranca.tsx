import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, ExternalLink, FileDown, Plus, Printer, Trash2 } from 'lucide-react'
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
import { cicloBr as mesBr, ciclosDe, janelaCiclo } from '@/lib/alunos-turma'
import { brl, linhasCobranca, movimentacao } from '@/lib/cobranca'

// Relatório de cobrança (CTM → DR solicitante), no modelo da planilha da CTM: por proposta e ciclo financeiro (mês),
// uma linha por turma × escola × UC com a CH cobrada no ciclo, nº de alunos que faturam e valor aluno/hora.
// Regras em docs/fluxo.md.

const horas = (h: number) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`
const proxMes = (c: string) => { const d = new Date(Date.UTC(Number(c.slice(0, 4)), Number(c.slice(5)), 1)); return d.toISOString().slice(0, 7) }

export default function RelatorioCobranca() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const p = useProdutos().get(id)
  const { all: todas } = useTurmas()
  const { all: taas } = useContratos()
  const aj = useAjustesCobranca()
  const conf = useConfirmacoesDesistencia().all
  const { confirmar, dialogo } = useConfirmar()
  const [novo, setNovo] = useState<Omit<AjusteCobranca, 'id'> | null>(null)
  const crumbs = [{ label: 'Financeiro', to: '/financeiro?aba=cobranca' }, { label: p ? `Relatório de cobrança · ${p.numero}` : 'Relatório de cobrança' }]
  if (!p) return (<><PageHeader title="Relatório de cobrança" breadcrumb={crumbs} /><EmptyState title="Proposta não encontrada" /></>)
  const turmas = todas.filter((t) => t.propostaId === p.id && t.fase !== 'Cancelada')
  const ciclos = ciclosDe(turmas)
  const ciclo = ciclos.find((c) => c === params.get('ciclo')) ?? ciclos.find((c) => c >= HOJE.slice(0, 7)) ?? ciclos[0] ?? HOJE.slice(0, 7)
  const linhas = linhasCobranca(p, turmas, ciclo, conf)
  const idx = ciclos.indexOf(ciclo)
  const anterior = idx > 0 ? ciclos[idx - 1] : undefined
  const mov = movimentacao(turmas, ciclo, anterior, conf)
  const irPara = (c?: string) => c && setParams({ ciclo: c }, { replace: true })
  const ajustes = aj.all.filter((a) => a.propostaId === p.id && a.ciclo === ciclo)
  const total = linhas.reduce((s, l) => s + l.valor, 0) + ajustes.reduce((s, a) => s + a.ch * a.alunos * a.valorHora, 0)
  const taa = taas.find((t) => t.id === p.taaId)
  const dr = p.drContratante.toLowerCase()
  const vencimento = `${proxMes(ciclo)}-28`
  const ucs = [...new Set(linhas.map((l) => l.uc))]

  // Planilha (CSV) com as mesmas colunas do relatório
  const exportar = () => {
    const cab = ['Proposta', 'Modalidade', 'Curso', 'Escola-Município', 'Turma', 'Unidade Curricular', 'CH Total', 'Início', 'Final', 'Ciclo', 'CH Cobrada', 'Nº alunos', 'Valor aluno/hora', 'Valor total']
    const rows = [
      ...linhas.map((l) => [p.numero, l.modalidade, l.curso, `${l.escola} - ${l.cidade}`, l.codigo, l.uc, l.chTotal, dataBr(l.inicio), dataBr(l.fim), mesBr(ciclo), horas(l.chCobrada), l.alunos, l.valorHora.toFixed(2), l.valor.toFixed(2)]),
      ...ajustes.map((a, n) => [p.numero, '', '', a.turma, '', `Ajuste de cobrança ${n + 1} - ${a.uc}`, '', '', '', mesBr(ciclo), horas(a.ch), a.alunos, a.valorHora.toFixed(2), (a.ch * a.alunos * a.valorHora).toFixed(2)]),
    ]
    const csv = [cab, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
    Object.assign(document.createElement('a'), { href: url, download: `cobranca-${p.numero.replace(/\W+/g, '-')}-${ciclo}.csv` }).click()
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
        <div className="flex flex-wrap items-end gap-4 rounded-[1.25rem] border bg-card p-4">
          <div className="grid gap-1.5">
            <Label>Ciclo financeiro <span className="font-normal text-muted-foreground">({dataBr(janelaCiclo(ciclo).ini)} a {dataBr(janelaCiclo(ciclo).fim)})</span></Label>
            <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" aria-label="Mês anterior" disabled={!anterior} motivo="Primeiro mês de cobrança" onClick={() => irPara(anterior)}><ChevronLeft /></Button>
            <Select value={ciclo} onValueChange={(v) => setParams({ ciclo: v as string }, { replace: true })}>
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
            ) : <p className="text-sm text-muted-foreground">Primeira cobrança da proposta</p>}
          </div>
          <div className="space-y-2 text-sm">
            {mov.anterior !== undefined && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{mov.entraram}</span> entraram (novas UCs/integrações) · <span className="font-medium text-foreground">{mov.saidas.length}</span> saíram por desistência confirmada ou trancamento{mov.outrasSaidas > 0 && <> · <span className="font-medium text-foreground">{mov.outrasSaidas}</span> sem UC no mês</>}
              </p>
            )}
            {mov.saidas.length > 0 ? (
              <ul className="divide-y rounded-lg border">
                {mov.saidas.map(({ aluno: a, turma: t }) => (
                  <li key={a.id} className="flex items-center gap-3 px-3 py-2">
                    <span className="min-w-0 flex-1"><span className="font-medium">{a.nome}</span> <span className="text-muted-foreground">· {t.codigo} · {a.escola}</span></span>
                    <span className="text-xs text-muted-foreground">{a.status === 'Trancado' ? `Trancado em ${dataBr(a.dataSaida!)}` : `Desistência confirmada pela DR em ${dataBr(a.confirmacaoEm ?? a.dataSaida!)}`}</span>
                  </li>
                ))}
              </ul>
            ) : mov.anterior !== undefined && <p className="text-muted-foreground">Nenhuma saída confirmada para esta cobrança.</p>}
            <p className="text-xs text-muted-foreground">A saída confirmada pela DR tira o aluno da cobrança seguinte (corte no dia 20). Desistência só no Moodle, sem confirmação, segue cobrada.</p>
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
                    <TableHead>Curso</TableHead>
                    <TableHead>Escola</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead>Unidade curricular</TableHead>
                    <TableHead className="text-right">CH total</TableHead>
                    <TableHead>Período</TableHead>
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
                      <TableCell><span className="block">{l.curso}</span><span className="text-xs text-muted-foreground">{l.modalidade}</span></TableCell>
                      <TableCell><span className="block">{l.escola}</span><span className="text-xs text-muted-foreground">{l.cidade}</span></TableCell>
                      <TableCell className="font-mono text-xs">{l.codigo}</TableCell>
                      <TableCell>{l.uc}</TableCell>
                      <TableCell className="text-right tabular-nums">{l.chTotal}</TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">{dataBr(l.inicio)} a {dataBr(l.fim)}</TableCell>
                      <TableCell className="text-right tabular-nums">{horas(l.chCobrada)}</TableCell>
                      <TableCell className="text-right tabular-nums">{l.alunos}</TableCell>
                      <TableCell className="text-right tabular-nums">{brl(l.valorHora)}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{brl(l.valor)}</TableCell>
                      <TableCell><a href={`#/oferta/${l.turma.id}`} className="inline-flex items-center gap-1 text-xs underline underline-offset-2">Link de acesso <ExternalLink className="size-3" /></a></TableCell>
                    </TableRow>
                  ))}
                  {ajustes.map((a, n) => (
                    <TableRow key={a.id} className="bg-amber-50/60">
                      <TableCell colSpan={3}><Badge variant="outline">Ajuste de cobrança {n + 1}</Badge> <span className="text-sm">{a.turma}</span></TableCell>
                      <TableCell><span className="block">{a.uc}</span><span className="text-xs text-muted-foreground">{a.observacao}</span></TableCell>
                      <TableCell /><TableCell />
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
                    <TableCell colSpan={9} className="text-right font-semibold">Total · vencimento {dataBr(vencimento)}</TableCell>
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
