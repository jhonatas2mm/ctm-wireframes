import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Ban, CheckCircle2, Pencil, Plus, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DataTable, EmptyState, PageHeader, Req, RowAction, type Column, useConfirmar } from '@/components/wf'
import { profiles } from '@/journey/profiles'
import { screens } from '@/screens'
import { useAuditoria, usePermissoes, useUsuarios, type Evento, type PermissaoPerfil, type Usuario } from '@/lib/mock'
import { cn } from '@/lib/utils'

const StatusUsuarioBadge = ({ status }: { status: Usuario['status'] }) => (
  <Badge variant="outline" className={cn('border-transparent', status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground')}>{status}</Badge>
)
const drLabel = (dr: string) => (dr === 'DN' ? 'DN' : dr.startsWith('SESI-') ? dr : `SENAI-${dr}`)

// Super admin · Gestão de usuários: lista, novo/editar (sheet lateral) e ativar/inativar com confirmação.
const colunasUsuarios: Column<Usuario>[] = [
  { header: 'Nome', value: (u) => u.nome, search: true, className: 'font-medium' },
  { header: 'E-mail', value: (u) => u.email, search: true, className: 'text-muted-foreground' },
  { header: 'Perfil', value: (u) => u.perfil, filter: true },
  { header: 'DR', value: (u) => drLabel(u.dr), filter: true },
  { header: 'Status', value: (u) => u.status, filter: true, cell: (u) => <StatusUsuarioBadge status={u.status} /> },
  { header: 'Último acesso', value: (u) => u.ultimoAcesso, className: 'tabular-nums text-muted-foreground' },
]

export function Usuarios() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { id } = useParams()
  const db = useUsuarios()
  const { confirmar, dialogo } = useConfirmar()
  const editando = id ? db.get(id) ?? null : null
  return (
    <>
      <PageHeader title="Gestão de usuários" actions={<Button onClick={() => navigate('/admin/usuarios/novo')}><Plus /> Novo usuário</Button>} />
      <DataTable
        rows={db.all}
        columns={colunasUsuarios}
        searchPlaceholder="Buscar nome ou e-mail…"
        actions={(u) => (
          <>
            <RowAction label="Editar usuário" icon={Pencil} onClick={() => navigate(`/admin/usuarios/${u.id}`)} />
            {u.status === 'Ativo' ? (
              <RowAction label="Inativar" icon={Ban} onClick={() => confirmar({ titulo: `Inativar ${u.nome}?`, onConfirmar: () => db.update(u.id, { status: 'Inativo' }) })} />
            ) : (
              <RowAction label="Ativar" icon={CheckCircle2} onClick={() => db.update(u.id, { status: 'Ativo' })} />
            )}
          </>
        )}
      />
      <UsuarioSheet open={pathname === '/admin/usuarios/novo' || !!editando} usuario={editando} onClose={() => navigate('/admin/usuarios')} />
      {dialogo}
    </>
  )
}

function UsuarioSheet({ open, usuario, onClose }: { open: boolean; usuario: Usuario | null; onClose: () => void }) {
  const db = useUsuarios()
  const [f, setF] = useState({ nome: '', email: '', perfil: 'CTM: Supervisor', dr: 'MG' })
  // Protótipo: novo já abre preenchido; edição abre com os dados do usuário.
  useEffect(() => {
    if (!open) return
    setF(usuario ? { nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, dr: usuario.dr } : { nome: 'Lucas Martins', email: 'lucas.martins@senaimg.org.br', perfil: 'CTM: Comercial', dr: 'MG' })
  }, [open, usuario?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const drs = ['DN', 'MG', 'SP', 'RJ', 'ES', 'BA', 'GO']
  const salvar = () => {
    if (usuario) db.update(usuario.id, f)
    else db.add({ ...f, status: 'Ativo', ultimoAcesso: '—' })
    onClose()
  }
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">{usuario ? 'Editar usuário' : 'Novo usuário'}</SheetTitle>
          <SheetDescription className="sr-only">Dados de acesso do usuário</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="grid gap-1.5">
            <Label>Nome <Req /></Label>
            <Input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>E-mail <Req /></Label>
            <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Perfil <Req /></Label>
              <Select value={f.perfil} onValueChange={(v) => setF({ ...f, perfil: v as string })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{profiles.map((p) => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>DR <Req /></Label>
              <Select value={f.dr} onValueChange={(v) => setF({ ...f, dr: v as string })}>
                <SelectTrigger className="w-full"><SelectValue>{(v: string) => drLabel(v)}</SelectValue></SelectTrigger>
                <SelectContent>{drs.map((d) => <SelectItem key={d} value={d}>{drLabel(d)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {!usuario && <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">O usuário recebe por e-mail o link para definir a senha no primeiro acesso.</p>}
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar}>Salvar usuário</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// Super admin · Perfis e permissões: lista de perfis → edição das telas que cada perfil acessa.
// Função (e não constante): screens.ts importa este arquivo, então a lista só é lida na renderização.
const telasMenu = () => screens.filter((s) => !s.hidden && s.group === 'Telas')

export function Perfis() {
  const navigate = useNavigate()
  const { id } = useParams()
  const db = usePermissoes()
  const usuarios = useUsuarios().all
  const perfil = id ? db.get(decodeURIComponent(id)) : undefined
  if (id) return perfil ? <PermissoesPerfil p={perfil} /> : <EmptyState title="Perfil não encontrado" />
  const colunas: Column<PermissaoPerfil>[] = [
    { header: 'Perfil', value: (p) => p.perfil, search: true, cell: (p) => <span className="flex items-center gap-2 font-medium"><span className="size-2.5 rounded-full" style={{ background: profiles.find((x) => x.name === p.perfil)?.color }} />{p.perfil}</span> },
    { header: 'Telas com acesso', value: (p) => p.telas.length, className: 'text-right tabular-nums' },
    { header: 'Usuários', value: (p) => usuarios.filter((u) => u.perfil === p.perfil).length, className: 'text-right tabular-nums' },
  ]
  return (
    <>
      <PageHeader title="Perfis e permissões" />
      <DataTable
        rows={db.all}
        columns={colunas}
        searchPlaceholder="Buscar perfil…"
        onRowClick={(p) => navigate(`/admin/perfis/${encodeURIComponent(p.id)}`)}
        actions={(p) => <RowAction label="Editar permissões" icon={ShieldCheck} onClick={() => navigate(`/admin/perfis/${encodeURIComponent(p.id)}`)} />}
      />
    </>
  )
}

function PermissoesPerfil({ p }: { p: PermissaoPerfil }) {
  const navigate = useNavigate()
  const db = usePermissoes()
  const [telas, setTelas] = useState(p.telas)
  const menu = telasMenu()
  const todas = telas.length === menu.length
  return (
    <>
      <PageHeader
        title={`Permissões · ${p.perfil}`}
        breadcrumb={[{ label: 'Perfis e permissões', to: '/admin/perfis' }, { label: p.perfil }]}
        actions={<Button onClick={() => (db.update(p.id, { telas }), navigate('/admin/perfis'))}>Salvar permissões</Button>}
      />
      <div className="overflow-hidden rounded-lg border">
        <label className="flex items-center gap-3 border-b bg-muted/60 px-4 py-2.5 text-sm font-bold">
          <Checkbox checked={todas} onCheckedChange={(v) => setTelas(v ? menu.map((s) => s.path) : [])} />
          Selecionar todas <span className="ml-auto font-normal text-muted-foreground">{telas.length} de {menu.length}</span>
        </label>
        <ul className="divide-y">
          {menu.map((s) => (
            <li key={s.path}>
              <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/40">
                <Checkbox checked={telas.includes(s.path)} onCheckedChange={(v) => setTelas(v ? [...telas, s.path] : telas.filter((x) => x !== s.path))} />
                <s.icon className="size-4 text-muted-foreground" />
                {s.title}
                <span className="ml-auto font-mono text-xs text-muted-foreground">{s.path}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

// Super admin · Auditoria: trilha de ações no sistema (somente leitura).
const colunasAuditoria: Column<Evento>[] = [
  { header: 'Data e hora', value: (e) => e.quando, className: 'tabular-nums' },
  { header: 'Usuário', value: (e) => e.usuario, search: true, filter: true, className: 'font-medium' },
  { header: 'Perfil', value: (e) => e.perfil, filter: true },
  { header: 'Ação', value: (e) => e.acao, filter: true, cell: (e) => <Badge variant="secondary">{e.acao}</Badge> },
  { header: 'Registro', value: (e) => e.alvo, search: true },
]

export function Auditoria() {
  return (
    <>
      <PageHeader title="Auditoria" />
      <DataTable rows={useAuditoria().all} columns={colunasAuditoria} searchPlaceholder="Buscar usuário ou registro…" />
    </>
  )
}
