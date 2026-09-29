import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'

// Skeleton animado de carregamento, igual para todas as telas: título, indicadores e tabela.
// Aparece ao entrar numa tela (muda o 1º segmento da rota); abrir sheet/detalhe da mesma tela não dispara.
export const DURACAO_CARREGANDO = 450

export function useCarregandoTela() {
  const { pathname } = useLocation()
  const tela = pathname.split('/')[1] ?? ''
  const [carregando, setCarregando] = useState(true)
  useEffect(() => {
    setCarregando(true)
    const t = setTimeout(() => setCarregando(false), DURACAO_CARREGANDO)
    return () => clearTimeout(t)
  }, [tela])
  return carregando
}

export function CarregandoTela() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando">
      <div className="space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-72" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-[1.25rem] border bg-card p-5">
            <Skeleton className="size-11 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-[1.25rem] border bg-card">
        <div className="flex items-center gap-2 border-b p-3">
          <Skeleton className="h-9 w-96" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
        <div className="flex gap-6 border-b px-4 py-3">
          {[28, 18, 22, 14, 12].map((w, i) => <Skeleton key={i} className="h-3" style={{ width: `${w}%` }} />)}
        </div>
        {Array.from({ length: 7 }, (_, r) => (
          <div key={r} className="flex h-14 items-center gap-6 border-b px-4 last:border-b-0">
            {[28, 18, 22, 14, 12].map((w, i) => <Skeleton key={i} className="h-4" style={{ width: `${w - ((r + i) % 3) * 3}%` }} />)}
          </div>
        ))}
      </div>
    </div>
  )
}
