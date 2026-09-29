import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Req } from '@/components/wf'
import { regioes, useDrs } from '@/lib/mock'

// Nova DR credenciada (perfil DN): UF entre as ainda não credenciadas; região vem da UF. Nasce Ativa.
export function NovaDrSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const db = useDrs()
  const [uf, setUf] = useState<string | null>(null)
  const [responsavel, setResponsavel] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const livres = Object.keys(regioes).sort().filter((u) => !db.all.some((d) => d.uf === u))
  // Protótipo: já abre preenchido com dados de exemplo.
  useEffect(() => {
    if (!open || !livres.length) return
    setUf(livres[0])
    setResponsavel('Paula Mendes')
    setEmail(`paula.mendes@senai${livres[0].toLowerCase()}.org.br`)
    setTelefone('(61) 3321-4455')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const reset = () => (setUf(null), setResponsavel(''), setEmail(''), setTelefone(''))
  return (
    <Sheet open={open} onOpenChange={(v) => (v || reset(), onOpenChange(v))}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">Nova DR credenciada</SheetTitle>
          <SheetDescription className="sr-only">Credenciar um Departamento Regional</SheetDescription>
        </SheetHeader>
        <form
          id="nova-dr"
          className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!uf) return
            db.add({ id: uf!, uf: uf!, nome: `SENAI-${uf}`, regiao: regioes[uf!], responsavel: responsavel.trim(), email: email.trim(), telefone: telefone.trim(), status: 'Ativo' })
            reset()
            onOpenChange(false)
          }}
        >
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Departamento Regional</h3>
            <div className="grid gap-1.5">
              <Label>DR <Req /></Label>
              <Select value={uf} onValueChange={(v) => setUf(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string | null) => (v ? `SENAI-${v} · ${regioes[v]}` : 'Selecione a DR')}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {livres.map((u) => <SelectItem key={u} value={u}>SENAI-{u} · {regioes[u]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Contato</h3>
            <div className="grid gap-1.5">
              <Label htmlFor="nd-resp">Responsável <Req /></Label>
              <Input id="nd-resp" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nd-email">E-mail <Req /></Label>
              <Input id="nd-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nd-tel">Telefone <Req /></Label>
              <Input id="nd-tel" inputMode="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
          </section>
        </form>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" form="nova-dr" disabled={!uf}>Salvar DR credenciada</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
