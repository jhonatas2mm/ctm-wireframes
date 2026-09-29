import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CalendarClock, ClipboardList, FileCheck2, ReceiptText, RotateCcw, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ciclosDe } from '@/lib/alunos-turma'
import { brl, linhasCobranca } from '@/lib/cobranca'
import { AcompanhamentoAlunos } from './acompanhamento-alunos'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, PageHeader, Req, RowAction, StatCard, type Column, useConfirmar } from '@/components/wf'
import {
  HOJE, dataBr, diasSemAcesso, escolasDr, nomeParte, useAjustesCobranca, useAlunosEad, useConfirmacoesDesistencia, useContratos, useContratosCtm, useFormalizacoes, useProdutos, useTurmas, useTurmasEad,
  type AlunoEad, type Formalizacao, type Produto, type SituacaoFormal,
} from '@/lib/mock'
import { useAutor } from '@/lib/autor'
import { cn } from '@/lib/utils'

// Cobrança: formalizações até o dia 20 entram na cobrança do dia 5 do mês seguinte; depois do dia 20, na do outro mês.
const proximaCobranca = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number)
  const salto = d <= 20 ? 1 : 2
  const dt = new Date(Date.UTC(a, m - 1 + salto, 5))
  return dt.toISOString().slice(0, 10)
}
const situacoes: SituacaoFormal[] = ['Desistente', 'Trancado', 'Validado', 'Transferido']

// Financeiro (CTM): situação de cada aluno para a cobrança. A CTM cobra até a DR formalizar a saída; mudança de status
// no AVA sem formalização não para a cobrança, mas vira alerta. A formalização passa a ser registrada aqui (não por e-mail).
// Visões: situação dos alunos (formalizações), acompanhamento dos alunos por turma e ciclo e relatório de cobrança
// por proposta (aba pela URL: ?aba=acompanhamento | cobranca).
export default function Financeiro() {
  const [params, setParams] = useSearchParams()
  const aba = (['cobranca', 'acompanhamento'] as const).find((a) => a === params.get('aba')) ?? 'alunos'
  return (
    <>
      <PageHeader title="Financeiro" />
      <Tabs value={aba} onValueChange={(v) => setParams({ aba: v as string }, { replace: true })}>
        <TabsList>
          <TabsTrigger value="alunos"><Users /> Situação dos alunos</TabsTrigger>
          <TabsTrigger value="acompanhamento"><ClipboardList /> Acompanhamento dos alunos</TabsTrigger>
          <TabsTrigger value="cobranca"><ReceiptText /> Relatório de cobrança</TabsTrigger>
        </TabsList>
        <TabsContent value="alunos" className="pt-4"><SituacaoAlunos /></TabsContent>
        <TabsContent value="acompanhamento" className="pt-4"><AcompanhamentoAlunos /></TabsContent>
        <TabsContent value="cobranca" className="pt-4"><CobrancaPropostas /></TabsContent>
      </Tabs>
    </>
  )
}

// Relatório de cobrança: a CTM escolhe a proposta (aprovada, com turmas) e abre o relatório do ciclo.
function CobrancaPropostas() {
  const navigate = useNavigate()
  const turmas = useTurmas().all
  const taas = useContratos().all
  const ajustes = useAjustesCobranca().all
  const conf = useConfirmacoesDesistencia().all
  const propostas = useProdutos().all.filter((p) => p.status === 'Aprovado')
  const turmasDe = (p: Produto) => turmas.filter((t) => t.propostaId === p.id && t.fase !== 'Cancelada')
  const cicloAtual = (p: Produto) => { const cs = ciclosDe(turmasDe(p)); return cs.find((c) => c >= HOJE.slice(0, 7)) ?? cs[0] }
  const valorCiclo = (p: Produto) => {
    const c = cicloAtual(p)
    if (!c) return 0
    return linhasCobranca(p, turmasDe(p), c, conf).reduce((s, l) => s + l.valor, 0) + ajustes.filter((a) => a.propostaId === p.id && a.ciclo === c).reduce((s, a) => s + a.ch * a.alunos * a.valorHora, 0)
  }
  const colunas: Column<Produto>[] = [
    { header: 'Proposta', value: (p) => p.numero, search: true, cell: (p) => <Badge variant="secondary" className="font-mono">{p.numero}</Badge> },
    { header: 'Contratante', value: (p) => nomeParte(p.drContratante), filter: true },
    { header: 'TAA', value: (p) => taas.find((t) => t.id === p.taaId)?.numero ?? '—', className: 'font-mono text-xs' },
    { header: 'Cursos', value: (p) => p.cursos.map((c) => c.nome).join(', '), search: true },
    { header: 'Turmas', value: (p) => turmasDe(p).length, className: 'text-right tabular-nums' },
    // Outras propostas aprovadas no mesmo TAA (podem ir juntas no relatório)
    { header: 'Mesmo TAA', value: (p) => propostas.filter((x) => x.id !== p.id && x.taaId === p.taaId && x.drContratante === p.drContratante).map((x) => x.numero).join(', ') || '—', className: 'font-mono text-xs' },
    { header: 'Ciclo', value: (p) => { const c = cicloAtual(p); return c ? `${Number(c.slice(5))}/${c.slice(0, 4)}` : '—' }, className: 'tabular-nums' },
    { header: 'Valor do ciclo', value: (p) => valorCiclo(p), cell: (p) => <span className="font-medium tabular-nums">{brl(valorCiclo(p))}</span>, className: 'text-right' },
  ]
  return (
    <DataTable
      rows={propostas}
      columns={colunas}
      searchPlaceholder="Buscar proposta ou curso…"
      actions={(p) => <RowAction label="Abrir relatório" icon={ReceiptText} disabled={!turmasDe(p).length} motivo="Proposta sem turmas" onClick={() => navigate(`/financeiro/cobranca/${p.id}`)} />}
    />
  )
}

