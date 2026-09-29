import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Copy, Mail, MonitorPlay, RefreshCw, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/wf'
import { HOJE, acaoSugerida, dataBr, diasEntre, execucoesAnteriores, statusTurma, useEquipe, type AcaoTutor, type EquipeTurma, type LinksUc, type Turma, type UcTurma } from '@/lib/mock'
import { cn } from '@/lib/utils'

type Registrar = (patch: Partial<Turma>, texto: string) => void
const acoes: AcaoTutor[] = ['Planejamento', 'Replanejamento', 'Apropriação']
const d = (iso?: string) => (iso ? dataBr(iso) : '—')
// Atualiza uma UC (módulo i, UC k) devolvendo os módulos novos.
const comUc = (t: Turma, i: number, k: number, patch: Partial<UcTurma>) =>
  t.modulos.map((m, j) => (j !== i ? m : { ...m, unidades: m.unidades.map((u, l) => (l === k ? { ...u, ...patch } : u)) }))

// Situação da UC na gestão da execução.
const situacaoUc = (u: UcTurma) =>
  !u.tutor ? 'Sem tutor' : !u.tutorConfirmado ? 'Aguardando e-mail' : (u.acao ?? acaoSugerida(u.nome)) !== 'Apropriação' && !u.validacaoPedagogica ? 'Em planejamento' : 'Tutor confirmado'
const corSituacao: Record<ReturnType<typeof situacaoUc>, string> = {
  'Sem tutor': 'bg-muted text-muted-foreground',
  'Aguardando e-mail': 'bg-amber-100 text-amber-800',
  'Em planejamento': 'bg-sky-100 text-sky-800',
  'Tutor confirmado': 'bg-emerald-100 text-emerald-800',
}

