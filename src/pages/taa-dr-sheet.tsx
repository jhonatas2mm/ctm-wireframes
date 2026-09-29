import { useNavigate } from 'react-router-dom'
import { Download, FileText, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EmptyState } from '@/components/wf'
import { StatusPropostaBadge } from '@/components/wf/status-proposta'
import { useProdutos, type TaaDr } from '@/lib/mock'
import { statusVariant } from './taa-sheet'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const DR = 'MG' // DR do usuário logado (Supervisor)

// Visualização do contrato (TAA) no perfil Supervisor: dados, documento e propostas com a DR parceira.
export function TaaDrSheet({ taa, onClose }: { taa: TaaDr | null; onClose: () => void }) {
  const navigate = useNavigate()
  const { all } = useProdutos()
  const propostas = taa ? all.filter((p) => p.drContratante === taa.drParceira) : []
  const arquivo = taa ? `TAA-${taa.numero.replace('/', '-')}${taa.status === 'Em elaboração' ? '.docx' : '-assinado.pdf'}` : ''
  return (
    <Sheet open={!!taa} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        {taa && (
          <>
            <SheetHeader className="border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg">TAA</SheetTitle>
                <Badge variant="secondary" className="font-mono">Nº {taa.numero}</Badge>
              </div>
              <SheetDescription className="sr-only">Contrato do TAA</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
              <dl className="grid grid-cols-2 gap-4">
                {([
                  ['Status', <Badge variant={statusVariant[taa.status]}>{taa.status}</Badge>],
                  ['Vigência', taa.vigenciaInicio === '—' ? '—' : `${taa.vigenciaInicio} a ${taa.vigenciaFim}`],
                  ['DR', `SENAI-${DR}`],
                  ['DR parceira', `SENAI-${taa.drParceira}`],
                ] as [string, React.ReactNode][]).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="text-sm">{v}</dd>
                  </div>
                ))}
              </dl>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Contrato</h3>
                <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{arquivo}</span>
                  <Button size="sm" variant="ghost" onClick={() => {}}><Download /> Baixar</Button>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Propostas <span className="font-normal text-muted-foreground">({propostas.length})</span></h3>
                {propostas.length ? (
                  <ul className="divide-y rounded-lg border">
                    {propostas.map((p) => (
                      <li key={p.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                        <span className="font-mono text-xs">{p.numero}</span>
                        <span className="font-mono text-xs text-muted-foreground">{p.edital ?? '—'}</span>
                        <span className="text-xs text-muted-foreground">{p.cursos.length} curso(s) · {brl(p.cursos.reduce((t, c) => t + c.valorPrevisto, 0))}</span>
                        <span className="ml-auto"><StatusPropostaBadge status={p.status} /></span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState title="Nenhuma proposta neste TAA" />
                )}
              </section>
            </div>
            <SheetFooter className="border-t px-6 py-3">
              <Button onClick={() => (onClose(), navigate(`/meus-taas/${taa.id}/produtos`))}><Package /> Gestão de propostas</Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
