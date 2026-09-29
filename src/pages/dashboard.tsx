import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Download, Eye, Paperclip, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AttachField, DataTable, PageHeader, RowAction, type Column, useConfirmar } from '@/components/wf'
import { NovoTaSheet } from './novo-ta-sheet'
import { TaaSheet, statusVariant } from './taa-sheet'
import { instrumentoDe, nomeParte, useContratos, type Contrato } from '@/lib/mock'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const colunas = (todos: boolean, ctm: boolean): Column<Contrato>[] => [
  { header: 'Contrato', value: (c) => c.numero, search: true, className: 'font-mono' },
  ...(todos || ctm ? [
    { header: 'Contratante', value: (c: Contrato) => nomeParte(c.contratante), search: true, filter: true },
    { header: 'Instrumento', value: (c: Contrato) => instrumentoDe(c.contratante), filter: true },
  ] : []),
  ...(ctm ? [] : [{ header: 'CTM contratada', value: (c: Contrato) => `SENAI-${c.dr}`, search: true, filter: true }]),
  { header: 'Valor global', value: (c) => brl(c.valor), className: 'text-right tabular-nums' },
  {
    header: 'Vigência',
    value: (c) => (c.vigenciaInicio === '—' ? '—' : `${c.vigenciaInicio} a ${c.vigenciaFim}`),
    className: 'text-muted-foreground',
  },
  {
    header: 'Status',
    value: (c) => c.status,
    filter: true,
    cell: (c) => <Badge variant={statusVariant[c.status]}>{c.status}</Badge>,
  },
]

// TAAs com CTMs: quem contrata (DN ou DR solicitante) cria e acompanha os TAAs em que é contratante.
// Super admin vê todos. A CTM (Gestor de contrato) vê, só para consulta, os TAAs/contratos em que é a contratada (Gestão de contratos).
export default function Dashboard() {
  const { confirmar, dialogo } = useConfirmar()
  const perfil = useProfile()
  const contratante = perfil === 'DN' ? 'DN' : profileOf(perfil).dr?.sigla.replace('SENAI-', '') ?? (perfil === 'Super admin' ? null : 'DN')
  const todos = perfil === 'Super admin'
  const ctm = perfil.startsWith('CTM:')
  const ufCtm = profileOf(perfil).dr?.sigla.replace('SENAI-', '')
  const { all: base, remove, update } = useContratos()
  const contratos = todos ? base : ctm ? base.filter((c) => c.dr === ufCtm) : base.filter((c) => c.contratante === contratante)
  // TAA em elaboração aguardando o upload do assinado
  const [anexar, setAnexar] = useState<Contrato | null>(null)
  const [anexo, setAnexo] = useState<string[]>([])
  // Detalhes com rota própria (/dashboard/:id) para poder ser etapa de jornada.
  const { id: verId } = useParams()
  const raiz = ctm ? '/gestao-contratos' : '/dashboard'
  const setVerId = (id: string | null) => navigate(id ? `${raiz}/${id}` : raiz)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        title={ctm ? 'Gestão de contratos' : 'TAAs com CTMs'}
        actions={
          !ctm && <Button onClick={() => navigate('/dashboard/novo-ta')}>
            <Plus /> Novo TAA
          </Button>
        }
      />
      <section className="space-y-3">
        <DataTable
          rows={contratos}
          columns={colunas(todos, ctm)}
          searchPlaceholder="Buscar contrato ou CTM…"
          actions={(c) => (
            <>
              <RowAction label="Visualizar" icon={Eye} onClick={() => setVerId(c.id)} />
              <RowAction label="Baixar modelo" icon={Download} onClick={() => {}} />
              {!ctm && c.status === 'Em elaboração' && (
                <RowAction label="Anexar TAA assinado" icon={Paperclip} onClick={() => (setAnexo([`TAA-${c.numero.replace("/", "-")}-assinado.pdf`]), setAnexar(c))} />
              )}
              {!ctm && <RowAction
                label="Excluir"
                icon={Trash2}
                onClick={() => confirmar({ titulo: `Excluir o contrato ${c.numero}?`, onConfirmar: () => { remove(c.id) } })}
              />}
            </>
          )}
        />
      </section>
      <TaaSheet taa={base.find((c) => c.id === verId) ?? null} onClose={() => setVerId(null)} onAnexar={ctm ? undefined : (c) => (setAnexo([`TAA-${c.numero.replace("/", "-")}-assinado.pdf`]), setAnexar(c))} />
      <Dialog open={!!anexar} onOpenChange={(v) => !v && setAnexar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Anexar TAA assinado · {anexar?.numero}</DialogTitle>
          </DialogHeader>
          <AttachField value={anexo} onChange={setAnexo} label="Anexar TAA assinado" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAnexar(null)}>Cancelar</Button>
            <Button
              onClick={() => {
                update(anexar!.id, { anexoAssinado: anexo[0] ?? `TAA-${anexar!.numero.replace('/', '-')}-assinado.pdf`, status: 'Vigente' })
                setAnexar(null)
              }}
            >
              Salvar anexo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Side sheet com rota própria para poder ser etapa de jornada. */}
      <NovoTaSheet open={pathname === '/dashboard/novo-ta'} contratante={contratante ?? 'DN'} onOpenChange={(v) => !v && navigate('/dashboard')} />
      {dialogo}
    </>
  )
}
