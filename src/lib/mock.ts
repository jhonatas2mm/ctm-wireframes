// Dados falsos para os wireframes (seed). Cada coleção vira persistente com useCollection (src/lib/db.ts).
import { useMemo } from 'react'
import { useCollection } from './db'

// Datas: HOJE fixo para o protótipo; datas ISO (aaaa-mm-dd).
export const HOJE = '2026-09-28'
const dia = 86_400_000
export const diasEntre = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / dia)
export const dataBr = (iso: string) => iso.split('-').reverse().join('/')

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
  { id: '16', codigo: 'QP-MMM-105', nome: 'Mecânico de Manutenção de Máquinas', modalidade: 'Qualificação Profissional', area: 'Metalmecânica', cargaHoraria: 240 },
  { id: '17', codigo: 'QP-DPG-106', nome: 'Desenhista de Produtos Gráficos', modalidade: 'Qualificação Profissional', area: 'Tecnologia Gráfica', cargaHoraria: 200 },
]

export const useCursos = () => useCollection<Curso>('cursos-v2', cursos)

// Editais (DN): vigência + ÁREAS TECNOLÓGICAS. O edital não tem cursos, valor nem CH: cada área tem o VALOR POR HORA e
// UM único DR vinculado (a CTM daquela área, a de menor custo). Os cursos do edital vêm do catálogo pela área:
// valor por estudante = valor/hora da área × CH do curso. Dados FICTÍCIOS.
export type AreaEdital = { area: string; valorHora: number; dr: string } // dr = UF do DR (CTM) vinculado à área
// Curso do edital (derivado): curso do catálogo numa área do edital; drs/aprovada = o DR vinculado à área.
export type CursoEdital = { nome: string; area: string; modalidade: string; cargaHoraria: number; valor: number; valorHora: number; drs: string[]; aprovada?: string }
export const aprovadaDe = (c: Pick<CursoEdital, 'drs' | 'aprovada'>) => c.aprovada ?? c.drs[0]

export type Edital = {
  id: string
  numero: string
  areas: AreaEdital[]
  cursos: CursoEdital[] // derivado das áreas (catálogo)
  drs: string[] // derivado: DRs vinculados às áreas
  vigenciaInicio: string // dd/mm/aaaa
  vigenciaFim: string
}
export const areasTecnologicas = ['Automação', 'Automotiva', 'Construção Civil', 'Eletroeletrônica', 'Gestão', 'Logística', 'Metalmecânica', 'Química', 'Segurança do Trabalho', 'Tecnologia da Informação', 'Tecnologia Gráfica']
export const cursosDasAreas = (areas: AreaEdital[]): CursoEdital[] =>
  cursos.flatMap((c) => {
    const a = areas.find((x) => x.area === c.area)
    return a ? [{ nome: c.nome, area: c.area, modalidade: c.modalidade, cargaHoraria: c.cargaHoraria, valorHora: a.valorHora, valor: Math.round(a.valorHora * c.cargaHoraria * 100) / 100, drs: [a.dr], aprovada: a.dr }] : []
  })
const completar = <T extends { areas: AreaEdital[] }>(e: T) => ({ ...e, cursos: cursosDasAreas(e.areas), drs: [...new Set(e.areas.map((a) => a.dr))] })
const edital = (id: string, numero: string, areas: AreaEdital[], vigencia: [string, string]): Edital =>
  completar({ id, numero, areas, vigenciaInicio: vigencia[0], vigenciaFim: vigencia[1] })
const ar = (area: string, valorHora: number, dr: string): AreaEdital => ({ area, valorHora, dr })

const editais: Edital[] = [
  edital('1', 'ED-001/2026', [ar('Automação', 4, 'MG'), ar('Eletroeletrônica', 3.75, 'RJ'), ar('Automotiva', 3.85, 'MG'), ar('Logística', 4, 'SP'), ar('Segurança do Trabalho', 3.5, 'MG')], ['01/02/2026', '31/01/2027']),
  edital('2', 'ED-002/2026', [ar('Metalmecânica', 8, 'MG'), ar('Eletroeletrônica', 7.5, 'MG'), ar('Química', 7.5, 'MG'), ar('Construção Civil', 6, 'MG'), ar('Gestão', 5.6, 'MG'), ar('Tecnologia Gráfica', 7, 'MG')], ['01/03/2026', '28/02/2027']),
  edital('3', 'ED-003/2026', [ar('Metalmecânica', 7, 'SC')], ['01/06/2026', '31/05/2027']),
  edital('4', 'ED-004/2026', [ar('Automação', 9, 'PR')], ['01/08/2026', '31/12/2026']),
  edital('5', 'ED-005/2026', [ar('Tecnologia da Informação', 8.5, 'MG')], ['01/01/2026', '31/12/2026']),
  edital('6', 'ED-006/2026', [ar('Logística', 8, 'BA')], ['15/09/2026', '14/09/2027']),
]

// Os cursos e DRs do edital são sempre derivados das áreas (também nos editais criados na tela).
export const useEditais = () => {
  const db = useCollection<Edital>('editais-v10', editais)
  const all = useMemo(() => db.all.map(completar), [db.all])
  return { ...db, all, get: (id?: string) => all.find((e) => e.id === id) }
}

// Contratação da CTM (DR credenciada): um TAA para cada DR específica, com vigência, valor global e os PRODUTOS contratados.
// Normalmente a CTM que ganhou o edital envia o TAA para cada DR; o Gestor da DR avalia. A DR também pode criar o seu.
// A CTM do TAA é a aprovada no edital (menor custo) para esses produtos: produtos de CTMs diferentes = TAAs diferentes.
// TAA (Termo de Acordo Administrativo) entre SENAI e SENAI. SESI fica fora da v1.
// Uma mesma DR pode ser CTM (ofertante) e DR solicitante (contratante). Números, datas e valores FICTÍCIOS.
// Status do TAA/contrato: quem cria ENCAMINHA; a outra parte ANALISA (Em análise) e aceita, retorna para ajuste
// (quem criou ajusta e reencaminha) ou recusa (Cancelado). Quem criou também pode cancelar antes do aceite.
// Normalmente a CTM cria e o Gestor da DR analisa; se a DR criar, quem analisa é a CTM.
// Só o Aceito (com vigência em curso) vale para propostas; o termo assinado é anexado depois do aceite.
export type StatusContrato = 'Encaminhado' | 'Em análise' | 'Retornado' | 'Aceito' | 'Cancelado'
export const statusContrato: StatusContrato[] = ['Encaminhado', 'Em análise', 'Retornado', 'Aceito', 'Cancelado']
const isoDeBr = (br: string) => br.split('/').reverse().join('-')
export const vigenciaEncerrada = (c: { vigenciaFim: string }) => !!c.vigenciaFim && c.vigenciaFim !== '—' && isoDeBr(c.vigenciaFim) < HOJE
export const contratoAtivo = (c: { status: StatusContrato; vigenciaFim: string }) => c.status === 'Aceito' && !vigenciaEncerrada(c)
// Um TAA por edital para cada par CTM × DR solicitante (cancelado não conta). Novo edital = novo TAA para o mesmo par,
// mesmo com outro TAA em andamento.
export const taaDoEdital = (todos: Contrato[], edital: string | null | undefined, ctm: string | null | undefined, contratante: string) =>
  todos.find((c) => !!edital && c.edital === edital && c.dr === ctm && c.contratante === contratante && c.status !== 'Cancelado')
export const emTramitacao = (c: { status: StatusContrato }) => c.status === 'Encaminhado' || c.status === 'Em análise' || c.status === 'Retornado'
// Quem analisa: a outra parte (se a CTM criou, o contratante; senão, a CTM).
export const analisaDe = (c: { origem?: 'Contratante' | 'CTM' }): 'contratante' | 'ctm' => (c.origem === 'CTM' ? 'contratante' : 'ctm')

export type Contrato = {
  id: string
  numero: string
  contratante: string // 'DN' ou UF da DR SENAI solicitante (ex.: 'MG')
  dr: string // UF da CTM contratada
  vigenciaInicio: string
  vigenciaFim: string
  valor: number // valor global (R$)
  edital?: string // nº do edital dos produtos
  gestor?: { nome: string; cargo: string } // Gestor que solicitou (ou aceitou) a contratação (coordenador, interlocutor…)
  origem?: 'Contratante' | 'CTM' // quem criou: o contratante (padrão) ou a CTM, que envia o TAA para a DR (caminho normal)
  enviadoEm?: string // ISO, quando foi encaminhado
  motivo?: string // último motivo (retorno para ajuste, recusa ou cancelamento)
  historico?: Registro[]
  produtos?: ProdutoTaa[]
  signatarios?: { parte: string; nome: string; cargo: string }[]
  anexoAssinado?: string // TAA assinado fora do sistema (anexado)
  status: StatusContrato
}
export type ProdutoTaa = { nome: string; area: string; modalidade: string; cargaHoraria: number; valor: number } // do edital (fixo)
export const nomeParte = (x: string) => (x === 'DN' ? 'SENAI DN' : `SENAI-${x}`)

