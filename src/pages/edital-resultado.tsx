import { useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { DataTable, EmptyState, PageHeader, type Column } from '@/components/wf'
import { useEditais, type AreaEdital, type Edital } from '@/lib/mock'

// Resultado do edital de credenciamento, no formato do documento oficial: resumo por CTM e tabelas por modalidade
// (EaD Assíncrono; EaD Síncrono (Aprendizagem) / EaD Personalizado). Rota /editais/:id/resultado.
const valor = (n?: number) => (n ? n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—')
const dr = (uf?: string) => (uf ? `SENAI-${uf}` : '—')

// Resumo por CTM: em quantas áreas cada DR foi credenciado em cada modalidade
export function resumoPorCtm(e: Edital) {
  return e.drs.map((uf) => ({
    uf,
    assincrono: e.areas.filter((a) => a.dr === uf).length,
    sincrono: e.areas.filter((a) => a.sincrono?.dr === uf).length,
    personalizado: e.areas.filter((a) => a.personalizado?.dr === uf).length,
  }))
}

export function ResultadoEdital({ e }: { e: Edital }) {
  const assinc = e.areas.filter((a) => a.dr)
  const outras = e.areas.filter((a) => a.sincrono?.dr || a.personalizado?.dr)
  const col1: Column<AreaEdital & { id: string }>[] = [
    { header: 'Áreas tecnológicas', value: (a) => a.area, search: true, className: 'font-medium' },
    { header: 'EaD Assíncrono (Padrão)', value: (a) => dr(a.dr), filter: true, className: 'text-center' },
    { header: 'Valor (R$) (Hora/estudante)', value: (a) => valor(a.valorHora), className: 'text-right tabular-nums' },
  ]
  const col2: Column<AreaEdital & { id: string }>[] = [
    { header: 'Áreas tecnológicas', value: (a) => a.area, search: true, className: 'font-medium' },
    { header: 'EaD Síncrono (Aprendizagem)', value: (a) => dr(a.sincrono?.dr), filter: true, className: 'text-center' },
    { header: 'Valor (R$) (Hora/turma) até 50 estudantes', value: (a) => valor(a.sincrono?.valor), className: 'text-right tabular-nums' },
    { header: 'EaD Personalizado', value: (a) => dr(a.personalizado?.dr), filter: true, className: 'text-center' },
    { header: 'Valor (R$) (Hora/estudante)', value: (a) => valor(a.personalizado?.valor), className: 'text-right tabular-nums' },
  ]
  const comId = (xs: AreaEdital[]) => xs.map((a) => ({ ...a, id: a.area }))
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Resultado por CTM</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resumoPorCtm(e).map((r) => (
            <div key={r.uf} className="rounded-[1.25rem] border bg-card p-4">
              <p className="text-lg font-semibold">CTM {r.uf}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {r.assincrono > 0 && <li>EaD Assíncrono · <span className="font-semibold tabular-nums">{r.assincrono}</span> área(s) tecnológica(s)</li>}
                {r.sincrono > 0 && <li>EaD Síncrono (Aprendizagem) · <span className="font-semibold tabular-nums">{r.sincrono}</span> área(s)</li>}
                {r.personalizado > 0 && <li>EaD Personalizado · <span className="font-semibold tabular-nums">{r.personalizado}</span> área(s)</li>}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">EaD Assíncrono</h2>
        {assinc.length ? <DataTable rows={comId(assinc)} columns={col1} searchPlaceholder="Buscar área…" /> : <EmptyState title="Nenhuma área nesta modalidade" />}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">EaD Síncrono (Aprendizagem) / EaD Personalizado</h2>
        {outras.length ? <DataTable rows={comId(outras)} columns={col2} searchPlaceholder="Buscar área…" /> : <EmptyState title="Nenhuma área nestas modalidades" />}
      </section>
    </div>
  )
}

export default function EditalResultado() {
  const { id } = useParams()
  const e = useEditais().get(id)
  const crumbs = [{ label: 'Gestão de Editais', to: '/editais' }, { label: e ? `Resultado · ${e.numero}` : 'Resultado' }]
  if (!e) return (<><PageHeader title="Resultado do edital" breadcrumb={crumbs} /><EmptyState title="Edital não encontrado" /></>)
  return (
    <>
      <PageHeader
        title={<span className="flex items-center gap-3">Resultado do edital de credenciamento <Badge variant="secondary" className="font-mono">{e.numero}</Badge></span>}
        breadcrumb={crumbs}
        description={`Vigência ${e.vigenciaInicio} a ${e.vigenciaFim}`}
      />
      <ResultadoEdital e={e} />
    </>
  )
}
