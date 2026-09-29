import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Tons do DS SENAI para o ícone (caixa arredondada colorida ao lado do número).
const tons = {
  orange: 'bg-[#FFF6ED] text-[#E84910]',
  blue: 'bg-[#EEF7FF] text-[#1670FA]',
  green: 'bg-[#E3F5EE] text-[#008257]',
  red: 'bg-[#FBE6E5] text-[#C11414]',
  amber: 'bg-[#FDF0E6] text-[#C23C0D]',
  gray: 'bg-[#F0F1F2] text-[#536167]',
}

export function StatCard({ label, value, hint, icon: Icon, tom = 'orange', compacto }: { label: string; value: string; hint?: string; icon?: LucideIcon; tom?: keyof typeof tons; compacto?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-[1.25rem] border bg-card', compacto ? 'p-3' : 'p-4')}>
      {Icon && (
        <div className={cn('flex shrink-0 items-center justify-center rounded-xl', compacto ? 'size-9' : 'size-11', tons[tom])}>
          <Icon className="size-5" />
        </div>
      )}
      <div className="min-w-0">
        <div className={cn('text-xs text-muted-foreground', !compacto && 'truncate')}>{label}</div>
        {/* compacto: para espaços estreitos (ex.: sheets), sem cortar valores longos */}
        <div className={cn('font-bold tabular-nums', compacto ? 'text-lg leading-tight break-words' : 'truncate text-2xl')}>{value}</div>
        {hint && <div className={cn('text-xs text-muted-foreground', !compacto && 'truncate')}>{hint}</div>}
      </div>
    </div>
  )
}
