import { useNavigate, useParams } from 'react-router-dom'
import { Activity, AlertTriangle, Copy, Eye, Info, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DataTable, PageHeader, RowAction, StatCard, type Column } from '@/components/wf'
import { useLogs, type LogSistema } from '@/lib/mock'

// Logs do sistema (Super admin): eventos técnicos da plataforma (integrações, jobs, autenticação, e-mail, API).
// Diferente da Auditoria (quem fez o quê): aqui é saúde e erros do sistema. /admin/logs/:id abre o detalhe em side nav.
const dataHora = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function Logs() {
  const logs = useLogs().all
  const navigate = useNavigate()
  const { id } = useParams()
  const aberto = logs.find((l) => l.id === id) ?? null
  const conta = (n: LogSistema['nivel']) => logs.filter((l) => l.nivel === n).length

  const colunas: Column<LogSistema>[] = [
    { header: 'Quando', value: (l) => dataHora(l.quando), className: 'tabular-nums whitespace-nowrap' },
    { header: 'Nível', value: (l) => l.nivel, filter: true, cell: (l) => <Badge>{l.nivel}</Badge> },
    { header: 'Origem', value: (l) => l.origem, filter: true },
    { header: 'Mensagem', value: (l) => l.mensagem, search: true, cell: (l) => <span className="block max-w-md truncate" title={l.mensagem}>{l.mensagem}</span> },
    { header: 'Usuário', value: (l) => l.usuario ?? '—', search: true, className: 'text-muted-foreground' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Logs do sistema" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Activity} tom="gray" label="Eventos (últimas 24h)" value={String(logs.length)} />
        <StatCard icon={XCircle} tom="red" label="Erros" value={String(conta('Erro'))} />
        <StatCard icon={AlertTriangle} tom="amber" label="Avisos" value={String(conta('Aviso'))} />
        <StatCard icon={Info} tom="blue" label="Informativos" value={String(conta('Info'))} />
      </div>
      <DataTable
        rows={logs}
        columns={colunas}
        searchPlaceholder="Buscar mensagem, usuário…"
        onRowClick={(l) => navigate(`/admin/logs/${l.id}`)}
        actions={(l) => <RowAction label="Visualizar" icon={Eye} onClick={() => navigate(`/admin/logs/${l.id}`)} />}
      />

      <Sheet open={!!aberto} onOpenChange={(o) => !o && navigate('/admin/logs')}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-2xl">
          {aberto && <LogDetalhe l={aberto} relacionados={logs.filter((x) => x.origem === aberto.origem && x.id !== aberto.id).slice(0, 5)} abrir={(x) => navigate(`/admin/logs/${x}`)} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function LogDetalhe({ l, relacionados, abrir }: { l: LogSistema; relacionados: LogSistema[]; abrir: (id: string) => void }) {
  return (
    <>
      <SheetHeader className="border-b">
        <SheetTitle className="flex items-center gap-3 text-lg">
          <Badge>{l.nivel}</Badge> {l.origem}
        </SheetTitle>
      </SheetHeader>
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <p className="text-base font-semibold">{l.mensagem}</p>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <Dado r="Quando" v={dataHora(l.quando)} />
          <Dado r="Duração" v={`${l.duracaoMs.toLocaleString('pt-BR')} ms`} />
          <Dado r="Usuário" v={l.usuario ?? '—'} />
          <Dado
            r="Requisição"
            v={
              <span className="inline-flex items-center gap-1 font-mono">
                {l.requisicao}
                <Button size="icon-xs" variant="ghost" aria-label="Copiar" onClick={() => navigator.clipboard?.writeText(l.requisicao)}><Copy /></Button>
              </span>
            }
          />
        </dl>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{l.nivel === 'Erro' ? 'Stack trace' : 'Payload'}</h3>
          <pre className="overflow-x-auto rounded-2xl bg-[#22272A] p-4 font-mono text-xs leading-relaxed text-[#E4E8E9]">{l.detalhe}</pre>
        </div>
        {relacionados.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Outros eventos de {l.origem}</h3>
            <div className="divide-y rounded-2xl border">
              {relacionados.map((x) => (
                <button key={x.id} type="button" onClick={() => abrir(x.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50">
                  <Badge>{x.nivel}</Badge>
                  <span className="min-w-0 flex-1 truncate text-sm">{x.mensagem}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{dataHora(x.quando)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Dado({ r, v }: { r: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{r}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  )
}
