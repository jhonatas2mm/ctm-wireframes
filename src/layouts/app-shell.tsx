import { useState } from 'react'
import type React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { screens } from '@/screens'
import { ChevronDown, GraduationCap, LogOut, UserRound } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BuscaRapida } from '@/components/wf/busca-rapida'
import { Notificacoes } from '@/components/wf/notificacoes'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'
import { cn } from '@/lib/utils'

// Setores do menu (na ordem); setor sem telas visíveis não aparece.
const secoes = ['DN', 'CTM', 'DR solicitante', 'Administração', 'Sistema'] as const
const secaoDe = (path: string, perfil?: string): (typeof secoes)[number] =>
  path.startsWith('/admin') ? 'Administração'
  // Portfólio das CTMs é visto por todos: fica no setor do próprio perfil
  : path === '/portfolio' && perfil?.startsWith('DR solicitante') ? 'DR solicitante'
  : path === '/portfolio' && perfil === 'DN' ? 'DN'
  : path.startsWith('/dashboard') ? 'DR solicitante'
  : ['/painel-dn', '/drs', '/editais', '/portfolio/aprovacoes'].some((p) => path.startsWith(p)) ? 'DN'
  : ['/acompanhamento', '/contratos', '/turmas-ead', '/alunos', '/desistencias'].some((p) => path.startsWith(p)) ? 'DR solicitante'
  : path.startsWith('/componentes') ? 'Sistema'
  : 'CTM'

// Organizadores dentro de cada setor (menus longos); o Painel fica solto no topo.
const subgrupos: Record<string, [string, string[]][]> = {
  DN: [['Credenciamento', ['/drs']], ['Editais e portfólio', ['/editais', '/portfolio']]],
  CTM: [['Contratos', ['/taas-ctm', '/gestao-produtos', '/portfolio', '/produtos']], ['Execução', ['/oferta', '/equipe', '/tratativas']], ['Financeiro', ['/financeiro']]],
  'DR solicitante': [['Contratação', ['/dashboard', '/contratos', '/portfolio']], ['Execução', ['/turmas-ead', '/alunos', '/desistencias']]],
  Administração: [['Usuários e acesso', ['/admin/usuarios', '/admin/perfis']], ['Registros', ['/admin/auditoria', '/admin/logs']], ['Configurações', ['/admin/feriados']]],
}
const subgrupoDe = (sec: string, path: string) => subgrupos[sec]?.find(([, ps]) => ps.some((p) => path.startsWith(p)))?.[0] ?? ''

