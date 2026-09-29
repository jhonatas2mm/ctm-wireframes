// Gerador de cronograma da oferta (substitui o script em planilha da CTM). Regras em docs/fluxo.md.
// Entrada: matriz (módulos → UCs com CH) + parâmetros; saída: início/término, semanas, encontros presenciais e
// aulas ao vivo previstas por UC. Só dias úteis; pula os feriados nacionais (cadastro do Super admin).
import { chUc, type DataCalendario, type Turma } from './mock'

export type ParametrosCronograma = {
  inicio: string // ISO
  chSemanal: number // horas de estudo por semana (padrão 20)
  ambientacao: 'Concomitante' | 'Semana própria' // semana de ambientação junto com a 1ª UC ou antes dela
  intervaloModulos: number // dias corridos entre módulos (rematrícula)
  iniciarModuloDezembro: boolean // alguns DRs não iniciam módulo em dezembro: empurra para o início de janeiro
  terminarNaSexta: boolean // UC sempre termina na sexta-feira
}

export const parametrosPadrao = (inicio: string): ParametrosCronograma => ({
  inicio, chSemanal: 20, ambientacao: 'Concomitante', intervaloModulos: 7, iniciarModuloDezembro: false, terminarNaSexta: true,
})

const somar = (d: string, n: number) => new Date(Date.parse(d) + n * 864e5).toISOString().slice(0, 10)
const diaSemana = (d: string) => new Date(`${d}T12:00:00Z`).getUTCDay() // 0 = domingo
export const bloqueio = (d: string, cal: DataCalendario[]) => cal.find((c) => d >= c.inicio && d <= (c.fim ?? c.inicio))
const util = (d: string, cal: DataCalendario[]) => diaSemana(d) >= 1 && diaSemana(d) <= 5 && !bloqueio(d, cal)
const proximoUtil = (d: string, cal: DataCalendario[]) => {
  let x = d
  while (!util(x, cal)) x = somar(x, 1)
  return x
}

// Encontros presenciais: 1 a cada 4 h presenciais; aulas ao vivo: CH a distância ÷ 20 (padrão de material do tutor).
export const encontrosPrevistos = (chPresencial: number) => (chPresencial ? Math.max(1, Math.round(chPresencial / 4)) : 0)
export const aulasAoVivoPrevistas = (chEad: number) => (chEad ? Math.max(1, Math.round(chEad / 20)) : 0)

export function gerarCronograma(modulos: Turma['modulos'], p: ParametrosCronograma, cal: DataCalendario[]) {
  const avisos: string[] = []
  let d = proximoUtil(p.inicio, cal)
  if (d !== p.inicio) avisos.push(`Início ajustado para o próximo dia útil (${d.split('-').reverse().join('/')}).`)
  let cursoAnterior = ''
  let ultimoFim = ''
  const saida = modulos.map((m) => {
    // Novo módulo do mesmo curso: intervalo de rematrícula contado do término do módulo anterior; cada curso começa na data de início.
    if (m.curso !== cursoAnterior) d = proximoUtil(p.inicio, cal)
    else d = proximoUtil(somar(ultimoFim, p.intervaloModulos + 1), cal)
    if (m.curso !== cursoAnterior && p.ambientacao === 'Semana própria') d = proximoUtil(somar(d, 7), cal)
    cursoAnterior = m.curso
    if (!p.iniciarModuloDezembro && d.slice(5, 7) === '12') {
      const novo = proximoUtil(`${Number(d.slice(0, 4)) + 1}-01-02`, cal)
      avisos.push(`Módulo ${m.nome} (${m.curso}) iria começar em dezembro; passou para ${novo.split('-').reverse().join('/')}.`)
      d = novo
    }
    return {
      ...m,
      unidades: m.unidades.map((u) => {
        const semanas = Math.max(1, Math.ceil((chUc(u) || p.chSemanal) / p.chSemanal))
        const inicio = d
        let cur = d
        let fim = d
        for (let n = 0; n < semanas * 5; cur = somar(cur, 1)) if (util(cur, cal)) (n++, (fim = cur))
        if (p.terminarNaSexta) while (diaSemana(fim) !== 5) fim = somar(fim, 1)
        d = proximoUtil(somar(fim, 1), cal)
        ultimoFim = fim
        return { ...u, inicio, fim, semanas, encontros: encontrosPrevistos(u.chPresencial), aulasPrevistas: aulasAoVivoPrevistas(u.chEad) }
      }),
    }
  })
  return { modulos: saida, avisos }
}

// Datas dos encontros presenciais da UC: um por semana, no dia do presencial da turma (padrão segunda-feira).
// Se a UC tem mais semanas que encontros, a 1ª semana fica só a distância. Feriado nacional: a semana fica sem encontro.
export function datasEncontros(u: { inicio: string; fim: string; semanas?: number; encontros?: number }, dia: string | undefined, cal: DataCalendario[]) {
  if (!u.inicio || !u.fim || !u.encontros) return []
  const alvo = Math.max(1, ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'].indexOf(dia ?? '') + 1)
  let d = u.inicio
  while (diaSemana(d) !== alvo) d = somar(d, 1)
  if ((u.semanas ?? 1) > u.encontros) d = somar(d, 7)
  const out: string[] = []
  for (; out.length < u.encontros && d <= u.fim; d = somar(d, 7)) if (!bloqueio(d, cal)) out.push(d)
  return out
}
export const diaCurto = (d: string) => ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][diaSemana(d)]

// Prorrogação: desloca todas as datas da turma (UCs e aulas ao vivo) pela diferença entre o início antigo e o novo.
export function deslocar(modulos: Turma['modulos'], dias: number): Turma['modulos'] {
  const mv = (x: string) => (x ? somar(x, dias) : x)
  return modulos.map((m) => ({ ...m, unidades: m.unidades.map((u) => ({ ...u, inicio: mv(u.inicio), fim: mv(u.fim), aoVivo: u.aoVivo.map((a) => ({ ...a, data: mv(a.data) })) })) }))
}
