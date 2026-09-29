# Regras do fluxo — CTM

Registro das regras de negócio do sistema prototipado e do percurso decidido. Atualizar a cada decisão nova (sem detalhes visuais nem da casca). O mapa do processo (`src/lib/processo.ts`) acompanha estas regras.

## Fluxos (na ordem em que acontecem no sistema)
0a. **Gestão de usuários** (Super admin) — Gestão de usuários → Novo usuário → Editar usuário.
0b. **Perfis e permissões** (Super admin) — Perfis e permissões → Permissões do perfil.
0c. **Auditoria** (Super admin) — trilha de ações, somente leitura.
0c1. **Feriados nacionais** (Super admin) — Feriados nacionais → Novo feriado.
0c2. **Logs do sistema** (Super admin) — Logs do sistema → Detalhe do log (side nav): ações dos usuários na plataforma (login, visualizou, criou, editou com antes/depois, excluiu, aceitou/recusou, exportou, anexou).
0d. **Supervisão das áreas** (Super admin) — Gestão de DRs → Editais → Propostas → Oferta.
1. **Cadastro de DRs** (DN) — início do sistema: Gestão de DRs credenciadas → Nova DR credenciada. DR nasce Ativa; ações Editar e Inativar/Ativar na listagem.
2. **Criação de edital** — Gestão de Editais → Novo edital → Edital criado (sucesso) (DN) → Gestão de Portfólio → Novo produto (Gestor de oferta).
3. **Envio de TAA às DRs** (CTM: Gestor de contrato) — TAAs com as DRs → Novo TAA (um por DR) → Gestor da DR analisa → retorno para a CTM.
4. **TAAs com CTMs** (DR solicitante: SENAI) — lista → TAA recebido (analisar) → Novo TAA (a DR também cria) → Retornado → TAA aceito (saldo).
5. **Criação de portfólio** (CTM: Gestor de oferta) — Gestão de Portfólio → Novo produto (produtos de um edital).
5a. **Aprovação de portfólio** (DN) — Aprovação de portfólio → Portfólio das CTMs.
5b. **Portfólio das CTMs** (DR solicitante: SENAI) — consulta do portfólio aprovado.
6. **Criação de proposta** (CTM: Gestor de contrato, o responsável; o Gestor de oferta também acessa) — Gestão de propostas → Nova proposta (TAA aceito, Rascunho) → nova versão (vai e vem) → status (Em andamento, Aguardando, Aprovado) → equipe técnica → Criar turmas.
7. **Criação de oferta** (Gestor de oferta) — Gestão da oferta → Nova oferta (cronograma gerado) → Oferta criada → Validação do cronograma → Turma confirmada.
7a. **UCs da turma** (CTM: Gestor de oferta) — Equipe → equipe de cada UC → Integração com o Moodle → Histórico.
7b. **Equipe das UCs** (CTM: PCP) — Equipe → equipe de cada UC.
7c. **Planejamento das UCs** (CTM: Pedagógico) — UC em planejamento (aulas ao vivo + presenciais) → Tratativas.
7d. **Avaliação do planejamento** (CTM: Tutor) e **Salas e avaliações no Moodle** (CTM: Monitor).
7e. **Acompanhamento pedagógico** (CTM: Gestor de oferta) — Tratativas pedagógicas → Nova tratativa.
7f. **Financeiro** (CTM: Gestor de oferta) — situação de cobrança por aluno e formalizações → Relatório de cobrança (Gestor de contrato): proposta → relatório do ciclo.
7g. **Criação de portfólio, de proposta e de oferta** (CTM: Gestor de contrato) — as mesmas jornadas 5, 6 e 7, pelo Gestor de contrato.
8. **Acompanhamento da execução** (DR solicitante: SENAI) — Painel → Gestão de Contratos → Detalhes do contrato → Detalhes da turma → Detalhes do aluno.

Novos fluxos entram nesta lista na posição em que acontecem (e na mesma ordem em `src/journeys.ts`).

## Perfis
Três perfis principais — **DN**, **CTM** e **DR solicitante** — mais o **Super admin**. CTM e DR solicitante têm **caixas** (subperfis). Nome do perfil = `Grupo: Caixa` (ex.: `CTM: PCP`).
- **Super admin** (provisório) — administra usuários, perfis/permissões, auditoria e logs do sistema; vê todas as telas do menu e **os dados de toda a plataforma** (ex.: no acompanhamento, contratos/turmas/alunos de todas as DRs, com coluna/filtro de DR). Menu setorizado (DN, CTM, DR solicitante, Administração).
- **DN** — cria e gerencia editais (com a CTM aprovada por produto), aprova o portfólio e faz a gestão de DRs. **Não contrata CTM** e não gerencia TAAs.
- **CTM** (SENAI-MG) — caixas:
  - **Gestor de contrato** (antes "Comercial"; pode ser um supervisor, um gestor…) — envia TAAs às DRs (TAAs com as DRs), propostas e portfólio.
  - **PCP** — Gestão da oferta (aba Execução: tutor e ação por UC, aulas ao vivo), e Equipe.
  - **Gestor de oferta** (antes "Supervisor") — portfólio, propostas, oferta/cronograma, equipe da turma, tratativas e financeiro. Não gerencia TAAs.
  - **Pedagógico** — Gestão da oferta (validação pedagógica) e Tratativas pedagógicas.
  - **Tutor** — avalia o planejamento das UCs. **Monitor** — cria as salas no Moodle e parametriza as avaliações.
- **DR solicitante** (MG) — caixas:
  - Quem pede a contratação é o **Gestor** (pode ser o coordenador, o interlocutor etc.). O TAA registra o **Gestor solicitante** (nome e cargo).
  - **Gestor SENAI** (SENAI-MG) — contrata a CTM por **TAA** e acompanha a execução (Painel, Gestão de Contratos, Turmas, Alunos).
- Uma mesma DR pode ser **CTM** (ofertante) e **DR solicitante** (contratante) — são perfis diferentes.
- Menu "Contratação de CTM" (`/dashboard`): título *TAAs com CTMs*.

## Acompanhamento (DR solicitante)
- Contrato = DR solicitante ↔ CTM, com empresa cliente, só cursos EAD, vigência, valor, vagas e status (Vigente / Em elaboração / Encerrado).
- Turma: situação pelo calendário (A iniciar / Em andamento / Finalizada); execução = % do período decorrido.
- Aluno **requer atenção** (turma não finalizada) se: sem acesso há mais de 7 dias, média < 6, atividade não entregue, ou progresso mais de 10 p.p. abaixo do esperado pelo calendário.
- Situação do aluno: **Evadido** (sem acesso há mais de 30 dias), **Em risco** (algum alerta), **Em dia**.

