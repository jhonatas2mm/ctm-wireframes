// Alunos das turmas da oferta (fictícios, gerados de forma estável a partir das escolas da turma) e a regra de faturamento
// por UC no ciclo financeiro. Base do Relatório geral de acompanhamento e do Relatório de cobrança. Regras em docs/fluxo.md.
import type { ConfirmacaoDesistencia, Turma, UcTurma } from './mock'

export type StatusAluno = 'Matriculado' | 'Desistente' | 'Trancado'
export type SituacaoUcAluno = 'Ativo' | 'Suspenso' | 'Desistente no Moodle' | 'Não integrado nesta UC'
// Desistência vem do Moodle e precisa da confirmação da DR solicitante (dupla checagem: pode ser falha de integração).
export type ConfirmacaoSaida = 'Aguardando DR' | 'Confirmada' | 'Contestada'
export type AlunoTurma = {
  id: string; nome: string; cpf: string; email: string; telefone: string
  turmaId: string; escola: string; cidade: string
  status: StatusAluno; dataSaida?: string; monitor?: string
  suspensoEm?: string // suspenso no AVA (sem acesso), sem formalização da DR
  integrado: boolean // a DR integrou o aluno no AVA (SGN/SGE)
  desistenciaMoodle?: string // data em que o Moodle marcou a desistência
  confirmacao?: ConfirmacaoSaida // dupla checagem da DR (só para desistência)
  confirmacaoEm?: string; confirmacaoPor?: string; motivoContestacao?: string
}

const nomes = ['Alisson', 'Beatriz', 'Carlos', 'Davi', 'Débora', 'Enzo', 'Gabriel', 'Isabela', 'José', 'Kauã', 'Lílian', 'Maria Clara', 'Nicolas', 'Pedro', 'Queila', 'Rafael', 'Raíssa', 'Ryan', 'Tauane', 'Ticiana', 'Vicente', 'Wan', 'Andresson', 'Larissa', 'Mateus', 'Yasmin']
const sobrenomes = ['Santos', 'Morais', 'Pereira', 'Silva', 'Souza', 'Campos', 'Araújo', 'Pinheiro', 'Sales', 'Alves', 'Oliveira', 'Dutra', 'Veloso', 'Borges', 'Bezerra', 'Menezes', 'Freitas', 'Nunes', 'Brito', 'Castro']
const somar = (iso: string, n: number) => new Date(Date.parse(iso) + n * 864e5).toISOString().slice(0, 10)
const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '')

export function alunosDaTurma(t: Turma, conf: ConfirmacaoDesistencia[] = []): AlunoTurma[] {
  const ucs = t.modulos.flatMap((m) => m.unidades).filter((u) => u.inicio)
  const inicio = ucs.map((u) => u.inicio).sort()[0] ?? '2026-01-01'
  const monitor = ucs.find((u) => u.monitor)?.monitor
  let seq = 0
  const base = (t.escolas ?? []).flatMap((e) => {
    const integrados = e.integrados ?? e.alunos
    return Array.from({ length: e.alunos }, (_, n) => {
      const k = seq++ + Number(t.id.replace(/\D/g, '')) * 7
      const nome = `${nomes[k % nomes.length]} ${sobrenomes[(k * 3) % sobrenomes.length]} ${sobrenomes[(k * 7 + 5) % sobrenomes.length]}`
      const desistente = n % 7 === 3
      const trancado = !desistente && n % 13 === 9
      const suspenso = !desistente && !trancado && n % 11 === 5
      const saida = desistente || trancado ? somar(inicio, 18 + (n % 4) * 9) : undefined
      return {
        id: `${t.id}-${k}`, nome,
        cpf: String(10_000_000_000 + ((k * 7_919_113) % 89_999_999_999)).slice(-11),
        email: `${semAcento(nome.split(' ')[0])}.${semAcento(nome.split(' ').at(-1)!)}${k}@gmail.com`,
        telefone: `(${t.drContratante === 'RJ' ? 21 : 11}) 9${String(8000 + ((k * 137) % 1999)).padStart(4, '0')}-${String((k * 7919) % 10000).padStart(4, '0')}`,
        turmaId: t.id, escola: e.nome, cidade: e.cidade,
        status: desistente ? 'Desistente' : trancado ? 'Trancado' : 'Matriculado',
        dataSaida: saida, monitor: saida || suspenso ? monitor : undefined,
        suspensoEm: suspenso ? somar(inicio, 12) : undefined,
        integrado: n < integrados,
        // Desistências mais antigas já vêm confirmadas pela DR; as demais aguardam a dupla checagem
        desistenciaMoodle: desistente ? saida : undefined,
        confirmacao: desistente ? (n % 14 === 3 ? 'Confirmada' : 'Aguardando DR') : undefined,
        confirmacaoEm: desistente && n % 14 === 3 ? somar(saida!, 5) : undefined,
      } as AlunoTurma
    })
  })
  // Decisões da DR registradas no sistema; contestada = falha de integração: o aluno segue matriculado.
  return base.map((a): AlunoTurma => {
    const c = conf.find((x) => x.id === a.id)
    if (!c || !a.desistenciaMoodle) return a
    if (c.situacao === 'Confirmada') return { ...a, confirmacao: 'Confirmada', confirmacaoEm: c.em, confirmacaoPor: c.por }
    return { ...a, status: 'Matriculado', dataSaida: undefined, monitor: undefined, confirmacao: 'Contestada', confirmacaoEm: c.em, confirmacaoPor: c.por, motivoContestacao: c.motivo }
  })
}
// A saída só vale (e para a cobrança) com a confirmação da DR; trancamento já chega formalizado.
export const saidaValida = (a: AlunoTurma) => !!a.dataSaida && (a.status === 'Trancado' || a.confirmacao === 'Confirmada')

