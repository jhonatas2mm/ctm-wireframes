import type React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { FileText, Lock, Maximize2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
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

  const field = 'grid gap-1.5'
  const doc = { numero, dr, inicio, fim, valor: valor ? brl(valorNum) : '' }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg">Novo Termo de Adesão</SheetTitle>
            <Badge variant="secondary" className="font-mono">
              Nº {numero}
            </Badge>
          </div>
          <SheetDescription>
            Contrato guarda-chuva com o Departamento Regional. Depois de salvo, não pode ser alterado.
          </SheetDescription>
        </SheetHeader>

        <div className="grid min-h-0 flex-1 md:grid-cols-[1fr_240px]">
          {/* Coluna esquerda: só os campos variáveis */}
          <form
            id="novo-ta"
            className="min-h-0 space-y-8 overflow-y-auto px-6 py-6"
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
            <Group n={1} title="Departamento Regional">
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
            </Group>

            <Group n={2} title="Vigência e valor">
              <div className="grid grid-cols-2 gap-3">
                <div className={field}>
                  <Label htmlFor="inicio">Início</Label>
                  <Input id="inicio" type="date" required value={inicio} onChange={(e) => setInicio(e.target.value)} />
                </div>
                <div className={field}>
                  <Label htmlFor="fim">Fim</Label>
                  <Input id="fim" type="date" required value={fim} onChange={(e) => setFim(e.target.value)} />
                </div>
              </div>
              <div className={field}>
                <Label htmlFor="valor">Valor global</Label>
                <Input
                  id="valor"
                  required
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  className="text-base font-medium tabular-nums"
                  value={valor && brl(valorNum)}
                  onChange={(e) => setValor(e.target.value)}
                />
              </div>
            </Group>

            <Group n={3} title="Signatários">
              {PARTES.map((parte, i) => (
                <div key={parte} className="space-y-3 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Pelo {parte}</p>
                  <Input name={`nome${i}`} required placeholder="Nome completo" aria-label={`Nome — ${parte}`} />
                  <Input name={`cargo${i}`} required placeholder="Cargo" aria-label={`Cargo — ${parte}`} />
                </div>
              ))}
            </Group>
          </form>

          {/* Coluna direita: miniatura do termo; clique abre o documento completo */}
          <aside className="hidden min-h-0 border-l bg-muted/40 p-4 md:block">
            <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="size-3.5" /> Prévia do termo
            </p>
            <Dialog>
              <DialogTrigger
                className="group relative block h-[290px] w-full overflow-hidden rounded-md border bg-white shadow-sm transition hover:shadow-md"
                aria-label="Ver termo completo"
              >
                <div className="pointer-events-none w-[640px] origin-top-left scale-[0.32]">
                  <TermoDoc {...doc} />
                </div>
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-900">
                    <Maximize2 className="size-3.5" /> Ver completo
                  </span>
                </span>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
                <DialogHeader className="border-b px-5 py-3">
                  <DialogTitle className="flex items-center gap-2">
                    Termo de Adesão Nº {numero}
                    <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                      <Lock className="size-3" /> texto padrão, não editável
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-[calc(90vh-3.5rem)] overflow-y-auto bg-muted/50 p-6">
                  <TermoDoc {...doc} className="mx-auto shadow-sm" />
                </div>
              </DialogContent>
            </Dialog>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              Os campos preenchidos aparecem destacados no termo. Clique para ver completo.
            </p>
          </aside>
        </div>

        <SheetFooter className="flex-row items-center justify-between border-t px-6 py-3">
          <span />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="novo-ta" disabled={!dr}>
              Salvar TA
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function TermoDoc({
  numero,
  dr,
  inicio,
  fim,
  valor,
  className,
}: {
  numero: string
  dr: string | null
  inicio: string
  fim: string
  valor: string
  className?: string
}) {
  return (
    <article
      className={cn(
        'w-[640px] max-w-full space-y-4 bg-white px-12 py-14 text-left font-serif text-[13px] leading-relaxed text-neutral-800 select-none',
        className,
      )}
    >
      <h4 className="text-center text-sm font-bold tracking-wide">TERMO DE ADESÃO Nº {numero}</h4>
      <p>
        <b>CLÁUSULA PRIMEIRA — DO OBJETO.</b> O presente termo formaliza a adesão do{' '}
        <Var>{dr ? `SENAI Departamento Regional de ${dr}` : 'Departamento Regional'}</Var> à oferta nacional de cursos,
        conforme os itinerários formativos vigentes, mediante vinculação posterior de produtos a este instrumento.
      </p>
      <p>
        <b>CLÁUSULA SEGUNDA — DA VIGÊNCIA.</b> Este termo vigora de <Var>{fmtData(inicio)}</Var> a{' '}
        <Var>{fmtData(fim)}</Var>.
      </p>
      <p>
        <b>CLÁUSULA TERCEIRA — DO VALOR.</b> O valor global estimado deste termo é de <Var>{valor || 'R$ ______'}</Var>,
        a ser executado conforme os produtos vinculados.
      </p>
      <p>
        <b>CLÁUSULA QUARTA — DAS ALTERAÇÕES.</b> Este termo não admite alteração após a assinatura. Mudanças de escopo
        devem ser feitas por novo instrumento.
      </p>
      <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
        {PARTES.map((parte) => (
          <div key={parte} className="border-t border-neutral-400 pt-2 font-semibold">
            {parte}
          </div>
        ))}
      </div>
    </article>
  )
}

function Group({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] text-background">
          {n}
        </span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function Var({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-amber-100 px-1 font-sans font-medium text-amber-900">{children}</span>
}