## TAA (Termo de Acordo Administrativo)
- **TAA sempre vinculado a um edital**, e **um TAA por edital para cada par CTM × DR solicitante** (cancelado não conta). Com um TAA em andamento, um **novo edital** permite **novo TAA** para a mesma CTM e DR (ex.: SENAI-SP com a CTM SENAI-MG: TAA 006/2026 do ED-001 aceito e TAA 013/2026 do ED-002 em análise). Nas telas de criação (CTM e DR), a DR/CTM que já tem TAA naquele edital fica bloqueada com o nº do TAA existente; produto novo do mesmo edital entra no TAA existente (ajuste), não em outro.
- **Um TAA para cada DR específica** (não é guarda-chuva), com edital, **produtos**, vigência e valor global. A CTM do TAA é a **aprovada no edital** (menor custo) para esses produtos. Nunca chamar de "TA" ou "Termo de Adesão".
- **Caminho normal**: a CTM que ganhou o edital **envia** o TAA para cada DR (tela **TAAs com as DRs**, `/taas-ctm`; escolhe **uma DR** por TAA). O **Gestor** da DR solicitante analisa. A DR também pode criar o seu (`/dashboard`), e aí quem analisa é a CTM.
- **TAA é entre SENAI e SENAI**. **SESI não entra na v1** (sem perfil, contrato ou dados do SESI). **O DN não contrata CTM.**
- **Status**: *Encaminhado* → *Em análise* (quem analisa abriu) → **Aceito**, **Retornado** (com motivo; quem criou ajusta vigência/valor e reencaminha) ou **Cancelado** (recusa, com motivo, ou cancelamento por quem criou antes do aceite). Tudo fica no **histórico** do TAA.
- **Aceito é burocrático**: destrava a **negociação da oferta**, que dá origem às **propostas** (só contratante com TAA/contrato aceito e vigente entra na Nova proposta). Um TAA aceito pode não gerar nenhuma proposta ou atividade. O termo assinado é anexado depois do aceite ("Anexar assinado").
- **Saldo** (TAA aceito) = valor global − executado (valor das propostas aceitas entre o contratante e a CTM nos produtos do TAA). Aparece na lista (coluna Saldo) e nos detalhes (barra executado/saldo).
- No aceite pelo Gestor da DR, ele fica registrado como **Gestor solicitante**.

## Edital (DN)
- **Só o DN faz a gestão de editais** (Gestão de Editais: DN e Super admin). As CTMs **apenas participam** (oferecem o custo, fora do sistema); no sistema só consultam o edital (somente leitura) ao cadastrar produtos e montar TAAs.
- Tem vigência e cursos.
- Cada curso tem valor e DRs credenciados; entre eles, a **CTM aprovada** é a que ofereceu o **menor custo** para aquele produto (campo "CTM aprovada (menor custo)" no Novo edital; destaque nos detalhes do edital).
- Todo TAA/contrato de um produto é com a CTM aprovada para ele.
- Área, modalidade e CH vêm do catálogo e não podem ser editadas.

## Portfólio das CTMs
- Cada CTM registra seus **produtos** (módulos → UCs), com **versões** (v1, v2…; a anterior não muda).
- **Novo produto** e **nova versão** são **solicitações**: ficam *Aguardando* até o **DN** decidir em **Aprovação de portfólio** (`/portfolio/aprovacoes`): **Aprovar** ou **Reprovar** (com motivo, que a CTM vê). Enquanto houver versão pendente, não se abre outra.
- Só versões **aprovadas** entram no **Portfólio das CTMs** (`/portfolio`, visível para **todas as DRs**, somente leitura) e são usadas na oferta (matriz = última versão aprovada).
- Cada versão pode ter **vínculo com o itinerário** (outro sistema; botão "Vincular ao itinerário", feito pela DR/CTM; integração a detalhar) e **documentos/materiais** vinculados (nome, tipo, link — o arquivo fica no repositório/drive). Nova versão copia os vínculos.
- Na Gestão de Portfólio da CTM, cada linha é um produto: última versão, situação, versão no portfólio, itinerário, nº de documentos e de propostas.

## Produto (Gestor de oferta)
- "Novo produto" abre em 3 colunas na mesma tela, sem etapas: **Edital** (escolhe apenas um) → **Produtos** do edital em que a DR é a **CTM aprovada** (um ou mais) → **Módulos e UCs** do produto ativo.
- Trocar o edital limpa a seleção.
- Salvar exige ao menos um produto marcado (módulos e UCs incompletos não bloqueiam).

### Versões de produto
- Na listagem, cada produto tem as ações **Visualizar** (olho → side sheet de detalhes) e **Nova versão**; o side sheet também tem "Nova versão a partir da vN".
- "Nova versão" abre direto a modal já preenchida com o produto (sem confirmação; dá para cancelar na própria modal); ela copia a versão escolhida para ajustes (módulos e UCs) e salva como a próxima versão (v2, v3…).
- A versão anterior **não é alterada**: o que já está vinculado a ela continua apontando para ela.
- Toda versão mantém o vínculo com a v1 (a "mãe") e registra de qual versão foi copiada.
- Dados do edital/catálogo (edital, área, modalidade, CH) são fixos em todas as versões.
- A tabela mostra só a versão mais recente de cada produto; as anteriores (ex.: v1 de um produto na v2) ficam registradas no histórico de versões do side sheet, e dá para abrir cada uma.

## Criação de oferta (Gestor de oferta)
- Objetivo: criar **turmas** a partir das propostas **aceitas** (só elas aparecem na Nova oferta).
- Nova oferta: escolhe a proposta → um ou mais cursos dela → supervisor e analista da turma. A matriz curricular (módulos → UCs) vem do produto (última versão); **CH a distância e presencial** por UC são editáveis. A soma das CHs de cada curso **não pode passar a CH total daquele produto** na proposta (total fica vermelho e Salvar é bloqueado).
- Nº da turma: `TU-<UF>-<seq>/<ano>` (padrão das CTMs ainda a confirmar; ver Pendências).
- Detalhes da oferta em abas (`?aba=cronograma|execucao|integracao|historico`); toda mudança entra no **Histórico** da turma.

