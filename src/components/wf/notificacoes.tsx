import { useNavigate } from 'react-router-dom'
import { Bell, FilePlus2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useProfile } from '@/journey/profile'
import { useProdutos, useTurmas } from '@/lib/mock'
import { excedentesProposta } from '@/lib/cobranca'

// Notificações da CTM (sino à direita da logo, no topo do menu): hoje, proposta com mais alunos nas salas do Moodle do que o contratado → fazer aditivo.
export function Notificacoes() {
  const perfil = useProfile()
  const navigate = useNavigate()
  const propostas = useProdutos().all
  const turmas = useTurmas().all
  if (!perfil.startsWith('CTM:') && perfil !== 'Super admin') return null
  const avisos = propostas.flatMap((p) => excedentesProposta(p, turmas).map((e) => ({ p, e })))
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative shrink-0" aria-label={`Notificações (${avisos.length})`} />}>
        <Bell />
        {avisos.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] leading-none font-semibold text-white tabular-nums ring-2 ring-white">{avisos.length}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-96">
        <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Notificações</p>
        {avisos.length ? avisos.map(({ p, e }) => (
          <DropdownMenuItem key={`${p.id}-${e.curso}`} className="items-start gap-2 py-2" onClick={() => navigate(`/produtos/${p.id}`)}>
            <FilePlus2 className="mt-0.5 size-4 text-amber-600" />
            <span className="min-w-0 text-sm">
              <span className="block font-medium">Aditivo na proposta {p.numero}</span>
              <span className="block text-xs text-muted-foreground">{e.curso}: {e.moodle} alunos nas salas do Moodle, {e.proposta} na proposta (+{e.moodle - e.proposta}).</span>
            </span>
          </DropdownMenuItem>
        )) : <p className="px-2 py-3 text-sm text-muted-foreground">Nenhuma notificação.</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
