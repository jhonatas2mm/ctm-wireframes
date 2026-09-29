import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import { History, ShieldCheck, Users, Boxes, GraduationCap, Building2, FileSignature, FileSpreadsheet, Gauge, LayoutDashboard, UserRound, Video, Package, Palette, ScrollText } from 'lucide-react'
import Dashboard from '@/pages/dashboard'
import Editais from '@/pages/editais'
import Produtos from '@/pages/produtos'
import MeusTaas from '@/pages/meus-taas'
import GestaoProposta from '@/pages/gestao-proposta'
import GestaoProdutos from '@/pages/gestao-produtos'
import GestaoDrs from '@/pages/gestao-drs'
import Oferta from '@/pages/oferta'
import { Alunos, Contratos, Painel, Turmas } from '@/pages/acompanhamento'
import OfertaDetalhe from '@/pages/oferta-detalhe'
import Components from '@/pages/components'
import { Auditoria, Perfis, Usuarios } from '@/pages/admin'
import Logs from '@/pages/logs'

// Registro de telas: adicione uma entrada aqui e ela aparece na rota e no menu.
export type Screen = {
  path: string
  title: string
  group: 'Telas' | 'Sistema'
  icon: LucideIcon
  component: ComponentType
  hidden?: boolean // rota existe mas não aparece no menu (ex.: detalhe)
  profiles?: string[] // perfis que veem no menu; sem isso, todos veem
  data?: string[] // coleções (src/lib/mock.ts, sem versão) que "Restaurar dados desta tela" apaga
}

