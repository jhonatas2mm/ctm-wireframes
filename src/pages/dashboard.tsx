import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/wf'
import { useContratos, type StatusContrato } from '@/lib/mock'
import { NovoProdutoSheet } from './novo-produto-sheet'

const statusVariant: Record<StatusContrato, 'default' | 'secondary' | 'outline'> = {
  Vigente: 'default',
  'Em elaboração': 'secondary',
  Encerrado: 'outline',
}

// A side sheet "Novo produto" tem rota própria (/dashboard/novo-produto) para poder ser etapa de jornada.
export default function Dashboard() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { all: contratos } = useContratos()

  return (
    <>
      <PageHeader
        title="Dashboard"
        actions={
          <Button onClick={() => navigate('/dashboard/novo-produto')}>
            <Plus /> Novo produto
          </Button>
        }
      />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contratos</h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead>DR</TableHead>
                <TableHead>Vigência</TableHead>
                <TableHead className="text-right">Produtos</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratos.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono">{c.numero}</TableCell>
                  <TableCell>SENAI-{c.dr}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.vigenciaInicio === '—' ? '—' : `${c.vigenciaInicio} a ${c.vigenciaFim}`}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{c.produtos}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
      <NovoProdutoSheet
        open={pathname === '/dashboard/novo-produto'}
        onOpenChange={(v) => !v && navigate('/dashboard')}
      />
    </>
  )
}
