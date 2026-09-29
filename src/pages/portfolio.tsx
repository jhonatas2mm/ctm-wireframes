import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Check, ClipboardCheck, Eye, PackageCheck, Route, ThumbsDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DataTable, PageHeader, Req, RowAction, StatCard, type Column, type FilterDef, useConfirmar } from '@/components/wf'
import { aprovadosAtuais, situacaoDe, useCursosDr, type CursoDr } from '@/lib/mock'
import { ProdutoSheet, SituacaoBadge } from '@/pages/produto-sheets'

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')
const ctmDe = (c: CursoDr) => (c.ctm ? `SENAI-${c.ctm}` : '—')

// Portfólio das CTMs (/portfolio): o que foi aprovado pelo DN, visível para todas as DRs.
// Aprovação de portfólio (/portfolio/aprovacoes, DN): solicitações de novos produtos e novas versões.
export default function Portfolio() {
  const { pathname } = useLocation()
  return pathname.startsWith('/portfolio/aprovacoes') ? <Aprovacoes /> : <PortfolioPublico />
}

// Área e modalidade aparecem sob o nome do produto; continuam como filtros.
const filtrosPortfolio: FilterDef<CursoDr>[] = [
  { label: 'Área tecnológica', values: (c) => [c.area ?? '—'] },
  { label: 'Modalidade', values: (c) => [c.modalidade ?? '—'] },
]

function PortfolioPublico() {
  const { all } = useCursosDr()
  const [ver, setVer] = useState<string | null>(null)
  const rows = aprovadosAtuais(all)
  const colunas: Column<CursoDr>[] = [
    {
      header: 'Produto', value: (c) => c.nome, search: true, className: 'font-medium',
      cell: (c) => (
        <div className="leading-tight">
          <span className="font-medium">{c.nome}</span>
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{[c.area, c.modalidade].filter(Boolean).join(' · ')}</span>
        </div>
      ),
    },
    { header: 'CTM', value: ctmDe, filter: true },
    { header: 'Versão', value: (c) => `v${c.versao ?? 1}`, className: 'tabular-nums' },
    { header: 'CH', value: (c) => `${c.cargaHorariaEdital ?? 0} h`, className: 'text-right tabular-nums' },
    { header: 'Edital', value: (c) => c.edital ?? '—', filter: true, className: 'font-mono text-xs' },
    { header: 'Itinerário', value: (c) => c.itinerario?.codigo ?? '—', cell: (c) => (c.itinerario ? <span className="flex items-center gap-1 font-mono text-xs"><Route className="size-3.5 text-muted-foreground" />{c.itinerario.codigo}</span> : '—') },
    { header: 'Documentos', value: (c) => c.materiais?.length ?? 0, className: 'text-right tabular-nums' },
  ]
  return (
    <>
      <PageHeader title="Portfólio das CTMs" description="Produtos aprovados pelo DN, com a versão vigente de cada CTM." />
      <DataTable rows={rows} columns={colunas} filters={filtrosPortfolio} searchPlaceholder="Buscar produto…" actions={(c) => <RowAction label="Visualizar" icon={Eye} onClick={() => setVer(c.id)} />} />
      <ProdutoSheet id={ver} onClose={() => setVer(null)} somenteLeitura />
    </>
  )
}

