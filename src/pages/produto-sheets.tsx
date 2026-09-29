import { useEffect, useState, type ReactNode } from 'react'
import { ExternalLink, FileText, GitBranchPlus, Link2, Lock, Plus, Route, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ModulosEditor, Req, useConfirmar } from '@/components/wf'
import { situacaoDe, tiposMaterial, useCursosDr, type CursoDr, type MaterialProduto, type Modulo, type SituacaoPortfolio, type TipoMaterial } from '@/lib/mock'
import { cn } from '@/lib/utils'

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')
const v = (c: CursoDr) => c.versao ?? 1

const corSituacao: Record<SituacaoPortfolio, string> = {
  'Aguardando aprovação': 'bg-amber-100 text-amber-800',
  Aprovado: 'bg-emerald-100 text-emerald-800',
  Reprovado: 'bg-red-100 text-red-800',
}
export function SituacaoBadge({ c }: { c: CursoDr }) {
  const s = situacaoDe(c)
  return <Badge variant="secondary" className={corSituacao[s]}>{s}</Badge>
}

// Todas as versões do produto (a v1 e as que apontam para ela), da mais antiga à mais nova.
export function useFamilia(id: string | null) {
  const db = useCursosDr()
  const p = db.get(id ?? undefined)
  const raiz = p ? p.origemId ?? p.id : ''
  const familia = db.all.filter((c) => c.id === raiz || c.origemId === raiz).sort((a, b) => v(a) - v(b))
  return { db, p, raiz, familia, proxima: familia.length ? Math.max(...familia.map(v)) + 1 : 1 }
}

