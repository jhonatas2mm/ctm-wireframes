import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, CalendarDays, CalendarX2, ChevronLeft, ChevronRight, CloudDownload, Info, Plus } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DataTable, PageHeader, Req, RowAction, type Column, useConfirmar } from '@/components/wf'
import { FONTE_FERIADOS, feriadosNacionais } from '@/lib/feriados'
import { HOJE, dataBr, useCalendario, type DataCalendario } from '@/lib/mock'
import { cn } from '@/lib/utils'

const semana = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' })
const ANO_ATUAL = Number(HOJE.slice(0, 4))

// Feriados nacionais (Super admin): a única base de datas do sistema; o gerador de cronograma só pula os feriados
// considerados. Feriado desconsiderado deixa de ser pulado (dá para considerar de novo). Os feriados podem ser
// buscados numa API de feriados (simulada no protótipo) para o ano atual e para o próximo.
// Por enquanto não há feriados/recessos por DR ou por CTM.
export default function Calendario() {
  const { confirmar, dialogo } = useConfirmar()
  const { all, update } = useCalendario()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [calendario, setCalendario] = useState(false)
  const [buscar, setBuscar] = useState(false)
  const colunas: Column<DataCalendario>[] = [
    { header: 'Data', value: (c) => dataBr(c.inicio), className: 'tabular-nums' },
    { header: 'Dia da semana', value: (c) => semana(c.inicio), className: 'text-muted-foreground' },
    { header: 'Feriado', value: (c) => c.nome, search: true, className: 'font-medium' },
    { header: 'Ano', value: (c) => c.inicio.slice(0, 4), filter: true, className: 'tabular-nums' },
    { header: 'Origem', value: (c) => c.origem ?? 'Manual', filter: true },
    { header: 'Situação', value: (c) => (c.desconsiderado ? 'Desconsiderado' : 'Considerado'), filter: true, cell: (c) => <Badge>{c.desconsiderado ? 'Desconsiderado' : 'Considerado'}</Badge> },
  ]
  return (
    <>
      <PageHeader
        title="Feriados nacionais"
        actions={
          <>
            <Button variant="outline" onClick={() => setCalendario(true)}><CalendarDays /> Visualizar calendário</Button>
            <Button variant="outline" onClick={() => setBuscar(true)}><CloudDownload /> Buscar feriados</Button>
            <Button onClick={() => navigate('/admin/feriados/novo')}><Plus /> Novo feriado</Button>
          </>
        }
      />
      <DataTable
        rows={[...all].sort((a, b) => a.inicio.localeCompare(b.inicio))}
        columns={colunas}
        searchPlaceholder="Buscar feriado…"
        actions={(c) => c.desconsiderado ? (
          <RowAction label="Considerar" icon={CalendarCheck} onClick={() => update(c.id, { desconsiderado: false })} />
        ) : (
          <RowAction label="Desconsiderar" icon={CalendarX2} onClick={() => confirmar({ titulo: `Desconsiderar “${c.nome}” (${dataBr(c.inicio)})?`, descricao: 'Os próximos cronogramas deixam de pular essa data. Dá para considerar de novo depois.', acao: 'Desconsiderar', onConfirmar: () => update(c.id, { desconsiderado: true }) })} />
        )}
      />
      <FeriadoSheet open={pathname === '/admin/feriados/novo'} onOpenChange={(v) => !v && navigate('/admin/feriados')} />
      <CalendarioSheet open={calendario} onOpenChange={setCalendario} feriados={all} />
      <BuscarFeriadosDialog open={buscar} onOpenChange={setBuscar} existentes={all} />
      {dialogo}
    </>
  )
}

