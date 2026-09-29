// Dados falsos para os wireframes (seed). Cada coleção vira persistente com useCollection (src/lib/db.ts).
import { useCollection } from './db'

// Produto = curso do catálogo, no modelo dos Itinerários Nacionais do SENAI.
// Nomes inspirados no catálogo real; códigos e cargas horárias são FICTÍCIOS.
export type Modalidade = 'Técnico' | 'Qualificação Profissional' | 'Aprendizagem Industrial' | 'Aperfeiçoamento'

export type Curso = {
  id: string
  codigo: string
  nome: string
  modalidade: Modalidade
  area: string // área tecnológica
  cargaHoraria: number
}

const cursos: Curso[] = [
  { id: '1', codigo: 'TEC-ELT-001', nome: 'Técnico em Eletrotécnica', modalidade: 'Técnico', area: 'Eletroeletrônica', cargaHoraria: 1200 },
  { id: '2', codigo: 'TEC-MEC-002', nome: 'Técnico em Mecatrônica', modalidade: 'Técnico', area: 'Automação', cargaHoraria: 1200 },
  { id: '3', codigo: 'TEC-AUT-003', nome: 'Técnico em Automação Industrial', modalidade: 'Técnico', area: 'Automação', cargaHoraria: 1200 },
  { id: '4', codigo: 'TEC-DS-004', nome: 'Técnico em Desenvolvimento de Sistemas', modalidade: 'Técnico', area: 'Tecnologia da Informação', cargaHoraria: 1200 },
  { id: '5', codigo: 'TEC-LOG-005', nome: 'Técnico em Logística', modalidade: 'Técnico', area: 'Logística', cargaHoraria: 800 },
  { id: '6', codigo: 'TEC-SEG-006', nome: 'Técnico em Segurança do Trabalho', modalidade: 'Técnico', area: 'Segurança do Trabalho', cargaHoraria: 1200 },
  { id: '7', codigo: 'QP-ELE-101', nome: 'Eletricista Instalador Predial', modalidade: 'Qualificação Profissional', area: 'Eletroeletrônica', cargaHoraria: 200 },
  { id: '8', codigo: 'QP-SOL-102', nome: 'Soldador', modalidade: 'Qualificação Profissional', area: 'Metalmecânica', cargaHoraria: 160 },
  { id: '9', codigo: 'QP-PRG-103', nome: 'Programador de Sistemas', modalidade: 'Qualificação Profissional', area: 'Tecnologia da Informação', cargaHoraria: 200 },
  { id: '10', codigo: 'QP-OPE-104', nome: 'Operador de Empilhadeira', modalidade: 'Qualificação Profissional', area: 'Logística', cargaHoraria: 40 },
  { id: '11', codigo: 'AI-USI-201', nome: 'Mecânico de Usinagem', modalidade: 'Aprendizagem Industrial', area: 'Metalmecânica', cargaHoraria: 800 },
  { id: '12', codigo: 'AI-ASS-202', nome: 'Assistente Administrativo', modalidade: 'Aprendizagem Industrial', area: 'Gestão', cargaHoraria: 400 },
  { id: '13', codigo: 'AI-ELE-203', nome: 'Eletricista de Manutenção Eletroeletrônica', modalidade: 'Aprendizagem Industrial', area: 'Eletroeletrônica', cargaHoraria: 800 },
  { id: '14', codigo: 'AP-NR10-301', nome: 'NR-10 Segurança em Instalações Elétricas', modalidade: 'Aperfeiçoamento', area: 'Segurança do Trabalho', cargaHoraria: 40 },
  { id: '15', codigo: 'AP-CLP-302', nome: 'Controladores Lógicos Programáveis', modalidade: 'Aperfeiçoamento', area: 'Automação', cargaHoraria: 60 },
]

export const useCursos = () => useCollection<Curso>('cursos', cursos)

// Termos de Acordo Administrativo (TAA): contrato guarda-chuva firmado com cada Departamento Regional (DR);
// os produtos (cursos) são vinculados ao TAA depois. Números, datas e valores FICTÍCIOS.
export type StatusContrato = 'Vigente' | 'Em elaboração' | 'Encerrado'

export type Contrato = {
  id: string
  numero: string
  dr: string // Departamento Regional (UF)
  vigenciaInicio: string
  vigenciaFim: string
  valor: number // valor global (R$)
  signatarios?: { parte: string; nome: string; cargo: string }[]
  anexoAssinado?: string // TAA assinado fora do sistema (anexado)
  status: StatusContrato
}

const contratos: Contrato[] = [
  { id: '1', numero: '001/2026', dr: 'SP', vigenciaInicio: '01/02/2026', vigenciaFim: '31/01/2027', valor: 1250000, status: 'Vigente' },
  { id: '2', numero: '002/2026', dr: 'MG', vigenciaInicio: '15/03/2026', vigenciaFim: '14/03/2027', valor: 860000, status: 'Vigente' },
  { id: '3', numero: '003/2026', dr: 'RS', vigenciaInicio: '01/04/2026', vigenciaFim: '31/03/2027', valor: 540000, status: 'Vigente' },
  { id: '4', numero: '004/2026', dr: 'BA', vigenciaInicio: '01/10/2026', vigenciaFim: '30/09/2027', valor: 420000, status: 'Em elaboração' },
  { id: '5', numero: '005/2026', dr: 'PR', vigenciaInicio: '01/06/2026', vigenciaFim: '31/05/2027', valor: 910000, status: 'Vigente' },
  { id: '6', numero: '006/2026', dr: 'PE', vigenciaInicio: '01/11/2026', vigenciaFim: '31/10/2027', valor: 380000, status: 'Em elaboração' },
  { id: '7', numero: '014/2025', dr: 'SC', vigenciaInicio: '01/03/2025', vigenciaFim: '28/02/2026', valor: 670000, status: 'Encerrado' },
  { id: '8', numero: '021/2025', dr: 'GO', vigenciaInicio: '01/07/2025', vigenciaFim: '30/06/2026', valor: 450000, status: 'Encerrado' },
]

