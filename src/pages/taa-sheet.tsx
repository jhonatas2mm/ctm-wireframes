import { useState, type ReactNode } from 'react'
import { Building2, Download, FileText, Paperclip } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AttachField } from '@/components/wf'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { nomeParte, saldoTaa, useContratos, useDrs, useEscolas, useProdutos, type Contrato } from '@/lib/mock'
import { StatusTaaBadge } from './taa-fluxo'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Executado do TAA: propostas aprovadas entre o contratante e a CTM nos produtos do TAA (o TAA não tem valor global).
export function SaldoTaa({ c, compacto }: { c: Contrato; compacto?: boolean }) {
  const { all } = useProdutos()
  const { executado } = saldoTaa(c, all)
  if (compacto) return <span className="tabular-nums">{brl(executado)}</span>
  return (
    <div className="flex justify-between rounded-lg border bg-card p-3 text-sm"><span className="text-muted-foreground">Executado (propostas aprovadas)</span><span className="font-semibold tabular-nums">{brl(executado)}</span></div>
  )
}

// Dados do DR (modal): CNPJ, contato, endereço e escolas (acordeão).
export function DadosDrDialog({ uf, onClose }: { uf: string | null; onClose: () => void }) {
  const dr = useDrs().all.find((d) => d.uf === uf)
  const escolas = useEscolas().all.filter((e) => e.dr === uf)
  return (
    <Dialog open={!!uf} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{uf ? nomeParte(uf) : ''}</DialogTitle>
          <DialogDescription>{dr?.regiao ? `Região ${dr.regiao}` : 'Dados do DR'}</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-3 rounded-[1.25rem] border bg-card p-4 text-sm">
          {([['CNPJ', dr?.cnpj ?? '—'], ['Telefone', dr?.telefone ?? '—'], ['Responsável', dr?.responsavel ?? '—'], ['E-mail', dr?.email ?? '—'], ['Endereço', dr?.endereco ?? '—']] as [string, string][]).map(([k, v]) => (
            <div key={k} className={k === 'Endereço' ? 'col-span-2' : ''}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="tabular-nums">{v}</dd></div>
          ))}
        </dl>
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Escolas <span className="font-normal text-muted-foreground">({escolas.length})</span></h3>
          <div className="max-h-72 divide-y overflow-y-auto rounded-lg border bg-card">
            {escolas.map((e) => (
              <details key={e.id} className="group px-3 py-2 text-sm">
                <summary className="flex cursor-pointer list-none items-center gap-2 font-medium">
                  <span className="text-muted-foreground transition-transform group-open:rotate-90">›</span>
                  <span className="flex-1">{e.nome}</span>
                  <Badge variant="outline">{e.status}</Badge>
                </summary>
                <dl className="mt-2 grid grid-cols-2 gap-2 pl-4 text-xs">
                  <div><dt className="text-muted-foreground">Código</dt><dd className="font-mono">{e.codigo}</dd></div>
                  <div><dt className="text-muted-foreground">Cidade</dt><dd>{e.cidade}</dd></div>
                  <div><dt className="text-muted-foreground">Responsável</dt><dd>{e.responsavel}</dd></div>
                  <div><dt className="text-muted-foreground">E-mail</dt><dd>{e.email}</dd></div>
                </dl>
              </details>
            ))}
            {!escolas.length && <p className="px-3 py-3 text-sm text-muted-foreground">Nenhuma escola cadastrada.</p>}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  )
}

// Detalhes do TAA/contrato (side sheet): status, partes, saldo, produtos, documentos e histórico do fluxo.
// rodape: ações do fluxo para quem está vendo (vêm de useFluxoTaa).
export function TaaSheet({ taa, onClose, rodape }: { taa: Contrato | null; onClose: () => void; rodape?: ReactNode }) {
  const inst = 'TAA'
  const db = useContratos()
  const [dadosDr, setDadosDr] = useState<string | null>(null)
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
              {(taa.status === 'Retornado' || taa.status === 'Cancelado') && taa.motivo && (
                <div className={taa.status === 'Cancelado' ? 'rounded-lg border bg-muted/50 p-3 text-sm' : 'rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900'}>
                  <p className="mb-1 text-xs font-medium">{taa.status === 'Cancelado' ? 'Motivo do cancelamento' : 'Pedido de ajuste'}</p>
                  <p className="whitespace-pre-wrap">{taa.motivo}</p>
                </div>
              )}
              <dl className="grid grid-cols-2 gap-4">
                {([
                  ['DR solicitante', <button type="button" className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground/70" onClick={() => setDadosDr(taa.contratante)}><Building2 className="size-3.5" /> {nomeParte(taa.contratante)}</button>],
                  ['CTM', `SENAI-${taa.dr}`],
                  ['Responsável', responsavelTaa(taa)],
                  ['Gestor solicitante', taa.gestor ? `${taa.gestor.nome} (${taa.gestor.cargo})` : '—'],
                  ['Vigência', `${taa.vigenciaInicio} a ${taa.vigenciaFim}`],
                ] as [string, ReactNode][]).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
              {taa.status === 'Aceito' && <SaldoTaa c={taa} />}
              <Button size="sm" variant="outline" onClick={() => setDadosDr(taa.contratante)}><Building2 /> Dados do DR</Button>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Produtos <span className="font-normal text-muted-foreground">({taa.produtos?.length ?? 0}{taa.edital ? ` · ${taa.edital}` : ''})</span></h3>
                {taa.produtos?.length ? (
                  <ul className="divide-y rounded-lg border bg-card">
                    {taa.produtos.map((p) => (
                      <li key={p.nome} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                        <span className="min-w-0 flex-1"><span className="block font-medium">{p.nome}</span><span className="block text-xs text-muted-foreground">{p.area} · {p.modalidade} · {p.cargaHoraria} h</span></span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">Nenhum produto.</p>}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Documentos do TAA <span className="font-normal text-muted-foreground">({taa.documentos?.length ?? 0})</span></h3>
                {!!taa.documentos?.length && (
                  <ul className="divide-y rounded-lg border bg-card">
                    {taa.documentos.map((d, i) => (
                      <li key={i} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                        <Paperclip className="size-4 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{d}</span>
                        <Button size="sm" variant="ghost" onClick={() => {}}><Download /> Baixar</Button>
                      </li>
                    ))}
                  </ul>
                )}
                <AttachField value={[]} onChange={(v) => { if (v.length) db.update(taa.id, { documentos: [...(taa.documentos ?? []), ...v.map((x) => ((taa.documentos ?? []).includes(x) ? `${(taa.documentos?.length ?? 0) + 1} - ${x}` : x))] }) }} label="Anexar documento" />
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Termo</h3>
                <ul className="divide-y rounded-lg border bg-card">
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
            <DadosDrDialog uf={dadosDr} onClose={() => setDadosDr(null)} />
            {rodape && <SheetFooter className="flex-row flex-wrap justify-end gap-2 border-t px-6 py-3">{rodape}</SheetFooter>}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// Responsável pelo TAA: quem criou/enviou (nome); nos dados antigos, a CTM (Gestor EAD) ou o Gestor do DR.
export const responsavelTaa = (c: Contrato) => c.responsavel ?? (c.origem === 'CTM' ? 'Juliana Pereira' : c.gestor?.nome ?? '—')
