import { Badge } from '@/components/ui/badge'
import type { StatusProposta } from '@/lib/mock'

const cls: Record<StatusProposta, string> = {
  'Em elaboração': 'bg-muted text-muted-foreground',
  'Em análise': 'bg-amber-100 text-amber-800',
  'Aceita pelo contratante': 'bg-sky-100 text-sky-800',
  Aceita: 'bg-emerald-100 text-emerald-800',
  Recusada: 'bg-red-100 text-red-800',
}

export function StatusPropostaBadge({ status = 'Em elaboração' }: { status?: StatusProposta }) {
  return <Badge variant="secondary" className={cls[status]}>{status}</Badge>
}
