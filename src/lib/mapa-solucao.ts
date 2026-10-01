// Mapa Geral da Solução CTM - Baseado no Draw.io Mapa-geral-solucao-CTM.drawio
// Gerado automaticamente a partir do diagrama

export type Modulo = {
  id: string
  nome: string
  icone: string
  cor: string
  corBorda: string
  itens: string[]
  descricao?: string
}

export type FluxoEtapa = {
  id: string
  nome: string
  cor: string
  corBorda: string
}

export type Integracao = {
  id: string
  nome: string
  descricao: string
  cor: string
  corBorda: string
}

export type Pagina = {
  id: string
  nome: string
  descricao?: string
}

// ========================================
// PÁGINA 1: VISÃO GERAL DOS MÓDULOS
// ========================================

export const modulos: Modulo[] = [
  {
    id: 'usuarios',
    nome: 'GESTÃO DE USUÁRIOS',
    icone: '👥',
    cor: '#dbeafe',
    corBorda: '#3b82f6',
    itens: [
      'Super Admin',
      'DN (Departamento Nacional)',
      'CTM (5 perfis)',
      'DR Solicitante (4 perfis)',
      'Atribuição de permissões',
    ],
  },
  {
    id: 'drs',
    nome: 'GESTÃO DE DRs',
    icone: '🏢',
    cor: '#dcfce7',
    corBorda: '#22c55e',
    itens: [
      'Cadastro DRs (CNPJ, etc)',
      'Status credenciamento',
      'Histórico credenciamento',
      'Escolas vinculadas',
      'Calendário (feriados)',
    ],
  },
  {
    id: 'portfolio',
    nome: 'GESTÃO DE PORTFÓLIO',
    icone: '📚',
    cor: '#fef3c7',
    corBorda: '#f59e0b',
    itens: [
      'Cursos (CH, matriz)',
      'Módulos e UCs',
      'Planos de ensino (links)',
      'Materiais didáticos (links Drive/RD)',
      'Áreas conforme edital vigente',
    ],
  },
  {
    id: 'contratos',
    nome: 'GESTÃO DE CONTRATOS',
    icone: '📋',
    cor: '#f3e8ff',
    corBorda: '#a855f7',
    itens: [
      'Editais (DN)',
      'TAAs (vigência, anexo)',
      'Propostas técnicas',
      'Workflow aprovação',
      'Monitoramento saldo',
    ],
  },
  {
    id: 'planejamento',
    nome: 'PLANEJAMENTO',
    icone: '📅',
    cor: '#fee2e2',
    corBorda: '#ef4444',
    itens: [
      'Ofertas (proposta aceita)',
      'Código turma automático',
      'Equipe técnica',
      'Cronograma',
      'Confirmação SGE',
    ],
  },
  {
    id: 'execucao',
    nome: 'EXECUÇÃO',
    icone: '🎓',
    cor: '#cffafe',
    corBorda: '#06b6d4',
    itens: [
      'Equipe pedagógica',
      'Dias presenciais/ao vivo',
      'Criar salas AVA',
      'Validar planejamento',
      'Parametrizar avaliações',
    ],
  },
  {
    id: 'faturamento',
    nome: 'FATURAMENTO',
    icone: '💰',
    cor: '#d1fae5',
    corBorda: '#10b981',
    itens: [
      'Cálculo por UC',
      'Alunos ativos × Valor hora × CH',
      'Ajustes (acréscimo/desconto)',
      'Relatório de cobrança',
      'Histórico de faturamento',
    ],
  },
  {
    id: 'acompanhamento',
    nome: 'ACOMPANHAMENTO PEDAGÓGICO',
    icone: '📊',
    cor: '#fce7f3',
    corBorda: '#db2777',
    itens: [
      'Integração alunos D-1 (config código sala SGE)',
      'Dados AVA (último acesso, desempenho, notas)',
      'Ocorrências monitoria/pedagógico',
      'Pesquisa diagnóstica (curso)',
      'Pesquisa satisfação (por UC)',
      'Pesquisa encerramento (todas UCs finalizadas)',
    ],
  },
]

// ========================================
// FLUXO PRINCIPAL DO SISTEMA
// ========================================