// Gestor solicitante de exemplo por contratante.
const gestores: Record<string, { nome: string; cargo: string }> = {
  MG: { nome: 'Paulo Mendes', cargo: 'Coordenador' },
  SP: { nome: 'Ricardo Alves', cargo: 'Coordenador' }, RJ: { nome: 'Beatriz Nunes', cargo: 'Interlocutor' }, ES: { nome: 'Marcelo Dias', cargo: 'Coordenador' }, GO: { nome: 'Luana Castro', cargo: 'Interlocutor' }, PE: { nome: 'Sérgio Moura', cargo: 'Coordenador' }, BA: { nome: 'Adriana Lopes', cargo: 'Interlocutor' },
}
const taa = (id: string, numero: string, contratante: string, dr: string, vig: [string, string], valor: number, status: StatusContrato, edital?: string, nomes: string[] = []): Contrato => {
  const e = editais.find((x) => x.numero === edital)
  const produtos = nomes.map((n) => e?.cursos.find((c) => c.nome === n)).filter((c): c is CursoEdital => !!c).map(({ nome, area, modalidade, cargaHoraria, valor }) => ({ nome, area, modalidade, cargaHoraria, valor }))
  return { id, numero, contratante, dr, vigenciaInicio: vig[0], vigenciaFim: vig[1], valor, status, edital, produtos, gestor: gestores[contratante] }
}
const contratos: Contrato[] = [
  // SENAI-MG como DR solicitante contratando outras CTMs
  taa('4', '004/2026', 'MG', 'SC', ['01/03/2026', '28/02/2027'], 480000, 'Aceito', 'ED-003/2026', ['Mecânico de Usinagem']),
  { ...taa('5', '005/2026', 'MG', 'SP', ['01/11/2026', '31/10/2027'], 320000, 'Retornado', 'ED-001/2026', ['Técnico em Logística']), motivo: 'A CTM pede início em 01/02/2027: não há turma de Logística antes disso.', historico: [{ quando: '2026-09-20T10:00:00Z', texto: 'Retornado para ajuste: a CTM pede início em 01/02/2027: não há turma de Logística antes disso.', autor: 'SENAI-SP (CTM)' }, { quando: '2026-09-12T10:00:00Z', texto: 'Encaminhado à CTM', autor: 'Paulo Mendes' }] },
  taa('6', '014/2025', 'MG', 'BA', ['01/03/2025', '28/02/2026'], 270000, 'Aceito', 'ED-006/2026', ['Operador de Empilhadeira']),
  // DRs solicitantes que contrataram a CTM SENAI-MG (base das propostas da CTM)
  taa('7', '006/2026', 'SP', 'MG', ['01/03/2026', '28/02/2027'], 910000, 'Aceito', 'ED-001/2026', ['Técnico em Mecatrônica', 'Técnico em Automação Industrial']),
  taa('8', '007/2026', 'RJ', 'MG', ['15/04/2026', '14/04/2027'], 420000, 'Aceito', 'ED-002/2026', ['Soldador', 'Eletricista Instalador Predial']),
  taa('9', '008/2026', 'ES', 'MG', ['01/06/2026', '31/05/2027'], 380000, 'Aceito', 'ED-005/2026', ['Técnico em Desenvolvimento de Sistemas']),
  taa('10', '009/2026', 'GO', 'MG', ['01/08/2026', '31/07/2027'], 450000, 'Aceito', 'ED-001/2026', ['Técnico em Segurança do Trabalho']),
  taa('11', '010/2026', 'PE', 'MG', ['01/07/2026', '30/06/2027'], 260000, 'Aceito', 'ED-001/2026', ['Técnico em Segurança do Trabalho']),
  taa('12', '011/2026', 'BA', 'MG', ['01/10/2026', '30/09/2027'], 300000, 'Em análise', 'ED-002/2026', ['Mecânico de Manutenção de Máquinas', 'Desenhista de Produtos Gráficos']),
  // Mesmo par CTM × DR com outro edital: novo TAA (o do ED-001 segue em andamento). Um TAA por edital para cada par.
  { ...taa('17', '013/2026', 'SP', 'MG', ['01/12/2026', '30/11/2027'], 250000, 'Em análise', 'ED-002/2026', ['Soldador']), origem: 'CTM', enviadoEm: '2026-09-26T10:00:00Z' },
  // TAAs enviados pelas CTMs, aguardando a avaliação do Gestor da DR
  { ...taa('16', '012/2026', 'MG', 'RJ', ['01/11/2026', '31/10/2027'], 300000, 'Encaminhado', 'ED-001/2026', ['Técnico em Eletrotécnica']), gestor: undefined, origem: 'CTM', enviadoEm: '2026-09-25T10:00:00Z' },
  { ...taa('17', '013/2026', 'PR', 'MG', ['01/11/2026', '31/10/2027'], 500000, 'Em análise', 'ED-001/2026', ['Técnico em Mecatrônica', 'Técnico em Segurança do Trabalho']), origem: 'CTM', enviadoEm: '2026-09-22T10:00:00Z' },
  { ...taa('18', '014/2026', 'DF', 'MG', ['01/10/2026', '30/09/2027'], 250000, 'Cancelado', 'ED-001/2026', ['Técnico em Mecatrônica']), origem: 'CTM', enviadoEm: '2026-09-01T10:00:00Z', motivo: 'Recusado pelo Gestor: o DR não prevê turmas desse curso em 2027.', historico: [{ quando: '2026-09-01T10:00:00Z', texto: 'Encaminhado ao DR', autor: 'Juliana Pereira' }, { quando: '2026-09-08T10:00:00Z', texto: 'Recusado pelo Gestor: o DR não prevê turmas desse curso em 2027.', autor: 'Gestor SENAI-DF' }].reverse() },
]

export const useContratos = () => useCollection<Contrato>('contratos-v13', contratos)
// Saldo do TAA: valor global menos o executado — propostas ASSINADAS vinculadas ao TAA (ou, sem vínculo, entre o
// contratante e a CTM nos produtos do TAA).
export const saldoTaa = (c: Contrato, propostas: Produto[]) => {
  const nomes = new Set((c.produtos ?? []).map((p) => p.nome))
  const executado = propostas.filter((p) => p.status === 'Aprovado' && (p.taaId ? p.taaId === c.id : p.drContratante === c.contratante && p.drOfertante === c.dr))
    .reduce((t, p) => t + p.cursos.filter((x) => p.taaId || nomes.has(x.nome)).reduce((u, x) => u + x.valorPrevisto, 0), 0)
  return { executado, saldo: c.valor - executado, pct: c.valor ? Math.round((executado / c.valor) * 100) : 0 }
}
// TAA ou contrato (não encerrado) entre um contratante e uma CTM.
export const taaEntre = (todos: Contrato[], contratante: string, ctm: string) => todos.find((c) => c.contratante === contratante && c.dr === ctm && contratoAtivo(c))
// Produtos contratados (todos os TAAs/contratos não encerrados entre o contratante e a CTM).
export const produtosContratados = (todos: Contrato[], contratante: string, ctm: string) =>
  [...new Set(todos.filter((c) => c.contratante === contratante && c.dr === ctm && contratoAtivo(c)).flatMap((c) => (c.produtos ?? []).map((p) => p.nome)))]


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

