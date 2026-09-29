// Perfis de acesso (nome + cor de destaque). Mantidos pelo Claude a pedido — não edite pela interface.
// Três perfis principais — DN, CTM e DR solicitante — (mais o Super admin); CTM e DR solicitante têm "caixas" (subperfis).
// Jornadas referenciam o perfil pelo nome (ex.: 'CTM: Coordenador EAD', 'DR solicitante: Gestor EAD').
// user: pessoa fictícia mostrada no avatar do menu do protótipo quando este perfil está ativo.
// dr: instituição do usuário, mostrada no topo do menu do protótipo (SENAI-UF).
// caixa: rótulo curto do subperfil; avaliacao: subperfil ainda em avaliação (Tutor, Monitor).
// cargo: função do usuário (ex.: o Gestor da DR solicitante pode ser coordenador ou interlocutor).
export type Grupo = 'DN' | 'CTM' | 'DR solicitante' | 'Super admin'
// escolas: perfis escolares da DR solicitante (Gestor e Coordenador Escolar) veem só os dados dessas escolas.
export type ProfileDef = { name: string; color: string; grupo?: Grupo; caixa?: string; avaliacao?: boolean; user?: { nome: string; email: string; cargo?: string }; dr?: { sigla: string; nome: string }; escolas?: string[] }

const MG = { sigla: 'SENAI-MG', nome: 'Departamento Regional de Minas Gerais' }
const RJ = { sigla: 'SENAI-RJ', nome: 'Departamento Regional do Rio de Janeiro' }
export const profiles: ProfileDef[] = [
  { name: 'DN', grupo: 'DN', color: '#0284c7', user: { nome: 'Maria Silva', email: 'maria.silva@senai.br' } },
  // CTM (SENAI-MG), na ordem das caixas
  { name: 'CTM: Gestor EAD', grupo: 'CTM', caixa: 'Gestor EAD', color: '#059669', user: { nome: 'Juliana Pereira', email: 'juliana.pereira@senaimg.org.br' }, dr: MG },
  { name: 'CTM: Coordenador EAD', grupo: 'CTM', caixa: 'Coordenador EAD', color: '#ea580c', user: { nome: 'Carlos Andrade', email: 'carlos.andrade@senaimg.org.br' }, dr: MG },
  { name: 'CTM: Coordenador Pedagógico', grupo: 'CTM', caixa: 'Coordenador Pedagógico', color: '#db2777', user: { nome: 'Sônia Prado', email: 'sonia.prado@senaimg.org.br' }, dr: MG },
  { name: 'CTM: Tutor', grupo: 'CTM', caixa: 'Tutor', color: '#0d9488', user: { nome: 'Fabiana Rocha', email: 'fabiana.rocha@senaimg.org.br' }, dr: MG },
  { name: 'CTM: Monitor', grupo: 'CTM', caixa: 'Monitor', color: '#4f46e5', user: { nome: 'Lívia Campos', email: 'livia.campos@senaimg.org.br' }, dr: MG },
  // DR solicitante: Gestor EAD e Coordenador EAD (a DR toda); Gestor e Coordenador Escolar = mesmos acessos, vinculados a
  // uma ou mais escolas (só veem os dados delas). TAA entre SENAI e SENAI (SESI fica fora da v1).
  { name: 'DR solicitante: Gestor EAD', grupo: 'DR solicitante', caixa: 'Gestor EAD', color: '#ca8a04', user: { nome: 'Paulo Mendes', email: 'paulo.mendes@senaimg.org.br', cargo: 'Gestor EAD' }, dr: MG },
  { name: 'DR solicitante: Coordenador EAD', grupo: 'DR solicitante', caixa: 'Coordenador EAD', color: '#b45309', user: { nome: 'Ana Ribeiro', email: 'ana.ribeiro@senaimg.org.br', cargo: 'Coordenador EAD' }, dr: MG },
  { name: 'DR solicitante: Gestor Escolar', grupo: 'DR solicitante', caixa: 'Gestor Escolar', color: '#65a30d', user: { nome: 'Marcos Teixeira', email: 'marcos.teixeira@firjan.com.br', cargo: 'Gestor Escolar' }, dr: RJ, escolas: ['SENAI Maracanã'] },
  { name: 'DR solicitante: Coordenador Escolar', grupo: 'DR solicitante', caixa: 'Coordenador Escolar', color: '#0891b2', user: { nome: 'Patrícia Gomes', email: 'patricia.gomes@firjan.com.br', cargo: 'Coordenador Escolar' }, dr: RJ, escolas: ['SENAI Maracanã', 'SENAI Tijuca'] },
  { name: 'Super admin', grupo: 'Super admin', color: '#dc2626', user: { nome: 'Fernanda Costa', email: 'fernanda.costa@senai.br' } },
]

export const grupos: Grupo[] = ['DN', 'CTM', 'DR solicitante', 'Super admin']
export const profileOf = (name: string): ProfileDef =>
  profiles.find((p) => p.name === name) ?? { name, color: '#737373' }
export const grupoDe = (name: string): Grupo | undefined => profileOf(name).grupo
