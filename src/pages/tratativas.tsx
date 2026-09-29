import { useEffect, useState } from 'react'
import { AlertTriangle, CalendarClock, ClipboardList, Eye, Plus, UserX, Users } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { DataTable, PageHeader, Req, StatCard, type Column } from '@/components/wf'
import {
  HOJE, dataBr, desfechosTratativa, motivosTratativa, useAlunosEad, useTratativas, useTurmasEad,
  type DesfechoTratativa, type MotivoTratativa, type Tratativa,
} from '@/lib/mock'
import { useAutor } from '@/lib/autor'
import { cn } from '@/lib/utils'

const corDesfecho: Record<DesfechoTratativa, string> = {
  Resolvido: 'bg-emerald-100 text-emerald-800',
  'Acompanhar novamente': 'bg-sky-100 text-sky-800',
  'Alerta de desistência': 'bg-red-100 text-red-800',
  'Plano de recuperação': 'bg-amber-100 text-amber-800',
}

const corTipo: Record<Tratativa['tipo'], string> = {
  Ativa: 'bg-sky-100 text-sky-800',
  Receptiva: 'bg-violet-100 text-violet-800',
}
const corRetorno = (retornou: boolean) => (retornou ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground')

// Tratativas pedagógicas e de monitoria: registro categorizado (tipo, motivo, retorno, desfecho) sobre um aluno ou
// a turma toda. Substitui os registros livres na planilha; permite filtrar os alunos críticos e o que precisa de retorno.
export default function Tratativas() {
  const { all } = useTratativas()
  const turmas = useTurmasEad().all
  const alunos = useAlunosEad().all
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const turmaDe = (t: Tratativa) => turmas.find((x) => x.id === t.turmaId)
  const alunoDe = (t: Tratativa) => alunos.find((a) => a.id === t.alunoId)
  const pendente = (t: Tratativa) => !!t.acompanharEm && t.acompanharEm <= HOJE && t.desfecho !== 'Resolvido'
  const colunas: Column<Tratativa>[] = [
    { header: 'Data', value: (t) => dataBr(t.quando.slice(0, 10)), className: 'tabular-nums' },
    { header: 'Turma', value: (t) => turmaDe(t)?.codigo ?? '—', filter: true, className: 'font-mono text-xs', search: true },
    {
      header: 'Aluno',
      value: (t) => (t.alunoId ? alunoDe(t)?.nome ?? '—' : 'Turma toda'),
      search: true,
      cell: (t) => (t.alunoId ? alunoDe(t)?.nome ?? '—' : <span className="flex items-center gap-1 text-muted-foreground"><Users className="size-3.5" /> Turma toda</span>),
    },
    { header: 'Tipo', value: (t) => t.tipo, filter: true, cell: (t) => <Badge variant="secondary" className={corTipo[t.tipo]}>{t.tipo}</Badge> },
    { header: 'Motivo', value: (t) => t.motivo, filter: true },
    {
      header: 'Descrição', value: (t) => t.descricao, search: true,
      // Botão que abre um dropdown com o texto completo
      cell: (t) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button type="button" size="xs" variant="outline" />}><Eye /> Visualizar</DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 p-3">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">Descrição</p>
            <p className="text-sm whitespace-normal">{t.descricao}</p>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
    { header: 'Retorno do aluno', value: (t) => (t.retorno ? 'Sim' : 'Não'), filter: true, cell: (t) => <Badge variant="secondary" className={corRetorno(t.retorno)}>{t.retorno ? 'Sim' : 'Não'}</Badge> },
    { header: 'Desfecho', value: (t) => t.desfecho, filter: true, cell: (t) => <Badge variant="secondary" className={corDesfecho[t.desfecho]}>{t.desfecho}</Badge> },
    {
      header: 'Acompanhar em',
      value: (t) => (t.acompanharEm ? dataBr(t.acompanharEm) : '—'),
      className: 'tabular-nums',
      cell: (t) => <span className={cn(pendente(t) && 'font-medium text-red-700')}>{t.acompanharEm ? dataBr(t.acompanharEm) : '—'}{pendente(t) && ' · pendente'}</span>,
    },
    { header: 'Responsável', value: (t) => t.responsavel, filter: true },
  ]
  const criticos = new Set(all.filter((t) => t.alunoId && t.desfecho === 'Alerta de desistência').map((t) => t.alunoId))
  return (
    <>
      <PageHeader title="Tratativas pedagógicas" actions={<Button onClick={() => navigate('/tratativas/nova')}><Plus /> Nova tratativa</Button>} />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardList} tom="blue" label="Tratativas registradas" value={String(all.length)} />
        <StatCard icon={CalendarClock} tom="amber" label="Retornos pendentes até hoje" value={String(all.filter(pendente).length)} />
        <StatCard icon={UserX} tom="red" label="Alunos em alerta de desistência" value={String(criticos.size)} />
        <StatCard icon={AlertTriangle} tom="gray" label="Sem retorno do aluno" value={String(all.filter((t) => !t.retorno).length)} />
      </div>
      <DataTable rows={[...all].sort((a, b) => b.quando.localeCompare(a.quando))} columns={colunas} searchPlaceholder="Buscar aluno, turma ou descrição…" />
      <NovaTratativaSheet open={pathname === '/tratativas/nova'} onOpenChange={(v) => !v && navigate('/tratativas')} />
    </>
  )
}

function NovaTratativaSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const db = useTratativas()
  const autor = useAutor()
  const turmas = useTurmasEad().all.filter((t) => t.inicio <= HOJE)
  const alunos = useAlunosEad().all
  const [turmaId, setTurmaId] = useState<string | null>(null)
  const [alunoId, setAlunoId] = useState<string>('todos')
  const [tipo, setTipo] = useState<Tratativa['tipo']>('Ativa')
  const [motivo, setMotivo] = useState<MotivoTratativa>('Baixo acesso')
  const [descricao, setDescricao] = useState('')
  const [retorno, setRetorno] = useState(false)
  const [desfecho, setDesfecho] = useState<DesfechoTratativa>('Acompanhar novamente')
  const [acompanharEm, setAcompanharEm] = useState('')
  // Protótipo: já abre preenchido com dados de exemplo.
  useEffect(() => {
    if (!open) return
    const t = turmas[0]
    setTurmaId(t?.id ?? null)
    setAlunoId(alunos.find((a) => a.turmaId === t?.id)?.id ?? 'todos')
    setTipo('Ativa')
    setMotivo('Baixo acesso')
    setDescricao('Mensagem no WhatsApp e e-mail: aluno sem acesso ao AVA há 9 dias.')
    setRetorno(false)
    setDesfecho('Acompanhar novamente')
    setAcompanharEm('2026-10-02')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const daTurma = alunos.filter((a) => a.turmaId === turmaId)
  const salvar = () => {
    if (!turmaId) return
    db.add({ quando: new Date().toISOString(), turmaId, alunoId: alunoId === 'todos' ? undefined : alunoId, tipo, motivo, descricao: descricao.trim(), retorno, desfecho, responsavel: autor, acompanharEm: acompanharEm || undefined })
    onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">Nova tratativa</SheetTitle>
          <SheetDescription className="sr-only">Registrar tratativa pedagógica ou de monitoria</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Turma <Req /></Label>
              <Select value={turmaId} onValueChange={(v) => (setTurmaId(v as string), setAlunoId('todos'))}>
                <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => { const t = turmas.find((x) => x.id === v); return t ? `${t.codigo} · ${t.curso}` : 'Selecione' }}</SelectValue></SelectTrigger>
                <SelectContent>{turmas.map((t) => <SelectItem key={t.id} value={t.id}>{t.codigo} · {t.curso}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Aluno <Req /></Label>
              <Select value={alunoId} onValueChange={(v) => setAlunoId(v as string)}>
                <SelectTrigger className="w-full"><SelectValue>{(v: string) => (v === 'todos' ? 'Turma toda' : alunos.find((a) => a.id === v)?.nome ?? 'Selecione')}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Turma toda (tratativa coletiva)</SelectItem>
                  {daTurma.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Tipo <Req /></Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as Tratativa['tipo'])}>
                <SelectTrigger className="w-full"><SelectValue>{(v: string) => (v === 'Ativa' ? 'Ativa (a equipe procurou)' : 'Receptiva (o aluno procurou)')}</SelectValue></SelectTrigger>
                <SelectContent><SelectItem value="Ativa">Ativa (a equipe procurou)</SelectItem><SelectItem value="Receptiva">Receptiva (o aluno procurou)</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Motivo <Req /></Label>
              <Select value={motivo} onValueChange={(v) => setMotivo(v as MotivoTratativa)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{motivosTratativa.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5"><Label>O que foi feito <Req /></Label><Textarea rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={retorno} onChange={(e) => setRetorno(e.target.checked)} /> O aluno deu retorno</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Desfecho <Req /></Label>
              <Select value={desfecho} onValueChange={(v) => setDesfecho(v as DesfechoTratativa)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{desfechosTratativa.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Acompanhar novamente em</Label><Input type="date" value={acompanharEm} onChange={(e) => setAcompanharEm(e.target.value)} /></div>
          </div>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={salvar}>Salvar tratativa</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
