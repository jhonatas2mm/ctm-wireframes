import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import { FileText, LayoutDashboard, List, Palette, SquarePen } from 'lucide-react'
import Dashboard from '@/pages/dashboard'
import ListPage from '@/pages/list'
import DetailPage from '@/pages/detail'
import FormPage from '@/pages/form'
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
  { path: '/', title: 'Dashboard', group: 'Telas', icon: LayoutDashboard, component: Dashboard },
  { path: '/itens', title: 'Listagem', group: 'Telas', icon: List, component: ListPage },
  { path: '/itens/:id', title: 'Detalhe', group: 'Telas', icon: FileText, component: DetailPage, hidden: true },
  { path: '/itens/novo', title: 'Formulário', group: 'Telas', icon: SquarePen, component: FormPage },
  { path: '/componentes', title: 'Componentes', group: 'Sistema', icon: Palette, component: Components },
]
