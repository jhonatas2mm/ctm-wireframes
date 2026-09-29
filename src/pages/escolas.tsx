import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Pencil, Plus, Send, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CopiaTexto, DataTable, PageHeader, Req, RowAction, type Column, useConfirmar } from '@/components/wf'
import { HOJE, dataBr, useEscolas, type Escola } from '@/lib/mock'
import { useAutor } from '@/lib/autor'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'

// Escolas do DR solicitante: o DR cadastra; o DN valida ou recusa com motivo (Gestão de DRs). Recusada → o DR ajusta e
// reenvia. Gestor/Coordenador Escolar só veem as suas escolas e não cadastram. Rotas: /escolas · /escolas/nova.
type Form = Pick<Escola, 'nome' | 'codigo' | 'cidade' | 'responsavel' | 'email'>

export default function Escolas() {
  const db = useEscolas()
  const autor = useAutor()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { confirmar, dialogo } = useConfirmar()
  const perfil = profileOf(useProfile())
  const todas = perfil.name === 'Super admin'
  const uf = perfil.dr?.sigla.replace('SENAI-', '') ?? 'MG'
  const escolar = !!perfil.escolas
  const [editar, setEditar] = useState<Escola | null>(null)
  const linhas = db.all.filter((e) => (todas || e.dr === uf) && (!perfil.escolas || perfil.escolas.includes(e.nome)))
  const registro = (e: Escola | undefined, texto: string) => [{ quando: new Date().toISOString(), texto, autor }, ...(e?.historico ?? [])]
  const colunas: Column<Escola>[] = [
    { header: 'Escola', value: (e) => e.nome, search: true, className: 'font-medium' },
    { header: 'Código', value: (e) => e.codigo, search: true, cell: (e) => <Badge variant="secondary" className="font-mono">{e.codigo}</Badge> },
    ...(todas ? [{ header: 'DR', value: (e: Escola) => `SENAI-${e.dr}`, filter: true }] : []),
    { header: 'Cidade', value: (e) => e.cidade, filter: true },
    { header: 'Responsável', value: (e) => e.responsavel, search: true },
    { header: 'E-mail', value: (e) => e.email, className: 'text-muted-foreground', cell: (e) => <CopiaTexto texto={e.email} rotulo="Copiar e-mail" /> },
    {
      header: 'Validação do DN', value: (e) => e.status, filter: true,
      cell: (e) => (
        <span className="block">
          <Badge variant="outline">{e.status}</Badge>
          {e.status === 'Recusada' && e.motivo && <span className="mt-0.5 block max-w-64 text-xs text-muted-foreground">{e.motivo}</span>}
          {e.status === 'Validada' && e.validadaEm && <span className="mt-0.5 block text-xs text-muted-foreground">em {dataBr(e.validadaEm)}</span>}
        </span>
      ),
    },
  ]
  return (
    <>
      <PageHeader
        title="Escolas"
        description={escolar ? `Suas escolas: ${perfil.escolas!.join(', ')}` : undefined}
        actions={!escolar && !todas && <Button onClick={() => navigate('/escolas/nova')}><Plus /> Nova escola</Button>}
      />
      <DataTable
        rows={linhas}
        columns={colunas}
        searchPlaceholder="Buscar escola, código ou responsável…"
        actions={escolar || todas ? undefined : (e) => (
          <>
            <RowAction label={e.status === 'Recusada' ? 'Ajustar e reenviar' : 'Editar'} icon={e.status === 'Recusada' ? Send : Pencil} onClick={() => setEditar(e)} />
            <RowAction label="Excluir" icon={Trash2} disabled={e.status === 'Validada'} motivo="Escola validada pelo DN não pode ser excluída" onClick={() => confirmar({ titulo: `Excluir a escola ${e.nome}?`, acao: 'Excluir', onConfirmar: () => db.remove(e.id) })} />
          </>
        )}
      />
      <EscolaSheet
        open={pathname === '/escolas/nova' || !!editar}
        base={editar}
        onClose={() => (setEditar(null), pathname === '/escolas/nova' && navigate('/escolas'))}
        onSalvar={(f) => {
          if (editar) {
            // Editar uma escola recusada (ou validada) volta para a validação do DN
            db.update(editar.id, { ...f, status: 'Aguardando validação', motivo: undefined, validadaEm: undefined, historico: registro(editar, editar.status === 'Recusada' ? 'Ajustada e reenviada para validação do DN' : 'Editada: volta para validação do DN') })
          } else {
            db.add({ ...f, dr: uf, status: 'Aguardando validação', cadastradaEm: HOJE, historico: registro(undefined, 'Escola cadastrada; aguardando validação do DN') })
          }
        }}
      />
      {dialogo}
    </>
  )
}

function EscolaSheet({ open, base, onClose, onSalvar }: { open: boolean; base: Escola | null; onClose: () => void; onSalvar: (f: Form) => void }) {
  const vazio: Form = { nome: 'SENAI Juiz de Fora', codigo: 'MG-0106', cidade: 'Juiz de Fora', responsavel: 'Tatiana Brito', email: 'tatiana@senaimg.org.br' }
  const [f, setF] = useState<Form>(vazio)
  useEffect(() => { if (open) setF(base ? { nome: base.nome, codigo: base.codigo, cidade: base.cidade, responsavel: base.responsavel, email: base.email } : vazio) }, [open, base]) // eslint-disable-line react-hooks/exhaustive-deps
  const campo = (k: keyof Form, rotulo: string) => (
    <div className="grid gap-1.5"><Label>{rotulo} <Req /></Label><Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
  )
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="data-[side=bottom]:h-[95vh] gap-0 overflow-hidden rounded-t-xl p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">{base ? (base.status === 'Recusada' ? 'Ajustar e reenviar escola' : 'Editar escola') : 'Nova escola'}</SheetTitle>
          <SheetDescription>{base?.status === 'Recusada' && base.motivo ? `Motivo da recusa do DN: ${base.motivo}` : 'A escola vai para a validação do DN; só escolas validadas entram nas turmas.'}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto grid max-w-3xl gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2">
            {campo('nome', 'Nome da escola')}
            {campo('codigo', 'Código da escola')}
            {campo('cidade', 'Cidade')}
            {campo('responsavel', 'Responsável')}
            <div className="sm:col-span-2">{campo('email', 'E-mail do responsável')}</div>
          </div>
        </div>
        <SheetFooter className="flex-row justify-end border-t px-6 py-4">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => (onSalvar(f), onClose())}>{base?.status === 'Recusada' ? 'Salvar e reenviar escola' : 'Salvar escola'}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
