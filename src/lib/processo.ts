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
  { id: 'dr', nome: 'Contratante', cor: '#ca8a04' },
  { id: 'sis', nome: 'Sistemas', cor: '#64748b' },
]

export const raias: Raia[] = [
  { id: 'dn', nome: 'DN', pool: 'dn', perfil: 'DN' },
  { id: 'comercial', nome: 'Gestor de contrato', pool: 'ctm', perfil: 'CTM: Gestor de contrato' },
  { id: 'supervisor', nome: 'Supervisão', pool: 'ctm', perfil: 'CTM: Gestor de oferta' },
  { id: 'pcp', nome: 'PCP', pool: 'ctm', perfil: 'CTM: PCP' },
  { id: 'analista', nome: 'Analista', pool: 'ctm' },
  { id: 'tutor', nome: 'Tutor', pool: 'ctm', perfil: 'CTM: Tutor' },
  { id: 'monitoria', nome: 'Monitoria e pedagógico', pool: 'ctm', perfil: 'CTM: Pedagógico' },
  { id: 'financeiro', nome: 'Financeiro', pool: 'ctm' },
  { id: 'dr', nome: 'Gestor da DR solicitante', pool: 'dr', perfil: 'DR solicitante: SENAI' },
  { id: 'ava', nome: 'AVA / SGE', pool: 'sis' },
]

