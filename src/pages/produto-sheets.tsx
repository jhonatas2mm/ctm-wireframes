import { useEffect, useState } from 'react'
import { GitBranchPlus, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ModulosEditor } from '@/components/wf'
import { useCursosDr, type CursoDr, type Modulo } from '@/lib/mock'
import { cn } from '@/lib/utils'

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')
const v = (c: CursoDr) => c.versao ?? 1

// Todas as versões do produto (a v1 e as que apontam para ela), da mais antiga à mais nova.
function useFamilia(id: string | null) {
  const db = useCursosDr()
  const p = db.get(id ?? undefined)
  const raiz = p ? p.origemId ?? p.id : ''
  const familia = db.all.filter((c) => c.id === raiz || c.origemId === raiz).sort((a, b) => v(a) - v(b))
  return { db, p, raiz, familia, proxima: familia.length ? Math.max(...familia.map(v)) + 1 : 1 }
}

// Detalhes do produto (side sheet): versão aberta + histórico de versões (as anteriores continuam registradas).
export function ProdutoSheet({ id, onClose, onNovaVersao }: { id: string | null; onClose: () => void; onNovaVersao: (id: string) => void }) {
  const [sel, setSel] = useState<string | null>(id)
  useEffect(() => setSel(id), [id])
  const { p, familia } = useFamilia(sel ?? id)
  const atual = familia[familia.length - 1]
  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-3xl">
        {p && (
          <>
            <SheetHeader className="border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg">{p.nome}</SheetTitle>
                <Badge variant="secondary" className="tabular-nums">v{v(p)}</Badge>
                {p.id === atual?.id && <Badge variant="outline">Atual</Badge>}
              </div>
              <SheetDescription className="sr-only">Detalhes e versões do produto</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
              <dl className="grid grid-cols-2 gap-4">
                {([
                  ['Edital', <span className="font-mono">{p.edital ?? '—'}</span>],
                  ['CH', `${p.cargaHorariaEdital ?? 0} h`],
                  ['Área tecnológica', p.area ?? '—'],
                  ['Modalidade', p.modalidade ?? '—'],
                  ['Criada em', data(p.criadoEm)],
                  ['Origem', p.baseadaEm ? `Baseada na v${p.baseadaEm}` : 'Versão original'],
                ] as [string, React.ReactNode][]).map(([k, val]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="text-sm">{val}</dd>
                  </div>
                ))}
              </dl>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Versões</h3>
                <ol className="divide-y rounded-lg border">
                  {[...familia].reverse().map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSel(c.id)}
                        className={cn('flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50', c.id === p.id && 'bg-muted font-medium')}
                      >
                        <span className="w-8 tabular-nums">v{v(c)}</span>
                        <span className="text-xs text-muted-foreground">{c.baseadaEm ? `a partir da v${c.baseadaEm}` : 'original'}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{data(c.criadoEm)}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Módulos e UCs · v{v(p)}</h3>
                <ol className="grid gap-2">
                  {p.modulos.map((m, i) => (
                    <li key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{i + 1}. {m.nome}</p>
                      <ul className="mt-1 grid gap-0.5 pl-5 text-sm text-muted-foreground">
                        {m.unidades.map((u, k) => <li key={k}>{i + 1}.{k + 1} {u.nome}</li>)}
                      </ul>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
            <SheetFooter className="border-t px-6 py-3">
              <Button onClick={() => onNovaVersao(p.id)}><GitBranchPlus /> Nova versão a partir da v{v(p)}</Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// Nova versão: copia a versão de origem para ajustes e salva como vN+1. A origem não é alterada.
export function NovaVersaoSheet({ id, onClose, onSaved }: { id: string | null; onClose: () => void; onSaved?: (id: string) => void }) {
  const { db, p, raiz, proxima } = useFamilia(id)
  const [rascunho, setRascunho] = useState<Modulo[]>([])
  useEffect(() => setRascunho(p ? structuredClone(p.modulos) : []), [id]) // eslint-disable-line react-hooks/exhaustive-deps
  const salvar = () => {
    if (!p) return
    const { id: _id, ...base } = p
    const nova = db.add({ ...base, modulos: rascunho, versao: proxima, origemId: raiz, baseadaEm: v(p), criadoEm: new Date().toISOString() })
    onSaved?.(nova.id)
    onClose()
  }
  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="data-[side=bottom]:h-[95vh] gap-0 overflow-hidden rounded-t-xl p-0">
        {p && (
          <>
            <SheetHeader className="border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <SheetTitle className="text-lg">Nova versão · {p.nome}</SheetTitle>
                {/* Versão em destaque: de onde vem → a que será criada */}
                <span className="flex items-center gap-2 rounded-md border-2 border-foreground px-2.5 py-1 text-sm font-semibold tabular-nums">
                  <span className="text-muted-foreground">v{v(p)}</span> → v{proxima}
                </span>
              </div>
              <SheetDescription className="sr-only">Ajuste módulos e UCs; a v{v(p)} não é alterada</SheetDescription>
              <div className="flex flex-wrap gap-2 pt-1">
                {[p.edital, p.area, p.modalidade, `${p.cargaHorariaEdital ?? 0} h`].filter(Boolean).map((t) => (
                  <Badge key={t} variant="outline" className="gap-1 font-normal"><Lock className="size-3" /> {t}</Badge>
                ))}
              </div>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="mx-auto grid max-w-3xl gap-4">
                <ModulosEditor modulos={rascunho} onChange={(fn) => setRascunho(fn)} />
              </div>
            </div>
            <SheetFooter className="flex-row items-center justify-end gap-2 border-t px-6 py-3">
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button onClick={salvar}>Salvar versão v{proxima}</Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
