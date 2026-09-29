# Regras do fluxo — CTM

Registro das regras de negócio e do percurso decidido. Atualizar a cada decisão nova.

## Fluxos (na ordem em que acontecem no sistema)
Na casca há **dois selects**: **Perfil** (com a contagem de jornadas) e **Jornada** (só as que esse perfil inicia), **numeradas dentro de cada perfil** (DN 1, 2, 3; Supervisor 1, 2…). Trocar o perfil abre a 1ª jornada dele (ou a 1ª tela do menu, se não tiver jornada).

0a. **Gestão de usuários** (Super admin) — Gestão de usuários → Novo usuário → Editar usuário.
0b. **Perfis e permissões** (Super admin) — Perfis e permissões → Permissões do perfil.
0c. **Auditoria** (Super admin) — trilha de ações, somente leitura.
0c2. **Logs do sistema** (Super admin) — Logs do sistema → Detalhe do log (side nav): ações dos usuários na plataforma (login, visualizou, criou, editou com antes/depois, excluiu, aceitou/recusou, exportou, anexou).
0d. **Supervisão das áreas** (Super admin) — Gestão de DRs → Editais → Propostas → Oferta.
1. **Cadastro de DRs** (DN) — início do sistema: Gestão de DRs credenciadas → Nova DR credenciada. DR nasce Ativa; ações Editar e Inativar/Ativar na listagem.
2. **Criação de edital** — Gestão de Editais → Novo edital → Edital criado (sucesso) (DN) → Gestão de Portfólio → Novo produto (Supervisor).
3. **Contratação de CTM (TAA)** (DN) — TAAs com CTMs → Novo TAA → TAA em elaboração → TAA vigente.
4. **Contratação da CTM (TAA)** (DR solicitante) — o mesmo fluxo, com a DR solicitante como contratante.
5. **Criação de portfólio** (Supervisor) — Gestão de Portfólio → Novo produto (produtos de um edital).
6. **Criação de proposta** (Supervisor) — Gestão de propostas → Nova proposta (Em negociação) → aceitar/recusar na listagem (cancelar/duplicar depois).
7. **Criação de oferta** (Supervisor) — Calendário → Gestão da oferta → Nova oferta (cronograma gerado) → Oferta criada → Validação do cronograma → Turma confirmada.
7a. **Gestão da execução** (Supervisor) — Equipe → Alocação da equipe → E-mail ao tutor → Integração com o AVA → Histórico da turma.
7b. **Acompanhamento pedagógico** (Supervisor) — Tratativas pedagógicas → Nova tratativa.
7c. **Financeiro** (Supervisor) — situação de cobrança por aluno e formalizações.
8. **Acompanhamento da execução** (DR solicitante) — Painel → Gestão de Contratos → Detalhes do contrato → Detalhes da turma → Detalhes do aluno.

Novos fluxos entram nesta lista na posição em que acontecem (e na mesma ordem em `src/journeys.ts`).

## Perfis
- **Super admin** (provisório) — administra usuários, perfis/permissões, auditoria e logs do sistema; vê todas as telas do menu e **os dados de toda a plataforma** (ex.: no acompanhamento, contratos/turmas/alunos de todas as DRs, com coluna/filtro de DR). Menu setorizado (DN, CTM, DR solicitante, Administração).
- **DN** — cria e gerencia editais e faz a gestão de DRs. **Não gerencia os TAAs da rede**: só cria/acompanha os TAAs em que ele mesmo contrata uma CTM (TAAs com CTMs).
- **Comercial** — mesmas telas do Supervisor. **Não gerencia TAAs**, só propostas.
- **Supervisor** (ex.: SENAI-MG) — cadastra produtos, cria propostas comerciais e opera a oferta. **Não gerencia TAAs**; nas propostas vê o TAA/contrato de cada contratante.
- **DR solicitante** (ex.: SENAI-MG) — contrata uma CTM: cria o **TAA** (TAAs com CTMs) e acompanha a execução (Painel, Gestão de Contratos, Turmas e Alunos). Vende o curso a uma empresa (ex.: Panvel) e contrata o CTM para operar o EAD.
- Uma mesma DR pode ser **CTM** (ofertante) e **DR solicitante** (contratante) — são perfis diferentes.

## Acompanhamento (DR solicitante)
- Contrato = DR solicitante ↔ CTM, com empresa cliente, só cursos EAD, vigência, valor, vagas e status (Vigente / Em elaboração / Encerrado).
- Turma: situação pelo calendário (A iniciar / Em andamento / Finalizada); execução = % do período decorrido.
- Aluno **requer atenção** (turma não finalizada) se: sem acesso há mais de 7 dias, média < 6, atividade não entregue, ou progresso mais de 10 p.p. abaixo do esperado pelo calendário.
- Situação do aluno: **Evadido** (sem acesso há mais de 30 dias), **Em risco** (algum alerta), **Em dia**.

## TAA (Termo de Acordo Administrativo) e contrato
- **Quem contrata cria**: a DR solicitante (ou o DN) cria o instrumento para contratar uma **CTM** (DR credenciada). A CTM não gerencia TAAs, só propostas.
- **TAA é só entre SENAI e SENAI**: DR solicitante SENAI-XX (ou o SENAI DN) ↔ CTM. Nunca chamar de "TA" ou "Termo de Adesão".
- **SESI-XX ↔ SENAI é contrato** (não é TAA). No protótipo o contratante SESI aparece como `SESI-UF` e o instrumento como *Contrato* (nº `CT-<seq>/<ano>`).
- Tela **TAAs com CTMs** (`/dashboard`): DN e DR solicitante veem só os seus (em que são contratantes); Super admin vê todos, com colunas Contratante e Instrumento.
- A proposta só pode ser feita para quem tem TAA ou contrato (não encerrado) com a CTM; a coluna **TAA / contrato** da Gestão de propostas mostra o instrumento ou "Sem TAA/contrato".
- Todo TAA criado tem **vigência e valor global** preenchidos (obrigatórios no Novo TAA). TAA não tem produtos vinculados.
- **Sem fluxo de assinatura no sistema.** Percurso do TAA:
  1. Novo TAA em **duas etapas** — Etapa 1 (Dados): contratante (fixo, o do perfil), CTM contratada, vigência e valor → **Salvar e avançar** (TAA salvo, *Em elaboração*). Etapa 2 (Documento): o termo com os dados preenchidos → **Baixar TAA** para enviar → Concluir.
  2. Assinaturas acontecem fora do sistema; o status fica *Em elaboração*.
  3. Em TAAs com CTMs, ação **Anexar TAA assinado** (só em *Em elaboração*) → upload → status *Vigente*.

