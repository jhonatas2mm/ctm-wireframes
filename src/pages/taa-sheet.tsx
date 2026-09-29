import { Download, FileText, Paperclip } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Contrato, StatusContrato } from '@/lib/mock'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const statusVariant: Record<StatusContrato, 'default' | 'secondary' | 'outline'> = {
  Vigente: 'default',
  'Em elaboração': 'secondary',
  Encerrado: 'outline',
}

// Detalhes do TAA (side sheet): dados, documentos (modelo e assinado) e andamento do fluxo.
export function TaaSheet({ taa, onClose, onAnexar }: { taa: Contrato | null; onClose: () => void; onAnexar: (c: Contrato) => void }) {
  const assinado = !!taa?.anexoAssinado || taa?.status === 'Vigente' || taa?.status === 'Encerrado'
  return (
    <Sheet open={!!taa} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        {taa && (
          <>
            <SheetHeader className="border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg">TAA</SheetTitle>
                <Badge variant="secondary" className="font-mono">Nº {taa.numero}</Badge>
                <Badge variant={statusVariant[taa.status]}>{taa.status}</Badge>
              </div>
              <SheetDescription className="sr-only">Detalhes do Termo de Acordo Administrativo</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
              <dl className="grid grid-cols-2 gap-4">
                {([
                  ['Status', <Badge variant={statusVariant[taa.status]}>{taa.status}</Badge>],
                  ['Departamento Regional', `SENAI-${taa.dr}`],
                  ['Valor global', brl(taa.valor)],
                  ['Vigência', `${taa.vigenciaInicio} a ${taa.vigenciaFim}`],
                ] as [string, React.ReactNode][]).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="text-sm">{v}</dd>
                  </div>
                ))}
              </dl>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Documentos</h3>
                <ul className="divide-y rounded-lg border">
                  <li className="flex items-center gap-3 px-3 py-2.5 text-sm">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">Modelo preenchido · TAA-{taa.numero.replace('/', '-')}.docx</span>
                    <Button size="sm" variant="ghost" onClick={() => {}}><Download /> Baixar</Button>
                  </li>
                  <li className="flex items-center gap-3 px-3 py-2.5 text-sm">
                    <Paperclip className="size-4 text-muted-foreground" />
                    {assinado ? (
                      <>
                        <span className="min-w-0 flex-1 truncate">TAA assinado · {taa.anexoAssinado ?? `TAA-${taa.numero.replace('/', '-')}-assinado.pdf`}</span>
                        <Button size="sm" variant="ghost" onClick={() => {}}><Download /> Baixar</Button>
                      </>
                    ) : (
                      <span className="min-w-0 flex-1 text-muted-foreground">TAA assinado · aguardando anexo</span>
                    )}
                  </li>
                </ul>
              </section>
            </div>
            {taa.status === 'Em elaboração' && (
              <SheetFooter className="border-t px-6 py-3">
                <Button onClick={() => onAnexar(taa)}><Paperclip /> Anexar TAA assinado</Button>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
