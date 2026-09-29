import { useEffect, useState } from 'react'
import { Lock, Plus, Trash2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DataTable, PageHeader, Req, RowAction, type Column, useConfirmar } from '@/components/wf'
import { dataBr, diasEntre, useCalendario, type DataCalendario, type TipoData } from '@/lib/mock'

const semana = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' })

// Calendário da CTM: o gerador de cronograma pula feriados nacionais (fixos, iguais para todos) e os recessos/férias
// coletivas que a CTM cadastra aqui.
export default function Calendario() {
  const { confirmar, dialogo } = useConfirmar()
  const { all, remove } = useCalendario()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const colunas: Column<DataCalendario>[] = [
    { header: 'Data', value: (c) => (c.fim ? `${dataBr(c.inicio)} a ${dataBr(c.fim)}` : dataBr(c.inicio)), className: 'tabular-nums' },
    { header: 'Dia', value: (c) => (c.fim ? `${diasEntre(c.inicio, c.fim) + 1} dias` : semana(c.inicio)), className: 'text-muted-foreground' },
    { header: 'Nome', value: (c) => c.nome, search: true, className: 'font-medium' },
    {
      header: 'Tipo',
      value: (c) => c.tipo,
      filter: true,
      cell: (c) => c.tipo === 'Feriado nacional'
        ? <Badge variant="secondary" className="gap-1"><Lock className="size-3" /> {c.tipo}</Badge>
        : <Badge variant="outline">{c.tipo}</Badge>,
    },
  ]
  return (
    <>
      <PageHeader title="Calendário" actions={<Button onClick={() => navigate('/calendario/novo')}><Plus /> Novo período</Button>} />
      <DataTable
        rows={[...all].sort((a, b) => a.inicio.localeCompare(b.inicio))}
        columns={colunas}
        searchPlaceholder="Buscar feriado ou período…"
        actions={(c) => (
          <RowAction
            label="Excluir"
            icon={Trash2}
            disabled={c.tipo === 'Feriado nacional'}
            motivo="Feriados nacionais são fixos"
            onClick={() => confirmar({ titulo: `Excluir “${c.nome}”? Os próximos cronogramas deixam de pular esse período.`, onConfirmar: () => remove(c.id) })}
          />
        )}
      />
      <NovoPeriodoSheet open={pathname === '/calendario/novo'} onOpenChange={(v) => !v && navigate('/calendario')} />
      {dialogo}
    </>
  )
}

function NovoPeriodoSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const db = useCalendario()
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<TipoData>('Recesso')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  // Protótipo: já abre preenchido com dados de exemplo.
  useEffect(() => {
    if (!open) return
    setNome('Recesso de carnaval')
    setTipo('Recesso')
    setInicio('2027-02-10')
    setFim('2027-02-12')
  }, [open])
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">Novo período</SheetTitle>
          <SheetDescription className="sr-only">Cadastrar recesso ou férias coletivas</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="grid gap-1.5"><Label>Nome <Req /></Label><Input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
          <div className="grid gap-1.5">
            <Label>Tipo <Req /></Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoData)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Recesso">Recesso</SelectItem><SelectItem value="Férias coletivas">Férias coletivas</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Início <Req /></Label><Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Término <Req /></Label><Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} /></div>
          </div>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => (db.add({ nome: nome.trim(), tipo, inicio, fim: fim || undefined }), onOpenChange(false))}>Salvar período</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
