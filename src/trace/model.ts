// Camada de rastreabilidade (casca de análise, não faz parte do sistema prototipado).
// Modelo em grafo: nós (telas, jornadas, etapas, entidades, dados, ações, regras, requisitos, atores, integrações,
// tarefas do processo) e relações com status. Tudo é montado automaticamente a partir do projeto (src/trace/analyze.ts);
// nada aqui é cadastrado à mão. O que não dá para comprovar fica como Inferido ou Não definido — nunca vira fato.

export type Status = 'confirmado' | 'inferido' | 'indefinido'

export const statusInfo: Record<Status, { label: string; dot: string; text: string; cor: string }> = {
  confirmado: { label: 'Confirmado', dot: 'bg-emerald-500', text: 'text-emerald-400', cor: '#10b981' },
  inferido: { label: 'Inferido', dot: 'bg-amber-400', text: 'text-amber-300', cor: '#fbbf24' },
  indefinido: { label: 'Não definido', dot: 'bg-red-500', text: 'text-red-400', cor: '#ef4444' },
}
const ordemStatus: Record<Status, number> = { confirmado: 0, inferido: 1, indefinido: 2 }
export const piorStatus = (xs: Status[]): Status | undefined => xs.sort((a, b) => ordemStatus[b] - ordemStatus[a])[0]
export const melhorStatus = (xs: Status[]): Status | undefined => xs.sort((a, b) => ordemStatus[a] - ordemStatus[b])[0]

export type NodeKind = 'tela' | 'jornada' | 'etapa' | 'entidade' | 'dado' | 'acao' | 'regra' | 'requisito' | 'ator' | 'integracao' | 'processo'

export const kindInfo: Record<NodeKind, { label: string; plural: string; cor: string }> = {
  tela: { label: 'Tela', plural: 'Telas', cor: '#38bdf8' },
  jornada: { label: 'Jornada', plural: 'Jornadas', cor: '#a78bfa' },
  etapa: { label: 'Etapa', plural: 'Etapas', cor: '#c4b5fd' },
  entidade: { label: 'Entidade', plural: 'Entidades', cor: '#f472b6' },
  dado: { label: 'Dado', plural: 'Dados', cor: '#67e8f9' },
  acao: { label: 'Ação', plural: 'Ações', cor: '#93c5fd' },
  regra: { label: 'Regra', plural: 'Regras', cor: '#818cf8' },
  requisito: { label: 'Requisito', plural: 'Requisitos', cor: '#e879f9' },
  ator: { label: 'Perfil / ator', plural: 'Perfis / atores', cor: '#d4d4d8' },
  integracao: { label: 'API / integração', plural: 'APIs / integrações', cor: '#fb923c' },
  processo: { label: 'Tarefa do processo', plural: 'Tarefas do processo', cor: '#94a3b8' },
}
export const kinds = Object.keys(kindInfo) as NodeKind[]

// Onde a definição foi encontrada. ref = arquivo:linha ou documento › seção.
export type Fonte = 'código' | 'rotas' | 'jornadas' | 'perfis' | 'dados mockados' | 'documento' | 'mapa do processo' | 'anotação' | 'instruções do projeto'
export type Evidencia = { fonte: Fonte; ref: string; trecho?: string; arquivo?: string; linha?: number }

export type Node = {
  id: string
  kind: NodeKind
  label: string
  sub?: string // subtipo (ex.: dado → Coluna, Campo, Indicador, Status; ação → Botão, Aba…)
  descricao?: string
  modulo?: string // setor do menu (DN, CTM, DR solicitante, Administração, Sistema)
  telas?: string[] // telas (padrão de rota) em que o nó aparece
  rota?: string // tela: padrão da rota
  exemplo?: string // tela: rota concreta para abrir (sem parâmetros ou de uma etapa de jornada)
  jornada?: { id: string; step: number } // jornada/etapa: para abrir na casca
  evid: Evidencia[]
  meta?: Record<string, string | number | boolean | string[] | undefined>
}

export type Rel =
  | 'acessa' | 'executa' | 'contém' | 'abre' | 'foco' | 'usa' | 'produz' | 'representa' | 'navega' | 'transição'
  | 'status de' | 'depende de' | 'aplica' | 'descreve' | 'integra' | 'realiza' | 'corresponde' | 'responsável' | 'calcula'

export const relInfo: Record<Rel, string> = {
  acessa: 'acessa', executa: 'executa', contém: 'contém', abre: 'abre a tela', foco: 'destaca na etapa', usa: 'utiliza', produz: 'cria / altera',
  representa: 'representa', navega: 'leva para', transição: 'define o status', 'status de': 'é status de', 'depende de': 'depende de',
  aplica: 'se aplica a', descreve: 'descreve', integra: 'integra com', realiza: 'é feita na tela', corresponde: 'corresponde à etapa',
  responsável: 'é responsável por', calcula: 'é calculado por',
}
export const rels = Object.keys(relInfo) as Rel[]