### Cronograma (gerado pelo sistema)
- Substitui o script da planilha. Parâmetros na Nova oferta: **início da turma** (vem do início previsto do curso na proposta), **horas por semana** (padrão 20), **ambientação** (junto com a 1ª UC ou semana própria), **intervalo entre módulos** (5/7/10/15 dias), **UC termina na sexta**, **pode iniciar módulo em dezembro** (se não, empurra para o início de janeiro).
- Regra: UCs em sequência; semanas da UC = CH da UC ÷ horas por semana (arredonda para cima); conta **só dias úteis** e pula os **feriados nacionais** (cadastro do Super admin). Cada curso começa na data de início.
- Por UC o sistema calcula **semanas de estudo**, **encontros presenciais** (1 a cada 4 h presenciais) e **aulas ao vivo previstas** (CH a distância ÷ 20). As fórmulas de encontros/aulas são hipótese a validar com a CTM.
- As datas podem ser ajustadas à mão antes de salvar; avisos aparecem quando o sistema move uma data (dia não útil, módulo em dezembro).
- **Agrupamento**: UC com o mesmo nome em outra turma (não cancelada) começando na mesma semana aparece como **Agrupável** (versão simples; a análise com troca de ordem das UCs fica para depois).
- **Visualização na turma** (aba Cronograma), no lugar da planilha: **Linha do tempo** (padrão) — semanas no topo (meses + dia da segunda-feira), módulos como faixas agrupando as UCs, uma barra por UC, losango = **encontro presencial**, círculo = **aula ao vivo**, hachurado = **feriado nacional**, linha = hoje, ícone de agrupável. Clicar na UC abre o **detalhe** (o que eram as colunas da planilha): início/término (e término no AVA), CH total/distância/presencial, semanas e dias de estudo, encontros numerados (1º, 2º…) com data e dia, aulas ao vivo (adicionar/editar/remover) e turmas agrupáveis. **Tabela** continua como visão alternativa.
- Datas dos encontros presenciais: um por semana no **dia do presencial** da turma (padrão segunda); se a UC tem mais semanas que encontros, a 1ª semana é só a distância; semana com feriado fica sem encontro.

### Validação do cronograma e status da turma
- Cronograma tem **versão** e situação: *Rascunho* → *Aguardando* (registra o envio à DR com **prazo**) → *Validado* (DR validou ou **passou o prazo sem resposta**). "DR pediu ajuste" gera a **próxima versão** (novo início + o que a DR pediu) e volta a Rascunho.
- Status da turma: **A iniciar** → **Buscar tutor** (ação "Confirmar turma", só com cronograma validado: a DR confirmou que a turma vai começar; libera o PCP e a criação de salas) → **Em andamento** (a partir do início) → **Finalizada** (depois do término). **Cancelada** a qualquer momento antes do fim, com motivo (a DR deve avisar com 10 dias).
- **Prorrogar início**: nova data + motivo; todas as datas (UCs e aulas ao vivo) andam junto, sem aditivo. Só antes de começar.
- **Dia do encontro presencial** (informado pela DR) e **escolas da turma** (nome, cidade, alunos) ficam na aba Cronograma.
- **Aulas ao vivo são por UC** (um dia com horário), definidas pelo PCP na matriz da aba Cronograma.

### UCs da turma (aba UCs)
- Hierarquia: **proposta → cursos → turmas → UCs → alunos** (cada um com situação).
- Liberado a partir de **Buscar tutor** (turma confirmada). Para **cada UC** vincula-se a **equipe técnica da UC**: **pedagógico, tutor e monitor**.
- Fluxo da UC (a coluna Etapa mostra de quem é a vez):
  1. **Monitor** cria a **sala no Moodle** via integração (*Em criação* → *Criada*; "Criar salas no Moodle (todas)" ou por UC). Sala criada, a UC entra **Em planejamento**.
  2. **Pedagógico** planeja: **dias das aulas ao vivo (online)** e **atividades presenciais** → envia ao tutor (**Em avaliação do tutor**).
  3. **Tutor** avalia: **aprova** ou **devolve** ao pedagógico com motivo (volta a Em planejamento, com o motivo visível).
  4. Aprovado: **e-mail ao monitor** para **parametrizar as avaliações no Moodle** (**Parametrizar avaliações**); feito isso, a UC fica **Pronta**.
- Com **todas as UCs prontas** (estrutura pronta), sai o **e-mail à DR solicitante** para ajustar o **SGN/SGE** e integrar os alunos no Moodle.
- Tutor e Monitor deixaram de ser caixas "em avaliação": fazem parte do fluxo.

### Integração com o Moodle (aba Integração)
- As salas são criadas por UC (aba UCs). Aqui: aviso de estrutura pronta/e-mail à DR, **dados de integração** (código CTM por escola + ID da sala de cada UC + início + semestre, "Copiar tabela") e **situação da integração** por escola, com alerta quando faltam 5 dias ou menos para o início.

## Feriados nacionais (Super admin)
- Tela **Feriados nacionais** (`/admin/feriados`, só Super admin): novo, editar e excluir (com confirmação).
- Serve só para o gerador de cronograma **pular as datas de feriado nacional**. Por enquanto **não há feriados, recessos ou férias por DR ou por CTM**.

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
- Três visões (abas): **Situação dos alunos**, **Acompanhamento dos alunos** e **Relatório de cobrança**.
- **Ciclo financeiro** (mês de cobrança) = janela do **dia 21 do mês anterior ao dia 20** do mês (corte no dia 20).
- **Acompanhamento dos alunos** (relatório geral, no lugar da planilha da CTM): escolhe **turma** e **ciclo**; cada aluno com e-mail, telefone, CPF, escola, **status geral** (Matriculado, Desistente, Trancado), **data de saída** e **monitor**; uma coluna por **UC do ciclo** com a situação (**Ativo**, **Suspenso** desde a data, **Não integrado nesta UC**) e se **fatura**. Indicadores: alunos (integrados), faturamentos aluno × UC, desistentes/trancados e suspensos sem formalização. Exporta planilha; atalho para o relatório de cobrança da proposta.
  - **Situação do aluno é sempre por UC** (não por turma/curso): o aluno tem uma matrícula em cada UC (Matriculado, **Desistente**, **Trancado**; suspenso no AVA é marcação da UC). Pode estar **matriculado numa UC e desistente/evadido em outra** da mesma turma. A coluna "Situação nas UCs" é só o resumo da linha (ex.: *Desistente em 1 UC · matriculado em 3*); cada coluna de UC mostra a situação naquela UC. A **confirmação da DR** e a **cobrança** também são por aluno × UC (a saída numa UC não tira o aluno das outras).
  - **Desistência = dupla checagem**: o status Desistente vem do **Moodle** (pode ser falha de integração), então a **DR solicitante confirma** (tela **Confirmação de desistências**, `/desistencias`, menu Execução da DR — uma linha por aluno × UC): **Confirmar** — a saída vale a partir da data do Moodle e o aluno deixa de faturar nas UCs seguintes; **Contestar** (com motivo) — falha de integração, o aluno segue **Matriculado** e faturando. Dá para desfazer (volta a aguardar). Enquanto aguarda a DR, o aluno aparece como *Desistente · aguardando confirmação da DR*, a situação na UC é **Desistente no Moodle** e **continua faturando**. Trancamento já chega formalizado.
  - **Fatura** a UC no ciclo: UC em andamento na janela, aluno integrado nela (ativo ou suspenso sem formalização — a CTM cobra até a DR formalizar) e sem saída **confirmada pela DR** (ou trancamento) antes do início da janela. UC que começa depois da saída = não integrado. Aluno não integrado pela DR (SGN/SGE) não fatura.