export function AppShell() {
  const { pathname } = useLocation()
  // Menu e avatar seguem o perfil ativo na casca (fora dela, mostra tudo).
  const perfil = useProfile()
  const noMenu = screens.filter((s) => !s.hidden && (!perfil || !s.profiles || s.profiles.includes(perfil)))
  // Cartão da DR só fora da área CTM (a CTM é a operação, não se identifica como DR no menu)
  const dr = perfil?.startsWith('CTM:') ? undefined : profileOf(perfil).dr
  const user = profileOf(perfil).user ?? { nome: 'Maria Silva', email: 'maria.silva@senai.br' }
  // Só um item ativo: o de caminho mais longo (ex.: /portfolio/aprovacoes não marca também /portfolio)
  const casa = (path: string) => pathname === path || pathname.startsWith(path + '/')
  const ativo = noMenu.filter((s) => casa(s.path)).sort((a, b) => b.path.length - a.path.length)[0]?.path
  // Grupos do menu: Painel solto (sem rótulo) e um por organizador; com mais de um setor (Super admin), o rótulo leva o setor.
  const setores = secoes
    .map((sec) => ({ sec, itens: noMenu.filter((s) => secaoDe(s.path, perfil) === sec) }))
    .filter((x) => x.itens.length)
  const grupos = setores.flatMap(({ sec, itens }) =>
    ['', ...(subgrupos[sec] ?? []).map(([n]) => n)]
      .map((n) => ({ n, lista: itens.filter((s) => subgrupoDe(sec, s.path) === n) }))
      .filter((g) => g.lista.length)
      .map((g) => ({ key: `${sec}-${g.n}`, rotulo: setores.length > 1 ? [sec === 'Administração' ? '' : sec, g.n].filter(Boolean).join(' · ') : g.n, lista: g.lista })),
  )
  const colapsavel = setores.length > 1
  const [abertos, setAbertos] = useState<Record<string, boolean>>({})
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
          {/* Sino de notificações: à direita da logo (só aparece nos perfis da CTM e no Super admin) */}
          <Notificacoes />
        </SidebarHeader>
        {dr && (
          <div className="mx-2 mb-4 flex items-center gap-3 rounded-2xl border bg-card px-3.5 py-2.5">
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
          {grupos.map(({ key, rotulo, lista }, i) => {
            // Super admin (vários setores): seções recolhíveis; por padrão só a primeira (e a da tela atual) abertas.
            const aberto = !colapsavel || !rotulo || (abertos[key] ?? (i === 0 || lista.some((s) => s.path === ativo)))
            return (
              <SidebarGroup key={key} className="py-1">
                {rotulo && (colapsavel ? (
                  <SidebarGroupLabel render={<button type="button" aria-expanded={aberto} onClick={() => setAbertos({ ...abertos, [key]: !aberto })} className="ml-2 h-auto min-h-8 w-[calc(100%-0.5rem)] cursor-pointer justify-between gap-2 py-1.5 text-left hover:text-sidebar-foreground" />}>
                    <span className="min-w-0 flex-1 text-left">{rotulo}</span>
                    <ChevronDown className={cn('size-4 shrink-0 transition-transform', !aberto && '-rotate-90')} />
                  </SidebarGroupLabel>
                ) : <SidebarGroupLabel className="ml-2 text-left">{rotulo}</SidebarGroupLabel>)}
                {aberto && (
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {lista.map((s) => (
                        <SidebarMenuItem key={s.path}>
                          <SidebarMenuButton isActive={s.path === ativo} render={<Link to={s.path} />}>
                            <s.icon />
                            <span>{s.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            )
          })}
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="min-w-0">
        {/* Some quando não há breadcrumb nem botão de reabrir o menu */}
        <header className="flex h-12 items-center gap-2 px-4 md:px-6 ">
          {/* PageHeader renderiza o breadcrumb aqui via portal */}
          <div id="topbar-slot" className="min-w-0 flex-1" />
          {/* Usuário logado (fictício): só o avatar no canto superior direito; nome e perfil ficam no dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<button type="button" aria-label={`Conta de ${user.nome}`} className="ml-auto shrink-0 rounded-full ring-offset-2 hover:ring-2 hover:ring-[#E4E8E9]" />}>
              <Avatar className="size-9">
                {/* Foto opcional: public/avatars/<e-mail>.jpg; sem arquivo, mostra as iniciais (círculo azul do DS). */}
                <AvatarImage src={`${import.meta.env.BASE_URL}avatars/${user.email}.jpg`} alt="" />
                <AvatarFallback className="bg-[#1670FA] font-semibold text-white">{iniciais}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            {/* Protótipo: "Sair" volta para a primeira tela do menu. */}
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-2 py-2 leading-tight">
                <p className="truncate text-sm font-semibold">{user.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                {perfil && <Badge variant="outline" className="mt-1.5 max-w-full"><span className="truncate">{profileOf(perfil).caixa ?? perfil}</span></Badge>}
                {dr && <p className="mt-1 text-xs text-muted-foreground">{dr.sigla}</p>}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link to="/meu-perfil" />}><UserRound /> Meu perfil</DropdownMenuItem>
              <DropdownMenuItem render={<Link to={noMenu[0]?.path ?? '/'} />}><LogOut /> Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="w-full min-w-0 space-y-6 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

