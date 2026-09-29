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
2. **Gestão de Contratos** (DN) — Gestão de TAA → Novo TAA → TAA em elaboração → TAA vigente.
3. **Novo TAA** (Comercial) — Gestão de TAAs → Novo TAA, feito pelo perfil Comercial.
4. **Novo TAA** (Supervisor) — o mesmo fluxo, feito pelo perfil Supervisor.
5. **Criação de edital** — Gestão de Editais → Novo edital → Edital criado (sucesso) (DN) → Gestão de Portfólio → Novo produto (Supervisor).
6. **Criação de portfólio** (Supervisor) — Gestão de Portfólio → Novo produto (produtos de um edital).
7. **Criação de proposta** (Supervisor) — Gestão de propostas → Nova proposta → aceitar/recusar na listagem.
8. **Criação de oferta** (Supervisor) — Gestão da oferta → Nova oferta → Oferta criada → Aulas ao vivo.
9. **Acompanhamento da execução** (DR solicitante) — Painel → Gestão de Contratos → Detalhes do contrato → Detalhes da turma → Detalhes do aluno.

Novos fluxos entram nesta lista na posição em que acontecem (e na mesma ordem em `src/journeys.ts`).

## Perfis
- **Super admin** (provisório) — administra usuários, perfis/permissões, auditoria e logs do sistema; vê todas as telas do menu e **os dados de toda a plataforma** (ex.: no acompanhamento, contratos/turmas/alunos de todas as DRs, com coluna/filtro de DR). Menu setorizado (DN, CTM, DR solicitante, Administração).
- **DN** — cria e gerencia editais e faz a gestão de DRs (contatos, status, editais em que cada DR está credenciado).
- **Comercial** — por enquanto tem as mesmas telas do Supervisor e também pode criar TAA pela própria Gestão de TAAs.
- **Supervisor** (ex.: SENAI-MG) — cadastra produtos, cria propostas comerciais e também pode criar TAA (mesmas jornadas do Comercial).
- **DR solicitante** (ex.: SENAI-MG) — vende o curso a uma empresa (ex.: Panvel) e contrata o CTM para operar o EAD (tutoria e monitoria). Perfil de **acompanhamento**, somente leitura: Painel, Gestão de Contratos, Turmas e Alunos.

## Acompanhamento (DR solicitante)
- Contrato = DR solicitante ↔ CTM, com empresa cliente, só cursos EAD, vigência, valor, vagas e status (Vigente / Em elaboração / Encerrado).
- Turma: situação pelo calendário (A iniciar / Em andamento / Finalizada); execução = % do período decorrido.
- Aluno **requer atenção** (turma não finalizada) se: sem acesso há mais de 7 dias, média < 6, atividade não entregue, ou progresso mais de 10 p.p. abaixo do esperado pelo calendário.
- Situação do aluno: **Evadido** (sem acesso há mais de 30 dias), **Em risco** (algum alerta), **Em dia**.

## TAA (Termo de Acordo Administrativo)
- Acordo DN ↔ DR. Nunca chamar de "TA" ou "Termo de Adesão".
- Todo TAA criado tem **vigência e valor global** preenchidos (obrigatórios no Novo TAA). TAA não tem produtos vinculados.
- **Sem fluxo de assinatura no sistema.** Percurso do TAA:
  1. Novo TAA em **duas etapas** — Etapa 1 (Dados): DR, vigência e valor → **Salvar e avançar** (TAA salvo, *Em elaboração*). Etapa 2 (Documento): o termo com os dados preenchidos → **Baixar TAA** para enviar → Concluir.
  2. Assinaturas acontecem fora do sistema; o status fica *Em elaboração*.
  3. Em Gestão de TAA, ação **Anexar TAA assinado** (só em *Em elaboração*) → upload → status *Vigente*.

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

## Gestão de TAAs (Supervisor)
- Menu "Gestão de TAAs" (antes "Meus TAAs"): TAAs da DR com outras DRs.
- No menu de ações de cada TAA, **Gestão de propostas** leva às propostas com a DR parceira daquele TAA.
- Nova proposta aberta de dentro de um TAA já vem com a DR contratante fixa (a parceira do TAA).
- **Gestão de propostas** tem menu próprio (Supervisor/Comercial, `/produtos`) com todas as propostas. Entrando pelo TAA, há **redirect** para `/produtos?taa=<id>`, que filtra pela DR parceira do TAA (breadcrumb volta para Gestão de TAAs).

## Criação de oferta (Supervisor)
- Objetivo: criar **turmas** a partir das propostas.
- Nova oferta: escolhe a proposta → um ou mais cursos dela; a matriz curricular (módulos → UCs) vem do produto (última versão) e é complementada com **CH a distância, CH presencial, início e término de cada UC**. A soma das CHs de cada curso **não pode passar a CH total daquele produto** na proposta (total fica vermelho e Salvar é bloqueado).
- **Aulas ao vivo são por UC**: configuradas depois, pela ação **Aulas ao vivo** na tabela da Gestão da oferta (sheet de baixo, rota `/oferta/:id/aulas-ao-vivo`: lista de UCs por módulo; cada UC tem um dia de aula ao vivo com horário, incluído pelo botão Adicionar). Não fazem parte do formulário Nova oferta, mas são a última etapa da jornada.
- Nº da turma: `TU-<UF>-<seq>/<ano>`.

## Proposta comercial (Supervisor)
- DR ofertante (a própria, fixa) → DR contratante.
- Pode ter vários cursos, cada um com valor previsto.
- Cada curso só pode entrar em uma proposta.
- Número: `PC-<UF>-<seq>/<ano>`.
- **O sistema não envia nada para ninguém.** O acordo é fechado fora do sistema.
- Criação: "Nova proposta" → "Salvar proposta" (status *Em elaboração*).
- Depois de criada, o perfil registra o resultado na Gestão da proposta: **Aprovada** (status *Aceita*) ou **Recusada** (status *Recusada*).
- Aceitar/recusar também direto no menu de ações da listagem de propostas (enquanto não decidida).
- **Visualizar** (olho) abre side sheet com dados, cursos (quantas ofertas cada um tem) e **ofertas vinculadas**.
- Proposta **aceita não pode ser excluída** (lixeira desabilitada).
- Recusar pede **feedback** (motivo), que aparece no Resumo da proposta.
- Depois de aprovada ou recusada, os botões somem.

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

- 2026-09-29 — Jornadas de criação terminam no **item criado** (Usuário criado, DR credenciada, TAA criado, Produto criado, Proposta criada), com o Guia destacando a linha (`focus: 'row=…'`). Guia: com side nav de criação aberta, não escurece e o cartão fica no canto; clique no cartão não fecha a side nav. Casca: ignora ecos de rota logo após trocar de etapa (mesma rota em duas etapas). Selects Perfil/Jornada sem campo de busca.
