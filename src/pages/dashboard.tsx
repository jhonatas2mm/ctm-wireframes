import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/wf'

export default function Dashboard() {
  return (
    <PageHeader
      title="Dashboard"
      actions={
        // TODO: apontar para a tela de cadastro de produto quando ela for desenhada.
        <Button onClick={() => toast('Tela “Novo produto” ainda não desenhada')}>
          <Plus /> Novo produto
        </Button>
      }
    />
  )
}
