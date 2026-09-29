import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import { UserX } from 'lucide-react'
import { History, ShieldCheck, Users, Boxes, GraduationCap, Building2, FileSignature, FileSpreadsheet, Gauge, LayoutDashboard, UserRound, Video, Package, Palette, ScrollText, CalendarDays, ClipboardList, Wallet, UsersRound, BookOpenCheck, ClipboardCheck, Send } from 'lucide-react'
import Dashboard from '@/pages/dashboard'
import Editais from '@/pages/editais'
import Produtos from '@/pages/produtos'
import GestaoProposta from '@/pages/gestao-proposta'
import GestaoProdutos from '@/pages/gestao-produtos'
import GestaoDrs from '@/pages/gestao-drs'
import Oferta from '@/pages/oferta'
import { Alunos, Contratos, Painel, Turmas } from '@/pages/acompanhamento'
import OfertaDetalhe from '@/pages/oferta-detalhe'
import Equipe from '@/pages/equipe'
import Calendario from '@/pages/calendario'
import Tratativas from '@/pages/tratativas'
import Financeiro from '@/pages/financeiro'
import RelatorioCobranca from '@/pages/relatorio-cobranca'
import Desistencias from '@/pages/desistencias'
import Portfolio from '@/pages/portfolio'
import TaaCtm from '@/pages/taa-ctm'
import Components from '@/pages/components'
import { Auditoria, Perfis, Usuarios } from '@/pages/admin'
import Logs from '@/pages/logs'
import MeuPerfil from '@/pages/meu-perfil'
import { PainelComercial, PainelDn, PainelSupervisor } from '@/pages/paineis'

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
  { path: '/painel-dn', title: 'Painel', group: 'Telas', icon: Gauge, component: PainelDn, profiles: ['DN'], data: ['contratos', 'editais', 'drs'] },
  { path: '/drs', title: 'Gestão de DRs', group: 'Telas', icon: Building2, component: GestaoDrs, profiles: ['DN', 'Super admin'], data: ['drs'] },
  { path: '/drs/novo', title: 'Nova DR credenciada', group: 'Telas', icon: Building2, component: GestaoDrs, hidden: true, data: ['drs'] },
  { path: '/dashboard', title: 'Contratação de CTM', group: 'Telas', icon: FileSignature, component: Dashboard, profiles: ['DR solicitante: Gestor EAD', 'DR solicitante: Coordenador EAD', 'DR solicitante: Gestor Escolar', 'DR solicitante: Coordenador Escolar', 'Super admin'], data: ['contratos'] },
  { path: '/dashboard/novo-ta', title: 'Novo TAA', group: 'Telas', icon: LayoutDashboard, component: Dashboard, hidden: true, data: ['contratos'] },
  { path: '/dashboard/:id', title: 'Detalhes do TAA', group: 'Telas', icon: LayoutDashboard, component: Dashboard, hidden: true, data: ['contratos'] },
  { path: '/editais', title: 'Gestão de Editais', group: 'Telas', icon: FileSpreadsheet, component: Editais, profiles: ['DN', 'Super admin'], data: ['editais'] },
  { path: '/editais/novo', title: 'Novo edital', group: 'Telas', icon: FileSpreadsheet, component: Editais, hidden: true, data: ['editais'] },
  { path: '/editais/:id/sucesso', title: 'Edital criado', group: 'Telas', icon: FileSpreadsheet, component: Editais, hidden: true, data: ['editais'] },
  { path: '/painel-ctm', title: 'Painel', group: 'Telas', icon: Gauge, component: PainelSupervisor, profiles: ['CTM: Coordenador EAD'], data: ['produtos', 'turmas', 'taas-dr'] },
  { path: '/painel-comercial', title: 'Painel', group: 'Telas', icon: Gauge, component: PainelComercial, profiles: ['CTM: Gestor EAD'], data: ['produtos', 'cursos-dr'] },
  { path: '/portfolio/aprovacoes', title: 'Aprovação de portfólio', group: 'Telas', icon: ClipboardCheck, component: Portfolio, profiles: ['DN', 'Super admin'], data: ['cursos-dr'] },
  { path: '/portfolio', title: 'Portfólio das CTMs', group: 'Telas', icon: BookOpenCheck, component: Portfolio, data: ['cursos-dr'] },
  { path: '/taas-ctm', title: 'TAAs com as DRs', group: 'Telas', icon: Send, component: TaaCtm, profiles: ['CTM: Coordenador EAD', 'CTM: Gestor EAD', 'Super admin'], data: ['contratos'] },
  { path: '/taas-ctm/:id', title: 'Detalhes do TAA', group: 'Telas', icon: Send, component: TaaCtm, hidden: true, data: ['contratos'] },
  { path: '/taas-ctm/novo', title: 'Novo TAA', group: 'Telas', icon: Send, component: TaaCtm, hidden: true, data: ['contratos'] },
  { path: '/gestao-produtos', title: 'Gestão de Portfólio', group: 'Telas', icon: Boxes, component: GestaoProdutos, profiles: ['CTM: Coordenador EAD', 'CTM: Gestor EAD', 'Super admin'], data: ['cursos-dr'] },
  { path: '/produtos', title: 'Gestão de propostas', group: 'Telas', icon: Package, component: Produtos, profiles: ['CTM: Coordenador EAD', 'CTM: Gestor EAD', 'Super admin'], data: ['produtos'] },
  { path: '/gestao-produtos/novo', title: 'Novo produto', group: 'Telas', icon: Boxes, component: GestaoProdutos, hidden: true, data: ['cursos-dr'] },
  { path: '/produtos/novo', title: 'Nova proposta', group: 'Telas', icon: Package, component: Produtos, hidden: true, data: ['produtos'] },
  { path: '/produtos/:id', title: 'Gestão da proposta', group: 'Telas', icon: Package, component: GestaoProposta, hidden: true, data: ['produtos'] },
  { path: '/oferta', title: 'Gestão da oferta', group: 'Telas', icon: GraduationCap, component: Oferta, profiles: ['CTM: Coordenador EAD', 'CTM: Gestor EAD', 'CTM: Coordenador Pedagógico', 'CTM: Tutor', 'CTM: Monitor', 'Super admin'], data: ['turmas', 'calendario'] },
  { path: '/equipe', title: 'Equipe', group: 'Telas', icon: UsersRound, component: Equipe, profiles: ['CTM: Coordenador EAD', 'CTM: Gestor EAD', 'Super admin'], data: ['equipe'] },
  { path: '/equipe/nova', title: 'Nova pessoa', group: 'Telas', icon: UsersRound, component: Equipe, hidden: true, data: ['equipe'] },
  { path: '/meu-perfil', title: 'Meu perfil', group: 'Telas', icon: UserRound, component: MeuPerfil, hidden: true },
  { path: '/admin/feriados', title: 'Feriados nacionais', group: 'Telas', icon: CalendarDays, component: Calendario, profiles: ['Super admin'], data: ['calendario'] },
  { path: '/admin/feriados/novo', title: 'Novo feriado', group: 'Telas', icon: CalendarDays, component: Calendario, hidden: true, data: ['calendario'] },
  { path: '/tratativas', title: 'Tratativas pedagógicas', group: 'Telas', icon: ClipboardList, component: Tratativas, profiles: ['CTM: Coordenador EAD', 'CTM: Gestor EAD', 'CTM: Coordenador Pedagógico', 'CTM: Monitor', 'Super admin'], data: ['tratativas'] },
  { path: '/tratativas/nova', title: 'Nova tratativa', group: 'Telas', icon: ClipboardList, component: Tratativas, hidden: true, data: ['tratativas'] },
  { path: '/financeiro', title: 'Financeiro', group: 'Telas', icon: Wallet, component: Financeiro, profiles: ['CTM: Coordenador EAD', 'CTM: Gestor EAD', 'Super admin'], data: ['formalizacoes', 'ajustes-cobranca'] },
  { path: '/financeiro/cobranca/:id', title: 'Relatório de cobrança', group: 'Telas', icon: Wallet, component: RelatorioCobranca, hidden: true, data: ['ajustes-cobranca'] },
  { path: '/acompanhamento', title: 'Painel', group: 'Telas', icon: Gauge, component: Painel, profiles: ['DR solicitante: Gestor EAD', 'DR solicitante: Coordenador EAD', 'DR solicitante: Gestor Escolar', 'DR solicitante: Coordenador Escolar', 'Super admin'], data: ['contratos-ctm', 'turmas-ead', 'alunos-ead'] },
  { path: '/contratos', title: 'Gestão de Contratos', group: 'Telas', icon: FileSignature, component: Contratos, profiles: ['DR solicitante: Gestor EAD', 'DR solicitante: Coordenador EAD', 'DR solicitante: Gestor Escolar', 'DR solicitante: Coordenador Escolar', 'Super admin'], data: ['contratos-ctm'] },
  { path: '/contratos/:id', title: 'Detalhes do contrato', group: 'Telas', icon: FileSignature, component: Contratos, hidden: true, data: ['contratos-ctm'] },
  { path: '/turmas-ead', title: 'Turmas', group: 'Telas', icon: Video, component: Turmas, profiles: ['DR solicitante: Gestor EAD', 'DR solicitante: Coordenador EAD', 'DR solicitante: Gestor Escolar', 'DR solicitante: Coordenador Escolar', 'Super admin'], data: ['turmas-ead'] },
  { path: '/turmas-ead/:id', title: 'Detalhes da turma', group: 'Telas', icon: Video, component: Turmas, hidden: true, data: ['turmas-ead'] },
  { path: '/alunos', title: 'Estudantes', group: 'Telas', icon: UserRound, component: Alunos, profiles: ['DR solicitante: Gestor EAD', 'DR solicitante: Coordenador EAD', 'DR solicitante: Gestor Escolar', 'DR solicitante: Coordenador Escolar', 'Super admin'], data: ['alunos-ead'] },
  { path: '/alunos/:id', title: 'Detalhes do estudante', group: 'Telas', icon: UserRound, component: Alunos, hidden: true, data: ['alunos-ead'] },
  { path: '/desistencias', title: 'Confirmação de desistências', group: 'Telas', icon: UserX, component: Desistencias, profiles: ['DR solicitante: Gestor EAD', 'DR solicitante: Coordenador EAD', 'DR solicitante: Gestor Escolar', 'DR solicitante: Coordenador Escolar', 'Super admin'], data: ['desistencias'] },
  { path: '/oferta/nova', title: 'Nova oferta', group: 'Telas', icon: GraduationCap, component: Oferta, hidden: true, data: ['turmas'] },
  { path: '/oferta/proposta/:pid', title: 'Ofertas da proposta', group: 'Telas', icon: GraduationCap, component: Oferta, hidden: true, data: ['turmas'] },
  { path: '/oferta/proposta/:pid/nova', title: 'Nova oferta', group: 'Telas', icon: GraduationCap, component: Oferta, hidden: true, data: ['turmas'] },
  { path: '/oferta/:id/sucesso', title: 'Oferta criada', group: 'Telas', icon: GraduationCap, component: Oferta, hidden: true, data: ['turmas'] },
  { path: '/oferta/:id', title: 'Detalhes da oferta', group: 'Telas', icon: GraduationCap, component: OfertaDetalhe, hidden: true, data: ['turmas', 'calendario', 'equipe'] },
  { path: '/componentes', title: 'Componentes', group: 'Sistema', icon: Palette, component: Components, hidden: true },
]