// Gestão da execução: equipe da turma (supervisão) + tutor e tipo de ação por UC (PCP) + e-mail ao tutor (analista).
export function ExecucaoTurma({ t, registrar }: { t: Turma; registrar: Registrar }) {
  const equipe = useEquipe().all.filter((p) => p.status === 'Ativo')
  const [email, setEmail] = useState<{ i: number; k: number } | null>(null)
  const status = statusTurma(t)
  if (status === 'A iniciar' || status === 'Cancelada')
    return <EmptyState title={status === 'Cancelada' ? 'Turma cancelada' : 'A alocação da equipe começa quando a turma é confirmada'} description={status === 'Cancelada' ? undefined : 'Com o cronograma validado, use “Confirmar turma”: o status passa a Buscar tutor e o PCP começa a alocação.'} />
  const pessoas = (funcao: string) => equipe.filter((p) => p.funcao === funcao)
  const tutores = pessoas('Tutor')
  const setEquipe = (patch: EquipeTurma) => registrar({ equipe: { ...t.equipe, ...patch } }, `Equipe da turma: ${Object.entries(patch).map(([k, v]) => `${rotulos[k as keyof EquipeTurma]} ${v}`).join(', ')}`)
  const rotulos: Record<keyof EquipeTurma, string> = { monitorFront: 'Monitor front', monitorBack: 'Monitor back', pedagogico: 'Pedagógico', interlocutor: 'Interlocutor' }
  const ucs = t.modulos.flatMap((m, i) => m.unidades.map((u, k) => ({ u, i, k })))
  const confirmados = ucs.filter(({ u }) => u.tutorConfirmado).length
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="font-semibold">Equipe da turma</h3>
        <div className="grid grid-cols-2 gap-3 rounded-[1.25rem] border p-4 lg:grid-cols-4 bg-card">
          {(Object.keys(rotulos) as (keyof EquipeTurma)[]).map((k) => (
            <div key={k} className="grid gap-1.5">
              <Label>{rotulos[k]}</Label>
              <Select value={t.equipe?.[k] ?? null} onValueChange={(v) => setEquipe({ [k]: v as string })}>
                <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => v ?? 'Não alocado'}</SelectValue></SelectTrigger>
                <SelectContent>{pessoas(rotulos[k]).map((p) => <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h3 className="font-semibold">Tutoria por UC</h3>
          <span className="text-sm text-muted-foreground tabular-nums">{confirmados} de {ucs.length} tutores confirmados</span>
        </div>
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unidade curricular</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="w-56">Tutor (PCP)</TableHead>
                <TableHead className="w-44">Ação</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">E-mail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ucs.map(({ u, i, k }) => {
                const acao = u.acao ?? acaoSugerida(u.nome)
                const vezes = u.tutor ? execucoesAnteriores.filter((e) => e.uc === u.nome && e.tutor === u.tutor).length : 0
                const sit = situacaoUc(u)
                return (
                  <TableRow key={`${i}-${k}`}>
                    <TableCell className="font-medium">{i + 1}.{k + 1} {u.nome}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{d(u.inicio)} a {d(u.fim)}</TableCell>
                    <TableCell>
                      <Select value={u.tutor ?? null} onValueChange={(v) => registrar({ modulos: comUc(t, i, k, { tutor: v as string, tutorConfirmado: false, acao }) }, `Tutor de ${u.nome}: ${v}`)}>
                        <SelectTrigger className="h-8 w-full"><SelectValue>{(v: string | null) => v ?? 'Alocar tutor'}</SelectValue></SelectTrigger>
                        <SelectContent>
                          {/* Quem tem a competência na UC aparece primeiro, com estrela */}
                          {[...tutores].sort((a, b) => Number(b.competencias.includes(u.nome)) - Number(a.competencias.includes(u.nome))).map((p) => (
                            <SelectItem key={p.id} value={p.nome}>
                              <span className="flex items-center gap-1.5">{p.competencias.includes(u.nome) && <Star className="size-3 fill-amber-400 text-amber-500" />}{p.nome}<span className="text-xs text-muted-foreground">· {p.disponibilidade.map((x) => x.slice(0, 3)).join(', ')}</span></span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {u.tutor && <p className="mt-1 text-xs text-muted-foreground">{vezes ? `Já deu esta UC ${vezes}×` : 'Primeira vez nesta UC'}</p>}
                    </TableCell>
                    <TableCell>
                      <Select value={acao} onValueChange={(v) => registrar({ modulos: comUc(t, i, k, { acao: v as AcaoTutor, validacaoPedagogica: false }) }, `Ação de ${u.nome}: ${v}`)}>
                        <SelectTrigger className="h-8 w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>{acoes.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                      </Select>
                      {!u.acao && <p className="mt-1 text-xs text-muted-foreground">Sugerida pelo histórico</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={corSituacao[sit]}>{sit}</Badge>
                      {/* Planejamento/replanejamento: o pedagógico valida o material antes do monitor back subir no AVA */}
                      {u.tutorConfirmado && acao !== 'Apropriação' && (
                        <label className="mt-1.5 flex items-center gap-1.5 text-xs">
                          <input type="checkbox" checked={!!u.validacaoPedagogica} onChange={(e) => registrar({ modulos: comUc(t, i, k, { validacaoPedagogica: e.target.checked }) }, `${u.nome}: validação pedagógica ${e.target.checked ? 'concluída' : 'desfeita'}`)} />
                          Validado pelo pedagógico
                        </label>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="h-7" disabled={!u.tutor} motivo="Aloque um tutor na unidade" onClick={() => setEmail({ i, k })}><Mail /> {u.tutorConfirmado ? 'Ver' : 'Gerar'}</Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </section>
      {email && <EmailTutor t={t} i={email.i} k={email.k} onClose={() => setEmail(null)} registrar={registrar} />}
    </div>
  )
}

// E-mail ao tutor: o sistema monta o texto com os dados da turma e os links cadastrados; o envio é feito fora (copiar).
function EmailTutor({ t, i, k, onClose, registrar }: { t: Turma; i: number; k: number; onClose: () => void; registrar: Registrar }) {
  const u = t.modulos[i].unidades[k]
  const [links, setLinks] = useState<LinksUc>(u.links ?? {})
  const acao = u.acao ?? acaoSugerida(u.nome)
  const assunto = `[${acao}] ${u.nome} · ${t.cursos[0]} · ${t.codigo}`
  const corpo = [
    `Olá, ${u.tutor}!`,
    '',
    `Você foi alocado(a) na unidade curricular ${u.nome}, do curso ${t.cursos[0]} (turma ${t.codigo}, SENAI-${t.drContratante}).`,
    `Ação: ${acao}${acao === 'Apropriação' ? ' (a sala vem da sala modelo; informe as datas das avaliações ao monitor).' : ' (o material passa pela validação pedagógica antes de subir no AVA).'}`,
    '',
    `Período: ${d(u.inicio)} a ${d(u.fim)} · ${u.semanas ?? '—'} semana(s)`,
    `Encontros presenciais: ${u.encontros ?? '—'}${t.diaPresencial ? ` (${t.diaPresencial.toLowerCase()})` : ''} · Aulas ao vivo: ${u.aulasPrevistas ?? '—'}`,
    '',
    'Equipe:',
    `• Supervisor: ${t.supervisor ?? '—'} · Analista: ${t.analista ?? '—'}`,
    `• Monitor front: ${t.equipe?.monitorFront ?? '—'} · Monitor back: ${t.equipe?.monitorBack ?? '—'}`,
    `• Pedagógico: ${t.equipe?.pedagogico ?? '—'} · Interlocutor: ${t.equipe?.interlocutor ?? '—'}`,
    '',
    'Links:',
    `• Plano de curso: ${links.planoCurso || '—'}`,
    `• Plano de ensino: ${links.planoEnsino || '—'}`,
    `• Pasta da UC: ${links.pasta || '—'}`,
    `• Sala no AVA: ${u.salaAva ?? 'ainda não criada'}`,
  ].join('\n')
  const salvarLinks = () => registrar({ modulos: comUc(t, i, k, { links }) }, `Links de ${u.nome} atualizados`)
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>E-mail ao tutor</DialogTitle>
          <DialogDescription>O sistema monta o e-mail com os dados da turma; copie e envie pelo seu e-mail. Os documentos continuam no drive: aqui ficam só os links.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-3">
            {([['planoCurso', 'Plano de curso'], ['planoEnsino', 'Plano de ensino'], ['pasta', 'Pasta da UC']] as const).map(([k2, rot]) => (
              <div key={k2} className="grid gap-1.5">
                <Label>{rot}</Label>
                <Input placeholder="https://…" value={links[k2] ?? ''} onChange={(e) => setLinks({ ...links, [k2]: e.target.value })} onBlur={salvarLinks} />
              </div>
            ))}
          </div>
          <div className="grid gap-1.5">
            <Label>Assunto</Label>
            <Input readOnly value={assunto} />
          </div>
          <div className="grid gap-1.5">
            <Label>Mensagem</Label>
            <Textarea readOnly rows={14} value={corpo} className="font-mono text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <Button variant="outline" onClick={() => void navigator.clipboard.writeText(`${assunto}\n\n${corpo}`).catch(() => {})}><Copy /> Copiar e-mail</Button>
          {!u.tutorConfirmado && (
            <Button onClick={() => (registrar({ modulos: comUc(t, i, k, { links, tutorConfirmado: true, acao }) }, `E-mail enviado a ${u.tutor} (${u.nome}): tutor confirmado`), onClose())}>
              <CheckCircle2 /> Marcar tutor confirmado
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Integração com o AVA: criar salas (botão no MVP), dados que a DR usa no SGE e situação da integração por escola.
export function IntegracaoTurma({ t, registrar }: { t: Turma; registrar: Registrar }) {
  const status = statusTurma(t)
  const liberada = status === 'Buscar tutor' || status === 'Em andamento'
  const escolas = t.escolas ?? []
  const ucs = t.modulos.flatMap((m) => m.unidades)
  const { inicio } = { inicio: ucs.map((u) => u.inicio).filter(Boolean).sort()[0] ?? '' }
  const faltam = inicio ? diasEntre(HOJE, inicio) : 999
  const sigla = (nome: string) => nome.replace(/^SENAI\s+/i, '').normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 8).toUpperCase()
  const codigoCtm = (escola: string) => `${t.codigo.replace('/', '-')}-${sigla(escola)}`
  const semestre = (iso: string) => (iso ? `${iso.slice(0, 4)}-${Number(iso.slice(5, 7)) <= 6 ? 1 : 2}` : '—')
  const criarSalas = () => {
    let n = 90000 + Number(t.codigo.replace(/\D/g, '').slice(0, 5)) * 10
    registrar({ salasCriadas: true, modulos: t.modulos.map((m) => ({ ...m, unidades: m.unidades.map((u) => ({ ...u, salaAva: u.salaAva ?? `AVA-${n++}` })) })) }, `Salas criadas no AVA (${ucs.length} UCs)`)
  }
  const linhas = escolas.flatMap((e) => ucs.map((u) => [codigoCtm(e.nome), u.nome, u.salaAva ?? '—', d(u.inicio), semestre(u.inicio)]))
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">Salas no AVA</h3>
          {!t.salasCriadas && <Button disabled={!liberada} motivo="Aguardando a turma ser confirmada" title={liberada ? undefined : 'Disponível depois de confirmar a turma'} onClick={criarSalas}><MonitorPlay /> Criar salas no AVA</Button>}
        </div>
        {t.salasCriadas ? (
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {ucs.map((u) => (
              <li key={u.nome} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-card">
                <CheckCircle2 className="size-4 text-emerald-600" /> <span className="min-w-0 flex-1 truncate">{u.nome}</span>
                <Badge variant="secondary" className="font-mono">{u.salaAva}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{liberada ? 'As salas ainda não foram criadas.' : 'As salas são criadas depois que a turma é confirmada (Buscar tutor).'}</p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Dados de integração para a DR</h3>
            <p className="text-sm text-muted-foreground">Código CTM por escola + ID da sala de cada UC, para o SENAI-{t.drContratante} parametrizar no SGE. A integração roda 5 dias antes do início.</p>
          </div>
          <Button variant="outline" disabled={!t.salasCriadas || !linhas.length} motivo="Crie as salas no AVA primeiro" onClick={() => void navigator.clipboard.writeText([['Código CTM', 'UC', 'ID da sala', 'Início', 'Semestre'], ...linhas].map((l) => l.join('\t')).join('\n')).catch(() => {})}><Copy /> Copiar tabela</Button>
        </div>
        {!escolas.length ? (
          <EmptyState title="Nenhuma escola na turma" description="Cadastre as escolas na aba Cronograma." />
        ) : (
          <div className="overflow-hidden rounded-lg border bg-card">
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
            const sit = !t.salasCriadas ? 'Sem salas' : integ >= e.alunos ? 'Integrada' : integ > 0 ? 'Parcial' : 'Não integrada'
            const atraso = t.salasCriadas && integ < e.alunos && faltam <= 5
            return (
              <li key={e.nome} className={cn('flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 bg-card', atraso && 'border-amber-300 bg-amber-50')}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{e.nome} <span className="font-normal text-muted-foreground">· {e.cidade}</span></p>
                  <p className="text-xs text-muted-foreground tabular-nums">{integ} de {e.alunos} alunos integrados no AVA · código {codigoCtm(e.nome)}</p>
                  {atraso && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-900"><AlertTriangle className="size-3.5" /> Faltam {Math.max(faltam, 0)} dia(s) para o início e a DR ainda não integrou todos os alunos.</p>}
                </div>
                <Badge variant="secondary" className={cn(sit === 'Integrada' ? 'bg-emerald-100 text-emerald-800' : sit === 'Parcial' ? 'bg-amber-100 text-amber-800' : 'bg-muted text-muted-foreground')}>{sit}</Badge>
                {/* Protótipo: simula a consulta ao serviço do AVA (matriculados × integrados) */}
                {t.salasCriadas && integ < e.alunos && (
                  <Button size="sm" variant="outline" onClick={() => registrar({ escolas: escolas.map((x, j) => (j === n ? { ...x, integrados: x.alunos } : x)) }, `Integração consultada no AVA: ${e.nome} com ${e.alunos} alunos integrados`)}><RefreshCw /> Consultar AVA</Button>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
