import { Eye, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DataTable, PageHeader, RowAction, type Column } from '@/components/wf'
import { useEditais, type Edital } from '@/lib/mock'

// Por enquanto só o nome; demais campos do edital ainda em definição.
const colunas: Column<Edital>[] = [{ header: 'Nome', value: (e) => e.titulo, search: true, className: 'font-medium' }]

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
        searchPlaceholder="Buscar edital…"
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
