import type React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { Moon, StickyNote, Sun } from 'lucide-react'
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
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAnnotations } from '@/components/wf'
import { screens } from '@/screens'

const groups = ['Telas', 'Sistema'] as const // grupo sem telas visíveis não aparece

export function AppShell() {
  const { pathname } = useLocation()
  const { show, toggle } = useAnnotations()
  const { resolvedTheme, setTheme } = useTheme()

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
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="ml-auto flex gap-1">
            <Button variant={show ? 'secondary' : 'ghost'} size="sm" onClick={toggle}>
              <StickyNote /> Notas {show ? 'on' : 'off'}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Alternar tema"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
            </Button>
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
