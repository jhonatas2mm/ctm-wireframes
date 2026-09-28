import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable, PageHeader, type Column } from '@/components/wf'
import { useContratos, type Contrato, type StatusContrato } from '@/lib/mock'
import { NovoProdutoSheet } from './novo-produto-sheet'

const statusVariant: Record<StatusContrato, 'default' | 'secondary' | 'outline'> = {
  Vigente: 'default',
  'Em elaboração': 'secondary',
  Encerrado: 'outline',
}

const colunas: Column<Contrato>[] = [
  { header: 'Contrato', value: (c) => c.numero, search: true, className: 'font-mono' },
  { header: 'DR', value: (c) => `SENAI-${c.dr}`, search: true, filter: true },
  {
    header: 'Vigência',
    value: (c) => (c.vigenciaInicio === '—' ? '—' : `${c.vigenciaInicio} a ${c.vigenciaFim}`),
    className: 'text-muted-foreground',
  },
  { header: 'Produtos', value: (c) => c.produtos, className: 'text-right tabular-nums' },
  {
    header: 'Status',
    value: (c) => c.status,
    filter: true,
    cell: (c) => <Badge variant={statusVariant[c.status]}>{c.status}</Badge>,
  },
]

// A side sheet "Novo produto" tem rota própria (/dashboard/novo-produto) para poder ser etapa de jornada.
export default function Dashboard() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { all: contratos } = useContratos()

  return (
    <>
      <PageHeader
        title="Dashboard"
        actions={
          <Button onClick={() => navigate('/dashboard/novo-produto')}>
            <Plus /> Novo produto
          </Button>
        }
      />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contratos</h2>
        <DataTable rows={contratos} columns={colunas} searchPlaceholder="Buscar contrato ou DR…" />
      </section>
      <NovoProdutoSheet
        open={pathname === '/dashboard/novo-produto'}
        onOpenChange={(v) => !v && navigate('/dashboard')}
      />
    </>
  )
}
