import { Package } from 'lucide-react'
import { EmptyState, PageHeader } from '@/components/wf'

// Gestão de Produtos: aguardando a definição de cada produto.
export default function Produtos() {
  return (
    <>
      <PageHeader title="Gestão de Produtos" />
      <EmptyState icon={Package} title="Tela a desenhar" description="Aguardando a definição dos produtos." />
    </>
  )
}
