import type React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { screens } from '@/screens'
import { Building2 } from 'lucide-react'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'

const groups = ['Telas', 'Sistema'] as const // grupo sem telas visíveis não aparece

export function AppShell() {
  const { pathname } = useLocation()
  // Menu e avatar seguem o perfil ativo na casca (fora dela, mostra tudo).
  const perfil = useProfile()
  const noMenu = screens.filter((s) => !s.hidden && (!perfil || !s.profiles || s.profiles.includes(perfil)))
  const dr = profileOf(perfil).dr
  const user = profileOf(perfil).user ?? { nome: 'Maria Silva', email: 'maria.silva@senai.br' }
  const iniciais = user.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')

  return (
    <SidebarProvider style={{ '--sidebar-width': '15rem' } as React.CSSProperties}>
      <Sidebar>
        <SidebarHeader className="flex-row items-center justify-between py-2 pr-2 pl-4 font-semibold">
          CTM · Wireframes
          <SidebarTrigger />
        </SidebarHeader>
        {dr && (
          <div className="mx-2 mb-1 flex items-center gap-2 rounded-md border px-2.5 py-2">
            <Building2 className="text-muted-foreground size-4 shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">{dr.sigla}</p>
            </div>
          </div>
        )}
        <SidebarContent>
          {groups
            .filter((g) => noMenu.some((s) => s.group === g))
            .map((g) => (
            <SidebarGroup key={g}>
              {g !== 'Telas' && <SidebarGroupLabel>{g}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {noMenu
                    .filter((s) => s.group === g)
                    .map((s) => (
                      <SidebarMenuItem key={s.path}>
                        <SidebarMenuButton isActive={pathname === s.path || pathname.startsWith(s.path + '/')} render={<Link to={s.path} />}>
                          <s.icon />
                          <span>{s.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        {/* Usuário logado (fictício) */}
        <SidebarFooter className="border-t">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Avatar className="size-8">
              <AvatarFallback>{iniciais}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-xs leading-tight">
              <p className="truncate font-medium">{user.nome}</p>
              <p className="text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {/* Some quando não há breadcrumb nem botão de reabrir o menu */}
        <header className="flex h-12 items-center gap-2 border-b px-4 [&:has(#topbar-slot:empty):not(:has(button))]:hidden">
          <TopbarTrigger />
          {/* PageHeader renderiza o breadcrumb aqui via portal */}
          <div id="topbar-slot" className="min-w-0 flex-1" />
        </header>
        <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Com o menu fechado, o botão para reabrir fica na barra superior.
function TopbarTrigger() {
  const { open, isMobile, openMobile } = useSidebar()
  if (isMobile ? openMobile : open) return null
  return (
    <>
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
    </>
  )
}
