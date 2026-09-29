import { FileSpreadsheet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { StatCard } from '@/components/wf'
import type { Edital } from '@/lib/mock'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Detalhes do edital em side nav: vigência e, por área tecnológica, o DR credenciado e o valor (R$ hora/estudante).
export function EditalDetalhes({ edital, onClose }: { edital: Edital | null; onClose: () => void }) {
  const e = edital
  return (
    <Sheet open={!!e} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-3xl">
        {e && (
          <>
            <SheetHeader className="border-b">
              <SheetTitle className="flex items-center gap-3 text-xl">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#FFF6ED] text-[#E84910]"><FileSpreadsheet className="size-5" /></span>
                Edital
                <Badge variant="secondary" className="font-mono">{e.numero}</Badge>
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard label="Vigência" value={e.vigenciaInicio} hint={`até ${e.vigenciaFim}`} compacto />
                <StatCard label="Áreas tecnológicas" value={String(e.areas.length)} compacto />
                <StatCard label="DRs credenciados" value={String(e.drs.length)} compacto />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Áreas tecnológicas</h3>
                <div className="divide-y rounded-[1.25rem] border bg-card">
                  {e.areas.map((a) => {
                    return (
                      <div key={a.area} className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold">{a.area}</div>
                            <Badge variant="outline" className="mt-1">SENAI-{a.dr} · DR credenciado</Badge>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="font-bold tabular-nums">{brl(a.valorHora)}</div>
                            <div className="text-xs text-muted-foreground">hora/estudante</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

