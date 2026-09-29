import { Fragment, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NovoCursoDialog } from '@/pages/novo-curso-dialog'
import { Building, Eye, PackageCheck, Route } from 'lucide-react'
import { DataTable, PageHeader, RowAction, StatCard, type Column, type FilterDef } from '@/components/wf'
import { aprovadosAtuais, ofertaDe, ofertasEad, useCursosDr, type CursoDr } from '@/lib/mock'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'
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
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // CTM vê só os cursos da própria CTM, na listagem agrupada por modalidade
  const perfil = profileOf(useProfile())
  const minhaCtm = perfil.grupo === 'CTM' ? perfil.dr?.sigla.replace('SENAI-', '') : undefined
  const rows = aprovadosAtuais(all).filter((c) => !minhaCtm || (c.ctm ?? 'MG') === minhaCtm)
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
  if (minhaCtm) return (
    <>
      <PageHeader title="Portfólio das CTMs" description={`Cursos da CTM SENAI-${minhaCtm}.`} actions={<Button onClick={() => navigate('/portfolio/novo')}><Plus /> Novo curso</Button>} />
      <NovoCursoDialog open={pathname === '/portfolio/novo'} onOpenChange={(v) => !v && navigate('/portfolio')} />
      <PortfolioAgrupado rows={rows} onVer={setVer} />
      <ProdutoSheet id={ver} onClose={() => setVer(null)} somenteLeitura />
    </>
  )
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

// Listagem agrupada (formato do relatório): por modalidade, uma linha de Total e uma por curso; colunas por oferta EaD.
function PortfolioAgrupado({ rows, onVer }: { rows: CursoDr[]; onVer: (id: string) => void }) {
  const [q, setQ] = useState('')
  const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const vis = rows.filter((c) => norm(`${c.nome} ${c.modalidade ?? ''} ${c.area ?? ''}`).includes(norm(q.trim())))
  const grupos = Object.entries(vis.reduce<Record<string, CursoDr[]>>((r, c) => ((r[c.modalidade ?? '—'] ??= []).push(c), r), {})).sort((a, b) => b[1].length - a[1].length)
  const conta = (cs: CursoDr[], o?: string) => cs.filter((c) => !o || ofertaDe(c) === o).length
  const num = (x: number) => (x ? String(x) : '')
  return (
    <div className="space-y-3">
      <Input className="w-96 bg-card" placeholder="Buscar curso, modalidade ou área…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-x-auto rounded-[1.25rem] border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modalidade</TableHead>
              <TableHead>Curso</TableHead>
              {ofertasEad.map((o) => <TableHead key={o} className="text-right">{o}</TableHead>)}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grupos.map(([m, cs]) => (
              <Fragment key={m}>
                <TableRow className="bg-muted/40">
                  <TableCell className="font-semibold">{m}</TableCell>
                  <TableCell className="font-semibold">Total</TableCell>
                  {ofertasEad.map((o) => <TableCell key={o} className="text-right font-semibold tabular-nums">{num(conta(cs, o))}</TableCell>)}
                  <TableCell className="text-right font-bold tabular-nums">{cs.length}</TableCell>
                </TableRow>
                {cs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell />
                    <TableCell>
                      <button type="button" className="text-left hover:underline" onClick={() => onVer(c.id)}>{c.nome}</button>
                      <span className="block text-xs text-muted-foreground">{[c.area, c.cargaHorariaEdital ? `${c.cargaHorariaEdital} h` : ''].filter(Boolean).join(' · ')}</span>
                    </TableCell>
                    {ofertasEad.map((o) => <TableCell key={o} className="text-right tabular-nums">{ofertaDe(c) === o ? '1' : ''}</TableCell>)}
                    <TableCell className="text-right font-semibold tabular-nums">1</TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
            <TableRow className="border-t-2">
              <TableCell className="font-bold" colSpan={2}>Total</TableCell>
              {ofertasEad.map((o) => <TableCell key={o} className="text-right font-bold tabular-nums">{conta(vis, o)}</TableCell>)}
              <TableCell className="text-right text-base font-bold tabular-nums">{vis.length}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
