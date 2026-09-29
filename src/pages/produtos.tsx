import { useEffect, useState } from 'react'
import { Check, CheckCircle2, Copy, Eye, XCircle, Lock, Plus, Search, ThumbsDown, ThumbsUp, Trash2, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { EditalDetalhes } from './edital-detalhes'
import { PropostaSheet } from './proposta-sheet'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { StatusPropostaBadge } from '@/components/wf/status-proposta'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AttachField, DataTable, Req, PageHeader, RowAction, type Column, useConfirmar } from '@/components/wf'
import { cn } from '@/lib/utils'
import { useCursos, useEditais, useProdutos, useTaasDr, type Produto, type StatusProposta } from '@/lib/mock'

const UFS = 'AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO'.split(' ')
// DR do usuário logado (perfil Supervisor) — é sempre a ofertante.
const DR_OFERTANTE = 'MG'
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const centavos = (v?: string) => Number(v || 0) / 100
const norm = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// Nº da proposta num badge com botão de copiar dentro.
function NumeroBadge({ numero }: { numero: string }) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1 font-mono">
      {numero}
      <button
        type="button"
        aria-label={`Copiar ${numero}`}
        title="Copiar número"
        className="hover:bg-foreground/10 rounded p-0.5"
        onClick={(e) => {
          e.stopPropagation()
          void navigator.clipboard.writeText(numero).catch(() => {})
        }}
      >
        <Copy className="size-3" />
      </button>
    </Badge>
  )
}

const colunas = (abrirEdital: (numero: string) => void): Column<Produto>[] => [
  { header: 'Código da proposta', value: (p) => p.numero ?? '—', search: true, className: 'font-mono text-xs', cell: (p) => <NumeroBadge numero={p.numero} /> },
  { header: 'Status', value: (p) => p.status ?? 'Em elaboração', filter: true, cell: (p) => <StatusPropostaBadge status={p.status} /> },
  {
    header: 'Edital',
    value: (p) => p.edital ?? '—',
    search: true,
    filter: true,
    className: 'font-mono text-xs',
    // Link para os detalhes do edital
    cell: (p) => (p.edital ? <button type="button" className="underline underline-offset-2 hover:text-foreground/70" onClick={() => abrirEdital(p.edital!)}>{p.edital}</button> : '—'),
  },
  { header: 'DR contratante', value: (p) => `SENAI-${p.drContratante}`, search: true, filter: true },
  { header: 'Vigência', value: (p) => (p.vigenciaInicio ? `${p.vigenciaInicio} a ${p.vigenciaFim}` : '—'), className: 'tabular-nums' },
  { header: 'Valor previsto', value: (p) => brl(p.cursos.reduce((t, c) => t + c.valorPrevisto, 0)), className: 'text-right tabular-nums' },
  { header: 'CH total', value: (p) => `${p.cursos.reduce((t, c) => t + c.cargaHoraria, 0)} h`, className: 'text-right tabular-nums' },
]

