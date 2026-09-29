import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Edital } from '@/lib/mock'
import { ResultadoEdital } from './edital-resultado'

// Resultado do edital em side nav (consultas a partir de outras telas); a página completa é /editais/:id/resultado.
export function EditalDetalhes({ edital: e, onClose }: { edital: Edital | null; onClose: () => void }) {
  return (
    <Sheet open={!!e} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-5xl">
        {e && (
          <>
            <SheetHeader className="border-b">
              <SheetTitle className="flex items-center gap-3 text-xl">Resultado do edital <Badge variant="secondary" className="font-mono">{e.numero}</Badge></SheetTitle>
              <p className="text-sm text-muted-foreground">Vigência {e.vigenciaInicio} a {e.vigenciaFim}</p>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-6"><ResultadoEdital e={e} /></div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
