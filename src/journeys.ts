// Jornadas: sequências de telas para apresentar fluxos.
// `path` é qualquer rota do protótipo (ver src/screens.ts), inclusive com parâmetros.
export type Step = { title: string; path: string; note?: string }
export type Journey = { id: string; title: string; description?: string; steps: Step[] }

export const journeys: Journey[] = [
  {
    id: 'criar-item',
    title: 'Criar item',
    description: 'Usuário cadastra um novo item a partir do dashboard.',
    steps: [
      { title: 'Dashboard', path: '/', note: 'Usuário clica em “Novo item”.' },
      { title: 'Formulário', path: '/itens/novo', note: 'Preenche nome e responsável e salva.' },
      { title: 'Listagem', path: '/itens', note: 'Volta para a lista com toast de sucesso.' },
      { title: 'Detalhe', path: '/itens/1', note: 'Abre o item recém-criado.' },
    ],
  },
  {
    id: 'consultar-item',
    title: 'Consultar item',
    steps: [
      { title: 'Listagem', path: '/itens', note: 'Busca pelo nome ou filtra por status.' },
      { title: 'Detalhe', path: '/itens/2', note: 'Consulta histórico e anexos nas abas.' },
    ],
  },
  {
    id: 'visao-geral',
    title: 'Visão geral',
    steps: [{ title: 'Dashboard', path: '/', note: 'Indicadores do dia.' }],
  },
]