## Edital (DN)
- Tem vigência e cursos.
- Cada curso tem valor e DRs credenciados.
- Área, modalidade e CH vêm do catálogo e não podem ser editadas.

## Produto (Supervisor)
- "Novo produto" abre em 3 colunas na mesma tela, sem etapas: **Edital** (escolhe apenas um) → **Produtos** do edital em que a DR está credenciada (um ou mais) → **Módulos e UCs** do produto ativo.
- Trocar o edital limpa a seleção.
- Salvar só é liberado quando todos os produtos marcados têm módulos e UCs completos.

### Versões de produto
- Na listagem, cada produto tem as ações **Visualizar** (olho → side sheet de detalhes) e **Nova versão**; o side sheet também tem "Nova versão a partir da vN".
- "Nova versão" abre direto a modal já preenchida com o produto (sem confirmação; dá para cancelar na própria modal); ela copia a versão escolhida para ajustes (módulos e UCs) e salva como a próxima versão (v2, v3…).
- A versão anterior **não é alterada**: o que já está vinculado a ela continua apontando para ela.
- Toda versão mantém o vínculo com a v1 (a "mãe") e registra de qual versão foi copiada.
- Dados do edital/catálogo (edital, área, modalidade, CH) são fixos em todas as versões.
- A tabela mostra só a versão mais recente de cada produto; as anteriores (ex.: v1 de um produto na v2) ficam registradas no histórico de versões do side sheet, e dá para abrir cada uma.

## Criação de oferta (Supervisor)
- Objetivo: criar **turmas** a partir das propostas **aceitas** (só elas aparecem na Nova oferta).
- Nova oferta: escolhe a proposta → um ou mais cursos dela → supervisor e analista da turma. A matriz curricular (módulos → UCs) vem do produto (última versão); **CH a distância e presencial** por UC são editáveis. A soma das CHs de cada curso **não pode passar a CH total daquele produto** na proposta (total fica vermelho e Salvar é bloqueado).
- Nº da turma: `TU-<UF>-<seq>/<ano>` (padrão das CTMs ainda a confirmar; ver Pendências).
- Detalhes da oferta em abas (`?aba=cronograma|execucao|integracao|historico`); toda mudança entra no **Histórico** da turma.

### Cronograma (gerado pelo sistema)
- Substitui o script da planilha. Parâmetros na Nova oferta: **início da turma** (vem do início previsto do curso na proposta), **horas por semana** (padrão 20), **ambientação** (junto com a 1ª UC ou semana própria), **intervalo entre módulos** (5/7/10/15 dias), **UC termina na sexta**, **pode iniciar módulo em dezembro** (se não, empurra para depois do recesso).
- Regra: UCs em sequência; semanas da UC = CH da UC ÷ horas por semana (arredonda para cima); conta **só dias úteis** e pula **feriados nacionais, recessos e férias** do Calendário. Cada curso começa na data de início.
- Por UC o sistema calcula **semanas de estudo**, **encontros presenciais** (1 a cada 4 h presenciais) e **aulas ao vivo previstas** (CH a distância ÷ 20). As fórmulas de encontros/aulas são hipótese a validar com a CTM.
- As datas podem ser ajustadas à mão antes de salvar; avisos aparecem quando o sistema move uma data (dia não útil, módulo em dezembro).
- **Agrupamento**: UC com o mesmo nome em outra turma (não cancelada) começando na mesma semana aparece como **Agrupável** (versão simples; a análise com troca de ordem das UCs fica para depois).

### Validação do cronograma e status da turma
- Cronograma tem **versão** e situação: *Rascunho* → *Aguardando validação* (registra o envio à DR com **prazo**) → *Validado* (DR validou ou **passou o prazo sem resposta**). "DR pediu ajuste" gera a **próxima versão** (novo início + o que a DR pediu) e volta a Rascunho.
- Status da turma: **A iniciar** → **Buscar tutor** (ação "Confirmar turma", só com cronograma validado: a DR confirmou que a turma vai começar; libera o PCP e a criação de salas) → **Em andamento** (a partir do início) → **Finalizada** (depois do término). **Cancelada** a qualquer momento antes do fim, com motivo (a DR deve avisar com 10 dias).
- **Prorrogar início**: nova data + motivo; todas as datas (UCs e aulas ao vivo) andam junto, sem aditivo. Só antes de começar.
- **Dia do encontro presencial** (informado pela DR) e **escolas da turma** (nome, cidade, alunos) ficam na aba Cronograma.
- **Aulas ao vivo são por UC** (um dia com horário), definidas pelo PCP na matriz da aba Cronograma.

