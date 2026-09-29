// Processo ponta a ponta da CTM em notação BPMN simplificada (pools/raias, tarefas, decisões, eventos).
// Fonte: reunião de processos de 28/09/2026 + regras em docs/fluxo.md. Usado pelo painel Mapa do processo da casca (src/pages/processo.tsx → MapaProcesso).

export type Pool = { id: string; nome: string; cor: string }
export type Raia = { id: string; nome: string; pool: string; perfil?: string } // perfil = perfil do protótipo que faz a tarefa
export type TipoNo = 'inicio' | 'fim' | 'tarefa' | 'decisao' | 'paralelo' | 'tempo'
export type No = {
  id: string
  tipo: TipoNo
  raia: string
  col: number // coluna (ordem no tempo)
  rotulo: string
  fase: string
  descricao?: string
  regras?: string[]
  tela?: string // rota no protótipo
  fora?: boolean // acontece fora do sistema (e-mail, assinatura, SGE…)
}
export type Aresta = { de: string; para: string; rotulo?: string }
export type Fase = { id: string; nome: string }

export const pools: Pool[] = [
  { id: 'dn', nome: 'SENAI DN', cor: '#0284c7' },
  { id: 'ctm', nome: 'CTM (DR ofertante)', cor: '#ea580c' },
  { id: 'dr', nome: 'DR contratante', cor: '#ca8a04' },
  { id: 'sis', nome: 'Sistemas', cor: '#64748b' },
]

export const raias: Raia[] = [
  { id: 'dn', nome: 'DN', pool: 'dn', perfil: 'DN' },
  { id: 'comercial', nome: 'Comercial', pool: 'ctm', perfil: 'CTM: Comercial' },
  { id: 'supervisor', nome: 'Supervisão', pool: 'ctm', perfil: 'CTM: Supervisor' },
  { id: 'pcp', nome: 'PCP', pool: 'ctm' },
  { id: 'analista', nome: 'Analista', pool: 'ctm' },
  { id: 'tutor', nome: 'Tutor', pool: 'ctm' },
  { id: 'monitoria', nome: 'Monitoria e pedagógico', pool: 'ctm' },
  { id: 'financeiro', nome: 'Financeiro', pool: 'ctm' },
  { id: 'dr', nome: 'DR contratante', pool: 'dr', perfil: 'DR solicitante' },
  { id: 'ava', nome: 'AVA / SGE', pool: 'sis' },
]

export const fases: Fase[] = [
  { id: 'credenciamento', nome: 'Credenciamento' },
  { id: 'contrato', nome: 'Contrato (TAA)' },
  { id: 'proposta', nome: 'Proposta comercial' },
  { id: 'oferta', nome: 'Gestão da oferta' },
  { id: 'execucao', nome: 'Gestão da execução' },
  { id: 'integracao', nome: 'Integração' },
  { id: 'acompanhamento', nome: 'Acompanhamento' },
  { id: 'financeiro', nome: 'Financeiro' },
]

