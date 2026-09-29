import { useMemo, useState, type ReactNode } from 'react'
import { Search, SlidersHorizontal, X, type LucideIcon } from 'lucide-react'
import { Popover } from '@base-ui/react/popover'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
// search: entra na busca por texto. Todos os filtros ficam dentro do botão Filtros (popover); fora dele, só a busca e
// as etiquetas dos filtros aplicados (removíveis). filter: true = aparece no topo da lista de filtros.
// Toda coluna com cabeçalho pode virar filtro pelo botão "Filtros" (gestão de filtros).
// filters (prop): filtros extras, sem coluna visível, que aceitam vários valores por linha (ex.: estados de um edital).
export type FilterDef<T> = { label: string; values: (row: T) => string[] }

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
  actions,
  filters: extra = [],
}: {
  rows: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  actions?: (row: T) => ReactNode // botões na última coluna (use RowAction)
  filters?: FilterDef<T>[]
}) {
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Todos os filtros possíveis (colunas com cabeçalho + extras); os marcados aparecem na barra.
  const all: FilterDef<T>[] = useMemo(
    () => [...[...columns.filter((c) => c.header)].sort((x, y) => Number(!!y.filter) - Number(!!x.filter)).map((c) => ({ label: c.header, values: (r: T) => [String(c.value(r))] })), ...extra],
    [columns, extra],
  )
  const defs = all
  const options = useMemo(
    () => Object.fromEntries(defs.map((d) => [d.label, [...new Set(rows.flatMap(d.values))].sort()])),
    [rows, defs],
  )

  const visible = useMemo(() => {
    const t = norm(q.trim())
    return rows.filter(
      (r) =>
        (!t || columns.some((c) => c.search && norm(String(c.value(r))).includes(t))) &&
        defs.every((d) => !filters[d.label] || d.values(r).includes(filters[d.label])),
    )
  }, [rows, columns, defs, q, filters])

  const nAtivos = Object.values(filters).filter(Boolean).length
  const active = q !== '' || nAtivos > 0
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
        {all.length > 0 && (
          <Popover.Root>
            <Popover.Trigger render={<Button variant="outline" />}>
              <SlidersHorizontal /> Filtros{nAtivos > 0 && <span className="text-muted-foreground tabular-nums">({nAtivos})</span>}
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner align="start" sideOffset={6} className="z-50">
                <Popover.Popup className="w-80 space-y-3 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md outline-none">
                  {all.map((d) => (
                    <div key={d.label} className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">{d.label}</span>
                      <Select value={filters[d.label] || ALL} onValueChange={(v) => setFilters({ ...filters, [d.label]: v === ALL ? '' : String(v) })}>
                        <SelectTrigger className={cn('w-full', filters[d.label] && 'border-foreground/40')}>
                          <SelectValue>{(v: string) => (v === ALL ? 'Todos' : v)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL}>Todos</SelectItem>
                          {options[d.label].map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  {nAtivos > 0 && (
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setFilters({})}>
                      <X /> Limpar filtros
                    </Button>
                  )}
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        )}
        {Object.entries(filters)
          .filter(([, v]) => v)
          .map(([label, v]) => (
            <Badge key={label} variant="secondary" className="gap-1 pr-1">
              {label}: {v}
              <button type="button" aria-label={`Remover filtro ${label}`} className="rounded p-0.5 hover:bg-foreground/10" onClick={() => setFilters(({ [label]: _, ...rest }) => rest)}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        {active && (
          <Button variant="ghost" size="sm" onClick={() => (setQ(''), setFilters({}))}>
            Limpar tudo
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
                {actions && <TableHead className="sticky right-0 z-10 w-px bg-muted text-right shadow-[-8px_0_8px_-8px_rgb(0_0_0/0.15)]">Ações</TableHead>}
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
                  {actions && (
                    <TableCell className="sticky right-0 z-10 w-px bg-background shadow-[-8px_0_8px_-8px_rgb(0_0_0/0.15)]" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-0.5">{actions(r)}</div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

/** Botão de ação de linha: ícone com tooltip. */
export function RowAction({
  label,
  icon: Icon,
  onClick,
  destructive,
  disabled,
  motivo,
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
  motivo?: string // por que está desabilitado (mostrado no tooltip)
}) {
  const botao = (
    <Button
      size="icon-sm"
      variant="outline"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(destructive && 'text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive')}
    >
      <Icon />
    </Button>
  )
  return (
    <Tooltip>
      {/* Botão desabilitado não recebe o mouse: o tooltip fica num invólucro para ainda mostrar o motivo */}
      {disabled ? (
        <TooltipTrigger render={<span tabIndex={0} className="inline-flex cursor-not-allowed" />}>{botao}</TooltipTrigger>
      ) : (
        <TooltipTrigger
          render={<Button size="icon-sm" variant="outline" aria-label={label} onClick={onClick} className={cn(destructive && 'text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive')} />}
        >
          <Icon />
        </TooltipTrigger>
      )}
      <TooltipContent>{disabled && motivo ? motivo : label}</TooltipContent>
    </Tooltip>
  )
}
