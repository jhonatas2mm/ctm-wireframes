import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, FilePlus2, RotateCcw, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover } from '@base-ui/react/popover'
import { useProfile } from '@/journey/profile'
import { useCollection } from '@/lib/db'
import { useProdutos, useTurmas } from '@/lib/mock'
import { excedentesProposta } from '@/lib/cobranca'
import { cn } from '@/lib/utils'

// Estado de cada notificação (lida / dispensada), guardado como as demais coleções do protótipo.
type EstadoNotificacao = { id: string; lida?: boolean; dispensada?: boolean }

// Notificações da CTM (sino à direita da logo, no topo do menu): hoje, proposta com mais alunos nas salas do Moodle do
// que o contratado → fazer aditivo. Funções: filtrar não lidas, marcar como lida (uma ou todas), dispensar (uma ou
// todas = "Limpar todas") e restaurar as dispensadas. Abrir uma notificação a marca como lida.
export function Notificacoes() {
  const perfil = useProfile()
  const navigate = useNavigate()
  const propostas = useProdutos().all
  const turmas = useTurmas().all
  const estado = useCollection<EstadoNotificacao>('notificacoes-v1', [])
  const [aberto, setAberto] = useState(false)
  const [filtro, setFiltro] = useState<'todas' | 'nao-lidas'>('todas')
  if (!perfil.startsWith('CTM:') && perfil !== 'Super admin') return null

  const todas = propostas.flatMap((p) => excedentesProposta(p, turmas).map((e) => ({ id: `${p.id}:${e.curso}:${e.moodle}`, p, e })))
  const de = (id: string) => estado.get(id)
  const marcar = (id: string, patch: Omit<EstadoNotificacao, 'id'>) => (de(id) ? estado.update(id, patch) : estado.add({ id, ...patch }))
  const ativas = todas.filter((n) => !de(n.id)?.dispensada)
  const naoLidas = ativas.filter((n) => !de(n.id)?.lida)
  const dispensadas = todas.length - ativas.length
  const lista = filtro === 'nao-lidas' ? naoLidas : ativas

  return (
    <Popover.Root open={aberto} onOpenChange={setAberto}>
      <Popover.Trigger render={<Button variant="outline" size="icon" className="relative shrink-0" aria-label={`Notificações (${naoLidas.length} não lidas)`} />}>
        <Bell />
        {naoLidas.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] leading-none font-semibold text-white tabular-nums ring-2 ring-white">{naoLidas.length}</span>}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="right" align="start" sideOffset={8} className="z-50">
        <Popover.Popup className="w-[26rem] overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-lg outline-none">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notificações</span>
          <div className="flex gap-1">
            <Button size="xs" variant="ghost" disabled={!naoLidas.length} motivo="Nenhuma notificação não lida" onClick={() => naoLidas.forEach((n) => marcar(n.id, { lida: true }))}>
              <CheckCheck /> Marcar todas como lidas
            </Button>
            <Button size="xs" variant="ghost" disabled={!ativas.length} motivo="Nenhuma notificação" onClick={() => ativas.forEach((n) => marcar(n.id, { dispensada: true, lida: true }))}>
              <Trash2 /> Limpar todas
            </Button>
          </div>
        </div>
        <div className="flex gap-1 border-b px-4 py-2">
          {([['todas', `Todas (${ativas.length})`], ['nao-lidas', `Não lidas (${naoLidas.length})`]] as const).map(([v, rot]) => (
            <button key={v} type="button" aria-pressed={filtro === v} onClick={() => setFiltro(v)}
              className={cn('rounded-full border px-3 py-1 text-xs transition-colors', filtro === v ? 'border-primary bg-accent font-semibold text-accent-foreground' : 'hover:bg-muted')}>
              {rot}
            </button>
          ))}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {lista.length ? lista.map(({ id, p, e }) => {
            const lida = !!de(id)?.lida
            return (
              <div key={id} className={cn('group flex items-start gap-3 border-b px-4 py-3 last:border-b-0', !lida && 'bg-[#FFF6ED]/60')}>
                <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', lida ? 'bg-transparent' : 'bg-primary')} aria-hidden />
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => (marcar(id, { lida: true }), setAberto(false), navigate(`/produtos/${p.id}`))}>
                  <span className="flex items-center gap-1.5 text-sm font-medium"><FilePlus2 className="size-4 shrink-0 text-amber-600" /> Aditivo na proposta {p.numero}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{e.curso}: {e.moodle} alunos nas salas do Moodle, {e.proposta} na proposta (+{e.moodle - e.proposta}).</span>
                </button>
                <div className="flex shrink-0 gap-0.5">
                  <Button size="icon-xs" variant="ghost" className="text-neutral-500" aria-label={lida ? 'Marcar como não lida' : 'Marcar como lida'} onClick={() => marcar(id, { lida: !lida })}>
                    {lida ? <RotateCcw /> : <CheckCheck />}
                  </Button>
                  <Button size="icon-xs" variant="ghost" className="text-neutral-500" aria-label="Dispensar" onClick={() => marcar(id, { dispensada: true, lida: true })}>
                    <X />
                  </Button>
                </div>
              </div>
            )
          }) : (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">{filtro === 'nao-lidas' ? 'Nenhuma notificação não lida.' : 'Nenhuma notificação.'}</p>
          )}
        </div>
        {dispensadas > 0 && (
          <div className="border-t px-4 py-2">
            <button type="button" className="text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => todas.forEach((n) => de(n.id)?.dispensada && estado.update(n.id, { dispensada: false }))}>
              Restaurar {dispensadas} dispensada{dispensadas > 1 ? 's' : ''}
            </button>
          </div>
        )}
        </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
