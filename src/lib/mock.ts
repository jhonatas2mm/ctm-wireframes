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

// Contratos geridos pelos Departamentos Regionais (DRs). Números, datas e valores FICTÍCIOS.
export type StatusContrato = 'Vigente' | 'Em elaboração' | 'Encerrado'

export type Contrato = {
  id: string
  numero: string
  dr: string // Departamento Regional (UF)
  vigenciaInicio: string
  vigenciaFim: string
  produtos: number // cursos vinculados
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