### Gestão da execução (aba Execução)
- Só a partir de **Buscar tutor**. Supervisão aloca a equipe da turma: **monitor front, monitor back, pedagógico, interlocutor** (funções configuráveis por CTM).
- PCP aloca o **tutor por UC**: quem tem a UC nas competências aparece primeiro (estrela), com os dias disponíveis e quantas vezes já deu a UC.
- **Ação do tutor** por UC: *Planejamento* (UC nunca executada), *Apropriação* (já executada; usa a sala modelo) ou *Replanejamento* (quando a supervisão/pedagógico pede). O sistema sugere pelo histórico.
- **E-mail ao tutor**: o sistema monta assunto e mensagem (turma, UC, período, encontros, aulas ao vivo, equipe e links: plano de curso, plano de ensino, pasta, sala). Os documentos continuam no drive: o sistema guarda **só os links**. O envio é fora (copiar); depois, **Marcar tutor confirmado**.
- Planejamento/replanejamento: situação *Em planejamento* até o pedagógico marcar **Validado pelo pedagógico** (aí o monitor back sobe o material). Apropriação vai direto a *Tutor confirmado*.

### Integração com o AVA (aba Integração)
- **Criar salas no AVA**: botão (MVP), liberado a partir de Buscar tutor; cada UC recebe o ID da sala.
- **Dados de integração para a DR**: código CTM por escola (`<turma>-<ESCOLA>`) + ID da sala de cada UC + início + semestre, com "Copiar tabela" para a DR parametrizar no SGE.
- **Situação da integração** por escola (integrados × alunos): Integrada / Parcial / Não integrada; alerta quando faltam 5 dias ou menos para o início e a DR ainda não integrou. "Consultar AVA" simula o serviço do AVA.

## Calendário (CTM)
- Feriados nacionais são fixos (não se excluem). A CTM cadastra **recessos e férias coletivas** (Novo período). O gerador de cronograma pula todos.

## Equipe (CTM)
- Pessoas com função, **e-mail corporativo único** (não cadastra duas vezes), competências (UCs) e dias disponíveis. Inativar pede confirmação e tira a pessoa da alocação.

## Tratativas pedagógicas (CTM)
- Registro categorizado por **aluno ou turma toda**: tipo (Ativa/Receptiva), **motivo** (baixo acesso, baixo desempenho, atividade não entregue, saúde, trabalho, financeiro, dúvida, outro), retorno do aluno, **desfecho** (resolvido, acompanhar novamente, alerta de desistência, plano de recuperação) e data para acompanhar de novo.
- Indicadores: retornos pendentes até hoje, alunos em alerta de desistência, tratativas sem retorno.

## Financeiro (CTM)
- A CTM **cobra o aluno até a DR formalizar a saída** (desistente, trancado, validado, transferido). Status no AVA sem formalização não para a cobrança: vira alerta "Sem formalização".
- A formalização é registrada no sistema (antes era por e-mail), com data e a partir de quando deixa de cobrar (UC em andamento ou próxima UC).
- **Corte no dia 20**: formalizações até o dia 20 saem da cobrança do dia 5 do mês seguinte; depois do dia 20, da cobrança do mês subsequente.
- Resumo de alunos cobrados por escola.

## Proposta comercial (Supervisor)
- DR ofertante (a própria, fixa) → DR contratante.
- Pode ter vários cursos, cada um com **vagas, início previsto e valor previsto**.
- Cada curso só pode entrar em uma proposta (cursos de propostas recusadas/canceladas voltam a ficar livres).
- Registro mínimo (o documento é feito fora, no modelo): edital, DR contratante, **CNPJ do contratante**, **faturamento** (para a DR ou por escola, com as escolas), **nº no CRM** (opcional), **link do documento** e anexo.
- Número: `PC-<UF>-<seq>/<ano>`.
- **O sistema não envia nada para ninguém.** O acordo é fechado fora do sistema.
- Criação: "Nova proposta" → "Salvar proposta" (status **Em negociação**).
- **Duplicar** (listagem): nova rodada de negociação — abre a Nova proposta com os dados da original e registra de qual proposta veio.
- **Alerta de prazo**: proposta ainda não aceita com turma prevista para começar em até 15 dias aparece com "Faltam N dias" / "Prazo vencido" na coluna Início previsto.
- Proposta **aceita pode ser cancelada** (ação na listagem, com motivo) → status *Cancelada*.
- Histórico da proposta (registro, rodadas, aceite, recusa, cancelamento) na Gestão da proposta.
- Depois de criada, o perfil registra o resultado na Gestão da proposta: **Aprovada** (status *Aceita*) ou **Recusada** (status *Recusada*).
- Aceitar/recusar também direto no menu de ações da listagem de propostas (enquanto não decidida).
- **Visualizar** (olho) abre side sheet com dados, cursos (quantas ofertas cada um tem) e **ofertas vinculadas**.
- Proposta **aceita não pode ser excluída** (lixeira desabilitada).
- Recusar pede **feedback** (motivo), que aparece no Resumo da proposta.
- Depois de aprovada ou recusada, os botões somem.

## Mapa do processo (painel da casca)
- Visão BPMN de ponta a ponta, para todos os perfis (menu Sistema): pools (DN, CTM, DR contratante, Sistemas) e raias por ator (DN, Comercial, Supervisão, PCP, Analista, Tutor, Monitoria e pedagógico, Financeiro, DR contratante, AVA/SGE); fases no topo; tarefas, decisões, paralelos, eventos de prazo; sequência (linha cheia) e mensagem entre organizações (tracejada).
- Tarefa tracejada = acontece fora do sistema. Clique numa etapa: detalhes, regras e **Abrir no protótipo**. Filtro por ator (select ou clique na raia) e zoom.
- Dados em `src/lib/processo.ts`: manter junto com as regras deste arquivo.

