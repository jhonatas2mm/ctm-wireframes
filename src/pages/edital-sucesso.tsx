import { CheckCircle2, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { Edital } from '@/lib/mock'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Tela de sucesso após salvar um edital (rota /editais/:id/sucesso, etapa da jornada Criação de edital).
export function EditalSucesso({ edital, onClose, onVer }: { edital: Edital | null; onClose: () => void; onVer: (e: Edital) => void }) {
  return (
    <Dialog open={!!edital} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        {edital && (
          <div className="grid justify-items-center gap-4 py-2 text-center">
            <CheckCircle2 className="size-14 text-emerald-600" />
            <div className="grid gap-1">
              <DialogTitle className="text-xl">Edital criado com sucesso</DialogTitle>
              <DialogDescription>O edital já está disponível para os DRs credenciados.</DialogDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-sm">{edital.numero}</Badge>
            <dl className="grid w-full grid-cols-2 gap-3 rounded-lg border p-4 text-left bg-card">
              {([
                ['Vigência', `${edital.vigenciaInicio} a ${edital.vigenciaFim}`],
                ['Cursos', edital.cursos.length],
                ['DRs credenciados', edital.drs.map((d) => `SENAI-${d}`).join(', ')],
                ['Valor total', brl(edital.valor)],
              ] as [string, React.ReactNode][]).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="text-sm">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onVer(edital)}><Eye /> Ver edital</Button>
              <Button className="flex-1" onClick={onClose}>Voltar para Gestão de Editais</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
