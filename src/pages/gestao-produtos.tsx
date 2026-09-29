import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, GitBranchPlus, Plus } from 'lucide-react'
import { useState } from 'react'
import { NovaVersaoSheet, ProdutoSheet, SituacaoBadge } from '@/pages/produto-sheets'
import { Button } from '@/components/ui/button'
import { NovoCursoDialog } from '@/pages/novo-curso-dialog'
import { DataTable, PageHeader, RowAction, type Column } from '@/components/wf'
import { aprovadosAtuais, raizDe, situacaoDe, useCursosDr, useEditais, useProdutos, type CursoDr } from '@/lib/mock'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'
import { EditalDetalhes } from '@/pages/edital-detalhes'

// Linha = produto (família de versões): a versão mais recente e a que está no portfólio (última aprovada).
type Linha = { id: string; atual: CursoDr; noPortfolio?: CursoDr; pendente: boolean; propostas: number }

const colunas = (abrirEdital: (numero: string) => void, todas: boolean): Column<Linha>[] => [
  { header: 'Produto', value: (l) => l.atual.nome, search: true, className: 'font-medium', cell: (l) => <span className="block max-w-72 truncate" title={l.atual.nome}>{l.atual.nome}</span> },
  ...(todas ? [{ header: 'CTM', value: (l: Linha) => (l.atual.ctm ? `SENAI-${l.atual.ctm}` : '—'), filter: true }] : []),
  {
    header: 'Edital',
    value: (l) => l.atual.edital ?? '—',
    search: true,
    filter: true,
    className: 'font-mono text-xs',
    cell: (l) => (l.atual.edital ? <button type="button" className="underline underline-offset-2 hover:text-foreground/70" onClick={() => abrirEdital(l.atual.edital!)}>{l.atual.edital}</button> : '—'),
  },
  { header: 'Última versão', value: (l) => `v${l.atual.versao ?? 1}`, className: 'tabular-nums' },
  { header: 'Situação', value: (l) => situacaoDe(l.atual), filter: true, cell: (l) => <SituacaoBadge c={l.atual} /> },
  { header: 'No portfólio', value: (l) => (l.noPortfolio ? `v${l.noPortfolio.versao ?? 1}` : '—'), className: 'tabular-nums' },
  { header: 'Área tecnológica', value: (l) => l.atual.area ?? '—', filter: true },
  { header: 'Itinerário', value: (l) => (l.atual.itinerario ? 'Vinculado' : 'Sem vínculo'), filter: true },
  { header: 'Documentos', value: (l) => l.atual.materiais?.length ?? 0, className: 'text-right tabular-nums' },
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
      pendente: familia.some((c) => situacaoDe(c) === 'Aguardando aprovação'),
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
        description="Produtos da sua CTM. Novos produtos e novas versões entram no portfólio depois da aprovação do DN."
        actions={<Button onClick={() => navigate('/gestao-produtos/novo')}><Plus /> Novo produto</Button>}
      />
      <NovoCursoDialog open={pathname === '/gestao-produtos/novo'} onOpenChange={(v) => !v && navigate('/gestao-produtos')} />
      <DataTable
        rows={linhas}
        columns={colunas(setEditalAberto, !ctm)}
        searchPlaceholder="Buscar produto…"
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