// Gestão de propostas de um TAA (Supervisor): aberta pelo menu de ações em Gestão de TAAs.
// Gestão de propostas (Supervisor/Comercial): menu próprio. Vindo de um TAA (/meus-taas/:taaId/produtos),
// redireciona para /produtos?taa=<id>, que filtra pelas propostas com a DR parceira do TAA.
export default function Produtos() {
  const { confirmar, dialogo } = useConfirmar()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { taaId } = useParams()
  const [params] = useSearchParams()
  const taa = useTaasDr().get(params.get('taa') ?? undefined)
  const { all: todas, remove, update } = useProdutos()
  // Aceite/recusa direto na listagem (recusa pede feedback), como na Gestão da proposta.
  const [decisao, setDecisao] = useState<{ p: Produto; tipo: 'Aceita' | 'Recusada' } | null>(null)
  const [feedback, setFeedback] = useState('')
  const [editalAberto, setEditalAberto] = useState<string | null>(null)
  const [verProposta, setVerProposta] = useState<Produto | null>(null)
  const editaisTodos = useEditais().all
  if (taaId) return <Navigate to={`/produtos${pathname.endsWith('/novo') ? '/novo' : ''}?taa=${taaId}`} replace />
  const all = taa ? todas.filter((p) => p.drContratante === taa.drParceira) : todas
  const qs = taa ? `?taa=${taa.id}` : ''
  return (
    <>
      <PageHeader
        title={<span className="flex items-center gap-3">Gestão de propostas {taa && <NumeroBadge numero={`TAA ${taa.numero}`} />}</span>}
        breadcrumb={taa ? [{ label: 'Gestão de TAAs', to: '/meus-taas' }, { label: `TAA ${taa.numero} · SENAI-${taa.drParceira}` }] : undefined}
        actions={
          <Button onClick={() => navigate(`/produtos/novo${qs}`)}>
            <Plus /> Nova proposta
          </Button>
        }
      />
      <DataTable
        rows={all}
        columns={colunas(setEditalAberto)}
        searchPlaceholder="Buscar por código ou curso…"
        actions={(p) => (
          <>
            {/* Decisão com texto; depois de decidida, vira um indicativo (rótulo e símbolo do resultado) */}
            {p.status === 'Aceita' ? (
              <span className="mr-1 inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800"><CheckCircle2 className="size-3.5" /> Aceita</span>
            ) : p.status === 'Recusada' ? (
              <span className="mr-1 inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800"><XCircle className="size-3.5" /> Recusada</span>
            ) : (
              <>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setDecisao({ p, tipo: 'Aceita' })}><ThumbsUp /> Aceitar</Button>
                <Button size="sm" variant="outline" className="mr-1 h-7 border-[#E31A1A]/40 px-2 text-xs text-[#C11414] hover:bg-[#FBE6E5] hover:text-[#C11414]" onClick={() => (setFeedback(''), setDecisao({ p, tipo: 'Recusada' }))}><ThumbsDown /> Recusar</Button>
              </>
            )}
            <RowAction label="Visualizar" icon={Eye} onClick={() => setVerProposta(p)} />
            {/* Proposta aceita não pode ser excluída: lixeira fica desabilitada */}
            <RowAction
              label="Excluir"
              motivo="Proposta aceita não pode ser excluída"
              icon={Trash2}
              disabled={p.status === 'Aceita'}
              onClick={() => confirmar({ titulo: `Excluir a proposta para SENAI-${p.drContratante}?`, onConfirmar: () => { remove(p.id) } })}
            />
          </>
        )}
      />
      <PropostaSheet proposta={todas.find((x) => x.id === verProposta?.id) ?? null} onClose={() => setVerProposta(null)} />
      <EditalDetalhes edital={editaisTodos.find((e) => e.numero === editalAberto) ?? null} onClose={() => setEditalAberto(null)} />
      <Dialog open={!!decisao} onOpenChange={(v) => !v && setDecisao(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{decisao?.tipo === 'Aceita' ? 'Aceitar proposta?' : 'Recusar proposta?'}</DialogTitle>
          </DialogHeader>
          {decisao?.tipo === 'Aceita' ? (
            <p className="text-sm text-muted-foreground">A proposta {decisao.p.numero} será registrada como aceita pelo SENAI-{decisao.p.drContratante}.</p>
          ) : (
            <label className="grid gap-1 text-xs">
              <span className="text-muted-foreground">Feedback da recusa <Req /></span>
              <Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Por que a proposta foi recusada?" />
            </label>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDecisao(null)}>Cancelar</Button>
            <Button
              variant="default"
              className={cn(decisao?.tipo === 'Recusada' && 'bg-[#E31A1A] text-white hover:bg-[#C11414]')}
              onClick={() => {
                if (!decisao) return
                update(decisao.p.id, decisao.tipo === 'Recusada' ? { status: 'Recusada', feedback: feedback.trim() } : { status: 'Aceita' })
                setDecisao(null)
              }}
            >
              {decisao?.tipo === 'Aceita' ? 'Aceitar' : 'Recusar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <NovaPropostaSheet open={pathname === '/produtos/novo'} contratanteFixo={taa?.drParceira} onOpenChange={(v) => !v && navigate(`/produtos${qs}`)} />
      {dialogo}
    </>
  )
}

function NovaPropostaSheet({ open, onOpenChange, contratanteFixo }: { open: boolean; onOpenChange: (v: boolean) => void; contratanteFixo?: string }) {
  const cursos = useCursos().all
  const db = useProdutos()
  const [busca, setBusca] = useState('')
  const [ids, setIds] = useState<string[]>([])
  const [valores, setValores] = useState<Record<string, string>>({}) // centavos por curso
  const [marcados, setMarcados] = useState<string[]>([])
  const [replicarAberto, setReplicarAberto] = useState(false)
  const [loteValor, setLoteValor] = useState('')
  const [escolhida, setContratante] = useState<string | null>(null)
  const [edital, setEdital] = useState<string | null>(null)
  const editais = useEditais().all.filter((e) => e.drs.includes(DR_OFERTANTE))
  // Dentro de um TAA, a DR contratante é a parceira do TAA (fixa).
  const contratante = contratanteFixo ?? escolhida
  const [docs, setDocs] = useState<string[]>([])
  const [vigIni, setVigIni] = useState('')
  const [vigFim, setVigFim] = useState('')
  const jaNoPortfolio = new Set(db.all.flatMap((p) => p.cursos.map((c) => c.cursoId)))
  // Protótipo: ao abrir, já vem preenchida com dados de exemplo (para validar o fluxo sem digitar).
  useEffect(() => {
    if (!open) return
    const livres = cursos.filter((c) => !jaNoPortfolio.has(c.id)).slice(0, 2)
    setEdital(editais[0]?.numero ?? null)
    setContratante('BA')
    setIds(livres.map((c) => c.id))
    setValores(Object.fromEntries(livres.map((c, i) => [c.id, String((i + 1) * 350000)])))
    setDocs(['Proposta-comercial.pdf'])
    setVigIni('2026-11-01')
    setVigFim('2027-10-31')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const visiveis = cursos.filter((c) => norm(`${c.codigo} ${c.nome} ${c.area} ${c.modalidade}`).includes(norm(busca.trim())))
  const sel = cursos.filter((c) => ids.includes(c.id))
  const total = sel.reduce((t, c) => t + centavos(valores[c.id]), 0)
  // Nº da proposta comercial: PC-<DR ofertante>-<seq>/<ano>
  const ano = new Date().getFullYear()
  const numero = `PC-${DR_OFERTANTE}-${String(db.all.filter((p) => p.numero?.endsWith(`/${ano}`)).length + 1).padStart(3, '0')}/${ano}`
  const reset = () => (setBusca(''), setIds([]), setValores({}), setMarcados([]), setLoteValor(''), setContratante(null), setEdital(null), setDocs([]), setVigIni(''), setVigFim(''))

  const podeSalvar = !!sel.length
  const salvar = (status: StatusProposta) => {
    if (!sel.length) return
    const cs = sel.map((c) => ({ cursoId: c.id, codigo: c.codigo, nome: c.nome, modalidade: c.modalidade, area: c.area, cargaHoraria: c.cargaHoraria, valorPrevisto: centavos(valores[c.id]) }))
    db.add({ numero, edital: edital ?? undefined, status, documentos: docs, drOfertante: DR_OFERTANTE, drContratante: contratante ?? '—', cursos: cs, vigenciaInicio: vigIni ? vigIni.split('-').reverse().join('/') : undefined, vigenciaFim: vigFim ? vigFim.split('-').reverse().join('/') : undefined, cadastradoEm: new Date().toISOString() })
    reset()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={(v) => (v || reset(), onOpenChange(v))}>
      <SheetContent side="bottom" className="data-[side=bottom]:h-[95vh] gap-0 overflow-hidden rounded-t-xl p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">Nova proposta</SheetTitle>
          <SheetDescription className="sr-only">Nova proposta</SheetDescription>
        </SheetHeader>

        <div className="grid min-h-0 flex-1 grid-cols-[20rem_1fr_1fr]">
          {/* 1ª coluna: dados da proposta */}
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto border-r bg-muted/20 px-5 py-6">
            <h3 className="text-sm font-semibold">Dados da proposta</h3>
            <div className="grid gap-3">
              <label className="grid gap-1 text-xs">
                <span className="text-muted-foreground">DR ofertante</span>
                <div className="bg-muted flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm">
                  <Lock className="text-muted-foreground size-3.5" /> SENAI-{DR_OFERTANTE}
                </div>
              </label>
              <label className="grid gap-1 text-xs">
                <span className="text-muted-foreground">Edital <Req /></span>
                <Select value={edital} onValueChange={(v) => setEdital(v as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v: string | null) => v ?? 'Selecione o edital'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {editais.map((e) => <SelectItem key={e.id} value={e.numero}>{e.numero}</SelectItem>)}
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1 text-xs">
                <span className="text-muted-foreground">DR contratante <Req /></span>
                <Select disabled={!!contratanteFixo} value={contratante} onValueChange={(v) => setContratante(v as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v: string | null) => (v ? `SENAI-${v}` : 'Selecione a DR')}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {UFS.filter((uf) => uf !== DR_OFERTANTE).map((uf) => (
                      <SelectItem key={uf} value={uf}>SENAI-{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs">
                <span className="text-muted-foreground">Início da vigência <Req /></span>
                <Input type="date" value={vigIni} onChange={(e) => setVigIni(e.target.value)} />
              </label>
              <label className="grid gap-1 text-xs">
                <span className="text-muted-foreground">Fim da vigência <Req /></span>
                <Input type="date" value={vigFim} onChange={(e) => setVigFim(e.target.value)} />
              </label>
              </div>
            </div>
            <AttachField value={docs} onChange={setDocs} />
          </div>

          {/* 2ª coluna: cursos do Itinerário Nacional */}
          <div className="flex min-h-0 flex-col gap-3 border-r px-6 py-6">
            <h3 className="text-sm font-semibold">Cursos do Itinerário Nacional {ids.length > 0 && <span className="text-muted-foreground font-normal">({ids.length} selecionados)</span>}</h3>
            <div className="flex min-h-0 flex-1 flex-col rounded-lg border">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <input
                  className="h-9 w-full bg-transparent pr-3 pl-9 text-sm outline-none"
                  placeholder="Buscar por código, nome, área ou modalidade…"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <ul className="min-h-0 flex-1 overflow-y-auto border-t">
                {visiveis.length === 0 && <li className="text-muted-foreground px-3 py-2 text-sm">Nenhum curso encontrado.</li>}
                {visiveis.map((c) => {
                  const usado = jaNoPortfolio.has(c.id)
                  const on = ids.includes(c.id)
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        disabled={usado}
                        onClick={() => setIds((xs) => (on ? xs.filter((x) => x !== c.id) : [...xs, c.id]))}
                        className={cn(
                          'flex w-full items-center gap-2 border-b px-3 py-1.5 text-left text-sm last:border-0',
                          on ? 'bg-accent' : 'hover:bg-accent/60',
                          usado && 'cursor-not-allowed opacity-50 hover:bg-transparent',
                        )}
                      >
                        <span className={cn('grid size-4 shrink-0 place-items-center rounded border', on && 'border-primary bg-primary text-primary-foreground')}>
                          {on && <Check className="size-3" />}
                        </span>
                        <span className="flex-1">
                          {c.nome}
                          <span className="text-muted-foreground block font-mono text-[11px]">{c.codigo}</span>
                        </span>
                        {usado ? <Badge variant="outline">Já nas propostas</Badge> : <span className="text-muted-foreground text-xs">{c.area}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* 3ª coluna: cursos escolhidos (dados do itinerário, não editáveis) com valor previsto */}
          <div className="bg-muted/30 flex min-h-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {!sel.length ? (
              <div className="text-muted-foreground grid h-full place-items-center rounded-lg border border-dashed p-8 text-center text-sm">
                Selecione um ou mais cursos à esquerda.
              </div>
            ) : (
              <div className="grid gap-3">
                <div className="flex items-center justify-end gap-3">
                  <Button type="button" size="sm" variant="outline" disabled={!marcados.length} onClick={() => setReplicarAberto(true)}>
                      <Copy /> Replicar valores{marcados.length > 0 && ` (${marcados.length})`}
                  </Button>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={marcados.length === sel.length} onChange={(e) => setMarcados(e.target.checked ? sel.map((c) => c.id) : [])} />
                    Selecionar todos
                  </label>
                </div>
                {sel.map((curso) => {
                  return (
                    <div key={curso.id} className="bg-background rounded-lg border">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <input type="checkbox" aria-label={`Selecionar ${curso.nome}`} checked={marcados.includes(curso.id)} onChange={() => setMarcados((m) => (m.includes(curso.id) ? m.filter((x) => x !== curso.id) : [...m, curso.id]))} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{curso.nome}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-muted-foreground font-mono text-xs">{curso.codigo}</span>
                            {[curso.modalidade, curso.area, `${curso.cargaHoraria} h`].map((t) => (
                              <span key={t} className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs">
                                <Lock className="size-3" /> {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <label className="grid w-44 shrink-0 gap-1 text-xs">
                          <span className="text-muted-foreground">Valor previsto <Req /></span>
                          <Input
                            className="h-8"
                            inputMode="numeric"
                            placeholder="R$ 0,00"
                            value={valores[curso.id] ? brl(centavos(valores[curso.id])) : ''}
                            onChange={(e) => setValores((v) => ({ ...v, [curso.id]: e.target.value.replace(/\D/g, '') }))}
                          />
                        </label>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remover ${curso.nome}`} onClick={() => (setIds((xs) => xs.filter((x) => x !== curso.id)), setMarcados((m) => m.filter((x) => x !== curso.id)))}>
                          <X />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {/* Total fixo no rodapé da 3ª coluna */}
          <div className="flex items-baseline justify-between gap-3 border-t bg-card px-6 py-4">
            <span className="text-muted-foreground text-sm">Valor total · {sel.length} curso(s)</span>
            <span className="text-2xl font-bold tabular-nums">{brl(total)}</span>
          </div>
          </div>
        </div>

        <SheetFooter className="flex-row items-center justify-end gap-4 border-t px-6 py-3">
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button disabled={!podeSalvar} onClick={() => salvar('Em elaboração')}>Salvar proposta</Button>
          </div>
        </SheetFooter>
      </SheetContent>
      <Dialog open={replicarAberto} onOpenChange={setReplicarAberto}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Replicar valor em {marcados.length} curso(s)</DialogTitle>
          </DialogHeader>
          <label className="grid gap-1 text-xs">
            <span className="text-muted-foreground">Valor previsto</span>
            <Input inputMode="numeric" placeholder="R$ 0,00" value={loteValor ? brl(centavos(loteValor)) : ''} onChange={(e) => setLoteValor(e.target.value.replace(/\D/g, ''))} />
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setReplicarAberto(false)}>Cancelar</Button>
            <Button
              type="button"
              disabled={!loteValor}
              onClick={() => {
                setValores((v) => ({ ...v, ...Object.fromEntries(marcados.map((id) => [id, loteValor])) }))
                setLoteValor('')
                setReplicarAberto(false)
              }}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
