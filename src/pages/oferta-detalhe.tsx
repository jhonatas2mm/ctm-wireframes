import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Ban, CalendarClock, CalendarPlus, CheckCircle2, ChevronDown, Layers, Merge, Pencil, Plus, Send, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EmptyState, PageHeader, Req, useConfirmar } from '@/components/wf'
import {
  HOJE, agrupaveis, chUc, dataBr as br, diasEntre, diasSemana, periodoTurma, situacaoCronograma, statusTurma,
  useCalendario, useProdutos, useTurmas, type AulaAoVivo, type EscolaTurma, type Turma,
} from '@/lib/mock'
import { deslocar, gerarCronograma, parametrosPadrao } from '@/lib/cronograma'
import { useAutor } from '@/lib/autor'
import { cn } from '@/lib/utils'
import { PropostaSheet } from './proposta-sheet'
import { StatusTurmaBadge } from './oferta'
import { ExecucaoTurma, IntegracaoTurma } from './oferta-execucao'

const dataBr = (iso?: string) => (iso ? br(iso) : '—')
const somar = (iso: string, n: number) => new Date(Date.parse(iso) + n * 864e5).toISOString().slice(0, 10)
const abas = ['cronograma', 'execucao', 'integracao', 'historico'] as const

// Detalhes da oferta (turma): cronograma e validação pela DR, escolas, gestão da execução, integração com o AVA e histórico.
// Aba pela URL (?aba=execucao) para as jornadas.
export default function OfertaDetalhe() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const aba = abas.find((a) => a === params.get('aba')) ?? 'cronograma'
  const db = useTurmas()
  const navigate = useNavigate()
  const autor = useAutor()
  const t = db.get(id)
  const { confirmar, dialogo } = useConfirmar()
  const { all: propostas } = useProdutos()
  const { all: calendario } = useCalendario()
  const [verProposta, setVerProposta] = useState(false)
  // UC em edição (módulo, UC) e rascunho da aula ao vivo; um dia por UC.
  const [editando, setEditando] = useState<{ i: number; k: number; aula: AulaAoVivo } | null>(null)
  const [modal, setModal] = useState<null | 'enviar' | 'versao' | 'prorrogar' | 'cancelar' | 'escola'>(null)
  const [data, setData] = useState('')
  const [texto, setTexto] = useState('')
  const [escola, setEscola] = useState<EscolaTurma>({ nome: '', cidade: '', alunos: 0 })
  const crumbs = [{ label: 'Gestão da oferta', to: '/oferta' }, { label: t?.codigo ?? 'Oferta' }]
  if (!t) return (
    <>
      <PageHeader title="Oferta" breadcrumb={crumbs} />
      <EmptyState title="Oferta não encontrada" />
    </>
  )
  // Toda mudança fica no histórico da turma.
  const registrar = (patch: Partial<Turma>, txt: string) =>
    db.update(t.id, { ...patch, historico: [{ quando: new Date().toISOString(), texto: txt, autor }, ...(t.historico ?? [])] })
  const abrir = (m: typeof modal, d = '', tx = '') => (setData(d), setTexto(tx), setModal(m))
  const ucs = t.modulos.flatMap((m) => m.unidades)
  const status = statusTurma(t)
  const cron = t.cronograma ?? { versao: 1, situacao: 'Rascunho' as const }
  const sitCron = situacaoCronograma(t.cronograma)
  const { inicio, fim } = periodoTurma(t)
  const aberta = status === 'A iniciar' // ainda dá para mexer no cronograma
  const salvarAula = (i: number, k: number, aula: AulaAoVivo | null) =>
    db.update(t.id, { modulos: t.modulos.map((m, j) => (j !== i ? m : { ...m, unidades: m.unidades.map((u, l) => (l === k ? { ...u, aoVivo: aula ? [aula] : [] } : u)) })) })
  const ucEditada = editando && t.modulos[editando.i]?.unidades[editando.k]
  const info: [string, React.ReactNode][] = [
    ['Status', <StatusTurmaBadge status={status} />],
    ['Curso', t.cursos[0]],
    ['Proposta', <button type="button" className="font-mono underline underline-offset-2 hover:text-foreground/70" onClick={() => setVerProposta(true)}>{t.propostaNumero}</button>],
    ['DR contratante', `SENAI-${t.drContratante}`],
    ['Período', `${dataBr(inicio)} a ${dataBr(fim)}`],
    ['CH total', <span className="font-semibold">{ucs.reduce((s, u) => s + chUc(u), 0)} h</span>],
    ['Supervisor', t.supervisor ?? '—'],
    ['Analista', t.analista ?? '—'],
    ['Cronograma', `v${cron.versao} · ${sitCron}`],
  ]

  return (
    <>
      <PageHeader
        title={<span className="flex items-center gap-3">Turma: {t.cursos.join(', ')} <Badge variant="secondary" className="font-mono">{t.codigo}</Badge></span>}
        breadcrumb={crumbs}
        actions={
          <>
            {/* Confirmar turma = a DR confirmou que vai começar: libera o PCP (Buscar tutor) e a criação das salas */}
            {aberta && (
              <Button
                disabled={sitCron !== 'Validado'}
                title={sitCron !== 'Validado' ? 'O cronograma precisa estar validado pela DR' : undefined}
                onClick={() => confirmar({
                  titulo: 'Confirmar a turma?',
                  descricao: `O SENAI-${t.drContratante} confirmou que a turma vai começar. O status passa a Buscar tutor e o PCP começa a alocar a equipe.`,
                  acao: 'Confirmar turma',
                  onConfirmar: () => registrar({ fase: 'Buscar tutor' }, 'Turma confirmada pela DR: status Buscar tutor'),
                })}
              >
                <CheckCircle2 /> Confirmar turma
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>Mais ações <ChevronDown /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem disabled={status === 'Em andamento' || status === 'Finalizada' || status === 'Cancelada'} onClick={() => abrir('prorrogar', inicio)}><CalendarClock /> Prorrogar início</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/oferta/proposta/${t.propostaId}/nova`)}><Plus /> Adicionar oferta</DropdownMenuItem>
                <DropdownMenuItem disabled={status === 'Finalizada' || status === 'Cancelada'} onClick={() => abrir('cancelar')}><Ban /> Cancelar turma</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />
      <PropostaSheet proposta={verProposta ? propostas.find((p) => p.id === t.propostaId) ?? null : null} onClose={() => setVerProposta(false)} />
      <div className="space-y-6">
        <dl className="grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-3">
          {info.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="text-sm">{v}</dd>
            </div>
          ))}
        </dl>
        {status === 'Cancelada' && t.motivoCancelamento && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <p className="mb-1 text-xs font-medium">Motivo do cancelamento</p>
            <p className="whitespace-pre-wrap">{t.motivoCancelamento}</p>
          </div>
        )}

        <Tabs value={aba} onValueChange={(v) => setParams({ aba: v as string }, { replace: true })}>
          <TabsList>
            <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            <TabsTrigger value="execucao">Execução</TabsTrigger>
            <TabsTrigger value="integracao">Integração com o AVA</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="cronograma" className="space-y-6 pt-4">
            {/* Validação pela DR contratante: versões; sem resposta até o prazo, conta como validado */}
            <section className={cn('flex flex-wrap items-center gap-4 rounded-lg border p-4', sitCron === 'Validado' ? 'border-emerald-200 bg-emerald-50' : sitCron === 'Aguardando validação' ? 'border-amber-200 bg-amber-50' : '')}>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Cronograma v{cron.versao} · {sitCron}</p>
                <p className="text-sm text-muted-foreground">
                  {sitCron === 'Rascunho' && 'Revise as datas e envie à DR contratante para validação (o envio é feito fora do sistema).'}
                  {sitCron === 'Aguardando validação' && `Aguardando o SENAI-${t.drContratante} até ${dataBr(cron.prazo)} (faltam ${diasEntre(HOJE, cron.prazo ?? HOJE)} dias). Sem resposta até lá, o cronograma conta como validado.`}
                  {sitCron === 'Validado' && (cron.situacao === 'Aguardando validação' ? `Validado por prazo em ${dataBr(cron.prazo)} (a DR não respondeu).` : `Validado pela DR em ${dataBr(cron.validadoEm)}.`)}
                </p>
              </div>
              {aberta && sitCron === 'Rascunho' && <Button onClick={() => abrir('enviar', somar(HOJE, 10))}><Send /> Marcar como enviado à DR</Button>}
              {aberta && sitCron === 'Aguardando validação' && (
                <Button onClick={() => registrar({ cronograma: { ...cron, situacao: 'Validado', validadoEm: HOJE } }, `Cronograma v${cron.versao} validado pelo SENAI-${t.drContratante}`)}><CheckCircle2 /> Registrar validação</Button>
              )}
              {aberta && sitCron !== 'Rascunho' && <Button variant="outline" onClick={() => abrir('versao', inicio)}><Pencil /> DR pediu ajuste</Button>}
            </section>

            <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
              <div className="grid content-start gap-1.5">
                <Label>Dia do encontro presencial</Label>
                <Select value={t.diaPresencial ?? null} onValueChange={(v) => registrar({ diaPresencial: v as string }, `Dia do presencial: ${v}`)}>
                  <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => v ?? 'Informado pela DR'}</SelectValue></SelectTrigger>
                  <SelectContent>{diasSemana.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">O PCP usa para marcar as aulas ao vivo em outro dia.</p>
              </div>
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Escolas da turma <span className="font-normal text-muted-foreground">({(t.escolas ?? []).reduce((s, e) => s + e.alunos, 0)} alunos)</span></Label>
                  <Button size="sm" variant="outline" onClick={() => (setEscola({ nome: 'SENAI Tijuca', cidade: 'Rio de Janeiro', alunos: 15 }), setModal('escola'))}><Plus /> Adicionar escola</Button>
                </div>
                {(t.escolas ?? []).length ? (
                  <ul className="divide-y rounded-lg border">
                    {(t.escolas ?? []).map((e, n) => (
                      <li key={e.nome} className="flex items-center gap-3 px-3 py-2 text-sm">
                        <span className="min-w-0 flex-1"><span className="font-medium">{e.nome}</span> <span className="text-muted-foreground">· {e.cidade}</span></span>
                        <span className="tabular-nums text-muted-foreground">{e.alunos} alunos</span>
                        <Button size="icon-sm" variant="ghost" aria-label={`Remover ${e.nome}`} onClick={() => confirmar({ titulo: `Remover ${e.nome} da turma?`, acao: 'Remover', onConfirmar: () => registrar({ escolas: (t.escolas ?? []).filter((_, j) => j !== n) }, `Escola removida: ${e.nome}`) })}><Trash2 /></Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Nenhuma escola. As escolas vêm do cadastro da DR e podem mudar de uma UC para outra.</p>
                )}
              </section>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Matriz curricular</h2>
              {t.modulos.map((m, i) => (
                <div key={i} className="overflow-hidden rounded-lg border">
                  <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2 text-sm font-medium">
                    <Layers className="size-4 text-muted-foreground" /> {t.cursos.length > 1 && <span className="text-muted-foreground">{m.curso} ·</span>} Módulo {i + 1} · {m.nome}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unidade curricular</TableHead>
                        <TableHead className="text-right">CH a distância</TableHead>
                        <TableHead className="text-right">CH presencial</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Término</TableHead>
                        <TableHead className="text-right" title="Semanas de estudo · encontros presenciais · aulas ao vivo previstas">Sem. · enc. · ao vivo</TableHead>
                        <TableHead>Aula ao vivo (PCP)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {m.unidades.map((u, k) => {
                        const juntas = agrupaveis(db.all, t, u)
                        return (
                          <TableRow key={k}>
                            <TableCell>
                              {i + 1}.{k + 1} {u.nome}
                              {/* Agrupamento: outra turma com a mesma UC na mesma semana */}
                              {juntas.length > 0 && (
                                <Tooltip>
                                  <TooltipTrigger render={<Badge variant="outline" className="ml-2 gap-1 border-violet-300 bg-violet-50 text-violet-800" />}><Merge className="size-3" /> Agrupável</TooltipTrigger>
                                  <TooltipContent>Mesma UC na mesma semana em {juntas.map((o) => `${o.codigo} (SENAI-${o.drContratante})`).join(', ')}</TooltipContent>
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{u.chEad} h</TableCell>
                            <TableCell className="text-right tabular-nums">{u.chPresencial} h</TableCell>
                            <TableCell className="tabular-nums">{dataBr(u.inicio)}</TableCell>
                            <TableCell className="tabular-nums">{dataBr(u.fim)}</TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">{u.semanas ?? '—'} · {u.encontros ?? '—'} · {u.aulasPrevistas ?? '—'}</TableCell>
                            <TableCell>
                              {u.aoVivo[0] ? (
                                <span className="flex items-center gap-1 tabular-nums">
                                  {dataBr(u.aoVivo[0].data)} · {u.aoVivo[0].inicio}–{u.aoVivo[0].fim}
                                  <Button size="icon" variant="ghost" className="size-7" aria-label={`Editar aula ao vivo de ${u.nome}`} onClick={() => setEditando({ i, k, aula: u.aoVivo[0] })}><Pencil /></Button>
                                  <Button size="icon" variant="ghost" className="size-7" aria-label={`Remover aula ao vivo de ${u.nome}`} onClick={() => confirmar({ titulo: `Remover a aula ao vivo de ${u.nome}?`, onConfirmar: () => salvarAula(i, k, null) })}><X /></Button>
                                </span>
                              ) : (
                                <Button size="sm" variant="outline" className="h-7" onClick={() => setEditando({ i, k, aula: { data: u.inicio, inicio: '19:00', fim: '21:00' } })}><CalendarPlus /> Adicionar</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </section>
          </TabsContent>

          <TabsContent value="execucao" className="pt-4">
            <ExecucaoTurma t={t} registrar={registrar} />
          </TabsContent>
          <TabsContent value="integracao" className="pt-4">
            <IntegracaoTurma t={t} registrar={registrar} />
          </TabsContent>
          <TabsContent value="historico" className="pt-4">
            {t.historico?.length ? (
              <ol className="relative space-y-4 border-l pl-5">
                {t.historico.map((h, n) => (
                  <li key={n} className="relative">
                    <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-background bg-foreground/60" />
                    <p className="text-sm">{h.texto}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{new Date(h.quando).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}{h.autor && ` · ${h.autor}`}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState title="Sem histórico" />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Aula ao vivo (definida pelo PCP) */}
      <Dialog open={!!editando} onOpenChange={(v) => !v && setEditando(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aula ao vivo</DialogTitle>
            {ucEditada && <p className="text-sm text-muted-foreground">{ucEditada.nome} · {dataBr(ucEditada.inicio)} a {dataBr(ucEditada.fim)}</p>}
          </DialogHeader>
          {editando && (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Data <Req /></Label>
                <Input type="date" min={ucEditada?.inicio || undefined} max={ucEditada?.fim || undefined} value={editando.aula.data} onChange={(e) => setEditando({ ...editando, aula: { ...editando.aula, data: e.target.value } })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Início <Req /></Label>
                  <Input type="time" value={editando.aula.inicio} onChange={(e) => setEditando({ ...editando, aula: { ...editando.aula, inicio: e.target.value } })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Término <Req /></Label>
                  <Input type="time" value={editando.aula.fim} onChange={(e) => setEditando({ ...editando, aula: { ...editando.aula, fim: e.target.value } })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button onClick={() => (editando && salvarAula(editando.i, editando.k, editando.aula), setEditando(null))}>Salvar aula ao vivo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ações do cronograma e da turma */}
      <Dialog open={!!modal} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          {modal === 'enviar' && (
            <>
              <DialogHeader>
                <DialogTitle>Enviar cronograma v{cron.versao} à DR</DialogTitle>
                <DialogDescription>Registre o envio feito por e-mail. Se o SENAI-{t.drContratante} não responder até o prazo, o cronograma conta como validado.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-1.5"><Label>Prazo para validação <Req /></Label><Input type="date" value={data} onChange={(e) => setData(e.target.value)} /></div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
                <Button onClick={() => (registrar({ cronograma: { ...cron, situacao: 'Aguardando validação', prazo: data } }, `Cronograma v${cron.versao} enviado à DR para validação (prazo ${dataBr(data)})`), setModal(null))}>Registrar envio</Button>
              </DialogFooter>
            </>
          )}
          {modal === 'versao' && (
            <>
              <DialogHeader>
                <DialogTitle>Nova versão do cronograma (v{cron.versao + 1})</DialogTitle>
                <DialogDescription>A DR pediu ajuste. O sistema gera o cronograma de novo a partir da data de início; a versão anterior fica no histórico.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5"><Label>Início da turma <Req /></Label><Input type="date" value={data} onChange={(e) => setData(e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>O que a DR pediu</Label><Textarea rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ex.: presencial às quintas; começar uma semana depois" /></div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
                <Button onClick={() => {
                  const r = gerarCronograma(t.modulos, parametrosPadrao(data || inicio), calendario)
                  registrar({ modulos: r.modulos, cronograma: { versao: cron.versao + 1, situacao: 'Rascunho' } }, `DR pediu ajuste${texto.trim() ? `: ${texto.trim()}` : ''}. Cronograma v${cron.versao + 1} gerado`)
                  setModal(null)
                }}>Gerar v{cron.versao + 1}</Button>
              </DialogFooter>
            </>
          )}
          {modal === 'prorrogar' && (
            <>
              <DialogHeader>
                <DialogTitle>Prorrogar início da turma</DialogTitle>
                <DialogDescription>Todas as datas (UCs e aulas ao vivo) andam junto. Não precisa de aditivo: a proposta aceita continua valendo.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5"><Label>Novo início <Req /></Label><Input type="date" value={data} onChange={(e) => setData(e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Motivo</Label><Textarea rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ex.: a DR não fechou a turma a tempo" /></div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
                <Button onClick={() => {
                  if (data && inicio) registrar({ modulos: deslocar(t.modulos, diasEntre(inicio, data)) }, `Início prorrogado de ${dataBr(inicio)} para ${dataBr(data)}${texto.trim() ? `: ${texto.trim()}` : ''}`)
                  setModal(null)
                }}>Prorrogar</Button>
              </DialogFooter>
            </>
          )}
          {modal === 'cancelar' && (
            <>
              <DialogHeader>
                <DialogTitle>Cancelar a turma {t.codigo}?</DialogTitle>
                <DialogDescription>A DR deve avisar com 10 dias de antecedência. A turma sai da alocação do PCP.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-1.5"><Label>Motivo <Req /></Label><Textarea rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ex.: a DR não atingiu o mínimo de inscritos" /></div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setModal(null)}>Voltar</Button>
                <Button onClick={() => (registrar({ fase: 'Cancelada', motivoCancelamento: texto.trim() }, `Turma cancelada${texto.trim() ? `: ${texto.trim()}` : ''}`), setModal(null))}>Cancelar turma</Button>
              </DialogFooter>
            </>
          )}
          {modal === 'escola' && (
            <>
              <DialogHeader>
                <DialogTitle>Adicionar escola</DialogTitle>
                <DialogDescription>Escola da DR contratante que terá alunos nesta turma.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5"><Label>Escola <Req /></Label><Input value={escola.nome} onChange={(e) => setEscola({ ...escola, nome: e.target.value })} /></div>
                <div className="grid grid-cols-[1fr_7rem] gap-3">
                  <div className="grid gap-1.5"><Label>Cidade <Req /></Label><Input value={escola.cidade} onChange={(e) => setEscola({ ...escola, cidade: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Alunos</Label><Input inputMode="numeric" value={escola.alunos || ''} onChange={(e) => setEscola({ ...escola, alunos: Number(e.target.value.replace(/\D/g, '')) })} /></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
                <Button onClick={() => (registrar({ escolas: [...(t.escolas ?? []), escola] }, `Escola adicionada: ${escola.nome} (${escola.alunos} alunos)`), setModal(null))}>Salvar escola</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      {dialogo}
    </>
  )
}
