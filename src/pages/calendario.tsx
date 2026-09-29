import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DataTable, PageHeader, Req, RowAction, type Column, useConfirmar } from '@/components/wf'
import { HOJE, dataBr, useCalendario, type DataCalendario } from '@/lib/mock'

const semana = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' })

// Feriados nacionais (Super admin): a única base de datas do sistema; o gerador de cronograma só pula estes dias.
// Por enquanto não há feriados/recessos por DR ou por CTM.
export default function Calendario() {
  const { confirmar, dialogo } = useConfirmar()
  const { all, remove } = useCalendario()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [editar, setEditar] = useState<DataCalendario | null>(null)
  const colunas: Column<DataCalendario>[] = [
    { header: 'Data', value: (c) => dataBr(c.inicio), className: 'tabular-nums' },
    { header: 'Dia da semana', value: (c) => semana(c.inicio), className: 'text-muted-foreground' },
    { header: 'Feriado', value: (c) => c.nome, search: true, className: 'font-medium' },
    { header: 'Ano', value: (c) => c.inicio.slice(0, 4), filter: true, className: 'tabular-nums' },
    { header: 'Situação', value: (c) => (c.inicio < HOJE ? 'Passado' : 'Próximo'), filter: true },
  ]
  return (
    <>
      <PageHeader title="Feriados nacionais" actions={<Button onClick={() => navigate('/admin/feriados/novo')}><Plus /> Novo feriado</Button>} />
      <DataTable
        rows={[...all].sort((a, b) => a.inicio.localeCompare(b.inicio))}
        columns={colunas}
        searchPlaceholder="Buscar feriado…"
        actions={(c) => (
          <>
            <RowAction label="Editar" icon={Pencil} onClick={() => setEditar(c)} />
            <RowAction label="Excluir" icon={Trash2} onClick={() => confirmar({ titulo: `Excluir “${c.nome}” (${dataBr(c.inicio)})? Os próximos cronogramas deixam de pular essa data.`, onConfirmar: () => remove(c.id) })} />
          </>
        )}
      />
      <FeriadoSheet open={pathname === '/admin/feriados/novo' || !!editar} feriado={editar} onOpenChange={(v) => { if (!v) { setEditar(null); if (pathname !== '/admin/feriados') navigate('/admin/feriados') } }} />
      {dialogo}
    </>
  )
}

// Novo feriado / editar feriado (mesmo formulário).
function FeriadoSheet({ open, feriado, onOpenChange }: { open: boolean; feriado: DataCalendario | null; onOpenChange: (v: boolean) => void }) {
  const db = useCalendario()
  const [nome, setNome] = useState('')
  const [data, setData] = useState('')
  // Protótipo: novo já abre preenchido com um exemplo.
  useEffect(() => {
    if (!open) return
    setNome(feriado?.nome ?? 'Dia de Todos os Santos')
    setData(feriado?.inicio ?? '2027-11-01')
  }, [open, feriado])
  const salvar = () => {
    if (feriado) db.update(feriado.id, { nome: nome.trim(), inicio: data })
    else db.add({ nome: nome.trim(), tipo: 'Feriado nacional', inicio: data })
    onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">{feriado ? 'Editar feriado' : 'Novo feriado'}</SheetTitle>
          <SheetDescription className="sr-only">Feriado nacional considerado no cronograma</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="grid gap-1.5"><Label>Feriado <Req /></Label><Input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label>Data <Req /></Label><Input type="date" value={data} onChange={(e) => setData(e.target.value)} /></div>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={salvar}>Salvar feriado</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