export const useContratos = () => useCollection<Contrato>('contratos-v2', contratos)

// Editais: oferta de cursos em CTMs (estados), com os DRs credenciados a executá-los. Dados FICTÍCIOS.
// Área, modalidade e CH vêm do catálogo (fixas); só o valor é definido por curso no edital.
export type CursoEdital = { nome: string; area: string; modalidade: string; cargaHoraria: number; valor: number; drs: string[] } // drs = DRs credenciados no curso

export type Edital = {
  id: string
  numero: string
  ctm: string[] // UFs dos CTMs
  cursos: CursoEdital[]
  cargaHoraria: number // soma das CH dos cursos
  valor: number // soma dos valores dos cursos (R$)
  drs: string[] // DRs credenciados (união dos DRs dos cursos)
  vigenciaInicio: string // dd/mm/aaaa
  vigenciaFim: string
}

const ce = (nome: string, area: string, modalidade: string, cargaHoraria: number, valor: number, drs: string[]): CursoEdital => ({ nome, area, modalidade, cargaHoraria, valor, drs })
const edital = (id: string, numero: string, ctm: string[], cursos: CursoEdital[], vigencia: [string, string]): Edital => ({
  id, numero, ctm, cursos, drs: [...new Set(cursos.flatMap((c) => c.drs))], vigenciaInicio: vigencia[0], vigenciaFim: vigencia[1],
  cargaHoraria: cursos.reduce((t, c) => t + c.cargaHoraria, 0),
  valor: cursos.reduce((t, c) => t + c.valor, 0),
})

const editais: Edital[] = [
  edital('1', 'ED-001/2026', ['SP', 'RJ'], [ce('Técnico em Mecatrônica', 'Automação', 'Técnico', 1200, 4800, ['SP', 'MG']), ce('Técnico em Automação Industrial', 'Automação', 'Técnico', 1200, 4800, ['SP', 'MG']), ce('Técnico em Eletrotécnica', 'Eletroeletrônica', 'Técnico', 1200, 4500, ['MG', 'RJ']), ce('Técnico em Manutenção Automotiva', 'Automotiva', 'Técnico', 1200, 4600, ['MG']), ce('Técnico em Logística', 'Logística', 'Técnico', 800, 3200, ['SP', 'MG']), ce('Técnico em Segurança do Trabalho', 'Segurança do Trabalho', 'Técnico', 1200, 4200, ['MG'])], ['01/02/2026', '31/01/2027']),
  edital('2', 'ED-002/2026', ['MG'], [ce('Soldador', 'Metalmecânica', 'Qualificação Profissional', 160, 1280, ['MG']), ce('Eletricista Instalador Predial', 'Eletroeletrônica', 'Qualificação Profissional', 200, 1500, ['MG']), ce('Mecânico de Manutenção de Máquinas', 'Metalmecânica', 'Qualificação Profissional', 240, 1800, ['MG']), ce('Operador de Processos Químicos', 'Química', 'Qualificação Profissional', 160, 1200, ['MG']), ce('Pedreiro de Alvenaria', 'Construção Civil', 'Qualificação Profissional', 160, 960, ['MG']), ce('Assistente Administrativo', 'Gestão', 'Qualificação Profissional', 160, 900, ['MG']), ce('Desenhista de Produtos Gráficos', 'Tecnologia Gráfica', 'Qualificação Profissional', 200, 1400, ['MG'])], ['01/03/2026', '28/02/2027']),
  edital('3', 'ED-003/2026', ['RS'], [ce('Mecânico de Usinagem', 'Metalmecânica', 'Aprendizagem Industrial', 800, 5600, ['RS', 'SC', 'PR'])], ['01/06/2026', '31/05/2027']),
  edital('4', 'ED-004/2026', ['PR'], [ce('Controladores Lógicos Programáveis', 'Automação', 'Aperfeiçoamento', 60, 540, ['PR'])], ['01/08/2026', '31/12/2026']),
  edital('5', 'ED-005/2026', ['SP'], [ce('Técnico em Desenvolvimento de Sistemas', 'Tecnologia da Informação', 'Técnico', 1200, 10200, ['SP', 'MG']), ce('Programador Front-End', 'Tecnologia da Informação', 'Qualificação Profissional', 240, 2400, ['SP', 'MG']), ce('Ciência de Dados', 'Tecnologia da Informação', 'Aperfeiçoamento', 80, 960, ['MG'])], ['01/01/2026', '31/12/2026']),
  edital('6', 'ED-006/2026', ['BA'], [ce('Operador de Empilhadeira', 'Logística', 'Qualificação Profissional', 40, 320, ['BA', 'PE'])], ['15/09/2026', '14/09/2027']),
]

export const useEditais = () => useCollection<Edital>('editais-v8', editais)

// TAAs da DR logada (perfil Supervisor = SENAI-MG) com outras DRs. Dados FICTÍCIOS.
export type TaaDr = {
  id: string
  numero: string
  drParceira: string // UF da outra DR
  vigenciaInicio: string
  vigenciaFim: string
  cursos: number
  status: StatusContrato
}

const taasDr: TaaDr[] = [
  { id: '1', numero: '101/2026', drParceira: 'SP', vigenciaInicio: '01/03/2026', vigenciaFim: '28/02/2027', cursos: 4, status: 'Vigente' },
  { id: '2', numero: '102/2026', drParceira: 'RJ', vigenciaInicio: '15/04/2026', vigenciaFim: '14/04/2027', cursos: 2, status: 'Vigente' },
  { id: '3', numero: '103/2026', drParceira: 'ES', vigenciaInicio: '—', vigenciaFim: '—', cursos: 0, status: 'Em elaboração' },
  { id: '4', numero: '087/2025', drParceira: 'GO', vigenciaInicio: '01/02/2025', vigenciaFim: '31/01/2026', cursos: 3, status: 'Encerrado' },
]

export const useTaasDr = () => useCollection<TaaDr>('taas-dr', taasDr)