export const fases: Fase[] = [
  { id: 'credenciamento', nome: 'Credenciamento' },
  { id: 'contrato', nome: 'TAA (um por DR) / contrato' },
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
  { id: 'edital', tipo: 'tarefa', raia: 'dn', col: 2, rotulo: 'Publicar edital', fase: 'credenciamento', tela: '/editais/novo', descricao: 'Só o DN faz a gestão de editais: vigência, áreas tecnológicas e cursos do portfólio nacional, com valor e DRs credenciados por curso. As CTMs apenas participam (oferecem o custo, fora do sistema).', regras: ['Área, modalidade e CH vêm do catálogo (fixas).', 'Por produto, a CTM aprovada é a que ofereceu o menor custo.', 'Só se oferta o que está no edital.'] },
  { id: 'produto', tipo: 'tarefa', raia: 'supervisor', col: 3, rotulo: 'Cadastrar produto (matriz)', fase: 'credenciamento', tela: '/gestao-produtos/novo', descricao: 'Cada CTM solicita a inclusão de produtos (módulos e UCs conforme o plano de curso) ou de novas versões; vincula o itinerário e documentos/materiais.', regras: ['Nova versão não altera o que já foi negociado na anterior.', 'Versões podem rodar ao mesmo tempo.'] },

  { id: 'aprova-portfolio', tipo: 'decisao', raia: 'dn', col: 4, rotulo: 'DN aprova?', fase: 'credenciamento', tela: '/portfolio/aprovacoes', descricao: 'O DN aprova (entra no Portfólio das CTMs, visível para todas as DRs) ou reprova com motivo (a CTM ajusta e envia nova versão).' },
  // Contrato
  { id: 'taa', tipo: 'tarefa', raia: 'comercial', col: 4, rotulo: 'Enviar TAA à DR', fase: 'contrato', tela: '/taas-ctm/novo', descricao: 'Caminho normal: a CTM que ganhou o edital envia um TAA para cada DR específica (Encaminhado), com os produtos em que é a aprovada. A DR também pode criar o seu (aí a CTM analisa).', regras: ['Status: Encaminhado → Em análise → Retornado para ajuste / Aceito / Cancelado.', 'Saldo = valor global − executado.'] },
  { id: 'assinar-taa', tipo: 'decisao', raia: 'dr', col: 5, rotulo: 'Gestor aceita?', fase: 'contrato', tela: '/dashboard/16', descricao: 'O Gestor da DR analisa: aceita, retorna para ajuste (a CTM ajusta e reencaminha) ou recusa (Cancelado).' },
  { id: 'taa-vigente', tipo: 'tarefa', raia: 'dr', col: 6, rotulo: 'Aceito: assinar e anexar', fase: 'contrato', fora: true, tela: '/dashboard/4', descricao: 'Aceito, o termo é assinado fora do sistema e anexado. É burocrático: só destrava a negociação da oferta, que dá origem às propostas — pode não gerar nenhuma. O saldo cai conforme a execução.' },

  // Proposta
  { id: 'proposta', tipo: 'tarefa', raia: 'comercial', col: 7, rotulo: 'Criar proposta (Rascunho)', fase: 'proposta', tela: '/produtos/novo', descricao: 'A negociação é fora do sistema; quando avança, a CTM (Gestor de contrato, responsável) cria a proposta vinculada ao TAA aceito: produtos do TAA, alunos, início e fim; matriz do portfólio; valor = valor do edital × alunos.', regras: ['Status: Rascunho, Em andamento, Aguardando retorno do cliente, Aprovado, Cancelado.', 'Quem muda o status é o Gestor de contrato.', 'Curso pode se repetir em propostas do mesmo TAA.'] },
  { id: 'alerta-prazo', tipo: 'tempo', raia: 'comercial', col: 8, rotulo: 'Início em ≤ 15 dias', fase: 'proposta', tela: '/produtos', descricao: 'Proposta ainda não aceita com turma prevista para começar em até 15 dias aparece com alerta.' },
  { id: 'dr-aceita', tipo: 'decisao', raia: 'dr', col: 8, rotulo: 'Aprova?', fase: 'proposta', fora: true, descricao: 'A DR solicitante avalia fora do sistema; o Gestor de contrato registra o retorno (Aguardando retorno do cliente, Aprovado ou Cancelado).' },
  { id: 'nova-rodada', tipo: 'tarefa', raia: 'comercial', col: 9, rotulo: 'Nova versão (vai e vem)', fase: 'proposta', tela: '/produtos/4', descricao: 'A DR pede ajuste: nova versão (v2, v3…) com a anterior guardada no histórico.' },
  { id: 'aceite', tipo: 'tarefa', raia: 'supervisor', col: 10, rotulo: 'Vincular equipe técnica', fase: 'proposta', tela: '/produtos/1', descricao: 'Proposta aprovada (executa o saldo do TAA): vincula-se a equipe técnica (supervisor e analista), que define o cronograma das turmas.' },

  // Oferta
  { id: 'nova-oferta', tipo: 'tarefa', raia: 'supervisor', col: 11, rotulo: 'Turmas + cronograma', fase: 'oferta', tela: '/oferta/proposta/2/nova', descricao: 'A equipe técnica cria as turmas da proposta aprovada (um curso tem várias turmas; a turma tem UCs; a UC tem alunos) e define o cronograma, avaliando o agrupamento de UCs iguais entre turmas de DRs iguais ou diferentes (aulas ao vivo no Moodle).', regras: ['Só dias úteis; pula os feriados nacionais (Super admin).', 'Semanas = CH ÷ horas por semana; UC termina na sexta.', 'UCs agrupáveis com outras turmas ficam marcadas.'] },
  { id: 'enviar-cron', tipo: 'tarefa', raia: 'supervisor', col: 12, rotulo: 'Enviar cronograma à DR', fase: 'oferta', tela: '/oferta/t2', descricao: 'Registra o envio (e-mail) com prazo de validação.' },
  { id: 'valida', tipo: 'decisao', raia: 'dr', col: 13, rotulo: 'Valida?', fase: 'oferta', fora: true, descricao: 'A DR valida ou pede ajuste. Sem resposta até o prazo, conta como validado.' },
  { id: 'ajuste', tipo: 'tarefa', raia: 'supervisor', col: 14, rotulo: 'Nova versão do cronograma', fase: 'oferta', tela: '/oferta/t2', descricao: 'Gera a versão seguinte com o que a DR pediu.' },
  { id: 'fecha', tipo: 'decisao', raia: 'dr', col: 15, rotulo: 'Turma fecha?', fase: 'oferta', fora: true, descricao: 'A DR confirma se a turma vai começar (mínimo de inscritos é regra de cada DR). Aviso com 10 dias de antecedência.' },
  { id: 'cancelada', tipo: 'fim', raia: 'dr', col: 16, rotulo: 'Turma cancelada', fase: 'oferta', tela: '/oferta/t1', descricao: 'Cancelar turma com motivo; ou prorrogar o início (todas as datas andam junto).' },
  { id: 'confirmar', tipo: 'tarefa', raia: 'supervisor', col: 16, rotulo: 'Confirmar turma (Buscar tutor)', fase: 'oferta', tela: '/oferta/t1', descricao: 'Com o cronograma validado e a DR confirmando, a turma vai para Buscar tutor: começa o fluxo das UCs (equipe, sala no Moodle, planejamento).' },

  // Execução (por UC)
  { id: 'equipe', tipo: 'tarefa', raia: 'supervisor', col: 17, rotulo: 'Vincular equipe da UC', fase: 'execucao', tela: '/oferta/t1?aba=execucao', descricao: 'Para cada UC da turma: pedagógico, tutor e monitor.' },
  { id: 'criar-sala', tipo: 'tarefa', raia: 'monitoria', col: 18, rotulo: 'Monitor cria a sala no Moodle', fase: 'execucao', tela: '/oferta/t1?aba=execucao', descricao: 'Via integração; a sala fica Em criação até o Moodle confirmar (Criada). Aí a UC entra em planejamento.' },
  { id: 'planejar', tipo: 'tarefa', raia: 'monitoria', col: 19, rotulo: 'Pedagógico planeja a UC', fase: 'execucao', tela: '/oferta/t1?aba=execucao', descricao: 'Em planejamento: define os dias das aulas ao vivo (online) e as atividades presenciais.' },
  { id: 'avalia-tutor', tipo: 'decisao', raia: 'tutor', col: 20, rotulo: 'Tutor aprova?', fase: 'execucao', tela: '/oferta/t1?aba=execucao', descricao: 'O tutor avalia o planejamento: aprova ou devolve ao pedagógico (com motivo).' },
  { id: 'parametrizar', tipo: 'tarefa', raia: 'monitoria', col: 21, rotulo: 'Monitor parametriza avaliações', fase: 'execucao', fora: true, tela: '/oferta/t1?aba=execucao', descricao: 'Planejamento aprovado: e-mail ao monitor para parametrizar as avaliações no Moodle. Feito isso, a UC fica Pronta.' },

  // Integração
  { id: 'email-dr', tipo: 'tarefa', raia: 'dr', col: 22, rotulo: 'DR ajusta SGN/SGE e integra alunos', fase: 'integracao', fora: true, tela: '/oferta/t1?aba=integracao', descricao: 'Com todas as UCs prontas, e-mail à DR solicitante com os códigos CTM por escola e os IDs das salas; a DR ajusta o SGN/SGE e integra os alunos no Moodle.' },
  { id: 'status-int', tipo: 'tempo', raia: 'ava', col: 23, rotulo: '5 dias antes do início', fase: 'integracao', tela: '/oferta/t1?aba=integracao', descricao: 'Situação da integração por escola (integrados × alunos) e alerta quando a DR ainda não integrou.' },

  // Acompanhamento
  { id: 'mediar', tipo: 'tarefa', raia: 'tutor', col: 24, rotulo: 'Mediar UC e aulas ao vivo', fase: 'acompanhamento', fora: true, descricao: 'Execução das UCs no Moodle (aulas ao vivo online e atividades presenciais).' },
  { id: 'tratativas', tipo: 'tarefa', raia: 'monitoria', col: 24, rotulo: 'Registrar tratativas', fase: 'acompanhamento', tela: '/tratativas', descricao: 'Tratativas categorizadas por aluno ou turma (motivo, retorno, desfecho).' },
  { id: 'painel', tipo: 'tarefa', raia: 'dr', col: 25, rotulo: 'Acompanhar turmas e alunos', fase: 'acompanhamento', tela: '/acompanhamento', descricao: 'Painel da DR com dados do Moodle: acessos, notas, alertas.' },

  // Financeiro
  { id: 'formalizar', tipo: 'tarefa', raia: 'dr', col: 26, rotulo: 'Formalizar saída de aluno', fase: 'financeiro', tela: '/financeiro', descricao: 'Desistência, trancamento, validação ou transferência — registrada no sistema, não por e-mail.' },
  { id: 'cobrar', tipo: 'tarefa', raia: 'financeiro', col: 27, rotulo: 'Cobrança mensal', fase: 'financeiro', tela: '/financeiro', descricao: 'Cobra até a DR formalizar a saída.', regras: ['Corte no dia 20; cobrança no dia 5.', 'Suspenso no Moodle sem formalização vira alerta.'] },
  { id: 'fim', tipo: 'fim', raia: 'financeiro', col: 28, rotulo: 'Turma finalizada', fase: 'financeiro' },
]

