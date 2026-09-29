import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRightLeft, ChevronDown, Copy, Eye, FilePlus2, GitBranchPlus, Layers, Lock, Plus, SquareArrowOutUpRight, Trash2, X } from 'lucide-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { AttachField, DataTable, PageHeader, Req, RowAction, type Column, useConfirmar } from '@/components/wf'
import { StatusPropostaBadge } from '@/components/wf/status-proposta'
import {
  alertaPrazo, alunosProposta, aprovadosAtuais, contratoAtivo, dataBr, inicioPrevisto, nomeParte, saldoTaa, statusProposta,
  totalProposta, useContratos, useCursos, useCursosDr, useProdutos, useTurmas, valorNoEdital,
  type Contrato, type CursoProposta, type Produto, type Registro, type StatusProposta,
} from '@/lib/mock'
import { useAutor } from '@/lib/autor'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'
import { cn } from '@/lib/utils'
import { PropostaSheet } from './proposta-sheet'
import { excedentesProposta } from '@/lib/cobranca'

// CTM do usuário logado (Gestor EAD / Supervisor da SENAI-MG): é sempre a ofertante.
const DR_OFERTANTE = 'MG'
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const isoDe = (br?: string) => (br && br !== '—' ? br.split('/').reverse().join('-') : '')
const brDe = (iso: string) => (iso ? iso.split('-').reverse().join('/') : undefined)

