import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Download, Eye, Paperclip, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AttachField, DataTable, PageHeader, RowAction, type Column, useConfirmar } from '@/components/wf'
import { NovoTaSheet } from './novo-ta-sheet'
import { TaaSheet, statusVariant } from './taa-sheet'
import { useContratos, type Contrato } from '@/lib/mock'


const colunas: Column<Contrato>[] = [
  { header: 'Contrato', value: (c) => c.numero, search: true, className: 'font-mono' },
  { header: 'DR', value: (c) => `SENAI-${c.dr}`, search: true, filter: true },
  {
    header: 'Vigência',
    value: (c) => (c.vigenciaInicio === '—' ? '—' : `${c.vigenciaInicio} a ${c.vigenciaFim}`),
    className: 'text-muted-foreground',
  },
  {
    header: 'Status',
    value: (c) => c.status,
    filter: true,
    cell: (c) => <Badge variant={statusVariant[c.status]}>{c.status}</Badge>,
  },
]

export default function Dashboard() {
  const { confirmar, dialogo } = useConfirmar()
  const { all: contratos, remove, update } = useContratos()
  // TAA em elaboração aguardando o upload do assinado
  const [anexar, setAnexar] = useState<Contrato | null>(null)
  const [anexo, setAnexo] = useState<string[]>([])
  // Detalhes com rota própria (/dashboard/:id) para poder ser etapa de jornada.
  const { id: verId } = useParams()
  const setVerId = (id: string | null) => navigate(id ? `/dashboard/${id}` : '/dashboard')
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        title="Gestão de TAA"
        actions={
          <Button onClick={() => navigate('/dashboard/novo-ta')}>
            <Plus /> Novo TAA
          </Button>
        }
      />
      <section className="space-y-3">
        <DataTable
          rows={contratos}
          columns={colunas}
          searchPlaceholder="Buscar contrato ou DR…"
          actions={(c) => (
            <>
              <RowAction label="Visualizar" icon={Eye} onClick={() => setVerId(c.id)} />
              <RowAction label="Baixar modelo" icon={Download} onClick={() => {}} />
              {c.status === 'Em elaboração' && (
                <RowAction label="Anexar TAA assinado" icon={Paperclip} onClick={() => (setAnexo([`TAA-${c.numero.replace("/", "-")}-assinado.pdf`]), setAnexar(c))} />
              )}
              <RowAction
                label="Excluir"
                icon={Trash2}
                onClick={() => confirmar({ titulo: `Excluir o contrato ${c.numero}?`, onConfirmar: () => { remove(c.id) } })}
              />
            </>
          )}
        />
      </section>
      <TaaSheet taa={contratos.find((c) => c.id === verId) ?? null} onClose={() => setVerId(null)} onAnexar={(c) => (setAnexo([`TAA-${c.numero.replace("/", "-")}-assinado.pdf`]), setAnexar(c))} />
      <Dialog open={!!anexar} onOpenChange={(v) => !v && setAnexar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Anexar TAA assinado · {anexar?.numero}</DialogTitle>
          </DialogHeader>
          <AttachField value={anexo} onChange={setAnexo} label="Anexar TAA assinado" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAnexar(null)}>Cancelar</Button>
            <Button
              onClick={() => {
                update(anexar!.id, { anexoAssinado: anexo[0] ?? `TAA-${anexar!.numero.replace('/', '-')}-assinado.pdf`, status: 'Vigente' })
                setAnexar(null)
              }}
            >
              Salvar anexo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Side sheet com rota própria para poder ser etapa de jornada. */}
      <NovoTaSheet open={pathname === '/dashboard/novo-ta'} onOpenChange={(v) => !v && navigate('/dashboard')} />
      {dialogo}
    </>
  )
}
