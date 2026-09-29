import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, CalendarCog, CheckCircle2, Circle, Eye, Info, Layers, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CellButton, DataTable, EmptyState, PageHeader, Req, RowAction, type Column, useConfirmar } from '@/components/wf'
import { situacaoDe, statusTurma, aoVivoTurma, chUc, situacaoCronograma, useCalendarioAtivo, useCursosDr, useEquipe, useProdutos, useTurmas, type Produto, type StatusTurma, type Turma, type UcTurma } from '@/lib/mock'
import { gerarCronograma, parametrosPadrao, type ParametrosCronograma } from '@/lib/cronograma'
import { cn } from '@/lib/utils'
import { PropostaSheet } from './proposta-sheet'

const dataBr = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '—')
const chTurma = (t: Pick<Turma, 'modulos'>) => t.modulos.reduce((s, m) => s + m.unidades.reduce((u, x) => u + chUc(x), 0), 0)
const periodo = (t: Pick<Turma, 'modulos'>) => {
  const ucs = t.modulos.flatMap((m) => m.unidades)
  const ini = ucs.map((u) => u.inicio).filter(Boolean).sort()[0]
  const fim = ucs.map((u) => u.fim).filter(Boolean).sort().at(-1)
  return ini || fim ? `${dataBr(ini ?? '')} a ${dataBr(fim ?? '')}` : '—'
}

const vigencia = (p: Produto) => (p.vigenciaInicio ? `${p.vigenciaInicio} a ${p.vigenciaFim}` : '—')

// Nível 1: uma linha por oferta (turma), repetindo a proposta; proposta sem oferta não aparece.
type LinhaOferta = { id: string; proposta: Produto; turma?: Turma }
const corStatus: Record<StatusTurma, string> = {
  'A iniciar': 'bg-muted text-foreground',
  'Buscar tutor': 'bg-amber-100 text-amber-800',
  'Em andamento': 'bg-sky-100 text-sky-800',
  Finalizada: 'bg-muted text-muted-foreground',
  Cancelada: 'bg-red-100 text-red-800',
}
export function StatusTurmaBadge({ status }: { status: StatusTurma }) {
  return <Badge variant="outline" className={cn('border-transparent', corStatus[status])}>{status}</Badge>
}
const ucsDe = (t?: Turma) => t?.modulos.flatMap((m) => m.unidades) ?? []
const colunasOfertas = (verProposta: (id: string) => void): Column<LinhaOferta>[] => [
  { header: 'Turma', value: (l) => l.turma?.codigo ?? '—', search: true, className: 'font-mono text-xs' },
  {
    header: 'Proposta',
    value: (l) => l.proposta.numero,
    search: true,
    cell: (l) => (
      <span className="flex items-center gap-1.5">
        <Badge variant="secondary" className="font-mono">{l.proposta.numero}</Badge>
        <CellButton icone onClick={() => verProposta(l.proposta.id)} label="Detalhes da proposta"><Info /></CellButton>
      </span>
    ),
  },
  { header: 'DR contratante', value: (l) => `SENAI-${l.proposta.drContratante}`, search: true, filter: true },
  { header: 'Status', value: (l) => (l.turma ? statusTurma(l.turma) : '—'), filter: true, cell: (l) => l.turma && <StatusTurmaBadge status={statusTurma(l.turma)} /> },
  { header: 'Cronograma', value: (l) => (l.turma ? `v${l.turma.cronograma?.versao ?? 1} · ${situacaoCronograma(l.turma.cronograma)}` : '—'), filter: true },
  { header: 'Início', value: (l) => dataBr(ucsDe(l.turma).map((u) => u.inicio).filter(Boolean).sort()[0] ?? ''), className: 'tabular-nums' },
  { header: 'Término', value: (l) => dataBr(ucsDe(l.turma).map((u) => u.fim).filter(Boolean).sort().at(-1) ?? ''), className: 'tabular-nums' },
]

// Nível 2: ofertas (turmas) de uma proposta.
const colunasTurmas: Column<Turma>[] = [
  { header: 'Turma', value: (t) => t.codigo, search: true, className: 'font-mono text-xs' },
  { header: 'Período', value: (t) => periodo(t), className: 'text-muted-foreground tabular-nums' },
  { header: 'UCs', value: (t) => t.modulos.reduce((n, m) => n + m.unidades.length, 0), className: 'text-right tabular-nums' },
  { header: 'CH', value: (t) => `${chTurma(t)} h`, className: 'text-right tabular-nums' },
  { header: 'Aulas ao vivo', value: (t) => aoVivoTurma(t), className: 'text-right tabular-nums' },
]