// Proposta comercial: criada SEMPRE pela CTM (o Gestor EAD é o responsável), vinculada a um TAA/contrato aceito,
// depois que a negociação (fora do sistema) avança. Cursos = produtos do TAA, com a matriz do portfólio (versão aprovada).
// Valor parametrizado pelo edital: valor do curso (por aluno) × quantidade de alunos — não se digita.
// Status (quem muda é o Gestor EAD, conforme o retorno da DR solicitante): Rascunho, Em andamento,
// Aguardando, Aprovado, Cancelado. Versões vão e vêm (v1, v2…), com todo o histórico.
// Propostas aprovadas executam o saldo do TAA. Aprovada, vincula-se a equipe técnica (supervisor e analista), que define o
// cronograma das turmas (com agrupamento de UCs); a proposta aprovada segue para o processo de turmas (oferta).
// Hierarquia: proposta → cursos → turmas → UCs → alunos (com situação).
export type CursoProposta = { cursoId: string; codigo: string; nome: string; modalidade: string; area: string; cargaHoraria: number; valorAluno: number; valorPrevisto: number; vagas?: number; inicioPrevisto?: string } // vagas = quantidade de alunos; valorPrevisto = valorAluno × alunos; inicioPrevisto ISO
export type StatusProposta = 'Rascunho' | 'Em andamento' | 'Aguardando' | 'Aprovado' | 'Cancelado'
export const statusProposta: StatusProposta[] = ['Rascunho', 'Em andamento', 'Aguardando', 'Aprovado', 'Cancelado']
export type Registro = { quando: string; texto: string; autor?: string } // histórico (quando ISO)
export type VersaoProposta = { versao: number; cursos: CursoProposta[]; vigenciaInicio?: string; vigenciaFim?: string; salvaEm: string; motivo?: string }
export type Produto = {
  id: string; numero: string; drOfertante: string; drContratante: string; cursos: CursoProposta[]; cadastradoEm: string; status?: StatusProposta; documentos?: string[]; edital?: string; vigenciaInicio?: string; vigenciaFim?: string // vigência dd/mm/aaaa (início e fim)
  taaId?: string // TAA aceito ao qual a proposta está vinculada
  responsavel?: { nome: string; cargo: string } // Gestor EAD da CTM
  equipeTecnica?: { supervisor: string; analista: string } // vinculada depois da aprovação; define o cronograma das turmas
  versao?: number // versão atual (1 = original)
  versoes?: VersaoProposta[] // versões anteriores (a proposta vai e vem)
  cnpj?: string // CNPJ do contratante (faturamento)
  crm?: string // nº da proposta no CRM ou sistema externo (opcional)
  link?: string // link do documento da proposta (o sistema não gera nem guarda o documento)
  faturamento?: 'DR' | 'Escola' // para quem se fatura
  escolas?: string[] // escolas faturadas (quando faturamento = Escola)
  motivoCancelamento?: string
  historico?: Registro[]
}
// Valor do curso no edital (por aluno).
export const valorNoEdital = (edital: string | undefined, curso: string) => editais.find((e) => e.numero === edital)?.cursos.find((c) => c.nome === curso)?.valor ?? 0
export const totalProposta = (p: Pick<Produto, 'cursos'>) => p.cursos.reduce((t, c) => t + c.valorPrevisto, 0)
export const alunosProposta = (p: Pick<Produto, 'cursos'>) => p.cursos.reduce((t, c) => t + (c.vagas ?? 0), 0)
const cp = (cursoId: string, alunos: number, inicioPrevisto: string, edital: string): CursoProposta => {
  const c = cursos.find((x) => x.id === cursoId)!
  const valorAluno = valorNoEdital(edital, c.nome)
  return { cursoId, codigo: c.codigo, nome: c.nome, modalidade: c.modalidade, area: c.area, cargaHoraria: c.cargaHoraria, valorAluno, vagas: alunos, valorPrevisto: valorAluno * alunos, inicioPrevisto }
}
const reg = (quando: string, texto: string, autor = 'Juliana Pereira'): Registro => ({ quando, texto, autor })
const gestorContrato = { nome: 'Juliana Pereira', cargo: 'Gestor EAD' }
const propostas: Produto[] = [
  { id: '1', numero: 'PC-MG-001/2026', taaId: '7', edital: 'ED-001/2026', status: 'Aprovado', versao: 1, responsavel: gestorContrato, equipeTecnica: { supervisor: 'Carlos Andrade', analista: 'Renata Guimarães' }, drOfertante: 'MG', drContratante: 'SP', cnpj: '03.774.819/0001-02', crm: 'CRM-2026-0142', link: 'https://drive.senaimg.org.br/propostas/PC-MG-001-2026.pdf', faturamento: 'DR', cursos: [cp('2', 40, '2026-11-03', 'ED-001/2026'), cp('3', 35, '2026-11-03', 'ED-001/2026')], vigenciaInicio: '01/04/2026', vigenciaFim: '31/03/2027', cadastradoEm: '2026-03-10T10:00:00Z',
    historico: [reg('2026-03-24T15:30:00Z', 'Status: Aprovado (SENAI-SP aprovou)'), reg('2026-03-12T10:00:00Z', 'Status: Em andamento (enviada ao cliente)'), reg('2026-03-10T10:00:00Z', 'Proposta criada (Rascunho)')] },
  { id: '2', numero: 'PC-MG-002/2026', taaId: '8', edital: 'ED-002/2026', status: 'Aprovado', versao: 1, responsavel: gestorContrato, equipeTecnica: { supervisor: 'Carlos Andrade', analista: 'Renata Guimarães' }, drOfertante: 'MG', drContratante: 'RJ', cnpj: '03.851.105/0001-42', link: 'https://drive.senaimg.org.br/propostas/PC-MG-002-2026.pdf', faturamento: 'Escola', escolas: ['SENAI Maracanã', 'SENAI Benfica'], cursos: [cp('8', 30, '2026-10-05', 'ED-002/2026'), cp('7', 25, '2027-02-01', 'ED-002/2026')], vigenciaInicio: '01/05/2026', vigenciaFim: '30/04/2027', cadastradoEm: '2026-04-22T10:00:00Z',
    historico: [reg('2026-05-06T09:10:00Z', 'Status: Aprovado (SENAI-RJ aprovou)'), reg('2026-04-22T10:00:00Z', 'Proposta criada (Rascunho)')] },
  { id: '3', numero: 'PC-MG-003/2026', taaId: '9', edital: 'ED-005/2026', status: 'Aprovado', versao: 1, responsavel: gestorContrato, drOfertante: 'MG', drContratante: 'ES', cnpj: '03.785.466/0001-78', faturamento: 'DR', cursos: [cp('4', 30, '2027-02-08', 'ED-005/2026')], vigenciaInicio: '01/07/2026', vigenciaFim: '30/06/2027', cadastradoEm: '2026-06-05T10:00:00Z',
    historico: [reg('2026-06-19T14:00:00Z', 'Status: Aprovado (SENAI-ES aprovou)'), reg('2026-06-05T10:00:00Z', 'Proposta criada (Rascunho)')] },
  // Vai e vem: v1 com 20 alunos; a DR pediu 25 → v2, aguardando o retorno do cliente (turma prevista para daqui a 10 dias: alerta)
  { id: '4', numero: 'PC-MG-004/2026', taaId: '10', edital: 'ED-001/2026', status: 'Aguardando', versao: 2, responsavel: gestorContrato, drOfertante: 'MG', drContratante: 'GO', cnpj: '03.769.437/0001-10', crm: 'CRM-2026-0388', faturamento: 'DR', cursos: [cp('6', 25, '2026-10-08', 'ED-001/2026')], vigenciaInicio: '01/10/2026', vigenciaFim: '30/09/2027', cadastradoEm: '2026-08-18T10:00:00Z',
    versoes: [{ versao: 1, cursos: [cp('6', 20, '2026-10-08', 'ED-001/2026')], vigenciaInicio: '01/10/2026', vigenciaFim: '30/09/2027', salvaEm: '2026-08-18T10:00:00Z', motivo: 'Versão inicial' }],
    historico: [reg('2026-09-02T11:30:00Z', 'Status: Aguardando'), reg('2026-09-02T11:20:00Z', 'Nova versão v2: o DR pediu 25 estudantes (antes 20)'), reg('2026-08-20T10:00:00Z', 'Status: Em andamento (enviada ao cliente)'), reg('2026-08-18T10:00:00Z', 'Proposta criada (Rascunho)')] },
  { id: '5', numero: 'PC-MG-005/2026', taaId: '11', edital: 'ED-001/2026', status: 'Cancelado', versao: 1, responsavel: gestorContrato, drOfertante: 'MG', drContratante: 'PE', cnpj: '03.787.402/0001-39', faturamento: 'DR', motivoCancelamento: 'O DR não fechou a turma (mínimo de 25 inscritos).', cursos: [cp('6', 15, '2026-09-14', 'ED-001/2026')], vigenciaInicio: '01/08/2026', vigenciaFim: '31/07/2027', cadastradoEm: '2026-07-01T10:00:00Z',
    historico: [reg('2026-09-04T16:45:00Z', 'Status: Cancelado — o DR não fechou a turma'), reg('2026-07-01T10:00:00Z', 'Proposta criada (Rascunho)')] },
  { id: '6', numero: 'PC-MG-006/2026', taaId: '8', edital: 'ED-002/2026', status: 'Aprovado', versao: 1, responsavel: gestorContrato, equipeTecnica: { supervisor: 'Carlos Andrade', analista: 'Renata Guimarães' }, drOfertante: 'MG', drContratante: 'RJ', cnpj: '03.439.316/0001-06', faturamento: 'DR', cursos: [cp('7', 30, '2026-10-13', 'ED-002/2026')], vigenciaInicio: '15/04/2026', vigenciaFim: '14/04/2027', cadastradoEm: '2026-09-15T10:00:00Z',
    historico: [reg('2026-09-25T10:00:00Z', 'Status: Aprovado'), reg('2026-09-16T10:00:00Z', 'Status: Em andamento (enviada ao cliente)'), reg('2026-09-15T10:00:00Z', 'Proposta criada (Rascunho)')] },
  // Segunda turma de Mecatrônica no mesmo TAA (curso pode se repetir), ainda em rascunho
  { id: '7', numero: 'PC-MG-007/2026', taaId: '7', edital: 'ED-001/2026', status: 'Rascunho', versao: 1, responsavel: gestorContrato, drOfertante: 'MG', drContratante: 'SP', cnpj: '03.774.819/0001-02', faturamento: 'DR', cursos: [cp('2', 20, '2027-03-01', 'ED-001/2026')], vigenciaInicio: '01/03/2027', vigenciaFim: '28/02/2028', cadastradoEm: '2026-09-27T10:00:00Z',
    historico: [reg('2026-09-27T10:00:00Z', 'Proposta criada (Rascunho)')] },
]
export const useProdutos = () => useCollection<Produto>('produtos-v23', propostas)
// Alerta de prazo: proposta ainda não assinada com turma prevista para começar em até 15 dias.
export const PRAZO_ALERTA_DIAS = 15
export const inicioPrevisto = (p: Pick<Produto, 'cursos'>) => p.cursos.map((c) => c.inicioPrevisto).filter((x): x is string => !!x).sort()[0]
export const alertaPrazo = (p: Produto) => {
  const ini = inicioPrevisto(p)
  if (!ini || !['Rascunho', 'Em andamento', 'Aguardando'].includes(p.status ?? 'Rascunho')) return null
  const d = diasEntre(HOJE, ini)
  return d <= PRAZO_ALERTA_DIAS ? d : null
}

// Portfólio das CTMs: cada CTM registra seus produtos (módulos → UCs com CH), com versões (v1, v2…).
// Novo produto ou nova versão é uma SOLICITAÇÃO: fica "Aguardando" até o DN aprovar (ou reprovar, com motivo).
// Só versões aprovadas entram no portfólio, visível para todas as DRs, e são usadas na oferta.
// Cada versão pode ter vínculo com o itinerário (outro sistema; a DR vincula) e documentos/materiais (links).
export type UnidadeCurricular = { nome: string; cargaHoraria: number }
export type Modulo = { nome: string; unidades: UnidadeCurricular[] }
export type SituacaoPortfolio = 'Aguardando' | 'Aprovado' | 'Reprovado'
export type TipoMaterial = 'Plano de curso' | 'Plano de ensino' | 'Material didático' | 'Avaliação' | 'Outro'
export const tiposMaterial: TipoMaterial[] = ['Plano de curso', 'Plano de ensino', 'Material didático', 'Avaliação', 'Outro']
export type MaterialProduto = { nome: string; tipo: TipoMaterial; link: string }
export type CursoDr = { id: string; nome: string; modulos: Modulo[]; criadoEm: string; edital?: string; area?: string; modalidade?: string; cargaHorariaEdital?: number
  versao?: number // 1 = original
  origemId?: string // id da v1 (a "mãe"); ausente na própria v1
  baseadaEm?: number // versão da qual esta foi copiada
  ctm?: string // UF da CTM dona do produto
  situacao?: SituacaoPortfolio // sem valor = Aprovado (dados antigos)
  motivo?: string // motivo da reprovação
  decididoEm?: string // ISO
  itinerario?: { codigo: string; vinculadoEm: string } // vínculo com o sistema de itinerários
  materiais?: MaterialProduto[]
}

export const chTotal = (c: { modulos: Modulo[] }) => c.modulos.reduce((t, m) => t + m.unidades.reduce((u, x) => u + x.cargaHoraria, 0), 0)
export const situacaoDe = (c: CursoDr): SituacaoPortfolio => c.situacao ?? 'Aprovado'
export const raizDe = (c: CursoDr) => c.origemId ?? c.id
// Última versão aprovada de cada produto (o que aparece no portfólio e vai para a oferta).
export const aprovadosAtuais = (todos: CursoDr[]) =>
  todos.filter((c) => situacaoDe(c) === 'Aprovado' && !todos.some((o) => raizDe(o) === raizDe(c) && situacaoDe(o) === 'Aprovado' && (o.versao ?? 1) > (c.versao ?? 1)))
