import { useState } from 'react'
import { Check, Mail, Phone, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAutor } from '@/lib/autor'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EmptyState, Req, useConfirmar } from '@/components/wf'
import { HOJE, dataBr, useContratos, useEditais, useEscolas, type Dr, type Escola } from '@/lib/mock'
import { StatusTaaBadge } from './taa-fluxo'

// Detalhes do DR (side sheet, perfil DN): contato, escolas (cadastradas pelo DR solicitante; o DN valida ou recusa com
// motivo), editais em que está credenciado e TAAs.
export function DrSheet({ dr, onClose }: { dr: Dr | null; onClose: () => void }) {
  const { all: editais } = useEditais()
  const { all: contratos } = useContratos()
  const meusEditais = dr ? editais.filter((e) => e.drs.includes(dr.uf)) : []
  // TAAs em que a DR é a CTM contratada
  const taas = dr ? contratos.filter((c) => c.dr === dr.uf) : []
  const escDb = useEscolas()
  const autor = useAutor()
  const { confirmar, dialogo } = useConfirmar()
  const [recusar, setRecusar] = useState<Escola | null>(null)
  const [motivo, setMotivo] = useState('')
  const escolas = dr ? escDb.all.filter((e) => e.dr === dr.uf).sort((a, b) => (a.status === 'Aguardando validação' ? -1 : 0) - (b.status === 'Aguardando validação' ? -1 : 0)) : []
  const pendentes = escolas.filter((e) => e.status === 'Aguardando validação').length
  const hist = (e: Escola, texto: string) => [{ quando: new Date().toISOString(), texto, autor }, ...(e.historico ?? [])]
  return (
    <Sheet open={!!dr} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-3xl">
        {dr && (
          <>
            <SheetHeader className="border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg">{dr.nome}</SheetTitle>
                <Badge variant={dr.status === 'Ativo' ? 'default' : 'outline'}>{dr.status}</Badge>
              </div>
              <SheetDescription>Região {dr.regiao}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Contato</h3>
                <ul className="grid gap-2 rounded-lg border p-3 text-sm bg-card">
                  <li className="flex items-center gap-2"><UserRound className="size-4 text-muted-foreground" /> {dr.responsavel}</li>
                  <li className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> {dr.email}</li>
                  <li className="flex items-center gap-2 tabular-nums"><Phone className="size-4 text-muted-foreground" /> {dr.telefone}</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Escolas <span className="font-normal text-muted-foreground">({escolas.length}{pendentes ? ` · ${pendentes} aguardando validação` : ''})</span></h3>
                {escolas.length ? (
                  <ul className="divide-y rounded-lg border bg-card">
                    {escolas.map((e) => (
                      <li key={e.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{e.nome} <span className="font-mono text-xs font-normal text-muted-foreground">{e.codigo}</span></span>
                          <span className="block text-xs text-muted-foreground">{e.cidade} · {e.responsavel} · cadastrada em {dataBr(e.cadastradaEm)}{e.status === 'Recusada' && e.motivo ? ` · ${e.motivo}` : ''}</span>
                        </span>
                        <Badge variant="outline" className="shrink-0">{e.status}</Badge>
                        {e.status === 'Aguardando validação' && (
                          <span className="flex shrink-0 gap-1">
                            <Button size="sm" variant="outline" onClick={() => confirmar({ titulo: `Validar a escola ${e.nome}?`, descricao: 'Validada, ela pode entrar nas turmas das CTMs.', acao: 'Validar', onConfirmar: () => escDb.update(e.id, { status: 'Validada', validadaEm: HOJE, motivo: undefined, historico: hist(e, 'Validada pelo DN') }) })}><Check /> Validar</Button>
                            <Button size="sm" variant="outline" onClick={() => (setMotivo('Código da escola não confere com o cadastro nacional.'), setRecusar(e))}><X /> Recusar</Button>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState title="Nenhuma escola cadastrada por este DR" />
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Editais credenciados <span className="font-normal text-muted-foreground">({meusEditais.length})</span></h3>
                {meusEditais.length ? (
                  <ul className="divide-y rounded-lg border bg-card">
                    {meusEditais.map((e) => {
                      const cursos = e.cursos.filter((c) => c.drs.includes(dr.uf))
                      return (
                        <li key={e.id} className="grid gap-1 px-3 py-2.5 text-sm">
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-mono font-medium">{e.numero}</span>
                            <span className="text-xs text-muted-foreground">{e.vigenciaInicio} a {e.vigenciaFim}</span>
                          </span>
                          <span className="flex flex-wrap gap-1">
                            {cursos.map((c) => <Badge key={c.nome} variant="outline" className="font-normal">{c.nome}</Badge>)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <EmptyState title="Não credenciado em nenhum edital" />
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">TAAs <span className="font-normal text-muted-foreground">({taas.length})</span></h3>
                {taas.length ? (
                  <ul className="divide-y rounded-lg border bg-card">
                    {taas.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                        <span className="font-mono font-medium">{t.numero}</span>
                        <span className="text-xs text-muted-foreground">{t.vigenciaInicio} a {t.vigenciaFim}</span>
                        <span className="ml-auto"><StatusTaaBadge c={t} /></span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState title="Nenhum TAA com este DR" />
                )}
              </section>
            </div>
          </>
        )}
      </SheetContent>
      <Dialog open={!!recusar} onOpenChange={(v) => !v && setRecusar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recusar a escola {recusar?.nome}?</DialogTitle>
            <DialogDescription>O DR solicitante vê o motivo, ajusta o cadastro e reenvia para validação.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5"><Label>Motivo <Req /></Label><Textarea rows={3} value={motivo} onChange={(ev) => setMotivo(ev.target.value)} /></div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRecusar(null)}>Cancelar</Button>
            <Button onClick={() => (recusar && escDb.update(recusar.id, { status: 'Recusada', motivo: motivo.trim(), historico: hist(recusar, `Recusada pelo DN: ${motivo.trim()}`) }), setRecusar(null))}>Recusar escola</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogo}
    </Sheet>
  )
}