- **Ciclo de faturamento é por UC**: cada UC tem o seu dia de **fechamento** (padrão 20; ajustável no detalhe da UC, no cronograma da turma, de 1 a 28). A janela da UC vai do dia seguinte ao fechamento no mês anterior até o fechamento no mês; a cobrança do mês junta, de cada UC, a janela que fecha nele. Evasão/desistência **confirmada pela DR fora do ciclo** da UC (depois do fechamento) só desconta no **próximo ciclo daquela UC**. Relatório de cobrança mostra a coluna **Ciclo da UC**; o acompanhamento mostra a janela no cabeçalho de cada UC. Exemplos: Soldagem MIG/MAG fecha dia 5; Mecânica aplicada, dia 10.
- **Cobrança é mensal**: cada mês (ciclo) tem a sua quantidade de alunos — pode ter mais (UC nova, aluno integrado) ou menos. **Desistência confirmada pela DR** (ou trancamento) tira o aluno a partir da **cobrança seguinte** à confirmação (corte no dia 20); enquanto só no Moodle, segue cobrada.
- **Relatório de cobrança** (modelo da planilha da CTM, usado para cobrar a DR solicitante): a CTM escolhe a **proposta aprovada** (com turmas) e abre o relatório (`/financeiro/cobranca/:id`). Cabeçalho com dados do cliente e serviço (instituição, CNPJ, TAA, serviço, e-mails da cobrança) e **ciclo financeiro** (mês).
  - Uma linha por **turma × escola × UC** em andamento no ciclo: curso/modalidade, escola-município, código da turma, UC, CH total, período, **CH cobrada** (CH da UC proporcional aos dias da UC dentro da janela do ciclo — hipótese a validar), **nº de alunos** (os que **faturam** a UC no ciclo, do Acompanhamento dos alunos), **valor aluno/hora** (valor do aluno no edital ÷ CH do curso) e valor total; link de acesso para conferência.
  - **Juntar propostas**: o relatório pode agrupar várias propostas aprovadas **da mesma DR e do mesmo TAA** (bloco "Propostas neste relatório", `?propostas=`); a CTM pode ter várias propostas no mesmo TAA. **TAA diferente não entra** (nem aparece como opção). Com mais de uma, a tabela ganha a coluna Proposta; os ajustes das propostas escolhidas entram juntos. Na lista, a coluna "Mesmo TAA" mostra as outras propostas aprovadas do TAA.
  - **Ajustes de cobrança**: linhas extras do ciclo (ex.: aluno integrado depois da cobrança anterior), com observação; listadas em Observações.
  - Navegação mês a mês (anterior/próximo) e bloco **em relação ao mês anterior**: alunos cobrados no mês × mês anterior, quantos entraram e a lista de quem saiu (desistência confirmada pela DR ou trancamento, com a data). Total do ciclo e **vencimento** (dia 28 do mês seguinte — hipótese); exporta planilha (CSV) ou imprime/PDF.

## Proposta comercial (CTM)
- A proposta é **sempre criada pela CTM**. A **negociação é fora do sistema**; quando avança, a CTM cria a proposta **vinculada a um TAA/contrato aceito** (Gestão de propostas → Nova proposta).
- **Responsável**: o **Gestor de contrato** (fica registrado na proposta).
- **Conteúdo**: início e fim; **cursos** = produtos do TAA, cada um com **quantidade de alunos** e início previsto; **matriz curricular** do portfólio (última versão aprovada, só leitura); **valor parametrizado pelo edital** = valor do curso no edital × alunos (não se digita). Também CNPJ, faturamento, nº CRM, link/anexo do documento.
- O mesmo curso pode entrar em várias propostas do mesmo TAA (ex.: T01, T02).
- **Status** (quem muda é o Gestor de contrato, registrando o retorno da DR solicitante): **Rascunho** → **Em andamento** → **Aguardando** → **Aprovado**; ou **Cancelado** (com motivo). Rascunho pode ser excluído.
- **Versões**: a proposta vai e vem — "Nova versão" guarda a atual em *Versões* (com o que mudou) e cria a vN+1; tudo fica no **histórico**.
- **Saldo do TAA**: propostas **aprovadas** executam o saldo (valor do TAA − propostas aprovadas vinculadas). A Nova proposta mostra o saldo e avisa se passar.
- **Depois de aprovada**: vincula-se a **equipe técnica** (supervisor e analista) na Gestão da proposta; ela define o **cronograma** e avalia o **agrupamento de UCs** (UCs iguais entre turmas de DRs iguais ou diferentes rodam juntas — aulas ao vivo no Moodle). A proposta aprovada segue para o **processo de turmas** ("Criar turmas" → Nova oferta, já com supervisor e analista).
- Hierarquia: **proposta → cursos → turmas → UCs → alunos** (cada um com situação).
- Alerta de prazo: proposta ainda não aprovada com turma prevista para começar em até 15 dias.

- **Aditivo**: a proposta tem o nº de alunos por curso. Se as salas do Moodle das turmas da proposta (aprovada) tiverem **mais alunos do que a proposta**, a CTM recebe uma **notificação** (sino ao lado do avatar, no rodapé do menu, perfis CTM e Super admin) para fazer um **aditivo**. Na Gestão da proposta aparece o aviso com **Fazer aditivo** (também na lista de propostas); o aditivo é uma **nova versão** da proposta (permitida mesmo aprovada) com os alunos do Moodle já preenchidos e o motivo; a versão anterior fica no histórico. Status segue Aprovado (hipótese). Alunos no Moodle = integrados de cada escola da turma.
## Pendências (reunião de processos de 28/09/2026)
- **Avisos do sistema**: a regra "o sistema não envia nada" conflita com os avisos pedidos (à DR, prazos, integração). Hoje os avisos aparecem só nas telas.
- **Curso repetido**: "cada curso só em uma proposta" conflita com T01/T02 do mesmo curso para a mesma DR.
- **Código da turma**: padrão citado = curso/modalidade + nº sequencial por DR + ano/semestre de início (ex.: T02MS, 2026-1).
- **CH na Nova oferta**: hoje a soma das CHs acima da CH do produto **bloqueia** o "Salvar oferta", o que conflita com o padrão "nenhum campo bloqueia o protótipo". A definir: manter como regra estrutural ou só avisar (total em vermelho) sem bloquear.
- Ainda não feito: modelo de TAA versionado por edital, áreas tecnológicas e saldo do teto no TAA, perfil Analista, acesso da DR contratante para validar cronograma e formalizar saídas, média EAD por DR e devolução de notas, pesquisas do AVA, vitrine das CTMs.

