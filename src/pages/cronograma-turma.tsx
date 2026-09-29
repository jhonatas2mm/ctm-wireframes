import { useState } from 'react'
import { CalendarPlus, Layers, Merge, Pencil, Video, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { HOJE, agrupaveis, chUc, dataBr, diasEntre, type DataCalendario, type Turma, type UcTurma } from '@/lib/mock'
import { datasEncontros, diaCurto } from '@/lib/cronograma'
import { cn } from '@/lib/utils'

// Cronograma da turma como linha do tempo (substitui a planilha de cronograma da CTM): semanas no topo, módulos agrupando
// as UCs, uma barra por UC com os encontros presenciais e as aulas ao vivo, feriados nacionais e o dia de hoje.
// Clicar na UC abre o detalhe (o que na planilha eram as colunas da direita: CH, dias de estudo, encontros, ao vivo, agrupamento).

const SEM = 40 // largura de uma semana (px)
const somar = (iso: string, n: number) => new Date(Date.parse(iso) + n * 864e5).toISOString().slice(0, 10)
const segundaDe = (iso: string) => { const w = new Date(`${iso}T12:00:00Z`).getUTCDay(); return somar(iso, w === 0 ? -6 : 1 - w) }
const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const cores = [
  { barra: 'border-sky-300 bg-sky-100', forte: 'bg-sky-700', faixa: 'bg-sky-50' },
  { barra: 'border-violet-300 bg-violet-100', forte: 'bg-violet-700', faixa: 'bg-violet-50' },
  { barra: 'border-teal-300 bg-teal-100', forte: 'bg-teal-700', faixa: 'bg-teal-50' },
  { barra: 'border-amber-300 bg-amber-100', forte: 'bg-amber-700', faixa: 'bg-amber-50' },
]
const dataDia = (d: string) => `${dataBr(d)} · ${diaCurto(d)}`

type Props = {
  t: Turma
  turmas: Turma[]
  calendario: DataCalendario[]
  onEditarAula: (i: number, k: number) => void
  onRemoverAula: (i: number, k: number) => void
}

export function CronogramaLinhaDoTempo({ t, turmas, calendario, onEditarAula, onRemoverAula }: Props) {
  const [aberta, setAberta] = useState<{ i: number; k: number } | null>(null)
  const ucs = t.modulos.flatMap((m) => m.unidades).filter((u) => u.inicio && u.fim)
  if (!ucs.length) return <p className="rounded-[1.25rem] border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">Cronograma ainda não gerado.</p>
  const ini = segundaDe(ucs.map((u) => u.inicio).sort()[0])
  const fimTurma = ucs.map((u) => u.fim).sort().at(-1)!
  const semanas = Math.ceil((diasEntre(ini, fimTurma) + 1) / 7) + 1
  const largura = semanas * SEM
  const x = (d: string) => (diasEntre(ini, d) / 7) * SEM
  const cols = Array.from({ length: semanas }, (_, n) => somar(ini, n * 7))
  // Meses no topo: agrupa as semanas pela segunda-feira
  const faixasMes = cols.reduce<{ mes: string; n: number }[]>((acc, d) => {
    const mes = `${meses[Number(d.slice(5, 7)) - 1]}/${d.slice(2, 4)}`
    if (acc.at(-1)?.mes === mes) acc.at(-1)!.n++
    else acc.push({ mes, n: 1 })
    return acc
  }, [])
  const fimGrade = somar(ini, semanas * 7 - 1)
  const feriados = calendario.flatMap((c) => {
    const out: { d: string; nome: string }[] = []
    for (let d = c.inicio; d <= (c.fim ?? c.inicio); d = somar(d, 1)) if (d >= ini && d <= fimGrade) out.push({ d, nome: c.nome })
    return out
  })
  const hojeNaGrade = HOJE >= ini && HOJE <= fimGrade
  const totEnc = ucs.reduce((s, u) => s + (u.encontros ?? 0), 0)
  const totVivo = ucs.reduce((s, u) => s + u.aoVivo.length, 0)
  const ucAberta = aberta && t.modulos[aberta.i]?.unidades[aberta.k]

  // Fundo comum das linhas: feriados e hoje atravessam a grade inteira
  const fundo = (
    <>
      {feriados.map((f) => <span key={f.d} title={`${dataDia(f.d)} · ${f.nome}`} className="absolute inset-y-0 w-[6px] bg-[repeating-linear-gradient(45deg,var(--color-rose-200)_0_2px,transparent_2px_4px)]" style={{ left: x(f.d) }} />)}
      {hojeNaGrade && <span className="absolute inset-y-0 w-px bg-rose-500" style={{ left: x(HOJE) }} />}
    </>
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {([
          ['Início', dataDia(ucs.map((u) => u.inicio).sort()[0])],
          ['Término', dataDia(fimTurma)],
          ['Semanas', Math.ceil((diasEntre(ucs.map((u) => u.inicio).sort()[0], fimTurma) + 1) / 7)],
          ['UCs', ucs.length],
          ['Encontros presenciais', `${totEnc}${t.diaPresencial ? ` · ${t.diaPresencial.toLowerCase()}` : ''}`],
          ['Aulas ao vivo', totVivo],
        ] as [string, React.ReactNode][]).map(([k, v]) => (
          <div key={k}><span className="text-muted-foreground">{k}</span> <span className="font-semibold tabular-nums">{v}</span></div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[1.25rem] border bg-card">
        <div style={{ width: `calc(18rem + ${largura}px)` }}>
          {/* Cabeçalho: meses e semanas (dia da segunda-feira) */}
          <div className="sticky top-0 z-20 flex border-b bg-card">
            <div className="sticky left-0 z-20 flex w-72 shrink-0 items-end border-r bg-card px-4 pb-2 text-xs font-semibold text-muted-foreground">Unidade curricular</div>
            <div style={{ width: largura }}>
              <div className="flex">
                {faixasMes.map((f, n) => <div key={n} className="truncate border-l px-2 pt-2 text-xs font-semibold capitalize" style={{ width: f.n * SEM }}>{f.mes}</div>)}
              </div>
              <div className="relative flex">
                {cols.map((d) => (
                  <div key={d} className={cn('border-l py-1 text-center text-[11px] tabular-nums text-muted-foreground', HOJE >= d && HOJE < somar(d, 7) && 'font-semibold text-rose-600')} style={{ width: SEM }} title={`Semana de ${dataBr(d)}`}>{d.slice(8)}</div>
                ))}
              </div>
            </div>
          </div>

          {t.modulos.map((m, i) => {
            const cor = cores[i % cores.length]
            const uIni = m.unidades.map((u) => u.inicio).filter(Boolean).sort()[0]
            const uFim = m.unidades.map((u) => u.fim).filter(Boolean).sort().at(-1)
            return (
              <div key={i}>
                {/* Módulo */}
                <div className={cn('flex border-b', cor.faixa)}>
                  <div className={cn('sticky left-0 z-10 flex w-72 shrink-0 items-center gap-2 border-r px-4 py-2 text-sm font-semibold', cor.faixa)}>
                    <Layers className="size-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{t.cursos.length > 1 && `${m.curso} · `}{m.nome}</span>
                    <span className="text-xs font-normal tabular-nums text-muted-foreground">{m.unidades.reduce((s, u) => s + chUc(u), 0)} h</span>
                  </div>
                  <div className="relative h-9" style={{ width: largura }}>
                    {fundo}
                    {uIni && uFim && <span className={cn('absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full', cor.forte)} style={{ left: x(uIni), width: x(somar(uFim, 1)) - x(uIni) }} />}
                  </div>
                </div>
                {/* UCs do módulo */}
                {m.unidades.map((u, k) => {
                  const enc = datasEncontros(u, t.diaPresencial, calendario)
                  const juntas = agrupaveis(turmas, t, u)
                  const sel = aberta?.i === i && aberta?.k === k
                  return (
                    <div role="button" tabIndex={0} key={k} onClick={() => setAberta({ i, k })} onKeyDown={(e) => e.key === 'Enter' && setAberta({ i, k })} className={cn('group cursor-pointer flex w-full border-b text-left last:border-b-0 hover:bg-muted/40', sel && 'bg-muted/60')}>
                      <div className={cn('sticky left-0 z-10 w-72 shrink-0 border-r bg-card px-4 py-2 group-hover:bg-muted', sel && 'bg-muted')}>
                        <div className="flex items-center gap-1.5">
                          <span className="min-w-0 flex-1 truncate text-sm font-medium" title={u.nome}>{i + 1}.{k + 1} {u.nome}</span>
                          {juntas.length > 0 && <Merge className="size-3.5 shrink-0 text-violet-600" aria-label="Agrupável com outras turmas" />}
                        </div>
                        <div className="text-xs tabular-nums text-muted-foreground">{chUc(u)} h · {u.chEad} dist · {u.chPresencial} pres</div>
                      </div>
                      <div className="relative h-14" style={{ width: largura }}>
                        {fundo}
                        {u.inicio && u.fim && (
                          <span
                            className={cn('absolute top-1/2 h-7 -translate-y-1/2 rounded-md border', cor.barra)}
                            style={{ left: x(u.inicio), width: Math.max(8, x(somar(u.fim, 1)) - x(u.inicio)) }}
                            title={`${u.nome}: ${dataDia(u.inicio)} a ${dataDia(u.fim)}`}
                          />
                        )}
                        {enc.map((d) => <span key={d} title={`Encontro presencial · ${dataDia(d)}`} className={cn('absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45', cor.forte)} style={{ left: x(d) + SEM / 14 }} />)}
                        {u.aoVivo.map((a) => <span key={a.data} title={`Aula ao vivo · ${dataDia(a.data)} · ${a.inicio}–${a.fim}`} className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500 ring-2 ring-white" style={{ left: x(a.data) + SEM / 14 }} />)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-3 w-6 rounded border border-sky-300 bg-sky-100" /> Período da UC</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rotate-45 bg-sky-700" /> Encontro presencial</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-rose-500" /> Aula ao vivo</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-1.5 bg-[repeating-linear-gradient(45deg,var(--color-rose-300)_0_2px,transparent_2px_4px)]" /> Feriado nacional</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-px bg-rose-500" /> Hoje</span>
        <span className="flex items-center gap-1.5"><Merge className="size-3.5 text-violet-600" /> Agrupável com outra turma</span>
      </div>

      <DetalheUc
        t={t} uc={ucAberta || null} pos={aberta} turmas={turmas} calendario={calendario}
        onClose={() => setAberta(null)} onEditarAula={onEditarAula} onRemoverAula={onRemoverAula}
      />
    </div>
  )
}

// Detalhe da UC (side sheet): o que a planilha espalhava em colunas.
function DetalheUc({ t, uc: u, pos, turmas, calendario, onClose, onEditarAula, onRemoverAula }: {
  t: Turma; uc: UcTurma | null; pos: { i: number; k: number } | null; turmas: Turma[]; calendario: DataCalendario[]
  onClose: () => void; onEditarAula: (i: number, k: number) => void; onRemoverAula: (i: number, k: number) => void
}) {
  const enc = u ? datasEncontros(u, t.diaPresencial, calendario) : []
  const juntas = u ? agrupaveis(turmas, t, u) : []
  const m = pos ? t.modulos[pos.i] : undefined
  return (
    <Sheet open={!!u} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-xl">
        {u && pos && (
          <>
            <SheetHeader className="border-b px-6 py-4">
              <p className="text-xs text-muted-foreground">Módulo {pos.i + 1} · {m?.nome}</p>
              <SheetTitle className="text-lg">{pos.i + 1}.{pos.k + 1} {u.nome}</SheetTitle>
              <SheetDescription className="sr-only">Datas, carga horária, encontros presenciais e aulas ao vivo da UC</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
              <dl className="grid grid-cols-3 gap-4 rounded-[1.25rem] border bg-card p-4">
                {([
                  ['Início', dataDia(u.inicio)],
                  ['Término', dataDia(u.fim)],
                  ['Término no AVA', dataDia(u.fim)],
                  ['CH total', `${chUc(u)} h`],
                  ['CH a distância', `${u.chEad} h`],
                  ['CH presencial', `${u.chPresencial} h`],
                  ['Semanas', u.semanas ?? '—'],
                  ['Dias de estudo', u.semanas ? u.semanas * 5 : '—'],
                  ['Dia do presencial', t.diaPresencial ?? 'Segunda-feira'],
                ] as [string, React.ReactNode][]).map(([k, v]) => (
                  <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="text-sm tabular-nums">{v}</dd></div>
                ))}
              </dl>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Encontros presenciais <span className="font-normal text-muted-foreground">({enc.length})</span></h3>
                {enc.length ? (
                  <ol className="grid grid-cols-2 gap-2">
                    {enc.map((d, n) => (
                      <li key={d} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
                        <span className="w-6 text-xs font-semibold text-muted-foreground">{n + 1}º</span>
                        <span className="tabular-nums">{dataDia(d)}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="rounded-lg border border-dashed bg-card p-3 text-sm text-muted-foreground">UC 100% a distância: sem encontros presenciais.</p>
                )}
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Aula ao vivo <span className="font-normal text-muted-foreground">({u.aoVivo.length} de {u.aulasPrevistas ?? 0} prevista(s))</span></h3>
                  {!u.aoVivo.length && <Button size="sm" variant="outline" onClick={() => onEditarAula(pos.i, pos.k)}><CalendarPlus /> Adicionar</Button>}
                </div>
                {u.aoVivo.length ? (
                  <ul className="divide-y rounded-lg border bg-card">
                    {u.aoVivo.map((a) => (
                      <li key={a.data} className="flex items-center gap-2 px-3 py-2 text-sm">
                        <Video className="size-4 text-rose-500" />
                        <span className="flex-1 tabular-nums">{dataDia(a.data)} · {a.inicio}–{a.fim}</span>
                        <Button size="icon-sm" variant="ghost" aria-label="Editar aula ao vivo" onClick={() => onEditarAula(pos.i, pos.k)}><Pencil /></Button>
                        <Button size="icon-sm" variant="ghost" aria-label="Remover aula ao vivo" onClick={() => onRemoverAula(pos.i, pos.k)}><X /></Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-dashed bg-card p-3 text-sm text-muted-foreground">Nenhuma aula ao vivo marcada.</p>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Agrupamento</h3>
                {juntas.length ? (
                  <div className="space-y-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm">
                    <p className="flex items-center gap-1.5 font-medium text-violet-900"><Merge className="size-4" /> Mesma UC na mesma semana em outras turmas: a aula ao vivo pode ser única no Moodle.</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="bg-card font-mono">{t.codigo}</Badge>
                      {juntas.map((o) => <Badge key={o.id} variant="outline" className="bg-card font-mono">{o.codigo} · SENAI-{o.drContratante}</Badge>)}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma outra turma com esta UC na mesma semana.</p>
                )}
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
