import { Mail, Phone, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EmptyState } from '@/components/wf'
import { useContratos, useEditais, type Dr } from '@/lib/mock'
import { statusVariant } from './taa-sheet'

// Detalhes do DR (side sheet, perfil DN): contato, editais em que está credenciado e TAAs com o DN.
export function DrSheet({ dr, onClose }: { dr: Dr | null; onClose: () => void }) {
  const { all: editais } = useEditais()
  const { all: contratos } = useContratos()
  const meusEditais = dr ? editais.filter((e) => e.drs.includes(dr.uf)) : []
  const taas = dr ? contratos.filter((c) => c.dr === dr.uf) : []
  return (
    <Sheet open={!!dr} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        {dr && (
          <>
            <SheetHeader className="border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg">{dr.nome}</SheetTitle>
                <Badge variant={dr.status === 'Ativo' ? 'default' : 'outline'}>{dr.status}</Badge>
              </div>
              <SheetDescription>Região {dr.regiao}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Contato</h3>
                <ul className="grid gap-2 rounded-lg border p-3 text-sm">
                  <li className="flex items-center gap-2"><UserRound className="size-4 text-muted-foreground" /> {dr.responsavel}</li>
                  <li className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> {dr.email}</li>
                  <li className="flex items-center gap-2 tabular-nums"><Phone className="size-4 text-muted-foreground" /> {dr.telefone}</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Editais credenciados <span className="font-normal text-muted-foreground">({meusEditais.length})</span></h3>
                {meusEditais.length ? (
                  <ul className="divide-y rounded-lg border">
                    {meusEditais.map((e) => {
                      const cursos = e.cursos.filter((c) => c.drs.includes(dr.uf))
                      return (
                        <li key={e.id} className="grid gap-1 px-3 py-2.5 text-sm">
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-mono font-medium">{e.numero}</span>
                            <span className="text-xs text-muted-foreground">{e.vigenciaInicio} a {e.vigenciaFim}</span>
                          </span>
                          <span className="flex flex-wrap gap-1">
                            {cursos.map((c) => <Badge key={c.nome} variant="outline" className="font-normal">{c.nome}</Badge>)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <EmptyState title="Não credenciado em nenhum edital" />
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">TAAs <span className="font-normal text-muted-foreground">({taas.length})</span></h3>
                {taas.length ? (
                  <ul className="divide-y rounded-lg border">
                    {taas.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                        <span className="font-mono font-medium">{t.numero}</span>
                        <span className="text-xs text-muted-foreground">{t.vigenciaInicio} a {t.vigenciaFim}</span>
                        <Badge variant={statusVariant[t.status]} className="ml-auto">{t.status}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState title="Nenhum TAA com este DR" />
                )}
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