function SituacaoAlunos() {
  const { confirmar, dialogo } = useConfirmar()
  const autor = useAutor()
  const todos = useAlunosEad().all
  const turmas = useTurmasEad().all
  const contratos = useContratosCtm().all
  const propostasAprovadas = useProdutos().all.filter((p) => p.status === 'Aprovado')
  const turmasCtm = useTurmas().all
  const navigate = useNavigate()
  // As DRs aparecem em cards; escolher uma abre os alunos dela (?dr=)
  const [params, setParams] = useSearchParams()
  const formal = useFormalizacoes()
  const [aberto, setAberto] = useState<AlunoEad | null>(null)
  const [f, setF] = useState<Omit<Formalizacao, 'id' | 'registradoPor'>>({ situacao: 'Desistente', data: HOJE, aPartirDe: 'Módulo atual' })
  const turmaDe = (a: AlunoEad) => turmas.find((t) => t.id === a.turmaId)
  const drDe = (a: AlunoEad) => contratos.find((c) => c.id === turmaDe(a)?.contratoId)?.dr ?? 'MG'
  // Escola do aluno (fictício, estável por aluno)
  const escolaDe = (a: AlunoEad) => { const es = escolasDr[drDe(a)] ?? ['Escola'] ; return es[Number(a.id.slice(1)) % es.length] }
  const avaDe = (a: AlunoEad) => (diasSemAcesso(a) > 30 ? 'Suspenso' : 'Ativo')
  const formDe = (a: AlunoEad) => formal.get(a.id)
  const divergente = (a: AlunoEad) => avaDe(a) === 'Suspenso' && !formDe(a)
  const cobrado = (a: AlunoEad) => !formDe(a)
  const drs = [...new Set(todos.map(drDe))].sort()
  const dr = drs.find((d) => d === params.get('dr')) ?? ''
  const alunos = dr ? todos.filter((a) => drDe(a) === dr) : []
  const ir = (aba: string, d?: string) => setParams((p) => { const n = new URLSearchParams(p); n.set('aba', aba); if (d) n.set('dr', d); else n.delete('dr'); return n }, { replace: true })
  const filtroDr = (
    <div className="mb-6 flex items-center gap-3 rounded-[1.25rem] border bg-card p-4">
      <Button variant="outline" onClick={() => ir('alunos')}><ArrowLeft className="text-primary" /> Todas as DRs</Button>
      <span className="text-lg font-semibold">SENAI-{dr}</span>
    </div>
  )
  const colunas: Column<AlunoEad>[] = [
    { header: 'Aluno', value: (a) => a.nome, search: true, className: 'font-medium' },
    { header: 'Turma', value: (a) => turmaDe(a)?.codigo ?? '—', filter: true, className: 'font-mono text-xs' },
    { header: 'Escola', value: (a) => escolaDe(a), filter: true },
    { header: 'Situação no AVA', value: (a) => avaDe(a), filter: true, cell: (a) => <Badge variant="outline" className={cn(avaDe(a) === 'Suspenso' && 'border-amber-300 bg-amber-50 text-amber-900')}>{avaDe(a)}</Badge> },
    {
      header: 'Situação formal',
      value: (a) => formDe(a)?.situacao ?? 'Matriculado',
      filter: true,
      cell: (a) => {
        const x = formDe(a)
        return x ? <span className="text-sm">{x.situacao} <span className="text-xs text-muted-foreground">em {dataBr(x.data)}</span></span> : 'Matriculado'
      },
    },
    {
      header: 'Cobrança',
      value: (a) => (cobrado(a) ? 'Cobrado' : 'Não cobrado'),
      filter: true,
      cell: (a) => {
        const x = formDe(a)
        return x
          ? <span className="text-sm text-muted-foreground">Para a partir de {dataBr(proximaCobranca(x.data))}</span>
          : <span className="flex items-center gap-1.5 text-sm">Cobrado {divergente(a) && <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-900" title="Suspenso no AVA sem formalização da DR"><AlertTriangle className="size-3" /> Sem formalização</Badge>}</span>
      },
    },
  ]
  const cobrados = alunos.filter(cobrado)
  const porEscola = Object.entries(cobrados.reduce<Record<string, number>>((r, a) => ({ ...r, [escolaDe(a)]: (r[escolaDe(a)] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1])
  const abrir = (a: AlunoEad) => (setF({ situacao: 'Desistente', data: HOJE, aPartirDe: 'Módulo atual' }), setAberto(a))
  if (!dr) return (
    <div className="space-y-3">
      {drs.map((d) => {
        const as = todos.filter((a) => drDe(a) === d)
        const cob = as.filter(cobrado)
        const suspensos = as.filter(divergente).length
        const relatorio = propostasAprovadas.find((p) => p.drContratante === d && turmasCtm.some((t) => t.propostaId === p.id && t.fase !== 'Cancelada'))
        const numeros: [string, number, boolean?][] = [['Alunos', as.length], ['Cobrados', cob.length], ['Saídas formalizadas', as.length - cob.length], ['Suspensos sem formalização', suspensos, suspensos > 0]]
        return (
          <div key={d} className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[1.25rem] border bg-card p-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF7FF] text-sm font-bold text-[#164194]">{d}</div>
            <div className="w-48 shrink-0">
              <div className="font-semibold">SENAI-{d}</div>
              <div className="text-xs text-muted-foreground">{new Set(as.map((a) => a.turmaId)).size} turma(s) · {new Set(as.map(escolaDe)).size} escola(s)</div>
            </div>
            <dl className="grid min-w-96 flex-1 grid-cols-4 gap-4">
              {numeros.map(([rotulo, n, alerta]) => (
                <div key={rotulo} className="min-w-0">
                  <dt className="truncate text-xs text-muted-foreground">{rotulo}</dt>
                  <dd className={cn('text-xl font-bold tabular-nums', alerta && 'text-amber-700')}>{n}</dd>
                </div>
              ))}
            </dl>
            <div className="flex shrink-0 gap-2">
              <Button onClick={() => ir('alunos', d)}><Users /> Ver alunos</Button>
              <Button variant="outline" onClick={() => ir('acompanhamento', d)}><ClipboardList className="text-primary" /> Acompanhamento</Button>
              <Button variant="outline" disabled={!relatorio} motivo="Nenhuma proposta aprovada com turmas para esta DR" onClick={() => relatorio && navigate(`/financeiro/cobranca/${relatorio.id}`)}><ReceiptText className="text-primary" /> Relatório de cobrança</Button>
            </div>
          </div>
        )
      })}
    </div>
  )
  return (
    <>
      {filtroDr}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} tom="blue" label="Alunos cobrados" value={String(cobrados.length)} hint={`de ${alunos.length} matriculados`} />
        <StatCard icon={FileCheck2} tom="green" label="Saídas formalizadas" value={String(alunos.length - cobrados.length)} />
        <StatCard icon={AlertTriangle} tom="amber" label="Suspensos no AVA sem formalização" value={String(alunos.filter(divergente).length)} hint="Cobrar formalização da DR" />
        <StatCard icon={CalendarClock} tom="gray" label="Formalizações de hoje entram em" value={dataBr(proximaCobranca(HOJE))} hint="Corte no dia 20; cobrança no dia 5" />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {porEscola.map(([e, n]) => <Badge key={e} variant="secondary" className="text-sm">{e}: <span className="font-semibold tabular-nums">{n}</span></Badge>)}
      </div>
      <DataTable
        rows={alunos}
        columns={colunas}
        searchPlaceholder="Buscar aluno…"
        actions={(a) => formDe(a) ? (
          <RowAction label="Desfazer formalização" icon={RotateCcw} onClick={() => confirmar({ titulo: `Desfazer a formalização de ${a.nome}? O aluno volta a ser cobrado.`, acao: 'Desfazer', onConfirmar: () => formal.remove(a.id) })} />
        ) : (
          <RowAction label="Registrar formalização" icon={FileCheck2} onClick={() => abrir(a)} />
        )}
      />
      <Sheet open={!!aberto} onOpenChange={(v) => !v && setAberto(null)}>
        <SheetContent className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="text-lg">Registrar formalização</SheetTitle>
            <SheetDescription>{aberto?.nome} · {aberto && turmaDe(aberto)?.codigo}. A cobrança para a partir da cobrança seguinte ao corte do dia 20.</SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 content-start gap-3 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Situação <Req /></Label>
                <Select value={f.situacao} onValueChange={(v) => setF({ ...f, situacao: v as SituacaoFormal })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{situacoes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Data da formalização <Req /></Label><Input type="date" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} /></div>
            </div>
            <div className="grid gap-1.5">
              <Label>Deixa de cobrar a partir de <Req /></Label>
              <Select value={f.aPartirDe} onValueChange={(v) => setF({ ...f, aPartirDe: v as string })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Módulo atual">UC em andamento</SelectItem><SelectItem value="Próxima UC">Próxima UC (a atual segue cobrada)</SelectItem></SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">Cobrança deixa de incluir o aluno em {dataBr(proximaCobranca(f.data || HOJE))}.</p>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-3">
            <Button variant="ghost" onClick={() => setAberto(null)}>Cancelar</Button>
            <Button onClick={() => (aberto && formal.add({ id: aberto.id, ...f, registradoPor: autor }), setAberto(null))}>Salvar formalização</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {dialogo}
    </>
  )
}
