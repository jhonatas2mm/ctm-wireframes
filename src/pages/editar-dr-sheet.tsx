import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Req } from '@/components/wf'
import { useDrs, type Dr } from '@/lib/mock'

// Edição de Supervisor (perfil DN). UF, nome e região são fixos; contato e status são editáveis.
export function EditarDrSheet({ dr, onClose }: { dr: Dr | null; onClose: () => void }) {
  const db = useDrs()
  const [form, setForm] = useState<Dr | null>(dr)
  useEffect(() => setForm(dr), [dr])
  const set = (patch: Partial<Dr>) => setForm((f) => (f ? { ...f, ...patch } : f))
  return (
    <Sheet open={!!dr} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-2xl">
        {form && (
          <>
            <SheetHeader className="border-b px-6 py-4">
              <SheetTitle className="text-lg">Editar Supervisor</SheetTitle>
              <SheetDescription className="sr-only">Editar contato e status do DR</SheetDescription>
              <div className="flex flex-wrap gap-2 pt-1">
                {[form.nome, `Região ${form.regiao}`].map((t) => (
                  <Badge key={t} variant="outline" className="gap-1 font-normal"><Lock className="size-3" /> {t}</Badge>
                ))}
              </div>
            </SheetHeader>
            <form
              id="editar-dr"
              className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!form) return
                db.update(form.id, { responsavel: form.responsavel.trim(), email: form.email.trim(), telefone: form.telefone.trim(), status: form.status })
                onClose()
              }}
            >
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Contato</h3>
                <div className="grid gap-1.5">
                  <Label htmlFor="dr-resp">Responsável <Req /></Label>
                  <Input id="dr-resp" value={form.responsavel} onChange={(e) => set({ responsavel: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="dr-email">E-mail <Req /></Label>
                  <Input id="dr-email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="dr-tel">Telefone <Req /></Label>
                  <Input id="dr-tel" inputMode="tel" value={form.telefone} onChange={(e) => set({ telefone: e.target.value })} />
                </div>
              </section>
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Status</h3>
                <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                  <span>DR ativo</span>
                  <Switch checked={form.status === 'Ativo'} onCheckedChange={(v) => set({ status: v ? 'Ativo' : 'Inativo' })} />
                </label>
              </section>
            </form>
            <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-3">
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" form="editar-dr">Salvar DR</Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
