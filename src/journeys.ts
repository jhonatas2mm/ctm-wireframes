// Jornadas: sequências de telas para apresentar fluxos.
// `path` é qualquer rota do protótipo (ver src/screens.ts), inclusive com parâmetros.
// Perfil de acesso: quem está vendo a tela. Nome de um perfil de profiles.json
// (crie/edite pela casca). Definido na jornada e, se preciso, sobrescrito por etapa.
export type Profile = string

export type Step = { title: string; path: string; note?: string; profile?: Profile }
export type Journey = { id: string; title: string; description?: string; profile: Profile; steps: Step[] }

// Mapa de jornadas: cada jornada vira uma linha do fluxograma na casca; cada etapa diz o perfil que está na tela.
// A ordem do array é a numeração dos fluxos na casca (1, 2, 3…): a ordem em que acontecem no sistema.
export const journeys: Journey[] = [
  {
    id: 'admin-usuarios',
    title: 'Gestão de usuários',
    profile: 'Super admin',
    steps: [
      { title: 'Gestão de usuários', path: '/admin/usuarios', profile: 'Super admin', note: 'Super admin vê todos os usuários (perfil, DR, status, último acesso) e clica em “Novo usuário”.' },
      { title: 'Novo usuário', path: '/admin/usuarios/novo', profile: 'Super admin', note: 'Informa nome, e-mail, perfil e DR. O usuário nasce Ativo e recebe o link para definir a senha.' },
      { title: 'Editar usuário', path: '/admin/usuarios/u3', profile: 'Super admin', note: 'Pelo lápis na linha: troca perfil ou DR. Inativar pede confirmação.' },
    ],
  },
  {
    id: 'admin-permissoes',
    title: 'Perfis e permissões',
    profile: 'Super admin',
    steps: [
      { title: 'Perfis e permissões', path: '/admin/perfis', profile: 'Super admin', note: 'Lista de perfis com nº de telas e de usuários; abre um perfil.' },
      { title: 'Permissões do perfil', path: '/admin/perfis/CTM%3A%20Comercial', profile: 'Super admin', note: 'Marca as telas que o perfil acessa (com “Selecionar todas”) e salva.' },
    ],
  },
  {
    id: 'admin-auditoria',
    title: 'Auditoria',
    profile: 'Super admin',
    steps: [
      { title: 'Auditoria', path: '/admin/auditoria', profile: 'Super admin', note: 'Trilha de ações (quem, quando, o quê), com busca e filtros por usuário, perfil e ação.' },
    ],
  },
  {
    id: 'admin-logs',
    title: 'Logs do sistema',
    profile: 'Super admin',
    steps: [
      { title: 'Logs do sistema', path: '/admin/logs', profile: 'Super admin', note: 'Tudo o que os usuários fazem na plataforma: login, visualizações, criações, edições, exclusões, aceites, exportações. Filtros por usuário, perfil, ação, módulo e DR; dá para salvar filtros (ex.: “Exclusões da DN”).' },
      { title: 'Detalhe do log', path: '/admin/logs/l1', profile: 'Super admin', note: 'Side nav com quem fez (perfil, DR), quando, módulo, IP e dispositivo, o que mudou (antes → depois) e outras ações do mesmo usuário.' },
    ],
  },
  {
    id: 'admin-visao-geral',
    title: 'Supervisão das áreas',
    profile: 'Super admin',
    steps: [
      { title: 'Gestão de DRs', path: '/drs', profile: 'Super admin', note: 'Super admin acessa todas as telas do sistema para acompanhar e corrigir dados.' },
      { title: 'Gestão de Editais', path: '/editais', profile: 'Super admin' },
      { title: 'Gestão de propostas', path: '/produtos', profile: 'Super admin' },
      { title: 'Gestão da oferta', path: '/oferta', profile: 'Super admin' },
    ],
  },
  {
    id: 'drs',
    title: 'Cadastro de DRs',
    profile: 'DN',
    steps: [
      { title: 'Gestão de DRs credenciadas', path: '/drs', profile: 'DN', note: 'Início do sistema: o DN clica em “Nova DR credenciada”.' },
      { title: 'Nova DR credenciada', path: '/drs/novo', profile: 'DN', note: 'Escolhe a DR (UF ainda não credenciada) e preenche o contato. Nasce Ativa; pode ser inativada depois.' },
    ],
  },
  {
    id: 'contratos',
    title: 'Gestão de Contratos',
    profile: 'DN',
    steps: [
      { title: 'Gestão de TAA', path: '/dashboard', profile: 'DN', note: 'DN clica em “Novo TAA”.' },
      { title: 'Novo TAA', path: '/dashboard/novo-ta', profile: 'DN', note: 'Preenche DR, vigência e valor global, baixa o modelo e salva. O TAA fica Em elaboração.' },
      { title: 'TAA em elaboração', path: '/dashboard/4', profile: 'DN', note: 'Assinaturas acontecem fora do sistema. Ao voltar, o DN clica em “Anexar TAA assinado”.' },
      { title: 'TAA vigente', path: '/dashboard/1', profile: 'DN', note: 'Com o TAA assinado anexado, o status passa a Vigente.' },
    ],
  },
  {
    id: 'novo-taa-comercial',
    title: 'Novo TAA',
    profile: 'CTM: Comercial',
    steps: [
      { title: 'Gestão de TAAs', path: '/meus-taas', profile: 'CTM: Comercial', note: 'O Comercial clica em “Novo TAA”.' },
      { title: 'Novo TAA', path: '/meus-taas/novo', profile: 'CTM: Comercial', note: 'Preenche DR, vigência e valor global, baixa o modelo e salva. O TAA fica Em elaboração.' },
    ],
  },
  {
    id: 'novo-taa-supervisor',
    title: 'Novo TAA',
    profile: 'CTM: Supervisor',
    steps: [
      { title: 'Gestão de TAAs', path: '/meus-taas', profile: 'CTM: Supervisor', note: 'O Supervisor clica em “Novo TAA”.' },
      { title: 'Novo TAA', path: '/meus-taas/novo', profile: 'CTM: Supervisor', note: 'Preenche DR, vigência e valor global, baixa o modelo e salva. O TAA fica Em elaboração.' },
    ],
  },
  {
    id: 'fluxo',
    title: 'Criação de edital',
    profile: 'DN',
    steps: [
      { title: 'Gestão de Editais', path: '/editais', profile: 'DN', note: 'DN clica em “Novo edital”.' },
      { title: 'Novo edital', path: '/editais/novo', profile: 'DN', note: 'Define vigência e cursos (valor e DRs credenciados por curso) e salva o edital.' },
      { title: 'Edital criado', path: '/editais/1/sucesso', profile: 'DN', note: 'Tela de sucesso: resumo do edital salvo, com opção de ver o edital ou voltar à gestão.' },
      { title: 'Gestão de Portfólio', path: '/gestao-produtos', profile: 'CTM: Supervisor', note: 'Supervisor clica em “Novo produto”.' },
      { title: 'Novo produto', path: '/gestao-produtos/novo', profile: 'CTM: Supervisor', note: 'Escolhe um edital, marca os produtos e cadastra módulos e UCs.' },
    ],
  },
  {
    id: 'criacao-portfolio',
    title: 'Criação de portfólio',
    profile: 'CTM: Supervisor',
    steps: [
      { title: 'Gestão de Portfólio', path: '/gestao-produtos', profile: 'CTM: Supervisor', note: 'Supervisor clica em “Novo produto”.' },
      { title: 'Novo produto', path: '/gestao-produtos/novo', profile: 'CTM: Supervisor', note: 'Escolhe um edital, marca um ou mais produtos desse edital e cadastra módulos e UCs de cada um.' },
    ],
  },
  {
    id: 'criacao-proposta',
    title: 'Criação de proposta',
    profile: 'CTM: Supervisor',
    steps: [
      { title: 'Gestão de propostas', path: '/produtos', profile: 'CTM: Supervisor', note: 'Supervisor clica em “Nova proposta”.' },
      { title: 'Nova proposta', path: '/produtos/novo', profile: 'CTM: Supervisor', note: 'Escolhe o edital e a DR contratante, marca os cursos com valor previsto e salva a proposta.' },
      { title: 'Proposta aceita ou recusada', path: '/produtos', profile: 'CTM: Supervisor', note: 'Depois do acordo (fora do sistema), marca a proposta como Aceita ou Recusada na listagem; recusa pede feedback.' },
    ],
  },
  {
    id: 'gestao-oferta',
    title: 'Criação de oferta',
    profile: 'CTM: Supervisor',
    steps: [
      { title: 'Gestão da oferta', path: '/oferta', profile: 'CTM: Supervisor', note: 'Lista de ofertas (uma linha por turma, com a proposta); clica em “Adicionar oferta” na proposta.' },
      { title: 'Nova oferta', path: '/oferta/proposta/2/nova', profile: 'CTM: Supervisor', note: 'Escolhe a proposta e o curso; complementa a matriz curricular com CH, início e término de cada UC.' },
      { title: 'Oferta criada', path: '/oferta/t1/sucesso', profile: 'CTM: Supervisor', note: 'Confirmação: ofertas criadas, com atalho para Ver oferta.' },
      { title: 'Aulas ao vivo', path: '/oferta/t1', profile: 'CTM: Supervisor', note: 'Em Visualizar oferta, na lista de UCs: botão “Adicionar” em cada UC abre o cadastro do dia e horário da aula ao vivo.' },
    ],
  },
  {
    id: 'comercial-criacao-portfolio',
    title: 'Criação de portfólio',
    profile: 'CTM: Comercial',
    steps: [
      { title: 'Gestão de Portfólio', path: '/gestao-produtos', profile: 'CTM: Comercial', note: 'Comercial clica em “Novo produto”.' },
      { title: 'Novo produto', path: '/gestao-produtos/novo', profile: 'CTM: Comercial', note: 'Escolhe um edital, marca um ou mais produtos desse edital e cadastra módulos e UCs de cada um.' },
    ],
  },
  {
    id: 'comercial-criacao-proposta',
    title: 'Criação de proposta',
    profile: 'CTM: Comercial',
    steps: [
      { title: 'Gestão de propostas', path: '/produtos', profile: 'CTM: Comercial', note: 'Comercial clica em “Nova proposta”.' },
      { title: 'Nova proposta', path: '/produtos/novo', profile: 'CTM: Comercial', note: 'Escolhe o edital e a DR contratante, marca os cursos com valor previsto e salva a proposta.' },
      { title: 'Proposta aceita ou recusada', path: '/produtos', profile: 'CTM: Comercial', note: 'Depois do acordo (fora do sistema), marca a proposta como Aceita ou Recusada na listagem; recusa pede feedback.' },
    ],
  },
  {
    id: 'comercial-gestao-oferta',
    title: 'Criação de oferta',
    profile: 'CTM: Comercial',
    steps: [
      { title: 'Gestão da oferta', path: '/oferta', profile: 'CTM: Comercial', note: 'Lista de ofertas (uma linha por turma, com a proposta); clica em “Adicionar oferta” na proposta.' },
      { title: 'Nova oferta', path: '/oferta/proposta/2/nova', profile: 'CTM: Comercial', note: 'Escolhe a proposta e o curso; complementa a matriz curricular com CH, início e término de cada UC.' },
      { title: 'Oferta criada', path: '/oferta/t1/sucesso', profile: 'CTM: Comercial', note: 'Confirmação: ofertas criadas, com atalho para Ver oferta.' },
      { title: 'Aulas ao vivo', path: '/oferta/t1', profile: 'CTM: Comercial', note: 'Em Visualizar oferta, na lista de UCs: botão “Adicionar” em cada UC abre o cadastro do dia e horário da aula ao vivo.' },
    ],
  },
  {
    id: 'dr-acompanhamento',
    title: 'Acompanhamento da execução',
    profile: 'DR solicitante',
    steps: [
      { title: 'Painel', path: '/acompanhamento', profile: 'DR solicitante', note: 'Dashboard da DR solicitante (SENAI-MG): indicadores gerais e, por contrato, as turmas com execução e quantos alunos requerem atenção.' },
      { title: 'Gestão de Contratos', path: '/contratos', profile: 'DR solicitante', note: 'Contratos da DR com o CTM: empresa cliente, cursos EAD, vigência, valor e status.' },
      { title: 'Detalhes do contrato', path: '/contratos/c1', profile: 'DR solicitante', note: 'Side nav com os dados do contrato, vagas ocupadas e as turmas que o CTM opera para a empresa.' },
      { title: 'Detalhes da turma', path: '/turmas-ead/t1', profile: 'DR solicitante', note: 'Execução do calendário, progresso e média dos alunos, tutor do CTM e lista de alunos.' },
      { title: 'Detalhes do aluno', path: '/alunos/a2', profile: 'DR solicitante', note: 'Motivos que pedem atitude, notas das atividades e histórico de acessos ao AVA e ao Portal do aluno.' },
    ],
  },
]
