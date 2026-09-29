// Perfis de acesso (nome + cor de destaque). Mantidos pelo Claude a pedido — não edite pela interface.
// Jornadas referenciam o perfil pelo nome.
// user: pessoa fictícia mostrada no avatar do menu do protótipo quando este perfil está ativo.
// dr: DR do usuário, mostrada no topo do menu do protótipo.
export type ProfileDef = { name: string; color: string; user?: { nome: string; email: string }; dr?: { sigla: string; nome: string } }

export const profiles: ProfileDef[] = [
  { name: 'DN', color: '#0284c7', user: { nome: 'Maria Silva', email: 'maria.silva@senai.br' } },
  { name: 'CTM: Supervisor', color: '#ea580c', user: { nome: 'Carlos Andrade', email: 'carlos.andrade@senaimg.org.br' }, dr: { sigla: 'SENAI-MG', nome: 'Departamento Regional de Minas Gerais' } },
  { name: 'CTM: Comercial', color: '#059669', user: { nome: 'Juliana Pereira', email: 'juliana.pereira@senaimg.org.br' }, dr: { sigla: 'SENAI-MG', nome: 'Departamento Regional de Minas Gerais' } },
  { name: 'Super admin', color: '#dc2626', user: { nome: 'Fernanda Costa', email: 'fernanda.costa@senai.br' } },
]

export const profileOf = (name: string): ProfileDef =>
  profiles.find((p) => p.name === name) ?? { name, color: '#737373' }
