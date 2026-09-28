import type React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Annotation } from '@/components/wf'
import { useContratos } from '@/lib/mock'

const UFS = 'AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO'.split(' ')
const fmtData = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '____/____/______')
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const PARTES = ['SENAI Departamento Nacional', 'SENAI Departamento Regional'] as const

// Termo de Adesão (TA): contrato guarda-chuva entre o DN e um DR.
// O texto do modelo é fixo (não editável); só os campos variáveis são preenchidos.
export function NovoTaSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const db = useContratos()
  const [dr, setDr] = useState<string | null>(null)
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [valor, setValor] = useState('')
  const ano = new Date().getFullYear()
  const seq = db.all.filter((c) => c.numero.endsWith(`/${ano}`)).length + 1
  const numero = `${String(seq).padStart(3, '0')}/${ano}`
  const valorNum = Number(valor.replace(/\D/g, '')) / 100

  const reset = () => {
    setDr(null)
    setInicio('')
    setFim('')
    setValor('')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-2xl">
        <SheetHeader className="border-b">
          <SheetTitle>Novo Termo de Adesão</SheetTitle>
          <SheetDescription>
            Contrato guarda-chuva com o Departamento Regional. Após emitido, não pode ser alterado.
          </SheetDescription>
        </SheetHeader>

        <form
          id="novo-ta"
          className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4"
          onSubmit={(e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            db.add({
              numero,
              dr: dr!,
              vigenciaInicio: fmtData(inicio),
              vigenciaFim: fmtData(fim),
              produtos: 0,
              status: 'Em elaboração',
              valor: valorNum,
              signatarios: PARTES.map((parte, i) => ({
                parte,
                nome: String(f.get(`nome${i}`)),
                cargo: String(f.get(`cargo${i}`)),
              })),
            })
            toast.success(`TA ${numero} criado`)
            reset()
            onOpenChange(false)
          }}
        >
          <Annotation>
            Texto do termo é padrão e bloqueado. Só DR, vigência, valor e signatários são preenchidos. Após salvo, o TA não
            pode ser editado.
          </Annotation>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Número do TA</Label>
              <Input value={numero} readOnly className="font-mono" />
            </div>
            <div className="grid gap-2">
              <Label>Departamento Regional *</Label>
              <Select value={dr} onValueChange={(v) => setDr(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string | null) => (v ? `SENAI-${v}` : 'Selecione o DR')}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {UFS.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      SENAI-{uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inicio">Vigência — início *</Label>
              <Input id="inicio" type="date" required value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fim">Vigência — fim *</Label>
              <Input id="fim" type="date" required value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="valor">Valor global *</Label>
              <Input
                id="valor"
                required
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={valor && brl(valorNum)}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </section>

          {/* Modelo do termo: texto fixo com os campos variáveis destacados. */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Modelo do termo (não editável)</h3>
            <div className="space-y-3 rounded-md border bg-muted/40 p-4 text-xs leading-relaxed select-none">
              <p className="text-center font-semibold">TERMO DE ADESÃO Nº {numero}</p>
              <p>
                <b>CLÁUSULA PRIMEIRA — DO OBJETO.</b> O presente termo formaliza a adesão do{' '}
                <Var>{dr ? `SENAI Departamento Regional de ${dr}` : 'Departamento Regional'}</Var> à oferta nacional de
                cursos, conforme os itinerários formativos vigentes, mediante vinculação posterior de produtos a este
                instrumento.
              </p>
              <p>
                <b>CLÁUSULA SEGUNDA — DA VIGÊNCIA.</b> Este termo vigora de <Var>{fmtData(inicio)}</Var> a{' '}
                <Var>{fmtData(fim)}</Var>.
              </p>
              <p>
                <b>CLÁUSULA TERCEIRA — DO VALOR.</b> O valor global estimado deste termo é de{' '}
                <Var>{valor ? brl(valorNum) : 'R$ ______'}</Var>, a ser executado conforme os produtos vinculados.
              </p>
              <p>
                <b>CLÁUSULA QUARTA — DAS ALTERAÇÕES.</b> Este termo não admite alteração após a assinatura. Mudanças de
                escopo devem ser feitas por novo instrumento.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Signatários</h3>
            {PARTES.map((parte, i) => (
              <div key={parte} className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
                <p className="text-xs font-medium text-muted-foreground sm:col-span-2">Pelo {parte}</p>
                <div className="grid gap-2">
                  <Label htmlFor={`nome${i}`}>Nome *</Label>
                  <Input id={`nome${i}`} name={`nome${i}`} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`cargo${i}`}>Cargo *</Label>
                  <Input id={`cargo${i}`} name={`cargo${i}`} required placeholder="Ex.: Diretor Regional" />
                </div>
              </div>
            ))}
          </section>
        </form>

        <SheetFooter className="flex-row justify-end border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="novo-ta" disabled={!dr}>
            Salvar TA
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function Var({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-amber-100 px-1 font-medium text-amber-900">{children}</span>
}