const uc = (...nomes: string[]) => nomes.map((nome) => ({ nome, cargaHoraria: 0 }))
const mat = (nome: string, tipo: TipoMaterial, pasta: string): MaterialProduto => ({ nome, tipo, link: `https://drive.ctm.senaimg.org.br/${pasta}/${nome.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}` })
const cursosDr: CursoDr[] = [
  { id: 'soldador-1', ctm: 'MG', situacao: 'Aprovado', decididoEm: '2026-04-06T10:00:00Z', nome: 'Soldador', edital: 'ED-002/2026', area: 'Metalmecânica', modalidade: 'Qualificação Profissional', cargaHorariaEdital: 160, versao: 1, criadoEm: '2026-04-02T10:00:00Z',
    itinerario: { codigo: 'IT-MET-SOL-2019', vinculadoEm: '2026-04-03T10:00:00Z' },
    materiais: [mat('Plano de curso Soldador', 'Plano de curso', 'soldador'), mat('Livro didático Soldagem', 'Material didático', 'soldador')],
    modulos: [{ nome: 'Fundamentos', unidades: uc('Segurança em soldagem', 'Leitura de desenho técnico') }, { nome: 'Processos', unidades: uc('Soldagem com eletrodo revestido', 'Soldagem MIG/MAG') }] },
  // Nova versão solicitada, aguardando o DN
  { id: 'soldador-2', ctm: 'MG', situacao: 'Aguardando', nome: 'Soldador', edital: 'ED-002/2026', area: 'Metalmecânica', modalidade: 'Qualificação Profissional', cargaHorariaEdital: 160, versao: 2, origemId: 'soldador-1', baseadaEm: 1, criadoEm: '2026-09-15T10:00:00Z',
    itinerario: { codigo: 'IT-MET-SOL-2019', vinculadoEm: '2026-04-03T10:00:00Z' },
    materiais: [mat('Plano de curso Soldador', 'Plano de curso', 'soldador'), mat('Livro didático Soldagem', 'Material didático', 'soldador'), mat('Roteiro de prática TIG', 'Material didático', 'soldador')],
    modulos: [{ nome: 'Fundamentos', unidades: uc('Segurança em soldagem', 'Leitura de desenho técnico', 'Metrologia') }, { nome: 'Processos', unidades: uc('Soldagem com eletrodo revestido', 'Soldagem MIG/MAG', 'Soldagem TIG') }] },
  { id: 'eletricista-1', ctm: 'MG', situacao: 'Aprovado', decididoEm: '2026-04-09T10:00:00Z', nome: 'Eletricista Instalador Predial', edital: 'ED-002/2026', area: 'Eletroeletrônica', modalidade: 'Qualificação Profissional', cargaHorariaEdital: 200, versao: 1, criadoEm: '2026-04-05T10:00:00Z',
    materiais: [mat('Plano de curso Eletricista', 'Plano de curso', 'eletricista')],
    modulos: [{ nome: 'Básico', unidades: uc('Eletricidade básica', 'NR-10') }, { nome: 'Instalações', unidades: uc('Circuitos residenciais', 'Quadros de distribuição') }] },
  { id: 'mecatronica-1', ctm: 'MG', situacao: 'Aprovado', decididoEm: '2026-03-02T10:00:00Z', nome: 'Técnico em Mecatrônica', edital: 'ED-001/2026', area: 'Automação', modalidade: 'Técnico', cargaHorariaEdital: 1200, versao: 1, criadoEm: '2026-02-20T10:00:00Z',
    itinerario: { codigo: 'IT-AUT-MEC-2026', vinculadoEm: '2026-02-21T10:00:00Z' },
    modulos: [{ nome: 'Básico', unidades: uc('Eletricidade aplicada', 'Mecânica aplicada') }, { nome: 'Específico', unidades: uc('Automação e CLP', 'Robótica industrial') }] },
  // Nova inclusão aguardando o DN
  { id: 'mmm-1', ctm: 'MG', situacao: 'Aguardando', nome: 'Mecânico de Manutenção de Máquinas', edital: 'ED-002/2026', area: 'Metalmecânica', modalidade: 'Qualificação Profissional', cargaHorariaEdital: 240, versao: 1, criadoEm: '2026-09-22T10:00:00Z',
    modulos: [{ nome: 'Fundamentos', unidades: uc('Elementos de máquinas', 'Lubrificação') }, { nome: 'Manutenção', unidades: uc('Manutenção preventiva', 'Manutenção corretiva') }] },
  // Reprovada pelo DN
  { id: 'desenhista-1', ctm: 'MG', situacao: 'Reprovado', motivo: 'Matriz sem a UC de tratamento de imagens prevista no plano de curso.', decididoEm: '2026-09-10T10:00:00Z', nome: 'Desenhista de Produtos Gráficos', edital: 'ED-002/2026', area: 'Tecnologia Gráfica', modalidade: 'Qualificação Profissional', cargaHorariaEdital: 200, versao: 1, criadoEm: '2026-09-01T10:00:00Z',
    modulos: [{ nome: 'Básico', unidades: uc('Desenho vetorial', 'Tipografia') }] },
  // Portfólio de outras CTMs
  { id: 'usinagem-1', ctm: 'SC', situacao: 'Aprovado', decididoEm: '2026-06-10T10:00:00Z', nome: 'Mecânico de Usinagem', edital: 'ED-003/2026', area: 'Metalmecânica', modalidade: 'Aprendizagem Industrial', cargaHorariaEdital: 800, versao: 1, criadoEm: '2026-06-02T10:00:00Z',
    itinerario: { codigo: 'IT-MET-USI-2021', vinculadoEm: '2026-06-03T10:00:00Z' },
    materiais: [mat('Plano de curso Usinagem', 'Plano de curso', 'usinagem')],
    modulos: [{ nome: 'Básico', unidades: uc('Desenho técnico', 'Metrologia') }, { nome: 'Específico', unidades: uc('Usinagem convencional', 'Prática profissional') }] },
  { id: 'eletrotecnica-1', ctm: 'RJ', situacao: 'Aprovado', decididoEm: '2026-03-12T10:00:00Z', nome: 'Técnico em Eletrotécnica', edital: 'ED-001/2026', area: 'Eletroeletrônica', modalidade: 'Técnico', cargaHorariaEdital: 1200, versao: 1, criadoEm: '2026-03-05T10:00:00Z',
    modulos: [{ nome: 'Básico', unidades: uc('Fundamentos de eletricidade', 'Instalações elétricas') }, { nome: 'Específico', unidades: uc('Máquinas elétricas', 'Sistemas de potência') }] },
  { id: 'eletrotecnica-2', ctm: 'RJ', situacao: 'Aguardando', nome: 'Técnico em Eletrotécnica', edital: 'ED-001/2026', area: 'Eletroeletrônica', modalidade: 'Técnico', cargaHorariaEdital: 1200, versao: 2, origemId: 'eletrotecnica-1', baseadaEm: 1, criadoEm: '2026-09-25T10:00:00Z',
    modulos: [{ nome: 'Básico', unidades: uc('Fundamentos de eletricidade', 'Instalações elétricas') }, { nome: 'Específico', unidades: uc('Máquinas elétricas', 'Sistemas de potência', 'Eficiência energética') }] },
]
export const useCursosDr = () => useCollection<CursoDr>('cursos-dr-v5', cursosDr)

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
// A matriz curricular (módulos → UCs) vem do produto; o cronograma (datas por UC) é gerado pelo sistema e ajustável.
// Depois vêm a gestão da execução (equipe por UC) e a integração com o AVA. Regras em docs/fluxo.md.
export type AcaoTutor = 'Planejamento' | 'Replanejamento' | 'Apropriação'
export type LinksUc = { planoCurso?: string; planoEnsino?: string; pasta?: string }
export type UcTurma = {
  nome: string; chEad: number; chPresencial: number; inicio: string; fim: string; aoVivo: AulaAoVivo[] // CH a distância + presencial; datas ISO (aaaa-mm-dd)
  semanas?: number; encontros?: number; aulasPrevistas?: number // calculados pelo gerador de cronograma
  tutor?: string; acao?: AcaoTutor; tutorConfirmado?: boolean; validacaoPedagogica?: boolean // gestão da execução
  links?: LinksUc // links do material (o sistema não guarda arquivos)
  salaAva?: string // ID da sala criada no AVA
  // Fluxo da UC (equipe técnica da UC: pedagógico, tutor e monitor)
  pedagogico?: string
  monitor?: string
  sala?: SalaUc // sala no Moodle, criada pelo monitor via integração
  etapa?: EtapaUc
  atividades?: AtividadePresencial[] // planejadas pelo pedagógico (as aulas ao vivo online ficam em aoVivo)
  devolucao?: string // motivo quando o tutor devolve o planejamento
  emailMonitorEm?: string // e-mail disparado ao monitor para parametrizar as avaliações no Moodle
  corteCiclo?: number // ciclo de faturamento da UC: dia de fechamento (1 a 28; padrão 20). Cada UC pode ter o seu.
}
// Fluxo da UC: o monitor cria a sala no Moodle (Em criação → Criada) → o pedagógico planeja (Em planejamento: dias das aulas
// ao vivo online e atividades presenciais) → o tutor avalia (aprova ou devolve) → e-mail ao monitor para parametrizar as
// avaliações no Moodle → Pronta. Com todas as UCs prontas, e-mail à DR solicitante para ajustar o SGN/SGE e integrar os alunos.
export type SalaUc = 'Não criada' | 'Em criação' | 'Criada'
export type EtapaUc = 'Aguardando sala' | 'Em planejamento' | 'Em avaliação do tutor' | 'Parametrizar avaliações' | 'Pronta'
export const etapasUc: EtapaUc[] = ['Aguardando sala', 'Em planejamento', 'Em avaliação do tutor', 'Parametrizar avaliações', 'Pronta']
export type AtividadePresencial = { data: string; descricao: string }
export const etapaDe = (u: UcTurma): EtapaUc => u.etapa ?? (u.sala === 'Criada' ? 'Em planejamento' : 'Aguardando sala')
export const estruturaPronta = (t: { modulos: { unidades: UcTurma[] }[] }) => t.modulos.every((m) => m.unidades.every((u) => etapaDe(u) === 'Pronta'))
export type AulaAoVivo = { data: string; inicio: string; fim: string } // horários hh:mm
export const aoVivoTurma = (t: { modulos: { unidades: UcTurma[] }[] }) => t.modulos.reduce((n, m) => n + m.unidades.reduce((k, u) => k + u.aoVivo.length, 0), 0)
// Fase registrada pela CTM; o status exibido junta a fase com o calendário.
// A iniciar → Buscar tutor (cronograma validado + turma confirmada pela DR: dispara PCP e criação de salas)
// → Em andamento (a partir do início) → Finalizada (depois do término). Cancelada a qualquer momento antes do fim.
export type FaseTurma = 'A iniciar' | 'Buscar tutor' | 'Cancelada'
export type StatusTurma = 'A iniciar' | 'Buscar tutor' | 'Em andamento' | 'Finalizada' | 'Cancelada'
export const periodoTurma = (t: { modulos: { unidades: UcTurma[] }[] }) => {
  const ucs = t.modulos.flatMap((m) => m.unidades)
  return { inicio: ucs.map((u) => u.inicio).filter(Boolean).sort()[0] ?? '', fim: ucs.map((u) => u.fim).filter(Boolean).sort().at(-1) ?? '' }
}
export const statusTurma = (t: { modulos: { unidades: UcTurma[] }[]; fase?: FaseTurma }): StatusTurma => {
  if (t.fase === 'Cancelada') return 'Cancelada'
  const { inicio, fim } = periodoTurma(t)
  if (fim && fim < HOJE) return 'Finalizada'
  if (inicio && inicio <= HOJE) return 'Em andamento'
  return t.fase ?? 'A iniciar'
}
export const chUc = (u: UcTurma) => (u.chEad || 0) + (u.chPresencial || 0)
// Cronograma: versão enviada à DR contratante para validação; sem resposta até o prazo, conta como validado.
export type SituacaoCronograma = 'Rascunho' | 'Aguardando' | 'Validado'
export type Cronograma = { versao: number; situacao: SituacaoCronograma; prazo?: string; validadoEm?: string; porPrazo?: boolean }
export const situacaoCronograma = (c?: Cronograma): SituacaoCronograma =>
  c?.situacao === 'Aguardando' && c.prazo && c.prazo < HOJE ? 'Validado' : c?.situacao ?? 'Rascunho'
