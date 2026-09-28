// Sem uso no momento: era aberta pelo botão "Novo TAA". Mantida para reaproveitar a busca de cursos.
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { EmptyState } from '@/components/wf'
import { useCursos } from '@/lib/mock'
import { cn } from '@/lib/utils'

// Busca ignora maiúsculas e acentos ("eletrotecnica" acha "Eletrotécnica").
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function NovoProdutoSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { all: cursos } = useCursos()
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const results = useMemo(() => {
    const t = norm(q.trim())
    return t ? cursos.filter((c) => norm(c.codigo).includes(t) || norm(c.nome).includes(t)) : cursos
  }, [cursos, q])
  const curso = cursos.find((c) => c.id === selected)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Novo produto</SheetTitle>
          <SheetDescription>Busque o curso pelo código ou nome.</SheetDescription>
          <div className="relative mt-3">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              className="pl-8"
              placeholder="Ex.: TEC-ELT-001 ou Eletrotécnica"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {results.length} {results.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
          </p>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          {results.length === 0 ? (
            <div className="p-4">
              <EmptyState title="Nenhum curso encontrado" description="Tente outro código ou parte do nome." />
            </div>
          ) : (
            <ul className="divide-y">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setSelected(c.id)}
                    className={cn(
                      'flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-muted/60',
                      selected === c.id && 'bg-muted',
                    )}
                  >
                    <span className="font-mono text-xs text-muted-foreground">{c.codigo}</span>
                    <span className="font-medium">{c.nome}</span>
                    <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge variant="secondary">{c.modalidade}</Badge>
                      {c.area} · {c.cargaHoraria}h
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        <SheetFooter className="border-t">
          <Button
            disabled={!curso}
            onClick={() => toast(`“${curso!.nome}” selecionado — próxima etapa a desenhar`)}
          >
            Selecionar curso
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
