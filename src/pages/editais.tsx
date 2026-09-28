import { Eye, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, PageHeader, RowAction, type Column } from '@/components/wf'
import { useEditais, type Edital, type StatusEdital } from '@/lib/mock'

const statusVariant: Record<StatusEdital, 'default' | 'secondary' | 'outline'> = {
  'Inscrições abertas': 'default',
  Publicado: 'secondary',
  Rascunho: 'outline',
  Encerrado: 'outline',
}

const colunas: Column<Edital>[] = [
  { header: 'Edital', value: (e) => e.numero, search: true, className: 'font-mono' },
  { header: 'Título', value: (e) => e.titulo, search: true, className: 'font-medium' },
  { header: 'TA', value: (e) => e.ta, search: true, className: 'font-mono text-muted-foreground' },
  { header: 'DR', value: (e) => `SENAI-${e.dr}`, filter: true },
  {
    header: 'Inscrições',
    value: (e) => (e.inscricoesInicio === '—' ? '—' : `${e.inscricoesInicio} a ${e.inscricoesFim}`),
    className: 'text-muted-foreground',
  },
  { header: 'Vagas', value: (e) => e.vagas, className: 'text-right tabular-nums' },
  {
    header: 'Status',
    value: (e) => e.status,
    filter: true,
    cell: (e) => <Badge variant={statusVariant[e.status]}>{e.status}</Badge>,
  },
]

export default function Editais() {
  const { all, remove } = useEditais()
  return (
    <>
      <PageHeader
        title="Gestão de Editais"
        actions={
          // Desabilitado até a tela de Novo edital ser definida.
          <Button disabled>
            <Plus /> Novo edital
          </Button>
        }
      />
      <DataTable
        rows={all}
        columns={colunas}
        searchPlaceholder="Buscar edital, título ou TA…"
        actions={(e) => (
          <>
            <RowAction label="Visualizar" icon={Eye} onClick={() => toast(`Visualizar ${e.numero} — tela a desenhar`)} />
            <RowAction
              label="Excluir"
              icon={Trash2}
              destructive
              onClick={() => {
                if (!confirm(`Excluir o edital ${e.numero}?`)) return
                remove(e.id)
                toast(`Edital ${e.numero} excluído`)
              }}
            />
          </>
        )}
      />
    </>
  )
}