export const arestas: Aresta[] = [
  { de: 'inicio', para: 'credenciar' },
  { de: 'credenciar', para: 'edital' },
  { de: 'edital', para: 'produto' },
  { de: 'produto', para: 'aprova-portfolio', rotulo: 'solicita' },
  { de: 'aprova-portfolio', para: 'taa', rotulo: 'aprovado' },
  { de: 'aprova-portfolio', para: 'produto', rotulo: 'reprovado' },
  { de: 'taa', para: 'assinar-taa', rotulo: 'encaminha' },
  { de: 'assinar-taa', para: 'taa', rotulo: 'ajuste' },
  { de: 'assinar-taa', para: 'taa-vigente', rotulo: 'aceito' },
  { de: 'taa-vigente', para: 'proposta', rotulo: 'vigente' },
  { de: 'proposta', para: 'dr-aceita', rotulo: 'negocia' },
  { de: 'proposta', para: 'alerta-prazo' },
  { de: 'dr-aceita', para: 'nova-rodada', rotulo: 'ajustar' },
  { de: 'nova-rodada', para: 'proposta' },
  { de: 'dr-aceita', para: 'aceite', rotulo: 'aprovada' },
  { de: 'aceite', para: 'nova-oferta' },
  { de: 'nova-oferta', para: 'enviar-cron' },
  { de: 'enviar-cron', para: 'valida', rotulo: 'e-mail' },
  { de: 'valida', para: 'ajuste', rotulo: 'ajuste' },
  { de: 'ajuste', para: 'enviar-cron' },
  { de: 'valida', para: 'fecha', rotulo: 'sim / prazo' },
  { de: 'fecha', para: 'cancelada', rotulo: 'não' },
  { de: 'fecha', para: 'confirmar', rotulo: 'sim' },
  { de: 'confirmar', para: 'equipe' },
  { de: 'equipe', para: 'criar-sala' },
  { de: 'criar-sala', para: 'planejar', rotulo: 'sala criada' },
  { de: 'planejar', para: 'avalia-tutor' },
  { de: 'avalia-tutor', para: 'planejar', rotulo: 'devolve' },
  { de: 'avalia-tutor', para: 'parametrizar', rotulo: 'e-mail' },
  { de: 'parametrizar', para: 'email-dr', rotulo: 'UCs prontas: e-mail' },
  { de: 'email-dr', para: 'status-int' },
  { de: 'status-int', para: 'mediar' },
  { de: 'status-int', para: 'tratativas' },
  { de: 'tratativas', para: 'painel' },
  { de: 'painel', para: 'formalizar' },
  { de: 'formalizar', para: 'cobrar', rotulo: 'formalização' },
  { de: 'mediar', para: 'cobrar' },
  { de: 'cobrar', para: 'fim' },
]
