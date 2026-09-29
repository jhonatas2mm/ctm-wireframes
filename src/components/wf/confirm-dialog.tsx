import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Pedido = { titulo: string; descricao?: string; acao?: string; onConfirmar: () => void }

// Confirmação em modal (padrão do sistema para excluir/inativar; não usar confirm() nativo).
//   const { confirmar, dialogo } = useConfirmar()
//   confirmar({ titulo: 'Excluir X?', onConfirmar: () => remove(id) })  … e renderizar {dialogo}
export function useConfirmar() {
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const dialogo = (
    <Dialog open={!!pedido} onOpenChange={(v) => !v && setPedido(null)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{pedido?.titulo}</DialogTitle>
          {pedido?.descricao && <DialogDescription>{pedido.descricao}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setPedido(null)}>Cancelar</Button>
          <Button onClick={() => (pedido?.onConfirmar(), setPedido(null))}>{pedido?.acao ?? 'Excluir'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  return { confirmar: setPedido, dialogo }
}
