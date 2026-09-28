import { cn } from '@/lib/utils'

/** Caixa com "X" para imagem, gráfico, mapa, vídeo… qualquer coisa ainda não definida. */
export function Placeholder({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn(
        'relative flex min-h-24 items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/40 text-xs text-muted-foreground',
        className,
      )}
    >
      <svg className="absolute inset-0 size-full text-muted-foreground/20" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" />
      </svg>
      {label && <span className="relative rounded bg-background px-2 py-0.5">{label}</span>}
    </div>
  )
}

/** Linhas cinzas no lugar de texto corrido. */
export function TextLines({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-2.5 rounded bg-muted"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}