// Nº da proposta num badge com botão de copiar dentro.
export function NumeroBadge({ numero }: { numero: string }) {
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

const colunas = (taas: Contrato[]): Column<Produto>[] => [
  { header: 'Código da proposta', value: (p) => p.numero, search: true, className: 'font-mono text-xs', cell: (p) => <NumeroBadge numero={p.numero} /> },
  { header: 'Versão', value: (p) => `v${p.versao ?? 1}`, className: 'tabular-nums' },
  { header: 'Status', value: (p) => p.status ?? 'Rascunho', filter: true, cell: (p) => <StatusPropostaBadge status={p.status} /> },
  { header: 'Contratante', value: (p) => nomeParte(p.drContratante), search: true, filter: true },
  {
    header: 'TAA / contrato',
    value: (p) => { const t = taas.find((x) => x.id === p.taaId); return t ? `TAA ${t.numero}` : '—' },
    filter: true,
    cell: (p) => {
      const t = taas.find((x) => x.id === p.taaId)
      return t
        ? <span className="flex items-center gap-1.5 text-xs"><span className="text-muted-foreground">TAA</span> <span className="font-mono">{t.numero}</span>{!contratoAtivo(t) && <Badge variant="outline">{t.status}</Badge>}</span>
        : <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-900"><AlertTriangle className="size-3" /> Sem vínculo</Badge>
    },
  },
  {
    header: 'Início previsto',
    value: (p) => (inicioPrevisto(p) ? dataBr(inicioPrevisto(p)!) : '—'),
    className: 'tabular-nums',
    // Alerta: ainda não assinada e a primeira turma começa em até 15 dias
    cell: (p) => {
      const ini = inicioPrevisto(p)
      const d = alertaPrazo(p)
      return (
        <span className="flex items-center gap-1.5">
          {ini ? dataBr(ini) : '—'}
          {d !== null && <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-900" title="Proposta ainda não assinada e a turma começa em breve"><AlertTriangle className="size-3" /> {d < 0 ? 'Prazo vencido' : `Faltam ${d} dias`}</Badge>}
        </span>
      )
    },
  },
  { header: 'Vigência', value: (p) => (p.vigenciaInicio ? `${p.vigenciaInicio} a ${p.vigenciaFim}` : '—'), className: 'tabular-nums text-muted-foreground' },
  { header: 'Alunos', value: (p) => alunosProposta(p), className: 'text-right tabular-nums' },
  { header: 'Valor', value: (p) => brl(totalProposta(p)), className: 'text-right tabular-nums' },
  { header: 'Responsável', value: (p) => p.responsavel?.nome ?? '—', filter: true },
]

// Gestão de propostas (CTM): a CTM cria a proposta, vinculada a um TAA/contrato aceito, depois que a negociação (fora do
// sistema) avança. O Gestor EAD é o responsável e muda o status conforme o retorno da DR solicitante.
// Versões vão e vêm (Nova versão), com histórico. Rotas: /produtos · /produtos/novo · /produtos/novo?versao=<id>
export default function Produtos() {
  const { confirmar, dialogo } = useConfirmar()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const taas = useContratos().all
  const { all: todas, remove, update } = useProdutos()
  const turmas = useTurmas().all
  const autor = useAutor()
  const [verProposta, setVerProposta] = useState<Produto | null>(null)
  const [mudar, setMudar] = useState<Produto | null>(null)
  const [novoStatus, setNovoStatus] = useState<StatusProposta>('Em andamento')
  const [motivo, setMotivo] = useState('')
  const historico = (p: Produto, texto: string): Registro[] => [{ quando: new Date().toISOString(), texto, autor }, ...(p.historico ?? [])]
  const abrirStatus = (p: Produto) => {
    const seguinte: Record<StatusProposta, StatusProposta> = { Rascunho: 'Em andamento', 'Em andamento': 'Aguardando', 'Aguardando': 'Aprovado', Aprovado: 'Aprovado', Cancelado: 'Cancelado' }
    setNovoStatus(seguinte[p.status ?? 'Rascunho'])
    setMotivo('')
    setMudar(p)
  }
  const fechada = (p: Produto) => p.status === 'Aprovado' || p.status === 'Cancelado'
  return (
    <>
      <PageHeader title="Gestão de propostas" actions={<Button onClick={() => navigate('/produtos/novo')}><Plus /> Nova proposta</Button>} />
      <DataTable
        cards
        rows={todas}
        columns={colunas(taas)}
        searchPlaceholder="Buscar código, contratante ou responsável…"
        actions={(p) => (
          <>
            {!fechada(p) && <RowAction label="Alterar status" icon={ArrowRightLeft} onClick={() => abrirStatus(p)} />}
            <RowAction label="Visualizar" icon={Eye} onClick={() => setVerProposta(p)} />
            <RowAction label="Abrir gestão da proposta" icon={SquareArrowOutUpRight} onClick={() => navigate(`/produtos/${p.id}`)} />
            {excedentesProposta(p, turmas).length > 0 && <RowAction label="Fazer aditivo" icon={FilePlus2} onClick={() => navigate(`/produtos/novo?versao=${p.id}&aditivo=1`)} />}
            <RowAction label="Nova versão" icon={GitBranchPlus} disabled={fechada(p)} motivo="Proposta assinada ou cancelada" onClick={() => navigate(`/produtos/novo?versao=${p.id}`)} />
            <RowAction label="Excluir" icon={Trash2} disabled={p.status !== 'Rascunho'} motivo="Só rascunho pode ser excluído" onClick={() => confirmar({ titulo: `Excluir o rascunho ${p.numero}?`, onConfirmar: () => remove(p.id) })} />
          </>
        )}
      />
      <PropostaSheet proposta={todas.find((x) => x.id === verProposta?.id) ?? null} onClose={() => setVerProposta(null)} />
      {/* Status: quem muda é o Gestor EAD, registrando o retorno da DR solicitante (negociação fora do sistema) */}
      <Dialog open={!!mudar} onOpenChange={(v) => !v && setMudar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Status da proposta {mudar?.numero}</DialogTitle>
            <DialogDescription>Atual: {mudar?.status ?? 'Rascunho'}. Registre o andamento combinado com a DR contratante.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Novo status <Req /></Label>
              <Select value={novoStatus} onValueChange={(v) => setNovoStatus(v as StatusProposta)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{statusProposta.filter((s) => s !== mudar?.status).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {novoStatus === 'Aprovado' && mudar && (() => {
              const t = taas.find((x) => x.id === mudar.taaId)
              const saldo = t ? saldoTaa(t, todas).saldo : 0
              return t && totalProposta(mudar) > saldo
                ? <p className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">O valor da proposta ({brl(totalProposta(mudar))}) passa o saldo do TAA {t.numero} ({brl(saldo)}).</p>
                : <p className="text-xs text-muted-foreground">Aprovada, a proposta passa a executar o saldo do TAA; em seguida vincula-se a equipe técnica e segue para as turmas.</p>
            })()}
            <label className="grid gap-1 text-xs">
              <span className="text-muted-foreground">{novoStatus === 'Cancelado' ? <>Motivo <Req /></> : 'Observação'}</span>
              <Textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder={novoStatus === 'Cancelado' ? 'Por que foi cancelada?' : 'Ex.: enviada por e-mail ao coordenador'} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMudar(null)}>Voltar</Button>
            <Button onClick={() => {
              if (!mudar) return
              const m = motivo.trim()
              update(mudar.id, { status: novoStatus, ...(novoStatus === 'Cancelado' ? { motivoCancelamento: m } : {}), historico: historico(mudar, `Status: ${novoStatus}${m ? ` — ${m}` : ''}`) })
              setMudar(null)
            }}>Salvar status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <NovaPropostaSheet open={pathname === '/produtos/novo'} base={todas.find((p) => p.id === params.get('versao'))} aditivo={params.get('aditivo') === '1'} onOpenChange={(v) => !v && navigate('/produtos')} />
      {dialogo}
    </>
  )
}

// Nova proposta (ou nova versão de uma existente, com base): TAA/contrato aceito → produtos do TAA → alunos e início
// por curso. Matriz curricular do portfólio (versão aprovada); valor por aluno do edital (fixo). Salva como Rascunho;
// nova versão guarda a anterior no histórico de versões.
function NovaPropostaSheet({ open, onOpenChange, base, aditivo }: { open: boolean; onOpenChange: (v: boolean) => void; base?: Produto; aditivo?: boolean }) {
  const db = useProdutos()
  // Aditivo: proposta aprovada com mais alunos no Moodle do que o contratado (vem da notificação)
  const turmas = useTurmas().all
  const excedentes = base && aditivo ? excedentesProposta(base, turmas) : []
  const catalogo = useCursos().all
  const portfolio = aprovadosAtuais(useCursosDr().all).filter((c) => (c.ctm ?? 'MG') === DR_OFERTANTE)
  const contratos = useContratos().all
  const taas = contratos.filter((c) => c.dr === DR_OFERTANTE && contratoAtivo(c))
  const autor = useAutor()
  const eu = profileOf(useProfile()).user
  const [taaId, setTaaId] = useState<string | null>(null)
  const [nomes, setNomes] = useState<string[]>([])
  const [alunos, setAlunos] = useState<Record<string, string>>({})
  const [inicios, setInicios] = useState<Record<string, string>>({})
  const [marcados, setMarcados] = useState<string[]>([])
  const [replicar, setReplicar] = useState(false)
  const [loteAlunos, setLoteAlunos] = useState('')
  const [aberta, setAberta] = useState<string | null>(null) // matriz aberta
  const [vigIni, setVigIni] = useState('')
  const [vigFim, setVigFim] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [crm, setCrm] = useState('')
  const [link, setLink] = useState('')
  const [faturamento, setFaturamento] = useState<'DR' | 'Escola'>('DR')
  const [escolas, setEscolas] = useState('')
  const [docs, setDocs] = useState<string[]>([])
  const [motivoVersao, setMotivoVersao] = useState('')
  const taa = contratos.find((c) => c.id === taaId)
  const produtos = taa?.produtos ?? []
  // Protótipo: já abre preenchido (nova: 1º TAA aceito; versão: dados da proposta).
  useEffect(() => {
    if (!open) return
    if (base) {
      setTaaId(base.taaId ?? null)
      setNomes(base.cursos.map((c) => c.nome))
      setAlunos(Object.fromEntries(base.cursos.map((c) => [c.nome, String(excedentes.find((e) => e.curso === c.nome)?.moodle ?? c.vagas ?? '')])))
      setInicios(Object.fromEntries(base.cursos.map((c) => [c.nome, c.inicioPrevisto ?? ''])))
      setVigIni(isoDe(base.vigenciaInicio))
      setVigFim(isoDe(base.vigenciaFim))
      setCnpj(base.cnpj ?? '')
      setCrm(base.crm ?? '')
      setLink(base.link ?? '')
      setFaturamento(base.faturamento ?? 'DR')
      setEscolas((base.escolas ?? []).join(', '))
      setDocs(base.documentos ?? [])
      setMotivoVersao(excedentes.length ? `Aditivo: ${excedentes.map((e) => `${e.curso} de ${e.proposta} para ${e.moodle} alunos (Moodle)`).join('; ')}.` : 'A DR pediu ajuste na quantidade de alunos.')
      return
    }
    const t = taas.find((x) => x.contratante === 'BA') ?? taas[0]
    const ps = (t?.produtos ?? []).slice(0, 2).map((p) => p.nome)
    setTaaId(t?.id ?? null)
    setNomes(ps)
    setAlunos(Object.fromEntries(ps.map((n, i) => [n, String(30 - i * 5)])))
    setInicios(Object.fromEntries(ps.map((n, i) => [n, i ? '2027-03-01' : '2026-11-16'])))
    setVigIni('2026-11-01')
    setVigFim('2027-10-31')
    setCnpj('03.795.071/0001-16')
    setCrm('')
    setLink('https://drive.senaimg.org.br/propostas/proposta.pdf')
    setFaturamento('DR')
    setEscolas('')
    setDocs(['Proposta-comercial.pdf'])
    setMotivoVersao('')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const escolher = (id: string) => {
    const t = contratos.find((c) => c.id === id)
    setTaaId(id)
    setNomes((xs) => xs.filter((n) => t?.produtos?.some((p) => p.nome === n)))
  }
  const cursos: CursoProposta[] = nomes.map((nome) => {
    const cat = catalogo.find((c) => c.nome === nome)
    const p = produtos.find((x) => x.nome === nome)
    const valorAluno = valorNoEdital(taa?.edital, nome) || p?.valor || 0
    const qtd = Number(alunos[nome]) || 0
    return {
      cursoId: cat?.id ?? nome, codigo: cat?.codigo ?? '—', nome, modalidade: p?.modalidade ?? cat?.modalidade ?? '—', area: p?.area ?? cat?.area ?? '—',
      cargaHoraria: p?.cargaHoraria ?? cat?.cargaHoraria ?? 0, valorAluno, vagas: qtd, valorPrevisto: valorAluno * qtd, inicioPrevisto: inicios[nome] || undefined,
    }
  })
  const total = cursos.reduce((t, c) => t + c.valorPrevisto, 0)
  // Saldo do TAA sem contar esta própria proposta (na nova versão)
  const saldo = taa ? saldoTaa(taa, db.all.filter((p) => p.id !== base?.id)).saldo : 0
  const ano = new Date().getFullYear()
  const numero = base?.numero ?? `PC-${DR_OFERTANTE}-${String(db.all.filter((p) => p.numero?.endsWith(`/${ano}`)).length + 1).padStart(3, '0')}/${ano}`
  const versao = base ? (base.versao ?? 1) + 1 : 1

  const salvar = () => {
    if (!taa || !cursos.length) return
    const agora = new Date().toISOString()
    const dados = {
      taaId: taa.id, edital: taa.edital, drOfertante: DR_OFERTANTE, drContratante: taa.contratante, cursos,
      vigenciaInicio: brDe(vigIni), vigenciaFim: brDe(vigFim), cnpj: cnpj || undefined, crm: crm || undefined, link: link || undefined,
      faturamento, escolas: faturamento === 'Escola' ? escolas.split(',').map((e) => e.trim()).filter(Boolean) : undefined, documentos: docs,
      responsavel: { nome: eu?.nome ?? autor, cargo: 'Gestor EAD' },
    }
    if (base) {
      // Nova versão: a atual vai para o histórico de versões (a proposta vai e vem)
      const anterior = { versao: base.versao ?? 1, cursos: base.cursos, vigenciaInicio: base.vigenciaInicio, vigenciaFim: base.vigenciaFim, salvaEm: agora, motivo: motivoVersao.trim() || undefined }
      db.update(base.id, { ...dados, versao, versoes: [...(base.versoes ?? []), anterior], historico: [{ quando: agora, texto: `${aditivo ? 'Aditivo' : 'Nova versão'} v${versao}${motivoVersao.trim() ? `: ${motivoVersao.trim()}` : ''}`, autor }, ...(base.historico ?? [])] })
    } else {
      db.add({ ...dados, numero, status: 'Rascunho', versao: 1, cadastradoEm: agora, historico: [{ quando: agora, texto: 'Proposta criada (Rascunho)', autor }] })
    }
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="data-[side=bottom]:h-[95vh] gap-0 overflow-hidden rounded-t-xl p-0">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <SheetTitle className="text-lg">{base ? (aditivo ? 'Aditivo da proposta' : 'Nova versão da proposta') : 'Nova proposta'}</SheetTitle>
            <NumeroBadge numero={numero} />
            <span className="flex items-center gap-2 rounded-md border-2 border-foreground px-2.5 py-0.5 text-sm font-semibold tabular-nums">
              {base && <span className="text-muted-foreground">v{base.versao ?? 1} →</span>} v{versao}
            </span>
          </div>
          <SheetDescription className="sr-only">Proposta comercial vinculada a um TAA aceito</SheetDescription>
        </SheetHeader>

        <div className="grid min-h-0 flex-1 grid-cols-[22rem_1fr_1.4fr]">
          {/* 1ª coluna: vínculo com o TAA e dados da proposta */}
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto border-r bg-muted/20 px-5 py-6">
            <h3 className="text-sm font-semibold">Dados da proposta</h3>
            <label className="grid gap-1 text-xs">
              <span className="text-muted-foreground">TAA / contrato aceito <Req /></span>
              <Select disabled={!!base} value={taaId} onValueChange={(v) => escolher(v as string)}>
                <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => { const t = contratos.find((c) => c.id === v); return t ? `TAA ${t.numero} · ${nomeParte(t.contratante)}` : 'Selecione o TAA' }}</SelectValue></SelectTrigger>
                <SelectContent>{taas.map((t) => <SelectItem key={t.id} value={t.id}>TAA {t.numero} · {nomeParte(t.contratante)}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            {taa && (
              <dl className="grid grid-cols-2 gap-2 rounded-lg border bg-background p-3 text-xs">
                <div><dt className="text-muted-foreground">Contratante</dt><dd className="font-medium">{nomeParte(taa.contratante)}</dd></div>
                <div><dt className="text-muted-foreground">Edital</dt><dd className="font-mono">{taa.edital ?? '—'}</dd></div>
                <div className="col-span-2"><dt className="text-muted-foreground">Saldo do TAA</dt><dd className="font-semibold tabular-nums">{brl(saldo)} <span className="font-normal text-muted-foreground">de {brl(taa.valor)}</span></dd></div>
              </dl>
            )}
            <label className="grid gap-1 text-xs">
              <span className="text-muted-foreground">Responsável (Gestor EAD)</span>
              <div className="flex h-9 items-center gap-1.5 rounded-md border bg-muted px-3 text-sm"><Lock className="size-3.5 text-muted-foreground" /> {eu?.nome ?? autor}</div>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs"><span className="text-muted-foreground">Início <Req /></span><Input type="date" value={vigIni} onChange={(e) => setVigIni(e.target.value)} /></label>
              <label className="grid gap-1 text-xs"><span className="text-muted-foreground">Fim <Req /></span><Input type="date" value={vigFim} onChange={(e) => setVigFim(e.target.value)} /></label>
            </div>
            {base && (
              <label className="grid gap-1 text-xs">
                <span className="text-muted-foreground">{aditivo ? 'Motivo do aditivo' : 'O que mudou nesta versão'} <Req /></span>
                <Textarea rows={3} value={motivoVersao} onChange={(e) => setMotivoVersao(e.target.value)} />
              </label>
            )}
            <label className="grid gap-1 text-xs"><span className="text-muted-foreground">CNPJ do contratante <Req /></span><Input inputMode="numeric" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} /></label>
            <label className="grid gap-1 text-xs">
              <span className="text-muted-foreground">Faturamento <Req /></span>
              <Select value={faturamento} onValueChange={(v) => setFaturamento(v as 'DR' | 'Escola')}>
                <SelectTrigger className="w-full"><SelectValue>{(v: string) => (v === 'Escola' ? 'Por escola' : 'Para a DR')}</SelectValue></SelectTrigger>
                <SelectContent><SelectItem value="DR">Para a DR</SelectItem><SelectItem value="Escola">Por escola</SelectItem></SelectContent>
              </Select>
            </label>
            {faturamento === 'Escola' && <label className="grid gap-1 text-xs"><span className="text-muted-foreground">Escolas faturadas <Req /></span><Input placeholder="Separe por vírgula" value={escolas} onChange={(e) => setEscolas(e.target.value)} /></label>}
            <label className="grid gap-1 text-xs"><span className="text-muted-foreground">Nº no CRM</span><Input placeholder="Opcional" value={crm} onChange={(e) => setCrm(e.target.value)} /></label>
            <label className="grid gap-1 text-xs"><span className="text-muted-foreground">Link do documento da proposta</span><Input placeholder="https://…" value={link} onChange={(e) => setLink(e.target.value)} /></label>
            <AttachField value={docs} onChange={setDocs} />
          </div>

          {/* 2ª coluna: produtos do TAA (o curso pode se repetir em outras propostas do mesmo TAA) */}
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto border-r px-6 py-6">
            <h3 className="text-sm font-semibold">Produtos do {taa ? `TAA ${taa.numero}` : 'TAA'} {nomes.length > 0 && <span className="font-normal text-muted-foreground">({nomes.length} na proposta)</span>}</h3>
            {!taa ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Escolha o TAA/contrato aceito.</p>
            ) : (
              <ul className="divide-y rounded-lg border bg-card">
                {produtos.map((p) => {
                  const on = nomes.includes(p.nome)
                  const m = portfolio.find((c) => c.nome === p.nome)
                  return (
                    <li key={p.nome}>
                      <label className={cn('flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50', on && 'bg-muted/60')}>
                        <input type="checkbox" checked={on} onChange={() => setNomes(on ? nomes.filter((n) => n !== p.nome) : [...nomes, p.nome])} />
                        <span className="min-w-0 flex-1"><span className="block font-medium">{p.nome}</span><span className="block text-xs text-muted-foreground">{p.modalidade} · {p.cargaHoraria} h · {m ? `matriz v${m.versao ?? 1}` : 'sem matriz aprovada no portfólio'}</span></span>
                        <span className="text-xs tabular-nums text-muted-foreground">{brl(valorNoEdital(taa.edital, p.nome) || p.valor)}/aluno</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* 3ª coluna: cursos da proposta — alunos e início; valor/aluno do edital (fixo); matriz do portfólio */}
          <div className="flex min-h-0 flex-col bg-muted/30">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              {!cursos.length ? (
                <div className="grid h-full place-items-center rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Marque os produtos à esquerda.</div>
              ) : (
                <div className="grid gap-3">
                  <div className="flex items-center justify-end gap-3">
                    <Button type="button" size="sm" variant="outline" disabled={!marcados.length} motivo="Selecione ao menos um curso" onClick={() => setReplicar(true)}><Copy /> Replicar alunos{marcados.length > 0 && ` (${marcados.length})`}</Button>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={marcados.length === cursos.length} onChange={(e) => setMarcados(e.target.checked ? cursos.map((c) => c.nome) : [])} /> Selecionar todos</label>
                  </div>
                  {cursos.map((c) => {
                    const m = portfolio.find((x) => x.nome === c.nome)
                    return (
                      <div key={c.nome} className="rounded-lg border bg-background">
                        <div className="flex flex-wrap items-end gap-3 px-3 py-2">
                          <input type="checkbox" className="self-center" aria-label={`Selecionar ${c.nome}`} checked={marcados.includes(c.nome)} onChange={() => setMarcados((xs) => (xs.includes(c.nome) ? xs.filter((x) => x !== c.nome) : [...xs, c.nome]))} />
                          <div className="min-w-[13rem] flex-1 self-center">
                            <p className="text-sm font-semibold">{c.nome}</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {[c.modalidade, `${c.cargaHoraria} h`, `${brl(c.valorAluno)}/aluno (edital)`].map((t) => (
                                <span key={t} className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"><Lock className="size-3" /> {t}</span>
                              ))}
                            </div>
                          </div>
                          <label className="grid w-24 gap-1 text-xs"><span className="text-muted-foreground">Alunos <Req /></span><Input className="h-8 tabular-nums" inputMode="numeric" value={alunos[c.nome] ?? ''} onChange={(e) => setAlunos((a) => ({ ...a, [c.nome]: e.target.value.replace(/\D/g, '') }))} /></label>
                          <label className="grid w-36 gap-1 text-xs"><span className="text-muted-foreground">Início previsto <Req /></span><Input className="h-8" type="date" value={inicios[c.nome] ?? ''} onChange={(e) => setInicios((a) => ({ ...a, [c.nome]: e.target.value }))} /></label>
                          <div className="grid w-32 gap-1 text-right text-xs"><span className="text-muted-foreground">Valor</span><span className="h-8 text-sm font-semibold leading-8 tabular-nums">{brl(c.valorPrevisto)}</span></div>
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remover ${c.nome}`} onClick={() => (setNomes((xs) => xs.filter((x) => x !== c.nome)), setMarcados((xs) => xs.filter((x) => x !== c.nome)))}><X /></Button>
                        </div>
                        {/* Matriz curricular: do portfólio da CTM (última versão aprovada), só leitura */}
                        <button type="button" onClick={() => setAberta(aberta === c.nome ? null : c.nome)} className="flex w-full items-center gap-1.5 border-t px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted/50">
                          <Layers className="size-3.5" /> Matriz curricular {m ? `(portfólio v${m.versao ?? 1})` : '— sem versão aprovada'} <ChevronDown className={cn('ml-auto size-3.5 transition-transform', aberta === c.nome && 'rotate-180')} />
                        </button>
                        {aberta === c.nome && m && (
                          <ol className="grid gap-1 border-t px-3 py-2 text-xs">
                            {m.modulos.map((mod, i) => (
                              <li key={i}><span className="font-medium">{i + 1}. {mod.nome}</span><span className="text-muted-foreground"> — {mod.unidades.map((u) => u.nome).join(', ')}</span></li>
                            ))}
                          </ol>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t bg-card px-6 py-4">
              <span className="text-sm text-muted-foreground">
                {cursos.length} curso(s) · {cursos.reduce((t, c) => t + (c.vagas ?? 0), 0)} alunos
                {taa && <span className={cn('block text-xs', total > saldo && 'font-medium text-red-600')}>Saldo do TAA depois desta proposta: {brl(saldo - total)}</span>}
              </span>
              <span className="text-2xl font-bold tabular-nums">{brl(total)}</span>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row items-center justify-end gap-2 border-t px-6 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!taa || !cursos.length} motivo={!taa ? 'O contratante precisa de TAA/contrato com a CTM' : 'Selecione ao menos um curso'} onClick={salvar}>{base ? `Salvar versão v${versao}` : 'Salvar proposta'}</Button>
        </SheetFooter>
      </SheetContent>
      <Dialog open={replicar} onOpenChange={setReplicar}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Replicar alunos em {marcados.length} curso(s)</DialogTitle></DialogHeader>
          <label className="grid gap-1 text-xs"><span className="text-muted-foreground">Quantidade de alunos</span><Input inputMode="numeric" value={loteAlunos} onChange={(e) => setLoteAlunos(e.target.value.replace(/\D/g, ''))} /></label>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReplicar(false)}>Cancelar</Button>
            <Button disabled={!loteAlunos} motivo="Informe a quantidade de alunos" onClick={() => (setAlunos((a) => ({ ...a, ...Object.fromEntries(marcados.map((n) => [n, loteAlunos])) })), setLoteAlunos(''), setReplicar(false))}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
