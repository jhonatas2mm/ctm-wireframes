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

export function StatCard({ label, value, hint, icon: Icon, tom = 'orange' }: { label: string; value: string; hint?: string; icon?: LucideIcon; tom?: keyof typeof tons }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
      {Icon && (
        <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', tons[tom])}>
          <Icon className="size-5" />
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-2xl font-bold tabular-nums">{value}</div>
        {hint && <div className="truncate text-xs text-muted-foreground">{hint}</div>}
      </div>
    </div>
  )
}
