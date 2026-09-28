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

const groups = ['Telas', 'Sistema'] as const // grupo sem telas visíveis não aparece

export function AppShell() {
  const { pathname } = useLocation()

  return (
    <SidebarProvider style={{ '--sidebar-width': '12rem' } as React.CSSProperties}>
      <Sidebar>
        <SidebarHeader className="px-4 py-3 font-semibold">CTM · Wireframes</SidebarHeader>
        <SidebarContent>
          {groups
            .filter((g) => screens.some((s) => s.group === g && !s.hidden))
            .map((g) => (
            <SidebarGroup key={g}>
              <SidebarGroupLabel>{g}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {screens
                    .filter((s) => s.group === g && !s.hidden)
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
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-xs leading-tight">
              <p className="truncate font-medium">Maria Silva</p>
              <p className="text-muted-foreground truncate">maria.silva@senai.br</p>
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
