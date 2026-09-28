import type React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Edital } from '@/lib/mock'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Detalhes do edital: um edital pode ter vários cursos, logo várias áreas e modalidades.
export function EditalDetalhes({ edital, onClose }: { edital: Edital | null; onClose: () => void }) {
  const e = edital
  const linhas: [string, React.ReactNode][] = e
    ? [
        ['CTM', e.ctm.join(', ')],
        ['Vigência', `${e.vigenciaInicio} a ${e.vigenciaFim}`],
        ['Áreas tecnológicas', [...new Set(e.cursos.map((c) => c.area))].join(', ')],
        ['Modalidades', [...new Set(e.cursos.map((c) => c.modalidade))].join(', ')],
        ['CH total', `${e.cargaHoraria} h`],
        ['Valor', brl(e.valor)],
        ['DRs credenciados', e.drs.map((uf) => `SENAI-${uf}`).join(', ')],
      ]
    : []
  return (
    <Dialog open={!!e} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edital {e?.numero}</DialogTitle>
        </DialogHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {linhas.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-2">
          <p className="text-sm font-medium">Cursos ({e?.cursos.length})</p>
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left text-xs">
              <tr>
                <th className="py-1 font-medium">Curso</th>
                <th className="font-medium">Área tecnológica</th>
                <th className="font-medium">Modalidade</th>
                <th className="text-right font-medium">CH</th>
                <th className="text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {e?.cursos.map((c) => (
                <tr key={c.nome} className="border-t">
                  <td className="py-1.5">{c.nome}</td>
                  <td>{c.area}</td>
                  <td>{c.modalidade}</td>
                  <td className="text-right tabular-nums">{c.cargaHoraria} h</td>
                  <td className="text-right tabular-nums">{brl(c.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