export const screens: Screen[] = [
  { path: '/admin/usuarios', title: 'Gestão de usuários', group: 'Telas', icon: Users, component: Usuarios, profiles: ['Super admin'], data: ['usuarios'] },
  { path: '/admin/usuarios/novo', title: 'Novo usuário', group: 'Telas', icon: Users, component: Usuarios, hidden: true, data: ['usuarios'] },
  { path: '/admin/usuarios/:id', title: 'Editar usuário', group: 'Telas', icon: Users, component: Usuarios, hidden: true, data: ['usuarios'] },
  { path: '/admin/perfis', title: 'Perfis e permissões', group: 'Telas', icon: ShieldCheck, component: Perfis, profiles: ['Super admin'], data: ['permissoes'] },
  { path: '/admin/perfis/:id', title: 'Permissões do perfil', group: 'Telas', icon: ShieldCheck, component: Perfis, hidden: true, data: ['permissoes'] },
  { path: '/admin/auditoria', title: 'Auditoria', group: 'Telas', icon: History, component: Auditoria, profiles: ['Super admin'], data: ['auditoria'] },
  { path: '/admin/logs', title: 'Logs do sistema', group: 'Telas', icon: ScrollText, component: Logs, profiles: ['Super admin'], data: ['logs'] },
  { path: '/admin/logs/:id', title: 'Detalhe do log', group: 'Telas', icon: ScrollText, component: Logs, hidden: true, data: ['logs'] },
  { path: '/drs', title: 'Gestão de DRs', group: 'Telas', icon: Building2, component: GestaoDrs, profiles: ['DN', 'Super admin'], data: ['drs'] },
  { path: '/drs/novo', title: 'Nova DR credenciada', group: 'Telas', icon: Building2, component: GestaoDrs, hidden: true, data: ['drs'] },
  { path: '/dashboard', title: 'Gestão de TAA', group: 'Telas', icon: LayoutDashboard, component: Dashboard, profiles: ['DN', 'Super admin'], data: ['contratos'] },
  { path: '/dashboard/novo-ta', title: 'Novo TAA', group: 'Telas', icon: LayoutDashboard, component: Dashboard, hidden: true, data: ['contratos'] },
  { path: '/dashboard/:id', title: 'Detalhes do TAA', group: 'Telas', icon: LayoutDashboard, component: Dashboard, hidden: true, data: ['contratos'] },
  { path: '/editais', title: 'Gestão de Editais', group: 'Telas', icon: FileSpreadsheet, component: Editais, profiles: ['DN', 'Super admin'], data: ['editais'] },
  { path: '/editais/novo', title: 'Novo edital', group: 'Telas', icon: FileSpreadsheet, component: Editais, hidden: true, data: ['editais'] },
  { path: '/editais/:id/sucesso', title: 'Edital criado', group: 'Telas', icon: FileSpreadsheet, component: Editais, hidden: true, data: ['editais'] },
  { path: '/meus-taas', title: 'Gestão de TAAs', group: 'Telas', icon: FileSignature, component: MeusTaas, profiles: ['CTM: Supervisor', 'CTM: Comercial', 'Super admin'], data: ['taas-dr'] },
  { path: '/gestao-produtos', title: 'Gestão de Portfólio', group: 'Telas', icon: Boxes, component: GestaoProdutos, profiles: ['CTM: Supervisor', 'CTM: Comercial', 'Super admin'], data: ['cursos-dr'] },
  { path: '/produtos', title: 'Gestão de propostas', group: 'Telas', icon: Package, component: Produtos, profiles: ['CTM: Supervisor', 'CTM: Comercial', 'Super admin'], data: ['produtos'] },
  { path: '/gestao-produtos/novo', title: 'Novo produto', group: 'Telas', icon: Boxes, component: GestaoProdutos, hidden: true, data: ['cursos-dr'] },
  { path: '/produtos/novo', title: 'Nova proposta', group: 'Telas', icon: Package, component: Produtos, hidden: true, data: ['produtos'] },
  { path: '/produtos/:id', title: 'Gestão da proposta', group: 'Telas', icon: Package, component: GestaoProposta, hidden: true, data: ['produtos'] },
  { path: '/oferta', title: 'Gestão da oferta', group: 'Telas', icon: GraduationCap, component: Oferta, profiles: ['CTM: Supervisor', 'CTM: Comercial', 'Super admin'], data: ['turmas'] },
  { path: '/acompanhamento', title: 'Painel', group: 'Telas', icon: Gauge, component: Painel, profiles: ['DR solicitante', 'Super admin'], data: ['contratos-ctm', 'turmas-ead', 'alunos-ead'] },
  { path: '/contratos', title: 'Gestão de Contratos', group: 'Telas', icon: FileSignature, component: Contratos, profiles: ['DR solicitante', 'Super admin'], data: ['contratos-ctm'] },
  { path: '/contratos/:id', title: 'Detalhes do contrato', group: 'Telas', icon: FileSignature, component: Contratos, hidden: true, data: ['contratos-ctm'] },
  { path: '/turmas-ead', title: 'Turmas', group: 'Telas', icon: Video, component: Turmas, profiles: ['DR solicitante', 'Super admin'], data: ['turmas-ead'] },
  { path: '/turmas-ead/:id', title: 'Detalhes da turma', group: 'Telas', icon: Video, component: Turmas, hidden: true, data: ['turmas-ead'] },
  { path: '/alunos', title: 'Alunos', group: 'Telas', icon: UserRound, component: Alunos, profiles: ['DR solicitante', 'Super admin'], data: ['alunos-ead'] },
  { path: '/alunos/:id', title: 'Detalhes do aluno', group: 'Telas', icon: UserRound, component: Alunos, hidden: true, data: ['alunos-ead'] },
  { path: '/oferta/nova', title: 'Nova oferta', group: 'Telas', icon: GraduationCap, component: Oferta, hidden: true, data: ['turmas'] },
  { path: '/oferta/proposta/:pid', title: 'Ofertas da proposta', group: 'Telas', icon: GraduationCap, component: Oferta, hidden: true, data: ['turmas'] },
  { path: '/oferta/proposta/:pid/nova', title: 'Nova oferta', group: 'Telas', icon: GraduationCap, component: Oferta, hidden: true, data: ['turmas'] },
  { path: '/oferta/:id/sucesso', title: 'Oferta criada', group: 'Telas', icon: GraduationCap, component: Oferta, hidden: true, data: ['turmas'] },
  { path: '/oferta/:id', title: 'Detalhes da oferta', group: 'Telas', icon: GraduationCap, component: OfertaDetalhe, hidden: true, data: ['turmas'] },
  { path: '/meus-taas/novo', title: 'Novo TAA', group: 'Telas', icon: FileSignature, component: MeusTaas, hidden: true, data: ['taas-dr'] },
  { path: '/meus-taas/:taaId/produtos', title: 'Gestão de propostas', group: 'Telas', icon: Package, component: Produtos, hidden: true, data: ['produtos'] },
  { path: '/meus-taas/:taaId/produtos/novo', title: 'Nova proposta', group: 'Telas', icon: Package, component: Produtos, hidden: true, data: ['produtos'] },
  { path: '/componentes', title: 'Componentes', group: 'Sistema', icon: Palette, component: Components, hidden: true },
]
