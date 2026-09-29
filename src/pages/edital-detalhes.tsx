import { CalendarRange, Clock, FileSpreadsheet, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { StatCard } from '@/components/wf'
import type { Edital } from '@/lib/mock'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Detalhes do edital em side nav: um edital pode ter vários cursos, logo várias áreas e modalidades.
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
                <StatCard icon={CalendarRange} tom="blue" label="Vigência" value={e.vigenciaInicio} hint={`até ${e.vigenciaFim}`} compacto />
                <StatCard icon={Clock} tom="orange" label="Carga horária total" value={`${e.cargaHoraria} h`} compacto />
                <StatCard icon={Wallet} tom="green" label="Valor total" value={brl(e.valor)} compacto />
              </div>

              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <Grupo rotulo="CTM" itens={e.ctm.map((uf) => `SENAI-${uf}`)} />
                <Grupo rotulo="DRs credenciados" itens={e.drs.map((uf) => `SENAI-${uf}`)} />
                <Grupo rotulo="Áreas tecnológicas" itens={[...new Set(e.cursos.map((c) => c.area))]} />
                <Grupo rotulo="Modalidades" itens={[...new Set(e.cursos.map((c) => c.modalidade))]} />
              </dl>

              <div className="space-y-3">
                <h3 className="font-semibold">Cursos <span className="text-muted-foreground font-normal">({e.cursos.length})</span></h3>
                <div className="divide-y rounded-2xl border">
                  {e.cursos.map((c) => (
                    <div key={c.nome} className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold">{c.nome}</div>
                          <div className="text-muted-foreground text-xs">{c.area} · {c.modalidade} · {c.cargaHoraria} h</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-bold tabular-nums">{brl(c.valor)}</div>
                          <div className="text-muted-foreground text-xs">valor do curso</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {c.drs.map((uf) => <Badge key={uf} variant="outline">SENAI-{uf}</Badge>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Grupo({ rotulo, itens }: { rotulo: string; itens: string[] }) {
  return (
    <div className="space-y-1.5">
      <dt className="text-muted-foreground text-xs">{rotulo}</dt>
      <dd className="flex flex-wrap gap-1">{itens.map((i) => <Badge key={i} variant="outline">{i}</Badge>)}</dd>
    </div>
  )
}
