import { useState } from 'react'
import { AlertTriangle, CalendarPlus, Check, CheckCircle2, ClipboardCheck, Copy, Mail, MonitorPlay, Plus, RefreshCw, RotateCcw, Send, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState, Req } from '@/components/wf'
import { HOJE, dataBr, diasEntre, estruturaPronta, etapaDe, etapasUc, statusTurma, useEquipe, type AtividadePresencial, type AulaAoVivo, type EtapaUc, type Turma, type UcTurma } from '@/lib/mock'
import { cn } from '@/lib/utils'

type Registrar = (patch: Partial<Turma>, texto: string) => void
const d = (iso?: string) => (iso ? dataBr(iso) : '—')
// Atualiza uma UC (módulo i, UC k) devolvendo os módulos novos.
const comUc = (t: Turma, i: number, k: number, patch: Partial<UcTurma>) =>
  t.modulos.map((m, j) => (j !== i ? m : { ...m, unidades: m.unidades.map((u, l) => (l === k ? { ...u, ...patch } : u)) }))

const corEtapa: Record<EtapaUc, string> = {
  'Aguardando sala': 'bg-muted text-muted-foreground',
  'Em planejamento': 'bg-sky-100 text-sky-800',
  'Em avaliação do tutor': 'bg-amber-100 text-amber-800',
  'Parametrizar avaliações': 'bg-violet-100 text-violet-800',
  Pronta: 'bg-emerald-100 text-emerald-800',
}
// Quem age em cada etapa
const vezDe: Record<EtapaUc, string> = {
  'Aguardando sala': 'Monitor',
  'Em planejamento': 'Pedagógico',
  'Em avaliação do tutor': 'Tutor',
  'Parametrizar avaliações': 'Monitor',
  Pronta: '—',
}