export type EscolaTurma = { nome: string; cidade: string; alunos: number; integrados?: number } // integrados = alunos que a DR já integrou no AVA
export type EquipeTurma = { monitorFront?: string; monitorBack?: string; pedagogico?: string; interlocutor?: string }
export type Turma = {
  id: string
  codigo: string
  propostaId: string
  propostaNumero: string
  drContratante: string
  cursos: string[] // uma oferta pode ter vários cursos da mesma proposta
  modulos: { curso: string; nome: string; unidades: UcTurma[] }[] // módulos de todos os cursos, marcados com o curso de origem
  criadoEm: string
  fase?: FaseTurma
  cronograma?: Cronograma
  diaPresencial?: string // dia da semana do encontro presencial (informado pela DR)
  supervisor?: string
  analista?: string
  equipe?: EquipeTurma
  escolas?: EscolaTurma[]
  salasCriadas?: boolean
  emailDrEm?: string // e-mail à DR solicitante para ajustar o SGN/SGE e integrar os alunos (estrutura pronta)
  motivoCancelamento?: string
  historico?: Registro[]
}
const ucT = (nome: string, chEad: number, chPresencial: number, inicio: string, fim: string, extra: Partial<UcTurma> = {}): UcTurma => ({
  nome, chEad, chPresencial, inicio, fim, aoVivo: [],
  semanas: Math.max(1, Math.round((diasEntre(inicio, fim) + 3) / 7)), encontros: Math.max(1, Math.round(chPresencial / 4)), aulasPrevistas: Math.max(1, Math.round(chEad / 20)),
  ...extra,
})
const links = (curso: string): LinksUc => ({ planoCurso: `https://drive.ctm.senaimg.org.br/${curso}/plano-de-curso`, planoEnsino: `https://drive.ctm.senaimg.org.br/${curso}/plano-de-ensino`, pasta: `https://drive.ctm.senaimg.org.br/${curso}/ucs` })
const turmas: Turma[] = [
  // Confirmada pela DR (Buscar tutor): cronograma validado, salas criadas, equipe em alocação.
  {
    id: 't1', codigo: 'TU-MG-001/2026', propostaId: '2', propostaNumero: 'PC-MG-002/2026', drContratante: 'RJ', cursos: ['Soldador'], criadoEm: '2026-08-01T10:00:00Z',
    fase: 'Buscar tutor', cronograma: { versao: 2, situacao: 'Validado', validadoEm: '2026-09-10' }, diaPresencial: 'Quinta-feira', supervisor: 'Carlos Andrade', analista: 'Renata Guimarães', salasCriadas: true,
    equipe: { monitorFront: 'Lívia Campos', monitorBack: 'Otávio Reis', pedagogico: 'Sônia Prado', interlocutor: 'Marcos Leal' },
    escolas: [{ nome: 'SENAI Maracanã', cidade: 'Rio de Janeiro', alunos: 18, integrados: 18 }, { nome: 'SENAI Benfica', cidade: 'Rio de Janeiro', alunos: 12, integrados: 0 }],
    modulos: [
      { curso: 'Soldador', nome: 'Fundamentos', unidades: [
        ucT('Segurança em soldagem', 10, 10, '2026-10-05', '2026-10-09', { aoVivo: [{ data: '2026-10-07', inicio: '19:00', fim: '21:00' }], tutor: 'Fabiana Rocha', pedagogico: 'Sônia Prado', monitor: 'Otávio Reis', sala: 'Criada', salaAva: 'AVA-88213', etapa: 'Pronta', atividades: [{ data: '2026-10-08', descricao: 'Prática de EPI na oficina' }], emailMonitorEm: '2026-09-22T10:00:00Z', links: links('soldador') }),
        ucT('Leitura de desenho técnico', 10, 10, '2026-10-12', '2026-10-16', { aoVivo: [{ data: '2026-10-14', inicio: '19:00', fim: '21:00' }], tutor: 'Diego Carvalho', pedagogico: 'Sônia Prado', monitor: 'Otávio Reis', sala: 'Criada', salaAva: 'AVA-88214', etapa: 'Em avaliação do tutor', atividades: [{ data: '2026-10-15', descricao: 'Leitura de desenho em bancada' }], links: links('soldador') }),
      ] },
      { curso: 'Soldador', nome: 'Processos', unidades: [
        ucT('Soldagem com eletrodo revestido', 30, 30, '2026-10-19', '2026-11-06', { aoVivo: [], tutor: 'Fabiana Rocha', pedagogico: 'Sônia Prado', monitor: 'Otávio Reis', sala: 'Criada', salaAva: 'AVA-88215', etapa: 'Em planejamento', devolucao: 'Incluir uma atividade presencial de soldagem em chapa por semana.' }),
        ucT('Soldagem MIG/MAG', 30, 30, '2026-11-09', '2026-11-27', { corteCiclo: 5, aoVivo: [], tutor: 'Diego Carvalho', pedagogico: 'Sônia Prado', monitor: 'Otávio Reis', sala: 'Em criação', etapa: 'Aguardando sala' }),
      ] },
    ],
    historico: [
      { quando: '2026-08-01T10:00:00Z', texto: 'Oferta criada; cronograma v1 gerado', autor: 'Carlos Andrade' },
      { quando: '2026-08-20T10:00:00Z', texto: 'Cronograma v1 enviado ao DR para validação (prazo 30/08/2026)', autor: 'Carlos Andrade' },
      { quando: '2026-08-28T10:00:00Z', texto: 'DR pediu ajuste: presencial às quintas. Cronograma v2 gerado e reenviado', autor: 'Carlos Andrade' },
      { quando: '2026-09-10T10:00:00Z', texto: 'Cronograma v2 validado pelo SENAI-RJ', autor: 'Carlos Andrade' },
      { quando: '2026-09-15T10:00:00Z', texto: 'Turma confirmada pelo DR: status Buscar tutor', autor: 'Carlos Andrade' },
      { quando: '2026-09-22T10:00:00Z', texto: 'Segurança em soldagem: planejamento aprovado pelo tutor; e-mail ao monitor para parametrizar as avaliações', autor: 'Fabiana Rocha' },
    ],
  },
  // Aguardando a DR validar o cronograma.
  {
    id: 't2', codigo: 'TU-MG-002/2026', propostaId: '1', propostaNumero: 'PC-MG-001/2026', drContratante: 'SP', cursos: ['Técnico em Mecatrônica'], criadoEm: '2026-08-20T10:00:00Z',
    fase: 'A iniciar', cronograma: { versao: 1, situacao: 'Aguardando', prazo: '2026-10-08' }, supervisor: 'Carlos Andrade', analista: 'Renata Guimarães',
    escolas: [{ nome: 'SENAI Anchieta', cidade: 'São Paulo', alunos: 25 }, { nome: 'SENAI Campinas', cidade: 'Campinas', alunos: 18 }], // 43 no Moodle × 40 na proposta: aditivo
    modulos: [
      { curso: 'Técnico em Mecatrônica', nome: 'Básico', unidades: [ucT('Eletricidade aplicada', 60, 60, '2026-11-03', '2026-12-11'), ucT('Mecânica aplicada', 60, 60, '2026-12-14', '2027-02-12', { corteCiclo: 10 })] },
      { curso: 'Técnico em Mecatrônica', nome: 'Específico', unidades: [ucT('Automação e CLP', 80, 80, '2027-02-15', '2027-04-09'), ucT('Robótica industrial', 80, 80, '2027-04-12', '2027-06-04')] },
    ],
    historico: [
      { quando: '2026-08-20T10:00:00Z', texto: 'Oferta criada; cronograma v1 gerado', autor: 'Carlos Andrade' },
      { quando: '2026-09-28T09:00:00Z', texto: 'Cronograma v1 enviado ao DR para validação (prazo 08/10/2026)', autor: 'Carlos Andrade' },
    ],
  },
  // Rascunho: mesma UC e data da TU-MG-002 (sugestão de agrupamento).
  {
    id: 't3', codigo: 'TU-MG-003/2026', propostaId: '1', propostaNumero: 'PC-MG-001/2026', drContratante: 'SP', cursos: ['Técnico em Automação Industrial'], criadoEm: '2026-09-22T10:00:00Z',
    fase: 'A iniciar', cronograma: { versao: 1, situacao: 'Rascunho' }, supervisor: 'Carlos Andrade',
    modulos: [
      { curso: 'Técnico em Automação Industrial', nome: 'Básico', unidades: [ucT('Eletricidade aplicada', 60, 60, '2026-11-03', '2026-12-11'), ucT('Instrumentação industrial', 60, 60, '2026-12-14', '2027-02-12')] },
      { curso: 'Técnico em Automação Industrial', nome: 'Específico', unidades: [ucT('Controladores Lógicos Programáveis', 80, 80, '2027-02-15', '2027-04-09'), ucT('Redes industriais', 80, 80, '2027-04-12', '2027-06-04')] },
    ],
    historico: [{ quando: '2026-09-22T10:00:00Z', texto: 'Oferta criada; cronograma v1 gerado', autor: 'Carlos Andrade' }],
  },
  // Segunda proposta aprovada no mesmo TAA do SENAI-RJ (pode entrar no mesmo relatório de cobrança da PC-MG-002)
  {
    id: 't4', codigo: 'TU-MG-004/2026', propostaId: '6', propostaNumero: 'PC-MG-006/2026', drContratante: 'RJ', cursos: ['Eletricista Instalador Predial'], criadoEm: '2026-09-26T10:00:00Z',
    fase: 'Buscar tutor', cronograma: { versao: 1, situacao: 'Validado', validadoEm: '2026-09-28' }, diaPresencial: 'Terça-feira', supervisor: 'Carlos Andrade', analista: 'Renata Guimarães',
    escolas: [{ nome: 'SENAI Maracanã', cidade: 'Rio de Janeiro', alunos: 16 }, { nome: 'SENAI Tijuca', cidade: 'Rio de Janeiro', alunos: 12 }],
    modulos: [
      { curso: 'Eletricista Instalador Predial', nome: 'Básico', unidades: [ucT('Segurança em eletricidade (NR-10)', 20, 20, '2026-10-13', '2026-10-30'), ucT('Instalações elétricas prediais', 40, 40, '2026-11-03', '2026-12-11')] },
      { curso: 'Eletricista Instalador Predial', nome: 'Específico', unidades: [ucT('Comandos elétricos', 40, 40, '2026-12-14', '2027-02-05')] },
    ],
    historico: [{ quando: '2026-09-26T10:00:00Z', texto: 'Oferta criada; cronograma v1 gerado', autor: 'Carlos Andrade' }],
  },
]
export const useTurmas = () => useCollection<Turma>('turmas-v13', turmas)
// Agrupamento: outra turma com a mesma UC começando na mesma semana pode rodar junto (até ~300 alunos).
export const agrupaveis = (todas: Turma[], t: Turma, uc: UcTurma) =>
  todas.filter((o) => o.id !== t.id && o.fase !== 'Cancelada' && o.modulos.some((m) => m.unidades.some((u) => u.nome === uc.nome && u.inicio && uc.inicio && Math.abs(diasEntre(u.inicio, uc.inicio)) <= 7)))

