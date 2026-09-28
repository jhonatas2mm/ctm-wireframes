import { Package, Plus } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EmptyState, PageHeader } from '@/components/wf'

// Portfólio de Produtos: aguardando a definição de cada produto.
export default function Produtos() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return (
    <>
      <PageHeader
        title="Portfólio de Produtos"
        actions={
          <Button onClick={() => navigate('/produtos/novo')}>
            <Plus /> Cadastrar produto
          </Button>
        }
      />
      <EmptyState icon={Package} title="Nenhum produto cadastrado" description="Os produtos cadastrados aparecem aqui." />
      <Sheet open={pathname === '/produtos/novo'} onOpenChange={(v) => !v && navigate('/produtos')}>
        <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Cadastrar produto</SheetTitle>
            <SheetDescription className="sr-only">Cadastrar produto</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <EmptyState icon={Package} title="Formulário a desenhar" description="Aguardando a definição dos campos do produto." />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
