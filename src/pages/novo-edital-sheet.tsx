import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Req } from '@/components/wf'
import { areasTecnologicas, useDrs, useEditais, type AreaEdital } from '@/lib/mock'

const fmtData = (iso: string) => iso.split('-').reverse().join('/')
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Novo edital (DN) = cadastro do resultado do edital de credenciamento: vigência e, por ÁREA TECNOLÓGICA, o DR credenciado
// e o VALOR (R$ hora/estudante). Só isso: sem cursos, valor total ou CH.
type Linha = { area: string; valor: string; dr: string } // valor em centavos (só dígitos)

export function NovoEditalSheet({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; onSaved?: (id: string) => void }) {
  const db = useEditais()
  const drs = useDrs().all.filter((d) => d.status === 'Ativo')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [linhas, setLinhas] = useState<Linha[]>([])
  // Protótipo: já abre preenchido (vigência e duas áreas com valor/hora e DR)
  useEffect(() => {
    if (!open) return
    setInicio('2026-11-01')
    setFim('2027-10-31')
    setLinhas([{ area: 'Desenvolvimento de Sistemas', valor: '65', dr: 'SC' }, { area: 'Eletrônica e Automação', valor: '65', dr: 'SC' }, { area: 'Comercial', valor: '55', dr: 'GO' }])
  }, [open])
  const ano = new Date().getFullYear()
  const numero = `ED-${String(db.all.filter((e) => e.numero.endsWith(`/${ano}`)).length + 1).padStart(3, '0')}/${ano}`
  const set = (i: number, patch: Partial<Linha>) => setLinhas((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const salvar = () => {
    const areas: AreaEdital[] = linhas.filter((l) => l.area.trim()).map((l) => ({ area: l.area.trim(), valorHora: Number(l.valor || 0) / 100, dr: l.dr }))
    if (!areas.length) return
    const novo = db.add({ numero, areas, cursos: [], drs: [], vigenciaInicio: fmtData(inicio), vigenciaFim: fmtData(fim) })
    if (onSaved) onSaved(novo.id)
    else onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="data-[side=bottom]:h-[95vh] gap-0 overflow-hidden rounded-t-xl p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">Novo edital</SheetTitle>
          <SheetDescription className="sr-only">Vigência e áreas tecnológicas com valor por hora e DR credenciado</SheetDescription>
        </SheetHeader>
        <div className="grid min-h-0 flex-1 grid-cols-[22rem_1fr]">
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto border-r px-6 py-6">
            <h3 className="text-sm font-semibold">Vigência</h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-card p-4">
              <label className="grid gap-1 text-xs"><span className="text-muted-foreground">Início <Req /></span><Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></label>
              <label className="grid gap-1 text-xs"><span className="text-muted-foreground">Fim <Req /></span><Input type="date" min={inicio} value={fim} onChange={(e) => setFim(e.target.value)} /></label>
            </div>
          </div>
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Áreas tecnológicas <span className="font-normal text-muted-foreground">({linhas.length})</span></h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setLinhas((xs) => [...xs, { area: '', valor: '', dr: '' }])}>
                <Plus /> Adicionar área
              </Button>
            </div>
            <div className="overflow-hidden rounded-[1.25rem] border bg-card">
              <div className="grid grid-cols-[1.4fr_10rem_12rem_2.5rem] gap-3 border-b px-4 py-2 text-xs font-semibold text-muted-foreground">
                <span>Área tecnológica</span><span>Valor (R$ hora/estudante)</span><span>DR credenciado</span><span />
              </div>
              {linhas.map((l, i) => (
                <div key={i} className="grid grid-cols-[1.4fr_10rem_12rem_2.5rem] items-start gap-3 border-b px-4 py-3 last:border-b-0">
                  <div className="grid gap-1">
                    <Input list="areas-tecnologicas" value={l.area} placeholder="Ex.: Metalmecânica" onChange={(e) => set(i, { area: e.target.value })} />
                  </div>
                  <div className="grid gap-1">
                    <Input inputMode="numeric" value={l.valor ? brl(Number(l.valor) / 100) : ''} placeholder="R$ 0,00" onChange={(e) => set(i, { valor: e.target.value.replace(/\D/g, '') })} />
                    <span className="text-xs text-muted-foreground">hora/estudante</span>
                  </div>
                  <Select value={l.dr || null} onValueChange={(v) => set(i, { dr: v as string })}>
                    <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => (v ? `SENAI-${v}` : 'Escolha o DR')}</SelectValue></SelectTrigger>
                    <SelectContent>{drs.map((d) => <SelectItem key={d.uf} value={d.uf}>SENAI-{d.uf} · {d.nome.replace(/^Departamento Regional d[eoa]s? /, '')}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button type="button" size="icon" variant="ghost" aria-label={`Remover ${l.area || 'área'}`} onClick={() => setLinhas((xs) => xs.filter((_, j) => j !== i))}><Trash2 /></Button>
                </div>
              ))}
              {!linhas.length && <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhuma área. Use "Adicionar área".</p>}
            </div>
            <p className="text-xs text-muted-foreground">Uma linha por área tecnológica do resultado do edital, com o DR credenciado e o valor.</p>
            <datalist id="areas-tecnologicas">{areasTecnologicas.map((a) => <option key={a} value={a} />)}</datalist>
          </div>
        </div>
        <SheetFooter className="flex-row items-center justify-between border-t px-6 py-4">
          <span className="text-sm text-muted-foreground"><span className="font-mono">{numero}</span> · <span className="text-2xl font-semibold text-foreground tabular-nums">{linhas.length}</span> área(s)</span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button disabled={!linhas.some((l) => l.area.trim())} motivo="Adicione ao menos uma área" onClick={salvar}>Salvar edital</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