// Feriados nacionais, mantidos pelo Super admin: o gerador de cronograma só pula estes dias.
// Por enquanto não há feriados/recessos por DR ou por CTM.
// O gerador de cronograma pula esses dias. Datas ISO; fim só em períodos.
export type TipoData = 'Feriado nacional'
export type DataCalendario = { id: string; nome: string; tipo: TipoData; inicio: string; fim?: string; origem?: 'Manual' | 'BrasilAPI'; desconsiderado?: boolean }
const calendario: DataCalendario[] = [
  ...([
    ['2026-10-12', 'Nossa Senhora Aparecida'], ['2026-11-02', 'Finados'], ['2026-11-15', 'Proclamação da República'], ['2026-11-20', 'Dia da Consciência Negra'],
    ['2026-12-25', 'Natal'], ['2027-01-01', 'Confraternização Universal'], ['2027-02-08', 'Carnaval'], ['2027-02-09', 'Carnaval'], ['2027-03-26', 'Sexta-feira Santa'],
    ['2027-04-21', 'Tiradentes'], ['2027-05-01', 'Dia do Trabalho'], ['2027-05-27', 'Corpus Christi'], ['2027-09-07', 'Independência do Brasil'],
  ] as const).map(([inicio, nome], i): DataCalendario => ({ id: `f${i + 1}`, nome, tipo: 'Feriado nacional', inicio })),
]
export const useCalendario = () => useCollection<DataCalendario>('calendario-v2', calendario)
// Só os feriados considerados: é o que o gerador de cronograma usa (os desconsiderados não são pulados).
export const useCalendarioAtivo = () => {
  const db = useCalendario()
  return { ...db, all: db.all.filter((c) => !c.desconsiderado) }
}

// Equipe da CTM (gestão da execução): quem pode ser alocado nas turmas. Funções configuráveis por CTM.
export type FuncaoEquipe = 'Tutor' | 'Monitor' | 'Pedagógico' | 'Interlocutor' | 'Analista' | 'Supervisor'
export const funcoesEquipe: FuncaoEquipe[] = ['Tutor', 'Monitor', 'Pedagógico', 'Interlocutor', 'Analista', 'Supervisor']
export const diasSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
export type Pessoa = { id: string; ctm: string; nome: string; email: string; funcao: FuncaoEquipe; competencias: string[]; disponibilidade: string[]; status: 'Ativo' | 'Inativo' }
const p = (id: string, nome: string, funcao: FuncaoEquipe, competencias: string[] = [], disponibilidade: string[] = diasSemana.slice(0, 5), status: Pessoa['status'] = 'Ativo', ctm = 'SENAI-MG'): Pessoa => ({
  id, ctm, nome, funcao, competencias, disponibilidade, status,
  email: `${nome.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').replace(/ /g, '.')}@senai${ctm.slice(6).toLowerCase()}.org.br`,
})
const equipe: Pessoa[] = [
  p('e1', 'Fabiana Rocha', 'Tutor', ['Segurança em soldagem', 'Soldagem com eletrodo revestido', 'Soldagem MIG/MAG'], ['Segunda-feira', 'Quarta-feira']),
  p('e2', 'Diego Carvalho', 'Tutor', ['Leitura de desenho técnico', 'Soldagem MIG/MAG']),
  p('e3', 'Helena Duarte', 'Tutor', ['Eletricidade aplicada', 'Instrumentação industrial', 'Automação e CLP'], ['Terça-feira', 'Quinta-feira']),
  p('e4', 'Rodrigo Mattos', 'Tutor', ['Mecânica aplicada', 'Robótica industrial', 'Controladores Lógicos Programáveis']),
  p('e5', 'Patrícia Nunes', 'Tutor', ['Redes industriais', 'Eletricidade aplicada'], ['Segunda-feira', 'Terça-feira', 'Quarta-feira']),
  p('e6', 'Lívia Campos', 'Monitor'),
  p('e7', 'Otávio Reis', 'Monitor'),
  p('e8', 'Sônia Prado', 'Pedagógico'),
  p('e9', 'Marcos Leal', 'Interlocutor'),
  p('e10', 'Renata Guimarães', 'Analista'),
  p('e11', 'Carlos Andrade', 'Supervisor'),
  p('e12', 'Tiago Moreira', 'Tutor', ['Segurança em soldagem'], diasSemana.slice(0, 5), 'Inativo'),
  // Outras CTMs: só o Super admin vê
  p('e13', 'Bruno Tavares', 'Tutor', ['Eletricidade aplicada'], diasSemana.slice(0, 5), 'Ativo', 'SENAI-SP'),
  p('e14', 'Aline Freitas', 'Supervisor', [], diasSemana.slice(0, 5), 'Ativo', 'SENAI-SP'),
  p('e15', 'Gustavo Lima', 'Tutor', ['Soldagem MIG/MAG'], diasSemana.slice(0, 5), 'Ativo', 'SENAI-SC'),
]
export const useEquipe = () => useCollection<Pessoa>('equipe-v3', equipe)
// Histórico de execuções anteriores de UCs (base para sugerir Planejamento × Apropriação e para o PCP).
export const execucoesAnteriores: { uc: string; tutor: string; turma: string; acao: AcaoTutor; fim: string }[] = [
  { uc: 'Segurança em soldagem', tutor: 'Fabiana Rocha', turma: 'TU-MG-014/2025', acao: 'Planejamento', fim: '2025-09-12' },
  { uc: 'Segurança em soldagem', tutor: 'Fabiana Rocha', turma: 'TU-MG-022/2025', acao: 'Apropriação', fim: '2025-11-28' },
  { uc: 'Leitura de desenho técnico', tutor: 'Diego Carvalho', turma: 'TU-MG-014/2025', acao: 'Planejamento', fim: '2025-09-26' },
  { uc: 'Soldagem com eletrodo revestido', tutor: 'Fabiana Rocha', turma: 'TU-MG-014/2025', acao: 'Planejamento', fim: '2025-10-24' },
  { uc: 'Eletricidade aplicada', tutor: 'Helena Duarte', turma: 'TU-MG-031/2025', acao: 'Planejamento', fim: '2025-12-12' },
]
// Sugestão da ação do tutor: UC nunca executada → Planejamento; já executada → Apropriação (Replanejamento só quando a supervisão pede).
export const acaoSugerida = (uc: string): AcaoTutor => (execucoesAnteriores.some((e) => e.uc === uc) ? 'Apropriação' : 'Planejamento')

