// Jornadas: sequências de telas para apresentar fluxos.
// `path` é qualquer rota do protótipo (ver src/screens.ts), inclusive com parâmetros.
// Perfil de acesso: quem está vendo a tela. Nome de um perfil de profiles.json
// (crie/edite pela casca). Definido na jornada e, se preciso, sobrescrito por etapa.
export type Profile = string

export type Step = { title: string; path: string; note?: string; profile?: Profile }
export type Journey = { id: string; title: string; description?: string; profile: Profile; steps: Step[] }

export const journeys: Journey[] = [
  {
    id: 'criar-item',
    title: 'Criar item',
    profile: 'Operador',
    description: 'Usuário cadastra um novo item a partir do dashboard.',
    steps: [
      { title: 'Dashboard', path: '/dashboard', note: 'Usuário clica em “Novo item”.' },
      { title: 'Formulário', path: '/itens/novo', note: 'Preenche nome e responsável e salva.' },
      { title: 'Listagem', path: '/itens', note: 'Volta para a lista com toast de sucesso.' },
      { title: 'Detalhe', path: '/itens/1', note: 'Abre o item recém-criado.' },
    ],
  },
  {
    id: 'consultar-item',
    title: 'Consultar item',
    profile: 'Cliente',
    steps: [
      { title: 'Listagem', path: '/itens', note: 'Busca pelo nome ou filtra por status.' },
      { title: 'Detalhe', path: '/itens/2', note: 'Consulta histórico e anexos nas abas.' },
    ],
  },
  {
    id: 'visao-geral',
    title: 'Visão geral',
    profile: 'Gestor',
    steps: [{ title: 'Dashboard', path: '/dashboard', note: 'Indicadores do dia.' }],
  },
]
