import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, GitBranchPlus, Info, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover } from '@base-ui/react/popover'
import { useState } from 'react'
import { NovaVersaoSheet, ProdutoSheet } from '@/pages/produto-sheets'
import { Button } from '@/components/ui/button'
import { NovoCursoDialog } from '@/pages/novo-curso-dialog'
import { cellButton, DataTable, PageHeader, RowAction, type Column } from '@/components/wf'
import { aprovadosAtuais, ofertaDe, raizDe, situacaoDe, useCursosDr, useEditais, useProdutos, type CursoDr } from '@/lib/mock'
import { Badge } from '@/components/ui/badge'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'
import { EditalDetalhes } from '@/pages/edital-detalhes'

// Linha = produto (família de versões): a versão mais recente e a que está no portfólio (última aprovada).
type Linha = { id: string; atual: CursoDr; noPortfolio?: CursoDr; pendente: boolean; propostas: number }

// Visão rápida do produto (dados do catálogo), no botão Detalhes ao lado do nome.
function CursoDetalhes({ c }: { c: CursoDr }) {
  const itens: [string, string][] = [['Modalidade', c.modalidade ?? '—'], ['Área tecnológica', c.area ?? '—'], ['Carga horária', c.cargaHorariaEdital ? `${c.cargaHorariaEdital} h` : '—']]
  return (
    <Popover.Root>
      <Popover.Trigger render={<Button size="icon-xs" variant="outline" className={cn(cellButton, 'size-6 px-0')} aria-label="Detalhes do curso" title="Detalhes do curso" />}>
        <Info />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={6} className="z-50">
          <Popover.Popup className="w-64 rounded-xl border bg-popover p-3 text-sm text-popover-foreground shadow-lg outline-none">
            <p className="mb-2 font-semibold">{c.nome}</p>
            <dl className="space-y-1.5">
              {itens.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

const colunas = (todas: boolean): Column<Linha>[] => [
  { header: 'Modalidade', value: (l) => l.atual.modalidade ?? '—', filter: true },
  { header: 'Oferta', value: (l) => ofertaDe(l.atual), filter: true, cell: (l) => <Badge variant="outline">{ofertaDe(l.atual)}</Badge> },
  {
    header: 'Curso', value: (l) => l.atual.nome, search: true, className: 'font-medium',
    cell: (l) => (
      <span className="flex items-center gap-1.5">
        <span className="max-w-64">{l.atual.nome}</span>
        <CursoDetalhes c={l.atual} />
      </span>
    ),
  },
  ...(todas ? [{ header: 'CTM', value: (l: Linha) => (l.atual.ctm ? `SENAI-${l.atual.ctm}` : '—'), filter: true }] : []),
  { header: 'Versão', value: (l) => `v${l.atual.versao ?? 1}`, className: 'tabular-nums' },
  { header: 'Itinerário', value: (l) => (l.atual.itinerario ? 'Vinculado' : 'Sem vínculo'), filter: true },
  { header: 'Propostas', value: (l) => l.propostas, className: 'text-right tabular-nums' },
]

// Gestão de Portfólio (CTM): produtos da CTM com versões. Novo produto e nova versão vão para aprovação do DN;
// só o aprovado aparece no Portfólio das CTMs (para todas as DRs) e na oferta.
export default function GestaoProdutos() {
  const { all: propostas } = useProdutos()
  const { all: todos } = useCursosDr()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const perfil = useProfile()
  const ctm = profileOf(perfil).dr?.sigla.replace('SENAI-', '') // Super admin: todas as CTMs
  const meus = ctm ? todos.filter((c) => (c.ctm ?? 'MG') === ctm) : todos
  const aprovados = aprovadosAtuais(meus)
  const raizes = [...new Set(meus.map(raizDe))]
  const linhas: Linha[] = raizes.map((r) => {
    const familia = meus.filter((c) => raizDe(c) === r).sort((a, b) => (b.versao ?? 1) - (a.versao ?? 1))
    const atual = familia[0]
    return {
      id: atual.id,
      atual,
      noPortfolio: aprovados.find((c) => raizDe(c) === r),
      pendente: familia.some((c) => situacaoDe(c) === 'Aguardando'),
      propostas: propostas.filter((p) => p.cursos.some((c) => c.nome === atual.nome)).length,
    }
  })
  const [ver, setVer] = useState<string | null>(null)
  const [versionar, setVersionar] = useState<string | null>(null)
  const [editalAberto, setEditalAberto] = useState<string | null>(null)
  const { all: editais } = useEditais()
  return (
    <>
      <PageHeader
        title="Gestão de Portfólio"
        description="Cursos da sua CTM. Curso novo entra no portfólio depois da aprovação do DN; novas versões são da CTM."
        actions={<Button onClick={() => navigate('/gestao-produtos/novo')}><Plus /> Novo curso</Button>}
      />
      <NovoCursoDialog open={pathname === '/gestao-produtos/novo'} onOpenChange={(v) => !v && navigate('/gestao-produtos')} />
      <DataTable
        rows={linhas}
        columns={colunas(!ctm)}
        searchPlaceholder="Buscar curso…"
        filters={[
          { label: 'Modalidade', values: (l) => [l.atual.modalidade ?? '—'] },
          { label: 'Área tecnológica', values: (l) => [l.atual.area ?? '—'] },
        ]}
        actions={(l) => (
          <>
            <RowAction label="Visualizar" icon={Eye} onClick={() => setVer(l.atual.id)} />
            <RowAction label="Nova versão" icon={GitBranchPlus} disabled={l.pendente} motivo="Já existe uma versão aguardando aprovação do DN" onClick={() => setVersionar(l.atual.id)} />
          </>
        )}
      />
      <EditalDetalhes edital={editais.find((e) => e.numero === editalAberto) ?? null} onClose={() => setEditalAberto(null)} />
      <ProdutoSheet id={ver} onClose={() => setVer(null)} onNovaVersao={(id) => setVersionar(id)} />
      <NovaVersaoSheet id={versionar} onClose={() => setVersionar(null)} onSaved={(id) => ver && setVer(id)} />
    </>
  )
}
