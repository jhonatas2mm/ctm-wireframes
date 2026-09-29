import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, FileSpreadsheet, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EmptyState, ModulosEditor, moduloVazio } from '@/components/wf'
import { aprovadaDe, useCursosDr, useEditais, type Modulo } from '@/lib/mock'
import { cn } from '@/lib/utils'

// DR do usuário logado (perfil Supervisor).
const DR = 'MG'
const norm = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
const completo = (ms: Modulo[] | undefined) => !!ms?.length && ms.every((m) => m.nome.trim() && m.unidades.length && m.unidades.every((u) => u.nome.trim()))
const qtdUcs = (ms: Modulo[] = []) => ms.reduce((t, m) => t + m.unidades.length, 0)

// Novo produto (Supervisor), em 3 colunas na mesma tela:
// edital (escolhe um) → produtos desse edital (marca um ou mais) → módulos e UCs do produto ativo.
// Cada produto vira um item em Gestão de Portfólio.
// CH fora por enquanto (cargaHoraria fica 0).
export function NovoCursoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const db = useCursosDr()
  const { all: todos } = useEditais()
  const [busca, setBusca] = useState('')
  const [editalId, setEditalId] = useState<string | null>(null)
  const [marcados, setMarcados] = useState<string[]>([]) // nomes dos cursos
  const [estrutura, setEstrutura] = useState<Record<string, Modulo[]>>({})
  const [ativo, setAtivo] = useState<string | null>(null)

  const editais = todos.filter((e) => e.cursos.some((c) => aprovadaDe(c) === DR))
  const visiveis = editais.filter((e) => norm(`${e.numero} ${e.cursos.map((c) => c.nome).join(' ')}`).includes(norm(busca.trim())))
  const edital = editais.find((e) => e.id === editalId)
  const cursos = edital?.cursos.filter((c) => aprovadaDe(c) === DR) ?? []
  const jaCriado = (nome: string) => db.all.some((c) => c.edital === edital?.numero && c.nome === nome)
  const livres = cursos.filter((c) => !jaCriado(c.nome))
  const sel = cursos.filter((c) => marcados.includes(c.nome))
  const atual = sel.find((c) => c.nome === ativo) ?? sel[0]
  const modulos = atual ? estrutura[atual.nome] ?? [] : []
  const prontos = sel.filter((c) => completo(estrutura[c.nome])).length
  const podeSalvar = sel.length > 0

  // Protótipo: já abre com um edital escolhido e um produto preenchido (módulos e UCs de exemplo).
  useEffect(() => {
    if (!open) return
    const e = editais.find((x) => x.cursos.some((c) => aprovadaDe(c) === DR && !db.all.some((d) => d.edital === x.numero && d.nome === c.nome)))
    const c = e?.cursos.find((c) => aprovadaDe(c) === DR && !db.all.some((d) => d.edital === e.numero && d.nome === c.nome))
    if (!e || !c) return
    setEditalId(e.id)
    setMarcados([c.nome])
    setAtivo(c.nome)
    setEstrutura({ [c.nome]: [
      { nome: 'Fundamentos', unidades: [{ nome: 'Segurança e saúde no trabalho', cargaHoraria: 0 }, { nome: 'Leitura e interpretação de desenhos', cargaHoraria: 0 }] },
      { nome: 'Específico', unidades: [{ nome: 'Práticas profissionais', cargaHoraria: 0 }] },
    ] })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => (setBusca(''), setEditalId(null), setMarcados([]), setEstrutura({}), setAtivo(null))
  const escolherEdital = (id: string) => id !== editalId && (setEditalId(id), setMarcados([]), setEstrutura({}), setAtivo(null))
  // Marcar um produto já o abre para edição, com um módulo em branco.
  const toggle = (nome: string) => {
    const on = marcados.includes(nome)
    setMarcados((xs) => (on ? xs.filter((x) => x !== nome) : [...xs, nome]))
    if (!on) setEstrutura((e) => ({ ...e, [nome]: e[nome] ?? [moduloVazio()] })), setAtivo(nome)
  }
  const marcarTodos = () => {
    const todosOn = marcados.length === livres.length
    setMarcados(todosOn ? [] : livres.map((c) => c.nome))
    if (!todosOn) setEstrutura((e) => ({ ...Object.fromEntries(livres.map((c) => [c.nome, [moduloVazio()]])), ...e }))
  }
  const setModulos = (fn: (ms: Modulo[]) => Modulo[]) => void (atual && setEstrutura((e) => ({ ...e, [atual.nome]: fn(e[atual.nome] ?? []) })))
  const salvar = () => {
    if (!edital) return
    for (const c of sel) db.add({ nome: c.nome, edital: edital.numero, area: c.area, modalidade: c.modalidade, cargaHorariaEdital: c.cargaHoraria, modulos: estrutura[c.nome], versao: 1, ctm: DR, situacao: 'Aguardando', criadoEm: new Date().toISOString() }) // solicitação: o DN aprova para entrar no portfólio
    reset()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={(v) => (v || reset(), onOpenChange(v))}>
      <SheetContent side="bottom" className="data-[side=bottom]:h-[95vh] gap-0 overflow-hidden rounded-t-xl p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">Novo produto</SheetTitle>
          <SheetDescription className="sr-only">Escolha o edital, os produtos e cadastre módulos e UCs</SheetDescription>
        </SheetHeader>

        <div className="grid min-h-0 flex-1 grid-cols-[18rem_20rem_1fr] overflow-hidden">
          {/* Edital (apenas um) */}
          <section className="flex min-h-0 flex-col border-r">
            <div className="grid gap-2 border-b p-3">
              <h3 className="text-sm font-semibold">Edital</h3>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Buscar edital ou curso…" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
            </div>
            <div className="grid content-start gap-2 overflow-y-auto p-3">
              {visiveis.map((e) => {
                const on = e.id === editalId
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => escolherEdital(e.id)}
                    className={cn('grid gap-1 rounded-lg border p-3 text-left transition-colors hover:border-foreground/40 bg-card', on && 'border-foreground ring-1 ring-foreground')}
                  >
                    <span className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-mono text-sm font-semibold"><FileSpreadsheet className="size-3.5" /> {e.numero}</span>
                      {on ? <CheckCircle2 className="size-4" /> : <Circle className="size-4 text-muted-foreground" />}
                    </span>
                    <span className="text-xs text-muted-foreground">Vigência {e.vigenciaInicio} a {e.vigenciaFim}</span>
                    <span className="text-xs text-muted-foreground">{e.cursos.filter((c) => aprovadaDe(c) === DR).length} curso(s) para o SENAI-{DR}</span>
                  </button>
                )
              })}
              {visiveis.length === 0 && <EmptyState title="Nenhum edital encontrado" />}
            </div>
          </section>

          {/* Produtos do edital (um ou mais) */}
          <section className="flex min-h-0 flex-col border-r">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
              <h3 className="text-sm font-semibold">Produtos do edital {edital && <span className="font-normal text-muted-foreground">({sel.length})</span>}</h3>
              {livres.length > 1 && (
                <Button variant="ghost" size="sm" onClick={marcarTodos}>
                  {marcados.length === livres.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </Button>
              )}
            </div>
            {!edital ? (
              <div className="p-3"><EmptyState title="Escolha um edital" /></div>
            ) : (
              <ul className="grid content-start gap-1.5 overflow-y-auto p-3">
                {cursos.map((c) => {
                  const criado = jaCriado(c.nome)
                  const on = marcados.includes(c.nome)
                  const ativoAqui = on && atual?.nome === c.nome
                  return (
                    <li key={c.nome} className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors bg-card', on && 'bg-muted/40', ativoAqui && 'border-foreground', criado && 'opacity-50')}>
                      <input type="checkbox" className="size-4" disabled={criado} checked={on} onChange={() => toggle(c.nome)} aria-label={c.nome} />
                      <button type="button" disabled={!on} onClick={() => setAtivo(c.nome)} className="min-w-0 flex-1 text-left disabled:cursor-default">
                        <span className="block truncate text-sm font-medium">{c.nome}</span>
                        <span className="block text-xs text-muted-foreground">
                          {on ? `${(estrutura[c.nome] ?? []).length} módulo(s) · ${qtdUcs(estrutura[c.nome])} UC(s)` : `${c.modalidade} · ${c.area}`}
                        </span>
                      </button>
                      {criado ? <Badge variant="secondary">Já cadastrado</Badge> : on && (completo(estrutura[c.nome]) ? <CheckCircle2 className="size-4 shrink-0 text-emerald-600" /> : <Circle className="size-4 shrink-0 text-muted-foreground" />)}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Módulos e UCs do produto ativo */}
          <section className="min-h-0 overflow-y-auto px-6 py-4">
            {!atual ? (
              <EmptyState title={edital ? 'Selecione um ou mais produtos' : 'Escolha um edital'} />
            ) : (
              <div className="mx-auto grid max-w-3xl gap-4">
                <h3 className="font-semibold">{atual.nome}</h3>
                <ModulosEditor modulos={modulos} onChange={setModulos} />
              </div>
            )}
          </section>
        </div>

        <SheetFooter className="flex-row items-center justify-between gap-4 border-t px-6 py-3">
          <p className="text-sm">
            <span className="text-2xl font-semibold tabular-nums">{prontos}/{sel.length}</span>
            <span className="text-muted-foreground"> produto(s) prontos{edital && ` · ${edital.numero}`}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button disabled={!podeSalvar} motivo="Selecione ao menos um produto" onClick={salvar}>Salvar {sel.length > 1 ? `${sel.length} produtos` : 'produto'}</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
