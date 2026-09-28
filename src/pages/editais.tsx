import { Contact, Eye, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DataTable, PageHeader, RowAction, type Column, type FilterDef } from '@/components/wf'
import { useEditais, type Edital } from '@/lib/mock'
import { NovoEditalSheet } from './novo-edital-sheet'
import { DrContatosSheet } from './dr-contatos-sheet'
import { EditalDetalhes } from './edital-detalhes'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const colunas: Column<Edital>[] = [
  { header: 'Nº', value: (e) => e.numero, search: true, className: 'font-mono text-xs' },
  { header: 'CTM', value: (e) => e.ctm.join(', '), search: true },
  { header: 'Vigência', value: (e) => `${e.vigenciaInicio} a ${e.vigenciaFim}`, className: 'tabular-nums' },
  { header: 'CH', value: (e) => `${e.cargaHoraria} h`, className: 'text-right tabular-nums' },
  { header: 'Valor', value: (e) => brl(e.valor), className: 'text-right tabular-nums' },
]

const filtros: FilterDef<Edital>[] = [
  { label: 'CTM', values: (e) => e.ctm },
  { label: 'Área tecnológica', values: (e) => e.cursos.map((c) => c.area) },
  { label: 'Modalidade', values: (e) => e.cursos.map((c) => c.modalidade) },
  { label: 'DR credenciado', values: (e) => e.drs.map((uf) => `SENAI-${uf}`) },
]

export default function Editais() {
  const { all, remove } = useEditais()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [contatos, setContatos] = useState<Edital | null>(null)
  const [detalhes, setDetalhes] = useState<Edital | null>(null)
  return (
    <>
      <PageHeader
        title="Gestão de Editais"
        actions={
          <Button onClick={() => navigate('/editais/novo')}>
            <Plus /> Gerar novo edital
          </Button>
        }
      />
      <DataTable
        rows={all}
        columns={colunas}
        filters={filtros}
        searchPlaceholder="Buscar por número ou CTM…"
        actions={(e) => (
          <>
            <RowAction label="Contatos dos DRs" icon={Contact} onClick={() => setContatos(e)} />
            <RowAction label="Visualizar" icon={Eye} onClick={() => setDetalhes(e)} />
            <RowAction
              label="Excluir"
              icon={Trash2}
              destructive
              onClick={() => {
                if (!confirm(`Excluir o edital ${e.numero}?`)) return
                remove(e.id)
                toast(`Edital ${e.numero} excluído`)
              }}
            />
          </>
        )}
      />
      <DrContatosSheet ufs={contatos?.drs ?? null} titulo={contatos ? `Contatos dos DRs · ${contatos.numero}` : undefined} onClose={() => setContatos(null)} />
      <EditalDetalhes edital={detalhes} onClose={() => setDetalhes(null)} />
      <NovoEditalSheet open={pathname === '/editais/novo'} onOpenChange={(v) => !v && navigate('/editais')} />
    </>
  )
}
