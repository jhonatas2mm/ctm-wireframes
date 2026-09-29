import type * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Peças dos painéis (dashboards) de cada perfil, no padrão do DS SENAI.
const tons = {
  orange: 'bg-[#FFF6ED] text-[#E84910]',
  blue: 'bg-[#EEF7FF] text-[#1670FA]',
  green: 'bg-[#E3F5EE] text-[#008257]',
  red: 'bg-[#FBE6E5] text-[#C11414]',
  amber: 'bg-[#FDF0E6] text-[#C23C0D]',
  gray: 'bg-[#F0F1F2] text-[#536167]',
}
export type Tom = keyof typeof tons
const barra: Record<Tom, string> = { orange: '#E84910', blue: '#1670FA', green: '#00A369', red: '#E31A1A', amber: '#F8833F', gray: '#A7B5B9' }

export function IconBox({ icon: Icon, tom, className }: { icon: LucideIcon; tom: Tom; className?: string }) {
  return <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', tons[tom], className)}><Icon className="size-5" /></div>
}

export const Bloco = ({ className, ...p }: React.ComponentProps<'section'>) => <section className={cn('rounded-3xl bg-card p-5', className)} {...p} />

export function BlocoTitulo({ titulo, sub, acao }: { titulo: string; sub?: string; acao?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <div className="text-lg font-bold">{titulo}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      {acao}
    </div>
  )
}

// Indicador grande com ícone, rótulo e complemento.
export function Kpi({ icon, tom, rotulo, valor, extra }: { icon: LucideIcon; tom: Tom; rotulo: string; valor: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <Bloco className="flex items-center gap-4 p-4">
      <IconBox icon={icon} tom={tom} className="size-12" />
      <div className="min-w-0">
        <div className="truncate text-xs text-muted-foreground">{rotulo}</div>
        <div className="truncate text-2xl font-bold tabular-nums">{valor}</div>
        {extra && <div className="truncate text-xs text-muted-foreground">{extra}</div>}
      </div>
    </Bloco>
  )
}

// Barras horizontais com rótulo e valor (ranking/funil).
export function BarList({ itens, formato = (n) => String(n) }: { itens: { rotulo: string; valor: number; tom?: Tom; sub?: string }[]; formato?: (n: number) => string }) {
  const max = Math.max(1, ...itens.map((i) => i.valor))
  return (
    <div className="space-y-3">
      {itens.map((i) => (
        <div key={i.rotulo} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{i.rotulo}{i.sub && <span className="ml-1.5 text-xs text-muted-foreground">{i.sub}</span>}</span>
            <span className="shrink-0 font-semibold tabular-nums">{formato(i.valor)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full" style={{ width: `${(i.valor / max) * 100}%`, background: barra[i.tom ?? 'orange'] }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Linha de lista com ícone/inicial, título, subtítulo e lado direito.
// Linha de lista dos painéis (sem a bolinha de sigla; inicial/tom mantidos por compatibilidade).
export function Linha({ titulo, sub, direita, onClick }: { inicial?: React.ReactNode; tom?: Tom; titulo: React.ReactNode; sub?: React.ReactNode; direita?: React.ReactNode; onClick?: () => void }) {
  const C = onClick ? 'button' : 'div'
  return (
    <C type={onClick ? 'button' : undefined} onClick={onClick} className={cn('flex w-full items-center gap-3 px-2 py-3 text-left', onClick && 'rounded-xl hover:bg-muted/50')}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{titulo}</div>
        {sub && <div className="truncate text-xs text-muted-foreground">{sub}</div>}
      </div>
      {direita && <div className="shrink-0 text-right">{direita}</div>}
    </C>
  )
}

export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
export const brlCurto = (n: number) => (n >= 1_000_000 ? `R$ ${(n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi` : n >= 1000 ? `R$ ${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : brl(n))
// dd/mm/aaaa → aaaa-mm-dd
export const isoDeBr = (d: string) => (/^\d{2}\/\d{2}\/\d{4}$/.test(d) ? d.split('/').reverse().join('-') : '')