export const nos: No[] = [
  // Credenciamento
  { id: 'inicio', tipo: 'inicio', raia: 'dn', col: 0, rotulo: 'Início', fase: 'credenciamento' },
  { id: 'credenciar', tipo: 'tarefa', raia: 'dn', col: 1, rotulo: 'Credenciar DR', fase: 'credenciamento', tela: '/drs/novo', descricao: 'O DN credencia o Departamento Regional que vai operar como CTM.', regras: ['DR nasce Ativa; pode ser inativada com confirmação.'] },
  { id: 'edital', tipo: 'tarefa', raia: 'dn', col: 2, rotulo: 'Publicar edital', fase: 'credenciamento', tela: '/editais/novo', descricao: 'Vigência, áreas tecnológicas e cursos do portfólio nacional, com valor e DRs credenciados por curso.', regras: ['Área, modalidade e CH vêm do catálogo (fixas).', 'Só se oferta o que está no edital.'] },
  { id: 'produto', tipo: 'tarefa', raia: 'supervisor', col: 3, rotulo: 'Cadastrar produto (matriz)', fase: 'credenciamento', tela: '/gestao-produtos/novo', descricao: 'Cada CTM cadastra seus produtos: módulos e UCs conforme o plano de curso.', regras: ['Nova versão não altera o que já foi negociado na anterior.', 'Versões podem rodar ao mesmo tempo.'] },

  // Contrato
  { id: 'taa', tipo: 'tarefa', raia: 'comercial', col: 4, rotulo: 'Elaborar TAA (modelo do DN)', fase: 'contrato', tela: '/meus-taas/novo', descricao: 'Guarda-chuva com a DR: vigência e valor global (teto). Sem produtos.', regras: ['Modelo padrão do DN, por edital.', 'Passar do teto exige aditivo.'] },
  { id: 'assinar-taa', tipo: 'tarefa', raia: 'dr', col: 5, rotulo: 'Assinar TAA', fase: 'contrato', fora: true, descricao: 'Assinatura fora do sistema (assinatura digital ou sistema da DR).' },
  { id: 'taa-vigente', tipo: 'tarefa', raia: 'comercial', col: 6, rotulo: 'Anexar TAA assinado', fase: 'contrato', tela: '/meus-taas', descricao: 'Com o termo assinado anexado, o TAA fica Vigente.' },

  // Proposta
  { id: 'proposta', tipo: 'tarefa', raia: 'comercial', col: 7, rotulo: 'Registrar proposta', fase: 'proposta', tela: '/produtos/novo', descricao: 'O documento é feito no modelo, fora; no sistema fica o registro mínimo: DR, CNPJ, faturamento, nº CRM, link e cursos com vagas, início previsto e valor.', regras: ['Nasce Em negociação.', 'Cada curso só em uma proposta (pendente de validação).'] },
  { id: 'alerta-prazo', tipo: 'tempo', raia: 'comercial', col: 8, rotulo: 'Início em ≤ 15 dias', fase: 'proposta', tela: '/produtos', descricao: 'Proposta ainda não aceita com turma prevista para começar em até 15 dias aparece com alerta.' },
  { id: 'dr-aceita', tipo: 'decisao', raia: 'dr', col: 8, rotulo: 'Aceita?', fase: 'proposta', fora: true, descricao: 'A negociação acontece fora do sistema (rodadas de reunião).' },
  { id: 'nova-rodada', tipo: 'tarefa', raia: 'comercial', col: 9, rotulo: 'Duplicar (nova rodada)', fase: 'proposta', tela: '/produtos', descricao: 'Copia a proposta para ajustes; registra de qual proposta veio.' },
  { id: 'aceite', tipo: 'tarefa', raia: 'comercial', col: 10, rotulo: 'Registrar aceite', fase: 'proposta', tela: '/produtos', descricao: 'Marca a proposta como Aceita (ou Recusada, com feedback). Aceita ainda pode ser cancelada.' },

  // Oferta
  { id: 'nova-oferta', tipo: 'tarefa', raia: 'supervisor', col: 11, rotulo: 'Nova oferta + cronograma', fase: 'oferta', tela: '/oferta/proposta/2/nova', descricao: 'Escolhe a proposta aceita e os cursos; o sistema gera o cronograma por UC.', regras: ['Só dias úteis; pula feriados, recessos e férias do Calendário.', 'Semanas = CH ÷ horas por semana; UC termina na sexta.', 'UCs agrupáveis com outras turmas ficam marcadas.'] },
  { id: 'enviar-cron', tipo: 'tarefa', raia: 'supervisor', col: 12, rotulo: 'Enviar cronograma à DR', fase: 'oferta', tela: '/oferta/t2', descricao: 'Registra o envio (e-mail) com prazo de validação.' },
  { id: 'valida', tipo: 'decisao', raia: 'dr', col: 13, rotulo: 'Valida?', fase: 'oferta', fora: true, descricao: 'A DR valida ou pede ajuste. Sem resposta até o prazo, conta como validado.' },
  { id: 'ajuste', tipo: 'tarefa', raia: 'supervisor', col: 14, rotulo: 'Nova versão do cronograma', fase: 'oferta', tela: '/oferta/t2', descricao: 'Gera a versão seguinte com o que a DR pediu.' },
  { id: 'fecha', tipo: 'decisao', raia: 'dr', col: 15, rotulo: 'Turma fecha?', fase: 'oferta', fora: true, descricao: 'A DR confirma se a turma vai começar (mínimo de inscritos é regra de cada DR). Aviso com 10 dias de antecedência.' },
  { id: 'cancelada', tipo: 'fim', raia: 'dr', col: 16, rotulo: 'Turma cancelada', fase: 'oferta', tela: '/oferta/t1', descricao: 'Cancelar turma com motivo; ou prorrogar o início (todas as datas andam junto).' },
  { id: 'confirmar', tipo: 'tarefa', raia: 'supervisor', col: 16, rotulo: 'Confirmar turma (Buscar tutor)', fase: 'oferta', tela: '/oferta/t1', descricao: 'Com o cronograma validado e a DR confirmando, a turma vai para Buscar tutor: é o gatilho do PCP e da criação de salas.' },

  // Execução
  { id: 'split', tipo: 'paralelo', raia: 'supervisor', col: 17, rotulo: '', fase: 'execucao', descricao: 'A partir de Buscar tutor, os processos correm em paralelo.' },
  { id: 'equipe', tipo: 'tarefa', raia: 'supervisor', col: 18, rotulo: 'Alocar monitores e pedagógico', fase: 'execucao', tela: '/oferta/t1?aba=execucao', descricao: 'Monitor front, monitor back, pedagógico e interlocutor da turma (funções configuráveis por CTM).' },
  { id: 'tutor', tipo: 'tarefa', raia: 'pcp', col: 18, rotulo: 'Alocar tutor e aulas ao vivo', fase: 'execucao', tela: '/oferta/t1?aba=execucao', descricao: 'Tutor por UC (competência e disponibilidade) e o dia das aulas ao vivo, olhando o curso inteiro.', regras: ['Ação sugerida pelo histórico: Planejamento, Replanejamento ou Apropriação.'] },
  { id: 'email', tipo: 'tarefa', raia: 'analista', col: 19, rotulo: 'Gerar e-mail ao tutor', fase: 'execucao', tela: '/oferta/t1?aba=execucao', descricao: 'O sistema monta o e-mail com dados e links; o envio é fora. Depois, tutor confirmado.', regras: ['Documentos ficam no drive: o sistema guarda só os links.'] },
  { id: 'planejar', tipo: 'tarefa', raia: 'tutor', col: 20, rotulo: 'Planejar / apropriar UC', fase: 'execucao', fora: true, descricao: 'Apropriação usa a sala modelo e informa as datas das avaliações; planejamento/replanejamento produz material.' },
  { id: 'valida-ped', tipo: 'decisao', raia: 'monitoria', col: 21, rotulo: 'Planejamento?', fase: 'execucao', descricao: 'Planejamento e replanejamento passam pela validação pedagógica; apropriação segue direto.' },
  { id: 'sala', tipo: 'tarefa', raia: 'monitoria', col: 22, rotulo: 'Subir material na sala', fase: 'execucao', fora: true, descricao: 'Monitor back sobe o material e cadastra as avaliações no AVA.' },

  // Integração
  { id: 'criar-salas', tipo: 'tarefa', raia: 'ava', col: 18, rotulo: 'Criar salas no AVA', fase: 'integracao', tela: '/oferta/t1?aba=integracao', descricao: 'Botão no MVP; cada UC recebe o ID da sala.' },
  { id: 'dados-int', tipo: 'tarefa', raia: 'dr', col: 19, rotulo: 'Parametrizar SGE e integrar alunos', fase: 'integracao', fora: true, tela: '/oferta/t1?aba=integracao', descricao: 'A DR usa o código CTM por escola + IDs das salas. A integração roda 5 dias antes do início.' },
  { id: 'status-int', tipo: 'tempo', raia: 'ava', col: 20, rotulo: '5 dias antes do início', fase: 'integracao', tela: '/oferta/t1?aba=integracao', descricao: 'Situação da integração por escola (integrados × alunos) e alerta quando a DR ainda não integrou.' },

  // Acompanhamento
  { id: 'join', tipo: 'paralelo', raia: 'supervisor', col: 23, rotulo: '', fase: 'acompanhamento', descricao: 'Equipe pronta, material na sala e alunos integrados: a turma começa (Em andamento).' },
  { id: 'mediar', tipo: 'tarefa', raia: 'tutor', col: 24, rotulo: 'Mediar UC e aulas ao vivo', fase: 'acompanhamento', fora: true, descricao: 'Execução das UCs no AVA.' },
  { id: 'tratativas', tipo: 'tarefa', raia: 'monitoria', col: 24, rotulo: 'Registrar tratativas', fase: 'acompanhamento', tela: '/tratativas', descricao: 'Tratativas categorizadas por aluno ou turma (motivo, retorno, desfecho).' },
  { id: 'painel', tipo: 'tarefa', raia: 'dr', col: 25, rotulo: 'Acompanhar turmas e alunos', fase: 'acompanhamento', tela: '/acompanhamento', descricao: 'Painel da DR com dados do AVA: acessos, notas, alertas.' },

  // Financeiro
  { id: 'formalizar', tipo: 'tarefa', raia: 'dr', col: 26, rotulo: 'Formalizar saída de aluno', fase: 'financeiro', tela: '/financeiro', descricao: 'Desistência, trancamento, validação ou transferência — registrada no sistema, não por e-mail.' },
  { id: 'cobrar', tipo: 'tarefa', raia: 'financeiro', col: 27, rotulo: 'Cobrança mensal', fase: 'financeiro', tela: '/financeiro', descricao: 'Cobra até a DR formalizar a saída.', regras: ['Corte no dia 20; cobrança no dia 5.', 'Suspenso no AVA sem formalização vira alerta.'] },
  { id: 'fim', tipo: 'fim', raia: 'financeiro', col: 28, rotulo: 'Turma finalizada', fase: 'financeiro' },
]