// Gestão da oferta (Supervisor): propostas aceitas → ofertas (turmas) de cada proposta.
// Rotas: /oferta · /oferta/nova · /oferta/proposta/:pid · /oferta/proposta/:pid/nova · /oferta/:id/sucesso
export default function Oferta() {
  const { confirmar, dialogo } = useConfirmar()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const db = useTurmas()
  const { all: propostas } = useProdutos()
  const [propostaAberta, setPropostaAberta] = useState<string | null>(null)
  const sucessoId = pathname.match(/^\/oferta\/([^/]+)\/sucesso$/)?.[1] ?? null
  // Tela da proposta só em /oferta/proposta/:pid; demais rotas (nova, sucesso, aulas ao vivo) abrem sobre a listagem.
  const pidNova = pathname.match(/^\/oferta\/proposta\/([^/]+)\/nova$/)?.[1]
  const pid = pathname.match(/^\/oferta\/proposta\/([^/]+)$/)?.[1] ?? null
  const proposta = propostas.find((p) => p.id === pid)
  const turmasDe = (id: string) => db.all.filter((t) => t.propostaId === id)
  const aceitas = propostas.filter((p) => p.status === 'Aprovado' || turmasDe(p.id).length)
  const voltar = () => navigate(proposta ? `/oferta/proposta/${proposta.id}` : '/oferta')
  const novaAberta = pathname === '/oferta/nova' || /^\/oferta\/proposta\/[^/]+\/nova$/.test(pathname)
  return (
    <>
      {!proposta ? (
        <>
          <PageHeader title="Gestão da oferta" actions={<Button onClick={() => navigate('/oferta/nova')}><Plus /> Nova oferta</Button>} />
          <DataTable
            rows={aceitas.flatMap((p): LinhaOferta[] => turmasDe(p.id).map((t) => ({ id: t.id, proposta: p, turma: t })))}
            columns={colunasOfertas(setPropostaAberta)}
            searchPlaceholder="Buscar proposta, DR ou turma…"
            actions={({ proposta: p, turma: t }) => (
              <>
                {t && <RowAction label="Visualizar oferta" icon={Eye} onClick={() => navigate(`/oferta/${t.id}`)} />}
                <RowAction label="Adicionar oferta" icon={Plus} onClick={() => navigate(`/oferta/proposta/${p.id}/nova`)} />
                {t && <RowAction label="Excluir" icon={Trash2} onClick={() => confirmar({ titulo: `Excluir a oferta ${t.codigo}?`, onConfirmar: () => db.remove(t.id) })} />}
              </>
            )}
          />
        </>
      ) : (
        <>
          <PageHeader
            title={<span className="flex items-center gap-3">Proposta <Badge variant="secondary" className="font-mono">{proposta.numero}</Badge></span>}
            breadcrumb={[{ label: 'Gestão da oferta', to: '/oferta' }, { label: proposta.numero }]}
            actions={<Button onClick={() => navigate(`/oferta/proposta/${proposta.id}/nova`)}><Plus /> Nova oferta</Button>}
          />
          <dl className="mb-6 grid grid-cols-2 gap-4 rounded-[1.25rem] border p-4 sm:grid-cols-4 bg-card">
            {([
              ['DR contratante', `SENAI-${proposta.drContratante}`],
              ['Vigência', vigencia(proposta)],
              ['Cursos', proposta.cursos.map((c) => c.nome).join(', ')],
              ['Proposta', <button type="button" className="underline underline-offset-2" onClick={() => setPropostaAberta(proposta.id)}>Ver detalhes</button>],
            ] as [string, React.ReactNode][]).map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="text-sm">{v}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mb-2 text-lg font-semibold">Ofertas (turmas)</h2>
          <DataTable
            rows={turmasDe(proposta.id)}
            columns={colunasTurmas}
            searchPlaceholder="Buscar turma…"
            actions={(t) => (
              <>
                <RowAction label="Visualizar" icon={Eye} onClick={() => navigate(`/oferta/${t.id}`)} />
                <RowAction label="Excluir" icon={Trash2} onClick={() => confirmar({ titulo: `Excluir a oferta ${t.codigo}?`, onConfirmar: () => db.remove(t.id) })} />
              </>
            )}
          />
        </>
      )}
      <PropostaSheet proposta={propostas.find((p) => p.id === propostaAberta) ?? null} onClose={() => setPropostaAberta(null)} />
      <NovaTurmaSheet open={novaAberta} propostaFixa={pidNova ?? proposta?.id} onOpenChange={(v) => !v && voltar()} onSaved={(ids) => navigate(`/oferta/${ids.join('+')}/sucesso`)} />
      <OfertaSucesso turmas={(sucessoId?.split('+') ?? []).map((id) => db.all.find((t) => t.id === id)).filter((t): t is Turma => !!t)} onClose={voltar} onVer={(t) => navigate(`/oferta/${t.id}`)} />
      {dialogo}
    </>
  )
}

// Matriz do produto (última versão com o mesmo nome); sem produto cadastrado, usa uma matriz genérica.
function useMatriz() {
  const { all } = useCursosDr()
  return (curso: string): Turma['modulos'] => {
    // Só versões aprovadas pelo DN vão para a oferta.
    const versoes = all.filter((c) => c.nome === curso && situacaoDe(c) === 'Aprovado').sort((a, b) => (b.versao ?? 1) - (a.versao ?? 1))
    const base = versoes[0]?.modulos ?? [
      { nome: 'Módulo básico', unidades: [{ nome: 'Unidade curricular 1', cargaHoraria: 0 }, { nome: 'Unidade curricular 2', cargaHoraria: 0 }] },
      { nome: 'Módulo específico', unidades: [{ nome: 'Unidade curricular 3', cargaHoraria: 0 }] },
    ]
    return base.map((m) => ({ curso, nome: m.nome, unidades: m.unidades.map((u) => ({ nome: u.nome, chEad: 0, chPresencial: u.cargaHoraria || 0, inicio: '', fim: '', aoVivo: [] })) }))
  }
}

// Nova oferta: proposta → um ou mais cursos da proposta → cronograma gerado pelo sistema (ajustável por UC).
function NovaTurmaSheet({ open, onOpenChange, onSaved, propostaFixa }: { open: boolean; onOpenChange: (v: boolean) => void; onSaved: (ids: string[]) => void; propostaFixa?: string }) {
  const db = useTurmas()
  const { all: propostas } = useProdutos()
  const { all: calendario } = useCalendarioAtivo()
  const equipe = useEquipe().all.filter((p) => p.status === 'Ativo')
  const matrizDe = useMatriz()
  const [propostaId, setPropostaId] = useState<string | null>(null)
  const [cursos, setCursos] = useState<string[]>([])
  const [modulos, setModulos] = useState<Turma['modulos']>([])
  const [params, setParams] = useState<ParametrosCronograma>(parametrosPadrao('2026-11-02'))
  const [avisos, setAvisos] = useState<string[]>([])
  const [supervisor, setSupervisor] = useState<string | null>(null)
  const [analista, setAnalista] = useState<string | null>(null)
  const proposta = propostas.find((p) => p.id === propostaId)
  const ano = new Date().getFullYear()
  // Cada curso escolhido vira uma oferta (turma) própria, com código sequencial.
  const codigoN = (n: number) => `TU-MG-${String(db.all.length + 1 + n).padStart(3, '0')}/${ano}`
  const codigo = cursos.length > 1 ? `${codigoN(0)} a ${codigoN(cursos.length - 1)}` : codigoN(0)
  const ch = chTurma({ modulos })
  // A soma das CHs das UCs de cada curso não pode passar a CH total do produto (curso) na proposta.
  const limiteDe = (c: string) => proposta?.cursos.find((x) => x.nome === c)?.cargaHoraria ?? 0
  const chDe = (c: string) => chTurma({ modulos: modulos.filter((m) => m.curso === c) })
  const excedidos = cursos.filter((c) => chDe(c) > limiteDe(c))
  // CH padrão ao importar a matriz: 50% a distância e 50% presencial, quando o produto não traz a divisão.
  const comCh = (ms: Turma['modulos']) => ms.map((m) => ({ ...m, unidades: m.unidades.map((u) => ({ ...u, chEad: u.chEad || 20, chPresencial: u.chPresencial || 20 })) }))
  const gerar = (ms: Turma['modulos'], p = params) => {
    const r = gerarCronograma(ms, p, calendario)
    setAvisos(r.avisos)
    return r.modulos
  }
  // Protótipo: já abre com proposta, o primeiro curso, supervisor/analista e o cronograma gerado.
  useEffect(() => {
    if (!open || !propostas.length) return
    const p = propostas.find((x) => x.id === propostaFixa) ?? propostas.find((x) => x.status === 'Aprovado') ?? propostas[0]
    const curso = p.cursos[0]
    if (!curso) return
    const pr = parametrosPadrao(curso.inicioPrevisto ?? '2026-11-02')
    setParams(pr)
    setPropostaId(p.id)
    setCursos([curso.nome])
    setModulos(gerar(comCh(matrizDe(curso.nome)), pr))
    // Equipe técnica vinculada à proposta aprovada (supervisor e analista definem o cronograma)
    setSupervisor(p.equipeTecnica?.supervisor ?? equipe.find((x) => x.funcao === 'Supervisor')?.nome ?? null)
    setAnalista(p.equipeTecnica?.analista ?? equipe.find((x) => x.funcao === 'Analista')?.nome ?? null)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => (setPropostaId(null), setCursos([]), setModulos([]), setAvisos([]))
  const alternarCurso = (nome: string) => {
    if (cursos.includes(nome)) {
      setCursos(cursos.filter((c) => c !== nome))
      setModulos(modulos.filter((m) => m.curso !== nome))
    } else {
      setCursos([...cursos, nome])
      setModulos(gerar([...modulos, ...comCh(matrizDe(nome))]))
    }
  }
  const setP = (patch: Partial<ParametrosCronograma>) => setParams((p) => ({ ...p, ...patch }))
  const setUc = (i: number, k: number, patch: Partial<UcTurma>) =>
    setModulos((ms) => ms.map((m, j) => (j !== i ? m : { ...m, unidades: m.unidades.map((u, l) => (l === k ? { ...u, ...patch } : u)) })))
  const salvar = () => {
    if (!proposta || !cursos.length) return
    const agora = new Date().toISOString()
    const ids = cursos.map((c, n) => db.add({
      codigo: codigoN(n), propostaId: proposta.id, propostaNumero: proposta.numero, drContratante: proposta.drContratante, cursos: [c],
      modulos: modulos.filter((m) => m.curso === c), criadoEm: agora,
      fase: 'A iniciar', cronograma: { versao: 1, situacao: 'Rascunho' }, supervisor: supervisor ?? undefined, analista: analista ?? undefined,
      historico: [{ quando: agora, texto: 'Oferta criada; cronograma v1 gerado', autor: supervisor ?? undefined }],
    }).id)
    reset()
    onSaved(ids)
  }
  const pessoas = (funcao: string) => equipe.filter((p) => p.funcao === funcao)

  return (
    <Sheet open={open} onOpenChange={(v) => (v || reset(), onOpenChange(v))}>
      <SheetContent side="bottom" className="data-[side=bottom]:h-[95vh] gap-0 overflow-hidden rounded-t-xl p-0">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg">Nova oferta</SheetTitle>
            <Badge variant="secondary" className="font-mono">{codigo}</Badge>
          </div>
          <SheetDescription className="sr-only">Criar turma a partir de uma proposta</SheetDescription>
        </SheetHeader>

        <div className="grid min-h-0 flex-1 grid-cols-[22rem_1fr] overflow-hidden">
          {/* Proposta, cursos, responsáveis e parâmetros do cronograma */}
          <section className="space-y-5 overflow-y-auto border-r p-4">
            <div className="grid gap-1.5">
              <Label>Proposta <Req /></Label>
              <Select disabled={!!propostaFixa} value={propostaId} onValueChange={(v) => (setPropostaId(v as string), setCursos([]), setModulos([]))}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string | null) => { const p = propostas.find((x) => x.id === v); return p ? `${p.numero} · SENAI-${p.drContratante}` : 'Selecione a proposta' }}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {propostas.filter((p) => p.status === 'Aprovado').map((p) => <SelectItem key={p.id} value={p.id}>{p.numero} · SENAI-{p.drContratante}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="justify-between"><span>Cursos desta oferta <Req /></span>{proposta && <span className="text-xs font-normal text-muted-foreground">{cursos.length} de {proposta.cursos.length}</span>}</Label>
              {!proposta ? (
                <p className="text-sm text-muted-foreground">Escolha uma proposta.</p>
              ) : (
                <ul className="grid gap-1.5">
                  {proposta.cursos.map((c) => {
                    const escolhido = cursos.includes(c.nome)
                    return (
                      <li key={c.cursoId}>
                        <button
                          type="button"
                          aria-pressed={escolhido}
                          onClick={() => alternarCurso(c.nome)}
                          className={cn('flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors bg-card', escolhido ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'text-muted-foreground hover:border-foreground/40 hover:text-foreground')}
                        >
                          {escolhido ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> : <Circle className="mt-0.5 size-4 shrink-0" />}
                          <span className="min-w-0 flex-1">
                            <span className={cn('block text-sm', escolhido ? 'font-semibold text-foreground' : 'font-medium')}>{c.nome}</span>
                            <span className="block text-xs text-muted-foreground">{c.modalidade} · {c.cargaHoraria} h{c.vagas ? ` · ${c.vagas} vagas` : ''}{c.inicioPrevisto ? ` · início previsto ${dataBr(c.inicioPrevisto)}` : ''}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Supervisor <Req /></Label>
                <Select value={supervisor} onValueChange={(v) => setSupervisor(v as string)}>
                  <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => v ?? 'Selecione'}</SelectValue></SelectTrigger>
                  <SelectContent>{pessoas('Supervisor').map((p) => <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Analista</Label>
                <Select value={analista} onValueChange={(v) => setAnalista(v as string)}>
                  <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => v ?? 'Selecione'}</SelectValue></SelectTrigger>
                  <SelectContent>{pessoas('Analista').map((p) => <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border bg-muted/30 p-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><CalendarCog className="size-4" /> Cronograma</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Início da turma <Req /></Label>
                  <Input type="date" value={params.inicio} onChange={(e) => setP({ inicio: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Horas por semana</Label>
                  <Input inputMode="numeric" value={params.chSemanal || ''} onChange={(e) => setP({ chSemanal: Number(e.target.value.replace(/\D/g, '')) || 0 })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Ambientação</Label>
                  <Select value={params.ambientacao} onValueChange={(v) => setP({ ambientacao: v as ParametrosCronograma['ambientacao'] })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Concomitante">Junto com a 1ª UC</SelectItem>
                      <SelectItem value="Semana própria">Semana própria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Intervalo entre módulos</Label>
                  <Select value={String(params.intervaloModulos)} onValueChange={(v) => setP({ intervaloModulos: Number(v) })}>
                    <SelectTrigger className="w-full"><SelectValue>{(v: string) => `${v} dias`}</SelectValue></SelectTrigger>
                    <SelectContent>{[5, 7, 10, 15].map((n) => <SelectItem key={n} value={String(n)}>{n} dias</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={params.terminarNaSexta} onChange={(e) => setP({ terminarNaSexta: e.target.checked })} /> UC termina na sexta-feira</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={params.iniciarModuloDezembro} onChange={(e) => setP({ iniciarModuloDezembro: e.target.checked })} /> Pode iniciar módulo em dezembro</label>
              <p className="text-xs text-muted-foreground">Só dias úteis; pula os feriados nacionais.</p>
              <Button type="button" variant="outline" disabled={!modulos.length} motivo="Sem módulos para gerar o cronograma" onClick={() => setModulos(gerar(modulos))}><CalendarCog /> Gerar cronograma</Button>
            </div>
          </section>

          {/* Matriz curricular: CH e datas por UC (geradas; ajuste manual se preciso) */}
          <section className="min-h-0 overflow-y-auto px-6 py-4">
            {!cursos.length ? (
              <EmptyState title="Escolha a proposta e os cursos" />
            ) : (
              <div className="mx-auto grid max-w-5xl gap-8">
                {avisos.length > 0 && (
                  <ul className="grid gap-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    {avisos.map((a) => <li key={a} className="flex items-start gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0" /> {a}</li>)}
                  </ul>
                )}
                {cursos.map((c) => {
                  const lim = limiteDe(c)
                  const chc = chDe(c)
                  const passou = chc > lim
                  return (
                    <div key={c} className="grid gap-3">
                      <div className="flex items-center justify-between gap-2 border-b pb-2">
                        <h3 className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4 text-primary" /> {c}</h3>
                        <span className={cn('text-sm tabular-nums text-muted-foreground', passou && 'font-medium text-red-600')}>{chc} de {lim} h{passou && ` · passou ${chc - lim} h`}</span>
                      </div>
                      {modulos.map((m, i) => m.curso !== c ? null : (
                        <section key={i} className="overflow-hidden rounded-lg border bg-card">
                          <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2 text-sm font-medium">
                            <Layers className="size-4 text-muted-foreground" /> {m.nome}
                          </div>
                          <div className="grid grid-cols-[1fr_5.5rem_5.5rem_9.5rem_9.5rem_8rem] items-center gap-2 px-3 pt-2 text-xs text-muted-foreground">
                            <span>Unidade curricular</span><span>CH a distância <Req /></span><span>CH presencial <Req /></span><span>Início <Req /></span><span>Término <Req /></span><span>Sem. · enc. · ao vivo</span>
                          </div>
                          <ul className="grid gap-1.5 p-3">
                            {m.unidades.map((u, k) => (
                              <li key={k} className="grid grid-cols-[1fr_5.5rem_5.5rem_9.5rem_9.5rem_8rem] items-center gap-2">
                                <span className="truncate text-sm">{u.nome}</span>
                                <Input className="h-8 tabular-nums" inputMode="numeric" placeholder="0 h" value={u.chEad || ''} onChange={(e) => setUc(i, k, { chEad: Number(e.target.value.replace(/\D/g, '')) })} aria-label={`CH a distância de ${u.nome}`} />
                                <Input className="h-8 tabular-nums" inputMode="numeric" placeholder="0 h" value={u.chPresencial || ''} onChange={(e) => setUc(i, k, { chPresencial: Number(e.target.value.replace(/\D/g, '')) })} aria-label={`CH presencial de ${u.nome}`} />
                                <Input className="h-8" type="date" value={u.inicio} onChange={(e) => setUc(i, k, { inicio: e.target.value })} aria-label={`Início de ${u.nome}`} />
                                <Input className="h-8" type="date" value={u.fim} onChange={(e) => setUc(i, k, { fim: e.target.value })} aria-label={`Término de ${u.nome}`} />
                                <span className="text-xs tabular-nums text-muted-foreground" title="Semanas de estudo · encontros presenciais · aulas ao vivo previstas">{u.semanas ?? '—'} · {u.encontros ?? '—'} · {u.aulasPrevistas ?? '—'}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

        </div>

        <SheetFooter className="flex-row items-center justify-between gap-4 border-t px-6 py-3">
          <p className="text-sm">
            <span className="text-2xl font-semibold tabular-nums">{ch} h</span>
            <span className="text-muted-foreground"> · {cursos.length} curso(s) · {modulos.reduce((t, m) => t + m.unidades.length, 0)} UC(s) · {periodo({ modulos })}</span>
            {excedidos.length > 0 && <span className="font-medium text-red-600"> · CH acima do produto em {excedidos.join(', ')}</span>}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button disabled={!proposta || !cursos.length || excedidos.length > 0} motivo={!proposta ? 'Escolha a proposta' : !cursos.length ? 'Selecione ao menos um curso' : 'Há cursos com CH acima do produto na proposta'} onClick={salvar}>Salvar oferta</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// Confirmação após salvar a oferta (rota /oferta/:id/sucesso, etapa da jornada Criação de oferta).
function OfertaSucesso({ turmas, onClose, onVer }: { turmas: Turma[]; onClose: () => void; onVer: (t: Turma) => void }) {
  const uma = turmas.length === 1
  return (
    <Dialog open={turmas.length > 0} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {turmas.length > 0 && (
          <div className="grid justify-items-center gap-4 py-2 text-center">
            <CheckCircle2 className="size-14 text-emerald-600" />
            <div className="grid gap-1">
              <DialogTitle className="text-xl">{uma ? 'Oferta criada com sucesso' : `${turmas.length} ofertas criadas com sucesso`}</DialogTitle>
              <DialogDescription>Proposta {turmas[0].propostaNumero} · SENAI-{turmas[0].drContratante}. Cronograma v1 em rascunho: revise e envie à DR para validação em Ver oferta.</DialogDescription>
            </div>
            <ul className="w-full divide-y rounded-lg border text-left bg-card">
              {turmas.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <Badge variant="secondary" className="font-mono">{t.codigo}</Badge>
                    <div className="text-sm font-medium">{t.cursos[0]}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">{periodo(t)} · {t.modulos.reduce((n, m) => n + m.unidades.length, 0)} UC(s) · {chTurma(t)} h</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onVer(t)}><Eye /> Ver oferta</Button>
                </li>
              ))}
            </ul>
            <Button className="w-full" variant={uma ? 'ghost' : 'default'} onClick={onClose}>Voltar para Gestão da oferta</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