export const fluxoPrincipal: FluxoEtapa[] = [
  { id: 'usuarios', nome: 'Usuários/DRs', cor: '#dbeafe', corBorda: '#3b82f6' },
  { id: 'portfolio', nome: 'Portfólio', cor: '#fef3c7', corBorda: '#f59e0b' },
  { id: 'edital', nome: 'Edital (DN)', cor: '#f3e8ff', corBorda: '#a855f7' },
  { id: 'taa', nome: 'TAA (DR)', cor: '#f3e8ff', corBorda: '#a855f7' },
  { id: 'proposta', nome: 'Proposta', cor: '#f3e8ff', corBorda: '#a855f7' },
  { id: 'oferta', nome: 'Oferta', cor: '#fee2e2', corBorda: '#ef4444' },
  { id: 'execucao-ucs', nome: 'Execução UCs', cor: '#cffafe', corBorda: '#06b6d4' },
  { id: 'integra-ava', nome: 'Integra AVA', cor: '#cffafe', corBorda: '#06b6d4' },
  { id: 'acompanha', nome: 'Acompanha Alunos', cor: '#fce7f3', corBorda: '#db2777' },
  { id: 'pesquisas', nome: 'Pesquisas', cor: '#fce7f3', corBorda: '#db2777' },
  { id: 'faturamento', nome: 'Faturamento', cor: '#d1fae5', corBorda: '#10b981' },
]

// ========================================
// INTEGRAÇÕES EXTERNAS
// ========================================

export const integracoes: Integracao[] = [
  {
    id: 'date-nager',
    nome: 'Date Nager API',
    descricao: 'Feriados nacionais',
    cor: '#dbeafe',
    corBorda: '#3b82f6',
  },
  {
    id: 'ava-moodle',
    nome: 'AVA Moodle',
    descricao: 'Turmas, alunos, notas',
    cor: '#dcfce7',
    corBorda: '#22c55e',
  },
  {
    id: 'sge',
    nome: 'SGE',
    descricao: 'Matrículas',
    cor: '#a20025',
    corBorda: '#6F0000',
  },
  {
    id: 'itinerarios',
    nome: 'IN (Itinerários)',
    descricao: 'Matriz curricular?',
    cor: '#f3e8ff',
    corBorda: '#a855f7',
  },
]

// ========================================
// PÁGINA 2: GESTÃO DE USUÁRIOS E DRs
// ========================================

export type Perfil = {
  id: string
  nome: string
  icone: string
  cor: string
  nivel: number
  responsabilidades: string[]
}

export const hierarquiaPerfis: Perfil[] = [
  {
    id: 'super-admin',
    nome: 'SUPER ADMIN',
    icone: '🔑',
    cor: '#1e40af',
    nivel: 1,
    responsabilidades: [
      'Acesso total ao sistema',
      'Cadastra DRs e usuários',
      'Gerencia editais',
      'Configura permissões',
    ],
  },
  {
    id: 'dn',
    nome: 'DN (Departamento Nacional)',
    icone: '🏛️',
    cor: '#7c3aed',
    nivel: 2,
    responsabilidades: [
      'Gerencia editais',
      'Aprova portfólio',
      'Visualiza todas as CTMs',
      'Gestão de DRs credenciadas',
    ],
  },
]

export const perfisCTM = [
  { id: 'ctm-gestor-ead', nome: 'CTM: Gestor EAD', icone: '👔', cor: '#0891b2' },
  { id: 'ctm-coordenador-ead', nome: 'CTM: Coordenador EAD', icone: '📋', cor: '#0891b2' },
  { id: 'ctm-coordenador-pedagogico', nome: 'CTM: Coordenador Pedagógico', icone: '👨‍🏫', cor: '#0891b2' },
  { id: 'ctm-tutor', nome: 'CTM: Tutor', icone: '📚', cor: '#0891b2' },
  { id: 'ctm-monitor', nome: 'CTM: Monitor', icone: '📞', cor: '#0891b2' },
]

export const perfisDRSolicitante = [
  { id: 'dr-gestor-ead', nome: 'DR solicitante: Gestor EAD', icone: '👔', cor: '#059669' },
  { id: 'dr-coordenador-ead', nome: 'DR solicitante: Coordenador EAD', icone: '📋', cor: '#059669' },
  { id: 'dr-gestor-escolar', nome: 'DR solicitante: Gestor Escolar', icone: '🏫', cor: '#059669' },
  { id: 'dr-coordenador-escolar', nome: 'DR solicitante: Coordenador Escolar', icone: '👨‍🏫', cor: '#059669' },
]

// ========================================
// PÁGINA 3: GESTÃO DE PORTFÓLIO
// ========================================

export type FluxoPortfolio = {
  id: string
  titulo: string
  descricao: string
  ator: string
  status?: string
}

export const fluxoPortfolio: FluxoPortfolio[] = [
  {
    id: 'cadastro',
    titulo: 'Cadastro de Cursos',
    descricao: 'DR cadastra cursos com matriz curricular (módulos e UCs) conforme áreas permitidas no edital vigente',
    ator: 'DR Credenciado',
  },
  {
    id: 'materiais',
    titulo: 'Links de Materiais',
    descricao: 'Cadastro dos links dos materiais didáticos (Drive ou RD)',
    ator: 'DR Credenciado',
  },
]

