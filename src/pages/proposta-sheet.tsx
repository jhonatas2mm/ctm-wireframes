import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FileText, GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EmptyState } from '@/components/wf'
import { StatusPropostaBadge } from '@/components/wf/status-proposta'
import { aoVivoTurma, useTurmas, type Produto } from '@/lib/mock'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const dataBr = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '—')

// Detalhes da proposta (side sheet) com o vínculo às ofertas (turmas) criadas a partir dela.
export function PropostaSheet({ proposta: p, onClose }: { proposta: Produto | null; onClose: () => void }) {
  const { all: turmas } = useTurmas()
  const navigate = useNavigate()
  const ofertas = p ? turmas.filter((t) => t.propostaId === p.id) : []
  const total = p ? p.cursos.reduce((t, c) => t + c.valorPrevisto, 0) : 0
  return (
    <Sheet open={!!p} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-3xl">
        {p && (
          <>
            <SheetHeader className="border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg">Proposta</SheetTitle>
                <Badge variant="secondary" className="font-mono">{p.numero}</Badge>
                <StatusPropostaBadge status={p.status} />
              </div>
              <SheetDescription className="sr-only">Detalhes da proposta e ofertas vinculadas</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
              <dl className="grid grid-cols-2 gap-4">
                {([
                  ['Edital', <span className="font-mono">{p.edital ?? '—'}</span>],
                  ['Valor previsto total', <span className="font-semibold">{brl(total)}</span>],
                  ['DR ofertante', `SENAI-${p.drOfertante}`],
                  ['DR contratante', `SENAI-${p.drContratante}`],
                  ['Vigência', p.vigenciaInicio ? `${p.vigenciaInicio} a ${p.vigenciaFim}` : '—'],
                  ['CNPJ do contratante', p.cnpj ?? '—'],
                  ['Faturamento', p.faturamento === 'Escola' ? `Por escola: ${(p.escolas ?? []).join(', ') || '—'}` : 'Para a DR'],
                  ['Nº no CRM', p.crm ?? '—'],
                  ['Documento', p.link ? <a href={p.link} target="_blank" rel="noreferrer" className="underline underline-offset-2">Abrir link</a> : '—'],
                ] as [string, React.ReactNode][]).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
              {(p.status === 'Recusada' ? p.feedback : p.status === 'Cancelada' ? p.motivoCancelamento : '') && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                  <p className="mb-1 text-xs font-medium">{p.status === 'Cancelada' ? 'Motivo do cancelamento' : 'Motivo da recusa'}</p>
                  <p className="whitespace-pre-wrap">{p.status === 'Cancelada' ? p.motivoCancelamento : p.feedback}</p>
                </div>
              )}

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Cursos <span className="font-normal text-muted-foreground">({p.cursos.length})</span></h3>
                <ul className="divide-y rounded-lg border bg-card">
                  {p.cursos.map((c) => {
                    const n = ofertas.filter((t) => t.cursos.includes(c.nome)).length
                    return (
                      <li key={c.cursoId} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{c.nome}</span>
                          <span className="block text-xs text-muted-foreground">{c.modalidade} · {c.cargaHoraria} h · {brl(c.valorPrevisto)}{c.vagas ? ` · ${c.vagas} vagas` : ''}{c.inicioPrevisto ? ` · início ${dataBr(c.inicioPrevisto)}` : ''}</span>
                        </span>
                        <Badge variant={n ? 'default' : 'outline'} className="shrink-0">{n ? `${n} oferta(s)` : 'Sem oferta'}</Badge>
                      </li>
                    )
                  })}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Ofertas vinculadas <span className="font-normal text-muted-foreground">({ofertas.length})</span></h3>
                {ofertas.length ? (
                  <ul className="divide-y rounded-lg border bg-card">
                    {ofertas.map((t) => {
                      const ucs = t.modulos.flatMap((m) => m.unidades)
                      const ini = ucs.map((u) => u.inicio).filter(Boolean).sort()[0] ?? ''
                      const fim = ucs.map((u) => u.fim).filter(Boolean).sort().at(-1) ?? ''
                      return (
                        <li key={t.id} className="flex items-start gap-3 px-3 py-3 text-sm">
                          <GraduationCap className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1 space-y-1">
                            <Badge variant="secondary" className="font-mono">{t.codigo}</Badge>
                            <div className="font-medium">{t.cursos.join(', ')}</div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
                              <span>{dataBr(ini)} a {dataBr(fim)}</span>
                              <span>{ucs.length} UC(s)</span>
                              <span>{aoVivoTurma(t)} ao vivo</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="shrink-0" onClick={() => (onClose(), navigate(`/oferta/${t.id}`))}>Acessar</Button>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <EmptyState title="Nenhuma oferta criada a partir desta proposta" />
                )}
                <Link to="/oferta" className="inline-block text-xs underline underline-offset-2">Ir para Gestão da oferta</Link>
              </section>

              {!!p.documentos?.length && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Documentos</h3>
                  <ul className="divide-y rounded-lg border bg-card">
                    {p.documentos.map((d, i) => (
                      <li key={i} className="flex items-center gap-2 px-3 py-2.5 text-sm"><FileText className="size-4 text-muted-foreground" /> {d}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
