// Perfis de acesso (nome + cor de destaque). Mantidos pelo Claude a pedido — não edite pela interface.
// Jornadas referenciam o perfil pelo nome.
// user: pessoa fictícia mostrada no avatar do menu do protótipo quando este perfil está ativo.
export type ProfileDef = { name: string; color: string; user?: { nome: string; email: string } }

export const profiles: ProfileDef[] = [
  { name: 'Supervisora', color: '#0284c7', user: { nome: 'Maria Silva', email: 'maria.silva@senai.br' } },
  { name: 'DR credenciada', color: '#ea580c', user: { nome: 'Carlos Andrade', email: 'carlos.andrade@senaimg.org.br' } },
]

export const profileOf = (name: string): ProfileDef =>
  profiles.find((p) => p.name === name) ?? { name, color: '#737373' }