## Pendências (reunião de processos de 28/09/2026)
- **Avisos do sistema**: a regra "o sistema não envia nada" conflita com os avisos pedidos (à DR, prazos, integração). Hoje os avisos aparecem só nas telas.
- **Curso repetido**: "cada curso só em uma proposta" conflita com T01/T02 do mesmo curso para a mesma DR.
- **Código da turma**: padrão citado = curso/modalidade + nº sequencial por DR + ano/semestre de início (ex.: T02MS, 2026-1).
- **Quem cria o contrato com o SESI**: o SESI não tem perfil no protótipo; hoje os contratos SESI aparecem como dados (Super admin e coluna nas propostas da CTM).
- Ainda não feito: modelo de TAA versionado por edital, áreas tecnológicas e saldo do teto no TAA, novos perfis (Analista, PCP, Monitor, Pedagógico, Tutor), acesso da DR contratante para validar cronograma e formalizar saídas, média EAD por DR e devolução de notas, pesquisas do AVA, vitrine das CTMs.

## Percurso (histórico de decisões)
- 2026-09-28 — Gestão da proposta: seções (Resumo, Cursos, Documentos, Histórico) numa página só, com âncoras fixas na lateral.
- 2026-09-28 — Removidos "Salvar e enviar" e o fluxo de envio/aceite duplo. A proposta só é criada e depois marcada como aceita.
- 2026-09-28 — Gestão da proposta: botões Aprovada/Recusada; recusa exige feedback.
- 2026-09-28 — Novo produto: sem etapas; layout em colunas (edital → produtos → módulos/UCs).
- 2026-09-28 — Jornadas: todas unidas em "Fluxo completo" (começa no DN, Novo edital); perfil da etapa aparece como etiqueta no canto superior esquerdo da tela; seletor de perfil removido da lateral.
- 2026-09-28 — Casca: menu lateral virou mapa de jornadas horizontal (fluxograma). Fluxo principal: Gestão de Editais → Novo edital → Gestão de Portfólio → Novo produto (rota /gestao-produtos/novo). TAA e Propostas ficam soltas até serem definidas. Abrir protótipo/Restaurar dados foram para o topo.
- 2026-09-28 — Casca: Restaurar dados virou menu (Somente desta tela / Todo o protótipo); cada tela declara suas coleções em `data` no screens.ts.
- 2026-09-28 — Perfil "DR credenciada" renomeado para "Supervisor" (continua sendo o usuário do SENAI-MG).
- 2026-09-28 — DN: nova tela Gestão de DRs credenciadas (/drs), jornada solta "DRs".
- 2026-09-28 — Jornada "Fluxo principal" renomeada para "Gestão de Portfólio".
- 2026-09-28 — Jornadas reduzidas a duas: Gestão de Portfólio e Gestão de Contratos (Gestão de TAA → Novo TAA). DRs e Propostas saíram das jornadas (telas continuam existindo).
- 2026-09-28 — Produto: detalhes em side sheet (olho) com histórico de versões; ação "Nova versão" na listagem (não altera a anterior; mantém vínculo com a v1). Coluna Propostas removida da Gestão de Portfólio.
- 2026-09-28 — Novo TAA: signatários removidos; campo obrigatório "TAA assinado" (anexo). Vigência e valor global na mesma linha.
- 2026-09-28 — TAA: anexo saiu do Novo TAA; baixar modelo no Novo TAA e na listagem; upload do assinado em Gestão de TAA muda o status para Vigente.
- 2026-09-28 — Gestão de TAA: Visualizar abre side sheet com status, dados, documentos (modelo e assinado) e andamento; anexar o assinado também pelo side sheet.
- 2026-09-28 — TAA: todos com vigência e valor global; "produtos vinculados" removido (tabela, detalhes e dados).
- 2026-09-28 — Jornada Gestão de Contratos: Gestão de TAA → Novo TAA → TAA em elaboração (/dashboard/4) → TAA vigente (/dashboard/1). Detalhes do TAA ganharam rota /dashboard/:id.
- 2026-09-28 — Fluxos numerados; "Cadastro de DRs" entra como fluxo 1 (início do sistema). Ordem manual salva no navegador foi removida.
- 2026-09-28 — Ordem dos fluxos: 1. Cadastro de DRs, 2. Gestão de Contratos, 3. Gestão de Portfólio.
- 2026-09-28 — Tela "Minhas Propostas" (/produtos, Supervisor) renomeada para "Gestão de Contrato".
- 2026-09-28 — Menu do Supervisor: "Gestão de Produtos" renomeada para "Gestão de Portfólio" (tela, etapas e textos).
- 2026-09-28 — Supervisor: "Meus TAAs" → "Gestão de TAAs"; propostas movidas para dentro do TAA (ação "Gestão de propostas"), fora do menu.
- 2026-09-28 — Dentro do TAA (Supervisor): "Gestão dos produtos" renomeada para "Gestão de propostas".
- 2026-09-28 — Novo perfil Comercial (mesmas telas do Supervisor + Gestão de TAA/Novo TAA); fluxo 3 "Novo TAA (Comercial)".
- 2026-09-28 — Novo TAA: termo movido para o fim do formulário; baixar só depois de preencher DR, vigência e valor.
- 2026-09-28 — Supervisor tem as mesmas jornadas do Comercial: fluxo 4 "Novo TAA (Supervisor)"; Gestão de TAA liberada para o Supervisor.
- 2026-09-28 — Nova versão: confirmação antes de abrir a modal preenchida.
- 2026-09-28 — Supervisor e Comercial: "Gestão de TAA" (tela do DN) removida do menu deles; Novo TAA agora é feito dentro da Gestão de TAAs (/meus-taas/novo). DN mantém a Gestão de TAA.
- 2026-09-28 — Fluxo 6 "Criação de portfólio": Gestão de Portfólio → Novo produto (Supervisor).
- 2026-09-28 — DRs: botão/modal "Nova DR credenciada" (/drs/novo, UFs ainda não credenciadas) e ações Inativar/Ativar; seed só com parte das DRs.
- 2026-09-28 — Select de jornada: numeração reinicia em cada perfil.
- 2026-09-28 — Novo TAA em duas etapas (dados → documento para baixar). Detalhes do TAA: seção Andamento removida.
- 2026-09-28 — Jornada do DN "Gestão de Portfólio" renomeada para "Criação de edital".
- 2026-09-28 — Criação de edital: tela de sucesso após salvar (/editais/:id/sucesso), com resumo e ações Ver edital / Voltar.
- 2026-09-28 — Nova versão: sem modal de confirmação; versão (vN → vN+1) em destaque no topo da modal.
- 2026-09-28 — Protótipo: removidos todos os snackbars; nenhum campo obrigatório bloqueia salvar (asteriscos mantidos).
- 2026-09-28 — Nova jornada Gestão da oferta (Supervisor): turmas a partir de propostas, CH/datas por UC, dias ao vivo. Casca: Anterior/Próxima ao lado da etiqueta do perfil, com atalhos ← →.
- 2026-09-28 — Gestão de propostas volta ao menu lateral (Supervisor/Comercial); acesso pelo TAA redireciona para /produtos?taa=<id>.
- 2026-09-28 — Proposta passa a ter edital (campo na Nova proposta, coluna na listagem, resumo e visualização do TAA).
- 2026-09-28 — Gestão de propostas: ações Aceitar/Recusar na listagem.
- 2026-09-28 — Nova jornada Criação de proposta (Supervisor).
- 2026-09-28 — Formulários de criação abrem preenchidos com dados de exemplo (Nova proposta, Novo TAA, Nova DR, Novo edital, Novo produto, Nova oferta, anexo do TAA assinado).
- 2026-09-28 — Proposta aceita não pode ser excluída.
- 2026-09-28 — Gestão da oferta: coluna UCs; "Nova turma" → "Nova oferta" (modal, botão, etapa).
- 2026-09-28 — Gestão de propostas: Visualizar em side sheet com vínculo às ofertas.
- 2026-09-28 — Dados de exemplo: propostas 001–003 aceitas; 001 e 002 com oferta, 003 sem oferta.
- 2026-09-28 — Oferta: tela de detalhes (/oferta/:id) com matriz e aulas ao vivo; botão Acessar nas ofertas do side sheet da proposta e Visualizar na Gestão da oferta.
- 2026-09-28 — Excluir/inativar em todo o sistema confirma em modal (useConfirmar), sem confirm() nativo.
- 2026-09-28 — Comercial ganhou as mesmas jornadas do Supervisor (Criação de portfólio, Criação de proposta, Gestão da oferta), já que os menus são iguais.
- 2026-09-28 — Nova oferta: CH a distância + presencial por UC; soma limitada à CH do produto; label "Curso".
- 2026-09-28 — Aulas ao vivo: saíram da Nova oferta; agora por UC, em modal aberta pela ação "Aulas ao vivo" na tabela da Gestão da oferta.
- 2026-09-28 — Jornada "Gestão da oferta" → "Criação de oferta" (Supervisor e Comercial), com etapa final Aulas ao vivo; Aulas ao vivo virou sheet de baixo com calendário por UC.
- 2026-09-28 — Aulas ao vivo: cada dia tem horário de início e término (padrão 19:00–21:00; novo dia herda o horário do último marcado).
- 2026-09-28 — Aulas ao vivo: calendário de um mês com navegação (abre no mês de início da UC) + campo para inserir a data; horários à direita do calendário.
- 2026-09-28 — Aulas ao vivo: **um dia por UC** (com horário); escolher outro dia substitui o anterior.
- 2026-09-28 — Aulas ao vivo: saiu o calendário; ficou só a lista de UCs, cada uma com botão Adicionar (data + início/término, removível).
- 2026-09-28 — Nova oferta: curso escolhido destacado (check + "Nesta oferta"; rótulo "Curso desta oferta"); ao salvar abre confirmação "Oferta criada" (/oferta/:id/sucesso) com resumo e atalho para Aulas ao vivo — nova etapa da jornada.
- 2026-09-28 — Oferta pode ter **vários cursos** da mesma proposta: seleção múltipla na Nova oferta; matriz agrupada por curso; limite de CH vale por curso.
- 2026-09-28 — Nova oferta: removida a etiqueta "Nesta oferta"; curso escolhido fica marcado só pelo check e destaque.
- 2026-09-28 — Gestão da oferta organizada por proposta: lista de propostas aceitas (vigência, nº de ofertas/turmas) → tela da proposta (/oferta/proposta/:id) com as ofertas (turmas); Nova oferta a partir dela já com a proposta fixa. Uma proposta tem várias ofertas (turmas). Sem coluna Cursos na tabela de ofertas.
- 2026-09-28 — Proposta ganhou **vigência** (início/fim) na Nova proposta, na tabela de propostas e no side sheet.
- 2026-09-28 — Menu lateral: item ativo com preenchimento preto e texto branco.
- 2026-09-28 — Gestão da oferta (lista de propostas): coluna Status (da proposta); sem coluna Aulas ao vivo.
- 2026-09-28 — DataTable: coluna Ações fixa à direita (sticky), sempre visível mesmo com rolagem horizontal (ex.: Aceitar/Recusar na Gestão de propostas).
- 2026-09-28 — Casca: o destaque da etapa no fluxograma acompanha a tela vista no protótipo (rota exata ou mesma tela); navegar dentro do protótipo não reposiciona a tela.
- 2026-09-28 — Gestão da oferta: listagem com uma linha por oferta (turma), repetindo proposta/status/DR/vigência; proposta aceita sem oferta aparece com "—". Ações por linha: Visualizar, Aulas ao vivo, Adicionar oferta (na mesma proposta), Excluir. Etapa "Ofertas da proposta" saiu da jornada (tela /oferta/proposta/:id segue existindo).
- 2026-09-28 — **Oferta = uma turma = um curso.** Na Nova oferta pode-se escolher vários cursos da proposta; ao salvar, cada curso vira uma oferta (turma) própria, com código sequencial, e aparece numa linha da Gestão da oferta com a mesma proposta. A confirmação lista as ofertas criadas, cada uma com atalho para Aulas ao vivo. Detalhes da oferta mostram uma única turma/curso.
- 2026-09-28 — Coleção de ofertas trocada para turmas-v7 para descartar ofertas antigas com vários cursos numa mesma turma.
- 2026-09-28 — Aulas ao vivo: cadastro **só em Visualizar oferta**, na lista de UCs — botão Adicionar por UC abre modal (data dentro do período da UC + início/término); editar (lápis) e remover (com confirmação). Saíram a sheet de Aulas ao vivo, a ação na tabela e a rota /oferta/:id/aulas-ao-vivo.
- 2026-09-28 — Gestão da oferta: só linhas com oferta (turma); proposta sem oferta não aparece na listagem (nova oferta pelo botão do topo).
- 2026-09-28 — Gestão da oferta: colunas Início e Término da turma (no lugar de Vigência/Período); na coluna Proposta, link "Ver mais" abre o side sheet da proposta.
- 2026-09-28 — Status da turma (oferta) derivado das datas: **Em andamento** até o término da última UC; depois, **Finalizada**. Coluna Status da Gestão da oferta passou a ser o da turma; aparece também nos detalhes.
- 2026-09-28 — Novo perfil **Super admin** (provisório): vê todas as telas do menu + Gestão de usuários (novo/editar/inativar), Perfis e permissões (telas por perfil) e Auditoria (somente leitura). Jornadas: Gestão de usuários, Perfis e permissões, Auditoria, Supervisão das áreas.
- 2026-09-28 — Anotações passam a ser compartilhadas via Supabase: qualquer visitante do site publicado cria pinos (com nome); editar/excluir só pelo painel do Supabase.
- 2026-09-28 — Casca: selo do perfil (canto superior esquerdo) ganhou seta para trocar de perfil; ao trocar, abre a 1ª jornada iniciada por ele, na 1ª etapa.
- 2026-09-28 — Perfis Supervisor e Comercial renomeados para **CTM: Supervisor** e **CTM: Comercial**; perfil **CTN** removido. Casca: rótulo "Jornada" à esquerda do select; painel de anotações com fundo.
- 2026-09-28 — Gestão da oferta: coluna DR contratante logo ao lado de Proposta.
- 2026-09-28 — Anotações: qualquer visitante pode excluir (confirmação em modal); painel de anotações sobreposto, altura toda, sem empurrar o layout. URL simulada: ctm.com.br.
- 2026-09-28 — Novo perfil **CTM: Solicitante**: mesmas telas do CTM: Supervisor (SENAI-MG), sem jornadas próprias. Trocar para um perfil sem jornada abre a 1ª tela do menu dele.
- 2026-09-28 — Tabelas: botão **Filtros** (gestão de filtros) em todo DataTable; qualquer coluna pode virar filtro. Os de `filter: true` já aparecem ao abrir. Painel de anotações sem a rota sob o título.
- 2026-09-28 — Dados de exemplo: proposta PC-MG-005/2026 aberta pelo **CTM: Solicitante** para SENAI-BA, Em análise (aguardando a DR contratante). Campo `criadoPor` na proposta.
- 2026-09-28 — Perfil CTM: Solicitante vira **DR solicitante** (SENAI-BA). CTM = a operação (não é DR). Menu próprio **Gestão de Contratos** (`/contratos`): contratos da DR com o CTM; PC-MG-005 é pedido da DR aguardando o CTM, PC-MG-006 aceito.
- 2026-09-28 — DR solicitante passa a SENAI-MG e vira perfil de acompanhamento: Painel, Gestão de Contratos (com o CTM, empresa cliente, cursos EAD), Turmas e Alunos, com detalhes. Removidas PC-MG-005/006. Jornada “Acompanhamento da execução”.
- 2026-09-28 — Filtros das tabelas: todos dentro do botão **Filtros** (popover com um select por coluna); fora dele só a busca e as etiquetas dos filtros aplicados (removíveis) + “Limpar tudo”.
- 2026-09-28 — Detalhe do aluno abre em **side nav** (Sheet à direita) pelo “Visualizar” no Painel, na turma e em Alunos; `/alunos/:id` = lista de Alunos com a side nav aberta.
- 2026-09-28 — Em listas de alunos, o código da turma é link para o detalhe da turma (`/turmas-ead/:id`).
- 2026-09-28 — Alunos: último acesso relativo (“Há 44 dias”) na lista e na side nav; indicadores no topo (total, em dia, em risco, evadidos, sem acesso há mais de 7 dias).
- 2026-09-28 — Turmas: tabela sem a coluna Período (fica no detalhe) para não cortar Situação; ação **Ver alunos** abre o detalhe da turma já nos alunos (`?ver=alunos`).
- 2026-09-28 — Gestão de Contratos: “Visualizar” abre o detalhe em **side nav** (`/contratos/:id` = lista com a side nav aberta); dentro, as turmas do contrato levam ao detalhe da turma.
- 2026-09-28 — Painel da DR solicitante vira dashboard **por contrato**: indicadores gerais; um card por contrato (vigentes e encerrados) com turmas, alunos/vagas, requer atenção e progresso médio; em cada turma, execução e os alunos com alerta (abrem em side nav).
- 2026-09-28 — Side navs (Sheet à direita) dois degraus mais largas em todo o projeto (padrão lg; ex.: lg→3xl). Detalhe do contrato redesenhado: dados em lista, vigência e vagas com barra, contagem por situação e turmas em lista com execução e ações.
- 2026-09-28 — Painel: turmas de cada contrato viram cards com números grandes (alunos, requer atenção, execução %), barra de execução e “Ver alunos”; saem as etiquetas de alunos.
- 2026-09-28 — Detalhe do contrato: turmas usam o mesmo card do Painel (números grandes, execução, Ver alunos) no lugar da lista.
- 2026-09-28 — Design system atual registrado em `docs/design-system-atual.md` (para poder trocar e voltar). Troca de design system vale só para o layout do protótipo, **nunca para a casca** de jornadas.
- 2026-09-28 — Design system SENAI (docs/design-system.md) aplicado ao protótipo via classe `ds-senai` no <html> do iframe (`?frame=1`): Open Sans, primária laranja #BF340F, neutros SENAI, raio 8px. Casca intacta; visual anterior em docs/design-system-atual.md.
- 2026-09-28 — DS SENAI: primária laranja, secundária azul; sheets/modais flutuantes estilo iOS (afastados das bordas, cantos arredondados); fundo liso #F5F5F7, sem gradiente.
- 2026-09-28 — Menu lateral do protótipo flutuante (afastado das bordas, cantos arredondados), como os modais.
- 2026-09-28 — Revisão visual do DS: primária laranja base #E84910 (hover #F5631A, click #BF340F); status em Tags suaves automáticas (Badge com data-tone por texto); controles h-36 raio 10px; tabela com cabeçalho discreto; links em azul SENAI; avatar com iniciais em círculo azul (foto opcional em public/avatars/<e-mail>.jpg); menu do Super admin setorizado (DN, CTM, DR solicitante, Administração).
- 2026-09-28 — Tabelas no estilo do DS: card branco arredondado, cabeçalho limpo (sem fundo), linhas mais altas, 1ª coluna em destaque, ações como ícones soltos.
- 2026-09-28 — Painel da DR solicitante redesenhado: KPIs com ícone em círculo colorido; contrato em bloco com inicial da empresa, status, resumo em colunas; cards de turma com métricas em faixa e barra de execução. Ícones do menu em neutro mais claro que o texto (ativo em laranja).
- 2026-09-28 — Painel da DR solicitante no estilo dashboard: filtro por contrato; cards com sparkline e ícone em caixa colorida; gráfico de acessos ao portal (AVA × Portal do aluno, 14 dias, variação semanal); lista de turmas com barra de execução; feed “Requer atenção” (abre o aluno em side nav). StatCard ganhou ícone em caixa colorida (prop icon/tom). Filtros: popover com cabeçalho (contagem + Limpar), pílulas para até 6 valores e select para mais. Mock: acessos mais frequentes (alunos-ead-v2); aluno sem acesso = “Nunca acessou o portal”.
- 2026-09-28 — Menu lateral sem cor (some no fundo; item ativo em cartão branco), caixa da DR com ícone; logo CTM (marca laranja) no lugar de “CTM · Wireframes”. DataTable: busca e filtros dentro do mesmo container da tabela.
- 2026-09-28 — Busca rápida (⌘K) no menu lateral: telas + registros do perfil, sem acento, várias palavras, por situação/motivo. Paginação (10/página) em todo DataTable. Menu do avatar com “Sair”. Botão de esconder o menu removido.
- 2026-09-28 — Filtros salvos por tabela (no navegador), só dentro do painel de Filtros; filtros aplicados sempre numa linha abaixo da barra, em etiquetas cinza.
- 2026-09-28 — Ajustes de UI: modais/side navs com fundo sólido (sem transparência); tags de status com contorno; ícones de ação das tabelas em laranja; lixeira sem vermelho; “Ações” centralizado; botão Recusar proposta em vermelho; Gestão de TAAs sem coluna Cursos; nome do curso com reticências + nome completo no hover (Portfólio); detalhe do edital em side nav; total da Nova proposta no rodapé fixo da 3ª coluna.
- 2026-09-28 — Super admin vê dados de toda a plataforma no acompanhamento (DR solicitante vê só a própria DR). Mock: contratos CTM com campo `dr` e novos contratos SP/BA (contratos-ctm-v2, turmas-ead-v2, alunos-ead-v3).
- 2026-09-28 — Nova jornada **Logs do sistema** (Super admin): `/admin/logs` e `/admin/logs/:id` (side nav com stack trace/payload e eventos relacionados). Permissões: permissoes-v6.
- 2026-09-28 — Logs do sistema = **ações dos usuários** na plataforma (não erros técnicos): usuário, perfil, DR, ação, módulo, registro, IP, dispositivo e alterações antes/depois (logs-v2).
- 2026-09-28 — Logs do sistema com visão **Linha do tempo** (padrão): agrupada por dia, ícone colorido por ação, frase “Fulano editou X”, antes/depois inline, filtro por ação, busca e “Carregar mais”; alternância para Tabela.
- 2026-09-28 — Casca: seleção dividida em dois selects, Perfil e Jornada (a jornada lista só as do perfil escolhido).
- 2026-09-28 — Painéis por perfil (exceto Super admin): **DN** `/painel-dn` (DRs ativas, TAAs vigentes/aguardando assinatura/a vencer, editais com execução, cobertura das DRs); **CTM: Supervisor** `/painel-ctm` (funil de propostas, ofertas em execução, próximas aulas ao vivo, TAAs com DRs); **CTM: Comercial** `/painel-comercial` (em negociação, valor fechado, taxa de aceite, pipeline por status e por DR contratante, aguardando resposta, cursos mais propostos). DR solicitante segue com `/acompanhamento`. permissoes-v7.
- 2026-09-28 — Casca: rótulos Perfil/Jornada acima dos selects.
- 2026-09-28 — **Guia da jornada**: ao navegar pelo fluxograma (etapas, Anterior/Próxima, setas), o protótipo escurece a tela, deixa vazado o elemento em foco da etapa (`focus` em `src/journeys.ts`: seletor CSS ou `text=Texto`) e mostra um cartão com a explicação (a `note` da etapa), “Entendi” e “Próxima etapa”. Liga/desliga pelo botão “Guia” no topo da casca (lembrado no navegador).

