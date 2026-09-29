import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FileText, GitBranchPlus, GraduationCap, History, Info, Layers, Plus, Users, GitCompare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusPropostaBadge } from '@/components/wf/status-proposta'
import { EmptyState, PageHeader, Req } from '@/components/wf'
import { alunosProposta, aprovadosAtuais, instrumentoDe, nomeParte, totalProposta, useContratos, useCursosDr, useEquipe, useProdutos, type CursoProposta } from '@/lib/mock'
import { useAutor } from '@/lib/autor'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const dataBr = (iso?: string) => (iso ? iso.split('-').reverse().join('/') : '—')

const secoes = [
  { id: 'resumo', label: 'Resumo', icon: Info },
  { id: 'cursos', label: 'Cursos', icon: GraduationCap },
  { id: 'equipe', label: 'Equipe técnica', icon: Users },
  { id: 'versoes', label: 'Versões', icon: GitCompare },
  { id: 'documentos', label: 'Documentos', icon: FileText },
  { id: 'historico', label: 'Histórico', icon: History },
] as const
type Secao = (typeof secoes)[number]['id']

function CursosTabela({ cursos }: { cursos: CursoProposta[] }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs">
          <tr><th className="px-3 py-2 font-bold">Curso</th><th className="px-3 py-2 font-bold">Início previsto</th><th className="px-3 py-2 text-right font-bold">Alunos</th><th className="px-3 py-2 text-right font-bold">Valor/aluno (edital)</th><th className="px-3 py-2 text-right font-bold">Valor</th></tr>
        </thead>
        <tbody className="divide-y">
          {cursos.map((c) => (
            <tr key={c.nome}>
              <td className="px-3 py-2"><span className="font-medium">{c.nome}</span><span className="block text-xs text-muted-foreground">{c.modalidade} · {c.cargaHoraria} h</span></td>
              <td className="px-3 py-2 tabular-nums">{dataBr(c.inicioPrevisto)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{c.vagas ?? 0}</td>
              <td className="px-3 py-2 text-right tabular-nums">{brl(c.valorAluno)}</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums">{brl(c.valorPrevisto)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Gestão da proposta (CTM): resumo, cursos com a matriz do portfólio, equipe técnica (vinculada depois da aprovação:
// supervisor e analista, que definem o cronograma das turmas), versões (vai e vem) e histórico.
export default function GestaoProposta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const db = useProdutos()
  const autor = useAutor()
  const p = db.get(id)
  const taa = useContratos().all.find((t) => t.id === p?.taaId)
  const portfolio = aprovadosAtuais(useCursosDr().all)
  const equipe = useEquipe().all.filter((x) => x.status === 'Ativo')
  const [secao, setSecao] = useState<Secao>('resumo')
  const [supervisor, setSupervisor] = useState<string | null>(null)
  const [analista, setAnalista] = useState<string | null>(null)
  const [versaoAberta, setVersaoAberta] = useState<number | null>(null)
  useEffect(() => { setSupervisor(p?.equipeTecnica?.supervisor ?? equipe.find((x) => x.funcao === 'Supervisor')?.nome ?? null); setAnalista(p?.equipeTecnica?.analista ?? equipe.find((x) => x.funcao === 'Analista')?.nome ?? null) }, [p?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  // Âncora ativa acompanha a rolagem
  useEffect(() => {
    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setSecao(e.target.id.replace('sec-', '') as Secao)), { rootMargin: '0px 0px -70% 0px' })
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
  const aprovada = p.status === 'Aprovado'
  const fechada = aprovada || p.status === 'Cancelado'
  const info: [string, React.ReactNode][] = [
    ['Código da proposta', <span className="font-mono">{p.numero}</span>],
    ['Versão', `v${p.versao ?? 1}`],
    ['Contratante', nomeParte(p.drContratante)],
    [taa ? instrumentoDe(taa.contratante) : 'TAA', taa ? <span className="font-mono">{taa.numero}</span> : '—'],
    ['Edital', <span className="font-mono">{p.edital ?? '—'}</span>],
    ['Responsável', p.responsavel ? `${p.responsavel.nome} (${p.responsavel.cargo})` : '—'],
    ['Início e fim', p.vigenciaInicio ? `${p.vigenciaInicio} a ${p.vigenciaFim}` : '—'],
    ['Alunos', alunosProposta(p)],
    ['Valor (parametrizado pelo edital)', <span className="font-semibold">{brl(totalProposta(p))}</span>],
    ['CNPJ do contratante', p.cnpj ?? '—'],
    ['Faturamento', p.faturamento === 'Escola' ? `Por escola: ${(p.escolas ?? []).join(', ') || '—'}` : 'Para a DR'],
    ['Nº no CRM', p.crm ?? '—'],
  ]
  const vincular = () => {
    if (!supervisor || !analista) return
    db.update(p.id, { equipeTecnica: { supervisor, analista }, historico: [{ quando: new Date().toISOString(), texto: `Equipe técnica vinculada: ${supervisor} (supervisor) e ${analista} (analista)`, autor }, ...(p.historico ?? [])] })
  }
  return (
    <>
      <PageHeader
        title={<span className="flex items-center gap-3">Gestão da proposta <StatusPropostaBadge status={p.status} /></span>}
        breadcrumb={crumbs}
        actions={
          <>
            {!fechada && <Button variant="outline" onClick={() => navigate(`/produtos/novo?versao=${p.id}`)}><GitBranchPlus /> Nova versão</Button>}
            {aprovada && p.equipeTecnica && <Button onClick={() => navigate(`/oferta/proposta/${p.id}/nova`)}><Plus /> Criar turmas</Button>}
          </>
        }
      />
      <div className="flex flex-col gap-6 md:flex-row">
        <nav className="bg-background sticky top-0 z-10 flex gap-1 self-start overflow-x-auto md:w-44 md:shrink-0 md:flex-col">
          {secoes.map((sc) => (
            <button key={sc.id} onClick={() => { setSecao(sc.id); document.getElementById(`sec-${sc.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm whitespace-nowrap', secao === sc.id ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/50')}>
              <sc.icon className="size-4" /> {sc.label}
              {sc.id === 'versoes' && <span className="ml-auto text-xs tabular-nums">{(p.versoes?.length ?? 0) + 1}</span>}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1 space-y-8">
          <section id="sec-resumo" className="scroll-mt-4 space-y-3">
            <h2 className="text-lg font-semibold">Resumo</h2>
            <dl className="grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-3 bg-card">
              {info.map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="text-sm">{v}</dd></div>)}
            </dl>
            {p.status === 'Cancelado' && p.motivoCancelamento && (
              <div className="rounded-lg border bg-muted/50 p-4 text-sm"><p className="mb-1 text-xs font-medium">Motivo do cancelamento</p><p className="whitespace-pre-wrap">{p.motivoCancelamento}</p></div>
            )}
          </section>

          <section id="sec-cursos" className="scroll-mt-4 space-y-3">
            <h2 className="text-lg font-semibold">Cursos e matriz curricular</h2>
            <CursosTabela cursos={p.cursos} />
            {p.cursos.map((c) => {
              const m = portfolio.find((x) => x.nome === c.nome && (x.ctm ?? 'MG') === p.drOfertante)
              return (
                <div key={c.nome} className="rounded-lg border p-3 bg-card">
                  <p className="mb-1 flex items-center gap-2 text-sm font-medium"><Layers className="size-4 text-muted-foreground" /> {c.nome} <span className="text-xs font-normal text-muted-foreground">{m ? `matriz do portfólio v${m.versao ?? 1}` : 'sem versão aprovada no portfólio'}</span></p>
                  {m && <ol className="grid gap-0.5 pl-6 text-sm text-muted-foreground">{m.modulos.map((mod, i) => <li key={i}>{i + 1}. {mod.nome} — {mod.unidades.map((u) => u.nome).join(', ')}</li>)}</ol>}
                </div>
              )
            })}
          </section>

          {/* Depois da aprovação: vincular a equipe técnica, que define o cronograma das turmas (com agrupamento de UCs) */}
          <section id="sec-equipe" className="scroll-mt-4 space-y-3">
            <h2 className="text-lg font-semibold">Equipe técnica</h2>
            {!aprovada ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">A equipe técnica é vinculada depois que a proposta é aprovada.</p>
            ) : (
              <div className="grid gap-3 rounded-lg border p-4 bg-card">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>Supervisor <Req /></Label>
                    <Select value={supervisor} onValueChange={(v) => setSupervisor(v as string)}>
                      <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => v ?? 'Selecione'}</SelectValue></SelectTrigger>
                      <SelectContent>{equipe.filter((x) => x.funcao === 'Supervisor').map((x) => <SelectItem key={x.id} value={x.nome}>{x.nome}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Analista <Req /></Label>
                    <Select value={analista} onValueChange={(v) => setAnalista(v as string)}>
                      <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => v ?? 'Selecione'}</SelectValue></SelectTrigger>
                      <SelectContent>{equipe.filter((x) => x.funcao === 'Analista').map((x) => <SelectItem key={x.id} value={x.nome}>{x.nome}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">{p.equipeTecnica ? `Vinculada: ${p.equipeTecnica.supervisor} e ${p.equipeTecnica.analista}. Eles definem o cronograma das turmas e avaliam o agrupamento de UCs.` : 'Vincule para seguir ao processo de turmas.'}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={vincular}>{p.equipeTecnica ? 'Atualizar equipe' : 'Vincular equipe técnica'}</Button>
                    {p.equipeTecnica && <Button onClick={() => navigate(`/oferta/proposta/${p.id}/nova`)}><Plus /> Criar turmas</Button>}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Versões: a proposta vai e vem; a atual e as anteriores ficam registradas */}
          <section id="sec-versoes" className="scroll-mt-4 space-y-3">
            <h2 className="text-lg font-semibold">Versões</h2>
            <ol className="divide-y rounded-lg border bg-card">
              <li className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <Badge className="tabular-nums">v{p.versao ?? 1}</Badge> <span className="font-medium">Atual</span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">{alunosProposta(p)} alunos · {brl(totalProposta(p))}</span>
              </li>
              {[...(p.versoes ?? [])].reverse().map((v) => (
                <li key={v.versao} className="text-sm">
                  <button type="button" onClick={() => setVersaoAberta(versaoAberta === v.versao ? null : v.versao)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50">
                    <Badge variant="outline" className="tabular-nums">v{v.versao}</Badge>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">{v.motivo ?? '—'}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{v.cursos.reduce((t, c) => t + (c.vagas ?? 0), 0)} alunos · {brl(v.cursos.reduce((t, c) => t + c.valorPrevisto, 0))} · {new Date(v.salvaEm).toLocaleDateString('pt-BR')}</span>
                  </button>
                  {versaoAberta === v.versao && <div className="px-3 pb-3"><CursosTabela cursos={v.cursos} /></div>}
                </li>
              ))}
            </ol>
          </section>

          <section id="sec-documentos" className="scroll-mt-4 space-y-3">
            <h2 className="text-lg font-semibold">Documentos</h2>
            {p.documentos?.length || p.link ? (
              <ul className="divide-y rounded-lg border bg-card">
                {p.link && <li className="flex items-center gap-2 px-4 py-2.5 text-sm"><FileText className="text-muted-foreground size-4" /> <a href={p.link} target="_blank" rel="noreferrer" className="underline underline-offset-2">Documento da proposta (link)</a></li>}
                {(p.documentos ?? []).map((d, i) => <li key={i} className="flex items-center gap-2 px-4 py-2.5 text-sm"><FileText className="text-muted-foreground size-4" /> {d}</li>)}
              </ul>
            ) : <EmptyState title="Nenhum documento" />}
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
            ) : <EmptyState title="Sem histórico" />}
          </section>
        </div>
      </div>
    </>
  )
}
