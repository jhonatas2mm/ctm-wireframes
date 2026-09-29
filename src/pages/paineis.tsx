import { Link, useNavigate } from 'react-router-dom'
import {
  BadgeCheck, Boxes, Building2, CalendarClock, CircleDollarSign, Clock, FileSignature, FileSpreadsheet, Handshake, Hourglass, Percent, Send, Video,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/wf'
import { BarList, Bloco, BlocoTitulo, Kpi, Linha, brl, brlCurto, isoDeBr } from '@/components/wf/dash'
import {
  HOJE, aprovadosAtuais, diasEntre, situacaoDe, statusTurma,
  instrumentoDe, nomeParte, useContratos, useCursosDr, useDrs, useEditais, useProdutos, useTurmas,
  type StatusProposta,
} from '@/lib/mock'

// Painéis por perfil (o Super admin não tem painel próprio). Cada um mostra o que o perfil gerencia.
const ver = (to: string, texto = 'Ver todos') => <Button variant="outline" size="sm" render={<Link to={to} />} nativeButton={false}>{texto}</Button>
const dataBr = (iso: string) => iso.split('-').reverse().join('/')

// ── DN: DRs credenciadas, portfólio das CTMs (aprovações) e editais ─────────
export function PainelDn() {
  const navigate = useNavigate()
  const portfolio = useCursosDr().all
  const editais = useEditais().all
  const drs = useDrs().all
  const pendentes = portfolio.filter((c) => situacaoDe(c) === 'Aguardando aprovação')
  const noPortfolio = aprovadosAtuais(portfolio)
  const porCtm = Object.entries(noPortfolio.reduce<Record<string, number>>((r, c) => ({ ...r, [c.ctm ?? '—']: (r[c.ctm ?? '—'] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1])
  const editaisVig = editais.filter((e) => isoDeBr(e.vigenciaInicio) <= HOJE && HOJE <= isoDeBr(e.vigenciaFim))
  const ativas = drs.filter((d) => d.status === 'Ativo')
  const comEdital = new Set(editais.flatMap((e) => e.drs))
  const semEdital = ativas.filter((d) => !comEdital.has(d.uf))

  return (
    <div className="space-y-5">
      <PageHeader title="Painel" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Building2} tom="blue" rotulo="DRs credenciadas ativas" valor={ativas.length} extra={`${drs.length - ativas.length} inativas`} />
        <Kpi icon={Hourglass} tom="amber" rotulo="Solicitações de portfólio" valor={pendentes.length} extra="aguardando aprovação" />
        <Kpi icon={FileSignature} tom="green" rotulo="Produtos no portfólio" valor={noPortfolio.length} extra={`${porCtm.length} CTMs`} />
        <Kpi icon={FileSpreadsheet} tom="orange" rotulo="Editais vigentes" valor={editaisVig.length} extra={`${editaisVig.reduce((n, e) => n + e.cursos.length, 0)} cursos`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
        <Bloco>
          <BlocoTitulo titulo="Solicitações de portfólio" sub="Novos produtos e novas versões das CTMs" acao={ver('/portfolio/aprovacoes', 'Aprovar')} />
          <div className="divide-y">
            {pendentes.map((c) => (
              <Linha key={c.id} inicial={c.ctm ?? '—'} tom="amber" titulo={`${c.nome} · v${c.versao ?? 1}`} sub={`SENAI-${c.ctm} · ${(c.versao ?? 1) > 1 ? 'nova versão' : 'novo produto'}`} direita={<Badge>Aguardando</Badge>} onClick={() => navigate('/portfolio/aprovacoes')} />
            ))}
            {!pendentes.length && <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma solicitação pendente.</p>}
          </div>
        </Bloco>
        <Bloco>
          <BlocoTitulo titulo="Portfólio por CTM" sub="Produtos aprovados" acao={ver('/portfolio')} />
          <BarList itens={porCtm.map(([uf, n]) => ({ rotulo: `SENAI-${uf}`, valor: n, tom: 'orange' }))} />
        </Bloco>
      </div>

      <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
        <Bloco>
          <BlocoTitulo titulo="Editais" sub="Cursos, DRs credenciados e período" acao={ver('/editais')} />
          <div className="divide-y">
            {editais.map((e) => {
              const ini = isoDeBr(e.vigenciaInicio), fim = isoDeBr(e.vigenciaFim)
              const pct = Math.max(0, Math.min(100, Math.round((diasEntre(ini, HOJE) / Math.max(1, diasEntre(ini, fim))) * 100)))
              return (
                <div key={e.id} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3 sm:grid-cols-[1.4fr_1fr_8rem]">
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-semibold">{e.numero}</div>
                    <div className="truncate text-xs text-muted-foreground">{e.cursos.length} cursos · {e.drs.length} DRs · CTM {e.ctm.join(', ')}</div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">{e.vigenciaInicio} a {e.vigenciaFim}</span><span className="font-semibold tabular-nums">{pct}%</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#E84910]" style={{ width: `${pct}%` }} /></div>
                  </div>
                  <div className="text-right text-sm font-bold tabular-nums">{brl(e.valor)}</div>
                </div>
              )
            })}
          </div>
        </Bloco>
        <Bloco>
          <BlocoTitulo titulo="Cobertura das DRs" sub="DRs ativas credenciadas em algum edital" acao={ver('/drs')} />
          <div className="mb-4 flex items-end gap-2">
            <span className="text-4xl font-bold tabular-nums">{ativas.length - semEdital.length}</span>
            <span className="pb-1 text-sm text-muted-foreground">de {ativas.length} DRs ativas</span>
          </div>
          <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-[#00A369]" style={{ width: `${((ativas.length - semEdital.length) / Math.max(1, ativas.length)) * 100}%` }} />
          </div>
          <div className="mb-2 text-xs font-semibold text-muted-foreground">Sem edital</div>
          <div className="flex flex-wrap gap-1.5">
            {semEdital.map((d) => <Badge key={d.id} variant="outline">SENAI-{d.uf}</Badge>)}
            {!semEdital.length && <span className="text-sm text-muted-foreground">Todas cobertas.</span>}
          </div>
        </Bloco>
      </div>
    </div>
  )
}

// ── CTM: Supervisor — operação: propostas, ofertas/turmas, aulas ao vivo, TAAs com DRs ──
export function PainelSupervisor() {
  const navigate = useNavigate()
  const propostas = useProdutos().all
  const turmas = useTurmas().all
  // Quem contratou esta CTM (TAA com SENAI, contrato com SESI); a CTM só consulta.
  const taas = useContratos().all.filter((c) => c.dr === 'MG')
  const conta = (s: StatusProposta) => propostas.filter((p) => (p.status ?? 'Em elaboração') === s).length
  const ativas = turmas.filter((t) => !['Finalizada', 'Cancelada'].includes(statusTurma(t)))
  const aulas = turmas
    .flatMap((t) => t.modulos.flatMap((m) => m.unidades.flatMap((u) => u.aoVivo.map((a) => ({ t, u, a })))))
    .filter((x) => x.a.data >= HOJE)
    .sort((x, y) => (x.a.data + x.a.inicio).localeCompare(y.a.data + y.a.inicio))
  const prox7 = aulas.filter((x) => diasEntre(HOJE, x.a.data) <= 7).length
  const progresso = (t: (typeof turmas)[number]) => {
    const us = t.modulos.flatMap((m) => m.unidades)
    return us.length ? Math.round((us.filter((u) => u.fim < HOJE).length / us.length) * 100) : 0
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Painel" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Send} tom="amber" rotulo="Propostas em negociação" valor={conta('Em negociação') + conta('Em análise') + conta('Aceita pelo contratante')} extra="aguardando resposta" />
        <Kpi icon={BadgeCheck} tom="green" rotulo="Propostas aceitas" valor={conta('Aceita')} extra={brlCurto(propostas.filter((p) => p.status === 'Aceita').reduce((n, p) => n + p.cursos.reduce((s, c) => s + c.valorPrevisto, 0), 0))} />
        <Kpi icon={Video} tom="blue" rotulo="Ofertas ativas" valor={ativas.length} extra={`${turmas.filter((t) => statusTurma(t) === 'Buscar tutor').length} buscando tutor · ${turmas.length} no total`} />
        <Kpi icon={CalendarClock} tom="orange" rotulo="Aulas ao vivo (7 dias)" valor={prox7} extra={`${aulas.length} agendadas`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[2fr_3fr]">
        <Bloco>
          <BlocoTitulo titulo="Funil de propostas" acao={ver('/produtos')} />
          <BarList
            itens={[
              { rotulo: 'Em negociação', valor: conta('Em negociação') + conta('Em elaboração') + conta('Em análise'), tom: 'amber' },
              { rotulo: 'Aceita', valor: conta('Aceita'), tom: 'green' },
              { rotulo: 'Recusada', valor: conta('Recusada'), tom: 'red' },
              { rotulo: 'Cancelada', valor: conta('Cancelada'), tom: 'gray' },
            ]}
          />
        </Bloco>
        <Bloco>
          <BlocoTitulo titulo="Próximas aulas ao vivo" acao={ver('/oferta', 'Ver ofertas')} />
          <div className="divide-y">
            {aulas.slice(0, 5).map(({ t, u, a }, i) => (
              <Linha key={i} inicial={dataBr(a.data).slice(0, 2)} tom="orange" titulo={u.nome} sub={`${t.codigo} · ${t.cursos.join(', ')}`} direita={<><div className="text-sm font-semibold tabular-nums">{dataBr(a.data).slice(0, 5)}</div><div className="text-xs text-muted-foreground tabular-nums">{a.inicio}–{a.fim}</div></>} onClick={() => navigate(`/oferta/${t.id}`)} />
            ))}
            {!aulas.length && <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma aula ao vivo agendada.</p>}
          </div>
        </Bloco>
      </div>

      <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
        <Bloco>
          <BlocoTitulo titulo="Ofertas" sub="Execução pelas unidades concluídas" acao={ver('/oferta')} />
          <div className="divide-y">
            {turmas.map((t) => {
              const pct = progresso(t)
              return (
                <button key={t.id} type="button" onClick={() => navigate(`/oferta/${t.id}`)} className="grid w-full grid-cols-[auto_1fr_8rem] items-center gap-3 py-3 text-left">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#EEF7FF] text-xs font-bold text-[#164194]">{t.drContratante}</div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{t.cursos.join(', ')}</div>
                    <div className="truncate text-xs text-muted-foreground"><span className="font-mono">{t.codigo}</span> · {t.propostaNumero} · SENAI-{t.drContratante}</div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">{statusTurma(t)}</span><span className="font-semibold tabular-nums">{pct}%</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#E84910]" style={{ width: `${pct}%` }} /></div>
                  </div>
                </button>
              )
            })}
          </div>
        </Bloco>
        <Bloco>
          <BlocoTitulo titulo="Contratantes" sub="TAA (SENAI) ou contrato (SESI) com esta CTM" />
          <div className="divide-y">
            {taas.map((t) => (
              <Linha key={t.id} inicial={t.contratante.replace('SESI-', '')} titulo={`${instrumentoDe(t.contratante)} ${t.numero} · ${nomeParte(t.contratante)}`} sub={t.vigenciaInicio === '—' ? 'Sem vigência definida' : `${t.vigenciaInicio} a ${t.vigenciaFim}`} direita={<Badge>{t.status}</Badge>} />
            ))}
          </div>
        </Bloco>
      </div>
    </div>
  )
}

// ── CTM: Gestor de contrato — pipeline: valores por status, DRs contratantes, taxa de aceite, portfólio ──
export function PainelComercial() {
  const navigate = useNavigate()
  const propostas = useProdutos().all
  const portfolio = useCursosDr().all
  const valor = (p: (typeof propostas)[number]) => p.cursos.reduce((s, c) => s + c.valorPrevisto, 0)
  const soma = (f: (p: (typeof propostas)[number]) => boolean) => propostas.filter(f).reduce((n, p) => n + valor(p), 0)
  const st = (p: (typeof propostas)[number]) => p.status ?? 'Em elaboração'
  const negociacao = soma((p) => st(p) === 'Em análise' || st(p) === 'Aceita pelo contratante')
  const fechado = soma((p) => st(p) === 'Aceita')
  const aceitas = propostas.filter((p) => st(p) === 'Aceita').length, recusadas = propostas.filter((p) => st(p) === 'Recusada').length
  const taxa = aceitas + recusadas ? Math.round((aceitas / (aceitas + recusadas)) * 100) : 0
  const porDr = Object.entries(propostas.reduce<Record<string, number>>((m, p) => ((m[p.drContratante] = (m[p.drContratante] ?? 0) + valor(p)), m), {})).sort((a, b) => b[1] - a[1])
  const aguardando = propostas.filter((p) => st(p) === 'Em análise' || st(p) === 'Aceita pelo contratante')
  const cursosMais = Object.entries(propostas.flatMap((p) => p.cursos).reduce<Record<string, number>>((m, c) => ((m[c.nome] = (m[c.nome] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="space-y-5">
      <PageHeader title="Painel" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Handshake} tom="amber" rotulo="Em negociação" valor={brlCurto(negociacao)} extra={`${aguardando.length} propostas`} />
        <Kpi icon={CircleDollarSign} tom="green" rotulo="Valor fechado" valor={brlCurto(fechado)} extra={`${aceitas} propostas aceitas`} />
        <Kpi icon={Percent} tom="blue" rotulo="Taxa de aceite" valor={`${taxa}%`} extra={`${recusadas} recusadas`} />
        <Kpi icon={Boxes} tom="orange" rotulo="Produtos no portfólio" valor={portfolio.length} extra="cursos da DR" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Bloco>
          <BlocoTitulo titulo="Pipeline por status" sub="Valor previsto das propostas" acao={ver('/produtos')} />
          <BarList
            formato={brlCurto}
            itens={([['Em negociação', 'amber'], ['Aceita', 'green'], ['Recusada', 'red'], ['Cancelada', 'gray']] as const).map(([s, tom]) => ({ rotulo: s, valor: soma((p) => st(p) === s), tom }))}
          />
        </Bloco>
        <Bloco>
          <BlocoTitulo titulo="Por DR contratante" sub="Valor previsto somado" />
          <BarList formato={brlCurto} itens={porDr.map(([uf, v]) => ({ rotulo: `SENAI-${uf}`, valor: v, tom: 'orange' }))} />
        </Bloco>
      </div>

      <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
        <Bloco>
          <BlocoTitulo titulo="Aguardando resposta" sub="Propostas enviadas às DRs contratantes" acao={ver('/produtos')} />
          <div className="divide-y">
            {aguardando.map((p) => (
              <Linha
                key={p.id}
                inicial={p.drContratante}
                tom="amber"
                titulo={<span className="font-mono">{p.numero}</span>}
                sub={`SENAI-${p.drContratante} · ${p.cursos.length} curso(s) · há ${Math.max(0, diasEntre(p.cadastradoEm.slice(0, 10), HOJE))} dias`}
                direita={<><div className="text-sm font-bold tabular-nums">{brl(valor(p))}</div><Badge>{st(p)}</Badge></>}
                onClick={() => navigate(`/produtos/${p.id}`)}
              />
            ))}
            {!aguardando.length && <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma proposta aguardando.</p>}
          </div>
        </Bloco>
        <Bloco>
          <BlocoTitulo titulo="Cursos mais propostos" acao={ver('/gestao-produtos', 'Ver portfólio')} />
          <div className="divide-y">
            {cursosMais.map(([nome, n], i) => (
              <Linha key={nome} inicial={i + 1} tom="gray" titulo={nome} direita={<span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="size-3.5" />{n}×</span>} />
            ))}
          </div>
        </Bloco>
      </div>
    </div>
  )
}
