// Alunos das turmas da oferta (fictícios, gerados de forma estável a partir das escolas da turma) e a regra de faturamento
// por UC no ciclo financeiro. Base do Relatório geral de acompanhamento e do Relatório de cobrança. Regras em docs/fluxo.md.
// A situação do aluno é SEMPRE POR UC: ele pode estar matriculado numa UC e desistente/evadido em outra da mesma turma.
import type { ConfirmacaoDesistencia, Turma, UcTurma } from './mock'

export type StatusMatricula = 'Matriculado' | 'Desistente' | 'Trancado'
export type SituacaoUcAluno = 'Ativo' | 'Suspenso' | 'Desistente no Moodle' | 'Desistente' | 'Trancado' | 'Não integrado nesta UC'
// Desistência vem do Moodle e precisa da confirmação da DR solicitante (dupla checagem: pode ser falha de integração).
export type ConfirmacaoSaida = 'Aguardando DR' | 'Confirmada' | 'Contestada'
// Matrícula do aluno numa UC
export type MatriculaUc = {
  uc: string
  status: StatusMatricula
  desde?: string // data da desistência (Moodle) ou do trancamento
  suspensoEm?: string // suspenso no AVA (sem acesso), sem formalização da DR
  confirmacao?: ConfirmacaoSaida // dupla checagem da DR (só para desistência)
  confirmacaoEm?: string; confirmacaoPor?: string; motivoContestacao?: string
  contestada?: boolean // a DR contestou: falha de integração, segue matriculado
}
export type AlunoTurma = {
  id: string; nome: string; cpf: string; email: string; telefone: string
  turmaId: string; escola: string; cidade: string
  integrado: boolean // a DR integrou o aluno no AVA (SGN/SGE)
  monitor?: string // monitor que acompanha as ocorrências do aluno
  ucs: MatriculaUc[] // só as UCs com ocorrência; as demais = Matriculado
}
export const idConfirmacao = (alunoId: string, uc: string) => `${alunoId}|${uc}`

const nomes = ['Alisson', 'Beatriz', 'Carlos', 'Davi', 'Débora', 'Enzo', 'Gabriel', 'Isabela', 'José', 'Kauã', 'Lílian', 'Maria Clara', 'Nicolas', 'Pedro', 'Queila', 'Rafael', 'Raíssa', 'Ryan', 'Tauane', 'Ticiana', 'Vicente', 'Wan', 'Andresson', 'Larissa', 'Mateus', 'Yasmin']
const sobrenomes = ['Santos', 'Morais', 'Pereira', 'Silva', 'Souza', 'Campos', 'Araújo', 'Pinheiro', 'Sales', 'Alves', 'Oliveira', 'Dutra', 'Veloso', 'Borges', 'Bezerra', 'Menezes', 'Freitas', 'Nunes', 'Brito', 'Castro']
const somar = (iso: string, n: number) => new Date(Date.parse(iso) + n * 864e5).toISOString().slice(0, 10)
const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '')