function Aprovacoes() {
  const db = useCursosDr()
  const { confirmar, dialogo } = useConfirmar()
  const [ver, setVer] = useState<string | null>(null)
  const [reprovar, setReprovar] = useState<CursoDr | null>(null)
  const [motivo, setMotivo] = useState('')
  const pendentes = db.all.filter((c) => situacaoDe(c) === 'Aguardando')
  const decidir = (c: CursoDr, aprovado: boolean, mot?: string) =>
    db.update(c.id, { situacao: aprovado ? 'Aprovado' : 'Reprovado', motivo: aprovado ? undefined : mot, decididoEm: new Date().toISOString() })
  const aprovar = (c: CursoDr) => confirmar({
    titulo: `Aprovar ${c.nome} v${c.versao ?? 1} (${ctmDe(c)})?`,
    descricao: (c.versao ?? 1) > 1 ? 'A nova versão passa a ser a vigente no portfólio; a anterior continua valendo para o que já foi negociado.' : 'O produto entra no Portfólio das CTMs e fica disponível para todas as DRs.',
    acao: 'Aprovar',
    onConfirmar: () => decidir(c, true),
  })
  const colunas: Column<CursoDr>[] = [
    { header: 'Solicitado em', value: (c) => data(c.criadoEm), className: 'tabular-nums' },
    { header: 'CTM', value: ctmDe, filter: true },
    { header: 'Produto', value: (c) => c.nome, search: true, className: 'font-medium' },
    { header: 'Tipo', value: (c) => ((c.versao ?? 1) > 1 ? `Nova versão (v${c.versao})` : 'Novo produto'), filter: true },
    { header: 'Edital', value: (c) => c.edital ?? '—', className: 'font-mono text-xs' },
    { header: 'UCs', value: (c) => c.modulos.reduce((n, m) => n + m.unidades.length, 0), className: 'text-right tabular-nums' },
    { header: 'Itinerário', value: (c) => (c.itinerario ? 'Vinculado' : 'Sem vínculo'), filter: true },
    { header: 'Situação', value: (c) => situacaoDe(c), filter: true, cell: (c) => <SituacaoBadge c={c} /> },
  ]
  const historico = db.all.filter((c) => c.decididoEm).sort((a, b) => (b.decididoEm ?? '').localeCompare(a.decididoEm ?? ''))
  return (
    <>
      <PageHeader title="Aprovação de portfólio" />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={ClipboardCheck} tom="amber" label="Aguardando aprovação" value={String(pendentes.length)} />
        <StatCard icon={PackageCheck} tom="green" label="Produtos no portfólio" value={String(aprovadosAtuais(db.all).length)} />
        <StatCard icon={ThumbsDown} tom="red" label="Reprovados" value={String(db.all.filter((c) => situacaoDe(c) === 'Reprovado').length)} />
      </div>
      <DataTable
        rows={[...pendentes, ...historico.filter((c) => !pendentes.includes(c))]}
        columns={colunas}
        searchPlaceholder="Buscar produto ou CTM…"
        actions={(c) => (
          <>
            <RowAction label="Visualizar" icon={Eye} onClick={() => setVer(c.id)} />
            {situacaoDe(c) === 'Aguardando' && (
              <>
                <RowAction label="Aprovar" icon={Check} onClick={() => aprovar(c)} />
                <RowAction label="Reprovar" icon={X} onClick={() => (setMotivo(''), setReprovar(c))} />
              </>
            )}
          </>
        )}
      />
      <ProdutoSheet
        id={ver}
        onClose={() => setVer(null)}
        somenteLeitura
        acoes={(c) => situacaoDe(c) === 'Aguardando' && (
          <>
            <Button variant="outline" onClick={() => (setMotivo(''), setReprovar(c))}><X /> Reprovar</Button>
            <Button onClick={() => aprovar(c)}><Check /> Aprovar</Button>
          </>
        )}
      />
      <Dialog open={!!reprovar} onOpenChange={(v) => !v && setReprovar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reprovar {reprovar?.nome} v{reprovar?.versao ?? 1}?</DialogTitle>
            <DialogDescription>A CTM vê o motivo e pode enviar uma nova versão.</DialogDescription>
          </DialogHeader>
          <label className="grid gap-1 text-xs">
            <span className="text-muted-foreground">Motivo <Req /></span>
            <Textarea rows={4} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="O que precisa ser ajustado?" />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReprovar(null)}>Voltar</Button>
            <Button onClick={() => (reprovar && decidir(reprovar, false, motivo.trim()), setReprovar(null))}>Reprovar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogo}
    </>
  )
}

