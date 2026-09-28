import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MoreHorizontal, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Annotation, EmptyState, PageHeader } from '@/components/wf'
import { useItens } from '@/lib/mock'

const variant = { Ativo: 'default', Pendente: 'secondary', Arquivado: 'outline' } as const

export default function ListPage() {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('Todos')
  const navigate = useNavigate()
  const db = useItens()
  const itens = db.all

  const rows = useMemo(
    () =>
      itens.filter(
        (i) => (tab === 'Todos' || i.status === tab) && i.nome.toLowerCase().includes(q.toLowerCase()),
      ),
    [itens, q, tab],
  )

  return (
    <>
      <PageHeader
        title="Itens"
        description={`${rows.length} resultados`}
        actions={
          <Button nativeButton={false} render={<Link to="/itens/novo" />}>
            <Plus /> Novo item
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList>
            {['Todos', 'Ativo', 'Pendente', 'Arquivado'].map((t) => (
              <TabsTrigger key={t} value={t}>
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar…" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <Annotation>Clique na linha abre o detalhe. Busca filtra por nome, sem ir ao servidor.</Annotation>
      {rows.length === 0 ? (
        <EmptyState title="Nenhum item encontrado" description="Ajuste a busca ou os filtros." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Atualizado</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((i) => (
                <TableRow key={i.id} className="cursor-pointer" onClick={() => navigate(`/itens/${i.id}`)}>
                  <TableCell className="font-medium">{i.nome}</TableCell>
                  <TableCell className="hidden md:table-cell">{i.responsavel}</TableCell>
                  <TableCell>
                    <Badge variant={variant[i.status]}>{i.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{i.atualizadoEm}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Ações" />}>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/itens/${i.id}`)}>Abrir</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            const { id: _, ...rest } = i
                            db.add({ ...rest, nome: `${i.nome} (cópia)` })
                            toast('Item duplicado')
                          }}>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => {
                            db.remove(i.id)
                            toast('Item excluído')
                          }}>
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