export function alunosDaTurma(t: Turma, conf: ConfirmacaoDesistencia[] = []): AlunoTurma[] {
  const L = t.modulos.flatMap((m) => m.unidades).filter((u) => u.inicio)
  const monitor = L.find((u) => u.monitor)?.monitor
  let seq = 0
  const base = (t.escolas ?? []).flatMap((e) => {
    const integrados = e.integrados ?? e.alunos
    return Array.from({ length: e.alunos }, (_, n): AlunoTurma => {
      const k = seq++ + Number(t.id.replace(/\D/g, '')) * 7
      const nome = `${nomes[k % nomes.length]} ${sobrenomes[(k * 3) % sobrenomes.length]} ${sobrenomes[(k * 7 + 5) % sobrenomes.length]}`
      const j = L.length ? n % L.length : 0
      const ucs: MatriculaUc[] = []
      const desist = (u: UcTurma, confirmada: boolean): MatriculaUc => {
        const desde = somar(u.inicio, 7)
        return { uc: u.nome, status: 'Desistente', desde, confirmacao: confirmada ? 'Confirmada' : 'Aguardando DR', confirmacaoEm: confirmada ? somar(desde, 5) : undefined }
      }
      if (L.length) {
        // Desistente só numa UC (segue matriculado nas outras)
        if (n % 7 === 3) ucs.push(desist(L[j], n % 14 === 3))
        // Desistente a partir de uma UC (nas seguintes também)
        else if (n % 9 === 4) L.slice(j).forEach((u, i) => ucs.push(desist(u, i === 0 && n % 18 === 4)))
        // Trancado a partir de uma UC (já chega formalizado)
        else if (n % 13 === 9) L.slice(j).forEach((u) => ucs.push({ uc: u.nome, status: 'Trancado', desde: somar(u.inicio, 3) }))
        // Suspenso no AVA numa UC, sem formalização
        else if (n % 11 === 5) ucs.push({ uc: L[j].nome, status: 'Matriculado', suspensoEm: somar(L[j].inicio, 10) })
      }
      return {
        id: `${t.id}-${k}`, nome,
        cpf: String(10_000_000_000 + ((k * 7_919_113) % 89_999_999_999)).slice(-11),
        email: `${semAcento(nome.split(' ')[0])}.${semAcento(nome.split(' ').at(-1)!)}${k}@gmail.com`,
        telefone: `(${t.drContratante === 'RJ' ? 21 : 11}) 9${String(8000 + ((k * 137) % 1999)).padStart(4, '0')}-${String((k * 7919) % 10000).padStart(4, '0')}`,
        turmaId: t.id, escola: e.nome, cidade: e.cidade,
        integrado: n < integrados,
        monitor: ucs.length ? monitor : undefined,
        ucs,
      }
    })
  })
  // Decisões da DR registradas no sistema (por aluno × UC); contestada = falha de integração: segue matriculado na UC.
  return base.map((a) => ({
    ...a,
    ucs: a.ucs.map((m): MatriculaUc => {
      const c = conf.find((x) => x.id === idConfirmacao(a.id, m.uc))
      if (!c || m.status !== 'Desistente') return m
      if (c.situacao === 'Confirmada') return { ...m, confirmacao: 'Confirmada', confirmacaoEm: c.em, confirmacaoPor: c.por }
      return { ...m, status: 'Matriculado', contestada: true, confirmacao: 'Contestada', confirmacaoEm: c.em, confirmacaoPor: c.por, motivoContestacao: c.motivo }
    }),
  }))
}

export const matriculaNa = (a: AlunoTurma, u: UcTurma): MatriculaUc => a.ucs.find((m) => m.uc === u.nome) ?? { uc: u.nome, status: 'Matriculado' }
// A saída na UC só vale (e para a cobrança) com a confirmação da DR; trancamento já chega formalizado.
export const saidaValida = (m: MatriculaUc) => m.status === 'Trancado' || (m.status === 'Desistente' && m.confirmacao === 'Confirmada')
// Desistência que aguarda a dupla checagem da DR
export const aguardandoDr = (m: MatriculaUc) => m.status === 'Desistente' && m.confirmacao === 'Aguardando DR'

// Situação do aluno na UC
export function situacaoNaUc(a: AlunoTurma, u: UcTurma): { situacao: SituacaoUcAluno; desde?: string; matricula: MatriculaUc } {
  const m = matriculaNa(a, u)
  if (!a.integrado) return { situacao: 'Não integrado nesta UC', matricula: m }
  if (m.status === 'Trancado') return { situacao: 'Trancado', desde: m.desde, matricula: m }
  if (m.status === 'Desistente') return { situacao: saidaValida(m) ? 'Desistente' : 'Desistente no Moodle', desde: m.desde, matricula: m }
  if (m.suspensoEm) return { situacao: 'Suspenso', desde: m.suspensoEm, matricula: m }
  return { situacao: 'Ativo', matricula: m }
}

