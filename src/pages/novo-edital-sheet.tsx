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

// Novo resultado do edital (DN), no formato do resultado oficial: vigência e, por ÁREA TECNOLÓGICA, o DR credenciado e o
// valor em cada modalidade — EaD Assíncrono (R$ hora/estudante), EaD Síncrono (Aprendizagem) (R$ hora/turma, até 50
// estudantes) e EaD Personalizado (R$ hora/estudante). Modalidade sem DR = não ofertada na área.
type Oferta = { dr: string; valor: string } // valor em centavos (só dígitos)
type Linha = { area: string; assincrono: Oferta; sincrono: Oferta; personalizado: Oferta }
const vazia = (): Oferta => ({ dr: '', valor: '' })
const modalidades = [
  ['assincrono', 'EaD Assíncrono', 'hora/estudante'],
  ['sincrono', 'EaD Síncrono (Aprendizagem)', 'hora/turma · até 50'],
  ['personalizado', 'EaD Personalizado', 'hora/estudante'],
] as const

export function NovoEditalSheet({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; onSaved?: (id: string) => void }) {
  const db = useEditais()
  const drs = useDrs().all.filter((d) => d.status === 'Ativo')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [linhas, setLinhas] = useState<Linha[]>([])
  // Protótipo: já abre preenchido com três áreas no formato do resultado 2026-2028
  useEffect(() => {
    if (!open) return
    setInicio('2026-01-01')
    setFim('2028-12-31')
    setLinhas([
      { area: 'Desenvolvimento de Sistemas', assincrono: { dr: 'SC', valor: '65' }, sincrono: { dr: 'GO', valor: '2750' }, personalizado: { dr: 'GO', valor: '88' } },
      { area: 'Eletrônica e Automação', assincrono: { dr: 'SC', valor: '65' }, sincrono: { dr: 'GO', valor: '2750' }, personalizado: { dr: 'GO', valor: '88' } },
      { area: 'Comercial', assincrono: { dr: 'GO', valor: '55' }, sincrono: { dr: 'GO', valor: '2750' }, personalizado: { dr: 'GO', valor: '88' } },
    ])
  }, [open])
  const ano = new Date().getFullYear()
  const numero = `ED-${String(db.all.filter((e) => e.numero.endsWith(`/${ano}`)).length + 1).padStart(3, '0')}/${ano}`
  const set = (i: number, patch: Partial<Linha>) => setLinhas((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const num = (o: Oferta) => Number(o.valor || 0) / 100
  const salvar = () => {
    const areas: AreaEdital[] = linhas.filter((l) => l.area.trim()).map((l) => ({
      area: l.area.trim(), dr: l.assincrono.dr, valorHora: l.assincrono.dr ? num(l.assincrono) : 0,
      sincrono: l.sincrono.dr ? { dr: l.sincrono.dr, valor: num(l.sincrono) } : undefined,
      personalizado: l.personalizado.dr ? { dr: l.personalizado.dr, valor: num(l.personalizado) } : undefined,
    }))
    if (!areas.length) return
    const novo = db.add({ numero, areas, cursos: [], drs: [], vigenciaInicio: fmtData(inicio), vigenciaFim: fmtData(fim) })
    if (onSaved) onSaved(novo.id)
    else onOpenChange(false)
  }
  const grid = 'grid grid-cols-[minmax(14rem,1.3fr)_repeat(3,minmax(15rem,1fr))_2.5rem] gap-3'
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="data-[side=bottom]:h-[95vh] gap-0 overflow-hidden rounded-t-xl p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">Novo resultado do edital</SheetTitle>
          <SheetDescription className="sr-only">Por área tecnológica: DR credenciado e valor em cada modalidade</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
          <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
            <label className="grid gap-1 text-xs"><span className="text-muted-foreground">Vigência: início <Req /></span><Input type="date" className="w-44" value={inicio} onChange={(e) => setInicio(e.target.value)} /></label>
            <label className="grid gap-1 text-xs"><span className="text-muted-foreground">Fim <Req /></span><Input type="date" className="w-44" min={inicio} value={fim} onChange={(e) => setFim(e.target.value)} /></label>
            <Button type="button" variant="outline" className="ml-auto" onClick={() => setLinhas((xs) => [...xs, { area: '', assincrono: vazia(), sincrono: vazia(), personalizado: vazia() }])}><Plus /> Adicionar área</Button>
          </div>
          <div className="overflow-x-auto rounded-[1.25rem] border bg-card">
            <div className={`${grid} min-w-[64rem] border-b px-4 py-2 text-xs font-semibold text-muted-foreground`}>
              <span>Área tecnológica</span>
              {modalidades.map(([k, rot, un]) => <span key={k}>{rot} <span className="font-normal">· DR e valor (R$ {un})</span></span>)}
              <span />
            </div>
            {linhas.map((l, i) => (
              <div key={i} className={`${grid} min-w-[64rem] items-start border-b px-4 py-3 last:border-b-0`}>
                <Input list="areas-tecnologicas" value={l.area} placeholder="Ex.: Metalmecânica" onChange={(e) => set(i, { area: e.target.value })} />
                {modalidades.map(([k]) => (
                  <div key={k} className="grid grid-cols-[1fr_6.5rem] gap-2">
                    <Select value={l[k].dr || 'nenhum'} onValueChange={(v) => set(i, { [k]: { ...l[k], dr: v === 'nenhum' ? '' : (v as string) } } as Partial<Linha>)}>
                      <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => (v && v !== 'nenhum' ? `SENAI-${v}` : 'Não ofertada')}</SelectValue></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhum">Não ofertada</SelectItem>
                        {drs.map((d) => <SelectItem key={d.uf} value={d.uf}>SENAI-{d.uf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input inputMode="numeric" disabled={!l[k].dr} value={l[k].valor ? brl(Number(l[k].valor) / 100) : ''} placeholder="R$ 0,00" onChange={(e) => set(i, { [k]: { ...l[k], valor: e.target.value.replace(/\D/g, '') } } as Partial<Linha>)} />
                  </div>
                ))}
                <Button type="button" size="icon" variant="ghost" aria-label={`Remover ${l.area || 'área'}`} onClick={() => setLinhas((xs) => xs.filter((_, j) => j !== i))}><Trash2 /></Button>
              </div>
            ))}
            {!linhas.length && <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhuma área. Use "Adicionar área".</p>}
          </div>
          <datalist id="areas-tecnologicas">{areasTecnologicas.map((a) => <option key={a} value={a} />)}</datalist>
        </div>
        <SheetFooter className="flex-row items-center justify-between border-t px-6 py-4">
          <span className="text-sm text-muted-foreground"><span className="font-mono">{numero}</span> · <span className="text-2xl font-semibold text-foreground tabular-nums">{linhas.length}</span> área(s)</span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button disabled={!linhas.some((l) => l.area.trim())} motivo="Adicione ao menos uma área" onClick={salvar}>Salvar resultado</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