export type Edge = { id: string; from: string; to: string; rel: Rel; status: Status; nota?: string; evid: Evidencia[] }

export type Prioridade = 'alta' | 'media' | 'baixa'
export const prioridadeInfo: Record<Prioridade, { label: string; cor: string }> = {
  alta: { label: 'Alta prioridade', cor: 'text-red-400' },
  media: { label: 'Média prioridade', cor: 'text-amber-300' },
  baixa: { label: 'Baixa prioridade', cor: 'text-zinc-300' },
}

export type TipoLacuna =
  | 'acao-sem-regra' | 'dado-sem-origem' | 'acao-sem-efeito' | 'campo-sem-destino' | 'requisito-sem-implementacao'
  | 'funcionalidade-sem-requisito' | 'entidade-orfa' | 'entidade-uso-unico' | 'entidade-so-cadastro' | 'api-sem-consumidor'
  | 'integracao-simulada' | 'integracao-sem-requisito' | 'informacao-sem-produtor' | 'jornada-incompleta' | 'acao-sem-permissao'
  | 'tela-isolada' | 'status-sem-transicao' | 'perfil-sem-acesso' | 'pendencia-documentada' | 'hipotese' | 'ator-sem-perfil'
  | 'processo-sem-tela' | 'processo-sem-jornada' | 'foco-nao-encontrado' | 'regra-nao-usada' | 'fluxo-sem-jornada'
  | 'jornada-sem-documento' | 'dados-restauracao' | 'etapa-sem-tela' | 'perfil-inexistente'

export const tipoLacunaInfo: Record<TipoLacuna, string> = {
  'acao-sem-regra': 'Ação sem regra',
  'dado-sem-origem': 'Dado sem origem',
  'acao-sem-efeito': 'Ação sem efeito definido',
  'campo-sem-destino': 'Campo sem destino',
  'requisito-sem-implementacao': 'Requisito sem implementação',
  'funcionalidade-sem-requisito': 'Funcionalidade sem requisito',
  'entidade-orfa': 'Entidade órfã',
  'entidade-uso-unico': 'Entidade com uma utilização',
  'entidade-so-cadastro': 'Informação sem consumidor efetivo',
  'api-sem-consumidor': 'API sem consumidor',
  'integracao-simulada': 'Integração sem contrato',
  'integracao-sem-requisito': 'Integração sem requisito',
  'informacao-sem-produtor': 'Informação sem produtor',
  'jornada-incompleta': 'Jornada incompleta',
  'acao-sem-permissao': 'Ação sem permissão',
  'tela-isolada': 'Tela isolada',
  'status-sem-transicao': 'Status sem transição',
  'perfil-sem-acesso': 'Perfil sem acesso na jornada',
  'pendencia-documentada': 'Pendência documentada',
  hipotese: 'Hipótese a validar',
  'ator-sem-perfil': 'Ator sem perfil',
  'processo-sem-tela': 'Tarefa do processo sem tela',
  'processo-sem-jornada': 'Tarefa do processo sem jornada',
  'foco-nao-encontrado': 'Foco de etapa não encontrado',
  'regra-nao-usada': 'Regra sem uso',
  'fluxo-sem-jornada': 'Fluxo documentado sem jornada',
  'jornada-sem-documento': 'Jornada sem documentação',
  'dados-restauracao': 'Dados da tela divergentes',
  'etapa-sem-tela': 'Etapa sem tela',
  'perfil-inexistente': 'Perfil inexistente',
}

// Lacuna: o que falta (a relação ausente) e onde ir para ver.
// falta: relação esperada que não foi encontrada — vira um nó fantasma no mapa (ex.: Ação → ? Regra).
export type Lacuna = {
  id: string
  tipo: TipoLacuna
  prioridade: Prioridade
  titulo: string
  detalhe: string
  nodes: string[]
  falta?: { de: string; rel: Rel; rotulo: string }
  tela?: string // padrão de rota para abrir
  elemento?: { kind: string; label: string } // para destacar na tela
  jornada?: { id: string; step: number }
  evid: Evidencia[]
}

export type Metrica = { id: string; titulo: string; valor: string; detalhe?: string; itens: { nodeId?: string; lacunaId?: string; texto: string; status?: Status }[] }

export type Model = {
  nodes: Map<string, Node>
  edges: Edge[]
  out: Map<string, Edge[]>
  in: Map<string, Edge[]>
  lacunas: Lacuna[]
  lacunasDe: Map<string, Lacuna[]>
  cobertura: Metrica[]
  telaElementos: Map<string, string[]> // padrão da rota → ações/dados renderizados pela tela
  geradoEm: string
  resumo: { arquivos: number; linhas: number }
}

export const vizinhos = (m: Model, id: string) => [...(m.out.get(id) ?? []), ...(m.in.get(id) ?? [])]
export const outro = (e: Edge, id: string) => (e.from === id ? e.to : e.from)

// Texto normalizado para comparar rótulos (sem acento, caixa ou espaços extras).
export const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[“”"']/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