// Resumo das UCs do aluno (a situação é por UC; este é só o resumo da linha)
export function resumoAluno(a: AlunoTurma, ucs: UcTurma[]) {
  if (!a.integrado) return 'Não integrado'
  const ms = ucs.map((u) => matriculaNa(a, u))
  const des = ms.filter((m) => m.status === 'Desistente').length
  const tr = ms.filter((m) => m.status === 'Trancado').length
  if (!des && !tr) return 'Matriculado em todas as UCs'
  return [des && `Desistente em ${des} UC${des > 1 ? 's' : ''}`, tr && `Trancado em ${tr} UC${tr > 1 ? 's' : ''}`, ms.length - des - tr > 0 && `matriculado em ${ms.length - des - tr}`].filter(Boolean).join(' · ')
}

// Ciclo de faturamento é POR UC: cada UC tem o seu dia de fechamento (corteCiclo, padrão 20). A cobrança do mês c junta,
// de cada UC, a janela que fecha em c: do dia seguinte ao fechamento no mês anterior até o fechamento em c.
const mesAnt = (c: string) => new Date(Date.UTC(Number(c.slice(0, 4)), Number(c.slice(5)) - 2, 1)).toISOString().slice(0, 7)
const proxMes = (c: string) => new Date(Date.UTC(Number(c.slice(0, 4)), Number(c.slice(5)), 1)).toISOString().slice(0, 7)
const dd = (n: number) => String(n).padStart(2, '0')
export const CORTE_PADRAO = 20
export const corteUc = (u: UcTurma) => Math.min(28, Math.max(1, u.corteCiclo ?? CORTE_PADRAO))
export const janelaUc = (u: UcTurma, c: string) => { const k = corteUc(u); return { ini: `${mesAnt(c)}-${dd(k + 1)}`, fim: `${c}-${dd(k)}` } }
export const janelaCiclo = (c: string) => ({ ini: `${mesAnt(c)}-${dd(CORTE_PADRAO + 1)}`, fim: `${c}-${dd(CORTE_PADRAO)}` }) // ciclo padrão
export const cicloBr = (c: string) => `${Number(c.slice(5))}/${c.slice(0, 4)}`
export const ucNoCiclo = (u: UcTurma, c: string) => { const j = janelaUc(u, c); return !!u.inicio && !!u.fim && u.inicio <= j.fim && u.fim >= j.ini }

// Ciclos (meses de cobrança) em que alguma UC das turmas tem janela em andamento.
export function ciclosDe(turmas: Turma[]) {
  const ucs = turmas.flatMap((t) => t.modulos.flatMap((m) => m.unidades)).filter((u) => u.inicio && u.fim)
  const out = new Set<string>()
  for (const u of ucs) for (let c = u.inicio.slice(0, 7); c <= proxMes(u.fim.slice(0, 7)); c = proxMes(c)) if (ucNoCiclo(u, c)) out.add(c)
  return [...out].sort()
}

// Fatura a UC no ciclo: UC em andamento na janela, aluno integrado pela DR e sem saída válida NESTA UC antes do início da
// janela da UC. Desistente no Moodle sem confirmação e suspenso seguem faturando (a CTM cobra até a DR confirmar/formalizar).
// A saída confirmada fora do ciclo da UC (depois do fechamento) só desconta no próximo ciclo daquela UC.
// Ex.: UC com fechamento dia 20, confirmada em 10/11 → sai da cobrança de 12; em 25/11 → sai da de 01.
export const corteSaida = (m: MatriculaUc) => (!saidaValida(m) ? undefined : m.status === 'Trancado' ? m.desde : m.confirmacaoEm ?? m.desde)
export function fatura(a: AlunoTurma, u: UcTurma, c: string) {
  if (!ucNoCiclo(u, c) || !a.integrado) return false
  const corte = corteSaida(matriculaNa(a, u))
  return !(corte && corte < janelaUc(u, c).ini)
}
