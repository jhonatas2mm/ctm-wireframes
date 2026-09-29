import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Download, Eye, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, PageHeader, RowAction, type Column } from '@/components/wf'
import { NovoTaSheet } from './novo-ta-sheet'
import { SaldoTaa, TaaSheet } from './taa-sheet'
import { StatusTaaBadge, useFluxoTaa } from './taa-fluxo'
import { instrumentoDe, nomeParte, useContratos, type Contrato } from '@/lib/mock'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const colunas = (todos: boolean): Column<Contrato>[] => [
  { header: 'Nº', value: (c) => c.numero, search: true, className: 'font-mono' },
  ...(todos ? [
    { header: 'Contratante', value: (c: Contrato) => nomeParte(c.contratante), search: true, filter: true },
    { header: 'Instrumento', value: (c: Contrato) => instrumentoDe(c.contratante), filter: true },
  ] : []),
  { header: 'CTM contratada', value: (c) => `SENAI-${c.dr}`, search: true, filter: true },
  { header: 'Origem', value: (c) => (c.origem === 'CTM' ? 'Recebido da CTM' : 'Criado pela DR'), filter: true },
  { header: 'Produtos', value: (c) => (c.produtos ?? []).map((p) => p.nome).join(', ') || '—', search: true, cell: (c) => <span className="line-clamp-2 max-w-64 text-sm">{(c.produtos ?? []).map((p) => p.nome).join(', ') || '—'}</span> },
  { header: 'Valor global', value: (c) => brl(c.valor), className: 'text-right tabular-nums' },
  { header: 'Saldo', value: (c) => (c.status === 'Aceito' ? 'sim' : '—'), className: 'text-right', cell: (c) => (c.status === 'Aceito' ? <SaldoTaa c={c} compacto /> : '—') },
  { header: 'Vigência', value: (c) => `${c.vigenciaInicio} a ${c.vigenciaFim}`, className: 'text-muted-foreground tabular-nums' },
  { header: 'Status', value: (c) => c.status, filter: true, cell: (c) => <StatusTaaBadge c={c} /> },
]

// TAAs com CTMs (DR solicitante): o Gestor recebe os TAAs enviados pelas CTMs e analisa (aceita, retorna para ajuste
// ou recusa); também pode criar o próprio (a CTM analisa). SESI: contrato. Super admin vê todos, sem ações.
export default function Dashboard() {
  const perfil = useProfile()
  const todos = perfil === 'Super admin'
  const contratante = todos ? null : profileOf(perfil).dr?.sigla.replace('SENAI-', '') ?? 'MG'
  const sesi = !!contratante?.startsWith('SESI-')
  const { all: base } = useContratos()
  const contratos = todos ? base : base.filter((c) => c.contratante === contratante)
  const fluxo = useFluxoTaa(todos ? 'admin' : 'contratante')
  // Detalhes com rota própria (/dashboard/:id) para poder ser etapa de jornada.
  const { id: verId } = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const ver = (c: Contrato) => (fluxo.abrir(c), navigate(`/dashboard/${c.id}`))
  const aberto = base.find((c) => c.id === verId) ?? null
  return (
    <>
      <PageHeader
        title={todos ? 'TAAs e contratos com CTMs' : sesi ? 'Contratos com CTMs' : 'TAAs com CTMs'}
        actions={!todos && <Button onClick={() => navigate('/dashboard/novo-ta')}><Plus /> {sesi ? 'Novo contrato' : 'Novo TAA'}</Button>}
      />
      <DataTable
        rows={contratos}
        columns={colunas(todos)}
        searchPlaceholder="Buscar nº, CTM ou produto…"
        actions={(c) => (
          <>
            {fluxo.botoes(c)}
            <RowAction label="Visualizar" icon={Eye} onClick={() => ver(c)} />
            <RowAction label="Baixar termo" icon={Download} onClick={() => {}} />
          </>
        )}
      />
      <TaaSheet taa={aberto} onClose={() => navigate('/dashboard')} rodape={aberto && fluxo.botoes(aberto, 'rodape')} />
      {!todos && <NovoTaSheet open={pathname === '/dashboard/novo-ta'} contratante={contratante ?? 'MG'} onOpenChange={(v) => !v && navigate('/dashboard')} />}
      {fluxo.dialogos}
    </>
  )
}