// Unidades Curriculares (UCs) de cada curso do Itinerário Nacional, por id do curso. Nomes e CH FICTÍCIOS.
export type UC = { nome: string; cargaHoraria: number }
export const ucsDoCurso: Record<string, UC[]> = {
  '1': [{ nome: 'Fundamentos de Eletricidade', cargaHoraria: 160 }, { nome: 'Instalações Elétricas', cargaHoraria: 240 }, { nome: 'Máquinas Elétricas', cargaHoraria: 240 }, { nome: 'Sistemas de Potência', cargaHoraria: 280 }, { nome: 'Projeto Integrador', cargaHoraria: 280 }],
  '2': [{ nome: 'Fundamentos de Mecânica', cargaHoraria: 200 }, { nome: 'Eletrônica Aplicada', cargaHoraria: 240 }, { nome: 'Sistemas Pneumáticos e Hidráulicos', cargaHoraria: 240 }, { nome: 'Robótica Industrial', cargaHoraria: 240 }, { nome: 'Projeto Integrador', cargaHoraria: 280 }],
  '3': [{ nome: 'Instrumentação Industrial', cargaHoraria: 240 }, { nome: 'Controladores Lógicos Programáveis', cargaHoraria: 280 }, { nome: 'Redes Industriais', cargaHoraria: 200 }, { nome: 'Sistemas Supervisórios', cargaHoraria: 200 }, { nome: 'Projeto Integrador', cargaHoraria: 280 }],
  '4': [{ nome: 'Lógica de Programação', cargaHoraria: 200 }, { nome: 'Banco de Dados', cargaHoraria: 200 }, { nome: 'Desenvolvimento Web', cargaHoraria: 280 }, { nome: 'Desenvolvimento Mobile', cargaHoraria: 240 }, { nome: 'Projeto Integrador', cargaHoraria: 280 }],
  '5': [{ nome: 'Gestão de Estoques', cargaHoraria: 200 }, { nome: 'Transportes e Distribuição', cargaHoraria: 200 }, { nome: 'Planejamento Logístico', cargaHoraria: 200 }, { nome: 'Projeto Integrador', cargaHoraria: 200 }],
  '6': [{ nome: 'Legislação e Normas', cargaHoraria: 240 }, { nome: 'Higiene Ocupacional', cargaHoraria: 280 }, { nome: 'Prevenção de Acidentes', cargaHoraria: 280 }, { nome: 'Gestão de SST', cargaHoraria: 200 }, { nome: 'Projeto Integrador', cargaHoraria: 200 }],
  '7': [{ nome: 'Eletricidade Básica', cargaHoraria: 60 }, { nome: 'Instalações Prediais', cargaHoraria: 100 }, { nome: 'NR-10 Básico', cargaHoraria: 40 }],
  '8': [{ nome: 'Processos de Soldagem', cargaHoraria: 60 }, { nome: 'Soldagem com Eletrodo Revestido', cargaHoraria: 60 }, { nome: 'Segurança na Soldagem', cargaHoraria: 40 }],
  '9': [{ nome: 'Lógica de Programação', cargaHoraria: 80 }, { nome: 'Programação Orientada a Objetos', cargaHoraria: 120 }],
  '10': [{ nome: 'Operação de Empilhadeira', cargaHoraria: 30 }, { nome: 'Segurança na Movimentação de Cargas', cargaHoraria: 10 }],
  '11': [{ nome: 'Desenho Técnico', cargaHoraria: 120 }, { nome: 'Usinagem Convencional', cargaHoraria: 360 }, { nome: 'Metrologia', cargaHoraria: 120 }, { nome: 'Prática Profissional', cargaHoraria: 200 }],
  '12': [{ nome: 'Rotinas Administrativas', cargaHoraria: 160 }, { nome: 'Comunicação Empresarial', cargaHoraria: 120 }, { nome: 'Prática Profissional', cargaHoraria: 120 }],
  '13': [{ nome: 'Eletricidade Industrial', cargaHoraria: 240 }, { nome: 'Manutenção Eletroeletrônica', cargaHoraria: 360 }, { nome: 'Prática Profissional', cargaHoraria: 200 }],
  '14': [{ nome: 'Riscos em Instalações Elétricas', cargaHoraria: 20 }, { nome: 'Medidas de Controle e Primeiros Socorros', cargaHoraria: 20 }],
  '15': [{ nome: 'Arquitetura de CLPs', cargaHoraria: 20 }, { nome: 'Programação Ladder', cargaHoraria: 40 }],
}

// Propostas da DR ofertante para uma DR contratante: cursos importados do Itinerário Nacional (cada curso só uma vez),
// com valor previsto por curso.
export type CursoProposta = { cursoId: string; codigo: string; nome: string; modalidade: string; area: string; cargaHoraria: number; valorPrevisto: number }
// Fluxo: Salvar → Em elaboração; Salvar e enviar → Em análise (DR contratante);
// contratante aceita → Aceita pelo contratante; o criador também aceita → Aceita.
export type StatusProposta = 'Em elaboração' | 'Em análise' | 'Aceita pelo contratante' | 'Aceita' | 'Recusada'
export type Produto = { id: string; numero: string; drOfertante: string; drContratante: string; cursos: CursoProposta[]; cadastradoEm: string; status?: StatusProposta; documentos?: string[]; feedback?: string; edital?: string; vigenciaInicio?: string; vigenciaFim?: string; criadoPor?: string } // vigência dd/mm/aaaa; edital = nº do edital a que a proposta pertence; criadoPor = perfil que abriu
const cp = (cursoId: string, valorPrevisto: number): CursoProposta => {
  const c = cursos.find((x) => x.id === cursoId)!
  return { cursoId, codigo: c.codigo, nome: c.nome, modalidade: c.modalidade, area: c.area, cargaHoraria: c.cargaHoraria, valorPrevisto }
}
const propostas: Produto[] = [
  { id: '1', numero: 'PC-MG-001/2026', edital: 'ED-001/2026', status: 'Aceita', drOfertante: 'MG', drContratante: 'SP', cursos: [cp('2', 9600), cp('3', 9600)], vigenciaInicio: '01/04/2026', vigenciaFim: '31/03/2027', cadastradoEm: '2026-03-10T10:00:00Z' },
  { id: '2', numero: 'PC-MG-002/2026', edital: 'ED-002/2026', status: 'Aceita', drOfertante: 'MG', drContratante: 'RJ', cursos: [cp('8', 1280), cp('7', 1600), cp('10', 320)], vigenciaInicio: '01/05/2026', vigenciaFim: '30/04/2027', cadastradoEm: '2026-04-22T10:00:00Z' },
  { id: '3', numero: 'PC-MG-003/2026', edital: 'ED-001/2026', status: 'Aceita', drOfertante: 'MG', drContratante: 'ES', cursos: [cp('4', 10200)], vigenciaInicio: '01/07/2026', vigenciaFim: '30/06/2027', cadastradoEm: '2026-06-05T10:00:00Z' },
  { id: '4', numero: 'PC-MG-004/2026', edital: 'ED-005/2026', status: 'Em elaboração', drOfertante: 'MG', drContratante: 'GO', cursos: [cp('11', 5600), cp('14', 400)], vigenciaInicio: '01/10/2026', vigenciaFim: '30/09/2027', cadastradoEm: '2026-08-18T10:00:00Z' },
]
export const useProdutos = () => useCollection<Produto>('produtos-v14', propostas)