// Situação do aluno na UC: não integrado (a DR não integrou, ou a UC começa depois da saída formalizada), suspenso ou ativo.
export function situacaoNaUc(a: AlunoTurma, u: UcTurma): { situacao: SituacaoUcAluno; desde?: string } {
  if (!a.integrado || (saidaValida(a) && u.inicio > a.dataSaida!)) return { situacao: 'Não integrado nesta UC' }
  if (a.dataSaida && !saidaValida(a) && u.fim >= a.dataSaida) return { situacao: 'Desistente no Moodle', desde: a.dataSaida }
  if (a.suspensoEm && u.fim >= a.suspensoEm) return { situacao: 'Suspenso', desde: a.suspensoEm }
  return { situacao: 'Ativo' }
}

// Ciclo financeiro (mês de cobrança): janela do dia 21 do mês anterior ao dia 20 do mês (corte no dia 20).
const mesAnt = (c: string) => new Date(Date.UTC(Number(c.slice(0, 4)), Number(c.slice(5)) - 2, 1)).toISOString().slice(0, 7)
const proxMes = (c: string) => new Date(Date.UTC(Number(c.slice(0, 4)), Number(c.slice(5)), 1)).toISOString().slice(0, 7)
export const janelaCiclo = (c: string) => ({ ini: `${mesAnt(c)}-21`, fim: `${c}-20` })
export const cicloBr = (c: string) => `${Number(c.slice(5))}/${c.slice(0, 4)}`
export const ucNoCiclo = (u: UcTurma, c: string) => { const j = janelaCiclo(c); return !!u.inicio && !!u.fim && u.inicio <= j.fim && u.fim >= j.ini }

// Ciclos em que alguma UC das turmas está em andamento.
export function ciclosDe(turmas: Turma[]) {
  const ucs = turmas.flatMap((t) => t.modulos.flatMap((m) => m.unidades)).filter((u) => u.inicio && u.fim)
  if (!ucs.length) return []
  const cicloDe = (d: string) => (Number(d.slice(8)) > 20 ? proxMes(d.slice(0, 7)) : d.slice(0, 7))
  const out: string[] = []
  for (let c = cicloDe(ucs.map((u) => u.inicio).sort()[0]); c <= cicloDe(ucs.map((u) => u.fim).sort().at(-1)!); c = proxMes(c)) out.push(c)
  return out
}

// Fatura a UC no ciclo: UC em andamento na janela, aluno integrado nela (ativo, suspenso ou desistente no Moodle ainda sem
// confirmação da DR — a CTM cobra até a DR confirmar/formalizar) e sem saída confirmada antes do início da janela.
export function fatura(a: AlunoTurma, u: UcTurma, c: string) {
  if (!ucNoCiclo(u, c)) return false
  if (situacaoNaUc(a, u).situacao === 'Não integrado nesta UC') return false
  return !(saidaValida(a) && a.dataSaida! < janelaCiclo(c).ini)
}
