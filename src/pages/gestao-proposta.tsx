import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, FileText, X, GraduationCap, History, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { StatusPropostaBadge } from '@/components/wf/status-proposta'
import { DataTable, EmptyState, PageHeader, type Column } from '@/components/wf'
import { dataBr, useProdutos, type CursoProposta } from '@/lib/mock'
import { useAutor } from '@/lib/autor'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const colunas: Column<CursoProposta & { id: string }>[] = [
  { header: 'Código', value: (c) => c.codigo, search: true, className: 'font-mono text-xs' },
  { header: 'Curso', value: (c) => c.nome, search: true, className: 'font-medium' },
  { header: 'Modalidade', value: (c) => c.modalidade, filter: true },
  { header: 'Área tecnológica', value: (c) => c.area, filter: true },
  { header: 'CH', value: (c) => `${c.cargaHoraria} h`, className: 'text-right tabular-nums' },
  { header: 'Vagas', value: (c) => c.vagas ?? '—', className: 'text-right tabular-nums' },
  { header: 'Início previsto', value: (c) => (c.inicioPrevisto ? dataBr(c.inicioPrevisto) : '—'), className: 'tabular-nums' },
  { header: 'Valor previsto', value: (c) => brl(c.valorPrevisto), className: 'text-right tabular-nums' },
]

// Navegação lateral da proposta; seções ainda sem conteúdo mostram EmptyState.
const secoes = [
  { id: 'resumo', label: 'Resumo', icon: Info },
  { id: 'cursos', label: 'Cursos', icon: GraduationCap },
  { id: 'documentos', label: 'Documentos', icon: FileText },
  { id: 'historico', label: 'Histórico', icon: History },
] as const
type Secao = (typeof secoes)[number]['id']

