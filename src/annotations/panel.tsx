import { useEffect, useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { canEdit } from './store'
import { kinds, type Pin, type PinKind } from './types'

function PinForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { kind: PinKind; text: string }
  onSave: (kind: PinKind, text: string) => void
  onCancel: () => void
}) {
  const [kind, setKind] = useState<PinKind>(initial?.kind ?? 'requisito')
  const [text, setText] = useState(initial?.text ?? '')
  return (
    <form
      className="space-y-2 rounded-md border p-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (text.trim()) onSave(kind, text.trim())
      }}
    >
      <div className="flex gap-1">
        {(Object.keys(kinds) as PinKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={cn(
              'flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted',
              kind === k && 'bg-muted text-foreground',
            )}
          >
            <span className={cn('size-2 rounded-full', kinds[k].color)} />
            {kinds[k].label}
          </button>
        ))}
      </div>
      <Textarea
        autoFocus
        rows={4}
        placeholder="Descreva o requisito, regra ou observação…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit()
          if (e.key === 'Escape') onCancel()
        }}
      />
      <div className="flex justify-end gap-1">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={!text.trim()}>
          Salvar
        </Button>
      </div>
    </form>
  )
}

export function AnnotationPanel({
  screen,
  pins,
  orphans,
  drafting,
  active,
  onSelect,
  onCreate,
  onCancelDraft,
  onUpdate,
  onDelete,
  onClose,
}: {
  screen: string
  pins: (Pin & { n: number })[]
  orphans: string[]
  drafting: boolean
  active: string | null
  onSelect: (id: string | null) => void
  onCreate: (kind: PinKind, text: string) => void
  onCancelDraft: () => void
  onUpdate: (id: string, kind: PinKind, text: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [editing, setEditing] = useState<string | null>(null)
  useEffect(() => setEditing(null), [screen])

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l bg-black">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Anotações</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{screen}</p>
        </div>
        <Button size="icon-sm" variant="ghost" aria-label="Fechar" onClick={onClose}>
          <X />
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2 p-3">
          {drafting && <PinForm onSave={onCreate} onCancel={onCancelDraft} />}
          {pins.length === 0 && !drafting && (
            <p className="px-1 py-6 text-center text-xs text-muted-foreground">
              {canEdit ? 'Nenhuma anotação nesta tela. Use “Anotar” e clique num ponto do protótipo.' : 'Nenhuma anotação nesta tela.'}
            </p>
          )}
          {pins.map((p) =>
            editing === p.id ? (
              <PinForm
                key={p.id}
                initial={p}
                onSave={(k, t) => {
                  onUpdate(p.id, k, t)
                  setEditing(null)
                }}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div
                key={p.id}
                onClick={() => onSelect(active === p.id ? null : p.id)}
                className={cn(
                  'group cursor-pointer rounded-md border p-2 text-sm hover:bg-muted/50',
                  active === p.id && 'border-foreground/40 bg-muted/50',
                )}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full rounded-bl-none text-[10px] font-semibold text-white',
                      orphans.includes(p.id) ? 'bg-red-600' : kinds[p.kind].color,
                    )}
                  >
                    {p.n}
                  </span>
                  <span className="text-xs text-muted-foreground">{kinds[p.kind].label}</span>
                  {orphans.includes(p.id) && <span className="text-[10px] text-red-500">solto</span>}
                  {canEdit && (
                    <div className="ml-auto hidden gap-0.5 group-hover:flex">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        aria-label="Editar"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditing(p.id)
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        aria-label="Excluir"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Excluir esta anotação?')) onDelete(p.id)
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs whitespace-pre-wrap">{p.text}</p>
              </div>
            ),
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
