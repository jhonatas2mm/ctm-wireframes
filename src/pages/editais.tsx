import { Contact, Eye, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DataTable, PageHeader, RowAction, type Column, type FilterDef, useConfirmar } from '@/components/wf'
import { useEditais, type Edital } from '@/lib/mock'
import { NovoEditalSheet } from './novo-edital-sheet'
import { DrContatosSheet } from './dr-contatos-sheet'
import { EditalDetalhes } from './edital-detalhes'
import { EditalSucesso } from './edital-sucesso'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// O edital não tem valor nem CH: tem áreas tecnológicas, cada uma com valor por hora e um DR vinculado.
const colunas: Column<Edital>[] = [
  { header: 'Nº', value: (e) => e.numero, search: true, className: 'font-mono text-xs' },
  { header: 'Vigência', value: (e) => `${e.vigenciaInicio} a ${e.vigenciaFim}`, className: 'tabular-nums' },
  { header: 'Áreas tecnológicas', value: (e) => e.areas.map((a) => a.area).join(', '), search: true, cell: (e) => <span className="block max-w-96 text-sm">{e.areas.map((a) => `${a.area} (${brl(a.valorHora)}/h · SENAI-${a.dr})`).join(' · ')}</span> },
  { header: 'DRs vinculados', value: (e) => e.drs.map((uf) => `SENAI-${uf}`).join(', '), search: true },
]

const filtros: FilterDef<Edital>[] = [
  { label: 'Área tecnológica', values: (e) => e.areas.map((a) => a.area) },
  { label: 'DR vinculado', values: (e) => e.drs.map((uf) => `SENAI-${uf}`) },
]

export default function Editais() {
  const { confirmar, dialogo } = useConfirmar()
  const { all, remove } = useEditais()
  const { id: sucessoId } = useParams()
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
            <Plus /> Novo edital
          </Button>
        }
      />
      <DataTable
        rows={all}
        columns={colunas}
        filters={filtros}
        searchPlaceholder="Buscar por número, área ou DR…"
        actions={(e) => (
          <>
            <RowAction label="Contatos dos DRs" icon={Contact} onClick={() => setContatos(e)} />
            <RowAction label="Visualizar" icon={Eye} onClick={() => setDetalhes(e)} />
            <RowAction
              label="Excluir"
              icon={Trash2}
              onClick={() => confirmar({ titulo: `Excluir o edital ${e.numero}?`, onConfirmar: () => { remove(e.id) } })}
            />
          </>
        )}
      />
      <DrContatosSheet ufs={contatos?.drs ?? null} titulo={contatos ? `Contatos dos DRs · ${contatos.numero}` : undefined} onClose={() => setContatos(null)} />
      <EditalDetalhes edital={detalhes} onClose={() => setDetalhes(null)} />
      <NovoEditalSheet open={pathname === '/editais/novo'} onOpenChange={(v) => !v && navigate('/editais')} onSaved={(id) => navigate(`/editais/${id}/sucesso`)} />
      <EditalSucesso edital={all.find((e) => e.id === sucessoId) ?? null} onClose={() => navigate('/editais')} onVer={(e) => (navigate('/editais'), setDetalhes(e))} />
      {dialogo}
    </>
  )
}