// Gestão da proposta (Supervisor): aberta por "Gestão da oferta" em Gestão de Contrato.
export default function GestaoProposta() {
  const { id } = useParams()
  const db = useProdutos()
  const autor = useAutor()
  const p = db.get(id)
  const [decisao, setDecisao] = useState<null | 'Aceita' | 'Recusada'>(null)
  const [feedback, setFeedback] = useState('')
  const [secao, setSecao] = useState<Secao>('resumo')
  // Âncora ativa acompanha a rolagem
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setSecao(e.target.id.replace('sec-', '') as Secao)),
      { rootMargin: '0px 0px -70% 0px' },
    )
    secoes.forEach((sc) => { const el = document.getElementById(`sec-${sc.id}`); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [p])
  const crumbs = [{ label: 'Gestão de propostas', to: '/produtos' }, { label: p?.numero ?? 'Proposta' }]
  if (!p) return (
    <>
      <PageHeader title="Gestão da proposta" breadcrumb={crumbs} />
      <EmptyState title="Proposta não encontrada" />
    </>
  )
  const total = p.cursos.reduce((t, c) => t + c.valorPrevisto, 0)
  const info: [string, React.ReactNode][] = [
    ['Código da proposta', <span className="font-mono">{p.numero}</span>],
    ['Edital', <span className="font-mono">{p.edital ?? '—'}</span>],
    ['DR ofertante', `SENAI-${p.drOfertante}`],
    ['DR contratante', `SENAI-${p.drContratante}`],
    ['Cursos', p.cursos.length],
    ['Valor previsto total', <span className="font-semibold">{brl(total)}</span>],
    ['CNPJ do contratante', <span className="tabular-nums">{p.cnpj ?? '—'}</span>],
    ['Faturamento', p.faturamento === 'Escola' ? `Por escola: ${(p.escolas ?? []).join(', ') || '—'}` : 'Para a DR'],
    ['Nº no CRM', p.crm ?? '—'],
    ['Documento', p.link ? <a href={p.link} target="_blank" rel="noreferrer" className="underline underline-offset-2">Abrir link</a> : '—'],
    ['Rodada', p.duplicadaDe ? `Nova rodada a partir da ${p.duplicadaDe}` : 'Primeira'],
  ]
  const decidida = p.status === 'Aceita' || p.status === 'Recusada' || p.status === 'Cancelada'
  return (
    <>
      <PageHeader title="Gestão da proposta" breadcrumb={crumbs} actions={
          <>
            <StatusPropostaBadge status={p.status} />
            {/* Acordo é fechado fora do sistema; aqui só se registra o resultado */}
            {!decidida && (
              <>
                <Button size="sm" variant="outline" onClick={() => { setFeedback(''); setDecisao('Recusada') }}><X /> Recusada</Button>
                <Button size="sm" onClick={() => setDecisao('Aceita')}><Check /> Aprovada</Button>
              </>
            )}
          </>
        } />
      <div className="flex flex-col gap-6 md:flex-row">
        <nav className="bg-background sticky top-0 z-10 flex gap-1 self-start overflow-x-auto md:w-44 md:shrink-0 md:flex-col">
          {secoes.map((sc) => (
            <button
              key={sc.id}
              onClick={() => { setSecao(sc.id); document.getElementById(`sec-${sc.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm whitespace-nowrap',
                secao === sc.id ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/50',
              )}
            >
              <sc.icon className="size-4" />
              {sc.label}
              {sc.id === 'cursos' && <span className="ml-auto text-xs tabular-nums">{p.cursos.length}</span>}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1 space-y-8">
          <section id="sec-resumo" className="scroll-mt-4 space-y-3">
            <h2 className="text-lg font-semibold">Resumo</h2>
            <dl className="grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-3">
              {info.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted-foreground text-xs">{k}</dt>
                  <dd className="text-sm">{v}</dd>
                </div>
              ))}
            </dl>
            {(p.status === 'Recusada' ? p.feedback : p.status === 'Cancelada' ? p.motivoCancelamento : '') && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <p className="mb-1 text-xs font-medium">{p.status === 'Cancelada' ? 'Motivo do cancelamento' : 'Motivo da recusa'}</p>
                <p className="whitespace-pre-wrap">{p.status === 'Cancelada' ? p.motivoCancelamento : p.feedback}</p>
              </div>
            )}
          </section>
          <section id="sec-cursos" className="scroll-mt-4 space-y-3">
            <h2 className="text-lg font-semibold">Cursos da proposta</h2>
            <DataTable rows={p.cursos.map((c) => ({ ...c, id: c.cursoId }))} columns={colunas} searchPlaceholder="Buscar curso…" />
          </section>
          <section id="sec-documentos" className="scroll-mt-4 space-y-3">
            <h2 className="text-lg font-semibold">Documentos</h2>
            {p.documentos?.length ? (
              <ul className="divide-y rounded-lg border">
                {p.documentos.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 px-4 py-2.5 text-sm">
                    <FileText className="text-muted-foreground size-4" /> {d}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="Nenhum documento anexado" />
            )}
          </section>
          <section id="sec-historico" className="scroll-mt-4 space-y-3">
            <h2 className="text-lg font-semibold">Histórico</h2>
            {p.historico?.length ? (
              <ol className="relative space-y-4 border-l pl-5">
                {p.historico.map((h, n) => (
                  <li key={n} className="relative">
                    <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-background bg-foreground/60" />
                    <p className="text-sm">{h.texto}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{new Date(h.quando).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}{h.autor && ` · ${h.autor}`}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState title="Sem histórico" />
            )}
          </section>
        </div>
      </div>
      <Dialog open={!!decisao} onOpenChange={(v) => !v && setDecisao(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{decisao === 'Aceita' ? 'Marcar proposta como aprovada?' : 'Marcar proposta como recusada?'}</DialogTitle>
          </DialogHeader>
          {decisao === 'Aceita' ? (
            <p className="text-sm text-muted-foreground">A proposta {p.numero} será registrada como aprovada pelo SENAI-{p.drContratante}.</p>
          ) : (
            <label className="grid gap-1 text-xs">
              <span className="text-muted-foreground">Feedback da recusa</span>
              <Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Por que a proposta foi recusada?" />
            </label>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDecisao(null)}>Cancelar</Button>
            <Button
              variant={decisao === 'Recusada' ? 'destructive' : 'default'}
              onClick={() => {
                const h = (texto: string) => [{ quando: new Date().toISOString(), texto, autor }, ...(p.historico ?? [])]
                db.update(p.id, decisao === 'Recusada' ? { status: 'Recusada', feedback: feedback.trim(), historico: h(`Proposta recusada${feedback.trim() ? `: ${feedback.trim()}` : ''}`) } : { status: 'Aceita', historico: h(`Proposta aceita pelo SENAI-${p.drContratante}`) })
                setDecisao(null)
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
