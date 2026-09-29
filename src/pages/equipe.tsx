import { useEffect, useState } from 'react'
import { Copy, Plus, Power, PowerOff } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DataTable, PageHeader, Req, RowAction, type Column, useConfirmar } from '@/components/wf'
import { diasSemana, funcoesEquipe, useEquipe, useTurmas, type FuncaoEquipe, type Pessoa } from '@/lib/mock'
import { cn } from '@/lib/utils'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'

// Equipe da CTM (gestão da execução): tutores, monitores, pedagógico etc., com competências (UCs) e dias disponíveis.
// O PCP usa a lista para alocar tutores; a supervisão aloca a equipe técnica. E-mail corporativo identifica a pessoa (sem duplicar).
export default function Equipe() {
  const { confirmar, dialogo } = useConfirmar()
  const perfil = useProfile()
  const superAdmin = perfil === 'Super admin'
  const { all: todos, update } = useEquipe()
  // Super admin vê a equipe de todas as CTMs (coluna CTM); a CTM vê só a própria.
  const all = superAdmin ? todos : todos.filter((p) => p.ctm === (profileOf(perfil).dr?.sigla ?? 'SENAI-MG'))
  const { all: turmas } = useTurmas()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // Alocações atuais: UCs (tutor) ou turmas (demais funções) em turmas não finalizadas.
  const alocacoes = (p: Pessoa) =>
    turmas.filter((t) => t.fase !== 'Cancelada').reduce((n, t) =>
      n + t.modulos.reduce((k, m) => k + m.unidades.filter((u) => u.tutor === p.nome).length, 0)
        + Number([t.supervisor, t.analista, ...Object.values(t.equipe ?? {})].includes(p.nome)), 0)
  const colunas: Column<Pessoa>[] = [
    {
      header: 'Nome', value: (p) => `${p.nome} ${p.email}`, search: true, className: 'font-medium',
      cell: (p) => (
        <div className="flex flex-col">
          <span>{p.nome}</span>
          <button
            type="button"
            title="Copiar e-mail"
            className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-xs font-normal"
            onClick={(e) => { e.stopPropagation(); void navigator.clipboard.writeText(p.email).catch(() => {}) }}
          >
            {p.email} <Copy className="size-3" />
          </button>
        </div>
      ),
    },
    ...(superAdmin ? [{ header: 'CTM', value: (p: Pessoa) => p.ctm, filter: true }] : []),
    { header: 'Função', value: (p) => p.funcao, filter: true },
    { header: 'Disponibilidade', value: (p) => p.disponibilidade.map((d) => d.slice(0, 3)).join(', '), className: 'text-muted-foreground' },
    { header: 'Alocações', value: (p) => alocacoes(p), className: 'text-right tabular-nums' },
    { header: 'Status', value: (p) => p.status, filter: true, cell: (p) => <Badge variant={p.status === 'Ativo' ? 'default' : 'outline'}>{p.status}</Badge> },
  ]
  return (
    <>
      <PageHeader title="Equipe" actions={<Button onClick={() => navigate('/equipe/nova')}><Plus /> Nova pessoa</Button>} />
      <DataTable
        rows={all}
        columns={colunas}
        searchPlaceholder="Buscar nome, e-mail ou UC…"
        actions={(p) => p.status === 'Ativo' ? (
          <RowAction label="Inativar" icon={PowerOff} onClick={() => confirmar({ titulo: `Inativar ${p.nome}? Deixa de aparecer para alocação nas turmas.`, acao: 'Inativar', onConfirmar: () => update(p.id, { status: 'Inativo' }) })} />
        ) : (
          <RowAction label="Ativar" icon={Power} onClick={() => update(p.id, { status: 'Ativo' })} />
        )}
      />
      <NovaPessoaSheet open={pathname === '/equipe/nova'} onOpenChange={(v) => !v && navigate('/equipe')} />
      {dialogo}
    </>
  )
}

function NovaPessoaSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const db = useEquipe()
  const perfilNovo = useProfile()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [funcao, setFuncao] = useState<FuncaoEquipe>('Tutor')
  const [competencias, setCompetencias] = useState('')
  const [dias, setDias] = useState<string[]>([])
  // Protótipo: já abre preenchido com dados de exemplo.
  useEffect(() => {
    if (!open) return
    setNome('Beatriz Fontes')
    setEmail('beatriz.fontes@senaimg.org.br')
    setFuncao('Tutor')
    setCompetencias('Mecânica aplicada, Robótica industrial')
    setDias(['Terça-feira', 'Quinta-feira'])
  }, [open])
  const duplicado = db.all.some((p) => p.email.toLowerCase() === email.trim().toLowerCase())
  const salvar = () => {
    if (duplicado) return
    db.add({ ctm: profileOf(perfilNovo).dr?.sigla ?? 'SENAI-MG', nome: nome.trim(), email: email.trim(), funcao, competencias: competencias.split(',').map((c) => c.trim()).filter(Boolean), disponibilidade: dias, status: 'Ativo' })
    onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">Nova pessoa</SheetTitle>
          <SheetDescription className="sr-only">Cadastrar pessoa na equipe da CTM</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="grid gap-1.5"><Label>Nome <Req /></Label><Input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
          <div className="grid gap-1.5">
            <Label>E-mail corporativo <Req /></Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {duplicado && <p className="text-xs text-red-600">Já existe uma pessoa com este e-mail.</p>}
          </div>
          <div className="grid gap-1.5">
            <Label>Função <Req /></Label>
            <Select value={funcao} onValueChange={(v) => setFuncao(v as FuncaoEquipe)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{funcoesEquipe.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {funcao === 'Tutor' && (
            <div className="grid gap-1.5"><Label>Competências (UCs que pode assumir)</Label><Input placeholder="Separe por vírgula" value={competencias} onChange={(e) => setCompetencias(e.target.value)} /></div>
          )}
          <div className="grid gap-1.5">
            <Label>Dias disponíveis</Label>
            <div className="flex flex-wrap gap-1.5">
              {diasSemana.map((d) => {
                const on = dias.includes(d)
                return (
                  <button key={d} type="button" aria-pressed={on} onClick={() => setDias(on ? dias.filter((x) => x !== d) : [...dias, d])} className={cn('rounded-md border px-2.5 py-1 text-sm bg-card', on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted')}>
                    {d.replace('-feira', '')}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={salvar}>Salvar pessoa</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
