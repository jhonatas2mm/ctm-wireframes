import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarPlus, Layers, Plus, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState, PageHeader, Req, useConfirmar } from '@/components/wf'
import { statusTurma, chUc, useProdutos, useTurmas, type AulaAoVivo } from '@/lib/mock'
import { PropostaSheet } from './proposta-sheet'
import { StatusTurmaBadge } from './oferta'

const dataBr = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '—')

// Detalhes da oferta (turma): dados, matriz curricular com CH/datas por UC e dias de aula ao vivo.
export default function OfertaDetalhe() {
  const { id } = useParams()
  const db = useTurmas()
  const navigate = useNavigate()
  const t = db.get(id)
  const { confirmar, dialogo } = useConfirmar()
  // UC em edição (módulo, UC) e rascunho da aula ao vivo; um dia por UC.
  const [editando, setEditando] = useState<{ i: number; k: number; aula: AulaAoVivo } | null>(null)
  const { all: propostas } = useProdutos()
  const [verProposta, setVerProposta] = useState(false)
  const crumbs = [{ label: 'Gestão da oferta', to: '/oferta' }, { label: t?.codigo ?? 'Oferta' }]
  if (!t) return (
    <>
      <PageHeader title="Oferta" breadcrumb={crumbs} />
      <EmptyState title="Oferta não encontrada" />
    </>
  )
  const ucs = t.modulos.flatMap((m) => m.unidades)
  const salvarAula = (i: number, k: number, aula: AulaAoVivo | null) =>
    db.update(t.id, { modulos: t.modulos.map((m, j) => (j !== i ? m : { ...m, unidades: m.unidades.map((u, l) => (l === k ? { ...u, aoVivo: aula ? [aula] : [] } : u)) })) })
  const ucEditada = editando && t.modulos[editando.i]?.unidades[editando.k]
  const ch = ucs.reduce((s, u) => s + chUc(u), 0)
  const ini = ucs.map((u) => u.inicio).filter(Boolean).sort()[0] ?? ''
  const fim = ucs.map((u) => u.fim).filter(Boolean).sort().at(-1) ?? ''
  const info: [string, React.ReactNode][] = [
    ['Status', <StatusTurmaBadge status={statusTurma(t)} />],
    ['Curso', t.cursos[0]],
    ['Proposta', <button type="button" className="font-mono underline underline-offset-2 hover:text-foreground/70" onClick={() => setVerProposta(true)}>{t.propostaNumero}</button>],
    ['DR contratante', `SENAI-${t.drContratante}`],
    ['Período', `${dataBr(ini)} a ${dataBr(fim)}`],
    ['CH total', <span className="font-semibold">{ch} h</span>],
    ['UCs', ucs.length],
    ['Aulas ao vivo', ucs.reduce((n, u) => n + u.aoVivo.length, 0)],
  ]
  return (
    <>
      <PageHeader title={<span className="flex items-center gap-3">Turma: {t.cursos.join(', ')} <Badge variant="secondary" className="font-mono">{t.codigo}</Badge></span>} breadcrumb={crumbs} actions={<Button onClick={() => navigate(`/oferta/proposta/${t.propostaId}/nova`)}><Plus /> Adicionar oferta</Button>} />
      <PropostaSheet proposta={verProposta ? propostas.find((p) => p.id === t.propostaId) ?? null : null} onClose={() => setVerProposta(false)} />
      <div className="space-y-6">
        <dl className="grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-3">
          {info.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="text-sm">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Matriz curricular</h2>
            {t.modulos.map((m, i) => (
              <div key={i} className="overflow-hidden rounded-lg border">
                <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2 text-sm font-medium">
                  <Layers className="size-4 text-muted-foreground" /> {t.cursos.length > 1 && <span className="text-muted-foreground">{m.curso} ·</span>} Módulo {i + 1} · {m.nome}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade curricular</TableHead>
                      <TableHead className="text-right">CH a distância</TableHead>
                      <TableHead className="text-right">CH presencial</TableHead>
                      <TableHead className="text-right">CH total</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Término</TableHead>
                      <TableHead>Aulas ao vivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {m.unidades.map((u, k) => (
                      <TableRow key={k}>
                        <TableCell>{i + 1}.{k + 1} {u.nome}</TableCell>
                        <TableCell className="text-right tabular-nums">{u.chEad} h</TableCell>
                        <TableCell className="text-right tabular-nums">{u.chPresencial} h</TableCell>
                        <TableCell className="text-right tabular-nums">{chUc(u)} h</TableCell>
                        <TableCell className="tabular-nums">{dataBr(u.inicio)}</TableCell>
                        <TableCell className="tabular-nums">{dataBr(u.fim)}</TableCell>
                        <TableCell>
                          {u.aoVivo[0] ? (
                            <span className="flex items-center gap-1 tabular-nums">
                              {dataBr(u.aoVivo[0].data)} · {u.aoVivo[0].inicio}–{u.aoVivo[0].fim}
                              <Button size="icon" variant="ghost" className="size-7" aria-label={`Editar aula ao vivo de ${u.nome}`} onClick={() => setEditando({ i, k, aula: u.aoVivo[0] })}><Pencil /></Button>
                              <Button size="icon" variant="ghost" className="size-7" aria-label={`Remover aula ao vivo de ${u.nome}`} onClick={() => confirmar({ titulo: `Remover a aula ao vivo de ${u.nome}?`, onConfirmar: () => salvarAula(i, k, null) })}><X /></Button>
                            </span>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7" onClick={() => setEditando({ i, k, aula: { data: u.inicio, inicio: '19:00', fim: '21:00' } })}><CalendarPlus /> Adicionar</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </section>

        </div>
      </div>
      <Dialog open={!!editando} onOpenChange={(v) => !v && setEditando(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aula ao vivo</DialogTitle>
            {ucEditada && <p className="text-sm text-muted-foreground">{ucEditada.nome} · {dataBr(ucEditada.inicio)} a {dataBr(ucEditada.fim)}</p>}
          </DialogHeader>
          {editando && (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Data <Req /></Label>
                <Input type="date" min={ucEditada?.inicio || undefined} max={ucEditada?.fim || undefined} value={editando.aula.data} onChange={(e) => setEditando({ ...editando, aula: { ...editando.aula, data: e.target.value } })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Início <Req /></Label>
                  <Input type="time" value={editando.aula.inicio} onChange={(e) => setEditando({ ...editando, aula: { ...editando.aula, inicio: e.target.value } })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Término <Req /></Label>
                  <Input type="time" value={editando.aula.fim} onChange={(e) => setEditando({ ...editando, aula: { ...editando.aula, fim: e.target.value } })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button onClick={() => (editando && salvarAula(editando.i, editando.k, editando.aula), setEditando(null))}>Salvar aula ao vivo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogo}
    </>
  )
}
