import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/wf'

export default function NotFound() {
  return (
    <EmptyState
      title="Tela não encontrada"
      description="Essa rota ainda não foi desenhada."
      action={<Button variant="outline" nativeButton={false} render={<Link to="/dashboard" />}>Voltar ao início</Button>}
    />
  )
}
