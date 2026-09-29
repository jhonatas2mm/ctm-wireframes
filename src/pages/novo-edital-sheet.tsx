import { Req } from '@/components/wf'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Copy, Redo2, Undo2, Lock, Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCursos, useEditais } from '@/lib/mock'

const UFS = 'AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO'.split(' ')
const ESTADOS: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul', MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba',
  PE: 'Pernambuco', PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RO: 'Rondônia', RR: 'Roraima',
  RS: 'Rio Grande do Sul', SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins',
}
const norm = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// Seleção múltipla de estados com busca por sigla ou nome. Resultados logo abaixo do campo; escolhidos em seguida.
function EstadosInput({ value, onChange, placeholder = 'Buscar estado por sigla ou nome…', prefix = '' }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; prefix?: string }) {
  const [q, setQ] = useState('')
  const matches = UFS.filter((uf) => !value.includes(uf) && norm(`${uf} ${ESTADOS[uf]}`).includes(norm(q.trim())))
  return (
    <div className="grid gap-2">
      <div className="rounded-lg border">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input className="h-9 w-full bg-transparent pr-3 pl-9 text-sm outline-none" placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {q.trim() && (
          <ul className="max-h-40 overflow-y-auto border-t">
            {matches.length === 0 && <li className="text-muted-foreground px-3 py-2 text-sm">Nenhum estado encontrado.</li>}
            {matches.map((uf) => (
              <li key={uf}>
                <button
                  type="button"
                  onClick={() => (onChange([...value, uf]), setQ(''))}
                  className="hover:bg-accent/60 group flex w-full items-center gap-2 border-b px-3 py-1.5 text-left text-sm last:border-0"
                >
                  <Plus className="text-muted-foreground group-hover:text-foreground size-3.5" />
                  <span className="text-muted-foreground w-6 font-mono text-xs">{uf}</span>
                  {ESTADOS[uf]}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((uf) => (
            <Badge key={uf} variant="secondary" className="gap-1">
              {prefix}{uf} · {ESTADOS[uf]}
              <button type="button" aria-label={`Remover ${uf}`} onClick={() => onChange(value.filter((x) => x !== uf))}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

const fmtData = (iso: string) => iso.split('-').reverse().join('/')
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Seção do formulário.
function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3">
      <h3 className="text-sm font-semibold">{titulo}</h3>
      {children}
    </section>
  )
}

type Item = { id: string; ch: string; valor: string; drs: string[] } // valor em centavos (só dígitos); drs = DRs credenciados no curso
const centavos = (v: string) => Number(v || 0) / 100

// Novo edital: vigência, DRs credenciados e cursos (área, modalidade e CH fixas do catálogo; só o valor é ajustável por curso).
export function NovoEditalSheet({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; onSaved?: (id: string) => void }) {
  const db = useEditais()
  const cursos = useCursos().all
  // Histórico dos cursos para desfazer/avançar.
  const [hist, setHist] = useState<{ past: Item[][]; present: Item[]; future: Item[][] }>({ past: [], present: [], future: [] })
  const itens = hist.present
  const setItens = (fn: (xs: Item[]) => Item[]) =>
    setHist((h) => ({ past: [...h.past, h.present], present: fn(h.present), future: [] }))
  const desfazer = () => setHist((h) => (h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h))
  const avancar = () => setHist((h) => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h))
  const [busca, setBusca] = useState('')
  const [loteDrs, setLoteDrs] = useState<string[]>([])
  const [replicarAberto, setReplicarAberto] = useState(false)
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [marcados, setMarcados] = useState<string[]>([])
  const [loteValor, setLoteValor] = useState('')

  // Protótipo: já abre preenchido com dados de exemplo (vigência e 3 cursos com valor e DRs).
  useEffect(() => {
    if (!open) return
    setInicio('2026-11-01')
    setFim('2027-10-31')
    const ex = cursos.slice(0, 3)
    setHist({ past: [], future: [], present: ex.map((c, i) => ({ id: c.id, ch: String(c.cargaHoraria), valor: String((i + 2) * 240000), drs: i === 0 ? ['MG', 'SP'] : ['MG'] })) })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const ano = new Date().getFullYear()
  const numero = `ED-${String(db.all.filter((e) => e.numero.endsWith(`/${ano}`)).length + 1).padStart(3, '0')}/${ano}`
  const byId = (id: string) => cursos.find((c) => c.id === id)!
  const disponiveis = cursos.filter(
    (c) => !itens.some((i) => i.id === c.id) && norm(`${c.codigo} ${c.nome} ${c.area} ${c.modalidade}`).includes(norm(busca.trim())),
  )
  const chTotal = itens.reduce((t, i) => t + Number(i.ch || 0), 0)
  const valorTotal = itens.reduce((t, i) => t + centavos(i.valor), 0)

  const setItem = (id: string, patch: Partial<Item>) => setItens((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const todosMarcados = itens.length > 0 && marcados.length === itens.length
  // Replica CH/valor nos cursos marcados (ou em todos, se nenhum marcado).
  const replicar = (patch: Partial<Item>) => {
    const alvo = marcados.length ? marcados : itens.map((i) => i.id)
    setItens((xs) => xs.map((x) => (alvo.includes(x.id) ? { ...x, ...patch } : x)))
  }
  const reset = () => (setHist({ past: [], present: [], future: [] }), setBusca(''), setLoteDrs([]), setInicio(''), setFim(''), setMarcados([]), setLoteValor(''))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Abre de baixo, 95% da altura; header e rodapé fixos, corpo rola. */}
      <SheetContent side="bottom" className="data-[side=bottom]:h-[95vh] gap-0 overflow-hidden rounded-t-xl p-0">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg">Novo edital</SheetTitle>
          </div>
          <SheetDescription className="sr-only">Novo edital</SheetDescription>
        </SheetHeader>

        <form
          id="novo-edital"
          className="grid min-h-0 flex-1 grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          onSubmit={(e) => {
            e.preventDefault()
            const cs = itens.map((i) => {
              const c = byId(i.id)
              return { nome: c.nome, area: c.area, modalidade: c.modalidade, cargaHoraria: Number(i.ch), valor: centavos(i.valor), drs: i.drs }
            })
            const novo = db.add({ numero, ctm: [], cursos: cs, cargaHoraria: chTotal, valor: valorTotal, drs: [...new Set(itens.flatMap((i) => i.drs))], vigenciaInicio: fmtData(inicio), vigenciaFim: fmtData(fim) })
            reset()
            if (onSaved) onSaved(novo.id)
            else onOpenChange(false)
          }}
        >
          {/* Esquerda: vigência e catálogo de cursos */}
          <div className="flex min-h-0 flex-col gap-6 border-r px-6 py-6">
            <Secao titulo="Vigência">
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs">
                  <span className="text-muted-foreground">Início <Req /></span>
                  <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                </label>
                <label className="grid gap-1 text-xs">
                  <span className="text-muted-foreground">Fim <Req /></span>
                  <Input type="date" min={inicio} value={fim} onChange={(e) => setFim(e.target.value)} />
                </label>
              </div>
            </Secao>
            <h3 className="-mb-3 text-sm font-semibold">Cursos</h3>
              <div className="flex min-h-0 flex-1 flex-col rounded-lg border">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <input
                    className="h-9 w-full bg-transparent pr-3 pl-9 text-sm outline-none"
                    placeholder="Buscar curso por código, nome, área ou modalidade…"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <ul className="min-h-0 flex-1 overflow-y-auto border-t">
                  {disponiveis.length === 0 && <li className="text-muted-foreground px-3 py-2 text-sm">Nenhum curso encontrado.</li>}
                  {disponiveis.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setItens((xs) => [...xs, { id: c.id, ch: String(c.cargaHoraria), valor: '', drs: [] }])}
                        className="hover:bg-accent/60 group flex w-full items-center gap-2 border-b px-3 py-1.5 text-left text-sm last:border-0"
                      >
                        <Plus className="text-muted-foreground group-hover:text-foreground size-3.5 shrink-0" />
                        <span className="flex-1">
                          {c.nome}
                          <span className="text-muted-foreground block font-mono text-[11px]">{c.codigo}</span>
                        </span>
                        <span className="text-muted-foreground text-right text-xs">{c.area}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
          </div>

          {/* Direita: cursos adicionados — valor e DRs credenciados por curso, com replicação em lote */}
          <div className="bg-muted/30 flex min-h-0 flex-col">
            <div className="flex items-center justify-between border-b px-6 py-3">
              <div>
                <h3 className="text-sm font-semibold">Cursos do edital ({itens.length})</h3>
              </div>
              {itens.length > 0 && (
                <div className="flex items-center gap-3">
                  <Button type="button" size="sm" variant="outline" disabled={!marcados.length} onClick={() => setReplicarAberto(true)}>
                      <Copy /> Replicar valores{marcados.length > 0 && ` (${marcados.length})`}
                  </Button>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={todosMarcados} onChange={(e) => setMarcados(e.target.checked ? itens.map((i) => i.id) : [])} />
                    Selecionar todos
                  </label>
                  <div className="flex gap-1 border-l pl-2">
                    <Button type="button" size="icon-sm" variant="ghost" aria-label="Desfazer" title="Desfazer" disabled={!hist.past.length} onClick={desfazer}>
                      <Undo2 />
                    </Button>
                    <Button type="button" size="icon-sm" variant="ghost" aria-label="Avançar" title="Avançar" disabled={!hist.future.length} onClick={avancar}>
                      <Redo2 />
                    </Button>
                  </div>
                </div>
              )}
            </div>


            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {itens.length === 0 ? (
                <div className="text-muted-foreground grid h-full place-items-center rounded-lg border border-dashed p-8 text-center text-sm">
                  Nenhum curso adicionado.
                  <br />
                  Busque e clique em um curso à esquerda.
                </div>
              ) : (
                <ul className="grid gap-2">
                  {itens.map((i) => {
                    const c = byId(i.id)
                    const on = marcados.includes(i.id)
                    return (
                      <li key={i.id} className={`bg-background grid grid-cols-[auto_1fr_12rem_auto] items-center gap-3 rounded-lg border p-3 ${on ? 'border-primary' : ''}`}>
                        <input type="checkbox" aria-label={`Selecionar ${c.nome}`} checked={on} onChange={() => setMarcados((m) => (on ? m.filter((x) => x !== i.id) : [...m, i.id]))} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{c.nome}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-muted-foreground font-mono text-xs">{c.codigo}</span>
                            {[c.area, c.modalidade, `${c.cargaHoraria} h`].map((t) => (
                              <span key={t} className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs" title="Definido no catálogo — não editável">
                                <Lock className="size-3" /> {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <label className="grid gap-1 text-xs">
                          <span className="text-muted-foreground">Valor <Req /></span>
                          <Input className="h-8" inputMode="numeric" placeholder="R$ 0,00" value={i.valor ? brl(centavos(i.valor)) : ''} onChange={(e) => setItem(i.id, { valor: e.target.value.replace(/\D/g, '') })} />
                        </label>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remover ${c.nome}`} onClick={() => (setItens((xs) => xs.filter((x) => x.id !== i.id)), setMarcados((m) => m.filter((x) => x !== i.id)))}>
                          <X />
                        </Button>
                        <div className="col-span-full grid gap-1 pl-7 text-xs">
                          <span className="text-muted-foreground">DRs credenciados <Req /></span>
                          <EstadosInput value={i.drs} onChange={(v) => setItem(i.id, { drs: v })} placeholder="Buscar DR por sigla ou estado…" prefix="SENAI-" />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </form>

        <SheetFooter className="flex-row items-center justify-between gap-4 border-t px-6 py-3">
          <div className="text-sm">
            <p>
              <span className="text-2xl font-semibold tabular-nums">{brl(valorTotal)}</span>
              <span className="text-muted-foreground"> · {itens.length} curso(s) · {chTotal} h</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" form="novo-edital">Salvar edital</Button>
          </div>
        </SheetFooter>
      </SheetContent>
      <Dialog open={replicarAberto} onOpenChange={setReplicarAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Replicar em {marcados.length} curso(s) selecionado(s)</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <label className="grid gap-1 text-xs">
              <span className="text-muted-foreground">DRs credenciados</span>
              <EstadosInput value={loteDrs} onChange={setLoteDrs} placeholder="Buscar DR por sigla ou estado…" prefix="SENAI-" />
            </label>
            <label className="grid gap-1 text-xs">
              <span className="text-muted-foreground">Valor</span>
              <Input inputMode="numeric" placeholder="R$ 0,00" value={loteValor ? brl(centavos(loteValor)) : ''} onChange={(e) => setLoteValor(e.target.value.replace(/\D/g, ''))} />
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setReplicarAberto(false)}>Cancelar</Button>
            <Button
              type="button"
              disabled={!loteDrs.length && !loteValor}
              onClick={() => {
                replicar({ ...(loteDrs.length ? { drs: loteDrs } : {}), ...(loteValor ? { valor: loteValor } : {}) })
                setLoteDrs([])
                setLoteValor('')
                setReplicarAberto(false)
              }}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