// Tratativas pedagógicas e de monitoria (registradas na plataforma, categorizadas), sobre alunos ou a turma toda.
export type MotivoTratativa = 'Baixo acesso' | 'Baixo desempenho' | 'Atividade não entregue' | 'Saúde' | 'Trabalho' | 'Financeiro' | 'Dúvida de conteúdo' | 'Outro'
export type DesfechoTratativa = 'Resolvido' | 'Acompanhar novamente' | 'Alerta de desistência' | 'Plano de recuperação'
export const motivosTratativa: MotivoTratativa[] = ['Baixo acesso', 'Baixo desempenho', 'Atividade não entregue', 'Saúde', 'Trabalho', 'Financeiro', 'Dúvida de conteúdo', 'Outro']
export const desfechosTratativa: DesfechoTratativa[] = ['Resolvido', 'Acompanhar novamente', 'Alerta de desistência', 'Plano de recuperação']
export type Tratativa = { id: string; quando: string; turmaId: string; alunoId?: string; tipo: 'Ativa' | 'Receptiva'; motivo: MotivoTratativa; descricao: string; retorno: boolean; desfecho: DesfechoTratativa; responsavel: string; acompanharEm?: string } // alunoId vazio = turma toda
const tratativas: Tratativa[] = [
  { id: 'tr1', quando: '2026-09-25T14:10:00Z', turmaId: 't1', alunoId: 'a2', tipo: 'Ativa', motivo: 'Baixo acesso', descricao: 'Contato por WhatsApp: estudante sem acesso há 10 dias.', retorno: true, desfecho: 'Acompanhar novamente', responsavel: 'Lívia Campos', acompanharEm: '2026-10-02' },
  { id: 'tr2', quando: '2026-09-24T10:00:00Z', turmaId: 't1', alunoId: 'a4', tipo: 'Ativa', motivo: 'Saúde', descricao: 'Estudante internada; baixo desempenho não é de conteúdo. Combinado reforço com o tutor.', retorno: true, desfecho: 'Plano de recuperação', responsavel: 'Sônia Prado' },
  { id: 'tr3', quando: '2026-09-22T16:30:00Z', turmaId: 't3', tipo: 'Ativa', motivo: 'Atividade não entregue', descricao: 'Aviso coletivo no AVA e e-mail sobre o prazo da Atividade 2.', retorno: false, desfecho: 'Acompanhar novamente', responsavel: 'Lívia Campos', acompanharEm: '2026-09-29' },
  { id: 'tr4', quando: '2026-09-20T09:15:00Z', turmaId: 't7', alunoId: 'a36', tipo: 'Receptiva', motivo: 'Trabalho', descricao: 'Estudante mudou de turno na empresa e pediu orientação para reorganizar os estudos.', retorno: true, desfecho: 'Resolvido', responsavel: 'Lívia Campos' },
  { id: 'tr5', quando: '2026-09-18T11:40:00Z', turmaId: 't1', alunoId: 'a8', tipo: 'Ativa', motivo: 'Baixo acesso', descricao: 'Três tentativas de contato sem resposta.', retorno: false, desfecho: 'Alerta de desistência', responsavel: 'Lívia Campos', acompanharEm: '2026-09-28' },
]
export const useTratativas = () => useCollection<Tratativa>('tratativas-v1', tratativas)

// Financeiro: a CTM cobra o aluno até a DR formalizar a saída (desistência, trancamento, validação, transferência).
// Mudança de status no AVA sem formalização não para a cobrança. Formalizações até o dia 20 entram na cobrança do dia 5 seguinte.
export type SituacaoFormal = 'Desistente' | 'Trancado' | 'Validado' | 'Transferido'
export type Formalizacao = { id: string; situacao: SituacaoFormal; data: string; aPartirDe: string; registradoPor: string } // id = id do aluno; aPartirDe = UC a partir da qual não se cobra
const formalizacoes: Formalizacao[] = [
  { id: 'a11', situacao: 'Desistente', data: '2026-09-12', aPartirDe: 'Módulo atual', registradoPor: 'SENAI-MG (e-mail)' },
  { id: 'a25', situacao: 'Trancado', data: '2026-09-19', aPartirDe: 'Módulo atual', registradoPor: 'SENAI-MG' },
]
export const useFormalizacoes = () => useCollection<Formalizacao>('formalizacoes-v1', formalizacoes)

// Relatório de cobrança (CTM → DR solicitante), por proposta e ciclo financeiro (mês). Ajuste = linha extra do ciclo,
// ex.: aluno integrado depois da cobrança anterior. valorHora vem do curso da proposta.
export type AjusteCobranca = { id: string; propostaId: string; ciclo: string; uc: string; turma: string; ch: number; alunos: number; valorHora: number; observacao: string }
const ajustesCobranca: AjusteCobranca[] = [
  { id: 'aj1', propostaId: '2', ciclo: '2026-11', uc: 'Leitura de desenho técnico', turma: 'SENAI Maracanã', ch: 20, alunos: 1, valorHora: 8, observacao: 'Estudante Ana Clara Sousa integrada após a cobrança de 10/2026.' },
]
// Dupla checagem da desistência: o Moodle marca o aluno como desistente e a DR solicitante confirma ou contesta
// (falha de integração). id = id do aluno da turma (alunos-turma.ts).
export type ConfirmacaoDesistencia = { id: string; situacao: 'Confirmada' | 'Contestada'; em: string; por: string; motivo?: string }
export const useConfirmacoesDesistencia = () => useCollection<ConfirmacaoDesistencia>('desistencias-v2', [])
export const useAjustesCobranca = () => useCollection<AjusteCobranca>('ajustes-cobranca-v1', ajustesCobranca)
// Escolas de cada DR: o DR solicitante cadastra; o DN valida (Validada) ou recusa com motivo (Recusada: o DR ajusta e
// reenvia). Só escolas validadas entram nas turmas.
export type StatusEscola = 'Aguardando validação' | 'Validada' | 'Recusada'
export type Escola = { id: string; dr: string; nome: string; codigo: string; cidade: string; responsavel: string; email: string; status: StatusEscola; motivo?: string; cadastradaEm: string; validadaEm?: string; historico?: Registro[] }
const esc = (id: string, dr: string, nome: string, codigo: string, cidade: string, responsavel: string, status: StatusEscola = 'Validada', extra: Partial<Escola> = {}): Escola => ({
  id, dr, nome, codigo, cidade, responsavel, email: `${responsavel.split(' ')[0].toLowerCase()}@senai${dr.toLowerCase()}.org.br`, status,
  cadastradaEm: '2026-06-10', validadaEm: status === 'Validada' ? '2026-06-15' : undefined, ...extra,
})
const escolasSeed: Escola[] = [
  esc('es1', 'MG', 'SENAI CETEL', 'MG-0101', 'Belo Horizonte', 'Renato Lopes'),
  esc('es2', 'MG', 'SENAI Contagem', 'MG-0102', 'Contagem', 'Cláudia Freitas'),
  esc('es3', 'MG', 'SENAI Betim', 'MG-0103', 'Betim', 'Joana Paiva'),
  esc('es4', 'MG', 'SENAI Uberlândia', 'MG-0104', 'Uberlândia', 'Fábio Nogueira', 'Aguardando validação', { cadastradaEm: '2026-09-24' }),
  esc('es5', 'MG', 'SENAI Centro BH', 'MG-0105', 'Belo Horizonte', 'Sílvia Rocha', 'Recusada', { cadastradaEm: '2026-09-10', motivo: 'Unidade já cadastrada como SENAI CETEL (mesmo endereço).' }),
  esc('es6', 'RJ', 'SENAI Maracanã', 'RJ-0201', 'Rio de Janeiro', 'Luciana Prates'),
  esc('es7', 'RJ', 'SENAI Benfica', 'RJ-0202', 'Rio de Janeiro', 'André Moura'),
  esc('es8', 'RJ', 'SENAI Tijuca', 'RJ-0203', 'Rio de Janeiro', 'Priscila Neves'),
  esc('es9', 'RJ', 'SENAI Duque de Caxias', 'RJ-0204', 'Duque de Caxias', 'Rodrigo Tavares', 'Aguardando validação', { cadastradaEm: '2026-09-26' }),
  esc('es10', 'SP', 'SENAI Anchieta', 'SP-0301', 'São Paulo', 'Helena Duarte'),
  esc('es11', 'SP', 'SENAI Campinas', 'SP-0302', 'Campinas', 'Marcelo Viana'),
  esc('es12', 'SP', 'SENAI Santo André', 'SP-0303', 'Santo André', 'Beatriz Lemos', 'Aguardando validação', { cadastradaEm: '2026-09-27' }),
  esc('es13', 'BA', 'SENAI Dendezeiros', 'BA-0401', 'Salvador', 'Carla Menezes'),
]
export const useEscolas = () => useCollection<Escola>('escolas-v1', escolasSeed)
export const escolasDr: Record<string, string[]> ={ MG: ['SENAI CETEL', 'SENAI Contagem', 'SENAI Betim'], SP: ['SENAI Anchieta', 'SENAI Campinas'], BA: ['SENAI Dendezeiros'] }

