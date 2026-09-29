// Perfis de acesso (nome + cor de destaque). Mantidos pelo Claude a pedido — não edite pela interface.
// Três perfis principais — DN, CTM e DR solicitante — (mais o Super admin); CTM e DR solicitante têm "caixas" (subperfis).
// Jornadas referenciam o perfil pelo nome (ex.: 'CTM: PCP', 'DR solicitante: SESI').
// user: pessoa fictícia mostrada no avatar do menu do protótipo quando este perfil está ativo.
// dr: instituição do usuário, mostrada no topo do menu do protótipo (SENAI-UF ou SESI-UF).
// caixa: rótulo curto do subperfil; avaliacao: subperfil ainda em avaliação (Tutor, Monitor).
export type Grupo = 'DN' | 'CTM' | 'DR solicitante' | 'Super admin'
export type ProfileDef = { name: string; color: string; grupo?: Grupo; caixa?: string; avaliacao?: boolean; user?: { nome: string; email: string }; dr?: { sigla: string; nome: string } }

const MG = { sigla: 'SENAI-MG', nome: 'Departamento Regional de Minas Gerais' }
export const profiles: ProfileDef[] = [
  { name: 'DN', grupo: 'DN', color: '#0284c7', user: { nome: 'Maria Silva', email: 'maria.silva@senai.br' } },
  // CTM (SENAI-MG), na ordem das caixas
  { name: 'CTM: Comercial', grupo: 'CTM', caixa: 'Comercial', color: '#059669', user: { nome: 'Juliana Pereira', email: 'juliana.pereira@senaimg.org.br' }, dr: MG },
  { name: 'CTM: PCP', grupo: 'CTM', caixa: 'PCP', color: '#7c3aed', user: { nome: 'Eduardo Lima', email: 'eduardo.lima@senaimg.org.br' }, dr: MG },
  { name: 'CTM: Supervisor', grupo: 'CTM', caixa: 'Supervisor', color: '#ea580c', user: { nome: 'Carlos Andrade', email: 'carlos.andrade@senaimg.org.br' }, dr: MG },
  { name: 'CTM: Pedagógico', grupo: 'CTM', caixa: 'Pedagógico', color: '#db2777', user: { nome: 'Sônia Prado', email: 'sonia.prado@senaimg.org.br' }, dr: MG },
  { name: 'CTM: Tutor', grupo: 'CTM', caixa: 'Tutor', avaliacao: true, color: '#0d9488', user: { nome: 'Fabiana Rocha', email: 'fabiana.rocha@senaimg.org.br' }, dr: MG },
  { name: 'CTM: Monitor', grupo: 'CTM', caixa: 'Monitor', avaliacao: true, color: '#4f46e5', user: { nome: 'Lívia Campos', email: 'livia.campos@senaimg.org.br' }, dr: MG },
  // DR solicitante: SENAI contrata a CTM por TAA; SESI, por contrato
  { name: 'DR solicitante: SENAI', grupo: 'DR solicitante', caixa: 'SENAI', color: '#ca8a04', user: { nome: 'Paulo Mendes', email: 'paulo.mendes@senaimg.org.br' }, dr: MG },
  { name: 'DR solicitante: SESI', grupo: 'DR solicitante', caixa: 'SESI', color: '#16a34a', user: { nome: 'Renata Souza', email: 'renata.souza@sesimg.org.br' }, dr: { sigla: 'SESI-MG', nome: 'SESI Minas Gerais' } },
  { name: 'Super admin', grupo: 'Super admin', color: '#dc2626', user: { nome: 'Fernanda Costa', email: 'fernanda.costa@senai.br' } },
]

export const grupos: Grupo[] = ['DN', 'CTM', 'DR solicitante', 'Super admin']
export const profileOf = (name: string): ProfileDef =>
  profiles.find((p) => p.name === name) ?? { name, color: '#737373' }
export const grupoDe = (name: string): Grupo | undefined => profileOf(name).grupo
