// Jornadas: sequências de telas para apresentar fluxos.
// `path` é qualquer rota do protótipo (ver src/screens.ts), inclusive com parâmetros.
// Perfil de acesso: quem está vendo a tela. Nome de um perfil de profiles.json
// (crie/edite pela casca). Definido na jornada e, se preciso, sobrescrito por etapa.
export type Profile = string

export type Step = { title: string; path: string; note?: string; profile?: Profile }
export type Journey = { id: string; title: string; description?: string; profile: Profile; steps: Step[] }

export const journeys: Journey[] = [
  {
    id: 'novo-produto',
    title: 'Novo produto',
    profile: 'Operador',
    steps: [{ title: 'Dashboard', path: '/dashboard', note: 'Usuário clica em “Novo produto”.' }],
  },
]
