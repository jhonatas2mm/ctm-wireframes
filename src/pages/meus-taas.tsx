import { Eye, Package, Plus } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { NovoTaSheet } from './novo-ta-sheet'
import { TaaDrSheet } from './taa-dr-sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, PageHeader, RowAction, type Column } from '@/components/wf'
import { useTaasDr, type StatusContrato, type TaaDr } from '@/lib/mock'

const statusVariant: Record<StatusContrato, 'default' | 'secondary' | 'outline'> = {
  Vigente: 'default',
  'Em elaboração': 'secondary',
  Encerrado: 'outline',
}

const colunas: Column<TaaDr>[] = [
  { header: 'TAA', value: (t) => t.numero, search: true, className: 'font-mono' },
  { header: 'DR parceira', value: (t) => `SENAI-${t.drParceira}`, search: true, filter: true },
  { header: 'Vigência', value: (t) => (t.vigenciaInicio === '—' ? '—' : `${t.vigenciaInicio} a ${t.vigenciaFim}`), className: 'text-muted-foreground' },
  { header: 'Status', value: (t) => t.status, filter: true, cell: (t) => <Badge variant={statusVariant[t.status]}>{t.status}</Badge> },
]

// Gestão de TAAs (perfil Supervisor): TAAs que a DR tem com outras DRs; cada TAA leva à gestão dos seus produtos.
export default function MeusTaas() {
  const { all, add } = useTaasDr()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [ver, setVer] = useState<TaaDr | null>(null)
  return (
    <>
      <PageHeader
        title="Gestão de TAAs"
        actions={
          <Button onClick={() => navigate('/meus-taas/novo')}>
            <Plus /> Novo TAA
          </Button>
        }
      />
      <DataTable
        rows={all}
        columns={colunas}
        searchPlaceholder="Buscar por TAA ou DR…"
        actions={(t) => (
          <>
            <RowAction label="Visualizar" icon={Eye} onClick={() => setVer(t)} />
            <RowAction label="Gestão de propostas" icon={Package} onClick={() => navigate(`/meus-taas/${t.id}/produtos`)} />
          </>
        )}
      />
      {/* Mesmo formulário do Novo TAA do DN; grava nos TAAs da DR (parceira = DR escolhida). */}
      <NovoTaSheet
        open={pathname === '/meus-taas/novo'}
        onOpenChange={(v) => !v && navigate('/meus-taas')}
        local="Gestão de TAAs"
        onSalvar={(d) => add({ numero: d.numero, drParceira: d.dr, vigenciaInicio: d.vigenciaInicio, vigenciaFim: d.vigenciaFim, cursos: 0, status: 'Em elaboração' })}
      />
      <TaaDrSheet taa={ver} onClose={() => setVer(null)} />
    </>
  )
}
