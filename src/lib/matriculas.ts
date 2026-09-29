// Matrículas nas CTMs, para o Painel do DN (visão operacional e relatório por DR × modalidade × CTM).
// Dados FICTÍCIOS e estáveis (gerador determinístico), no formato do relatório de matrículas das CTMs.

export type TurmaMatricula = {
  id: string; codigo: string; ctm: string; dr: string; escola: string; modalidade: string; area: string; curso: string
  inicio: string; fim: string; matriculas: number // datas ISO
}

// CTMs (UF → nome do estado, como nas colunas do relatório)
export const ctms: Record<string, string> = { GO: 'Goiás', PR: 'Paraná', SC: 'Santa Catarina', SP: 'São Paulo', MG: 'Minas Gerais' }
export const modalidadesMatricula = [
  'Técnico Semipresencial', 'Qualificação Profissional', 'Qualificação Profissional Semipresencial', 'Aprendizagem Industrial Técnica Semipresencial',
  'Aprendizagem Industrial Básica', 'Aperfeiçoamento Profissional', 'Qualificação Personalizada', 'Técnico', 'Pós-Graduação Lato Sensu',
]
const drsAtendidos = ['MG', 'DF', 'RS', 'RO', 'PE', 'SP', 'MS', 'BA', 'RN', 'ES', 'PB', 'PI', 'RJ', 'AC', 'MA', 'RR', 'SE', 'GO', 'MT', 'PR', 'CE']
const cidades: Record<string, string[]> = {
  MG: ['Belo Horizonte', 'Contagem', 'Uberlândia'], DF: ['Taguatinga', 'Gama'], RS: ['Porto Alegre', 'Caxias do Sul'], RO: ['Porto Velho', 'Ji-Paraná'],
  PE: ['Recife', 'Caruaru'], SP: ['São Paulo', 'Campinas'], MS: ['Campo Grande', 'Dourados'], BA: ['Salvador', 'Feira de Santana'], RN: ['Natal', 'Mossoró'],
  ES: ['Vitória', 'Serra'], PB: ['João Pessoa'], PI: ['Teresina'], RJ: ['Rio de Janeiro', 'Niterói'], AC: ['Rio Branco'], MA: ['São Luís'], RR: ['Boa Vista'],
  SE: ['Aracaju'], GO: ['Goiânia'], MT: ['Cuiabá'], PR: ['Curitiba'], CE: ['Fortaleza'],
}
const areas = ['Desenvolvimento de Sistemas', 'Eletrônica e Automação', 'Gerencial', 'Metalmecânica', 'Segurança', 'Sistemas de Energia', 'Química', 'Construção de Obras', 'Produção Alimentícia', 'Design']
const cursosPorArea: Record<string, string[]> = {
  'Desenvolvimento de Sistemas': ['Técnico em Desenvolvimento de Sistemas', 'Técnico em Informática'], 'Eletrônica e Automação': ['Técnico em Automação Industrial', 'Técnico em Mecatrônica'],
  Gerencial: ['Técnico em Logística', 'Técnico em Administração'], Metalmecânica: ['Técnico em Mecânica', 'Soldador'], Segurança: ['Técnico em Segurança do Trabalho'],
  'Sistemas de Energia': ['Técnico em Eletrotécnica', 'Técnico em Sistemas de Energia Renovável'], Química: ['Técnico em Química'], 'Construção de Obras': ['Técnico em Edificações'],
  'Produção Alimentícia': ['Técnico em Alimentos'], Design: ['Técnico em Design Gráfico'],
}
// Peso de cada CTM por DR (quem atende quem), para as proporções ficarem parecidas com o relatório real
const atende: Record<string, string[]> = {
  MG: ['SC'], DF: ['SC', 'SP', 'GO'], RS: ['SP', 'SC', 'GO'], RO: ['SC', 'SP', 'GO'], PE: ['SP', 'SC', 'GO'], SP: ['SP'], MS: ['SC', 'SP', 'GO', 'PR'], BA: ['SC', 'SP'],
  RN: ['SC', 'SP'], ES: ['SC', 'SP', 'GO'], PB: ['SC'], PI: ['SC', 'SP', 'GO'], RJ: ['SC', 'SP', 'MG'], AC: ['SP', 'SC', 'GO'], MA: ['SC', 'SP'], RR: ['SC'], SE: ['SP', 'SC'],
  GO: ['SC'], MT: ['SC'], PR: ['SP'], CE: ['GO'],
}
const semestres = [['2025-02-03', '2025-07-04'], ['2025-08-04', '2025-12-19'], ['2026-02-02', '2026-07-03'], ['2026-08-03', '2026-12-18']]

let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const pick = <T,>(xs: T[]) => xs[Math.floor(rnd() * xs.length)]

export const turmasMatricula: TurmaMatricula[] = drsAtendidos.flatMap((dr, di) =>
  atende[dr].flatMap((ctm, ci) => {
    const qtd = Math.max(1, Math.round((ci === 0 ? 7 : 3) * (1 - di / 30)))
    return Array.from({ length: qtd }, (_, n): TurmaMatricula => {
      const area = pick(areas)
      const [ini, fim] = pick(semestres)
      const modalidade = n % 4 === 0 && ci > 0 ? pick(modalidadesMatricula.slice(1, 7)) : n % 5 === 3 ? 'Qualificação Profissional' : 'Técnico Semipresencial'
      const cidade = pick(cidades[dr] ?? ['Capital'])
      return {
        id: `${ctm}-${dr}-${n}`, codigo: `CTM${ctm}_D${dr}_${String(n + 1).padStart(2, '0')}${ini.slice(2, 4)}${ini.slice(5, 7) < '07' ? 'S1' : 'S2'}`,
        ctm, dr, escola: `SENAI ${cidade}`, modalidade: dr === 'SP' && n % 3 === 1 ? 'Técnico' : modalidade, area, curso: pick(cursosPorArea[area]),
        inicio: ini, fim, matriculas: Math.round(15 + rnd() * (ci === 0 ? 220 : 90)),
      }
    })
  }),
)

export const semestreDe = (iso: string) => `${iso.slice(0, 4)}/${Number(iso.slice(5, 7)) <= 6 ? 1 : 2}`
export const semestresDisponiveis = [...new Set(turmasMatricula.map((t) => semestreDe(t.inicio)))].sort()
export const anosDisponiveis = [...new Set(turmasMatricula.map((t) => t.inicio.slice(0, 4)))].sort()
