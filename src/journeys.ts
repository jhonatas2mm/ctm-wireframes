// Jornadas: sequências de telas para apresentar fluxos.
// `path` é qualquer rota do protótipo (ver src/screens.ts), inclusive com parâmetros.
// Perfil de acesso: quem está vendo a tela. Nome de um perfil de profiles.json
// (crie/edite pela casca). Definido na jornada e, se preciso, sobrescrito por etapa.
export type Profile = string

// focus: onde o guia destaca na tela — seletor CSS ou "text=Texto do botão/título" (sem focus: só o cartão com a explicação).
export type Step = { title: string; path: string; note?: string; profile?: Profile; focus?: string }
export type Journey = { id: string; title: string; description?: string; profile: Profile; steps: Step[] }

// Mapa de jornadas: cada jornada vira uma linha do fluxograma na casca; cada etapa diz o perfil que está na tela.
// A ordem do array é a numeração dos fluxos na casca (1, 2, 3…): a ordem em que acontecem no sistema.
export const journeys: Journey[] = [
  {
    id: 'admin-usuarios',
    title: 'Gestão de usuários',
    profile: 'Super admin',
    steps: [
      { title: 'Gestão de usuários', path: '/admin/usuarios', focus: 'text=Novo usuário', profile: 'Super admin', note: 'Super admin vê todos os usuários (perfil, DR, status, último acesso) e clica em “Novo usuário”.' },
      { title: 'Novo usuário', path: '/admin/usuarios/novo', profile: 'Super admin', note: 'Informa nome, e-mail, perfil e DR. O usuário nasce Ativo e recebe o link para definir a senha.' },
      { title: 'Usuário criado', path: '/admin/usuarios', focus: 'row=Paulo Mendes', profile: 'Super admin', note: 'Ao salvar, o usuário aparece na lista como Ativo, com perfil e DR (ex.: Paulo Mendes, DR solicitante), e recebe o e-mail para definir a senha.' },
      { title: 'Editar usuário', path: '/admin/usuarios/u3', profile: 'Super admin', note: 'Pelo lápis na linha: troca perfil ou DR. Inativar pede confirmação.' },
    ],
  },
  {
    id: 'admin-permissoes',
    title: 'Perfis e permissões',
    profile: 'Super admin',
    steps: [
      { title: 'Perfis e permissões', path: '/admin/perfis', focus: '[data-slot="data-table"]', profile: 'Super admin', note: 'Lista de perfis com nº de telas e de usuários; abre um perfil.' },
      { title: 'Permissões do perfil', path: '/admin/perfis/CTM%3A%20Gestor%20de%20contrato', profile: 'Super admin', note: 'Marca as telas que o perfil acessa (com “Selecionar todas”) e salva.' },
    ],
  },
  {
    id: 'admin-auditoria',
    title: 'Auditoria',
    profile: 'Super admin',
    steps: [
      { title: 'Auditoria', path: '/admin/auditoria', focus: '[data-slot="data-table"]', profile: 'Super admin', note: 'Trilha de ações (quem, quando, o quê), com busca e filtros por usuário, perfil e ação.' },
    ],
  },
  {
    id: 'admin-logs',
    title: 'Logs do sistema',
    profile: 'Super admin',
    steps: [
      { title: 'Logs do sistema', path: '/admin/logs', focus: 'text=Linha do tempo', profile: 'Super admin', note: 'Tudo o que os usuários fazem na plataforma: login, visualizações, criações, edições, exclusões, aceites, exportações. Filtros por usuário, perfil, ação, módulo e DR; dá para salvar filtros (ex.: “Exclusões da DN”).' },
      { title: 'Detalhe do log', path: '/admin/logs/l1', profile: 'Super admin', note: 'Side nav com quem fez (perfil, DR), quando, módulo, IP e dispositivo, o que mudou (antes → depois) e outras ações do mesmo usuário.' },
    ],
  },
  {
    id: 'admin-feriados',
    title: 'Feriados nacionais',
    profile: 'Super admin',
    steps: [
      { title: 'Feriados nacionais', path: '/admin/feriados', profile: 'Super admin', note: 'Única base de datas do sistema: o cronograma da oferta só pula estes dias. Não há feriados por DR ou CTM por enquanto.' },
      { title: 'Novo feriado', path: '/admin/feriados/novo', profile: 'Super admin', note: 'Nome e data. Na listagem, Desconsiderar (com confirmação) tira o feriado do cronograma; Buscar feriados traz o ano atual e o próximo da API.' },
    ],
  },
  {
    id: 'admin-visao-geral',
    title: 'Supervisão das áreas',
    profile: 'Super admin',
    steps: [
      { title: 'Gestão de DRs', path: '/drs', focus: 'text=Novo DR credenciado', profile: 'Super admin', note: 'Super admin acessa todas as telas do sistema para acompanhar e corrigir dados.' },
      { title: 'Gestão de Editais', path: '/editais', focus: 'text=Novo resultado', profile: 'Super admin', note: 'Editais de todas as áreas: vigência, cursos, valores e a CTM aprovada de cada produto.' },
      { title: 'Gestão de propostas', path: '/produtos', focus: 'text=Nova proposta', profile: 'Super admin', note: 'Propostas de todas as CTMs, com TAA vinculado, status e versões.' },
      { title: 'Gestão da oferta', path: '/oferta', focus: 'text=Nova oferta', profile: 'Super admin', note: 'Turmas de todas as propostas aprovadas, com cronograma e status.' },
    ],
  },
  {
    id: 'drs',
    title: 'Cadastro de DRs',
    profile: 'DN',
    steps: [
      { title: 'Gestão de DRs', path: '/drs', focus: 'text=Novo DR credenciado', profile: 'DN', note: 'Início do sistema: o DN clica em “Novo DR credenciado”.' },
      { title: 'Novo DR credenciado', path: '/drs/novo', profile: 'DN', note: 'Escolhe o DR (UF ainda não credenciada) e preenche o contato. Nasce Ativa; pode ser inativada depois.' },
      { title: 'DR credenciado', path: '/drs', focus: 'row=SENAI-PE', profile: 'DN', note: 'Ao salvar, o DR aparece na lista como Ativa, com responsável e contato (ex.: SENAI-PE). Dali pode ser editada ou inativada.' },
    ],
  },  {
    id: 'escolas',
    title: 'Cadastro e validação de escolas',
    profile: 'DR solicitante: Gestor EAD',
    steps: [
      { title: 'Escolas', path: '/escolas', focus: 'text=Nova escola', profile: 'DR solicitante: Gestor EAD', note: 'O DR solicitante cadastra as suas escolas; cada uma vai para a validação do DN. Recusada, o DR ajusta e reenvia.' },
      { title: 'Nova escola', path: '/escolas/nova', profile: 'DR solicitante: Gestor EAD', note: 'Nome, código, cidade e responsável; entra como Aguardando validação.' },
      { title: 'DN valida as escolas', path: '/drs?ver=RJ', profile: 'DN', note: 'Gestão de DRs → detalhe do DR: escolas aguardando validação no topo; Validar ou Recusar com motivo. Só escolas validadas entram nas turmas.' },
    ],
  },

  {
    id: 'fluxo',
    title: 'Criação de edital',
    profile: 'DN',
    steps: [
      { title: 'Gestão de Editais', path: '/editais', focus: 'text=Novo resultado', profile: 'DN', note: 'O DN cadastra o resultado do edital de credenciamento: “Novo resultado”.' },
      { title: 'Novo resultado', path: '/editais/novo', profile: 'DN', note: 'Igual ao resultado oficial: por área tecnológica, o DR credenciado e o valor em cada modalidade (EaD Assíncrono R$ hora/estudante; EaD Síncrono (Aprendizagem) R$ hora/turma até 50; EaD Personalizado R$ hora/estudante).' },
      { title: 'Resultado salvo', path: '/editais/7/sucesso', profile: 'DN', note: 'Confirmação do cadastro, com acesso ao resultado.' },
      { title: 'Resultado do edital', path: '/editais/7/resultado', profile: 'DN', note: 'Visão igual ao documento: resumo por CTM (GO e SC) e tabelas por modalidade (EaD Assíncrono; EaD Síncrono (Aprendizagem) / EaD Personalizado).' },
      { title: 'Gestão de Portfólio', path: '/gestao-produtos', focus: 'text=Novo curso', profile: 'CTM: Coordenador EAD', note: 'Coordenador EAD clica em “Novo curso”.' },
      { title: 'Novo curso', path: '/gestao-produtos/novo', profile: 'CTM: Coordenador EAD', note: 'Escolhe um edital (só cursos em que o DR é a CTM aprovada), marca os cursos e cadastra módulos e UCs. Salvar envia a solicitação ao DN: o curso fica Aguardando até entrar no portfólio.' },
      { title: 'Curso criado', path: '/gestao-produtos', focus: 'row=Soldador', profile: 'CTM: Coordenador EAD', note: 'Ao salvar, o curso entra no portfólio com módulos, unidades e carga horária (ex.: Soldador) e fica disponível para as propostas.' },
    ],
  },
  {
    id: 'ctm-taa',
    title: 'Envio de TAA aos DRs',
    profile: 'CTM: Gestor EAD',
    steps: [
      { title: 'TAAs com os DRs', path: '/taas-ctm', focus: 'text=Novo TAA', profile: 'CTM: Gestor EAD', note: 'Caminho normal: a CTM que ganhou o edital envia um TAA para cada DR específica. A lista também mostra os TAAs que os DRs criaram (a CTM analisa) e o saldo dos aceitos.' },
      { title: 'Novo TAA', path: '/taas-ctm/novo', profile: 'CTM: Gestor EAD', note: 'Edital → produtos em que a CTM é a aprovada → DR destinatária (uma por TAA), com status Encaminhado.' },
      { title: 'Gestor do DR analisa', path: '/dashboard/16', profile: 'DR solicitante: Gestor EAD', note: 'O Gestor do DR recebe o TAA (abrir marca Em análise) e aceita, retorna para ajuste (motivo) ou recusa (Cancelado).' },
      { title: 'Retorno para a CTM', path: '/taas-ctm', profile: 'CTM: Gestor EAD', note: 'Retornado: a CTM ajusta e reencaminha. Aceito: o termo é assinado fora e anexado; o saldo cai conforme as propostas aceitas.' },
    ],
  },
  {
    id: 'dr-contratacao',
    title: 'TAAs com CTMs',
    profile: 'DR solicitante: Gestor EAD',
    steps: [
      { title: 'TAAs com CTMs', path: '/dashboard', profile: 'DR solicitante: Gestor EAD', note: 'O Gestor do DR (coordenador, interlocutor…) vê os TAAs recebidos das CTMs e os que criou, com status e saldo.' },
      { title: 'TAA recebido da CTM', path: '/dashboard/16', profile: 'DR solicitante: Gestor EAD', note: 'Analisa: Aceitar, Retornar para ajuste (motivo) ou Recusar (Cancelado). No aceite, o Gestor fica registrado como solicitante.' },
      { title: 'Novo TAA', path: '/dashboard/novo-ta', profile: 'DR solicitante: Gestor EAD', note: 'O DR também pode criar: edital e produtos (a CTM é a aprovada no edital), Gestor solicitante, vigência e valor. Vai Encaminhado para a CTM analisar.' },
      { title: 'Retornado', path: '/dashboard/5', profile: 'DR solicitante: Gestor EAD', note: 'A CTM pediu ajuste: o Gestor ajusta (vigência, valor) e reencaminha, ou cancela.' },
      { title: 'TAA aceito', path: '/dashboard/4', profile: 'DR solicitante: Gestor EAD', note: 'Aceito: vale para as propostas. Saldo = valor global − executado (propostas aceitas nos produtos do TAA). O termo assinado é anexado.' },
    ],
  },
  {
    id: 'criacao-portfolio',
    title: 'Criação de portfólio',
    profile: 'CTM: Coordenador EAD',
    steps: [
      { title: 'Gestão de Portfólio', path: '/gestao-produtos', focus: 'text=Novo curso', profile: 'CTM: Coordenador EAD', note: 'Coordenador EAD clica em “Novo curso”.' },
      { title: 'Novo curso', path: '/gestao-produtos/novo', profile: 'CTM: Coordenador EAD', note: 'Escolhe um edital (só cursos em que o DR é a CTM aprovada), marca um ou mais cursos desse edital e cadastra módulos e UCs de cada um. Salvar envia a solicitação ao DN: o curso fica Aguardando até entrar no portfólio.' },
      { title: 'Curso criado', path: '/gestao-produtos', focus: 'row=Soldador', profile: 'CTM: Coordenador EAD', note: 'Ao salvar, o curso entra no portfólio com módulos, unidades e carga horária (ex.: Soldador) e fica disponível para as propostas.' },
    ],
  },
  {
    id: 'aprovacao-portfolio',
    title: 'Aprovação de portfólio',
    profile: 'DN',
    steps: [
      { title: 'Aprovação de portfólio', path: '/portfolio/aprovacoes', focus: 'text=Aprovar', profile: 'DN', note: 'Solicitações das CTMs: novos produtos e novas versões. Visualizar mostra matriz, itinerário e documentos vinculados.' },
      { title: 'Portfólio das CTMs', path: '/portfolio', profile: 'DN', note: 'Aprovado, o curso (ou a nova versão) entra no portfólio, visível para todos os DRs. Reprovado volta para a CTM com o motivo.' },
    ],
  },
  {
    id: 'portfolio-dr',
    title: 'Portfólio das CTMs',
    profile: 'DR solicitante: Gestor EAD',
    steps: [
      { title: 'Portfólio das CTMs', path: '/portfolio', profile: 'DR solicitante: Gestor EAD', note: 'Todos os DRs consultam o portfólio aprovado: curso, CTM, versão vigente, itinerário e documentos. Base para escolher os cursos do TAA.' },
    ],
  },
  {
    id: 'criacao-proposta',
    title: 'Criação de proposta',
    profile: 'CTM: Coordenador EAD',
    steps: [
      { title: 'Gestão de propostas', path: '/produtos', focus: 'text=Nova proposta', profile: 'CTM: Coordenador EAD', note: 'A proposta é sempre da CTM. A negociação acontece fora do sistema; quando avança, o Gestor EAD cria a proposta.' },
      { title: 'Nova proposta', path: '/produtos/novo', profile: 'CTM: Coordenador EAD', note: 'Vinculada a um TAA/contrato aceito: cursos do TAA, estudantes e início por curso; matriz do portfólio; valor = valor do edital × estudantes (fixo); saldo do TAA mostrado. Salva como Rascunho.' },
      { title: 'Proposta em rascunho', path: '/produtos/7', profile: 'CTM: Coordenador EAD', note: 'Gestão da proposta: resumo, cursos com a matriz, versões, documentos e histórico. O Gestor EAD é o responsável.' },
      { title: 'Vai e vem: nova versão', path: '/produtos/4', profile: 'CTM: Coordenador EAD', note: 'O DR pediu ajuste: “Nova versão” guarda a v1 no histórico e cria a v2. Status atual: Aguardando.' },
      { title: 'Status da proposta', path: '/produtos', focus: 'text=Status', profile: 'CTM: Coordenador EAD', note: 'O Gestor EAD registra o andamento combinado com o DR: Rascunho → Em andamento → Aguardando → Aprovado, ou Cancelado (motivo).' },
      { title: 'Aprovada: equipe técnica', path: '/produtos/1', profile: 'CTM: Coordenador EAD', note: 'Aprovada, a proposta executa o saldo do TAA; vincula-se a equipe técnica (supervisor e analista), que define o cronograma e segue para Criar turmas.' },
    ],
  },
  {
    id: 'gestao-oferta',
    title: 'Criação de oferta',
    profile: 'CTM: Coordenador EAD',
    steps: [
      { title: 'Gestão da oferta', path: '/oferta', focus: 'text=Nova oferta', profile: 'CTM: Coordenador EAD', note: 'Lista de ofertas (uma linha por turma, com a proposta); clica em “Adicionar oferta” na proposta.' },
      { title: 'Nova oferta', path: '/oferta/proposta/2/nova', profile: 'CTM: Coordenador EAD', note: 'Escolhe a proposta aprovada e os cursos; supervisor e analista vêm da equipe técnica da proposta. O sistema gera o cronograma (datas, semanas, encontros e aulas ao vivo por UC) pelos parâmetros e pulando os feriados nacionais; dá para ajustar à mão.' },
      { title: 'Oferta criada', path: '/oferta/t1/sucesso', profile: 'CTM: Coordenador EAD', note: 'Confirmação: ofertas criadas com o cronograma v1 em rascunho.' },
      { title: 'Validação do cronograma', path: '/oferta/t2', profile: 'CTM: Coordenador EAD', note: 'Registra o envio ao DR com prazo; o DR valida ou pede ajuste (nova versão). Sem resposta até o prazo, conta como validado. UCs agrupáveis com outras turmas aparecem marcadas.' },
      { title: 'Turma confirmada', path: '/oferta/t1', profile: 'CTM: Coordenador EAD', note: 'Com o cronograma validado e o DR confirmando a turma, “Confirmar turma” muda o status para Buscar tutor (libera o PCP e a criação de salas). Também: prorrogar início e cancelar turma.' },
    ],
  },
  {
    id: 'gestao-execucao',
    title: 'UCs da turma',
    profile: 'CTM: Coordenador EAD',
    steps: [
      { title: 'Equipe', path: '/equipe', profile: 'CTM: Coordenador EAD', note: 'Pessoas da CTM por função: pedagógico, tutor, monitor…' },
      { title: 'Equipe de cada UC', path: '/oferta/t1?aba=execucao', profile: 'CTM: Coordenador EAD', note: 'Aba UCs: para cada UC, vincula pedagógico, tutor e monitor. A etapa mostra de quem é a vez.' },
      { title: 'Integração com o Moodle', path: '/oferta/t1?aba=integracao', profile: 'CTM: Coordenador EAD', note: 'Com todas as UCs prontas, e-mail ao DR solicitante para ajustar o SGN/SGE; aqui ficam os códigos por escola e a situação da integração.' },
      { title: 'Histórico da turma', path: '/oferta/t1?aba=historico', profile: 'CTM: Coordenador EAD', note: 'Tudo o que aconteceu: salas, planejamentos, avaliações do tutor, e-mails.' },
    ],
  },
  {
    id: 'pcp-alocacao',
    title: 'Equipe das UCs',
    profile: 'CTM: Coordenador EAD',
    steps: [
      { title: 'Equipe', path: '/equipe', profile: 'CTM: Coordenador EAD', note: 'Pessoas da CTM com funções e dias disponíveis.' },
      { title: 'Equipe de cada UC', path: '/oferta/t1?aba=execucao', profile: 'CTM: Coordenador EAD', note: 'Vincula pedagógico, tutor e monitor em cada UC da turma.' },
    ],
  },
  {
    id: 'pedagogico',
    title: 'Planejamento das UCs',
    profile: 'CTM: Coordenador Pedagógico',
    steps: [
      { title: 'UC em planejamento', path: '/oferta/t1?aba=execucao', profile: 'CTM: Coordenador Pedagógico', note: 'Com a sala criada, a UC entra em planejamento: “Planejar” define os dias das aulas ao vivo (online) e as atividades presenciais, e envia ao tutor. Se o tutor devolver, o motivo aparece na UC.' },
      { title: 'Tratativas pedagógicas', path: '/tratativas', profile: 'CTM: Coordenador Pedagógico', note: 'Durante a execução: tratativas por estudante ou turma.' },
    ],
  },
  {
    id: 'tutor',
    title: 'Avaliação do planejamento',
    profile: 'CTM: Tutor',
    steps: [
      { title: 'UC em avaliação', path: '/oferta/t1?aba=execucao', profile: 'CTM: Tutor', note: '“Avaliar”: o tutor vê as aulas ao vivo e as atividades presenciais e aprova (sai o e-mail para o monitor parametrizar as avaliações no Moodle) ou devolve ao pedagógico com motivo.' },
    ],
  },
  {
    id: 'monitor',
    title: 'Salas e avaliações no Moodle',
    profile: 'CTM: Monitor',
    steps: [
      { title: 'Criar salas no Moodle', path: '/oferta/t1?aba=execucao', profile: 'CTM: Monitor', note: 'O monitor começa o processo: cria as salas das UCs via integração (Em criação → Criada).' },
      { title: 'Parametrizar avaliações', path: '/oferta/t1?aba=execucao', profile: 'CTM: Monitor', note: 'Planejamento aprovado pelo tutor: chega o e-mail e o monitor parametriza as avaliações no Moodle; a UC fica Pronta.' },
      { title: 'Integração dos estudantes', path: '/oferta/t1?aba=integracao', profile: 'CTM: Monitor', note: 'Com todas as UCs prontas, o DR é avisado por e-mail para integrar os estudantes (SGN/SGE).' },
    ],
  },
  {
    id: 'acompanhamento-pedagogico',
    title: 'Acompanhamento pedagógico',
    profile: 'CTM: Coordenador EAD',
    steps: [
      { title: 'Tratativas pedagógicas', path: '/tratativas', profile: 'CTM: Coordenador EAD', note: 'Registros categorizados (tipo, motivo, retorno, desfecho) por estudante ou turma toda; indicadores de retornos pendentes e alertas de desistência.' },
      { title: 'Nova tratativa', path: '/tratativas/nova', profile: 'CTM: Coordenador EAD', note: 'Monitoria ou pedagógico registra a tratativa e quando acompanhar de novo.' },
    ],
  },
  {
    id: 'escolar-desistencias',
    title: 'Desistências das escolas',
    profile: 'DR solicitante: Coordenador Escolar',
    steps: [
      { title: 'Confirmação de desistências', path: '/desistencias', focus: 'text=Confirmar', profile: 'DR solicitante: Coordenador Escolar', note: 'Gestor e Coordenador Escolar têm os mesmos acessos do Gestor EAD do DR, mas vinculados às suas escolas: aqui só aparecem os estudantes do SENAI Maracanã e do SENAI Tijuca.' },
    ],
  },
  {
    id: 'financeiro',
    title: 'Financeiro',
    profile: 'CTM: Coordenador EAD',
    steps: [
      { title: 'Financeiro', path: '/financeiro', profile: 'CTM: Coordenador EAD', note: 'Os DRs solicitantes aparecem em cards, com os números de cobrança e as ações; “Ver estudantes” abre a situação de cobrança por estudante: cobra até o DR formalizar a saída (corte dia 20, cobrança dia 5). Suspenso no AVA sem formalização vira alerta. Formalização registrada aqui, não por e-mail.' },
      { title: 'Acompanhamento dos estudantes', path: '/financeiro?aba=acompanhamento', profile: 'CTM: Coordenador EAD', note: 'Turma e ciclo: cada estudante com contato, status geral, saída e monitor; por UC do ciclo, a situação (ativo, suspenso, não integrado) e se fatura. Base do nº de estudantes da cobrança.' },
      { title: 'Confirmação de desistências', path: '/desistencias', focus: 'text=Confirmar', profile: 'DR solicitante: Gestor EAD', note: 'Dupla checagem: a desistência vem do Moodle e o DR confirma (a saída vale e o estudante deixa de faturar) ou contesta (falha de integração: segue matriculado).' },
      { title: 'Relatório de cobrança', path: '/financeiro?aba=cobranca', focus: 'text=Abrir relatório', profile: 'CTM: Gestor EAD', note: 'A CTM escolhe a proposta aprovada para cobrar do DR solicitante.' },
      { title: 'Relatório da proposta', path: '/financeiro/cobranca/2?propostas=6', profile: 'CTM: Gestor EAD', note: 'Pode juntar propostas aprovadas do mesmo TAA e da mesmo DR (aqui PC-MG-002 + PC-MG-006, TAA 007/2026 do SENAI-RJ); TAA diferente não entra. Por ciclo (mês): uma linha por turma × escola × UC com CH cobrada, estudantes integrados e valor estudante/hora; ajustes de cobrança; exporta planilha ou PDF.' },
      { title: 'Notificação de aditivo', path: '/produtos/1', focus: 'text=Fazer aditivo', profile: 'CTM: Gestor EAD', note: 'O sino avisa: mais estudantes nas salas do Moodle do que na proposta (Mecatrônica: 43 × 40). A CTM faz o aditivo.' },
      { title: 'Aditivo da proposta', path: '/produtos/novo?versao=1&aditivo=1', profile: 'CTM: Gestor EAD', note: 'Nova versão com os estudantes do Moodle já preenchidos e o motivo do aditivo; a anterior fica no histórico de versões.' },
    ],
  },

  {
    id: 'comercial-criacao-portfolio',
    title: 'Criação de portfólio',
    profile: 'CTM: Gestor EAD',
    steps: [
      { title: 'Gestão de Portfólio', path: '/gestao-produtos', focus: 'text=Novo curso', profile: 'CTM: Gestor EAD', note: 'O Gestor EAD clica em “Novo curso”.' },
      { title: 'Novo curso', path: '/gestao-produtos/novo', profile: 'CTM: Gestor EAD', note: 'Escolhe um edital (só cursos em que o DR é a CTM aprovada), marca um ou mais cursos desse edital e cadastra módulos e UCs de cada um. Salvar envia a solicitação ao DN: o curso fica Aguardando até entrar no portfólio.' },
      { title: 'Curso criado', path: '/gestao-produtos', focus: 'row=Soldador', profile: 'CTM: Gestor EAD', note: 'Ao salvar, o curso entra no portfólio com módulos, unidades e carga horária (ex.: Soldador) e fica disponível para as propostas.' },
    ],
  },
  {
    id: 'comercial-criacao-proposta',
    title: 'Criação de proposta',
    profile: 'CTM: Gestor EAD',
    steps: [
      { title: 'Gestão de propostas', path: '/produtos', focus: 'text=Nova proposta', profile: 'CTM: Gestor EAD', note: 'A proposta é sempre da CTM. A negociação acontece fora do sistema; quando avança, o Gestor EAD cria a proposta.' },
      { title: 'Nova proposta', path: '/produtos/novo', profile: 'CTM: Gestor EAD', note: 'Vinculada a um TAA/contrato aceito: cursos do TAA, estudantes e início por curso; matriz do portfólio; valor = valor do edital × estudantes (fixo); saldo do TAA mostrado. Salva como Rascunho.' },
      { title: 'Proposta em rascunho', path: '/produtos/7', profile: 'CTM: Gestor EAD', note: 'Gestão da proposta: resumo, cursos com a matriz, versões, documentos e histórico. O Gestor EAD é o responsável.' },
      { title: 'Vai e vem: nova versão', path: '/produtos/4', profile: 'CTM: Gestor EAD', note: 'O DR pediu ajuste: “Nova versão” guarda a v1 no histórico e cria a v2. Status atual: Aguardando.' },
      { title: 'Status da proposta', path: '/produtos', focus: 'text=Status', profile: 'CTM: Gestor EAD', note: 'O Gestor EAD registra o andamento combinado com o DR: Rascunho → Em andamento → Aguardando → Aprovado, ou Cancelado (motivo).' },
      { title: 'Aprovada: equipe técnica', path: '/produtos/1', profile: 'CTM: Gestor EAD', note: 'Aprovada, a proposta executa o saldo do TAA; vincula-se a equipe técnica (supervisor e analista), que define o cronograma e segue para Criar turmas.' },
    ],
  },
  {
    id: 'comercial-gestao-oferta',
    title: 'Criação de oferta',
    profile: 'CTM: Gestor EAD',
    steps: [
      { title: 'Gestão da oferta', path: '/oferta', focus: 'text=Nova oferta', profile: 'CTM: Gestor EAD', note: 'Lista de ofertas (uma linha por turma, com a proposta); clica em “Adicionar oferta” na proposta.' },
      { title: 'Nova oferta', path: '/oferta/proposta/2/nova', profile: 'CTM: Gestor EAD', note: 'Escolhe a proposta aprovada e os cursos; supervisor e analista vêm da equipe técnica da proposta. O sistema gera o cronograma (datas, semanas, encontros e aulas ao vivo por UC) pelos parâmetros e pulando os feriados nacionais; dá para ajustar à mão.' },
      { title: 'Oferta criada', path: '/oferta/t1/sucesso', profile: 'CTM: Gestor EAD', note: 'Confirmação: ofertas criadas com o cronograma v1 em rascunho.' },
      { title: 'Validação do cronograma', path: '/oferta/t2', profile: 'CTM: Gestor EAD', note: 'Registra o envio ao DR com prazo; o DR valida ou pede ajuste (nova versão). Sem resposta até o prazo, conta como validado. UCs agrupáveis com outras turmas aparecem marcadas.' },
      { title: 'Turma confirmada', path: '/oferta/t1', profile: 'CTM: Gestor EAD', note: 'Com o cronograma validado e o DR confirmando a turma, “Confirmar turma” muda o status para Buscar tutor (libera o PCP e a criação de salas). Também: prorrogar início e cancelar turma.' },
    ],
  },
  {
    id: 'dr-acompanhamento',
    title: 'Acompanhamento da execução',
    profile: 'DR solicitante: Gestor EAD',
    steps: [
      { title: 'Painel', path: '/acompanhamento', focus: 'text=Requer atenção', profile: 'DR solicitante: Gestor EAD', note: 'Dashboard do DR solicitante (SENAI-MG): indicadores gerais e, por contrato, as turmas com execução e quantos estudantes requerem atenção.' },
      { title: 'Gestão de Contratos', path: '/contratos', focus: '[data-slot="data-table"]', profile: 'DR solicitante: Gestor EAD', note: 'Contratos do DR com o CTM: empresa cliente, cursos EAD, vigência, valor e status.' },
      { title: 'Detalhes do contrato', path: '/contratos/c1', profile: 'DR solicitante: Gestor EAD', note: 'Side nav com os dados do contrato, vagas ocupadas e as turmas que o CTM opera para a empresa.' },
      { title: 'Detalhes da turma', path: '/turmas-ead/t1', profile: 'DR solicitante: Gestor EAD', note: 'Execução do calendário, progresso e média dos estudantes, tutor do CTM e lista de estudantes.' },
      { title: 'Detalhes do estudante', path: '/alunos/a2', profile: 'DR solicitante: Gestor EAD', note: 'Motivos que pedem atitude, notas das atividades e histórico de acessos ao AVA e ao Portal do estudante.' },
    ],
  },
]
