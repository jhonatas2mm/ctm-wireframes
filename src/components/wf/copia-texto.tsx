import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

// Texto (e-mail, telefone…) com um ícone ao lado para copiar. Sem toast: o ícone vira ✓ por um instante.
// `texto` é o que vai para a área de transferência; `children` é o que aparece (padrão: o próprio texto).
export function CopiaTexto({ texto, rotulo = 'Copiar', children, className }: { texto: string; rotulo?: string; children?: ReactNode; className?: string }) {
  const [copiado, setCopiado] = useState(false)
  if (!texto || texto === '—') return <>{children ?? texto}</>
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {children ?? texto}
      <button
        type="button"
        title={`${rotulo}: ${texto}`}
        aria-label={`${rotulo} ${texto}`}
        className="inline-flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation()
          void navigator.clipboard.writeText(texto).catch(() => {})
          setCopiado(true)
          setTimeout(() => setCopiado(false), 1200)
        }}
      >
        {copiado ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
      </button>
    </span>
  )
}
