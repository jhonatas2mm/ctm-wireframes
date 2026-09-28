import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/wf'

export default function NotFound() {
  return (
    <EmptyState
      title="Tela não encontrada"
      description="Essa rota ainda não foi desenhada."
      action={<Button nativeButton={false} render={<Link to="/" />}>Voltar ao início</Button>}
    />
  )
}
