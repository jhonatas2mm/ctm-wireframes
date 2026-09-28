import { useMemo, useState, type ReactNode } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { EmptyState } from './empty-state'

// Padrão de tabela do projeto: busca por texto + filtro por coluna + contador + "limpar filtros".
//
//   <DataTable rows={contratos} columns={[
//     { header: 'Contrato', value: (c) => c.numero, search: true },
//     { header: 'Status', value: (c) => c.status, filter: true, cell: (c) => <Badge>{c.status}</Badge> },
//   ]} />
//
// value: texto da coluna (usado na busca, no filtro e como célula padrão).
// search: entra na busca por texto. filter: vira um select com os valores existentes.
export type Column<T> = {
  header: string
  value: (row: T) => string | number
  cell?: (row: T) => ReactNode
  search?: boolean
  filter?: boolean
  className?: string
}

const ALL = '__all__'
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchPlaceholder = 'Buscar…',
  onRowClick,
}: {
  rows: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
}) {
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})

  const options = useMemo(
    () =>
      Object.fromEntries(
        columns
          .filter((c) => c.filter)
          .map((c) => [c.header, [...new Set(rows.map((r) => String(c.value(r))))].sort()]),
      ),
    [rows, columns],
  )

  const visible = useMemo(() => {
    const t = norm(q.trim())
    return rows.filter(
      (r) =>
        (!t || columns.some((c) => c.search && norm(String(c.value(r))).includes(t))) &&
        columns.every((c) => !filters[c.header] || String(c.value(r)) === filters[c.header]),
    )
  }, [rows, columns, q, filters])

  const active = q !== '' || Object.values(filters).some(Boolean)
  const hasSearch = columns.some((c) => c.search)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {hasSearch && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder={searchPlaceholder} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        )}
        {columns
          .filter((c) => c.filter)
          .map((c) => (
            <Select
              key={c.header}
              value={filters[c.header] || ALL}
              onValueChange={(v) => setFilters({ ...filters, [c.header]: v === ALL ? '' : String(v) })}
            >
              <SelectTrigger className={cn('min-w-36', filters[c.header] && 'border-foreground/40')}>
                <SelectValue>{(v: string) => (v === ALL ? `${c.header}: todos` : `${c.header}: ${v}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {options[c.header].map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        {active && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ('')
              setFilters({})
            }}
          >
            <X /> Limpar filtros
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {visible.length} de {rows.length}
        </span>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Nenhum resultado" description="Ajuste a busca ou os filtros." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.header} className={c.className}>
                    {c.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((r) => (
                <TableRow
                  key={r.id}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={onRowClick && (() => onRowClick(r))}
                >
                  {columns.map((c) => (
                    <TableCell key={c.header} className={c.className}>
                      {c.cell ? c.cell(r) : c.value(r)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
