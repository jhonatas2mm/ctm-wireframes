import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import { FileSpreadsheet, LayoutDashboard, Palette } from 'lucide-react'
import Dashboard from '@/pages/dashboard'
import Editais from '@/pages/editais'
import Components from '@/pages/components'

// Registro de telas: adicione uma entrada aqui e ela aparece na rota e no menu.
export type Screen = {
  path: string
  title: string
  group: 'Telas' | 'Sistema'
  icon: LucideIcon
  component: ComponentType
  hidden?: boolean // rota existe mas não aparece no menu (ex.: detalhe)
}

export const screens: Screen[] = [
  { path: '/editais', title: 'Gestão de Editais', group: 'Telas', icon: FileSpreadsheet, component: Editais },
  { path: '/dashboard', title: 'Gestão de TA', group: 'Telas', icon: LayoutDashboard, component: Dashboard },
  { path: '/dashboard/novo-ta', title: 'Novo TA', group: 'Telas', icon: LayoutDashboard, component: Dashboard, hidden: true },
  { path: '/componentes', title: 'Componentes', group: 'Sistema', icon: Palette, component: Components, hidden: true },
]