// ========================================
// PÁGINA 4: GESTÃO DE CONTRATOS
// ========================================

export type StatusContrato = 'Aceito' | 'Em análise' | 'Cancelado'

export const fluxoContratos = {
  editais: {
    descricao: 'DN publica editais com vigência, áreas tecnológicas e cursos',
    responsavel: 'DN',
    campos: ['Vigência', 'Áreas tecnológicas', '1 DR credenciado por área', 'Valor hora/aluno por DR × área'],
  },
  taas: {
    descricao: 'TAA por DR - Termo de Acordo Administrativo',
    responsavel: 'CTM: Gestor EAD',
    campos: ['Vigência', 'DR Contratante', 'Anexo', 'Σ valores executados (propostas)', 'Status'],
    status: ['Aceito', 'Em análise', 'Cancelado'] as StatusContrato[],
  },
  propostas: {
    descricao: 'Propostas técnicas vinculadas a TAAs aceitos',
    responsavel: 'CTM: Gestor EAD',
    campos: ['Cursos', 'Valor', 'Alunos previstos', 'Turmas', 'Escolas', 'Equipe inicial'],
  },
}

// ========================================
// PÁGINA 5: PLANEJAMENTO DA OFERTA
// ========================================

export const fluxoPlanejamento = {
  criacaoOferta: {
    titulo: 'Criação de Oferta',
    descricao: 'Ofertas criadas a partir de propostas aceitas',
    regras: [
      'Código da turma gerado automaticamente',
      'Vinculação de equipe técnica (supervisor, analista)',
      'Cronograma gerado pelo sistema',
    ],
  },
  statusOferta: ['Adiada', 'Cancelada', 'Confirmada SGE'] as const,
  confirmacaoSGE: {
    descricao: 'Turma confirmada no SGE para início da execução',
    ator: 'DR Contratante',
  },
}

// ========================================
// PÁGINA 6: EXECUÇÃO POR UC
// ========================================

export const fluxoExecucao = {
  equipePedagogica: {
    titulo: 'Equipe Pedagógica',
    papeis: ['Coordenador Pedagógico', 'Tutor', 'Monitor'],
  },
  atividadesPresenciais: {
    titulo: 'Atividades Presenciais e Ao Vivo',
    descricao: 'Configuração de dias presenciais e aulas ao vivo por UC',
  },
  criacaoSalas: {
    titulo: 'Criar Salas AVA',
    descricao: 'Monitor cria salas no Moodle via integração',
    status: ['Em criação', 'Criada'],
  },
  validacaoPedagogica: {
    titulo: 'Validação Pedagógica',
    descricao: 'Tutor valida o planejamento das UCs',
    fluxo: ['Planejar', 'Avaliar', 'Aprovar/Devolver'],
  },
  parametrizacao: {
    titulo: 'Parametrizar Avaliações',
    descricao: 'Monitor configura avaliações no Moodle após aprovação do tutor',
  },
}

// ========================================
// PÁGINA 7: ACOMPANHAMENTO PEDAGÓGICO
// ========================================

export const fluxoAcompanhamento = {
  integracaoAlunos: {
    titulo: 'Integração de Alunos D-1',
    descricao: 'Configuração do código da sala SGE para integração',
    prazo: 'D-1 (um dia antes do início)',
  },
  dadosAVA: {
    titulo: 'Dados do AVA',
    metricas: ['Último acesso', 'Desempenho', 'Notas'],
  },
  ocorrencias: {
    titulo: 'Ocorrências',
    tipos: ['Monitoria', 'Pedagógicas'],
  },
  pesquisas: {
    titulo: 'Pesquisas de Satisfação',
    tipos: [
      { id: 'diagnostica', nome: 'Pesquisa Diagnóstica', momento: 'Início do curso' },
      { id: 'satisfacao-uc', nome: 'Pesquisa de Satisfação', momento: 'Por UC' },
      { id: 'encerramento', nome: 'Pesquisa de Encerramento', momento: 'Todas UCs finalizadas' },
    ],
  },
}

// ========================================
// PÁGINA 8: ARQUITETURA DE INTEGRAÇÕES
// ========================================

export const arquiteturaIntegracoes = {
  fluxoDados: [
    { origem: 'SGE', destino: 'AVA', dados: 'Matrículas, dados cadastrais' },
    { origem: 'AVA', destino: 'CTM', dados: 'Turmas, alunos, notas, acessos' },
    { origem: 'CTM', destino: 'AVA', dados: 'Salas, configurações' },
    { origem: 'Date Nager', destino: 'CTM', dados: 'Feriados nacionais' },
  ],
  regrasEditabilidade: {
    AVA: { editavel: false, descricao: 'Dados somente leitura no CTM' },
    SGE: { editavel: false, descricao: 'Dados somente leitura no CTM' },
    CTM: { editavel: true, descricao: 'Dados criados e editáveis no CTM' },
  },
}