- 2026-09-28 — Casca: botão **Tela cheia** (atalho F; também ao lado de Anterior/Próxima). Esconde o topo e o mapa da jornada, deixa só o selo do perfil, a etapa atual (n/total), Anterior/Próxima e o protótipo; usa a tela cheia do navegador. Sair: mesmo botão, F ou Esc.
- 2026-09-28 — Reunião de processos (gravação de 5h40): **proposta** nasce Em negociação, com CNPJ, faturamento/escolas, nº CRM, link, vagas e início previsto por curso; alerta de prazo; duplicar (nova rodada); cancelar aceita; histórico. **Oferta**: cronograma gerado pelo sistema (parâmetros + Calendário), versões e validação pela DR (prazo), status A iniciar → Buscar tutor → Em andamento → Finalizada / Cancelada, prorrogar início, dia do presencial, escolas, agrupamento simples. **Execução**: equipe da turma, tutor e ação por UC, e-mail ao tutor (links, sem arquivos), validação pedagógica. **Integração com o AVA**: criar salas, dados para a DR, situação por escola. Telas novas: Equipe, Calendário, Tratativas pedagógicas, Financeiro. Jornadas novas: Gestão da execução, Acompanhamento pedagógico, Financeiro. Casca: etapas podem ter query (`?aba=`).
- 2026-09-28 — Nova tela **Mapa do processo** (/processo): BPMN do processo inteiro com atores, fases e atalhos para as telas.
- 2026-09-28 — Casca: botão **Mapa do processo** no topo (ao lado de "Abrir protótipo livre") abre /processo dentro do protótipo; fica destacado enquanto o mapa está aberto. Para voltar, basta clicar numa etapa da jornada.
- 2026-09-28 — Mapa do processo: botão **Tela cheia** (tela cheia do navegador; se bloqueada, cobre a janela) com barra de filtro/zoom e legenda; ao entrar, encaixa largura e altura. Sair: mesmo botão ou Esc. O iframe da casca passou a permitir tela cheia (`allow="fullscreen"`).
- 2026-09-29 — Jornadas de criação terminam no **item criado** (Usuário criado, DR credenciada, TAA criado, Produto criado, Proposta criada), com o Guia destacando a linha (`focus: 'row=…'`). Guia: com side nav de criação aberta, não escurece e o cartão fica no canto; clique no cartão não fecha a side nav. Casca: ignora ecos de rota logo após trocar de etapa (mesma rota em duas etapas). Selects Perfil/Jornada sem campo de busca.
- 2026-09-29 — **Mapa do processo** deixa de ser tela do protótipo: vira **painel da casca** (botão no topo), sobre o protótipo; “Abrir no protótipo” leva o iframe à tela e fecha o painel. Rota /processo removida do menu.
- 2026-09-29 — Mapa do processo (painel): ocupa toda a altura; abre e “Ajustar” encaixam pela altura (atores ocupam a altura toda, texto legível), rolagem/arrasto na horizontal. Zoom: botões −/+, Ctrl/⌘ + roda (ou pinça), teclas + − 0 (0 = ajustar); arrastar com o mouse move o diagrama.
- 2026-09-29 — **Sem versão responsiva**: o protótipo é sempre desktop. Removidos os botões tablet/celular da casca; o protótipo usa viewport de 1440 e largura mínima de 1280px (em telas menores, rola em vez de se reorganizar); menu lateral nunca vira gaveta.
- 2026-09-29 — Casca: removido o botão “Tela cheia” do topo; continua o ícone ao lado de Anterior/Próxima e o atalho F.
- 2026-09-29 — **TAA/contrato é de quem contrata**: a DR solicitante (ou o DN) cria o TAA para contratar uma CTM; a CTM não gerencia TAAs (saíram Gestão de TAAs da CTM, /meus-taas, e as jornadas "Novo TAA" de Comercial/Supervisor). DN não gerencia os TAAs da rede, só os seus. TAA só SENAI ↔ SENAI; SESI ↔ SENAI é contrato. Tela "Gestão de TAA" → **TAAs com CTMs** (DN, DR solicitante e Super admin); Novo TAA escolhe a CTM. Propostas: contratante só com TAA/contrato, coluna TAA / contrato. Jornadas: Contratação de CTM (DN) e Contratação da CTM (DR solicitante). Mapa do processo atualizado.
- 2026-09-29 — Casca: painel de Perfil/Jornada minimizável (ícone − no canto superior direito); minimizado vira uma linha com perfil · jornada · etapa e botão de expandir (lembrado no navegador).
- 2026-09-29 — Casca: removido o ícone de tela cheia ao lado de Anterior/Próxima; tela cheia só pelo atalho F (Esc/F para sair).
- 2026-09-29 — Perfis: **CTM** é um perfil, com subperfis **Supervisor** e **Comercial**. No select da casca aparece só CTM (jornadas dos dois, numeradas juntas, com o subperfil entre parênteses). No protótipo, ao lado do selo de perfil (canto superior esquerdo), os subperfis ficam enfileirados; clicar seleciona o subperfil e abre a jornada equivalente dele na mesma etapa.
- 2026-09-29 — Casca: barra do topo em dois grupos rotulados — **Análise** (Mapa do processo, Anotar, Anotações) e **Design** (Guia, Abrir protótipo livre, Restaurar dados).
- 2026-09-29 — Guia da jornada **desligado por padrão**; liga pelo botão (lembrado no navegador).
- 2026-09-29 — Casca: na barra Análise/Design, o item ativo (Mapa aberto, Anotar, Anotações abertas, Guia ligado) fica com preenchimento branco.