// UCs da turma: cada UC tem a sua equipe técnica (pedagógico, tutor e monitor) e segue o fluxo
// sala no Moodle (monitor) → planejamento (pedagógico: aulas ao vivo online + atividades presenciais) → avaliação (tutor)
// → e-mail ao monitor para parametrizar as avaliações → Pronta. Com todas prontas, e-mail à DR solicitante (SGN/SGE).
export function ExecucaoTurma({ t, registrar }: { t: Turma; registrar: Registrar }) {
  const equipe = useEquipe().all.filter((p) => p.status === 'Ativo')
  const [planejar, setPlanejar] = useState<{ i: number; k: number } | null>(null)
  const [avaliar, setAvaliar] = useState<{ i: number; k: number } | null>(null)
  const [devolucao, setDevolucao] = useState('')
  const [aulas, setAulas] = useState<AulaAoVivo[]>([])
  const [atividades, setAtividades] = useState<AtividadePresencial[]>([])
  const [emailDr, setEmailDr] = useState(false)
  const status = statusTurma(t)
  if (status === 'A iniciar' || status === 'Cancelada')
    return <EmptyState title={status === 'Cancelada' ? 'Turma cancelada' : 'As UCs começam quando a turma é confirmada'} description={status === 'Cancelada' ? undefined : 'Com o cronograma validado, “Confirmar turma” libera o fluxo das UCs (sala no Moodle → planejamento → avaliação do tutor).'} />
  const pessoas = (funcao: string) => equipe.filter((p) => p.funcao === funcao)
  const ucs = t.modulos.flatMap((m, i) => m.unidades.map((u, k) => ({ u, i, k })))
  const prontas = ucs.filter(({ u }) => etapaDe(u) === 'Pronta').length
  const pronta = estruturaPronta(t)
  const agora = () => new Date().toISOString()
  // Mudança numa UC; quando a última fica pronta, dispara o e-mail à DR solicitante (SGN/SGE).
  const mudar = (i: number, k: number, patch: Partial<UcTurma>, texto: string) => {
    const modulos = comUc(t, i, k, patch)
    const todas = modulos.every((m) => m.unidades.every((u) => etapaDe(u) === 'Pronta'))
    if (todas && !t.emailDrEm) registrar({ modulos, emailDrEm: agora() }, `${texto}. Estrutura pronta: e-mail à DR solicitante (SENAI-${t.drContratante}) para ajustar o SGN/SGE e integrar os alunos no Moodle`)
    else registrar({ modulos }, texto)
  }
  const uc = (x: { i: number; k: number } | null) => (x ? t.modulos[x.i]?.unidades[x.k] : undefined)
  const abrirPlanejar = (i: number, k: number) => {
    const u = t.modulos[i].unidades[k]
    setAulas(u.aoVivo.length ? u.aoVivo : [{ data: u.inicio, inicio: '19:00', fim: '21:00' }])
    setAtividades(u.atividades?.length ? u.atividades : [{ data: u.inicio, descricao: 'Atividade prática presencial' }])
    setPlanejar({ i, k })
  }
  const criarSalas = () => {
    let n = 90000 + Number(t.codigo.replace(/\D/g, '').slice(0, 5)) * 10
    registrar({ modulos: t.modulos.map((m) => ({ ...m, unidades: m.unidades.map((u) => (u.sala === 'Criada' || u.sala === 'Em criação' ? u : { ...u, sala: 'Em criação' as const, salaAva: u.salaAva ?? `AVA-${n++}` })) })) }, 'Monitor solicitou a criação das salas no Moodle (integração): Em criação')
  }
  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-[1.25rem] border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-sm font-semibold">{prontas} de {ucs.length} UCs prontas</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {etapasUc.map((e) => {
              const n = ucs.filter(({ u }) => etapaDe(u) === e).length
              return n ? <Badge key={e} variant="secondary" className={corEtapa[e]}>{e}: {n}</Badge> : null
            })}
          </div>
        </div>
        <Button variant="outline" disabled={!ucs.some(({ u }) => !u.sala || u.sala === 'Não criada')} motivo="Todas as salas já foram criadas ou estão em criação" onClick={criarSalas}><MonitorPlay /> Criar salas no Moodle (todas)</Button>
      </div>

      {/* E-mail à DR solicitante: quando todas as UCs estão prontas */}
      {pronta && (
        <div className="flex flex-wrap items-center gap-3 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="size-5 shrink-0" />
          <p className="min-w-0 flex-1">Estrutura pronta. {t.emailDrEm ? `E-mail enviado ao SENAI-${t.drContratante} em ${new Date(t.emailDrEm).toLocaleDateString('pt-BR')} para ajustar o SGN/SGE e integrar os alunos no Moodle.` : 'Falta avisar a DR.'}</p>
          <Button size="sm" variant="outline" onClick={() => setEmailDr(true)}><Mail /> Ver e-mail à DR</Button>
        </div>
      )}

      <div className="overflow-hidden rounded-[1.25rem] border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unidade curricular</TableHead>
              <TableHead className="w-44">Pedagógico</TableHead>
              <TableHead className="w-44">Tutor</TableHead>
              <TableHead className="w-44">Monitor</TableHead>
              <TableHead>Sala no Moodle</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ucs.map(({ u, i, k }) => {
              const etapa = etapaDe(u)
              const escolha = (campo: 'pedagogico' | 'tutor' | 'monitor', funcao: string) => (
                <Select value={u[campo] ?? null} onValueChange={(v) => registrar({ modulos: comUc(t, i, k, { [campo]: v as string }) }, `${u.nome}: ${funcao} ${v}`)}>
                  <SelectTrigger className="h-8 w-full"><SelectValue>{(v: string | null) => v ?? 'Vincular'}</SelectValue></SelectTrigger>
                  <SelectContent>{pessoas(funcao).map((p) => <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>)}</SelectContent>
                </Select>
              )
              return (
                <TableRow key={`${i}-${k}`}>
                  <TableCell>
                    <span className="font-medium">{i + 1}.{k + 1} {u.nome}</span>
                    <span className="block text-xs text-muted-foreground tabular-nums">{d(u.inicio)} a {d(u.fim)} · {u.aoVivo.length} ao vivo · {u.atividades?.length ?? 0} presenciais</span>
                    {etapa === 'Em planejamento' && u.devolucao && <span className="mt-0.5 flex items-center gap-1 text-xs text-orange-700"><RotateCcw className="size-3" /> Devolvido pelo tutor: {u.devolucao}</span>}
                  </TableCell>
                  <TableCell>{escolha('pedagogico', 'Pedagógico')}</TableCell>
                  <TableCell>{escolha('tutor', 'Tutor')}</TableCell>
                  <TableCell>{escolha('monitor', 'Monitor back')}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn(u.sala === 'Criada' ? 'bg-emerald-100 text-emerald-800' : u.sala === 'Em criação' ? 'bg-amber-100 text-amber-800' : 'bg-muted text-muted-foreground')}>{u.sala ?? 'Não criada'}</Badge>
                    {u.salaAva && u.sala === 'Criada' && <span className="ml-1.5 font-mono text-xs text-muted-foreground">{u.salaAva}</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={corEtapa[etapa]}>{etapa}</Badge>
                    {etapa !== 'Pronta' && <span className="mt-0.5 block text-xs text-muted-foreground">Vez: {vezDe[etapa]}{etapa === 'Parametrizar avaliações' && u.emailMonitorEm ? ' · e-mail enviado' : ''}</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    {etapa === 'Aguardando sala' && (!u.sala || u.sala === 'Não criada') && (
                      <Button size="sm" variant="outline" onClick={() => mudar(i, k, { sala: 'Em criação', salaAva: u.salaAva ?? `AVA-${90000 + i * 10 + k}` }, `${u.nome}: monitor solicitou a sala no Moodle (Em criação)`)}><MonitorPlay /> Criar sala</Button>
                    )}
                    {etapa === 'Aguardando sala' && u.sala === 'Em criação' && (
                      // Protótipo: simula o retorno da integração com o Moodle
                      <Button size="sm" variant="outline" onClick={() => mudar(i, k, { sala: 'Criada', etapa: 'Em planejamento' }, `${u.nome}: sala criada no Moodle (${u.salaAva}); UC em planejamento`)}><RefreshCw /> Consultar Moodle</Button>
                    )}
                    {etapa === 'Em planejamento' && <Button size="sm" variant="outline" onClick={() => abrirPlanejar(i, k)}><CalendarPlus /> Planejar</Button>}
                    {etapa === 'Em avaliação do tutor' && <Button size="sm" variant="outline" onClick={() => (setDevolucao(''), setAvaliar({ i, k }))}><ClipboardCheck /> Avaliar</Button>}
                    {etapa === 'Parametrizar avaliações' && <Button size="sm" variant="outline" onClick={() => mudar(i, k, { etapa: 'Pronta' }, `${u.nome}: avaliações parametrizadas no Moodle pelo monitor; UC pronta`)}><Check /> Avaliações parametrizadas</Button>}
                    {etapa === 'Pronta' && <CheckCircle2 className="ml-auto size-5 text-emerald-600" />}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Planejamento (pedagógico): dias das aulas ao vivo online e atividades presenciais */}
      <Dialog open={!!planejar} onOpenChange={(v) => !v && setPlanejar(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Planejar UC · {uc(planejar)?.nome}</DialogTitle>
            <DialogDescription>Período {d(uc(planejar)?.inicio)} a {d(uc(planejar)?.fim)}. Depois de enviado, o tutor avalia o planejamento.</DialogDescription>
          </DialogHeader>
          {uc(planejar)?.devolucao && <p className="rounded-md border border-orange-200 bg-orange-50 p-2 text-xs text-orange-900">Devolvido pelo tutor: {uc(planejar)?.devolucao}</p>}
          <section className="grid gap-2">
            <div className="flex items-center justify-between"><Label>Aulas ao vivo (online) <Req /></Label><Button size="sm" variant="outline" onClick={() => setAulas([...aulas, { ...(aulas.at(-1) ?? { data: uc(planejar)?.inicio ?? HOJE, inicio: '19:00', fim: '21:00' }) }])}><Plus /> Adicionar</Button></div>
            {aulas.map((a, n) => (
              <div key={n} className="grid grid-cols-[1fr_7rem_7rem_auto] gap-2">
                <Input type="date" min={uc(planejar)?.inicio} max={uc(planejar)?.fim} value={a.data} onChange={(e) => setAulas(aulas.map((x, j) => (j === n ? { ...x, data: e.target.value } : x)))} />
                <Input type="time" value={a.inicio} onChange={(e) => setAulas(aulas.map((x, j) => (j === n ? { ...x, inicio: e.target.value } : x)))} />
                <Input type="time" value={a.fim} onChange={(e) => setAulas(aulas.map((x, j) => (j === n ? { ...x, fim: e.target.value } : x)))} />
                <Button size="icon-sm" variant="ghost" aria-label="Remover aula" onClick={() => setAulas(aulas.filter((_, j) => j !== n))}><Trash2 /></Button>
              </div>
            ))}
          </section>
          <section className="grid gap-2">
            <div className="flex items-center justify-between"><Label>Atividades presenciais <Req /></Label><Button size="sm" variant="outline" onClick={() => setAtividades([...atividades, { data: atividades.at(-1)?.data ?? uc(planejar)?.inicio ?? HOJE, descricao: '' }])}><Plus /> Adicionar</Button></div>
            {atividades.map((a, n) => (
              <div key={n} className="grid grid-cols-[10rem_1fr_auto] gap-2">
                <Input type="date" min={uc(planejar)?.inicio} max={uc(planejar)?.fim} value={a.data} onChange={(e) => setAtividades(atividades.map((x, j) => (j === n ? { ...x, data: e.target.value } : x)))} />
                <Input placeholder="Descrição da atividade" value={a.descricao} onChange={(e) => setAtividades(atividades.map((x, j) => (j === n ? { ...x, descricao: e.target.value } : x)))} />
                <Button size="icon-sm" variant="ghost" aria-label="Remover atividade" onClick={() => setAtividades(atividades.filter((_, j) => j !== n))}><Trash2 /></Button>
              </div>
            ))}
          </section>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPlanejar(null)}>Cancelar</Button>
            <Button variant="outline" onClick={() => (planejar && registrar({ modulos: comUc(t, planejar.i, planejar.k, { aoVivo: aulas, atividades }) }, `${uc(planejar)?.nome}: planejamento salvo (rascunho)`), setPlanejar(null))}>Salvar rascunho</Button>
            <Button onClick={() => (planejar && mudar(planejar.i, planejar.k, { aoVivo: aulas, atividades, etapa: 'Em avaliação do tutor', devolucao: undefined }, `${uc(planejar)?.nome}: planejamento enviado ao tutor (${aulas.length} ao vivo, ${atividades.length} presenciais)`), setPlanejar(null))}><Send /> Enviar ao tutor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Avaliação (tutor): aprova (e-mail ao monitor para parametrizar as avaliações) ou devolve ao pedagógico */}
      <Dialog open={!!avaliar} onOpenChange={(v) => !v && setAvaliar(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Avaliar planejamento · {uc(avaliar)?.nome}</DialogTitle>
            <DialogDescription>Planejado por {uc(avaliar)?.pedagogico ?? 'pedagógico'}. Aprovado, sai o e-mail para {uc(avaliar)?.monitor ?? 'o monitor'} parametrizar as avaliações no Moodle.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 text-sm">
            <div><p className="mb-1 text-xs font-medium text-muted-foreground">Aulas ao vivo (online)</p><ul className="grid gap-0.5">{(uc(avaliar)?.aoVivo ?? []).map((a, n) => <li key={n} className="tabular-nums">{d(a.data)} · {a.inicio}–{a.fim}</li>)}</ul></div>
            <div><p className="mb-1 text-xs font-medium text-muted-foreground">Atividades presenciais</p><ul className="grid gap-0.5">{(uc(avaliar)?.atividades ?? []).map((a, n) => <li key={n}><span className="tabular-nums">{d(a.data)}</span> · {a.descricao}</li>)}</ul></div>
            <label className="grid gap-1 text-xs"><span className="text-muted-foreground">Motivo (se devolver)</span><Textarea rows={3} value={devolucao} onChange={(e) => setDevolucao(e.target.value)} placeholder="O que o pedagógico precisa ajustar?" /></label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAvaliar(null)}>Cancelar</Button>
            <Button variant="outline" onClick={() => (avaliar && mudar(avaliar.i, avaliar.k, { etapa: 'Em planejamento', devolucao: devolucao.trim() || 'Ajustar o planejamento.' }, `${uc(avaliar)?.nome}: tutor devolveu o planejamento${devolucao.trim() ? `: ${devolucao.trim()}` : ''}`), setAvaliar(null))}><RotateCcw /> Devolver ao pedagógico</Button>
            <Button onClick={() => (avaliar && mudar(avaliar.i, avaliar.k, { etapa: 'Parametrizar avaliações', emailMonitorEm: agora(), devolucao: undefined }, `${uc(avaliar)?.nome}: planejamento aprovado pelo tutor; e-mail a ${uc(avaliar)?.monitor ?? 'o monitor'} para parametrizar as avaliações no Moodle`), setAvaliar(null))}><Check /> Aprovar planejamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDr} onOpenChange={setEmailDr}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>E-mail à DR solicitante</DialogTitle>
            <DialogDescription>Disparado quando todas as UCs ficam prontas.</DialogDescription>
          </DialogHeader>
          <Textarea readOnly rows={10} className="font-mono text-xs" value={[
            `Para: SENAI-${t.drContratante} (gestor e secretaria escolar)`,
            `Assunto: Turma ${t.codigo} pronta — ajustar SGN/SGE para integrar os alunos no Moodle`,
            '',
            `A estrutura da turma ${t.codigo} (${t.cursos[0]}) está pronta no Moodle AVA.`,
            'Ajuste o SGN/SGE com os códigos abaixo para integrar os alunos:',
            ...ucs.map(({ u }) => `• ${u.nome}: sala ${u.salaAva ?? '—'} · início ${d(u.inicio)}`),
            '',
            'A integração roda 5 dias antes do início de cada UC.',
          ].join('\n')} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDr(false)}>Fechar</Button>
            {!t.emailDrEm && <Button onClick={() => (registrar({ emailDrEm: agora() }, `E-mail à DR solicitante (SENAI-${t.drContratante}) para ajustar o SGN/SGE e integrar os alunos`), setEmailDr(false))}><Send /> Enviar agora</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Integração com o AVA: depois que a estrutura está pronta (todas as UCs), a DR ajusta o SGN/SGE com os códigos CTM por
// escola + IDs das salas; aqui ficam esses dados e a situação da integração por escola.
export function IntegracaoTurma({ t, registrar }: { t: Turma; registrar: Registrar }) {
  const escolas = t.escolas ?? []
  const ucs = t.modulos.flatMap((m) => m.unidades)
  const pronta = estruturaPronta(t)
  const { inicio } = { inicio: ucs.map((u) => u.inicio).filter(Boolean).sort()[0] ?? '' }
  const faltam = inicio ? diasEntre(HOJE, inicio) : 999
  const sigla = (nome: string) => nome.replace(/^SENAI\s+/i, '').normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 8).toUpperCase()
  const codigoCtm = (escola: string) => `${t.codigo.replace('/', '-')}-${sigla(escola)}`
  const semestre = (iso: string) => (iso ? `${iso.slice(0, 4)}-${Number(iso.slice(5, 7)) <= 6 ? 1 : 2}` : '—')
  const linhas = escolas.flatMap((e) => ucs.map((u) => [codigoCtm(e.nome), u.nome, u.sala === 'Criada' ? u.salaAva ?? '—' : '—', d(u.inicio), semestre(u.inicio)]))
  return (
    <div className="space-y-6">
      <section className={cn('flex flex-wrap items-center gap-3 rounded-[1.25rem] border p-4 text-sm', pronta ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'bg-card')}>
        {pronta ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5 text-muted-foreground" />}
        <p className="min-w-0 flex-1">
          {pronta
            ? (t.emailDrEm ? `Estrutura pronta. E-mail à DR enviado em ${new Date(t.emailDrEm).toLocaleDateString('pt-BR')} para ajustar o SGN/SGE e integrar os alunos.` : 'Estrutura pronta: falta o e-mail à DR (aba UCs).')
            : `Estrutura em preparação: ${ucs.filter((u) => etapaDe(u) === 'Pronta').length} de ${ucs.length} UCs prontas. A DR é avisada quando todas estiverem prontas.`}
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Dados de integração para a DR</h3>
            <p className="text-sm text-muted-foreground">Código CTM por escola + ID da sala de cada UC, para o SENAI-{t.drContratante} parametrizar no SGN/SGE. A integração roda 5 dias antes do início.</p>
          </div>
          <Button variant="outline" disabled={!pronta || !linhas.length} motivo="Disponível quando todas as UCs estiverem prontas" onClick={() => void navigator.clipboard.writeText([['Código CTM', 'UC', 'ID da sala', 'Início', 'Semestre'], ...linhas].map((l) => l.join('\t')).join('\n')).catch(() => {})}><Copy /> Copiar tabela</Button>
        </div>
        {!escolas.length ? (
          <EmptyState title="Nenhuma escola na turma" description="Cadastre as escolas na aba Cronograma." />
        ) : (
          <div className="overflow-hidden rounded-[1.25rem] border bg-card">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Código CTM</TableHead><TableHead>UC</TableHead><TableHead>ID da sala</TableHead><TableHead>Início</TableHead><TableHead>Semestre</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {linhas.map((l, n) => (
                  <TableRow key={n}>{l.map((c, j) => <TableCell key={j} className={cn(j !== 1 && 'font-mono text-xs tabular-nums')}>{c}</TableCell>)}</TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Situação da integração</h3>
        <ul className="grid gap-2">
          {escolas.map((e, n) => {
            const integ = e.integrados ?? 0
            const sit = !pronta ? 'Aguardando estrutura' : integ >= e.alunos ? 'Integrada' : integ > 0 ? 'Parcial' : 'Não integrada'
            const atraso = pronta && integ < e.alunos && faltam <= 5
            return (
              <li key={e.nome} className={cn('flex flex-wrap items-center gap-3 rounded-[1.25rem] border bg-card px-4 py-3', atraso && 'border-amber-300 bg-amber-50')}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{e.nome} <span className="font-normal text-muted-foreground">· {e.cidade}</span></p>
                  <p className="text-xs text-muted-foreground tabular-nums">{integ} de {e.alunos} alunos integrados no Moodle · código {codigoCtm(e.nome)}</p>
                  {atraso && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-900"><AlertTriangle className="size-3.5" /> Faltam {Math.max(faltam, 0)} dia(s) para o início e a DR ainda não integrou todos os alunos.</p>}
                </div>
                <Badge variant="secondary" className={cn(sit === 'Integrada' ? 'bg-emerald-100 text-emerald-800' : sit === 'Parcial' ? 'bg-amber-100 text-amber-800' : 'bg-muted text-muted-foreground')}>{sit}</Badge>
                {/* Protótipo: simula a consulta ao serviço do Moodle (matriculados × integrados) */}
                {pronta && integ < e.alunos && (
                  <Button size="sm" variant="outline" onClick={() => registrar({ escolas: escolas.map((x, j) => (j === n ? { ...x, integrados: x.alunos } : x)) }, `Integração consultada no Moodle: ${e.nome} com ${e.alunos} alunos integrados`)}><RefreshCw /> Consultar Moodle</Button>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
