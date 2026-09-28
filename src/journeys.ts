// Jornadas: sequências de telas para apresentar fluxos.
// `path` é qualquer rota do protótipo (ver src/screens.ts), inclusive com parâmetros.
// Perfil de acesso: quem está vendo a tela. Nome de um perfil de profiles.json
// (crie/edite pela casca). Definido na jornada e, se preciso, sobrescrito por etapa.
export type Profile = string

export type Step = { title: string; path: string; note?: string; profile?: Profile }
export type Journey = { id: string; title: string; description?: string; profile: Profile; steps: Step[] }

export const journeys: Journey[] = [
  {
    id: 'gestao-editais',
    title: 'Gestão de Editais',
    profile: 'Supervisora',
    steps: [
      { title: 'Gestão de Editais', path: '/editais', note: 'Supervisora clica em “Gerar novo edital”.' },
      { title: 'Gerar novo edital', path: '/editais/novo', note: 'Define vigência, CTMs, cursos (CH e valor por curso) e DRs credenciados, e gera o edital.' },
    ],
  },
  {
    id: 'novo-ta',
    title: 'Novo TAA',
    profile: 'Supervisora',
    steps: [
      { title: 'Gestão de TAA', path: '/dashboard', note: 'Supervisora clica em “Novo TAA”.' },
      { title: 'Novo TAA', path: '/dashboard/novo-ta', note: 'Preenche o Termo de Acordo Administrativo com o DR e salva como rascunho.' },
    ],
  },
]
