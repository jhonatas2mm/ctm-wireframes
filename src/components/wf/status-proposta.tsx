import { Badge } from '@/components/ui/badge'
import type { StatusProposta } from '@/lib/mock'

const cls: Record<StatusProposta, string> = {
  Rascunho: 'bg-muted text-muted-foreground',
  'Em andamento': 'bg-sky-100 text-sky-800',
  'Aguardando': 'bg-amber-100 text-amber-800',
  Aprovado: 'bg-emerald-100 text-emerald-800',
  Cancelado: 'bg-muted text-muted-foreground line-through decoration-1',
}

export function StatusPropostaBadge({ status = 'Rascunho' }: { status?: StatusProposta }) {
  return <Badge variant="secondary" className={cls[status]}>{status}</Badge>
}