// Detalhes do produto (side sheet): versão aberta, situação (aprovação do DN), histórico de versões, vínculo com o
// itinerário e documentos/materiais. somenteLeitura: portfólio público e aprovação do DN. acoes: botões do rodapé.
export function ProdutoSheet({ id, onClose, onNovaVersao, somenteLeitura, acoes }: {
  id: string | null; onClose: () => void; onNovaVersao?: (id: string) => void; somenteLeitura?: boolean; acoes?: (p: CursoDr) => ReactNode
}) {
  const [sel, setSel] = useState<string | null>(id)
  useEffect(() => setSel(id), [id])
  const { db, p, familia } = useFamilia(sel ?? id)
  const { confirmar, dialogo } = useConfirmar()
  const [vincular, setVincular] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [novo, setNovo] = useState<MaterialProduto>({ nome: '', tipo: 'Plano de curso', link: '' })
  const atual = familia[familia.length - 1]
  const pendente = familia.some((c) => situacaoDe(c) === 'Aguardando aprovação')
  const materiais = p?.materiais ?? []
  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-3xl">
        {p && (
          <>
            <SheetHeader className="border-b px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-lg">{p.nome}</SheetTitle>
                <Badge variant="secondary" className="tabular-nums">v{v(p)}</Badge>
                {p.id === atual?.id && <Badge variant="outline">Mais recente</Badge>}
                <SituacaoBadge c={p} />
              </div>
              <SheetDescription className="sr-only">Detalhes e versões do produto</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
              {situacaoDe(p) === 'Reprovado' && p.motivo && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                  <p className="mb-1 text-xs font-medium">Motivo da reprovação (DN)</p>
                  <p className="whitespace-pre-wrap">{p.motivo}</p>
                </div>
              )}
              <dl className="grid grid-cols-2 gap-4">
                {([
                  ['CTM', p.ctm ? `SENAI-${p.ctm}` : '—'],
                  ['Edital', <span className="font-mono">{p.edital ?? '—'}</span>],
                  ['CH', `${p.cargaHorariaEdital ?? 0} h`],
                  ['Área tecnológica', p.area ?? '—'],
                  ['Modalidade', p.modalidade ?? '—'],
                  ['Solicitada em', data(p.criadoEm)],
                  ['Origem', p.baseadaEm ? `Baseada na v${p.baseadaEm}` : 'Versão original'],
                  ['Decisão do DN', p.decididoEm ? `${situacaoDe(p)} em ${data(p.decididoEm)}` : situacaoDe(p) === 'Aguardando aprovação' ? 'Pendente' : '—'],
                ] as [string, ReactNode][]).map(([k, val]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="text-sm">{val}</dd>
                  </div>
                ))}
              </dl>

              {/* Vínculo com o itinerário (outro sistema): a DR vincula; detalhes da integração ficam para depois */}
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Itinerário</h3>
                <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm bg-card">
                  <Route className="size-4 text-muted-foreground" />
                  {p.itinerario ? (
                    <span className="min-w-0 flex-1">Vinculado a <span className="font-mono">{p.itinerario.codigo}</span> <span className="text-xs text-muted-foreground">em {data(p.itinerario.vinculadoEm)}</span></span>
                  ) : (
                    <span className="min-w-0 flex-1 text-muted-foreground">Sem vínculo com o itinerário</span>
                  )}
                  {!somenteLeitura && (
                    <Button size="sm" variant="outline" onClick={() => (setCodigo(p.itinerario?.codigo ?? `IT-${(p.area ?? 'GER').slice(0, 3).toUpperCase()}-${p.nome.split(' ').at(-1)!.slice(0, 3).toUpperCase()}-2026`), setVincular(true))}>
                      <Link2 /> {p.itinerario ? 'Trocar vínculo' : 'Vincular ao itinerário'}
                    </Button>
                  )}
                </div>
              </section>

              {/* Documentos e materiais: ficam no repositório/drive; aqui só o vínculo (link) */}
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Documentos e materiais <span className="font-normal text-muted-foreground">({materiais.length})</span></h3>
                {materiais.length > 0 && (
                  <ul className="divide-y rounded-lg border bg-card">
                    {materiais.map((m, i) => (
                      <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{m.nome}</span>
                          <span className="block truncate text-xs text-muted-foreground">{m.tipo} · {m.link}</span>
                        </span>
                        <Button size="icon-sm" variant="ghost" aria-label={`Abrir ${m.nome}`} render={<a href={m.link} target="_blank" rel="noreferrer" />} nativeButton={false}><ExternalLink /></Button>
                        {!somenteLeitura && (
                          <Button size="icon-sm" variant="ghost" aria-label={`Desvincular ${m.nome}`} onClick={() => confirmar({ titulo: `Desvincular “${m.nome}” deste produto?`, acao: 'Desvincular', onConfirmar: () => db.update(p.id, { materiais: materiais.filter((_, j) => j !== i) }) })}><Trash2 /></Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {!materiais.length && somenteLeitura && <p className="text-sm text-muted-foreground">Nenhum documento vinculado.</p>}
                {!somenteLeitura && (
                  <div className="grid grid-cols-[1fr_10rem_1fr_auto] items-end gap-2 rounded-lg border border-dashed p-3">
                    <div className="grid gap-1"><Label className="text-xs">Nome</Label><Input className="h-8" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} placeholder="Ex.: Plano de curso" /></div>
                    <div className="grid gap-1">
                      <Label className="text-xs">Tipo</Label>
                      <Select value={novo.tipo} onValueChange={(t) => setNovo({ ...novo, tipo: t as TipoMaterial })}>
                        <SelectTrigger className="h-8 w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>{tiposMaterial.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1"><Label className="text-xs">Link</Label><Input className="h-8" value={novo.link} onChange={(e) => setNovo({ ...novo, link: e.target.value })} placeholder="https://…" /></div>
                    <Button size="sm" variant="outline" onClick={() => {
                      const m = { ...novo, nome: novo.nome.trim() || novo.tipo, link: novo.link.trim() || `https://drive.ctm.senaimg.org.br/${p.id}/${materiais.length + 1}` }
                      db.update(p.id, { materiais: [...materiais, m] })
                      setNovo({ nome: '', tipo: 'Plano de curso', link: '' })
                    }}><Plus /> Vincular</Button>
                  </div>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Versões</h3>
                <ol className="divide-y rounded-lg border bg-card">
                  {[...familia].reverse().map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSel(c.id)}
                        className={cn('flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50', c.id === p.id && 'bg-muted font-medium')}
                      >
                        <span className="w-8 tabular-nums">v{v(c)}</span>
                        <span className="text-xs text-muted-foreground">{c.baseadaEm ? `a partir da v${c.baseadaEm}` : 'original'}</span>
                        <span className="ml-auto flex items-center gap-2"><SituacaoBadge c={c} /><span className="text-xs text-muted-foreground">{data(c.criadoEm)}</span></span>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Módulos e UCs · v{v(p)}</h3>
                <ol className="grid gap-2">
                  {p.modulos.map((m, i) => (
                    <li key={i} className="rounded-lg border p-3 bg-card">
                      <p className="text-sm font-medium">{i + 1}. {m.nome}</p>
                      <ul className="mt-1 grid gap-0.5 pl-5 text-sm text-muted-foreground">
                        {m.unidades.map((u, k) => <li key={k}>{i + 1}.{k + 1} {u.nome}</li>)}
                      </ul>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
            {(acoes || (!somenteLeitura && onNovaVersao)) && (
              <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-3">
                {acoes?.(p)}
                {!somenteLeitura && onNovaVersao && (
                  <Button disabled={pendente} title={pendente ? 'Já existe uma versão aguardando aprovação do DN' : undefined} onClick={() => onNovaVersao(p.id)}>
                    <GitBranchPlus /> Nova versão a partir da v{v(p)}
                  </Button>
                )}
              </SheetFooter>
            )}
            <Dialog open={vincular} onOpenChange={setVincular}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Vincular ao itinerário</DialogTitle>
                  <DialogDescription>Vínculo com o sistema de itinerários (a integração será detalhada depois). Informe o código do itinerário deste produto.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-1.5"><Label>Código do itinerário <Req /></Label><Input value={codigo} onChange={(e) => setCodigo(e.target.value)} /></div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setVincular(false)}>Cancelar</Button>
                  <Button onClick={() => (db.update(p.id, { itinerario: { codigo: codigo.trim(), vinculadoEm: new Date().toISOString() } }), setVincular(false))}><Link2 /> Vincular</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {dialogo}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// Nova versão: copia a versão de origem para ajustes e salva como vN+1, aguardando a aprovação do DN.
// A origem não é alterada.
export function NovaVersaoSheet({ id, onClose, onSaved }: { id: string | null; onClose: () => void; onSaved?: (id: string) => void }) {
  const { db, p, raiz, proxima } = useFamilia(id)
  const [rascunho, setRascunho] = useState<Modulo[]>([])
  useEffect(() => setRascunho(p ? structuredClone(p.modulos) : []), [id]) // eslint-disable-line react-hooks/exhaustive-deps
  const salvar = () => {
    if (!p) return
    const { id: _id, motivo: _m, decididoEm: _d, ...base } = p
    const nova = db.add({ ...base, modulos: rascunho, versao: proxima, origemId: raiz, baseadaEm: v(p), situacao: 'Aguardando aprovação', criadoEm: new Date().toISOString() })
    onSaved?.(nova.id)
    onClose()
  }
  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="data-[side=bottom]:h-[95vh] gap-0 overflow-hidden rounded-t-xl p-0">
        {p && (
          <>
            <SheetHeader className="border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <SheetTitle className="text-lg">Nova versão · {p.nome}</SheetTitle>
                {/* Versão em destaque: de onde vem → a que será criada */}
                <span className="flex items-center gap-2 rounded-md border-2 border-foreground px-2.5 py-1 text-sm font-semibold tabular-nums">
                  <span className="text-muted-foreground">v{v(p)}</span> → v{proxima}
                </span>
                <Badge variant="secondary" className={corSituacao['Aguardando aprovação']}>vai para aprovação do DN</Badge>
              </div>
              <SheetDescription className="sr-only">Ajuste módulos e UCs; a v{v(p)} não é alterada</SheetDescription>
              <div className="flex flex-wrap gap-2 pt-1">
                {[p.edital, p.area, p.modalidade, `${p.cargaHorariaEdital ?? 0} h`].filter(Boolean).map((t) => (
                  <Badge key={t} variant="outline" className="gap-1 font-normal"><Lock className="size-3" /> {t}</Badge>
                ))}
              </div>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="mx-auto grid max-w-3xl gap-4">
                <ModulosEditor modulos={rascunho} onChange={(fn) => setRascunho(fn)} />
              </div>
            </div>
            <SheetFooter className="flex-row items-center justify-end gap-2 border-t px-6 py-3">
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button onClick={salvar}>Salvar versão v{proxima}</Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