// Cursos criados pela Supervisor em Gestão de Portfólio: módulos → unidades curriculares com CH.
export type UnidadeCurricular = { nome: string; cargaHoraria: number }
export type Modulo = { nome: string; unidades: UnidadeCurricular[] }
export type CursoDr = { id: string; nome: string; modulos: Modulo[]; criadoEm: string; edital?: string; area?: string; modalidade?: string; cargaHorariaEdital?: number
  versao?: number // 1 = original
  origemId?: string // id da v1 (a "mãe"); ausente na própria v1
  baseadaEm?: number // versão da qual esta foi copiada
}

export const chTotal = (c: { modulos: Modulo[] }) => c.modulos.reduce((t, m) => t + m.unidades.reduce((u, x) => u + x.cargaHoraria, 0), 0)
const uc = (...nomes: string[]) => nomes.map((nome) => ({ nome, cargaHoraria: 0 }))
const cursosDr: CursoDr[] = [
  { id: 'soldador-1', nome: 'Soldador', edital: 'ED-002/2026', area: 'Metalmecânica', modalidade: 'Qualificação Profissional', cargaHorariaEdital: 160, versao: 1, criadoEm: '2026-04-02T10:00:00Z',
    modulos: [{ nome: 'Fundamentos', unidades: uc('Segurança em soldagem', 'Leitura de desenho técnico') }, { nome: 'Processos', unidades: uc('Soldagem com eletrodo revestido', 'Soldagem MIG/MAG') }] },
  { id: 'soldador-2', nome: 'Soldador', edital: 'ED-002/2026', area: 'Metalmecânica', modalidade: 'Qualificação Profissional', cargaHorariaEdital: 160, versao: 2, origemId: 'soldador-1', baseadaEm: 1, criadoEm: '2026-07-15T10:00:00Z',
    modulos: [{ nome: 'Fundamentos', unidades: uc('Segurança em soldagem', 'Leitura de desenho técnico', 'Metrologia') }, { nome: 'Processos', unidades: uc('Soldagem com eletrodo revestido', 'Soldagem MIG/MAG', 'Soldagem TIG') }] },
  { id: 'eletricista-1', nome: 'Eletricista Instalador Predial', edital: 'ED-002/2026', area: 'Eletroeletrônica', modalidade: 'Qualificação Profissional', cargaHorariaEdital: 200, versao: 1, criadoEm: '2026-04-05T10:00:00Z',
    modulos: [{ nome: 'Básico', unidades: uc('Eletricidade básica', 'NR-10') }, { nome: 'Instalações', unidades: uc('Circuitos residenciais', 'Quadros de distribuição') }] },
]
export const useCursosDr = () => useCollection<CursoDr>('cursos-dr-v3', cursosDr)

// DRs (Departamentos Regionais) geridos pelo DN. Dados FICTÍCIOS.
export type StatusDr = 'Ativo' | 'Inativo'
export type Dr = { id: string; uf: string; nome: string; regiao: string; responsavel: string; email: string; telefone: string; status: StatusDr }
export const regioes: Record<string, string> = {
  AC: 'Norte', AM: 'Norte', AP: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste', PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
  DF: 'Centro-Oeste', GO: 'Centro-Oeste', MS: 'Centro-Oeste', MT: 'Centro-Oeste',
  ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
  PR: 'Sul', RS: 'Sul', SC: 'Sul',
}
const responsaveis = ['Ana Costa', 'Bruno Lima', 'Carla Souza', 'Diego Rocha', 'Elaine Martins', 'Fábio Nunes', 'Gabriela Alves', 'Henrique Dias', 'Isabela Freitas']
// Só parte dos DRs já credenciada; os demais UFs ficam disponíveis em "Nova DR credenciada".
const credenciadas = ['BA', 'DF', 'GO', 'MG', 'PE', 'PR', 'RJ', 'RS', 'SC', 'SP', 'AP', 'RR']
const drs: Dr[] = credenciadas.sort().map((uf, i) => {
  const r = responsaveis[i % responsaveis.length]
  return {
    id: uf, uf, nome: `SENAI-${uf}`, regiao: regioes[uf], responsavel: r,
    email: `${r.split(' ')[0].toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')}@senai${uf.toLowerCase()}.org.br`,
    telefone: `(${String(11 + i * 3).padStart(2, '0')}) 3${String(1000 + i * 137).slice(-4)}-${String(2000 + i * 211).slice(-4)}`,
    status: ['AP', 'RR'].includes(uf) ? 'Inativo' : 'Ativo',
  }
})
export const useDrs = () => useCollection<Dr>('drs-v2', drs)

