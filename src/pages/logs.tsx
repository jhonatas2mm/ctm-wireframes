import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Activity, Check, Download, Eye, FilePlus2, List, LogIn, LogOut, Paperclip, PencilLine, Search, Trash2, Users, Workflow, X, type LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DataTable, PageHeader, RowAction, StatCard, type Column } from '@/components/wf'
import { useLogs, type LogSistema } from '@/lib/mock'

// Logs do sistema (Super admin): tudo o que os usuários fazem na plataforma — login, visualizações,
// criações, edições (com antes/depois), exclusões, aceites, exportações. /admin/logs/:id abre o detalhe em side nav.
const dataHora = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const iniciais = (n: string) => n.split(' ').map((p) => p[0]).slice(0, 2).join('')

export default function Logs() {
  const logs = useLogs().all
  const navigate = useNavigate()
  const { id } = useParams()
  const aberto = logs.find((l) => l.id === id) ?? null
  const [visao, setVisao] = useState<'linha' | 'tabela'>('linha')
  const conta = (...a: LogSistema['acao'][]) => logs.filter((l) => a.includes(l.acao)).length

  const colunas: Column<LogSistema>[] = [
    { header: 'Quando', value: (l) => dataHora(l.quando), className: 'tabular-nums whitespace-nowrap' },
    {
      header: 'Usuário',
      value: (l) => l.usuario,
      search: true,
      filter: true,
      cell: (l) => (
        <span className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#EEF7FF] text-[0.65rem] font-bold text-[#164194]">{iniciais(l.usuario)}</span>
          {l.usuario}
        </span>
      ),
    },
    { header: 'Perfil', value: (l) => l.perfil, filter: true, className: 'text-muted-foreground' },
    { header: 'Ação', value: (l) => l.acao, filter: true, cell: (l) => <Badge>{l.acao}</Badge> },
    { header: 'Módulo', value: (l) => l.modulo, filter: true },
    { header: 'Registro', value: (l) => l.registro, search: true, cell: (l) => <span className="block max-w-64 truncate" title={l.registro}>{l.registro}</span> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Logs do sistema" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Activity} tom="gray" label="Ações registradas" value={String(logs.length)} />
        <StatCard icon={Users} tom="blue" label="Usuários ativos" value={String(new Set(logs.map((l) => l.email)).size)} />
        <StatCard icon={PencilLine} tom="orange" label="Criações e edições" value={String(conta('Criou', 'Editou', 'Anexou'))} />
        <StatCard icon={Trash2} tom="red" label="Exclusões e recusas" value={String(conta('Excluiu', 'Recusou'))} />
      </div>
      <div className="flex justify-end">
        <div className="inline-flex rounded-xl border bg-card p-1">
          {([['linha', 'Linha do tempo', Workflow], ['tabela', 'Tabela', List]] as const).map(([v, t, I]) => (
            <button key={v} type="button" onClick={() => setVisao(v)} className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm', visao === v ? 'bg-accent font-semibold text-accent-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <I className="size-4" /> {t}
            </button>
          ))}
        </div>
      </div>
      {visao === 'linha' ? (
        <LinhaDoTempo logs={logs} abrir={(x) => navigate(`/admin/logs/${x}`)} />
      ) : (
      <DataTable
        rows={logs}
        columns={colunas}
        searchPlaceholder="Buscar usuário ou registro…"
        filters={[{ label: 'DR', values: (l) => [l.dr === 'DN' ? 'DN' : `SENAI-${l.dr}`] }]}
        onRowClick={(l) => navigate(`/admin/logs/${l.id}`)}
        actions={(l) => <RowAction label="Visualizar" icon={Eye} onClick={() => navigate(`/admin/logs/${l.id}`)} />}
      />
      )}

      <Sheet open={!!aberto} onOpenChange={(o) => !o && navigate('/admin/logs')}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-2xl">
          {aberto && <LogDetalhe l={aberto} doUsuario={logs.filter((x) => x.email === aberto.email && x.id !== aberto.id).slice(0, 6)} abrir={(x) => navigate(`/admin/logs/${x}`)} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function LogDetalhe({ l, doUsuario, abrir }: { l: LogSistema; doUsuario: LogSistema[]; abrir: (id: string) => void }) {
  return (
    <>
      <SheetHeader className="border-b">
        <SheetTitle className="flex items-center gap-3 text-lg">
          <Badge>{l.acao}</Badge> {l.registro === '—' ? l.modulo : l.registro}
        </SheetTitle>
      </SheetHeader>
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="flex items-center gap-3 rounded-2xl border p-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#EEF7FF] text-sm font-bold text-[#164194]">{iniciais(l.usuario)}</span>
          <div className="min-w-0">
            <div className="font-semibold">{l.usuario}</div>
            <div className="truncate text-xs text-muted-foreground">{l.email} · {l.perfil} · {l.dr === 'DN' ? 'DN' : `SENAI-${l.dr}`}</div>
          </div>
        </div>

        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <Dado r="Quando" v={dataHora(l.quando)} />
          <Dado r="Módulo" v={l.modulo} />
          <Dado r="IP" v={<span className="font-mono">{l.ip}</span>} />
          <Dado r="Dispositivo" v={l.dispositivo} />
        </dl>

        {l.alteracoes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">O que mudou</h3>
            <div className="overflow-hidden rounded-2xl border">
              <div className="grid grid-cols-3 border-b bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground">
                <span>Campo</span><span>Antes</span><span>Depois</span>
              </div>
              {l.alteracoes.map((a) => (
                <div key={a.campo} className="grid grid-cols-3 gap-2 border-b px-4 py-2.5 text-sm last:border-0">
                  <span className="font-medium">{a.campo}</span>
                  <span className="text-muted-foreground line-through decoration-[#C11414]/50">{a.antes}</span>
                  <span className="font-medium text-[#008257]">{a.depois}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {doUsuario.length > 0 && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><LogIn className="size-4 text-muted-foreground" /> Outras ações de {l.usuario.split(' ')[0]}</h3>
            <div className="divide-y rounded-2xl border">
              {doUsuario.map((x) => (
                <button key={x.id} type="button" onClick={() => abrir(x.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50">
                  <Badge>{x.acao}</Badge>
                  <span className="min-w-0 flex-1 truncate text-sm">{x.registro === '—' ? x.modulo : x.registro}</span>
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

// ── Linha do tempo ───────────────────────────────────────────────────────────
const icones: Record<LogSistema['acao'], [LucideIcon, string]> = {
  Login: [LogIn, 'bg-[#F0F1F2] text-[#536167]'], Logout: [LogOut, 'bg-[#F0F1F2] text-[#536167]'], Visualizou: [Eye, 'bg-[#F0F1F2] text-[#536167]'],
  Criou: [FilePlus2, 'bg-[#E3F5EE] text-[#008257]'], Aceitou: [Check, 'bg-[#E3F5EE] text-[#008257]'], Editou: [PencilLine, 'bg-[#FFF6ED] text-[#E84910]'],
  Excluiu: [Trash2, 'bg-[#FBE6E5] text-[#C11414]'], Recusou: [X, 'bg-[#FBE6E5] text-[#C11414]'], Exportou: [Download, 'bg-[#EEF7FF] text-[#1670FA]'], Anexou: [Paperclip, 'bg-[#EEF7FF] text-[#1670FA]'],
}
const verbo: Record<LogSistema['acao'], string> = {
  Login: 'entrou no sistema', Logout: 'saiu do sistema', Visualizou: 'visualizou', Criou: 'criou', Editou: 'editou', Excluiu: 'excluiu', Aceitou: 'aceitou', Recusou: 'recusou', Exportou: 'exportou', Anexou: 'anexou arquivo em',
}
const acoes = Object.keys(verbo) as LogSistema['acao'][]
const diaExtenso = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
const norm = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function LinhaDoTempo({ logs, abrir }: { logs: LogSistema[]; abrir: (id: string) => void }) {
  const [q, setQ] = useState('')
  const [acao, setAcao] = useState<LogSistema['acao'] | ''>('')
  const [qtd, setQtd] = useState(15)
  const lista = useMemo(() => {
    const t = norm(q.trim())
    return logs.filter((l) => (!acao || l.acao === acao) && (!t || norm(`${l.usuario} ${l.registro} ${l.modulo} ${l.perfil}`).includes(t)))
  }, [logs, q, acao])
  const visiveis = lista.slice(0, qtd)
  const dias = [...new Set(visiveis.map((l) => l.quando.slice(0, 10)))]

  return (
    <div className="overflow-hidden rounded-lg border bg-card" data-slot="data-table">
      <div className="space-y-3 border-b p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Buscar usuário, registro ou módulo…" value={q} onChange={(e) => (setQ(e.target.value), setQtd(15))} />
          </div>
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">{lista.length} ações</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['', ...acoes] as const).map((a) => (
            <button key={a || 'todas'} type="button" onClick={() => (setAcao(a), setQtd(15))} className={cn('rounded-full border px-3 py-1 text-xs', acao === a ? 'border-primary bg-accent font-semibold text-accent-foreground' : 'hover:bg-muted')}>
              {a || 'Todas'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 p-5">
        {dias.map((dia) => (
          <div key={dia}>
            <div className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{diaExtenso(dia + 'T12:00:00Z')}</div>
            <ol className="relative space-y-4 border-l border-[#E4E8E9] pl-6">
              {visiveis.filter((l) => l.quando.slice(0, 10) === dia).map((l) => {
                const [I, cor] = icones[l.acao]
                return (
                  <li key={l.id} className="relative">
                    <span className={cn('absolute top-0.5 -left-[2.4rem] flex size-7 items-center justify-center rounded-full ring-4 ring-card', cor)}>
                      <I className="size-3.5" />
                    </span>
                    <button type="button" onClick={() => abrir(l.id)} className="w-full rounded-xl p-2 -m-2 text-left hover:bg-muted/50">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm">
                          <b className="font-semibold">{l.usuario}</b> <span className="text-muted-foreground">{verbo[l.acao]}</span>{' '}
                          {l.registro !== '—' && <b className="font-semibold">{l.registro}</b>}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{hora(l.quando)}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{l.modulo} · {l.perfil} · {l.dr === 'DN' ? 'DN' : `SENAI-${l.dr}`}</div>
                      {l.alteracoes.length > 0 && (
                        <div className="mt-2 space-y-1 rounded-xl bg-muted/60 px-3 py-2 text-xs">
                          {l.alteracoes.map((a) => (
                            <div key={a.campo}>
                              <span className="text-muted-foreground">{a.campo}:</span>{' '}
                              <span className="line-through decoration-[#C11414]/50">{a.antes}</span> → <span className="font-semibold text-[#008257]">{a.depois}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
        {lista.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma ação encontrada.</p>}
        {lista.length > qtd && (
          <div className="flex justify-center">
            <button type="button" onClick={() => setQtd((n) => n + 15)} className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted">Carregar mais</button>
          </div>
        )}
      </div>
    </div>
  )
}
