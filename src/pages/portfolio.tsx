import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Building, Eye, PackageCheck, Route } from 'lucide-react'
import { DataTable, PageHeader, RowAction, StatCard, type Column, type FilterDef } from '@/components/wf'
import { aprovadosAtuais, useCursosDr, type CursoDr } from '@/lib/mock'
import { ProdutoSheet } from '@/pages/produto-sheets'

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')
const ctmDe = (c: CursoDr) => (c.ctm ? `SENAI-${c.ctm}` : '—')

// Portfólio das CTMs (/portfolio): cursos cadastrados pelas CTMs, visíveis para todos os DRs.
// Portfólio (/portfolio/aprovacoes, DN): a mesma consulta para o DN; o portfólio não tem aprovação nem reprovação.
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
      header: 'Curso', value: (c) => c.nome, search: true, className: 'font-medium',
      cell: (c) => (
        <div className="leading-tight">
          <span className="font-medium">{c.nome}</span>
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{[c.area, c.modalidade].filter(Boolean).join(' · ')}</span>
        </div>
      ),
    },
    { header: 'CTM', value: ctmDe, filter: true },
    { header: 'CH', value: (c) => `${c.cargaHorariaEdital ?? 0} h`, className: 'text-right tabular-nums' },
    { header: 'Itinerário', value: (c) => c.itinerario?.codigo ?? '—', cell: (c) => (c.itinerario ? <span className="flex items-center gap-1 font-mono text-xs"><Route className="size-3.5 text-muted-foreground" />{c.itinerario.codigo}</span> : '—') },
  ]
  return (
    <>
      <PageHeader title="Portfólio das CTMs" description="Cursos cadastrados pelas CTMs." />
      <DataTable rows={rows} columns={colunas} filters={filtrosPortfolio} searchPlaceholder="Buscar curso…" actions={(c) => <RowAction label="Visualizar" icon={Eye} onClick={() => setVer(c.id)} />} />
      <ProdutoSheet id={ver} onClose={() => setVer(null)} somenteLeitura />
    </>
  )
}

// Portfólio (DN, /portfolio/aprovacoes): consulta dos cursos das CTMs; sem aprovação nem reprovação.
function Aprovacoes() {
  const db = useCursosDr()
  const [ver, setVer] = useState<string | null>(null)
  const cursos = aprovadosAtuais(db.all)
  const colunas: Column<CursoDr>[] = [
    { header: 'Cadastrado em', value: (c) => data(c.criadoEm), className: 'tabular-nums' },
    { header: 'CTM', value: ctmDe, filter: true },
    { header: 'Modalidade', value: (c) => c.modalidade ?? '—', filter: true },
    { header: 'Curso', value: (c) => c.nome, search: true, className: 'font-medium' },
    { header: 'Itinerário', value: (c) => (c.itinerario ? 'Vinculado' : 'Sem vínculo'), filter: true },
  ]
  return (
    <>
      <PageHeader title="Portfólio" />
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <StatCard icon={PackageCheck} tom="green" label="Cursos no portfólio" value={String(cursos.length)} />
        <StatCard icon={Building} tom="blue" label="CTMs com cursos" value={String(new Set(cursos.map((c) => c.ctm)).size)} />
      </div>
      <DataTable rows={cursos} columns={colunas} searchPlaceholder="Buscar curso ou CTM…" actions={(c) => <RowAction label="Visualizar" icon={Eye} onClick={() => setVer(c.id)} />} />
      <ProdutoSheet id={ver} onClose={() => setVer(null)} somenteLeitura />
    </>
  )
}