// Turmas (Gestão da oferta, Supervisor): criadas a partir de um curso de uma proposta.
// A matriz curricular (módulos → UCs) vem do produto; o Supervisor complementa CH e datas de cada UC.
export type UcTurma = { nome: string; chEad: number; chPresencial: number; inicio: string; fim: string; aoVivo: AulaAoVivo[] } // CH a distância + presencial; datas ISO (aaaa-mm-dd)
export type AulaAoVivo = { data: string; inicio: string; fim: string } // horários hh:mm
export const aoVivoTurma = (t: { modulos: { unidades: UcTurma[] }[] }) => t.modulos.reduce((n, m) => n + m.unidades.reduce((k, u) => k + u.aoVivo.length, 0), 0)
// Status da turma, derivado das datas: passou do término da última UC → Finalizada; senão Em andamento.
export type StatusTurma = 'Em andamento' | 'Finalizada'
export const statusTurma = (t: { modulos: { unidades: UcTurma[] }[] }): StatusTurma => {
  const fim = t.modulos.flatMap((m) => m.unidades).map((u) => u.fim).filter(Boolean).sort().at(-1)
  return fim && fim < new Date().toISOString().slice(0, 10) ? 'Finalizada' : 'Em andamento'
}
export const chUc = (u: UcTurma) => (u.chEad || 0) + (u.chPresencial || 0)
export type Turma = {
  id: string
  codigo: string
  propostaId: string
  propostaNumero: string
  drContratante: string
  cursos: string[] // uma oferta pode ter vários cursos da mesma proposta
  modulos: { curso: string; nome: string; unidades: UcTurma[] }[] // módulos de todos os cursos, marcados com o curso de origem
  criadoEm: string
}
const turmas: Turma[] = [
  {
    id: 't1', codigo: 'TU-MG-001/2026', propostaId: '2', propostaNumero: 'PC-MG-002/2026', drContratante: 'RJ', cursos: ['Soldador'], criadoEm: '2026-08-01T10:00:00Z',
    modulos: [
      { curso: 'Soldador', nome: 'Fundamentos', unidades: [{ nome: 'Segurança em soldagem', chEad: 10, chPresencial: 10, inicio: '2026-10-05', fim: '2026-10-09', aoVivo: [{ data: '2026-10-07', inicio: '19:00', fim: '21:00' }] }, { nome: 'Leitura de desenho técnico', chEad: 10, chPresencial: 10, inicio: '2026-10-12', fim: '2026-10-16', aoVivo: [{ data: '2026-10-14', inicio: '19:00', fim: '21:00' }] }] },
      { curso: 'Soldador', nome: 'Processos', unidades: [{ nome: 'Soldagem com eletrodo revestido', chEad: 30, chPresencial: 30, inicio: '2026-10-19', fim: '2026-11-06', aoVivo: [{ data: '2026-10-21', inicio: '19:00', fim: '21:00' }] }, { nome: 'Soldagem MIG/MAG', chEad: 30, chPresencial: 30, inicio: '2026-11-09', fim: '2026-11-27', aoVivo: [{ data: '2026-11-11', inicio: '19:00', fim: '21:00' }] }] },
    ],
  },
  {
    id: 't2', codigo: 'TU-MG-002/2026', propostaId: '1', propostaNumero: 'PC-MG-001/2026', drContratante: 'SP', cursos: ['Técnico em Mecatrônica'], criadoEm: '2026-08-20T10:00:00Z',
    modulos: [
      { curso: 'Técnico em Mecatrônica', nome: 'Básico', unidades: [{ nome: 'Eletricidade aplicada', chEad: 60, chPresencial: 60, inicio: '2026-11-03', fim: '2026-12-11', aoVivo: [{ data: '2026-11-05', inicio: '19:00', fim: '21:00' }] }, { nome: 'Mecânica aplicada', chEad: 60, chPresencial: 60, inicio: '2026-12-14', fim: '2027-02-12', aoVivo: [{ data: '2026-12-16', inicio: '19:00', fim: '21:00' }] }] },
      { curso: 'Técnico em Mecatrônica', nome: 'Específico', unidades: [{ nome: 'Automação e CLP', chEad: 80, chPresencial: 80, inicio: '2027-02-15', fim: '2027-04-09', aoVivo: [{ data: '2027-02-17', inicio: '19:00', fim: '21:00' }] }, { nome: 'Robótica industrial', chEad: 80, chPresencial: 80, inicio: '2027-04-12', fim: '2027-06-04', aoVivo: [{ data: '2027-04-14', inicio: '19:00', fim: '21:00' }] }] },
    ],
  },
]
export const useTurmas = () => useCollection<Turma>('turmas-v7', turmas)

// Super admin: usuários do sistema, permissões por perfil e trilha de auditoria.
export type StatusUsuario = 'Ativo' | 'Inativo'
export type Usuario = { id: string; nome: string; email: string; perfil: string; dr: string; status: StatusUsuario; ultimoAcesso: string }
const usuarios: Usuario[] = [
  { id: 'u1', nome: 'Maria Silva', email: 'maria.silva@senai.br', perfil: 'DN', dr: 'DN', status: 'Ativo', ultimoAcesso: '27/09/2026 17:42' },
  { id: 'u2', nome: 'Carlos Andrade', email: 'carlos.andrade@senaimg.org.br', perfil: 'CTM: Supervisor', dr: 'MG', status: 'Ativo', ultimoAcesso: '28/09/2026 09:10' },
  { id: 'u3', nome: 'Juliana Pereira', email: 'juliana.pereira@senaimg.org.br', perfil: 'CTM: Comercial', dr: 'MG', status: 'Ativo', ultimoAcesso: '26/09/2026 14:05' },
  { id: 'u7', nome: 'Paulo Mendes', email: 'paulo.mendes@senaimg.org.br', perfil: 'DR solicitante', dr: 'MG', status: 'Ativo', ultimoAcesso: '28/09/2026 11:00' },
  { id: 'u5', nome: 'Roberto Lima', email: 'roberto.lima@senaisp.org.br', perfil: 'CTM: Supervisor', dr: 'SP', status: 'Inativo', ultimoAcesso: '02/08/2026 08:15' },
  { id: 'u6', nome: 'Fernanda Costa', email: 'fernanda.costa@senai.br', perfil: 'Super admin', dr: 'DN', status: 'Ativo', ultimoAcesso: '28/09/2026 10:02' },
]
export const useUsuarios = () => useCollection<Usuario>('usuarios-v5', usuarios)