export const arestas: Aresta[] = [
  { de: 'inicio', para: 'credenciar' },
  { de: 'credenciar', para: 'edital' },
  { de: 'edital', para: 'produto' },
  { de: 'produto', para: 'taa' },
  { de: 'taa', para: 'assinar-taa', rotulo: 'envia' },
  { de: 'assinar-taa', para: 'taa-vigente', rotulo: 'assinado' },
  { de: 'taa-vigente', para: 'proposta' },
  { de: 'proposta', para: 'dr-aceita', rotulo: 'negocia' },
  { de: 'proposta', para: 'alerta-prazo' },
  { de: 'dr-aceita', para: 'nova-rodada', rotulo: 'ajustar' },
  { de: 'nova-rodada', para: 'proposta' },
  { de: 'dr-aceita', para: 'aceite', rotulo: 'sim' },
  { de: 'aceite', para: 'nova-oferta' },
  { de: 'nova-oferta', para: 'enviar-cron' },
  { de: 'enviar-cron', para: 'valida', rotulo: 'e-mail' },
  { de: 'valida', para: 'ajuste', rotulo: 'ajuste' },
  { de: 'ajuste', para: 'enviar-cron' },
  { de: 'valida', para: 'fecha', rotulo: 'sim / prazo' },
  { de: 'fecha', para: 'cancelada', rotulo: 'não' },
  { de: 'fecha', para: 'confirmar', rotulo: 'sim' },
  { de: 'confirmar', para: 'split' },
  { de: 'split', para: 'equipe' },
  { de: 'split', para: 'tutor' },
  { de: 'split', para: 'criar-salas' },
  { de: 'tutor', para: 'email' },
  { de: 'equipe', para: 'email' },
  { de: 'email', para: 'planejar', rotulo: 'e-mail' },
  { de: 'planejar', para: 'valida-ped' },
  { de: 'valida-ped', para: 'sala', rotulo: 'validado' },
  { de: 'criar-salas', para: 'dados-int', rotulo: 'códigos' },
  { de: 'dados-int', para: 'status-int' },
  { de: 'sala', para: 'join' },
  { de: 'status-int', para: 'join' },
  { de: 'join', para: 'mediar' },
  { de: 'join', para: 'tratativas' },
  { de: 'tratativas', para: 'painel' },
  { de: 'painel', para: 'formalizar' },
  { de: 'formalizar', para: 'cobrar', rotulo: 'formalização' },
  { de: 'mediar', para: 'cobrar' },
  { de: 'cobrar', para: 'fim' },
]
