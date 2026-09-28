import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable, PageHeader, RowAction, type Column } from '@/components/wf'
import { NovoTaSheet } from './novo-ta-sheet'
import { useContratos, type Contrato, type StatusContrato } from '@/lib/mock'

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

export default function Dashboard() {
  const { all: contratos, remove } = useContratos()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        title="Gestão de TA"
        actions={
          <Button onClick={() => navigate('/dashboard/novo-ta')}>
            <Plus /> Novo TA
          </Button>
        }
      />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Termos de Adesão</h2>
        <DataTable
          rows={contratos}
          columns={colunas}
          searchPlaceholder="Buscar contrato ou DR…"
          actions={(c) => (
            <>
              <RowAction label="Visualizar" icon={Eye} onClick={() => toast(`Visualizar ${c.numero} — tela a desenhar`)} />
              <RowAction
                label="Excluir"
                icon={Trash2}
                destructive
                onClick={() => {
                  if (!confirm(`Excluir o contrato ${c.numero}?`)) return
                  remove(c.id)
                  toast(`Contrato ${c.numero} excluído`)
                }}
              />
            </>
          )}
        />
      </section>
      {/* Side sheet com rota própria para poder ser etapa de jornada. */}
      <NovoTaSheet open={pathname === '/dashboard/novo-ta'} onOpenChange={(v) => !v && navigate('/dashboard')} />
    </>
  )
}