// Permissões: por perfil, as telas (path do menu) que ele acessa.
export type PermissaoPerfil = { id: string; perfil: string; telas: string[] }
const permissoes: PermissaoPerfil[] = [
  { id: 'DN', perfil: 'DN', telas: ['/painel-dn', '/drs', '/dashboard', '/editais'] },
  { id: 'CTM: Supervisor', perfil: 'CTM: Supervisor', telas: ['/painel-ctm', '/meus-taas', '/gestao-produtos', '/produtos', '/oferta'] },
  { id: 'DR solicitante', perfil: 'DR solicitante', telas: ['/acompanhamento', '/contratos', '/turmas-ead', '/alunos'] },
  { id: 'CTM: Comercial', perfil: 'CTM: Comercial', telas: ['/painel-comercial', '/meus-taas', '/gestao-produtos', '/produtos', '/oferta'] },
  { id: 'Super admin', perfil: 'Super admin', telas: ['/drs', '/dashboard', '/editais', '/meus-taas', '/gestao-produtos', '/produtos', '/oferta', '/acompanhamento', '/contratos', '/turmas-ead', '/alunos', '/admin/usuarios', '/admin/perfis', '/admin/auditoria', '/admin/logs'] },
]
export const usePermissoes = () => useCollection<PermissaoPerfil>('permissoes-v7', permissoes)

export type Evento = { id: string; quando: string; usuario: string; perfil: string; acao: string; alvo: string }
const auditoria: Evento[] = [
  { id: 'e1', quando: '28/09/2026 10:02', usuario: 'Fernanda Costa', perfil: 'Super admin', acao: 'Login', alvo: '—' },
  { id: 'e2', quando: '28/09/2026 09:15', usuario: 'Carlos Andrade', perfil: 'CTM: Supervisor', acao: 'Criação', alvo: 'Oferta TU-MG-002/2026' },
  { id: 'e3', quando: '27/09/2026 17:40', usuario: 'Maria Silva', perfil: 'DN', acao: 'Alteração', alvo: 'Edital ED-002/2026' },
  { id: 'e4', quando: '27/09/2026 16:22', usuario: 'Juliana Pereira', perfil: 'CTM: Comercial', acao: 'Aceite', alvo: 'Proposta PC-MG-002/2026' },
  { id: 'e5', quando: '26/09/2026 11:08', usuario: 'Fernanda Costa', perfil: 'Super admin', acao: 'Inativação', alvo: 'Usuário Roberto Lima' },
  { id: 'e6', quando: '25/09/2026 15:47', usuario: 'Maria Silva', perfil: 'DN', acao: 'Criação', alvo: 'TAA TAA-004/2026' },
  { id: 'e7', quando: '24/09/2026 09:30', usuario: 'Fernanda Costa', perfil: 'Super admin', acao: 'Alteração', alvo: 'Permissões do perfil Comercial' },
]
export const useAuditoria = () => useCollection<Evento>('auditoria-v2', auditoria)

// ── Acompanhamento (DR solicitante) ─────────────────────────────────────────
// A DR solicitante vende o curso a uma empresa e contrata o CTM para operar o EAD (tutoria e monitoria).
// Datas ISO (aaaa-mm-dd). HOJE fixo para o protótipo.
export const HOJE = '2026-09-28'
const dia = 86_400_000
export const diasEntre = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / dia)
export const dataBr = (iso: string) => iso.split('-').reverse().join('/')

export type StatusContratoCtm = 'Vigente' | 'Em elaboração' | 'Encerrado'
export type ContratoCtm = { id: string; numero: string; dr: string; empresa: string; cnpj: string; cursos: string[]; vagas: number; valor: number; inicio: string; fim: string; status: StatusContratoCtm }
const contratosCtm: ContratoCtm[] = [
  { id: 'c1', dr: 'MG', numero: 'CT-MG-001/2026', empresa: 'Panvel Farmácias', cnpj: '92.665.611/0001-77', cursos: ['Excel Avançado (EAD)', 'Atendimento ao Cliente (EAD)'], vagas: 60, valor: 48000, inicio: '2026-03-01', fim: '2027-02-28', status: 'Vigente' },
  { id: 'c2', dr: 'MG', numero: 'CT-MG-002/2026', empresa: 'Usiminas', cnpj: '60.894.730/0001-05', cursos: ['NR-10 Segurança em Eletricidade (EAD)', 'Leitura e Interpretação de Desenho (EAD)'], vagas: 50, valor: 62500, inicio: '2026-05-01', fim: '2027-04-30', status: 'Vigente' },
  { id: 'c3', dr: 'MG', numero: 'CT-MG-003/2026', empresa: 'Fiat Chrysler', cnpj: '16.701.716/0001-56', cursos: ['Lean Manufacturing (EAD)'], vagas: 30, valor: 27000, inicio: '2026-01-15', fim: '2026-07-31', status: 'Encerrado' },
  { id: 'c5', dr: 'SP', numero: 'CT-SP-001/2026', empresa: 'Natura', cnpj: '71.673.990/0001-77', cursos: ['Excel Avançado (EAD)', 'Gestão de Projetos (EAD)'], vagas: 45, valor: 40500, inicio: '2026-04-01', fim: '2027-03-31', status: 'Vigente' },
  { id: 'c6', dr: 'BA', numero: 'CT-BA-001/2026', empresa: 'Braskem', cnpj: '42.150.391/0001-70', cursos: ['NR-10 Segurança em Eletricidade (EAD)'], vagas: 30, valor: 33000, inicio: '2026-07-01', fim: '2027-06-30', status: 'Vigente' },
  { id: 'c4', dr: 'MG', numero: 'CT-MG-004/2026', empresa: 'Cemig', cnpj: '17.155.730/0001-64', cursos: ['Gestão de Projetos (EAD)'], vagas: 40, valor: 36000, inicio: '2026-11-01', fim: '2027-10-31', status: 'Em elaboração' },
]
export const useContratosCtm = () => useCollection<ContratoCtm>('contratos-ctm-v2', contratosCtm)

