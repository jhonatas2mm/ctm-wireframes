import type { ReactNode } from 'react'
import { Download, FileText, Paperclip } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { instrumentoDe, nomeParte, saldoTaa, useProdutos, type Contrato } from '@/lib/mock'
import { StatusTaaBadge } from './taa-fluxo'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Saldo do TAA: valor global menos o executado (propostas aceitas entre o contratante e a CTM, nos produtos do TAA).
export function SaldoTaa({ c, compacto }: { c: Contrato; compacto?: boolean }) {
  const { all } = useProdutos()
  const { executado, saldo, pct } = saldoTaa(c, all)
  if (compacto) return <span className="tabular-nums">{brl(saldo)} <span className="text-xs text-muted-foreground">({100 - pct}%)</span></span>
  return (
    <div className="grid gap-1.5 rounded-lg border p-3">
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Executado</span><span className="tabular-nums">{brl(executado)} de {brl(c.valor)}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(100, pct)}%` }} /></div>
      <div className="flex justify-between text-sm"><span className="font-medium">Saldo</span><span className="font-semibold tabular-nums">{brl(saldo)}</span></div>
    </div>
  )
}

// Detalhes do TAA/contrato (side sheet): status, partes, saldo, produtos, documentos e histórico do fluxo.
// rodape: ações do fluxo para quem está vendo (vêm de useFluxoTaa).
export function TaaSheet({ taa, onClose, rodape }: { taa: Contrato | null; onClose: () => void; rodape?: ReactNode }) {
  const inst = taa ? instrumentoDe(taa.contratante) : 'TAA'
  return (
    <Sheet open={!!taa} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-3xl">
        {taa && (
          <>
            <SheetHeader className="border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg">{inst}</SheetTitle>
                <Badge variant="secondary" className="font-mono">Nº {taa.numero}</Badge>
                <StatusTaaBadge c={taa} />
              </div>
              <SheetDescription className="sr-only">Detalhes do {inst}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
              {(taa.status === 'Retornado para ajuste' || taa.status === 'Cancelado') && taa.motivo && (
                <div className={taa.status === 'Cancelado' ? 'rounded-lg border bg-muted/50 p-3 text-sm' : 'rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900'}>
                  <p className="mb-1 text-xs font-medium">{taa.status === 'Cancelado' ? 'Motivo do cancelamento' : 'Pedido de ajuste'}</p>
                  <p className="whitespace-pre-wrap">{taa.motivo}</p>
                </div>
              )}
              <dl className="grid grid-cols-2 gap-4">
                {([
                  ['Contratante', nomeParte(taa.contratante)],
                  ['CTM contratada', `SENAI-${taa.dr}`],
                  ['Origem', taa.origem === 'CTM' ? 'Enviado pela CTM' : 'Criado pela DR'],
                  ['Gestor solicitante', taa.gestor ? `${taa.gestor.nome} (${taa.gestor.cargo})` : '—'],
                  ['Vigência', `${taa.vigenciaInicio} a ${taa.vigenciaFim}`],
                  ['Valor global', brl(taa.valor)],
                ] as [string, ReactNode][]).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
              {taa.status === 'Aceito' && <SaldoTaa c={taa} />}

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Produtos <span className="font-normal text-muted-foreground">({taa.produtos?.length ?? 0}{taa.edital ? ` · ${taa.edital}` : ''})</span></h3>
                {taa.produtos?.length ? (
                  <ul className="divide-y rounded-lg border">
                    {taa.produtos.map((p) => (
                      <li key={p.nome} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                        <span className="min-w-0 flex-1"><span className="block font-medium">{p.nome}</span><span className="block text-xs text-muted-foreground">{p.area} · {p.modalidade} · {p.cargaHoraria} h</span></span>
                        <span className="tabular-nums">{brl(p.valor)}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">Nenhum produto.</p>}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Documentos</h3>
                <ul className="divide-y rounded-lg border">
                  <li className="flex items-center gap-3 px-3 py-2.5 text-sm">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">Termo preenchido · {taa.numero.replace('/', '-')}.docx</span>
                    <Button size="sm" variant="ghost" onClick={() => {}}><Download /> Baixar</Button>
                  </li>
                  <li className="flex items-center gap-3 px-3 py-2.5 text-sm">
                    <Paperclip className="size-4 text-muted-foreground" />
                    {taa.anexoAssinado ? (
                      <>
                        <span className="min-w-0 flex-1 truncate">Assinado · {taa.anexoAssinado}</span>
                        <Button size="sm" variant="ghost" onClick={() => {}}><Download /> Baixar</Button>
                      </>
                    ) : (
                      <span className="min-w-0 flex-1 text-muted-foreground">Assinado · {taa.status === 'Aceito' ? 'aguardando anexo' : 'depois do aceite'}</span>
                    )}
                  </li>
                </ul>
              </section>

              {!!taa.historico?.length && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Histórico</h3>
                  <ol className="relative space-y-3 border-l pl-5">
                    {taa.historico.map((h, n) => (
                      <li key={n} className="relative">
                        <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-background bg-foreground/60" />
                        <p className="text-sm">{h.texto}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">{new Date(h.quando).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}{h.autor && ` · ${h.autor}`}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>
            {rodape && <SheetFooter className="flex-row flex-wrap justify-end gap-2 border-t px-6 py-3">{rodape}</SheetFooter>}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