// Novo feriado (manual).
function FeriadoSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const db = useCalendario()
  const [nome, setNome] = useState('')
  const [data, setData] = useState('')
  // Protótipo: já abre preenchido com um exemplo.
  useEffect(() => {
    if (!open) return
    setNome('Dia de Todos os Santos')
    setData('2027-11-01')
  }, [open])
  const salvar = () => {
    db.add({ nome: nome.trim(), tipo: 'Feriado nacional', inicio: data, origem: 'Manual' })
    onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">Novo feriado</SheetTitle>
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

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

// Calendário do ano (12 meses): feriado considerado em destaque; desconsiderado riscado.
function CalendarioSheet({ open, onOpenChange, feriados }: { open: boolean; onOpenChange: (v: boolean) => void; feriados: DataCalendario[] }) {
  const [ano, setAno] = useState(ANO_ATUAL)
  const porData = useMemo(() => {
    const m = new Map<string, DataCalendario[]>()
    feriados.forEach((f) => m.set(f.inicio, [...(m.get(f.inicio) ?? []), f]))
    return m
  }, [feriados])
  const doAno = feriados.filter((f) => f.inicio.startsWith(String(ano)))
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-4xl">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">Calendário de feriados</SheetTitle>
          <SheetDescription className="sr-only">Feriados nacionais do ano</SheetDescription>
        </SheetHeader>
        <div className="flex flex-wrap items-center gap-3 border-b px-6 py-3">
          <div className="flex items-center gap-1">
            <Button size="icon-sm" variant="outline" aria-label="Ano anterior" onClick={() => setAno(ano - 1)}><ChevronLeft /></Button>
            <span className="w-16 text-center text-lg font-semibold tabular-nums">{ano}</span>
            <Button size="icon-sm" variant="outline" aria-label="Próximo ano" onClick={() => setAno(ano + 1)}><ChevronRight /></Button>
          </div>
          <span className="text-sm text-muted-foreground">{doAno.filter((f) => !f.desconsiderado).length} considerados · {doAno.filter((f) => f.desconsiderado).length} desconsiderados</span>
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-primary" /> Considerado</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-full border border-dashed border-muted-foreground" /> Desconsiderado</span>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MESES.map((nome, m) => <Mes key={nome} nome={nome} ano={ano} mes={m} porData={porData} />)}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Mes({ nome, ano, mes, porData }: { nome: string; ano: number; mes: number; porData: Map<string, DataCalendario[]> }) {
  const primeiro = new Date(Date.UTC(ano, mes, 1)).getUTCDay()
  const dias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate()
  const celulas = [...Array(primeiro).fill(null), ...Array.from({ length: dias }, (_, i) => i + 1)]
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{nome}</h3>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <span key={i} className="pb-1 font-medium text-muted-foreground">{d}</span>)}
        {celulas.map((d, i) => {
          if (!d) return <span key={i} />
          const iso = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const fs = porData.get(iso) ?? []
          const considerado = fs.some((f) => !f.desconsiderado)
          const fim = i % 7 === 0 || i % 7 === 6
          return (
            <span
              key={i}
              title={fs.map((f) => `${f.nome}${f.desconsiderado ? ' (desconsiderado)' : ''}`).join(', ') || undefined}
              className={cn(
                'mx-auto flex size-7 items-center justify-center rounded-full tabular-nums',
                fim && 'text-muted-foreground',
                considerado && 'bg-primary font-semibold text-primary-foreground',
                fs.length > 0 && !considerado && 'border border-dashed border-muted-foreground text-muted-foreground line-through',
              )}
            >
              {d}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// Buscar feriados: mostra de onde vêm os dados (API), busca o ano atual e/ou o próximo e importa os que ainda não existem.
function BuscarFeriadosDialog({ open, onOpenChange, existentes }: { open: boolean; onOpenChange: (v: boolean) => void; existentes: DataCalendario[] }) {
  const db = useCalendario()
  const [anos, setAnos] = useState<number[]>([ANO_ATUAL, ANO_ATUAL + 1])
  const [buscando, setBuscando] = useState(false)
  const [achados, setAchados] = useState<{ data: string; nome: string }[] | null>(null)
  useEffect(() => {
    if (!open) return
    setAnos([ANO_ATUAL, ANO_ATUAL + 1])
    setAchados(null)
    setBuscando(false)
  }, [open])
  const ja = (f: { data: string; nome: string }) => existentes.some((e) => e.inicio === f.data && e.nome === f.nome)
  const novos = (achados ?? []).filter((f) => !ja(f))
  const buscar = () => {
    setBuscando(true)
    setAchados(null)
    // Simulação da chamada à API.
    setTimeout(() => {
      setAchados([...anos].sort().flatMap(feriadosNacionais))
      setBuscando(false)
    }, 600)
  }
  const importar = () => {
    novos.forEach((f) => db.add({ nome: f.nome, tipo: 'Feriado nacional', inicio: f.data, origem: 'BrasilAPI' }))
    onOpenChange(false)
  }
  const alternar = (a: number) => { setAnos(anos.includes(a) ? anos.filter((x) => x !== a) : [...anos, a]); setAchados(null) }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Buscar feriados</DialogTitle>
          <DialogDescription className="sr-only">Buscar feriados nacionais numa API</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2.5 rounded-lg border border-[#B7D9FB] bg-[#EEF7FF] p-3 text-sm text-[#164194]">
          <Info className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p><span className="font-semibold">Fonte: {FONTE_FERIADOS.nome}</span> ({FONTE_FERIADOS.site}). {FONTE_FERIADOS.descricao}</p>
            <p className="font-mono text-xs break-all">GET {FONTE_FERIADOS.endpoint('{ano}')}</p>
            <p className="text-xs">No protótipo a chamada é simulada. Só entram os feriados que ainda não estão cadastrados; os desconsiderados continuam como estão.</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Ano</Label>
          <div className="flex flex-wrap gap-2">
            {[ANO_ATUAL, ANO_ATUAL + 1].map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={anos.includes(a)}
                onClick={() => alternar(a)}
                className={cn('rounded-full border px-3 py-1 text-sm transition-colors', anos.includes(a) ? 'border-primary bg-accent font-semibold text-accent-foreground' : 'hover:bg-muted')}
              >
                {a} <span className="text-xs font-normal text-muted-foreground">{a === ANO_ATUAL ? '(ano atual)' : '(próximo ano)'}</span>
              </button>
            ))}
          </div>
        </div>
        {achados && (
          <div className="max-h-64 overflow-y-auto rounded-lg border">
            {achados.map((f) => (
              <div key={`${f.data}-${f.nome}`} className="flex items-center gap-3 border-b px-3 py-1.5 text-sm last:border-b-0">
                <span className="w-24 tabular-nums text-muted-foreground">{dataBr(f.data)}</span>
                <span className="flex-1">{f.nome}</span>
                <Badge variant="secondary" className={ja(f) ? 'bg-muted text-muted-foreground' : 'bg-emerald-100 text-emerald-800'}>{ja(f) ? 'Já cadastrado' : 'Novo'}</Badge>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          {achados ? (
            <Button disabled={!novos.length} onClick={importar}>{novos.length ? `Importar ${novos.length} feriado${novos.length > 1 ? 's' : ''}` : 'Nada novo para importar'}</Button>
          ) : (
            <Button disabled={!anos.length || buscando} onClick={buscar}><CloudDownload /> {buscando ? 'Buscando…' : 'Buscar'}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