export type StatusTurmaEad = 'A iniciar' | 'Em andamento' | 'Finalizada'
export type TurmaEad = { id: string; codigo: string; contratoId: string; curso: string; tutor: string; inicio: string; fim: string }
const turmasEad: TurmaEad[] = [
  { id: 't1', codigo: 'EAD-MG-0101', contratoId: 'c1', curso: 'Excel Avançado (EAD)', tutor: 'Ana Ribeiro', inicio: '2026-08-03', fim: '2026-11-27' },
  { id: 't2', codigo: 'EAD-MG-0102', contratoId: 'c1', curso: 'Atendimento ao Cliente (EAD)', tutor: 'Bruno Tavares', inicio: '2026-09-01', fim: '2026-12-18' },
  { id: 't3', codigo: 'EAD-MG-0201', contratoId: 'c2', curso: 'NR-10 Segurança em Eletricidade (EAD)', tutor: 'Cláudia Moura', inicio: '2026-06-01', fim: '2026-10-30' },
  { id: 't4', codigo: 'EAD-MG-0202', contratoId: 'c2', curso: 'Leitura e Interpretação de Desenho (EAD)', tutor: 'Diego Santos', inicio: '2026-10-13', fim: '2027-02-26' },
  { id: 't6', codigo: 'EAD-SP-0101', contratoId: 'c5', curso: 'Excel Avançado (EAD)', tutor: 'Fábio Nunes', inicio: '2026-08-17', fim: '2026-12-11' },
  { id: 't7', codigo: 'EAD-SP-0102', contratoId: 'c5', curso: 'Gestão de Projetos (EAD)', tutor: 'Gisele Araújo', inicio: '2026-09-08', fim: '2027-01-29' },
  { id: 't8', codigo: 'EAD-BA-0101', contratoId: 'c6', curso: 'NR-10 Segurança em Eletricidade (EAD)', tutor: 'Hugo Matos', inicio: '2026-07-20', fim: '2026-11-27' },
  { id: 't5', codigo: 'EAD-MG-0301', contratoId: 'c3', curso: 'Lean Manufacturing (EAD)', tutor: 'Elaine Prado', inicio: '2026-02-02', fim: '2026-06-26' },
]
export const useTurmasEad = () => useCollection<TurmaEad>('turmas-ead-v2', turmasEad)
export const statusTurmaEad = (t: TurmaEad): StatusTurmaEad => (HOJE < t.inicio ? 'A iniciar' : HOJE > t.fim ? 'Finalizada' : 'Em andamento')
// Progresso esperado da turma pelo calendário (0–100).
export const progressoEsperado = (t: TurmaEad) => Math.max(0, Math.min(100, Math.round((diasEntre(t.inicio, HOJE) / diasEntre(t.inicio, t.fim)) * 100)))

export type Portal = 'AVA' | 'Portal do aluno'
export type Acesso = { data: string; portal: Portal; minutos: number }
export type Atividade = { nome: string; nota: number | null } // null = não entregue
export type AlunoEad = { id: string; nome: string; email: string; turmaId: string; progresso: number; atividades: Atividade[]; acessos: Acesso[] } // acessos do mais recente ao mais antigo
export type SituacaoAluno = 'Em dia' | 'Em risco' | 'Evadido'

const nomes = ['Aline Costa', 'Bruno Farias', 'Camila Duarte', 'Daniel Rocha', 'Eduarda Lima', 'Felipe Nogueira', 'Gabriela Souza', 'Henrique Alves', 'Isabela Martins', 'João Pedro Reis', 'Karina Lopes', 'Lucas Vieira', 'Mariana Teixeira', 'Nathan Oliveira', 'Olívia Barros', 'Pedro Henrique Cruz', 'Rafaela Pinto', 'Samuel Freitas', 'Tatiane Moreira', 'Vinícius Carvalho']
// Gerador determinístico: cada aluno tem um "perfil" (em dia, sem acesso, nota baixa, evadido).
const alunosEad: AlunoEad[] = turmasEad.filter((t) => HOJE >= t.inicio).flatMap((t, ti) =>
  Array.from({ length: 8 }, (_, i) => {
    const n = ti * 8 + i
    const tipo = n % 7 === 3 ? 'evadido' : n % 5 === 1 ? 'sem-acesso' : n % 6 === 2 ? 'nota-baixa' : 'ok'
    const fim = HOJE > t.fim ? t.fim : HOJE
    const esperado = progressoEsperado(t)
    const ultimo = tipo === 'evadido' ? 35 + (n % 10) : tipo === 'sem-acesso' ? 9 + (n % 5) : n % 3
    const acessos: Acesso[] = Array.from({ length: 24 }, (_, k) => ({
      data: new Date(Date.parse(fim) - (ultimo + k + Math.floor(k / 3) * (n % 2)) * dia).toISOString().slice(0, 10),
      portal: ((k + n) % 3 === 0 ? 'Portal do aluno' : 'AVA') as Portal,
      minutos: 20 + ((n * 7 + k * 13) % 70),
    })).filter((a) => a.data >= t.inicio)
    const base = tipo === 'nota-baixa' ? 4 : tipo === 'evadido' ? 5 : 7
    const atividades: Atividade[] = ['Atividade 1', 'Atividade 2', 'Atividade 3', 'Avaliação final'].slice(0, Math.max(1, Math.ceil(esperado / 25))).map((nome, k) => ({
      nome,
      nota: tipo === 'evadido' && k > 0 ? null : Math.min(10, base + ((n + k) % 4) * 0.8),
    }))
    const progresso = Math.max(0, Math.min(100, tipo === 'ok' ? esperado - (n % 4) * 3 : tipo === 'evadido' ? Math.round(esperado / 4) : esperado - 15 - (n % 3) * 5))
    const nome = nomes[n % nomes.length]
    return { id: `a${n + 1}`, nome, email: `${nome.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').replace(/ /g, '.')}@email.com`, turmaId: t.id, progresso, atividades, acessos }
  }),
)
export const useAlunosEad = () => useCollection<AlunoEad>('alunos-ead-v3', alunosEad)