// ========================================
// PÁGINA 9: AGRUPADOR DE UCs
// ========================================

export const agrupadorUCs = {
  objetivo: 'Otimização de recursos - agrupar UCs para aulas ao vivo com 1 tutor',
  regras: [
    'Mesma UC do portfólio',
    'Mesmo dia de aula ao vivo',
    'Mesmo horário',
    'Turmas diferentes podem ser agrupadas',
  ],
  beneficios: [
    '1 tutor para múltiplas turmas/UCs',
    'Redução de custos operacionais',
    'Eventualmente compartilha equipe técnica',
  ],
}

// ========================================
// PÁGINA 10: FATURAMENTO
// ========================================

export const fluxoFaturamento = {
  calculoBase: {
    formula: 'Alunos Ativos × Valor Hora × CH (por UC)',
    regraAlunoAtivo: 'Esteve ativo pelo menos 1 dia no período já conta',
  },
  alteracaoSituacao: {
    descricao: 'Alteração manual de situação com histórico obrigatório',
    niveis: ['Por UC', 'Por Turma'],
  },
  ajustes: {
    tipos: ['Acréscimo', 'Desconto'],
    obrigatorio: 'Justificativa obrigatória',
  },
  filtrosVisualizacao: ['DR', 'TAA', 'Proposta', 'Turma', 'Aluno', 'Período'],
  relatorioCobranca: {
    agrupamento: 'Por proposta (propostas do mesmo TAA)',
    historico: 'Relatórios devem ser salvos para histórico',
  },
  reaproveitamento: '⚠️ Avaliar e reaproveitar regras da planilha financeira do SGN',
}

// ========================================
// TIPOS DE DR
// ========================================

export const tiposDR = {
  credenciada: {
    nome: 'DR CREDENCIADA (Ofertante)',
    responsabilidades: [
      'Cadastra cursos no portfólio',
      'Executa os cursos',
      'Registra TAAs e propostas',
    ],
  },
  contratante: {
    nome: 'DR CONTRATANTE',
    responsabilidades: [
      'Demanda os cursos',
      'Recebe as turmas',
    ],
  },
  nota: '⚠️ Mesmo DR pode ser ambos!',
}

// ========================================
// LEGENDA DE CORES
// ========================================

export const legendaCores = [
  { cor: '#dbeafe', nome: 'Usuários/DRs' },
  { cor: '#fef3c7', nome: 'Portfólio' },
  { cor: '#f3e8ff', nome: 'Contratos' },
  { cor: '#fee2e2', nome: 'Planejamento' },
  { cor: '#cffafe', nome: 'Execução' },
  { cor: '#fce7f3', nome: 'Acompanhamento' },
  { cor: '#d1fae5', nome: 'Faturamento' },
]

// ========================================
// LISTA DE PÁGINAS DO DIAGRAMA
// ========================================

export const paginas: Pagina[] = [
  { id: 'visao-geral', nome: '1-Visão Geral Módulos', descricao: '7 módulos principais + fluxo de alto nível + integrações' },
  { id: 'usuarios-drs', nome: '2-Gestão Usuários e DRs', descricao: 'Hierarquia de perfis + Cadastro DR + Escolas + Calendário' },
  { id: 'portfolio', nome: '3-Gestão de Portfólio', descricao: 'Cadastro de cursos pelo DR + Matriz curricular + Links materiais (Drive/RD)' },
  { id: 'contratos', nome: '4-Gestão de Contratos', descricao: 'Editais (DN) + TAAs (DR) + Propostas técnicas + Workflow completo' },
  { id: 'planejamento', nome: '5-Planejamento da Oferta', descricao: 'Ofertas a partir de proposta + Código turma + Equipe técnica + Status' },
  { id: 'execucao', nome: '6-Execução por UC', descricao: 'Equipe pedagógica + Atividades presenciais/ao vivo + Salas AVA + Validação + Nota SGN' },
  { id: 'acompanhamento', nome: '7-Acompanhamento Pedagógico', descricao: 'Integração alunos D-1 + Dados AVA + Ocorrências + Pesquisas' },
  { id: 'integracoes', nome: '8-Arquitetura de Integrações', descricao: 'SGE↔AVA↔CTM + Regras de editabilidade + Date Nager API' },
  { id: 'agrupador', nome: '9-Agrupador de UCs', descricao: 'Otimização de recursos - agrupar UCs para aulas ao vivo com 1 tutor' },
  { id: 'faturamento', nome: '10-Faturamento', descricao: 'Cálculo (alunos ativos × valor hora) + Ajustes + Relatório de cobrança' },
]
