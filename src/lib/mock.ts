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
  produtos: number // cursos vinculados
  valor?: number // valor global (R$)
  signatarios?: { parte: string; nome: string; cargo: string }[]
  status: StatusContrato
}

const contratos: Contrato[] = [
  { id: '1', numero: '001/2026', dr: 'SP', vigenciaInicio: '01/02/2026', vigenciaFim: '31/01/2027', produtos: 12, status: 'Vigente' },
  { id: '2', numero: '002/2026', dr: 'MG', vigenciaInicio: '15/03/2026', vigenciaFim: '14/03/2027', produtos: 8, status: 'Vigente' },
  { id: '3', numero: '003/2026', dr: 'RS', vigenciaInicio: '01/04/2026', vigenciaFim: '31/03/2027', produtos: 5, status: 'Vigente' },
  { id: '4', numero: '004/2026', dr: 'BA', vigenciaInicio: '—', vigenciaFim: '—', produtos: 0, status: 'Em elaboração' },
  { id: '5', numero: '005/2026', dr: 'PR', vigenciaInicio: '01/06/2026', vigenciaFim: '31/05/2027', produtos: 9, status: 'Vigente' },
  { id: '6', numero: '006/2026', dr: 'PE', vigenciaInicio: '—', vigenciaFim: '—', produtos: 2, status: 'Em elaboração' },
  { id: '7', numero: '014/2025', dr: 'SC', vigenciaInicio: '01/03/2025', vigenciaFim: '28/02/2026', produtos: 7, status: 'Encerrado' },
  { id: '8', numero: '021/2025', dr: 'GO', vigenciaInicio: '01/07/2025', vigenciaFim: '30/06/2026', produtos: 4, status: 'Encerrado' },
]

export const useContratos = () => useCollection<Contrato>('contratos', contratos)

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
  edital('1', 'ED-001/2026', ['SP', 'RJ'], [ce('Técnico em Mecatrônica', 'Automação', 'Técnico', 1200, 4800, ['SP', 'MG']), ce('Técnico em Automação Industrial', 'Automação', 'Técnico', 1200, 4800, ['SP'])], ['01/02/2026', '31/01/2027']),
  edital('2', 'ED-002/2026', ['MG'], [ce('Soldador', 'Metalmecânica', 'Qualificação Profissional', 160, 1280, ['MG']), ce('Eletricista Instalador Predial', 'Eletroeletrônica', 'Qualificação Profissional', 200, 1500, ['MG'])], ['01/03/2026', '28/02/2027']),
  edital('3', 'ED-003/2026', ['RS'], [ce('Mecânico de Usinagem', 'Metalmecânica', 'Aprendizagem Industrial', 800, 5600, ['RS', 'SC', 'PR'])], ['01/06/2026', '31/05/2027']),
  edital('4', 'ED-004/2026', ['PR'], [ce('Controladores Lógicos Programáveis', 'Automação', 'Aperfeiçoamento', 60, 540, ['PR'])], ['01/08/2026', '31/12/2026']),
  edital('5', 'ED-005/2026', ['SP'], [ce('Técnico em Desenvolvimento de Sistemas', 'Tecnologia da Informação', 'Técnico', 1200, 10200, ['SP'])], ['01/01/2026', '31/12/2026']),
  edital('6', 'ED-006/2026', ['BA'], [ce('Operador de Empilhadeira', 'Logística', 'Qualificação Profissional', 40, 320, ['BA', 'PE'])], ['15/09/2026', '14/09/2027']),
]

export const useEditais = () => useCollection<Edital>('editais-v7', editais)
