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
      { title: 'Permissões do perfil', path: '/admin/perfis/CTM%3A%20Comercial', profile: 'Super admin', note: 'Marca as telas que o perfil acessa (com “Selecionar todas”) e salva.' },
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
      { title: 'Novo feriado', path: '/admin/feriados/novo', profile: 'Super admin', note: 'Nome e data. Editar e excluir (com confirmação) pela listagem.' },
    ],
  },
  {
    id: 'admin-visao-geral',
    title: 'Supervisão das áreas',
    profile: 'Super admin',
    steps: [
      { title: 'Gestão de DRs', path: '/drs', focus: 'text=Nova DR credenciada', profile: 'Super admin', note: 'Super admin acessa todas as telas do sistema para acompanhar e corrigir dados.' },
      { title: 'Gestão de Editais', path: '/editais', focus: 'text=Novo edital', profile: 'Super admin' },
      { title: 'Gestão de propostas', path: '/produtos', focus: 'text=Nova proposta', profile: 'Super admin' },
      { title: 'Gestão da oferta', path: '/oferta', focus: 'text=Nova oferta', profile: 'Super admin' },
    ],
  },
  {
    id: 'drs',
    title: 'Cadastro de DRs',
    profile: 'DN',
    steps: [
      { title: 'Gestão de DRs credenciadas', path: '/drs', focus: 'text=Nova DR credenciada', profile: 'DN', note: 'Início do sistema: o DN clica em “Nova DR credenciada”.' },
      { title: 'Nova DR credenciada', path: '/drs/novo', profile: 'DN', note: 'Escolhe a DR (UF ainda não credenciada) e preenche o contato. Nasce Ativa; pode ser inativada depois.' },
      { title: 'DR credenciada', path: '/drs', focus: 'row=SENAI-PE', profile: 'DN', note: 'Ao salvar, a DR aparece na lista como Ativa, com responsável e contato (ex.: SENAI-PE). Dali pode ser editada ou inativada.' },
    ],
  },
  {
    id: 'fluxo',
    title: 'Criação de edital',
    profile: 'DN',
    steps: [
      { title: 'Gestão de Editais', path: '/editais', focus: 'text=Novo edital', profile: 'DN', note: 'DN clica em “Novo edital”.' },
      { title: 'Novo edital', path: '/editais/novo', profile: 'DN', note: 'Define vigência e cursos: valor, DRs credenciados e a CTM aprovada de cada produto (a que ofereceu o menor custo).' },
      { title: 'Edital criado', path: '/editais/1/sucesso', profile: 'DN', note: 'Tela de sucesso: resumo do edital salvo, com opção de ver o edital ou voltar à gestão.' },
      { title: 'Gestão de Portfólio', path: '/gestao-produtos', focus: 'text=Novo produto', profile: 'CTM: Supervisor', note: 'Supervisor clica em “Novo produto”.' },
      { title: 'Novo produto', path: '/gestao-produtos/novo', profile: 'CTM: Supervisor', note: 'Escolhe um edital (só produtos em que a DR é a CTM aprovada), marca os produtos e cadastra módulos e UCs. Salvar envia a solicitação ao DN: o produto fica Aguardando aprovação até entrar no portfólio.' },
      { title: 'Produto criado', path: '/gestao-produtos', focus: 'row=Soldador', profile: 'CTM: Supervisor', note: 'Ao salvar, o produto entra no portfólio com módulos, unidades e carga horária (ex.: Soldador) e fica disponível para as propostas.' },
    ],
  },
  {
    id: 'contratos',
    title: 'Contratação de CTM (TAA)',
    profile: 'DN',
    steps: [
      { title: 'TAAs com CTMs', path: '/dashboard', focus: 'text=Novo TAA', profile: 'DN', note: 'O DN não gerencia os TAAs da rede: aqui ficam só os TAAs em que o DN contrata uma CTM. Clica em “Novo TAA”.' },
      { title: 'Novo TAA', path: '/dashboard/novo-ta', profile: 'DN', note: 'Contratante fixo (SENAI DN); escolhe o edital e os produtos. A CTM vem da aprovação no edital (menor custo); produtos de outra CTM vão em outro TAA. Vigência e valor global; baixa o termo.' },
      { title: 'TAA em elaboração', path: '/dashboard/3', profile: 'DN', note: 'Assinaturas fora do sistema. Ao voltar, “Anexar TAA assinado”.' },
      { title: 'TAA vigente', path: '/dashboard/1', profile: 'DN', note: 'Com o TAA assinado anexado, o status passa a Vigente. A CTM já pode registrar propostas para o DN.' },
    ],
  },
  {
    id: 'dr-contratacao',
    title: 'Contratação da CTM (TAA)',
    profile: 'DR solicitante: SENAI',
    steps: [
      { title: 'TAAs com CTMs', path: '/dashboard', focus: 'text=Novo TAA', profile: 'DR solicitante: SENAI', note: 'O Gestor da DR solicitante (coordenador, interlocutor…) pede a contratação de uma CTM. SENAI com SENAI é TAA; se o solicitante for SESI, o instrumento é contrato.' },
      { title: 'Novo TAA', path: '/dashboard/novo-ta', profile: 'DR solicitante: SENAI', note: 'Contratante fixo (a própria DR); escolhe o edital e os produtos (a CTM é a aprovada no edital para eles); Gestor solicitante (nome e cargo); vigência e valor global; baixa o termo.' },
      { title: 'TAA em elaboração', path: '/dashboard/5', profile: 'DR solicitante: SENAI', note: 'Assinaturas fora do sistema. Ao voltar, “Anexar TAA assinado”.' },
      { title: 'TAA vigente', path: '/dashboard/4', profile: 'DR solicitante: SENAI', note: 'Vigente: a CTM contratada registra as propostas para esta DR.' },
    ],
  },
  {
    id: 'sesi-contratacao',
    title: 'Contratação da CTM (contrato)',
    profile: 'DR solicitante: SESI',
    steps: [
      { title: 'Contratos com CTMs', path: '/dashboard', focus: 'text=Novo contrato', profile: 'DR solicitante: SESI', note: 'O Gestor do SESI-MG (interlocutor) pede a contratação de uma CTM do SENAI. SESI com SENAI não é TAA: o instrumento é contrato.' },
      { title: 'Novo contrato', path: '/dashboard/novo-ta', profile: 'DR solicitante: SESI', note: 'Contratante fixo (SESI-MG); escolhe o edital e os produtos; a CTM é a aprovada no edital para eles. Vigência e valor global; baixa o contrato.' },
      { title: 'Contrato em elaboração', path: '/dashboard/14', profile: 'DR solicitante: SESI', note: 'Assinaturas fora do sistema. Ao voltar, anexa o contrato assinado.' },
      { title: 'Contrato vigente', path: '/dashboard/15', profile: 'DR solicitante: SESI', note: 'Vigente: a CTM contratada (SENAI-SC) registra as propostas para o SESI-MG.' },
    ],
  },
  {
    id: 'criacao-portfolio',
    title: 'Criação de portfólio',
    profile: 'CTM: Supervisor',
    steps: [
      { title: 'Gestão de Portfólio', path: '/gestao-produtos', focus: 'text=Novo produto', profile: 'CTM: Supervisor', note: 'Supervisor clica em “Novo produto”.' },
      { title: 'Novo produto', path: '/gestao-produtos/novo', profile: 'CTM: Supervisor', note: 'Escolhe um edital (só produtos em que a DR é a CTM aprovada), marca um ou mais produtos desse edital e cadastra módulos e UCs de cada um. Salvar envia a solicitação ao DN: o produto fica Aguardando aprovação até entrar no portfólio.' },
      { title: 'Produto criado', path: '/gestao-produtos', focus: 'row=Soldador', profile: 'CTM: Supervisor', note: 'Ao salvar, o produto entra no portfólio com módulos, unidades e carga horária (ex.: Soldador) e fica disponível para as propostas.' },
    ],
  },
  {
    id: 'aprovacao-portfolio',
    title: 'Aprovação de portfólio',
    profile: 'DN',
    steps: [
      { title: 'Aprovação de portfólio', path: '/portfolio/aprovacoes', focus: 'text=Aprovar', profile: 'DN', note: 'Solicitações das CTMs: novos produtos e novas versões. Visualizar mostra matriz, itinerário e documentos vinculados.' },
      { title: 'Portfólio das CTMs', path: '/portfolio', profile: 'DN', note: 'Aprovado, o produto (ou a nova versão) entra no portfólio, visível para todas as DRs. Reprovado volta para a CTM com o motivo.' },
    ],
  },
  {
    id: 'portfolio-dr',
    title: 'Portfólio das CTMs',
    profile: 'DR solicitante: SENAI',
    steps: [
      { title: 'Portfólio das CTMs', path: '/portfolio', profile: 'DR solicitante: SENAI', note: 'Todas as DRs consultam o portfólio aprovado: produto, CTM, versão vigente, itinerário e documentos. Base para escolher os produtos do TAA.' },
    ],
  },
  {
    id: 'criacao-proposta',
    title: 'Criação de proposta',
    profile: 'CTM: Supervisor',
    steps: [
      { title: 'Gestão de propostas', path: '/produtos', focus: 'text=Nova proposta', profile: 'CTM: Supervisor', note: 'Supervisor clica em “Nova proposta”.' },
      { title: 'Nova proposta', path: '/produtos/novo', profile: 'CTM: Supervisor', note: 'Contratante: só quem tem TAA (SENAI) ou contrato (SESI) com a CTM. Registro mínimo (o documento é feito fora, no modelo): edital, contratante, CNPJ, faturamento (DR ou escolas), nº no CRM e link do documento; por curso, vagas, início previsto e valor. Salva Em negociação.' },
      { title: 'Proposta criada', path: '/produtos/4', profile: 'CTM: Supervisor', note: 'Ao salvar, a proposta abre em Gestão da proposta, Em negociação, com os cursos, vagas e valores previstos; o acordo é fechado fora do sistema.' },
      { title: 'Proposta aceita ou recusada', path: '/produtos', focus: 'text=Aceitar', profile: 'CTM: Supervisor', note: 'Depois do acordo (fora do sistema), marca Aceita ou Recusada (recusa pede feedback). Alerta quando a turma começa em até 15 dias e a proposta não foi aceita. Duplicar abre nova rodada; aceita ainda pode ser cancelada (com motivo).' },
    ],
  },
  {
    id: 'gestao-oferta',
    title: 'Criação de oferta',
    profile: 'CTM: Supervisor',
    steps: [
      { title: 'Gestão da oferta', path: '/oferta', focus: 'text=Nova oferta', profile: 'CTM: Supervisor', note: 'Lista de ofertas (uma linha por turma, com a proposta); clica em “Adicionar oferta” na proposta.' },
      { title: 'Nova oferta', path: '/oferta/proposta/2/nova', profile: 'CTM: Supervisor', note: 'Escolhe a proposta aceita, os cursos, supervisor e analista. O sistema gera o cronograma (datas, semanas, encontros e aulas ao vivo por UC) pelos parâmetros e pulando os feriados nacionais; dá para ajustar à mão.' },
      { title: 'Oferta criada', path: '/oferta/t1/sucesso', profile: 'CTM: Supervisor', note: 'Confirmação: ofertas criadas com o cronograma v1 em rascunho.' },
      { title: 'Validação do cronograma', path: '/oferta/t2', profile: 'CTM: Supervisor', note: 'Registra o envio à DR com prazo; a DR valida ou pede ajuste (nova versão). Sem resposta até o prazo, conta como validado. UCs agrupáveis com outras turmas aparecem marcadas.' },
      { title: 'Turma confirmada', path: '/oferta/t1', profile: 'CTM: Supervisor', note: 'Com o cronograma validado e a DR confirmando a turma, “Confirmar turma” muda o status para Buscar tutor (libera o PCP e a criação de salas). Também: prorrogar início e cancelar turma.' },
    ],
  },
  {
    id: 'gestao-execucao',
    title: 'Gestão da execução',
    profile: 'CTM: Supervisor',
    steps: [
      { title: 'Equipe', path: '/equipe', profile: 'CTM: Supervisor', note: 'Pessoas da CTM por função, com competências (UCs) e dias disponíveis. E-mail corporativo não se repete.' },
      { title: 'Alocação da equipe', path: '/oferta/t1?aba=execucao', profile: 'CTM: Supervisor', note: 'Turma em Buscar tutor: supervisão aloca monitores, pedagógico e interlocutor; PCP aloca o tutor por UC (competência primeiro) e a ação (Planejamento, Replanejamento ou Apropriação, sugerida pelo histórico).' },
      { title: 'E-mail ao tutor', path: '/oferta/t1?aba=execucao', profile: 'CTM: Supervisor', note: '“Gerar” monta o e-mail com dados da turma, equipe e links (plano de curso, plano de ensino, pasta, sala). Copiar e enviar fora; marcar tutor confirmado. Planejamento/replanejamento pedem validação pedagógica.' },
      { title: 'Integração com o AVA', path: '/oferta/t1?aba=integracao', profile: 'CTM: Supervisor', note: 'Criar salas no AVA (botão), tabela de código CTM por escola + ID da sala por UC para a DR parametrizar no SGE, e situação da integração por escola com alerta 5 dias antes do início.' },
      { title: 'Histórico da turma', path: '/oferta/t1?aba=historico', profile: 'CTM: Supervisor', note: 'Tudo o que mudou na turma: versões do cronograma, confirmação, equipe, e-mails, salas.' },
    ],
  },
  {
    id: 'pcp-alocacao',
    title: 'Alocação de tutores',
    profile: 'CTM: PCP',
    steps: [
      { title: 'Equipe', path: '/equipe', profile: 'CTM: PCP', note: 'Tutores com competências (UCs) e dias disponíveis.' },
      { title: 'Turma em Buscar tutor', path: '/oferta/t1?aba=execucao', profile: 'CTM: PCP', note: 'O PCP aloca o tutor de cada UC (competência primeiro), define a ação (Planejamento, Replanejamento ou Apropriação) e o dia das aulas ao vivo, olhando o curso inteiro.' },
    ],
  },
  {
    id: 'pedagogico',
    title: 'Validação e acompanhamento',
    profile: 'CTM: Pedagógico',
    steps: [
      { title: 'Validação pedagógica', path: '/oferta/t1?aba=execucao', profile: 'CTM: Pedagógico', note: 'UCs em planejamento/replanejamento: o pedagógico valida o material antes do monitor subir no AVA.' },
      { title: 'Tratativas pedagógicas', path: '/tratativas', profile: 'CTM: Pedagógico', note: 'Registros categorizados por aluno ou turma; retornos pendentes e alertas de desistência.' },
      { title: 'Nova tratativa', path: '/tratativas/nova', profile: 'CTM: Pedagógico', note: 'Registra a tratativa e quando acompanhar de novo.' },
    ],
  },
  {
    id: 'tutor',
    title: 'Minhas UCs (em avaliação)',
    profile: 'CTM: Tutor',
    steps: [
      { title: 'Turmas', path: '/oferta', profile: 'CTM: Tutor', note: 'Caixa em avaliação: o tutor consultaria as turmas em que foi alocado.' },
      { title: 'UCs da turma', path: '/oferta/t1?aba=execucao', profile: 'CTM: Tutor', note: 'Em avaliação: ver a ação (planejamento/apropriação), o período e os links da UC em vez de depender só do e-mail.' },
    ],
  },
  {
    id: 'monitor',
    title: 'Salas e tratativas (em avaliação)',
    profile: 'CTM: Monitor',
    steps: [
      { title: 'Integração com o AVA', path: '/oferta/t1?aba=integracao', profile: 'CTM: Monitor', note: 'Caixa em avaliação: o monitor acompanharia salas criadas e a integração dos alunos por escola.' },
      { title: 'Nova tratativa', path: '/tratativas/nova', profile: 'CTM: Monitor', note: 'Monitoria registra contatos com alunos (baixo acesso, atividade não entregue…).' },
    ],
  },
  {
    id: 'acompanhamento-pedagogico',
    title: 'Acompanhamento pedagógico',
    profile: 'CTM: Supervisor',
    steps: [
      { title: 'Tratativas pedagógicas', path: '/tratativas', profile: 'CTM: Supervisor', note: 'Registros categorizados (tipo, motivo, retorno, desfecho) por aluno ou turma toda; indicadores de retornos pendentes e alertas de desistência.' },
      { title: 'Nova tratativa', path: '/tratativas/nova', profile: 'CTM: Supervisor', note: 'Monitoria ou pedagógico registra a tratativa e quando acompanhar de novo.' },
    ],
  },
  {
    id: 'financeiro',
    title: 'Financeiro',
    profile: 'CTM: Supervisor',
    steps: [
      { title: 'Financeiro', path: '/financeiro', profile: 'CTM: Supervisor', note: 'Situação de cobrança por aluno: cobra até a DR formalizar a saída (corte dia 20, cobrança dia 5). Suspenso no AVA sem formalização vira alerta. Formalização registrada aqui, não por e-mail.' },
    ],
  },
  {
    id: 'comercial-criacao-portfolio',
    title: 'Criação de portfólio',
    profile: 'CTM: Comercial',
    steps: [
      { title: 'Gestão de Portfólio', path: '/gestao-produtos', focus: 'text=Novo produto', profile: 'CTM: Comercial', note: 'Comercial clica em “Novo produto”.' },
      { title: 'Novo produto', path: '/gestao-produtos/novo', profile: 'CTM: Comercial', note: 'Escolhe um edital (só produtos em que a DR é a CTM aprovada), marca um ou mais produtos desse edital e cadastra módulos e UCs de cada um. Salvar envia a solicitação ao DN: o produto fica Aguardando aprovação até entrar no portfólio.' },
      { title: 'Produto criado', path: '/gestao-produtos', focus: 'row=Soldador', profile: 'CTM: Comercial', note: 'Ao salvar, o produto entra no portfólio com módulos, unidades e carga horária (ex.: Soldador) e fica disponível para as propostas.' },
    ],
  },
  {
    id: 'comercial-criacao-proposta',
    title: 'Criação de proposta',
    profile: 'CTM: Comercial',
    steps: [
      { title: 'Gestão de propostas', path: '/produtos', focus: 'text=Nova proposta', profile: 'CTM: Comercial', note: 'Comercial clica em “Nova proposta”.' },
      { title: 'Nova proposta', path: '/produtos/novo', profile: 'CTM: Comercial', note: 'Contratante: só quem tem TAA (SENAI) ou contrato (SESI) com a CTM. Registro mínimo (o documento é feito fora, no modelo): edital, contratante, CNPJ, faturamento (DR ou escolas), nº no CRM e link do documento; por curso, vagas, início previsto e valor. Salva Em negociação.' },
      { title: 'Proposta criada', path: '/produtos/4', profile: 'CTM: Comercial', note: 'Ao salvar, a proposta abre em Gestão da proposta, Em negociação, com os cursos, vagas e valores previstos; o acordo é fechado fora do sistema.' },
      { title: 'Proposta aceita ou recusada', path: '/produtos', focus: 'text=Aceitar', profile: 'CTM: Comercial', note: 'Depois do acordo (fora do sistema), marca Aceita ou Recusada (recusa pede feedback). Alerta quando a turma começa em até 15 dias e a proposta não foi aceita. Duplicar abre nova rodada; aceita ainda pode ser cancelada (com motivo).' },
    ],
  },
  {
    id: 'comercial-gestao-oferta',
    title: 'Criação de oferta',
    profile: 'CTM: Comercial',
    steps: [
      { title: 'Gestão da oferta', path: '/oferta', focus: 'text=Nova oferta', profile: 'CTM: Comercial', note: 'Lista de ofertas (uma linha por turma, com a proposta); clica em “Adicionar oferta” na proposta.' },
      { title: 'Nova oferta', path: '/oferta/proposta/2/nova', profile: 'CTM: Comercial', note: 'Escolhe a proposta aceita, os cursos, supervisor e analista. O sistema gera o cronograma (datas, semanas, encontros e aulas ao vivo por UC) pelos parâmetros e pulando os feriados nacionais; dá para ajustar à mão.' },
      { title: 'Oferta criada', path: '/oferta/t1/sucesso', profile: 'CTM: Comercial', note: 'Confirmação: ofertas criadas com o cronograma v1 em rascunho.' },
      { title: 'Validação do cronograma', path: '/oferta/t2', profile: 'CTM: Comercial', note: 'Registra o envio à DR com prazo; a DR valida ou pede ajuste (nova versão). Sem resposta até o prazo, conta como validado. UCs agrupáveis com outras turmas aparecem marcadas.' },
      { title: 'Turma confirmada', path: '/oferta/t1', profile: 'CTM: Comercial', note: 'Com o cronograma validado e a DR confirmando a turma, “Confirmar turma” muda o status para Buscar tutor (libera o PCP e a criação de salas). Também: prorrogar início e cancelar turma.' },
    ],
  },
  {
    id: 'dr-acompanhamento',
    title: 'Acompanhamento da execução',
    profile: 'DR solicitante: SENAI',
    steps: [
      { title: 'Painel', path: '/acompanhamento', focus: 'text=Requer atenção', profile: 'DR solicitante: SENAI', note: 'Dashboard da DR solicitante (SENAI-MG): indicadores gerais e, por contrato, as turmas com execução e quantos alunos requerem atenção.' },
      { title: 'Gestão de Contratos', path: '/contratos', focus: '[data-slot="data-table"]', profile: 'DR solicitante: SENAI', note: 'Contratos da DR com o CTM: empresa cliente, cursos EAD, vigência, valor e status.' },
      { title: 'Detalhes do contrato', path: '/contratos/c1', profile: 'DR solicitante: SENAI', note: 'Side nav com os dados do contrato, vagas ocupadas e as turmas que o CTM opera para a empresa.' },
      { title: 'Detalhes da turma', path: '/turmas-ead/t1', profile: 'DR solicitante: SENAI', note: 'Execução do calendário, progresso e média dos alunos, tutor do CTM e lista de alunos.' },
      { title: 'Detalhes do aluno', path: '/alunos/a2', profile: 'DR solicitante: SENAI', note: 'Motivos que pedem atitude, notas das atividades e histórico de acessos ao AVA e ao Portal do aluno.' },
    ],
  },
  {
    id: 'sesi-acompanhamento',
    title: 'Acompanhamento da execução',
    profile: 'DR solicitante: SESI',
    steps: [
      { title: 'Painel', path: '/acompanhamento', profile: 'DR solicitante: SESI', note: 'Dashboard do SESI-MG: turmas que a CTM opera para ele e alunos que requerem atenção.' },
      { title: 'Detalhes do contrato', path: '/contratos/c7', profile: 'DR solicitante: SESI', note: 'Contrato do SESI-MG com a CTM (empresa cliente, vagas, turmas).' },
      { title: 'Detalhes da turma', path: '/turmas-ead/t9', profile: 'DR solicitante: SESI', note: 'Execução e alunos da turma.' },
    ],
  },
]
