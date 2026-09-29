// Cálculo do Relatório de cobrança (CTM → DR solicitante): por proposta e ciclo financeiro. Regras em docs/fluxo.md.
import type { ConfirmacaoDesistencia, Produto, Turma } from './mock'
import { alunosDaTurma, corteSaida, fatura, janelaCiclo, type AlunoTurma } from './alunos-turma'

export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const dias = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5) + 1
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^SENAI\s+/i, '').replace(/\W+/g, '').toUpperCase()

export type LinhaCobranca = {
  turma: Turma; curso: string; modalidade: string; escola: string; cidade: string; codigo: string; uc: string
  chTotal: number; inicio: string; fim: string; chCobrada: number; alunos: number; valorHora: number; valor: number
}

// CH cobrada no ciclo = CH da UC proporcional aos dias da UC dentro da janela do ciclo (21 a 20).
// Alunos = os que faturam a UC no ciclo (Relatório geral de acompanhamento).
export function linhasCobranca(p: Produto, turmas: Turma[], ciclo: string, conf: ConfirmacaoDesistencia[] = []): LinhaCobranca[] {
  const { ini, fim } = janelaCiclo(ciclo)
  return turmas.flatMap((t) => { const al = alunosDaTurma(t, conf); return (t.escolas ?? []).flatMap((e) => t.modulos.flatMap((m) => {
    const cp = p.cursos.find((c) => c.nome === m.curso)
    const valorHora = cp ? cp.valorAluno / (cp.cargaHoraria || 1) : 0
    return m.unidades.filter((u) => u.inicio && u.fim && u.inicio <= fim && u.fim >= ini).map((u) => {
      const chTotal = u.chEad + u.chPresencial
      const chCobrada = (chTotal * dias(u.inicio > ini ? u.inicio : ini, u.fim < fim ? u.fim : fim)) / dias(u.inicio, u.fim)
      const alunos = al.filter((a) => a.escola === e.nome && fatura(a, u, ciclo)).length
      return {
        turma: t, curso: m.curso, modalidade: cp?.modalidade ?? '—', escola: e.nome, cidade: e.cidade,
        codigo: `CTM${p.drOfertante}_D${t.drContratante}_${t.codigo.split('-')[2]?.split('/')[0] ?? t.id}_${slug(e.nome)}`,
        uc: u.nome, chTotal, inicio: u.inicio, fim: u.fim, chCobrada, alunos, valorHora, valor: chCobrada * alunos * valorHora,
      }
    })
  })) })
}

// Alunos que faturam ao menos uma UC no ciclo (id → aluno e turma).
export function faturadosNoCiclo(turmas: Turma[], ciclo: string, conf: ConfirmacaoDesistencia[] = []) {
  const m = new Map<string, { aluno: AlunoTurma; turma: Turma }>()
  for (const t of turmas) {
    const ucs = t.modulos.flatMap((x) => x.unidades)
    for (const a of alunosDaTurma(t, conf)) if (ucs.some((u) => fatura(a, u, ciclo))) m.set(a.id, { aluno: a, turma: t })
  }
  return m
}

// Movimentação da cobrança de um mês para o outro: quem saiu (saída confirmada) e quantos entraram/saíram por outros motivos
// (UC nova, fim de UC). Cada mês pode ter mais ou menos alunos.
export function movimentacao(turmas: Turma[], ciclo: string, anterior: string | undefined, conf: ConfirmacaoDesistencia[] = []) {
  const atual = faturadosNoCiclo(turmas, ciclo, conf)
  const antes = anterior ? faturadosNoCiclo(turmas, anterior, conf) : new Map<string, { aluno: AlunoTurma; turma: Turma }>()
  const sairam = [...antes.values()].filter((x) => !atual.has(x.aluno.id))
  return {
    atual: atual.size,
    anterior: anterior ? antes.size : undefined,
    entraram: [...atual.keys()].filter((id) => !antes.has(id)).length,
    saidas: sairam.filter((x) => corteSaida(x.aluno)),
    outrasSaidas: sairam.filter((x) => !corteSaida(x.aluno)).length,
  }
}
