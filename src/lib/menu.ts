// Setores e organizadores do menu lateral (usados pelo menu e pelo breadcrumb automático do PageHeader).
// Setores do menu (na ordem); setor sem telas visíveis não aparece.
export const secoes = ['DN', 'CTM', 'DR solicitante', 'Administração', 'Sistema'] as const
export const secaoDe = (path: string, perfil?: string): (typeof secoes)[number] =>
  path.startsWith('/admin') ? 'Administração'
  // Portfólio das CTMs é visto por todos: fica no setor do próprio perfil
  : path === '/portfolio' && perfil?.startsWith('DR solicitante') ? 'DR solicitante'
  : path === '/portfolio' && perfil === 'DN' ? 'DN'
  : path.startsWith('/dashboard') ? 'DR solicitante'
  : ['/painel-dn', '/drs', '/editais', '/portfolio/aprovacoes'].some((p) => path.startsWith(p)) ? 'DN'
  : ['/acompanhamento', '/contratos', '/turmas-ead', '/alunos', '/desistencias', '/escolas'].some((p) => path.startsWith(p)) ? 'DR solicitante'
  : path.startsWith('/componentes') ? 'Sistema'
  : 'CTM'

// Organizadores dentro de cada setor (menus longos); o Painel fica solto no topo.
export const subgrupos: Record<string, [string, string[]][]> = {
  DN: [['Credenciamento', ['/drs']], ['Editais e portfólio', ['/editais', '/portfolio']]],
  CTM: [['Contratos', ['/taas-ctm', '/produtos']], ['Portfólio', ['/portfolio']], ['Execução', ['/oferta', '/equipe', '/tratativas']], ['Financeiro', ['/financeiro']]],
  'DR solicitante': [['Cadastro', ['/escolas']], ['Contratação', ['/dashboard', '/contratos']], ['Portfólio', ['/portfolio']], ['Execução', ['/turmas-ead', '/alunos', '/desistencias']]],
  Administração: [['Usuários e acesso', ['/admin/usuarios', '/admin/perfis']], ['Registros', ['/admin/auditoria', '/admin/logs']], ['Configurações', ['/admin/feriados']]],
}
export const subgrupoDe = (sec: string, path: string) => subgrupos[sec]?.find(([, ps]) => ps.some((p) => path.startsWith(p)))?.[0] ?? ''
