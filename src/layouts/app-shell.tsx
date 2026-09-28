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
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { screens } from '@/screens'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'

const groups = ['Telas', 'Sistema'] as const // grupo sem telas visíveis não aparece

export function AppShell() {
  const { pathname } = useLocation()
  // Menu e avatar seguem o perfil ativo na casca (fora dela, mostra tudo).
  const perfil = useProfile()
  const noMenu = screens.filter((s) => !s.hidden && (!perfil || !s.profiles || s.profiles.includes(perfil)))
  const user = profileOf(perfil).user ?? { nome: 'Maria Silva', email: 'maria.silva@senai.br' }
  const iniciais = user.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')

  return (
    <SidebarProvider style={{ '--sidebar-width': '12rem' } as React.CSSProperties}>
      <Sidebar>
        <SidebarHeader className="px-4 py-3 font-semibold">CTM · Wireframes</SidebarHeader>
        <SidebarContent>
          {groups
            .filter((g) => noMenu.some((s) => s.group === g))
            .map((g) => (
            <SidebarGroup key={g}>
              <SidebarGroupLabel>{g}</SidebarGroupLabel>
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
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
