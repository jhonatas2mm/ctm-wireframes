import { FileSpreadsheet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { StatCard } from '@/components/wf'
import type { Edital } from '@/lib/mock'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Detalhes do edital em side nav: vigência e áreas tecnológicas (valor por hora e DR vinculado; cursos do catálogo da área).
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
                <StatCard label="DRs vinculados" value={String(e.drs.length)} compacto />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Áreas tecnológicas</h3>
                <div className="divide-y rounded-[1.25rem] border bg-card">
                  {e.areas.map((a) => {
                    const cs = e.cursos.filter((c) => c.area === a.area)
                    return (
                      <div key={a.area} className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold">{a.area}</div>
                            <div className="text-xs text-muted-foreground">{cs.length} curso(s) do catálogo nesta área</div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="font-bold tabular-nums">{brl(a.valorHora)}</div>
                            <div className="text-xs text-muted-foreground">por hora</div>
                          </div>
                        </div>
                        <Badge>SENAI-{a.dr} · DR vinculado</Badge>
                        {cs.length > 0 && <div className="flex flex-wrap gap-1">{cs.map((c) => <Badge key={c.nome} variant="outline" className="font-normal">{c.nome} · {c.cargaHoraria} h</Badge>)}</div>}
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

