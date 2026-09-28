// Perfis de acesso (nome + cor de destaque). Mantidos pelo Claude a pedido — não edite pela interface.
// Jornadas referenciam o perfil pelo nome.
export type ProfileDef = { name: string; color: string }

export const profiles: ProfileDef[] = [
  { name: 'Gestor', color: '#7c3aed' },
  { name: 'Supervisora', color: '#0284c7' },
  { name: 'Cliente', color: '#16a34a' },
]

export const profileOf = (name: string): ProfileDef =>
  profiles.find((p) => p.name === name) ?? { name, color: '#737373' }
