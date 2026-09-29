# Regras do fluxo — CTM

Registro das regras de negócio e do percurso decidido. Atualizar a cada decisão nova.

## Fluxos (na ordem em que acontecem no sistema)
Na casca, o select agrupa por perfil que inicia a jornada e **numera dentro de cada perfil** (DN 1, 2, 3; Supervisor 1, 2…).

0a. **Gestão de usuários** (Super admin) — Gestão de usuários → Novo usuário → Editar usuário.
0b. **Perfis e permissões** (Super admin) — Perfis e permissões → Permissões do perfil.
0c. **Auditoria** (Super admin) — trilha de ações, somente leitura.
0d. **Supervisão das áreas** (Super admin) — Gestão de DRs → Editais → Propostas → Oferta.
1. **Cadastro de DRs** (DN) — início do sistema: Gestão de DRs credenciadas → Nova DR credenciada. DR nasce Ativa; ações Editar e Inativar/Ativar na listagem.
2. **Gestão de Contratos** (DN) — Gestão de TAA → Novo TAA → TAA em elaboração → TAA vigente.
3. **Novo TAA** (Comercial) — Gestão de TAAs → Novo TAA, feito pelo perfil Comercial.
4. **Novo TAA** (Supervisor) — o mesmo fluxo, feito pelo perfil Supervisor.
5. **Criação de edital** — Gestão de Editais → Novo edital → Edital criado (sucesso) (DN) → Gestão de Portfólio → Novo produto (Supervisor).
6. **Criação de portfólio** (Supervisor) — Gestão de Portfólio → Novo produto (produtos de um edital).
7. **Criação de proposta** (Supervisor) — Gestão de propostas → Nova proposta → aceitar/recusar na listagem.
8. **Criação de oferta** (Supervisor) — Gestão da oferta → Nova oferta → Oferta criada → Aulas ao vivo.

Novos fluxos entram nesta lista na posição em que acontecem (e na mesma ordem em `src/journeys.ts`).

## Perfis
- **Super admin** (provisório) — administra usuários, perfis/permissões e auditoria; vê todas as telas do menu.
- **DN** — cria e gerencia editais e faz a gestão de DRs (contatos, status, editais em que cada DR está credenciado).
- **Comercial** — por enquanto tem as mesmas telas do Supervisor e também pode criar TAA pela própria Gestão de TAAs.
- **Supervisor** (ex.: SENAI-MG) — cadastra produtos, cria propostas comerciais e também pode criar TAA (mesmas jornadas do Comercial).

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
