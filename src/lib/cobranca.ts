// Cálculo do Relatório de cobrança (CTM → DR solicitante): por proposta e ciclo financeiro. Regras em docs/fluxo.md.
import type { Produto, Turma } from './mock'
import { alunosDaTurma, fatura, janelaCiclo } from './alunos-turma'

export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const dias = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5) + 1
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^SENAI\s+/i, '').replace(/\W+/g, '').toUpperCase()

export type LinhaCobranca = {
  turma: Turma; curso: string; modalidade: string; escola: string; cidade: string; codigo: string; uc: string
  chTotal: number; inicio: string; fim: string; chCobrada: number; alunos: number; valorHora: number; valor: number
}

// CH cobrada no ciclo = CH da UC proporcional aos dias da UC dentro da janela do ciclo (21 a 20).
// Alunos = os que faturam a UC no ciclo (Relatório geral de acompanhamento).
export function linhasCobranca(p: Produto, turmas: Turma[], ciclo: string): LinhaCobranca[] {
  const { ini, fim } = janelaCiclo(ciclo)
  return turmas.flatMap((t) => { const al = alunosDaTurma(t); return (t.escolas ?? []).flatMap((e) => t.modulos.flatMap((m) => {
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