export const mediaAluno = (a: AlunoEad) => {
  const ns = a.atividades.map((x) => x.nota ?? 0)
  return ns.length ? Math.round((ns.reduce((s, x) => s + x, 0) / ns.length) * 10) / 10 : 0
}
export const diasSemAcesso = (a: AlunoEad) => (a.acessos[0] ? diasEntre(a.acessos[0].data, HOJE) : 999)
// Motivos que pedem atitude da DR (vazio = em dia). Regras em docs/fluxo.md.
export const alertasAluno = (a: AlunoEad, t: TurmaEad): string[] => {
  if (statusTurmaEad(t) === 'Finalizada') return []
  const m: string[] = []
  const d = diasSemAcesso(a)
  if (!a.acessos.length) m.push('Nunca acessou o portal')
  else if (d > 7) m.push(`Sem acesso há ${d} dias`)
  if (mediaAluno(a) < 6) m.push('Média abaixo de 6')
  if (a.atividades.some((x) => x.nota === null)) m.push('Atividade não entregue')
  if (progressoEsperado(t) - a.progresso > 10) m.push('Progresso atrasado')
  return m
}
export const situacaoAluno = (a: AlunoEad, t: TurmaEad): SituacaoAluno =>
  statusTurmaEad(t) !== 'Finalizada' && diasSemAcesso(a) > 30 ? 'Evadido' : alertasAluno(a, t).length ? 'Em risco' : 'Em dia'

// ── Logs do sistema (Super admin): tudo o que os usuários fazem na plataforma ──
export type AcaoLog = 'Login' | 'Logout' | 'Visualizou' | 'Criou' | 'Editou' | 'Excluiu' | 'Aceitou' | 'Recusou' | 'Exportou' | 'Anexou'
export type Alteracao = { campo: string; antes: string; depois: string }
export type LogSistema = { id: string; quando: string; usuario: string; email: string; perfil: string; dr: string; acao: AcaoLog; modulo: string; registro: string; ip: string; dispositivo: string; alteracoes: Alteracao[] } // quando ISO
const pessoasLog = [
  { usuario: 'Fernanda Costa', email: 'fernanda.costa@senai.br', perfil: 'Super admin', dr: 'DN' },
  { usuario: 'Carlos Andrade', email: 'carlos.andrade@senaimg.org.br', perfil: 'CTM: Supervisor', dr: 'MG' },
  { usuario: 'Juliana Pereira', email: 'juliana.pereira@senaimg.org.br', perfil: 'CTM: Comercial', dr: 'MG' },
  { usuario: 'Maria Silva', email: 'maria.silva@senai.br', perfil: 'DN', dr: 'DN' },
  { usuario: 'Paulo Mendes', email: 'paulo.mendes@senaimg.org.br', perfil: 'DR solicitante', dr: 'MG' },
]
const acoesLog: [AcaoLog, string, string, Alteracao[]][] = [
  ['Login', 'Autenticação', '—', []],
  ['Criou', 'Gestão de propostas', 'Proposta PC-MG-004/2026', [{ campo: 'Status', antes: '—', depois: 'Em elaboração' }]],
  ['Editou', 'Gestão de Editais', 'Edital ED-002/2026', [{ campo: 'Vigência (fim)', antes: '31/01/2027', depois: '28/02/2027' }, { campo: 'Valor', antes: 'R$ 8.640,00', depois: 'R$ 9.040,00' }]],
  ['Visualizou', 'Alunos', 'Aluno Daniel Rocha', []],
  ['Aceitou', 'Gestão de propostas', 'Proposta PC-MG-002/2026', [{ campo: 'Status', antes: 'Em análise', depois: 'Aceita' }]],
  ['Exportou', 'Gestão de Contratos', 'Contratos (4 registros)', []],
  ['Anexou', 'Gestão de TAA', 'TAA 101/2026', [{ campo: 'TAA assinado', antes: '—', depois: 'TAA-101-2026-assinado.pdf' }, { campo: 'Status', antes: 'Em elaboração', depois: 'Vigente' }]],
  ['Excluiu', 'Gestão de Portfólio', 'Produto Soldador (versão 1)', []],
  ['Recusou', 'Gestão de propostas', 'Proposta PC-MG-003/2026', [{ campo: 'Status', antes: 'Em análise', depois: 'Recusada' }, { campo: 'Feedback', antes: '—', depois: 'Valor acima do previsto no edital' }]],
  ['Editou', 'Gestão de usuários', 'Usuário Roberto Lima', [{ campo: 'Status', antes: 'Ativo', depois: 'Inativo' }]],
  ['Visualizou', 'Painel', 'Painel da DR solicitante', []],
  ['Logout', 'Autenticação', '—', []],
]
const logs: LogSistema[] = Array.from({ length: 48 }, (_, i) => {
  const [acao, modulo, registro, alteracoes] = acoesLog[i % acoesLog.length]
  const p = pessoasLog[(i * 3) % pessoasLog.length]
  return {
    id: `l${i + 1}`,
    quando: new Date(Date.parse('2026-09-28T11:30:00Z') - i * 53 * 60_000).toISOString(),
    ...p, acao, modulo, registro, alteracoes,
    ip: `189.40.${(i * 17) % 255}.${(i * 29) % 255}`,
    dispositivo: ['Chrome · Windows', 'Safari · macOS', 'Edge · Windows', 'Chrome · Android'][i % 4],
  }
})
export const useLogs = () => useCollection<LogSistema>('logs-v2', logs)