## Percurso (histórico de decisões)
- 2026-09-28 — Removidos "Salvar e enviar" e o fluxo de envio/aceite duplo. A proposta só é criada e depois marcada como aceita.
- 2026-09-28 — Gestão da proposta: botões Aprovada/Recusada; recusa exige feedback.
- 2026-09-28 — Novo produto: sem etapas; layout em colunas (edital → produtos → módulos/UCs).
- 2026-09-28 — Perfil "DR credenciada" renomeado para "Supervisor" (continua sendo o usuário do SENAI-MG).
- 2026-09-28 — DN: nova tela Gestão de DRs credenciadas (/drs), jornada solta "DRs".
- 2026-09-28 — Produto: detalhes em side sheet (olho) com histórico de versões; ação "Nova versão" na listagem (não altera a anterior; mantém vínculo com a v1). Coluna Propostas removida da Gestão de Portfólio.
- 2026-09-28 — Novo TAA: signatários removidos; campo obrigatório "TAA assinado" (anexo). Vigência e valor global na mesma linha.
- 2026-09-28 — TAA: anexo saiu do Novo TAA; baixar modelo no Novo TAA e na listagem; upload do assinado em Gestão de TAA muda o status para Vigente.
- 2026-09-28 — Gestão de TAA: Visualizar abre side sheet com status, dados, documentos (modelo e assinado) e andamento; anexar o assinado também pelo side sheet.
- 2026-09-28 — TAA: todos com vigência e valor global; "produtos vinculados" removido (tabela, detalhes e dados).
- 2026-09-28 — Fluxos numerados; "Cadastro de DRs" entra como fluxo 1 (início do sistema). Ordem manual salva no navegador foi removida.
- 2026-09-28 — Ordem dos fluxos: 1. Cadastro de DRs, 2. Gestão de Contratos, 3. Gestão de Portfólio.
- 2026-09-28 — Tela "Minhas Propostas" (/produtos, Supervisor) renomeada para "Gestão de Contrato".
- 2026-09-28 — Supervisor: "Meus TAAs" → "Gestão de TAAs"; propostas movidas para dentro do TAA (ação "Gestão de propostas"), fora do menu.
- 2026-09-28 — Dentro do TAA (Supervisor): "Gestão dos produtos" renomeada para "Gestão de propostas".
- 2026-09-28 — Novo perfil Comercial (mesmas telas do Supervisor + Gestão de TAA/Novo TAA); fluxo 3 "Novo TAA (Comercial)".
- 2026-09-28 — Novo TAA: termo movido para o fim do formulário; baixar só depois de preencher DR, vigência e valor.
- 2026-09-28 — Supervisor tem as mesmas jornadas do Comercial: fluxo 4 "Novo TAA (Supervisor)"; Gestão de TAA liberada para o Supervisor.
- 2026-09-28 — Supervisor e Comercial: "Gestão de TAA" (tela do DN) removida do menu deles; Novo TAA agora é feito dentro da Gestão de TAAs (/meus-taas/novo). DN mantém a Gestão de TAA.
- 2026-09-28 — Fluxo 6 "Criação de portfólio": Gestão de Portfólio → Novo produto (Supervisor).
- 2026-09-28 — DRs: botão/modal "Nova DR credenciada" (/drs/novo, UFs ainda não credenciadas) e ações Inativar/Ativar; seed só com parte das DRs.
- 2026-09-28 — Novo TAA em duas etapas (dados → documento para baixar). Detalhes do TAA: seção Andamento removida.
- 2026-09-28 — Criação de edital: tela de sucesso após salvar (/editais/:id/sucesso), com resumo e ações Ver edital / Voltar.
- 2026-09-28 — Nova jornada Gestão da oferta (Supervisor): turmas a partir de propostas, CH/datas por UC, dias ao vivo.
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
- 2026-09-28 — Comercial ganhou as mesmas jornadas do Supervisor (Criação de portfólio, Criação de proposta, Gestão da oferta), já que os menus são iguais.
- 2026-09-28 — Nova oferta: CH a distância + presencial por UC; soma limitada à CH do produto; label "Curso".
- 2026-09-28 — Aulas ao vivo: saíram da Nova oferta; agora por UC, em modal aberta pela ação "Aulas ao vivo" na tabela da Gestão da oferta.
- 2026-09-28 — Aulas ao vivo: cada dia tem horário de início e término (padrão 19:00–21:00; novo dia herda o horário do último marcado).
- 2026-09-28 — Aulas ao vivo: calendário de um mês com navegação (abre no mês de início da UC) + campo para inserir a data; horários à direita do calendário.
- 2026-09-28 — Aulas ao vivo: **um dia por UC** (com horário); escolher outro dia substitui o anterior.
- 2026-09-28 — Nova oferta: curso escolhido destacado (check + "Nesta oferta"; rótulo "Curso desta oferta"); ao salvar abre confirmação "Oferta criada" (/oferta/:id/sucesso) com resumo e atalho para Aulas ao vivo — nova etapa da jornada.
- 2026-09-28 — Oferta pode ter **vários cursos** da mesma proposta: seleção múltipla na Nova oferta; matriz agrupada por curso; limite de CH vale por curso.
- 2026-09-28 — Nova oferta: removida a etiqueta "Nesta oferta"; curso escolhido fica marcado só pelo check e destaque.
- 2026-09-28 — Gestão da oferta organizada por proposta: lista de propostas aceitas (vigência, nº de ofertas/turmas) → tela da proposta (/oferta/proposta/:id) com as ofertas (turmas); Nova oferta a partir dela já com a proposta fixa. Uma proposta tem várias ofertas (turmas). Sem coluna Cursos na tabela de ofertas.
- 2026-09-28 — Proposta ganhou **vigência** (início/fim) na Nova proposta, na tabela de propostas e no side sheet.
- 2026-09-28 — Gestão da oferta (lista de propostas): coluna Status (da proposta); sem coluna Aulas ao vivo.
- 2026-09-28 — Gestão da oferta: listagem com uma linha por oferta (turma), repetindo proposta/status/DR/vigência; proposta aceita sem oferta aparece com "—". Ações por linha: Visualizar, Aulas ao vivo, Adicionar oferta (na mesma proposta), Excluir. Etapa "Ofertas da proposta" saiu da jornada (tela /oferta/proposta/:id segue existindo).
- 2026-09-28 — **Oferta = uma turma = um curso.** Na Nova oferta pode-se escolher vários cursos da proposta; ao salvar, cada curso vira uma oferta (turma) própria, com código sequencial, e aparece numa linha da Gestão da oferta com a mesma proposta. A confirmação lista as ofertas criadas, cada uma com atalho para Aulas ao vivo. Detalhes da oferta mostram uma única turma/curso.
- 2026-09-28 — Coleção de ofertas trocada para turmas-v7 para descartar ofertas antigas com vários cursos numa mesma turma.
- 2026-09-28 — Aulas ao vivo: cadastro **só em Visualizar oferta**, na lista de UCs — botão Adicionar por UC abre modal (data dentro do período da UC + início/término); editar (lápis) e remover (com confirmação). Saíram a sheet de Aulas ao vivo, a ação na tabela e a rota /oferta/:id/aulas-ao-vivo.
- 2026-09-28 — Gestão da oferta: só linhas com oferta (turma); proposta sem oferta não aparece na listagem (nova oferta pelo botão do topo).
- 2026-09-28 — Gestão da oferta: colunas Início e Término da turma (no lugar de Vigência/Período); na coluna Proposta, link "Ver mais" abre o side sheet da proposta.
- 2026-09-28 — Status da turma (oferta) derivado das datas: **Em andamento** até o término da última UC; depois, **Finalizada**. Coluna Status da Gestão da oferta passou a ser o da turma; aparece também nos detalhes.
- 2026-09-28 — Novo perfil **Super admin** (provisório): vê todas as telas do menu + Gestão de usuários (novo/editar/inativar), Perfis e permissões (telas por perfil) e Auditoria (somente leitura). Jornadas: Gestão de usuários, Perfis e permissões, Auditoria, Supervisão das áreas.
- 2026-09-28 — Perfis Supervisor e Comercial renomeados para **CTM: Supervisor** e **CTM: Comercial**; perfil **CTN** removido.
- 2026-09-28 — Gestão da oferta: coluna DR contratante logo ao lado de Proposta.
- 2026-09-28 — Novo perfil **CTM: Solicitante**: mesmas telas do CTM: Supervisor (SENAI-MG), sem jornadas próprias. Trocar para um perfil sem jornada abre a 1ª tela do menu dele.
- 2026-09-28 — Dados de exemplo: proposta PC-MG-005/2026 aberta pelo **CTM: Solicitante** para SENAI-BA, Em análise (aguardando a DR contratante). Campo `criadoPor` na proposta.
- 2026-09-28 — Perfil CTM: Solicitante vira **DR solicitante** (SENAI-BA). CTM = a operação (não é DR). Menu próprio **Gestão de Contratos** (`/contratos`): contratos da DR com o CTM; PC-MG-005 é pedido da DR aguardando o CTM, PC-MG-006 aceito.
- 2026-09-28 — DR solicitante passa a SENAI-MG e vira perfil de acompanhamento: Painel, Gestão de Contratos (com o CTM, empresa cliente, cursos EAD), Turmas e Alunos, com detalhes. Removidas PC-MG-005/006. Jornada “Acompanhamento da execução”.
- 2026-09-28 — Detalhe do aluno abre em **side nav** (Sheet à direita) pelo “Visualizar” no Painel, na turma e em Alunos; `/alunos/:id` = lista de Alunos com a side nav aberta.
- 2026-09-28 — Em listas de alunos, o código da turma é link para o detalhe da turma (`/turmas-ead/:id`).
- 2026-09-28 — Alunos: último acesso relativo (“Há 44 dias”) na lista e na side nav; indicadores no topo (total, em dia, em risco, evadidos, sem acesso há mais de 7 dias).
- 2026-09-28 — Turmas: tabela sem a coluna Período (fica no detalhe) para não cortar Situação; ação **Ver alunos** abre o detalhe da turma já nos alunos (`?ver=alunos`).
- 2026-09-28 — Gestão de Contratos: “Visualizar” abre o detalhe em **side nav** (`/contratos/:id` = lista com a side nav aberta); dentro, as turmas do contrato levam ao detalhe da turma.
- 2026-09-28 — Detalhe do contrato: turmas usam o mesmo card do Painel (números grandes, execução, Ver alunos) no lugar da lista.
- 2026-09-28 — Super admin vê dados de toda a plataforma no acompanhamento (DR solicitante vê só a própria DR). Mock: contratos CTM com campo `dr` e novos contratos SP/BA (contratos-ctm-v2, turmas-ead-v2, alunos-ead-v3).
- 2026-09-28 — Nova jornada **Logs do sistema** (Super admin): `/admin/logs` e `/admin/logs/:id` (side nav com stack trace/payload e eventos relacionados). Permissões: permissoes-v6.
- 2026-09-28 — Logs do sistema = **ações dos usuários** na plataforma (não erros técnicos): usuário, perfil, DR, ação, módulo, registro, IP, dispositivo e alterações antes/depois (logs-v2).
- 2026-09-28 — Logs do sistema com visão **Linha do tempo** (padrão): agrupada por dia, ícone colorido por ação, frase “Fulano editou X”, antes/depois inline, filtro por ação, busca e “Carregar mais”; alternância para Tabela.
- 2026-09-28 — Painéis por perfil (exceto Super admin): **DN** `/painel-dn` (DRs ativas, TAAs vigentes/aguardando assinatura/a vencer, editais com execução, cobertura das DRs); **CTM: Supervisor** `/painel-ctm` (funil de propostas, ofertas em execução, próximas aulas ao vivo, TAAs com DRs); **CTM: Comercial** `/painel-comercial` (em negociação, valor fechado, taxa de aceite, pipeline por status e por DR contratante, aguardando resposta, cursos mais propostos). DR solicitante segue com `/acompanhamento`. permissoes-v7.

