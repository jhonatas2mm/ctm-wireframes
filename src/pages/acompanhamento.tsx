import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Eye, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTable, EmptyState, PageHeader, RowAction, StatCard, type Column } from '@/components/wf'
import {
  HOJE, alertasAluno, dataBr, diasEntre, diasSemAcesso, mediaAluno, progressoEsperado, situacaoAluno, statusTurmaEad,
  useAlunosEad, useContratosCtm, useTurmasEad,
  type AlunoEad, type ContratoCtm, type SituacaoAluno, type TurmaEad,
} from '@/lib/mock'

// Acompanhamento da DR solicitante: contratos com o CTM (operação EAD), turmas e alunos. Somente leitura.
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const periodo = (i: string, f: string) => `${dataBr(i)} a ${dataBr(f)}`
const corSituacao: Record<SituacaoAluno, 'default' | 'secondary' | 'outline'> = { 'Em dia': 'secondary', 'Em risco': 'outline', Evadido: 'default' }

function useDados() {
  const contratos = useContratosCtm().all
  const turmas = useTurmasEad().all
  const alunos = useAlunosEad().all
  const turmaDe = (a: AlunoEad) => turmas.find((t) => t.id === a.turmaId)!
  const contratoDe = (t: TurmaEad) => contratos.find((c) => c.id === t.contratoId)
  const alunosDa = (t: TurmaEad) => alunos.filter((a) => a.turmaId === t.id)
  return { contratos, turmas, alunos, turmaDe, contratoDe, alunosDa }
}

const ultimoAcesso = (a: AlunoEad) => {
  if (!a.acessos[0]) return 'Nunca acessou'
  const n = diasSemAcesso(a)
  return n === 0 ? 'Hoje' : n === 1 ? 'Há 1 dia' : `Há ${n} dias`
}

function Barra({ valor, esperado }: { valor: number; esperado?: number }) {
  return (
    <div className="flex w-36 items-center gap-2">
      <Progress value={valor} className="flex-1" />
      <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">{valor}%{esperado !== undefined && ` / ${esperado}%`}</span>
    </div>
  )
}