// Super admin: usuários do sistema, permissões por perfil e trilha de auditoria.
export type StatusUsuario = 'Ativo' | 'Inativo'
export type Usuario = { id: string; nome: string; email: string; perfil: string; dr: string; status: StatusUsuario; ultimoAcesso: string }
const usuarios: Usuario[] = [
  { id: 'u1', nome: 'Maria Silva', email: 'maria.silva@senai.br', perfil: 'DN', dr: 'DN', status: 'Ativo', ultimoAcesso: '27/09/2026 17:42' },
  { id: 'u2', nome: 'Carlos Andrade', email: 'carlos.andrade@senaimg.org.br', perfil: 'CTM: Coordenador EAD', dr: 'MG', status: 'Ativo', ultimoAcesso: '28/09/2026 09:10' },
  { id: 'u3', nome: 'Juliana Pereira', email: 'juliana.pereira@senaimg.org.br', perfil: 'CTM: Gestor EAD', dr: 'MG', status: 'Ativo', ultimoAcesso: '26/09/2026 14:05' },
  { id: 'u7', nome: 'Paulo Mendes', email: 'paulo.mendes@senaimg.org.br', perfil: 'DR solicitante: Gestor EAD', dr: 'MG', status: 'Ativo', ultimoAcesso: '28/09/2026 11:00' },
  { id: 'u11', nome: 'Ana Ribeiro', email: 'ana.ribeiro@senaimg.org.br', perfil: 'DR solicitante: Coordenador EAD', dr: 'MG', status: 'Ativo', ultimoAcesso: '28/09/2026 10:40' },
  { id: 'u12', nome: 'Marcos Teixeira', email: 'marcos.teixeira@firjan.com.br', perfil: 'DR solicitante: Gestor Escolar', dr: 'RJ', status: 'Ativo', ultimoAcesso: '27/09/2026 15:20' },
  { id: 'u13', nome: 'Patrícia Gomes', email: 'patricia.gomes@firjan.com.br', perfil: 'DR solicitante: Coordenador Escolar', dr: 'RJ', status: 'Ativo', ultimoAcesso: '28/09/2026 09:05' },
  { id: 'u8', nome: 'Eduardo Lima', email: 'eduardo.lima@senaimg.org.br', perfil: 'CTM: Coordenador EAD', dr: 'MG', status: 'Ativo', ultimoAcesso: '28/09/2026 08:40' },
  { id: 'u9', nome: 'Sônia Prado', email: 'sonia.prado@senaimg.org.br', perfil: 'CTM: Coordenador Pedagógico', dr: 'MG', status: 'Ativo', ultimoAcesso: '27/09/2026 16:12' },
  { id: 'u5', nome: 'Roberto Lima', email: 'roberto.lima@senaisp.org.br', perfil: 'CTM: Coordenador EAD', dr: 'SP', status: 'Inativo', ultimoAcesso: '02/08/2026 08:15' },
  { id: 'u6', nome: 'Fernanda Costa', email: 'fernanda.costa@senai.br', perfil: 'Super admin', dr: 'DN', status: 'Ativo', ultimoAcesso: '28/09/2026 10:02' },
]
export const useUsuarios = () => useCollection<Usuario>('usuarios-v9', usuarios)

// Permissões: por perfil, as telas (path do menu) que ele acessa.
export type PermissaoPerfil = { id: string; perfil: string; telas: string[] }
const permissoes: PermissaoPerfil[] = [
  { id: 'DN', perfil: 'DN', telas: ['/painel-dn', '/drs', '/editais', '/portfolio/aprovacoes', '/portfolio'] },
  { id: 'CTM: Coordenador EAD', perfil: 'CTM: Coordenador EAD', telas: ['/painel-ctm', '/taas-ctm', '/gestao-produtos', '/produtos', '/oferta', '/equipe', '/tratativas', '/financeiro'] },
  { id: 'CTM: Coordenador Pedagógico', perfil: 'CTM: Coordenador Pedagógico', telas: ['/oferta', '/tratativas'] },
  { id: 'CTM: Tutor', perfil: 'CTM: Tutor', telas: ['/oferta'] },
  { id: 'CTM: Monitor', perfil: 'CTM: Monitor', telas: ['/oferta', '/tratativas'] },
  { id: 'DR solicitante: Gestor EAD', perfil: 'DR solicitante: Gestor EAD', telas: ['/acompanhamento', '/dashboard', '/contratos', '/turmas-ead', '/alunos', '/desistencias'] },
  { id: 'DR solicitante: Coordenador EAD', perfil: 'DR solicitante: Coordenador EAD', telas: ['/acompanhamento', '/dashboard', '/contratos', '/turmas-ead', '/alunos', '/desistencias'] },
  { id: 'DR solicitante: Gestor Escolar', perfil: 'DR solicitante: Gestor Escolar', telas: ['/acompanhamento', '/dashboard', '/contratos', '/turmas-ead', '/alunos', '/desistencias'] },
  { id: 'DR solicitante: Coordenador Escolar', perfil: 'DR solicitante: Coordenador Escolar', telas: ['/acompanhamento', '/dashboard', '/contratos', '/turmas-ead', '/alunos', '/desistencias'] },
  { id: 'CTM: Gestor EAD', perfil: 'CTM: Gestor EAD', telas: ['/painel-comercial', '/taas-ctm', '/gestao-produtos', '/produtos', '/oferta', '/equipe', '/tratativas', '/financeiro'] },
  { id: 'Super admin', perfil: 'Super admin', telas: ['/drs', '/dashboard', '/taas-ctm', '/editais', '/portfolio/aprovacoes', '/portfolio', '/gestao-produtos', '/produtos', '/oferta', '/equipe', '/tratativas', '/financeiro', '/acompanhamento', '/contratos', '/turmas-ead', '/alunos', '/admin/usuarios', '/admin/perfis', '/admin/auditoria', '/admin/logs', '/admin/feriados'] },
]
export const usePermissoes = () => useCollection<PermissaoPerfil>('permissoes-v16', permissoes)

export type Evento = { id: string; quando: string; usuario: string; perfil: string; acao: string; alvo: string }
const auditoria: Evento[] = [
  { id: 'e1', quando: '28/09/2026 10:02', usuario: 'Fernanda Costa', perfil: 'Super admin', acao: 'Login', alvo: '—' },
  { id: 'e2', quando: '28/09/2026 09:15', usuario: 'Carlos Andrade', perfil: 'CTM: Coordenador EAD', acao: 'Criação', alvo: 'Oferta TU-MG-002/2026' },
  { id: 'e3', quando: '27/09/2026 17:40', usuario: 'Maria Silva', perfil: 'DN', acao: 'Alteração', alvo: 'Edital ED-002/2026' },
  { id: 'e4', quando: '27/09/2026 16:22', usuario: 'Juliana Pereira', perfil: 'CTM: Gestor EAD', acao: 'Aceite', alvo: 'Proposta PC-MG-002/2026' },
  { id: 'e5', quando: '26/09/2026 11:08', usuario: 'Fernanda Costa', perfil: 'Super admin', acao: 'Inativação', alvo: 'Usuário Roberto Lima' },
  { id: 'e6', quando: '25/09/2026 15:47', usuario: 'Maria Silva', perfil: 'DN', acao: 'Criação', alvo: 'TAA TAA-004/2026' },
  { id: 'e7', quando: '24/09/2026 09:30', usuario: 'Fernanda Costa', perfil: 'Super admin', acao: 'Alteração', alvo: 'Permissões do perfil Gestor EAD' },
]
export const useAuditoria = () => useCollection<Evento>('auditoria-v3', auditoria)

// ── Acompanhamento (DR solicitante) ─────────────────────────────────────────
// A DR solicitante vende o curso a uma empresa e contrata o CTM para operar o EAD (tutoria e monitoria).
// Datas ISO (aaaa-mm-dd). HOJE fixo para o protótipo.

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
export const useContratosCtm = () => useCollection<ContratoCtm>('contratos-ctm-v4', contratosCtm)

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
export const useTurmasEad = () => useCollection<TurmaEad>('turmas-ead-v4', turmasEad)
export const statusTurmaEad = (t: TurmaEad): StatusTurmaEad => (HOJE < t.inicio ? 'A iniciar' : HOJE > t.fim ? 'Finalizada' : 'Em andamento')
// Progresso esperado da turma pelo calendário (0–100).
export const progressoEsperado = (t: TurmaEad) => Math.max(0, Math.min(100, Math.round((diasEntre(t.inicio, HOJE) / diasEntre(t.inicio, t.fim)) * 100)))

export type Portal = 'AVA' | 'Portal do estudante'
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
      portal: ((k + n) % 3 === 0 ? 'Portal do estudante' : 'AVA') as Portal,
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
export const useAlunosEad = () => useCollection<AlunoEad>('alunos-ead-v5', alunosEad)

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
  { usuario: 'Carlos Andrade', email: 'carlos.andrade@senaimg.org.br', perfil: 'CTM: Coordenador EAD', dr: 'MG' },
  { usuario: 'Juliana Pereira', email: 'juliana.pereira@senaimg.org.br', perfil: 'CTM: Gestor EAD', dr: 'MG' },
  { usuario: 'Maria Silva', email: 'maria.silva@senai.br', perfil: 'DN', dr: 'DN' },
  { usuario: 'Paulo Mendes', email: 'paulo.mendes@senaimg.org.br', perfil: 'DR solicitante: Gestor EAD', dr: 'MG' },
]
const acoesLog: [AcaoLog, string, string, Alteracao[]][] = [
  ['Login', 'Autenticação', '—', []],
  ['Criou', 'Gestão de propostas', 'Proposta PC-MG-004/2026', [{ campo: 'Status', antes: '—', depois: 'Em elaboração' }]],
  ['Editou', 'Gestão de Editais', 'Edital ED-002/2026', [{ campo: 'Vigência (fim)', antes: '31/01/2027', depois: '28/02/2027' }, { campo: 'Valor', antes: 'R$ 8.640,00', depois: 'R$ 9.040,00' }]],
  ['Visualizou', 'Estudantes', 'Estudante Daniel Rocha', []],
  ['Aceitou', 'Gestão de propostas', 'Proposta PC-MG-002/2026', [{ campo: 'Status', antes: 'Em análise', depois: 'Aceita' }]],
  ['Exportou', 'Gestão de Contratos', 'Contratos (4 registros)', []],
  ['Anexou', 'Gestão de TAA', 'TAA 101/2026', [{ campo: 'TAA assinado', antes: '—', depois: 'TAA-101-2026-assinado.pdf' }, { campo: 'Status', antes: 'Em elaboração', depois: 'Vigente' }]],
  ['Excluiu', 'Gestão de Portfólio', 'Produto Soldador (versão 1)', []],
  ['Recusou', 'Gestão de propostas', 'Proposta PC-MG-003/2026', [{ campo: 'Status', antes: 'Em análise', depois: 'Recusada' }, { campo: 'Feedback', antes: '—', depois: 'Valor acima do previsto no edital' }]],
  ['Editou', 'Gestão de usuários', 'Usuário Roberto Lima', [{ campo: 'Status', antes: 'Ativo', depois: 'Inativo' }]],
  ['Visualizou', 'Painel', 'Painel do DR solicitante', []],
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
export const useLogs = () => useCollection<LogSistema>('logs-v3', logs)
