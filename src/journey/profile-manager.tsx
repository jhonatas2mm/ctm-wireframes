import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { canEdit } from '@/lib/json-file'
import { cn } from '@/lib/utils'
import { profileColors, type ProfileDef } from './profiles'

export function ProfileManager({
  open,
  onOpenChange,
  profiles,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  profiles: ProfileDef[]
  onSave: (next: ProfileDef[]) => void
}) {
  const [rows, setRows] = useState(profiles)
  useEffect(() => {
    if (open) setRows(profiles)
  }, [open, profiles])

  const set = (i: number, patch: Partial<ProfileDef>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  const names = rows.map((r) => r.name.trim())
  const invalid = names.some((n, i) => !n || names.indexOf(n) !== i)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark bg-black text-foreground">
        <DialogHeader>
          <DialogTitle>Perfis de acesso</DialogTitle>
          <DialogDescription>
            Salvos em profiles.json. Jornadas usam o nome do perfil — ao renomear, ajuste src/journeys.ts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="space-y-2 rounded-md border p-2">
              <div className="flex items-center gap-2">
                <span className="size-4 shrink-0 rounded-full" style={{ background: r.color }} />
                <Input
                  value={r.name}
                  disabled={!canEdit}
                  placeholder="Nome do perfil"
                  onChange={(e) => set(i, { name: e.target.value })}
                />
                {canEdit && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Excluir perfil"
                    onClick={() => setRows(rows.filter((_, j) => j !== i))}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
              {canEdit && (
                <div className="flex gap-1.5 pl-6">
                  {profileColors.map((c) => (
                    <button
                      key={c}
                      aria-label={`Cor ${c}`}
                      onClick={() => set(i, { color: c })}
                      className={cn('size-5 rounded-full ring-offset-2 ring-offset-black', r.color === c && 'ring-2 ring-white')}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setRows([...rows, { name: '', color: profileColors[rows.length % profileColors.length] }])
              }
            >
              <Plus /> Novo perfil
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {canEdit ? 'Cancelar' : 'Fechar'}
          </Button>
          {canEdit && (
            <Button
              disabled={invalid}
              onClick={() => {
                onSave(rows.map((r) => ({ ...r, name: r.name.trim() })))
                onOpenChange(false)
              }}
            >
              Salvar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
