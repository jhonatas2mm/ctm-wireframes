import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const Ctx = createContext<{ show: boolean; toggle: () => void }>({ show: true, toggle: () => {} })

export function AnnotationsProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(() => {
    try {
      return localStorage.getItem('wf-annotations') !== 'off'
    } catch {
      return true
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('wf-annotations', show ? 'on' : 'off')
    } catch {
      /* ignore */
    }
  }, [show])
  return <Ctx.Provider value={{ show, toggle: () => setShow((v) => !v) }}>{children}</Ctx.Provider>
}

export const useAnnotations = () => useContext(Ctx)

/** Nota de wireframe: explica intenção/regra de negócio. Some quando anotações estão desligadas. */
export function Annotation({ children, className }: { children: ReactNode; className?: string }) {
  const { show } = useAnnotations()
  if (!show) return null
  return (
    <div
      className={cn(
        'rounded-md border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
        className,
      )}
    >
      <span className="mr-1 font-semibold">Nota:</span>
      {children}
    </div>
  )
}