- 2026-09-28 — Reunião de processos (gravação de 5h40): **proposta** nasce Em negociação, com CNPJ, faturamento/escolas, nº CRM, link, vagas e início previsto por curso; alerta de prazo; duplicar (nova rodada); cancelar aceita; histórico. **Oferta**: cronograma gerado pelo sistema (parâmetros + Calendário), versões e validação pela DR (prazo), status A iniciar → Buscar tutor → Em andamento → Finalizada / Cancelada, prorrogar início, dia do presencial, escolas, agrupamento simples. **Execução**: equipe da turma, tutor e ação por UC, e-mail ao tutor (links, sem arquivos), validação pedagógica. **Integração com o AVA**: criar salas, dados para a DR, situação por escola. Telas novas: Equipe, Calendário, Tratativas pedagógicas, Financeiro. Jornadas novas: Gestão da execução, Acompanhamento pedagógico, Financeiro.
- 2026-09-28 — Nova tela **Mapa do processo** (/processo): BPMN do processo inteiro com atores, fases e atalhos para as telas.
- 2026-09-29 — **TAA/contrato é de quem contrata**: a DR solicitante (ou o DN) cria o TAA para contratar uma CTM; a CTM não gerencia TAAs (saíram Gestão de TAAs da CTM, /meus-taas, e as jornadas "Novo TAA" de Comercial/Supervisor). DN não gerencia os TAAs da rede, só os seus. TAA só SENAI ↔ SENAI; SESI ↔ SENAI é contrato. Tela "Gestão de TAA" → **TAAs com CTMs** (DN, DR solicitante e Super admin); Novo TAA escolhe a CTM. Propostas: contratante só com TAA/contrato, coluna TAA / contrato. Jornadas: Contratação de CTM (DN) e Contratação da CTM (DR solicitante). Mapa do processo atualizado.
- 2026-09-29 — Perfis: **CTM** é um perfil, com subperfis **Supervisor** e **Comercial**. No select da casca aparece só CTM (jornadas dos dois, numeradas juntas, com o subperfil entre parênteses). No protótipo, ao lado do selo de perfil (canto superior esquerdo), os subperfis ficam enfileirados; clicar seleciona o subperfil e abre a jornada equivalente dele na mesma etapa.
- 2026-09-29 — Super admin vê os dados de todos: cada tela mostra de quem é o dado (coluna de origem, com filtro). Equipe: coluna **CTM**; a CTM vê só a própria equipe.
- 2026-09-29 — Perfil **CTM: Comercial** renomeado para **CTM: Gestor de contrato**; ganha a tela **Gestão de contratos** (`/gestao-contratos`): TAAs/contratos em que a CTM é contratada, só consulta (sem Novo TAA, anexar ou excluir).
- 2026-09-29 — Gestão de Portfólio: colunas Modalidade e Área tecnológica saem da tabela; vão para o botão **Detalhes** (ícone ao lado do nome do curso). Continuam como filtros.
- 2026-09-29 — **Edital define a CTM por produto**: a CTM aprovada é a de menor custo (novo campo no Novo edital; destaque nos detalhes). **TAA tem produtos**: no Novo TAA o contratante escolhe edital e produtos e a CTM vem da aprovação (produtos de outra CTM = outro TAA). Portfólio da CTM só com produtos em que ela é a aprovada. Nova proposta só com os produtos do TAA/contrato do contratante. Catálogo ganhou Mecânico de Manutenção de Máquinas e Desenhista de Produtos Gráficos.
- 2026-09-29 — **Perfis em três grupos com caixas**: DN, CTM (Comercial, PCP, Supervisor, Pedagógico; Tutor e Monitor em avaliação) e DR solicitante (SENAI, SESI), mais o Super admin.
- 2026-09-29 — **Portfólio com aprovação do DN**: novo produto e nova versão viram solicitações (*Aguardando aprovação*); DN aprova/reprova (motivo) em **Aprovação de portfólio**; o aprovado aparece no **Portfólio das CTMs** para todas as DRs e vai para a oferta. Produto ganhou vínculo com o **itinerário** (botão, sem integração ainda) e **documentos/materiais** (links). Gestão de Portfólio reescrita por produto (sem as linhas derivadas das propostas). Jornadas: Aprovação de portfólio (DN) e Portfólio das CTMs (DR solicitante).
- 2026-09-29 — **Calendário → Feriados nacionais**, só do Super admin (`/admin/feriados`, novo/editar/excluir). Serve apenas para o cronograma pular feriados nacionais; saíram os recessos/férias da CTM e o Calendário dos menus da CTM (Supervisor, Comercial, PCP). Jornada nova: Feriados nacionais (Super admin).
- 2026-09-29 — **Gestor**: na DR solicitante, quem pede a contratação da CTM é o Gestor (coordenador, interlocutor…). Caixas viraram **Gestor SENAI** e **Gestor SESI**; o Novo TAA/contrato tem o grupo **Gestor solicitante** (nome do usuário + cargo), mostrado nos detalhes e na lista.
- 2026-09-29 — **TAA por DR, enviado pela CTM**: a CTM vencedora envia um TAA para cada DR (tela TAAs com as DRs, `/taas-ctm`); o Gestor da DR analisa. Novos status **Encaminhado, Em análise, Retornado para ajuste, Aceito, Cancelado** (saem Em elaboração/Vigente/Encerrado), com histórico, ajuste e reencaminhamento. **Saldo** do TAA (valor − executado). TAA aceito é burocrático: destrava a negociação/propostas e pode não gerar nada. **DN não contrata mais CTM** (sai da tela de TAAs; painel do DN mostra solicitações de portfólio). **Comercial → Gestor de contrato** (pode ser supervisor, gestor…).
- 2026-09-29 — Merge da branch processos-reuniao (Douglas): a tela Gestão de contratos (/gestao-contratos) sai, substituída por **TAAs com as DRs** (/taas-ctm). Portfólio reescrito mantém o botão **Detalhes** (modalidade, área, CH) e os filtros. Menu: grupos atualizados para as telas novas (Portfólio das CTMs no setor do perfil; Administração com Usuários e acesso, Registros, Configurações).
- 2026-09-29 — **Proposta reformulada**: sempre da CTM, vinculada a um TAA/contrato aceito; responsável = Gestor de contrato; cursos do TAA com alunos e início, matriz do portfólio e valor do edital × alunos; status **Rascunho, Em andamento, Aguardando retorno do cliente, Aprovado, Cancelado** (o Gestor de contrato muda); **versões** (vai e vem) com histórico; aprovadas executam o **saldo do TAA**. Depois de aprovada, **equipe técnica** (supervisor e analista) define o cronograma/agrupamento e segue para as turmas. Saíram aceitar/recusar, duplicar e a regra de curso único.
- 2026-09-29 — Padrão: toda caixa com borda (blocos de informação, grupos de campos, listas) tem fundo (bg-card), para facilitar a leitura. Aplicado em todas as telas.
- 2026-09-29 — Detalhes da turma: sai o menu "Mais ações"; Prorrogar início, Adicionar oferta e Cancelar turma viram botões no topo.
- 2026-09-29 — Perfil **CTM: Supervisor** renomeado para **CTM: Gestor de oferta** (a função Supervisor da equipe/turma continua).
- 2026-09-29 — Padrão: nada de campos ou texto direto sobre o fundo da página. Campos sempre com fundo branco (global); Detalhes da turma: bloco Dia do encontro presencial + Escolas dentro de uma caixa.
- 2026-09-29 — Padrão reforçado: elementos com borda sobre o fundo (linhas de listas, opções selecionáveis) também com fundo branco, incluindo os que mudam de estado (ex.: escolas na Integração com o AVA).
- 2026-09-29 — Painéis: listas sem as bolinhas de sigla à esquerda (a DR continua no texto de cada linha).
- 2026-09-29 — **UCs da turma**: aba "Execução" vira **UCs**. Cada UC tem equipe técnica (pedagógico, tutor, monitor) e o fluxo sala no Moodle (monitor, Em criação/Criada) → planejamento (pedagógico: aulas ao vivo online + atividades presenciais) → avaliação do tutor (aprova/devolve) → e-mail ao monitor para parametrizar avaliações → Pronta. Todas prontas: e-mail à DR solicitante (SGN/SGE). Sai o modelo antigo (PCP aloca tutor, planejamento/apropriação, e-mail copiado). Tutor e Monitor deixam de ser "em avaliação". Mapa do processo e jornadas refeitos.
- 2026-09-29 — **Editais só do DN**: a CTM não faz gestão de editais, apenas participa (oferece o custo, fora do sistema) e consulta o edital em modo leitura. Regra explícita no fluxo e no mapa do processo; telas já restritas ao DN.
- 2026-09-29 — **Sem SESI na v1**: saem o perfil DR solicitante: SESI, as jornadas "Contratos com CTMs" e "Acompanhamento" do SESI, os contratos `CT-…` (seeds, coluna Instrumento, título/número de contrato no Novo TAA) e o contrato/turma EAD do SESI-MG. Tudo é TAA entre SENAI e SENAI.
- 2026-09-29 — **Cronograma em linha do tempo**: a aba Cronograma da turma troca a planilha por um Gantt semanal (módulos, UCs, encontros presenciais, aulas ao vivo, feriados, hoje) com detalhe da UC em side nav; a tabela vira visão alternativa.
- 2026-09-29 — Novo TAA (Gestor de contrato): DR destinatária vira um select com **uma DR só** (um TAA por vez).
- 2026-09-29 — Equipe: funções Monitor front e Monitor back unificadas em **Monitor** (Nova pessoa e alocação). Dados da equipe reiniciados (equipe-v3).
- 2026-09-29 — **Relatório de cobrança** no Financeiro (aba): escolhe a proposta aprovada e abre o relatório por ciclo (turma × escola × UC, CH cobrada, alunos, valor aluno/hora, ajustes, total e vencimento), no modelo da planilha da CTM; exporta planilha ou PDF.
- 2026-09-29 — **Acompanhamento dos alunos** no Financeiro (aba): turma × ciclo, aluno por aluno com situação por UC e se fatura (modelo da planilha geral da CTM). Ciclo financeiro passa a ser a janela 21→20. O nº de alunos do relatório de cobrança vem daí (alunos que faturam). Alunos das turmas da oferta gerados (fictícios) a partir das escolas.
- 2026-09-29 — **Desistência com dupla checagem da DR**: Desistente vem do Moodle e só vale com a confirmação da DR solicitante (nova tela Confirmação de desistências: confirmar ou contestar com motivo). Até confirmar, o aluno segue faturando; contestada = falha de integração, volta a Matriculado. Indicador de desistências aguardando a DR no acompanhamento da CTM.
- 2026-09-29 — **Cobrança mensal**: saída confirmada pela DR tira o aluno da cobrança seguinte à confirmação (corte dia 20). Relatório com navegação mês a mês e movimentação em relação ao mês anterior (alunos cobrados, entradas e saídas).
- 2026-09-29 — **Aditivo**: mais alunos nas salas do Moodle do que na proposta gera notificação à CTM (sino no topo) e aviso na proposta com Fazer aditivo (nova versão com os alunos do Moodle). Seed: Mecatrônica 43 no Moodle × 40 na PC-MG-001.
- 2026-09-29 — **Um TAA por edital para cada CTM × DR**: TAA sempre vinculado ao edital; outro edital permite novo TAA para o mesmo par mesmo com um em andamento. Criação bloqueia a DR/CTM que já tem TAA no edital (antes a checagem era por produto). Seed: SP × MG com TAA do ED-001 e do ED-002.
- 2026-09-29 — **Ciclo por UC**: cada UC tem o seu fechamento (padrão dia 20); confirmação da DR fora do ciclo da UC desconta só no próximo ciclo dela. Coluna Ciclo da UC no relatório de cobrança; janela da UC no acompanhamento; fechamento editável no detalhe da UC.
- 2026-09-29 — Área central ocupa toda a largura da tela em todo o sistema (sem limite de largura máxima).
- 2026-09-29 — **Situação do aluno por UC**: matrícula por UC (matriculado numa UC e desistente em outra da mesma turma); confirmação da DR, faturamento e saídas da cobrança por aluno × UC; resumo "Situação nas UCs" no acompanhamento.
- 2026-09-29 — Acompanhamento dos alunos: filtro de **DR solicitante** antes da turma (limita a lista de turmas).
- 2026-09-29 — Financeiro › Situação dos alunos: escolhe primeiro a **DR solicitante** (obrigatório); só então aparecem indicadores, escolas e alunos (coluna DR saiu da tabela).
- 2026-09-29 — Tabelas (todas, via DataTable): botão **Tela cheia** ao lado de Filtros — a tabela ocupa a tela toda; "Sair da tela cheia" ou Esc volta.
- 2026-09-29 — **Relatório de cobrança com várias propostas**: junta propostas aprovadas da mesma DR e do mesmo TAA (outro TAA não pode). Seed: PC-MG-006 aprovada com a turma TU-MG-004/2026 (Eletricista, SENAI-RJ), mesmo TAA da PC-MG-002.
- 2026-09-29 — Tabelas: coluna "Última versão" virou **Versão**; colunas de versão e numéricas centralizadas; status simplificados (*Aguardando aprovação*, *Aguardando retorno do cliente*, *Aguardando validação* e *Aguardando confirmação* → **Aguardando**; *Retornado para ajuste* → **Retornado**); removido o botão de tela cheia; ações de linha só com ícones (Aprovar, Reprovar e Alterar status deixaram de ser botões com texto).
- 2026-09-29 — Portfólio das CTMs: área tecnológica e modalidade passam para baixo do nome do produto (seguem como filtros). TAAs com as DRs: coluna Origem virou **Criado por** (CTM/DR) e a coluna Produtos saiu (produtos ficam nos detalhes). Sheets laterais sem overlay escuro, com a linha clicada em foco. Menu: só um item ativo (Aprovação de portfólio não marca mais Portfólio das CTMs).
- 2026-09-29 — Tratativas pedagógicas (tabela): Tipo e Retorno do aluno em badges; Descrição virou botão **Visualizar** que abre um dropdown com o texto.
