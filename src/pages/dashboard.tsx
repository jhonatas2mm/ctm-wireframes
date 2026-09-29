import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Download, Eye, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CellButton, DataTable, PageHeader, RowAction, type Column } from '@/components/wf'
import { NovoTaSheet } from './novo-ta-sheet'
import { SaldoTaa, TaaSheet } from './taa-sheet'
import { StatusTaaBadge, useFluxoTaa } from './taa-fluxo'
import { nomeParte, useContratos, type Contrato } from '@/lib/mock'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const colunas = (todos: boolean, verProdutos: (c: Contrato) => void): Column<Contrato>[] => [
  { header: 'Nº', value: (c) => c.numero, search: true, className: 'font-mono' },
  ...(todos ? [
    { header: 'Contratante', value: (c: Contrato) => nomeParte(c.contratante), search: true, filter: true },
    ] : []),
  { header: 'Contratada', value: (c) => `SENAI-${c.dr}`, search: true, filter: true },
  { header: 'Origem', value: (c) => (c.origem === 'CTM' ? 'CTM' : 'DR'), filter: true },
  // Botão que abre a lista de produtos numa side sheet (a coluna guarda os nomes para a busca)
  { header: 'Produtos', value: (c) => (c.produtos ?? []).map((p) => p.nome).join(', ') || '—', search: true, cell: (c) => (c.produtos?.length ? <CellButton onClick={() => verProdutos(c)}><Eye className="size-3" /> Visualizar</CellButton> : '—') },
  { header: 'Valor global', value: (c) => brl(c.valor), className: 'text-right tabular-nums' },
  { header: 'Executado', value: (c) => (c.status === 'Aceito' ? 'sim' : '—'), className: 'text-right', cell: (c) => (c.status === 'Aceito' ? <SaldoTaa c={c} compacto /> : '—') },
  { header: 'Vigência', value: (c) => `${c.vigenciaInicio} a ${c.vigenciaFim}`, className: 'text-muted-foreground tabular-nums' },
  { header: 'Status', value: (c) => c.status, filter: true, cell: (c) => <StatusTaaBadge c={c} /> },
]

// TAAs com CTMs (DR solicitante): o Gestor recebe os TAAs enviados pelas CTMs e analisa (aceita, retorna para ajuste
// ou recusa); também pode criar o próprio (a CTM analisa). Super admin vê todos, sem ações.
export default function Dashboard() {
  const perfil = useProfile()
  const todos = perfil === 'Super admin'
  const contratante = todos ? null : profileOf(perfil).dr?.sigla.replace('SENAI-', '') ?? 'MG'
  const { all: base } = useContratos()
  const contratos = todos ? base : base.filter((c) => c.contratante === contratante)
  const fluxo = useFluxoTaa(todos ? 'admin' : 'contratante')
  // Detalhes com rota própria (/dashboard/:id) para poder ser etapa de jornada.
  const { id: verId } = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const ver = (c: Contrato) => (fluxo.abrir(c), navigate(`/dashboard/${c.id}`))
  const aberto = base.find((c) => c.id === verId) ?? null
  const [produtosDe, setProdutosDe] = useState<Contrato | null>(null)
  return (
    <>
      <PageHeader
        title="TAAs com CTMs"
        actions={!todos && <Button onClick={() => navigate('/dashboard/novo-ta')}><Plus /> Novo TAA</Button>}
      />
      <DataTable
        rows={contratos}
        columns={colunas(todos, setProdutosDe)}
        searchPlaceholder="Buscar nº, CTM ou produto…"
        actions={(c) => (
          <>
            {fluxo.botoes(c)}
            <RowAction label="Visualizar" icon={Eye} onClick={() => ver(c)} />
            <RowAction label="Baixar termo" icon={Download} onClick={() => {}} />
          </>
        )}
      />
      <TaaSheet taa={aberto} onClose={() => navigate('/dashboard')} rodape={aberto && fluxo.botoes(aberto, 'rodape')} />
      <ProdutosSheet taa={produtosDe} onClose={() => setProdutosDe(null)} />
      {!todos && <NovoTaSheet open={pathname === '/dashboard/novo-ta'} contratante={contratante ?? 'MG'} onOpenChange={(v) => !v && navigate('/dashboard')} />}
      {fluxo.dialogos}
    </>
  )
}

// Produtos do TAA (side sheet aberta pelo botão Visualizar da coluna Produtos).
function ProdutosSheet({ taa, onClose }: { taa: Contrato | null; onClose: () => void }) {
  return (
    <Sheet open={!!taa} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">Produtos do TAA {taa?.numero}</SheetTitle>
          <SheetDescription>{taa?.edital ? `Edital ${taa.edital} · ` : ''}CTM SENAI-{taa?.dr}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <ul className="divide-y rounded-lg border bg-card">
            {(taa?.produtos ?? []).map((p) => (
              <li key={p.nome} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <span className="min-w-0 flex-1"><span className="block font-medium">{p.nome}</span><span className="block text-xs text-muted-foreground">{p.area} · {p.modalidade} · {p.cargaHoraria} h</span></span>
                <span className="tabular-nums">{brl(p.valor)}</span>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  )
}
