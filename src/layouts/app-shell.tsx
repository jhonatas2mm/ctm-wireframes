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
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { screens } from '@/screens'
import { Building2, GraduationCap, LogOut } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BuscaRapida } from '@/components/wf/busca-rapida'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'

// Setores do menu (na ordem); setor sem telas visíveis não aparece.
const secoes = ['DN', 'CTM', 'DR solicitante', 'Administração', 'Sistema'] as const
const secaoDe = (path: string, perfil?: string): (typeof secoes)[number] =>
  path.startsWith('/admin') ? 'Administração'
  : path.startsWith('/dashboard') && perfil === 'DR solicitante' ? 'DR solicitante'
  : ['/painel-dn', '/drs', '/dashboard', '/editais'].some((p) => path.startsWith(p)) ? 'DN'
  : ['/acompanhamento', '/contratos', '/turmas-ead', '/alunos'].some((p) => path.startsWith(p)) ? 'DR solicitante'
  : path.startsWith('/componentes') ? 'Sistema'
  : 'CTM'

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
      <Sidebar variant="floating">
        <SidebarHeader className="flex-row items-center justify-between pt-3 pb-4 pr-2 pl-3">
          {/* Logo do protótipo: marca laranja + nome */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5631A] to-[#BF340F] text-white shadow-sm">
              <GraduationCap className="size-5" />
            </div>
            <div className="text-lg font-bold tracking-tight">CTM</div>
          </div>
        </SidebarHeader>
        {dr && (
          <div className="mx-2 mb-4 flex items-center gap-3 rounded-2xl border bg-card p-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF6ED] text-[#E84910]">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-muted-foreground truncate text-xs">Departamento Regional</p>
              <p className="truncate text-sm font-semibold">{dr.sigla}</p>
            </div>
          </div>
        )}
        <div className="mx-2 mb-3">
          <BuscaRapida telas={noMenu.map((s) => s.path)} />
        </div>
        <SidebarContent>
          {secoes
            .map((sec) => ({ sec, itens: noMenu.filter((s) => secaoDe(s.path, perfil) === sec) }))
            .filter((x) => x.itens.length)
            .map(({ sec, itens }, _, todas) => (
            <SidebarGroup key={sec}>
              {/* Rótulo só quando o perfil vê mais de um setor (ex.: Super admin) */}
              {todas.length > 1 && <SidebarGroupLabel>{sec}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {itens
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
          <DropdownMenu>
          <DropdownMenuTrigger render={<button type="button" className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-white/60" />}>
            <Avatar className="size-8">
              {/* Foto opcional: public/avatars/<e-mail>.jpg; sem arquivo, mostra as iniciais (círculo azul do DS). */}
              <AvatarImage src={`${import.meta.env.BASE_URL}avatars/${user.email}.jpg`} alt="" />
              <AvatarFallback className="bg-[#1670FA] font-semibold text-white">{iniciais}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-xs leading-tight">
              <p className="truncate font-medium">{user.nome}</p>
              <p className="text-muted-foreground truncate">{user.email}</p>
            </div>
          </DropdownMenuTrigger>
          {/* Protótipo: "Sair" volta para a primeira tela do menu. */}
          <DropdownMenuContent side="top" align="start" className="w-52">
            <DropdownMenuItem render={<Link to={noMenu[0]?.path ?? '/'} />}><LogOut /> Sair</DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {/* Some quando não há breadcrumb nem botão de reabrir o menu */}
        <header className="flex h-12 items-center gap-2 px-4 md:px-6 [&:has(#topbar-slot:empty):not(:has(button))]:hidden">
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