// ── Colunas reaproveitadas ───────────────────────────────────────────────────
function colunasTurma(d: ReturnType<typeof useDados>): Column<TurmaEad>[] {
  return [
    { header: 'Turma', value: (t) => t.codigo, search: true, cell: (t) => <Badge variant="secondary" className="font-mono">{t.codigo}</Badge> },
    { header: 'Curso', value: (t) => t.curso, search: true },
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

// ── Painel ───────────────────────────────────────────────────────────────────
// Dashboard por contrato: cada contrato mostra suas turmas e, dentro de cada turma, os alunos que pedem atitude.
export function Painel() {
  const d = useDados()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState<string | null>(null)
  const ativas = d.turmas.filter((t) => statusTurmaEad(t) === 'Em andamento')
  const alunosAtivos = d.alunos.filter((a) => ativas.some((t) => t.id === a.turmaId))
  const conta = (x: SituacaoAluno) => alunosAtivos.filter((a) => situacaoAluno(a, d.turmaDe(a)) === x).length
  const contratos = d.contratos.filter((c) => c.status !== 'Em elaboração').sort((x, y) => x.status.localeCompare(y.status) * -1)

  return (
    <div className="space-y-6">
      <PageHeader title="Painel" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Contratos vigentes" value={String(d.contratos.filter((c) => c.status === 'Vigente').length)} />
        <StatCard label="Turmas em andamento" value={String(ativas.length)} />
        <StatCard label="Alunos ativos" value={String(alunosAtivos.length)} />
        <StatCard label="Em risco" value={String(conta('Em risco'))} />
        <StatCard label="Evadidos" value={String(conta('Evadido'))} />
      </div>

      {contratos.map((c) => {
        const turmas = d.turmas.filter((t) => t.contratoId === c.id)
        const alunos = turmas.flatMap(d.alunosDa)
        const risco = alunos.filter((a) => situacaoAluno(a, d.turmaDe(a)) !== 'Em dia').length
        return (
          <Card key={c.id}>
            <CardHeader className="flex flex-row flex-wrap items-center gap-3">
              <CardTitle className="text-lg">{c.empresa}</CardTitle>
              <Badge variant="secondary" className="font-mono">{c.numero}</Badge>
              <Badge variant={c.status === 'Vigente' ? 'default' : 'outline'}>{c.status}</Badge>
              <span className="text-sm text-muted-foreground tabular-nums">{periodo(c.inicio, c.fim)}</span>
              <Link to={`/contratos/${c.id}`} className="ml-auto text-sm underline underline-offset-4 hover:text-primary">Ver contrato</Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Turmas', turmas.length],
                  ['Alunos', `${alunos.length} / ${c.vagas}`],
                  ['Requer atenção', risco],
                  ['Progresso médio', `${alunos.length ? Math.round(alunos.reduce((n, a) => n + a.progresso, 0) / alunos.length) : 0}%`],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-lg bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground">{l}</div>
                    <div className="text-2xl font-semibold tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
              <div className="divide-y rounded-lg border">
                {turmas.map((t) => {
                  const atencao = d.alunosDa(t).map((a) => ({ a, m: alertasAluno(a, t) })).filter((x) => x.m.length)
                  return (
                    <div key={t.id} className="space-y-2 p-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link to={`/turmas-ead/${t.id}`} className="font-mono text-sm underline underline-offset-4 hover:text-primary">{t.codigo}</Link>
                        <span className="text-sm">{t.curso}</span>
                        <Badge variant="outline">{statusTurmaEad(t)}</Badge>
                        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="tabular-nums">{d.alunosDa(t).length} alunos</span>
                          <Barra valor={progressoEsperado(t)} />
                          <RowAction label="Ver alunos" icon={Users} onClick={() => navigate(`/turmas-ead/${t.id}?ver=alunos`)} />
                        </div>
                      </div>
                      {atencao.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {atencao.map(({ a, m }) => (
                            <button key={a.id} type="button" onClick={() => setAberto(a.id)} className="rounded-md border px-2 py-1 text-left text-xs hover:bg-muted">
                              <span className="font-medium">{a.nome}</span> <span className="text-muted-foreground">· {m.join(' · ')}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
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
  const navigate = useNavigate()
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
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vigência</span><span className="tabular-nums">{periodo(c.inicio, c.fim)}</span></div>
            <Progress value={tempo} />
            <div className="text-xs text-muted-foreground tabular-nums">{tempo}% do período decorrido</div>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
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
            <div className="divide-y rounded-lg border">
              {turmas.map((t) => {
                const n = d.alunosDa(t)
                const risco = n.filter((a) => situacaoAluno(a, t) !== 'Em dia').length
                return (
                  <div key={t.id} className="flex flex-wrap items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/turmas-ead/${t.id}`} className="font-mono text-sm underline underline-offset-4 hover:text-primary">{t.codigo}</Link>
                        <Badge variant="outline">{statusTurmaEad(t)}</Badge>
                      </div>
                      <div className="truncate text-sm text-muted-foreground">{t.curso} · {periodo(t.inicio, t.fim)}</div>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{n.length} alunos{risco > 0 && ` · ${risco} requer atenção`}</span>
                    <Barra valor={progressoEsperado(t)} />
                    <div className="flex gap-0.5">
                      <RowAction label="Visualizar" icon={Eye} onClick={() => navigate(`/turmas-ead/${t.id}`)} />
                      <RowAction label="Ver alunos" icon={Users} onClick={() => navigate(`/turmas-ead/${t.id}?ver=alunos`)} />
                    </div>
                  </div>
                )
              })}
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
        <StatCard label="Situação" value={statusTurmaEad(t)} hint={periodo(t.inicio, t.fim)} />
        <StatCard label="Execução do calendário" value={`${progressoEsperado(t)}%`} />
        <StatCard label="Progresso médio dos alunos" value={`${Math.round(media((a) => a.progresso))}%`} />
        <StatCard label="Média de notas" value={media(mediaAluno).toFixed(1)} />
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
        <StatCard label="Alunos" value={String(d.alunos.length)} />
        <StatCard label="Em dia" value={String(porSituacao('Em dia'))} />
        <StatCard label="Em risco" value={String(porSituacao('Em risco'))} />
        <StatCard label="Evadidos" value={String(porSituacao('Evadido'))} />
        <StatCard label="Sem acesso há mais de 7 dias" value={String(d.alunos.filter((a) => statusTurmaEad(d.turmaDe(a)) !== 'Finalizada' && diasSemAcesso(a) > 7).length)} />
      </div>
      <DataTable
        rows={d.alunos}
        columns={colunasAluno(d)}
        searchPlaceholder="Buscar aluno ou turma…"
        filters={[{ label: 'Empresa', values: (a) => [d.contratoDe(d.turmaDe(a))?.empresa ?? '—'] }]}
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
        <StatCard label="Progresso" value={`${a.progresso}%`} hint={`Esperado pelo calendário: ${progressoEsperado(t)}%`} />
        <StatCard label="Média" value={mediaAluno(a).toFixed(1)} />
        <StatCard label="Último acesso" value={ultimoAcesso(a)} hint={a.acessos[0] ? dataBr(a.acessos[0].data) : undefined} />
        <StatCard label="Turma" value={t.codigo} hint={t.curso} />
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
