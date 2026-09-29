import { GripVertical, Layers, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Req } from './required'
import type { Modulo } from '@/lib/mock'

export const moduloVazio = (): Modulo => ({ nome: '', unidades: [{ nome: '', cargaHoraria: 0 }] })

// Editor de módulos → unidades curriculares (Novo produto e Nova versão). Enter numa UC cria a próxima.
export function ModulosEditor({ modulos, onChange }: { modulos: Modulo[]; onChange: (fn: (ms: Modulo[]) => Modulo[]) => void }) {
  const setModulos = onChange
  const setMod = (i: number, patch: Partial<Modulo>) => setModulos((ms) => ms.map((m, j) => (j === i ? { ...m, ...patch } : m)))
  const setUc = (i: number, k: number, nome: string) => setModulos((ms) => ms.map((m, j) => (j !== i ? m : { ...m, unidades: m.unidades.map((u, l) => (l === k ? { ...u, nome } : u)) })))
  const addUc = (i: number) => setModulos((ms) => ms.map((m, j) => (j !== i ? m : { ...m, unidades: [...m.unidades, { nome: '', cargaHoraria: 0 }] })))
  return (
    <>
          {modulos.map((m, i) => (
            <section key={i} className="overflow-hidden rounded-lg border">
              <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
                <Layers className="size-4 shrink-0 text-muted-foreground" />
                <span className="shrink-0 text-xs font-medium text-muted-foreground">Módulo {i + 1}</span>
                <Input
                  value={m.nome}
                  onChange={(e) => setMod(i, { nome: e.target.value })}
                  placeholder="Nome do módulo *"
                  aria-label={`Nome do módulo ${i + 1}`}
                  className="h-8 border-0 bg-transparent font-medium shadow-none focus-visible:ring-0"
                />
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remover módulo ${i + 1}`} disabled={modulos.length === 1} onClick={() => setModulos((ms) => ms.filter((_, j) => j !== i))}>
                  <Trash2 />
                </Button>
              </div>
              <ul className="grid gap-1.5 p-3">
                {m.unidades.map((u, k) => (
                  <li key={k} className="group flex items-center gap-2">
                    <GripVertical className="size-3.5 shrink-0 text-muted-foreground/50" />
                    <span className="w-6 shrink-0 text-right text-xs text-muted-foreground tabular-nums">{i + 1}.{k + 1}</span>
                    <Input
                      value={u.nome}
                      autoFocus={k > 0 && !u.nome}
                      onChange={(e) => setUc(i, k, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUc(i))}
                      placeholder="Nome da unidade curricular *"
                      aria-label={`Unidade curricular ${i + 1}.${k + 1}`}
                      className="h-8"
                    />
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Remover unidade" className="opacity-0 group-hover:opacity-100" disabled={m.unidades.length === 1} onClick={() => setMod(i, { unidades: m.unidades.filter((_, j) => j !== k) })}>
                      <X />
                    </Button>
                  </li>
                ))}
                <li className="pl-12">
                  <Button type="button" variant="ghost" size="sm" onClick={() => addUc(i)}>
                    <Plus /> Unidade curricular
                  </Button>
                </li>
              </ul>
            </section>
          ))}
          <Button type="button" variant="outline" className="border-dashed" onClick={() => setModulos((ms) => [...ms, moduloVazio()])}>
            <Plus /> Adicionar módulo
          </Button>
          <p className="text-xs text-muted-foreground"><Req /> Campos obrigatórios</p>
    </>
  )
}
