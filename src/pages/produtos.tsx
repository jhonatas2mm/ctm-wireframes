import { useEffect, useState } from 'react'
import { AlertTriangle, Ban, Check, CheckCircle2, Copy, CopyPlus, Eye, XCircle, Lock, Plus, Search, ThumbsDown, ThumbsUp, Trash2, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { EditalDetalhes } from './edital-detalhes'
import { PropostaSheet } from './proposta-sheet'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { StatusPropostaBadge } from '@/components/wf/status-proposta'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AttachField, DataTable, Req, PageHeader, RowAction, type Column, useConfirmar } from '@/components/wf'
import { cn } from '@/lib/utils'
import { alertaPrazo, contratoAtivo, dataBr, inicioPrevisto, instrumentoDe, nomeParte, produtosContratados, taaEntre, useContratos, useCursos, useEditais, useProdutos, type Contrato, type Produto, type Registro } from '@/lib/mock'
import { useAutor } from '@/lib/autor'

// DR do usuário logado (perfil Supervisor) — é sempre a ofertante.
const DR_OFERTANTE = 'MG'
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const centavos = (v?: string) => Number(v || 0) / 100
const norm = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// Nº da proposta num badge com botão de copiar dentro.
function NumeroBadge({ numero }: { numero: string }) {
  return (
    <Badge variant="outline" className="gap-1 border-neutral-200 bg-neutral-100 pr-1 font-mono text-neutral-700">
      {numero}
      <button
        type="button"
        aria-label={`Copiar ${numero}`}
        title="Copiar número"
        className="rounded p-0.5 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800"
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

const colunas = (abrirEdital: (numero: string) => void, taas: Contrato[]): Column<Produto>[] => [
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
  { header: 'DR contratante', value: (p) => nomeParte(p.drContratante), search: true, filter: true },
  {
    // TAA (SENAI) ou contrato (SESI) que o contratante criou para contratar esta CTM; a CTM só consulta
    header: 'TAA / contrato',
    value: (p) => { const t = taaEntre(taas, p.drContratante, p.drOfertante); return t ? `${instrumentoDe(t.contratante)} ${t.numero}` : `Sem ${instrumentoDe(p.drContratante)}` },
    filter: true,
    cell: (p) => {
      const t = taaEntre(taas, p.drContratante, p.drOfertante)
      return t
        ? <span className="flex items-center gap-1.5 text-xs"><span className="text-muted-foreground">{instrumentoDe(t.contratante)}</span> <span className="font-mono">{t.numero}</span>{t.status !== 'Aceito' && <Badge variant="outline">{t.status}</Badge>}</span>
        : <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-900"><AlertTriangle className="size-3" /> Sem {instrumentoDe(p.drContratante)}</Badge>
    },
  },
  {
    header: 'Início previsto',
    value: (p) => (inicioPrevisto(p) ? dataBr(inicioPrevisto(p)!) : '—'),
    className: 'tabular-nums',
    // Alerta: ainda não aceita e a primeira turma começa em até 15 dias
    cell: (p) => {
      const ini = inicioPrevisto(p)
      const d = alertaPrazo(p)
      return (
        <span className="flex items-center gap-1.5">
          {ini ? dataBr(ini) : '—'}
          {d !== null && (
            <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-900" title="Proposta ainda não aceita e a turma começa em breve">
              <AlertTriangle className="size-3" /> {d < 0 ? 'Prazo vencido' : `Faltam ${d} dias`}
            </Badge>
          )}
        </span>
      )
    },
  },
  { header: 'Vigência', value: (p) => (p.vigenciaInicio ? `${p.vigenciaInicio} a ${p.vigenciaFim}` : '—'), className: 'tabular-nums' },
  { header: 'Valor previsto', value: (p) => brl(p.cursos.reduce((t, c) => t + c.valorPrevisto, 0)), className: 'text-right tabular-nums' },
  { header: 'CH total', value: (p) => `${p.cursos.reduce((t, c) => t + c.cargaHoraria, 0)} h`, className: 'text-right tabular-nums' },
]

// Gestão de propostas (CTM: Supervisor/Gestor de contrato): propostas da CTM para os contratantes que têm TAA com ela.
export default function Produtos() {
  const { confirmar, dialogo } = useConfirmar()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const taas = useContratos().all
  const { all: todas, remove, update } = useProdutos()
  const autor = useAutor()
  // Aceite/recusa direto na listagem (recusa pede feedback), como na Gestão da proposta; aceita ainda pode ser cancelada.
  const [decisao, setDecisao] = useState<{ p: Produto; tipo: 'Aceita' | 'Recusada' | 'Cancelada' } | null>(null)
  const historico = (p: Produto, texto: string): Registro[] => [{ quando: new Date().toISOString(), texto, autor }, ...(p.historico ?? [])]
  const [feedback, setFeedback] = useState('')
  const [editalAberto, setEditalAberto] = useState<string | null>(null)
  const [verProposta, setVerProposta] = useState<Produto | null>(null)
  const editaisTodos = useEditais().all
  const all = todas
  return (
    <>
      <PageHeader
        title="Gestão de propostas"
        actions={
          <Button onClick={() => navigate('/produtos/novo')}>
            <Plus /> Nova proposta
          </Button>
        }
      />
      <DataTable
        rows={all}
        columns={colunas(setEditalAberto, taas)}
        searchPlaceholder="Buscar por código ou curso…"
        actions={(p) => (
          <>
            {/* Decisão com texto; depois de decidida, vira um indicativo (rótulo e símbolo do resultado) */}
            {p.status === 'Aceita' ? (
              <span className="mr-1 inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800"><CheckCircle2 className="size-3.5" /> Aceita</span>
            ) : p.status === 'Recusada' ? (
              <span className="mr-1 inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800"><XCircle className="size-3.5" /> Recusada</span>
            ) : p.status === 'Cancelada' ? (
              <span className="mr-1 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"><Ban className="size-3.5" /> Cancelada</span>
            ) : (
              <>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setDecisao({ p, tipo: 'Aceita' })}><ThumbsUp /> Aceitar</Button>
                <Button size="sm" variant="outline" className="mr-1 h-7 border-[#E31A1A]/40 px-2 text-xs text-[#C11414] hover:bg-[#FBE6E5] hover:text-[#C11414]" onClick={() => (setFeedback(''), setDecisao({ p, tipo: 'Recusada' }))}><ThumbsDown /> Recusar</Button>
              </>
            )}
            <RowAction label="Visualizar" icon={Eye} onClick={() => setVerProposta(p)} />
            {/* Nova rodada de negociação: copia a proposta para ajustes */}
            <RowAction label="Duplicar" icon={CopyPlus} onClick={() => navigate(`/produtos/novo?de=${p.id}`)} />
            {/* Aceita ainda pode ser cancelada (ex.: a DR não fechou a turma) */}
            {p.status === 'Aceita' && <RowAction label="Cancelar proposta" icon={Ban} onClick={() => (setFeedback(''), setDecisao({ p, tipo: 'Cancelada' }))} />}
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
            <DialogTitle>{decisao?.tipo === 'Aceita' ? 'Aceitar proposta?' : decisao?.tipo === 'Cancelada' ? 'Cancelar proposta aceita?' : 'Recusar proposta?'}</DialogTitle>
          </DialogHeader>
          {decisao?.tipo === 'Aceita' ? (
            <p className="text-sm text-muted-foreground">A proposta {decisao.p.numero} será registrada como aceita pelo SENAI-{decisao.p.drContratante}.</p>
          ) : (
            <label className="grid gap-1 text-xs">
              <span className="text-muted-foreground">{decisao?.tipo === 'Cancelada' ? 'Motivo do cancelamento' : 'Feedback da recusa'} <Req /></span>
              <Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={decisao?.tipo === 'Cancelada' ? 'Ex.: a DR não fechou a turma' : 'Por que a proposta foi recusada?'} />
            </label>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDecisao(null)}>Voltar</Button>
            <Button
              variant="default"
              className={cn(decisao?.tipo !== 'Aceita' && 'bg-[#E31A1A] text-white hover:bg-[#C11414]')}
              onClick={() => {
                if (!decisao) return
                const { p, tipo } = decisao
                const motivo = feedback.trim()
                if (tipo === 'Aceita') update(p.id, { status: 'Aceita', historico: historico(p, `Proposta aceita pelo SENAI-${p.drContratante}`) })
                else if (tipo === 'Recusada') update(p.id, { status: 'Recusada', feedback: motivo, historico: historico(p, `Proposta recusada${motivo ? `: ${motivo}` : ''}`) })
                else update(p.id, { status: 'Cancelada', motivoCancelamento: motivo, historico: historico(p, `Proposta cancelada${motivo ? `: ${motivo}` : ''}`) })
                setDecisao(null)
              }}
            >
              {decisao?.tipo === 'Aceita' ? 'Aceitar' : decisao?.tipo === 'Cancelada' ? 'Cancelar proposta' : 'Recusar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <NovaPropostaSheet open={pathname === '/produtos/novo'} origem={todas.find((p) => p.id === params.get('de'))} onOpenChange={(v) => !v && navigate('/produtos')} />
      {dialogo}
    </>
  )
}

// origem: proposta duplicada (nova rodada de negociação) — abre com os dados dela para ajustes.
function NovaPropostaSheet({ open, onOpenChange, origem }: { open: boolean; onOpenChange: (v: boolean) => void; origem?: Produto }) {
  const cursos = useCursos().all
  const db = useProdutos()
  const autor = useAutor()
  const [vagas, setVagas] = useState<Record<string, string>>({})
  const [inicios, setInicios] = useState<Record<string, string>>({}) // início previsto por curso (ISO)
  const [cnpj, setCnpj] = useState('')
  const [crm, setCrm] = useState('')
  const [link, setLink] = useState('')
  const [faturamento, setFaturamento] = useState<'DR' | 'Escola'>('DR')
  const [escolas, setEscolas] = useState('')
  const [busca, setBusca] = useState('')
  const [ids, setIds] = useState<string[]>([])
  const [valores, setValores] = useState<Record<string, string>>({}) // centavos por curso
  const [marcados, setMarcados] = useState<string[]>([])
  const [replicarAberto, setReplicarAberto] = useState(false)
  const [loteValor, setLoteValor] = useState('')
  const [escolhida, setContratante] = useState<string | null>(null)
  const [edital, setEdital] = useState<string | null>(null)
  const editais = useEditais().all.filter((e) => e.drs.includes(DR_OFERTANTE))
  const contratante = escolhida
  // Contratantes possíveis: quem tem TAA (não encerrado) com esta CTM — DR solicitante ou o DN.
  const contratos = useContratos().all
  const comTaa = contratos.filter((c) => c.dr === DR_OFERTANTE && contratoAtivo(c))
  // Só os produtos que o contratante contratou desta CTM (TAA/contrato) podem entrar na proposta.
  const contratados = (quem: string | null) => (quem ? produtosContratados(contratos, quem, DR_OFERTANTE) : [])
  const [docs, setDocs] = useState<string[]>([])
  const [vigIni, setVigIni] = useState('')
  const [vigFim, setVigFim] = useState('')
  // Cada curso só entra em uma proposta; cursos de propostas recusadas/canceladas e da proposta duplicada ficam livres.
  const jaNoPortfolio = new Set(db.all.filter((p) => p.id !== origem?.id && p.status !== 'Recusada' && p.status !== 'Cancelada').flatMap((p) => p.cursos.map((c) => c.cursoId)))
  const isoDe = (br?: string) => (br ? br.split('/').reverse().join('-') : '')
  // Protótipo: ao abrir, já vem preenchida com dados de exemplo (ou com a proposta duplicada).
  useEffect(() => {
    if (!open) return
    if (origem) {
      setEdital(origem.edital ?? null)
      setContratante(origem.drContratante)
      setIds(origem.cursos.map((c) => c.cursoId))
      setValores(Object.fromEntries(origem.cursos.map((c) => [c.cursoId, String(Math.round(c.valorPrevisto * 100))])))
      setVagas(Object.fromEntries(origem.cursos.map((c) => [c.cursoId, String(c.vagas ?? '')])))
      setInicios(Object.fromEntries(origem.cursos.map((c) => [c.cursoId, c.inicioPrevisto ?? ''])))
      setCnpj(origem.cnpj ?? '')
      setCrm(origem.crm ?? '')
      setLink(origem.link ?? '')
      setFaturamento(origem.faturamento ?? 'DR')
      setEscolas((origem.escolas ?? []).join(', '))
      setDocs(origem.documentos ?? [])
      setVigIni(isoDe(origem.vigenciaInicio))
      setVigFim(isoDe(origem.vigenciaFim))
      return
    }
    // Exemplo: 1º contratante com produto contratado e ainda livre.
    const livresDe = (quem: string) => cursos.filter((c) => contratados(quem).includes(c.nome) && !jaNoPortfolio.has(c.id)).slice(0, 2)
    const quem = comTaa.map((t) => t.contratante).find((q) => livresDe(q).length) ?? comTaa[0]?.contratante ?? null
    const livres = quem ? livresDe(quem) : []
    setEdital(editais[0]?.numero ?? null)
    setContratante(quem)
    setIds(livres.map((c) => c.id))
    setValores(Object.fromEntries(livres.map((c, i) => [c.id, String((i + 1) * 350000)])))
    setVagas(Object.fromEntries(livres.map((c, i) => [c.id, String(30 - i * 5)])))
    setInicios(Object.fromEntries(livres.map((c, i) => [c.id, i ? '2027-02-01' : '2026-11-16'])))
    setCnpj('03.795.071/0001-16')
    setCrm('')
    setLink('https://drive.senaimg.org.br/propostas/proposta-senai-ba.pdf')
    setFaturamento('DR')
    setEscolas('')
    setDocs(['Proposta-comercial.pdf'])
    setVigIni('2026-11-01')
    setVigFim('2027-10-31')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const visiveis = cursos.filter((c) => contratados(contratante).includes(c.nome) && norm(`${c.codigo} ${c.nome} ${c.area} ${c.modalidade}`).includes(norm(busca.trim())))
  const sel = cursos.filter((c) => ids.includes(c.id))
  const total = sel.reduce((t, c) => t + centavos(valores[c.id]), 0)
  // Nº da proposta comercial: PC-<DR ofertante>-<seq>/<ano>
  const ano = new Date().getFullYear()
  const numero = `PC-${DR_OFERTANTE}-${String(db.all.filter((p) => p.numero?.endsWith(`/${ano}`)).length + 1).padStart(3, '0')}/${ano}`
  const reset = () => (setBusca(''), setIds([]), setValores({}), setVagas({}), setInicios({}), setMarcados([]), setLoteValor(''), setContratante(null), setEdital(null), setDocs([]), setVigIni(''), setVigFim(''), setCnpj(''), setCrm(''), setLink(''), setFaturamento('DR'), setEscolas(''))

  const podeSalvar = !!sel.length
  // Registro mínimo da proposta (o documento é feito fora, no modelo): sempre nasce Em negociação.
  const salvar = () => {
    if (!sel.length) return
    const agora = new Date().toISOString()
    const cs = sel.map((c) => ({ cursoId: c.id, codigo: c.codigo, nome: c.nome, modalidade: c.modalidade, area: c.area, cargaHoraria: c.cargaHoraria, valorPrevisto: centavos(valores[c.id]), vagas: Number(vagas[c.id]) || undefined, inicioPrevisto: inicios[c.id] || undefined }))
    const historico: Registro[] = [{ quando: agora, texto: origem ? `Proposta registrada (Em negociação): nova rodada a partir da ${origem.numero}` : 'Proposta registrada (Em negociação)', autor }]
    db.add({
      numero, edital: edital ?? undefined, status: 'Em negociação', documentos: docs, drOfertante: DR_OFERTANTE, drContratante: contratante ?? '—', cursos: cs,
      vigenciaInicio: vigIni ? vigIni.split('-').reverse().join('/') : undefined, vigenciaFim: vigFim ? vigFim.split('-').reverse().join('/') : undefined, cadastradoEm: agora,
      cnpj: cnpj || undefined, crm: crm || undefined, link: link || undefined, faturamento, escolas: faturamento === 'Escola' ? escolas.split(',').map((e) => e.trim()).filter(Boolean) : undefined,
      duplicadaDe: origem?.numero, historico,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={(v) => (v || reset(), onOpenChange(v))}>
      <SheetContent side="bottom" className="data-[side=bottom]:h-[95vh] gap-0 overflow-hidden rounded-t-xl p-0">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg">Nova proposta</SheetTitle>
            <NumeroBadge numero={numero} />
            {origem && <Badge variant="outline">Nova rodada a partir da {origem.numero}</Badge>}
          </div>
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
                <span className="text-muted-foreground">Contratante (com TAA ou contrato) <Req /></span>
                <Select value={contratante} onValueChange={(v) => { setContratante(v as string); setIds((xs) => xs.filter((id) => contratados(v as string).includes(cursos.find((c) => c.id === id)?.nome ?? ''))) }}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v: string | null) => (v ? nomeParte(v) : 'Selecione o contratante')}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {comTaa.map((t) => (
                      <SelectItem key={t.id} value={t.contratante}>{nomeParte(t.contratante)} <span className="text-xs text-muted-foreground">· {instrumentoDe(t.contratante)} {t.numero}{t.status !== 'Aceito' ? ` (${t.status})` : ''}</span></SelectItem>
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
              <label className="grid gap-1 text-xs">
                <span className="text-muted-foreground">CNPJ do contratante <Req /></span>
                <Input inputMode="numeric" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
              </label>
              <label className="grid gap-1 text-xs">
                <span className="text-muted-foreground">Faturamento <Req /></span>
                <Select value={faturamento} onValueChange={(v) => setFaturamento(v as 'DR' | 'Escola')}>
                  <SelectTrigger className="w-full"><SelectValue>{(v: string) => (v === 'Escola' ? 'Por escola' : 'Para a DR')}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DR">Para a DR</SelectItem>
                    <SelectItem value="Escola">Por escola</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              {faturamento === 'Escola' && (
                <label className="grid gap-1 text-xs">
                  <span className="text-muted-foreground">Escolas faturadas <Req /></span>
                  <Input placeholder="Separe por vírgula" value={escolas} onChange={(e) => setEscolas(e.target.value)} />
                </label>
              )}
              <label className="grid gap-1 text-xs">
                <span className="text-muted-foreground">Nº no CRM</span>
                <Input placeholder="Opcional" value={crm} onChange={(e) => setCrm(e.target.value)} />
              </label>
              <label className="grid gap-1 text-xs">
                <span className="text-muted-foreground">Link do documento da proposta</span>
                <Input placeholder="https://…" value={link} onChange={(e) => setLink(e.target.value)} />
              </label>
            </div>
            <AttachField value={docs} onChange={setDocs} />
          </div>

          {/* 2ª coluna: cursos do Itinerário Nacional */}
          <div className="flex min-h-0 flex-col gap-3 border-r px-6 py-6">
            <h3 className="text-sm font-semibold">Produtos do {contratante ? instrumentoDe(contratante) : 'TAA'} {ids.length > 0 && <span className="text-muted-foreground font-normal">({ids.length} selecionados)</span>}</h3>
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
                {visiveis.length === 0 && <li className="text-muted-foreground px-3 py-2 text-sm">{contratante ? `Nenhum produto contratado por ${nomeParte(contratante)} com esta CTM.` : 'Escolha o contratante.'}</li>}
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
                      <div className="flex flex-wrap items-end gap-3 px-3 py-2">
                        <input type="checkbox" aria-label={`Selecionar ${curso.nome}`} checked={marcados.includes(curso.id)} onChange={() => setMarcados((m) => (m.includes(curso.id) ? m.filter((x) => x !== curso.id) : [...m, curso.id]))} />
                        <div className="min-w-[14rem] flex-1 self-center">
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
                        <label className="grid w-20 shrink-0 gap-1 text-xs">
                          <span className="text-muted-foreground">Vagas <Req /></span>
                          <Input className="h-8 tabular-nums" inputMode="numeric" placeholder="0" value={vagas[curso.id] ?? ''} onChange={(e) => setVagas((v) => ({ ...v, [curso.id]: e.target.value.replace(/\D/g, '') }))} />
                        </label>
                        <label className="grid w-36 shrink-0 gap-1 text-xs">
                          <span className="text-muted-foreground">Início previsto <Req /></span>
                          <Input className="h-8" type="date" value={inicios[curso.id] ?? ''} onChange={(e) => setInicios((v) => ({ ...v, [curso.id]: e.target.value }))} />
                        </label>
                        <label className="grid w-40 shrink-0 gap-1 text-xs">
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
            <Button disabled={!podeSalvar} onClick={salvar}>Salvar proposta</Button>
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
