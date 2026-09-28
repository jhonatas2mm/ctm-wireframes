import type React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, Lock, Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
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

// Seção numerada do formulário.
function Secao({ n, titulo, dica, children }: { n: number; titulo: string; dica?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3">
      <div className="flex items-start gap-3">
        <span className="bg-primary text-primary-foreground grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold">{n}</span>
        <div>
          <h3 className="text-sm leading-6 font-semibold">{titulo}</h3>
          {dica && <p className="text-muted-foreground text-xs">{dica}</p>}
        </div>
      </div>
      <div className="grid gap-3 pl-9">{children}</div>
    </section>
  )
}

type Item = { id: string; ch: string; valor: string } // valor em centavos (só dígitos)
const centavos = (v: string) => Number(v || 0) / 100

// Gerar novo edital: CTMs, cursos (área e modalidade fixas do catálogo; CH e valor ajustáveis por curso) e DRs credenciados.
export function NovoEditalSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const db = useEditais()
  const cursos = useCursos().all
  const [ctm, setCtm] = useState<string[]>([])
  const [itens, setItens] = useState<Item[]>([])
  const [busca, setBusca] = useState('')
  const [drs, setDrs] = useState<string[]>([])
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [marcados, setMarcados] = useState<string[]>([])
  const [loteCh, setLoteCh] = useState('')
  const [loteValor, setLoteValor] = useState('')

  const ano = new Date().getFullYear()
  const numero = `ED-${String(db.all.filter((e) => e.numero.endsWith(`/${ano}`)).length + 1).padStart(3, '0')}/${ano}`
  const byId = (id: string) => cursos.find((c) => c.id === id)!
  const disponiveis = cursos.filter(
    (c) => !itens.some((i) => i.id === c.id) && norm(`${c.codigo} ${c.nome} ${c.area} ${c.modalidade}`).includes(norm(busca.trim())),
  )
  const chTotal = itens.reduce((t, i) => t + Number(i.ch || 0), 0)
  const valorTotal = itens.reduce((t, i) => t + centavos(i.valor), 0)
  const itensOk = itens.length > 0 && itens.every((i) => Number(i.ch) > 0 && Number(i.valor) > 0)
  const vigOk = !!inicio && !!fim && fim >= inicio
  const faltando = [!vigOk && 'vigência', !ctm.length && 'CTM', !itensOk && 'cursos com CH e valor', !drs.length && 'DRs'].filter(Boolean)

  const setItem = (id: string, patch: Partial<Item>) => setItens((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const todosMarcados = itens.length > 0 && marcados.length === itens.length
  // Replica CH/valor nos cursos marcados (ou em todos, se nenhum marcado).
  const replicar = (patch: Partial<Item>) => {
    const alvo = marcados.length ? marcados : itens.map((i) => i.id)
    setItens((xs) => xs.map((x) => (alvo.includes(x.id) ? { ...x, ...patch } : x)))
    toast(`Aplicado em ${alvo.length} curso(s)`)
  }
  const reset = () => (setCtm([]), setItens([]), setBusca(''), setDrs([]), setInicio(''), setFim(''), setMarcados([]), setLoteCh(''), setLoteValor(''))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-6xl">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg">Gerar novo edital</SheetTitle>
            <Badge variant="secondary" className="font-mono">{numero}</Badge>
          </div>
          <SheetDescription>Defina onde o edital vale, os cursos ofertados e os DRs credenciados.</SheetDescription>
        </SheetHeader>

        <form
          id="novo-edital"
          className="grid min-h-0 flex-1 grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          onSubmit={(e) => {
            e.preventDefault()
            if (faltando.length) return
            const cs = itens.map((i) => {
              const c = byId(i.id)
              return { nome: c.nome, area: c.area, modalidade: c.modalidade, cargaHoraria: Number(i.ch), valor: centavos(i.valor) }
            })
            db.add({ numero, ctm, cursos: cs, cargaHoraria: chTotal, valor: valorTotal, drs, vigenciaInicio: fmtData(inicio), vigenciaFim: fmtData(fim) })
            toast.success(`Edital ${numero} gerado`)
            reset()
            onOpenChange(false)
          }}
        >
          {/* Esquerda: onde, quais cursos e quem executa */}
          <div className="grid content-start gap-8 overflow-y-auto border-r px-6 py-6">
            <Secao n={1} titulo="Vigência" dica="Período em que o edital vale.">
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs">
                  <span className="text-muted-foreground">Início</span>
                  <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                </label>
                <label className="grid gap-1 text-xs">
                  <span className="text-muted-foreground">Fim</span>
                  <Input type="date" min={inicio} value={fim} onChange={(e) => setFim(e.target.value)} />
                </label>
              </div>
            </Secao>

            <Secao n={2} titulo="CTMs" dica="Estados onde o edital será ofertado.">
              <EstadosInput value={ctm} onChange={setCtm} />
            </Secao>

            <Secao n={3} titulo="Cursos" dica="Clique para adicionar. Os adicionados são editados ao lado.">
              <div className="rounded-lg border">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <input
                    className="h-9 w-full bg-transparent pr-3 pl-9 text-sm outline-none"
                    placeholder="Buscar curso por código, nome, área ou modalidade…"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <ul className="max-h-64 overflow-y-auto border-t">
                  {disponiveis.length === 0 && <li className="text-muted-foreground px-3 py-2 text-sm">Nenhum curso encontrado.</li>}
                  {disponiveis.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setItens((xs) => [...xs, { id: c.id, ch: String(c.cargaHoraria), valor: '' }])}
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
            </Secao>

            <Secao n={4} titulo="DRs credenciados" dica="Departamentos Regionais que podem executar os cursos.">
              <EstadosInput value={drs} onChange={setDrs} placeholder="Buscar DR por sigla ou estado…" prefix="SENAI-" />
            </Secao>
          </div>

          {/* Direita: cursos adicionados, com CH e valor editáveis e replicação em lote */}
          <div className="bg-muted/30 flex min-h-0 flex-col">
            <div className="flex items-center justify-between border-b px-6 py-3">
              <div>
                <h3 className="text-sm font-semibold">Cursos do edital ({itens.length})</h3>
                <p className="text-muted-foreground text-xs">Área tecnológica e modalidade são fixas (catálogo). CH e valor são editáveis.</p>
              </div>
              {itens.length > 0 && (
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={todosMarcados} onChange={(e) => setMarcados(e.target.checked ? itens.map((i) => i.id) : [])} />
                  Selecionar todos
                </label>
              )}
            </div>

            {itens.length > 0 && (
              <div className="bg-background flex flex-wrap items-end gap-2 border-b px-6 py-3">
                <p className="text-muted-foreground w-full text-xs">
                  Replicar em {marcados.length ? `${marcados.length} curso(s) selecionado(s)` : 'todos os cursos'}:
                </p>
                <Input className="h-8 w-28" inputMode="numeric" placeholder="CH (h)" value={loteCh} onChange={(e) => setLoteCh(e.target.value.replace(/\D/g, ''))} />
                <Button type="button" size="sm" variant="outline" disabled={!loteCh} onClick={() => replicar({ ch: loteCh })}>
                  <Copy /> Aplicar CH
                </Button>
                <Input className="ml-2 h-8 w-48" inputMode="numeric" placeholder="R$ 0,00" value={loteValor ? brl(centavos(loteValor)) : ''} onChange={(e) => setLoteValor(e.target.value.replace(/\D/g, ''))} />
                <Button type="button" size="sm" variant="outline" disabled={!loteValor} onClick={() => replicar({ valor: loteValor })}>
                  <Copy /> Aplicar valor
                </Button>
              </div>
            )}

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
                      <li key={i.id} className={`bg-background grid grid-cols-[auto_1fr_6rem_12rem_auto] items-center gap-3 rounded-lg border p-3 ${on ? 'border-primary' : ''}`}>
                        <input type="checkbox" aria-label={`Selecionar ${c.nome}`} checked={on} onChange={() => setMarcados((m) => (on ? m.filter((x) => x !== i.id) : [...m, i.id]))} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{c.nome}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-muted-foreground font-mono text-xs">{c.codigo}</span>
                            {[c.area, c.modalidade].map((t) => (
                              <span key={t} className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs" title="Definido no catálogo — não editável">
                                <Lock className="size-3" /> {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <label className="grid gap-1 text-xs">
                          <span className="text-muted-foreground">CH (h)</span>
                          <Input className="h-8" inputMode="numeric" value={i.ch} onChange={(e) => setItem(i.id, { ch: e.target.value.replace(/\D/g, '') })} />
                        </label>
                        <label className="grid gap-1 text-xs">
                          <span className="text-muted-foreground">Valor</span>
                          <Input className="h-8" inputMode="numeric" placeholder="R$ 0,00" value={i.valor ? brl(centavos(i.valor)) : ''} onChange={(e) => setItem(i.id, { valor: e.target.value.replace(/\D/g, '') })} />
                        </label>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remover ${c.nome}`} onClick={() => (setItens((xs) => xs.filter((x) => x.id !== i.id)), setMarcados((m) => m.filter((x) => x !== i.id)))}>
                          <X />
                        </Button>
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
              <span className="font-semibold tabular-nums">{brl(valorTotal)}</span>
              <span className="text-muted-foreground"> · {itens.length} curso(s) · {chTotal} h</span>
            </p>
            {faltando.length > 0 && <p className="text-muted-foreground text-xs">Falta: {faltando.join(', ')}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" form="novo-edital" disabled={faltando.length > 0}>Gerar edital</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
