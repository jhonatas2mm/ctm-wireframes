import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/wf'
import { NovoProdutoSheet } from './novo-produto-sheet'

// A side sheet "Novo produto" tem rota própria (/dashboard/novo-produto) para poder ser etapa de jornada.
export default function Dashboard() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

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
      <NovoProdutoSheet
        open={pathname === '/dashboard/novo-produto'}
        onOpenChange={(v) => !v && navigate('/dashboard')}
      />
    </>
  )
}
