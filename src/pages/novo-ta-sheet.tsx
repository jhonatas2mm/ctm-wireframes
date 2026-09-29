import { Req } from '@/components/wf'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Check, Download, FileText, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'
import { aprovadaDe, instrumentoDe, nomeParte, useContratos, useEditais, type ProdutoTaa } from '@/lib/mock'

const fmtData = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '____/____/______')
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
// Termo de Acordo Administrativo (TAA): quem contrata (DR solicitante ou DN) escolhe o edital e os PRODUTOS;
// a CTM do TAA é a aprovada no edital (menor custo) para esses produtos. Produtos de outra CTM vão em outro TAA.
// O texto do modelo é fixo (não editável); só os campos variáveis são preenchidos.
export function NovoTaSheet({ open, onOpenChange, contratante }: { open: boolean; onOpenChange: (v: boolean) => void; contratante: string }) {
  const db = useContratos()
  const editais = useEditais().all
  const [editalNum, setEditalNum] = useState<string | null>(null)
  const [nomes, setNomes] = useState<string[]>([]) // produtos escolhidos (nome do curso no edital)
  const edital = editais.find((e) => e.numero === editalNum)
  const produtos = edital?.cursos ?? []
  // CTM contratada = aprovada do 1º produto escolhido; os demais precisam ser da mesma CTM.
  const dr = produtos.find((c) => nomes.includes(c.nome)) ? aprovadaDe(produtos.find((c) => nomes.includes(c.nome))!) : null
  const escolhidos: ProdutoTaa[] = produtos.filter((c) => nomes.includes(c.nome)).map(({ nome, area, modalidade, cargaHoraria, valor }) => ({ nome, area, modalidade, cargaHoraria, valor }))
  // Produto que o contratante já tem contratado com a CTM aprovada (TAA não encerrado)
  const jaContratado = (nome: string, ctm: string) => db.all.find((c) => c.contratante === contratante && c.dr === ctm && c.status !== 'Encerrado' && c.produtos?.some((p) => p.nome === nome))
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [valor, setValor] = useState('')
  const ano = new Date().getFullYear()
  // SENAI ↔ SENAI = TAA; SESI = contrato (nº CT-…)
  const contrato = instrumentoDe(contratante) === 'Contrato'
  const numero = `${contrato ? 'CT-' : ''}${String(db.all.filter((c) => c.numero.startsWith('CT-') === contrato && c.numero.endsWith(`/${ano}`)).length + 1).padStart(3, '0')}/${ano}`
  const valorNum = Number(valor.replace(/\D/g, '')) / 100
  // Protótipo: já abre preenchido com dados de exemplo.
  useEffect(() => {
    if (!open) return
    // Exemplo: 1º edital com produto livre (aprovado para outra DR e ainda não contratado); marca os produtos livres dessa CTM.
    const livre = (c: (typeof produtos)[number]) => aprovadaDe(c) !== contratante && !jaContratado(c.nome, aprovadaDe(c))
    const e = editais.find((x) => x.cursos.some(livre)) ?? editais[0]
    const primeiro = e?.cursos.find(livre)
    setEditalNum(e?.numero ?? null)
    setNomes(primeiro ? e.cursos.filter((c) => livre(c) && aprovadaDe(c) === aprovadaDe(primeiro)).map((c) => c.nome) : [])
    setInicio('2026-10-01')
    setFim('2027-09-30')
    setValor('42000000')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  // Etapa 1: dados. Etapa 2: TAA salvo; baixa o documento com os dados para enviar (assinatura fora do sistema).
  const [salvo, setSalvo] = useState<{ numero: string; dr: string; inicio: string; fim: string; valor: string } | null>(null)
  const arquivo = salvo ? `TAA-${salvo.numero.replace('/', '-')}.docx` : ''

  const reset = () => {
    setSalvo(null)
    setEditalNum(null)
    setNomes([])
    setInicio('')
    setFim('')
    setValor('')
  }

  const field = 'grid gap-1.5'
  // Gestor solicitante (quem pede a contratação): vem do usuário logado; o cargo pode ser ajustado.
  const eu = profileOf(useProfile()).user
  const [gestor, setGestor] = useState('')
  const [cargo, setCargo] = useState('Coordenador')
  useEffect(() => { if (open) (setGestor(eu?.nome ?? ''), setCargo(eu?.cargo ?? 'Coordenador')) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Sheet open={open} onOpenChange={(v) => (v || reset(), onOpenChange(v))}>
      <SheetContent className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-4xl">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg">{contrato ? 'Novo contrato' : 'Novo Termo de Acordo Administrativo'}</SheetTitle>
            <Badge variant="secondary" className="font-mono">
              Nº {salvo?.numero ?? numero}
            </Badge>
          </div>
          {/* Barrinha de etapas: 1. Dados → 2. Documento */}
          <ol className="mt-3 grid grid-cols-2 gap-2">
            {['Dados', 'Documento'].map((t, i) => {
              const etapa = salvo ? 1 : 0
              return (
                <li key={t} className="grid gap-1.5">
                  <span className={cn('h-1 rounded-full transition-colors', i <= etapa ? 'bg-foreground' : 'bg-muted')} />
                  <span className={cn('flex items-center gap-1 text-xs', i === etapa ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                    {i < etapa ? <Check className="size-3" /> : `${i + 1}.`} {t}
                  </span>
                </li>
              )
            })}
          </ol>
          <SheetDescription className="sr-only">Novo TAA</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1">
          {salvo ? (
            <div className="h-full space-y-4 overflow-y-auto px-6 py-6">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded border bg-white text-neutral-400 shadow-sm">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{arquivo}</p>
                  <p className="text-xs text-muted-foreground">Baixe e envie à CTM para assinatura. Depois, anexe o TAA assinado em TAAs com CTMs.</p>
                </div>
                <Button type="button" size="sm" onClick={() => {}}>
                  <Download /> Baixar TAA
                </Button>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <TermoDoc {...salvo} contrato={contrato} contratante={contratante} produtos={escolhidos} className="mx-auto shadow-sm" />
              </div>
            </div>
          ) : (
          <form
            id="novo-ta"
            className="h-full space-y-8 overflow-y-auto px-6 py-6"
            onSubmit={(e) => {
              e.preventDefault()
              if (!dr || !escolhidos.length) return
              db.add({ numero, contratante, dr, edital: editalNum ?? undefined, produtos: escolhidos, gestor: { nome: gestor.trim(), cargo }, vigenciaInicio: fmtData(inicio), vigenciaFim: fmtData(fim), valor: valorNum, status: 'Em elaboração' })
              setSalvo({ numero, dr: dr ?? '—', inicio, fim, valor: brl(valorNum) })
            }}
          >
            <Group n={1} title={<>Edital e produtos <Req /></>}>
              <div className="grid grid-cols-2 gap-3">
                <div className={field}>
                  <Label>Contratante</Label>
                  <div className="flex h-9 items-center gap-1.5 rounded-md border bg-muted px-3 text-sm"><Lock className="size-3.5 text-muted-foreground" /> {nomeParte(contratante)}</div>
                </div>
                <div className={field}>
                  <Label>Edital <Req /></Label>
                  <Select value={editalNum} onValueChange={(v) => (setEditalNum(v as string), setNomes([]))}>
                    <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => v ?? 'Selecione o edital'}</SelectValue></SelectTrigger>
                    <SelectContent>{editais.map((e) => <SelectItem key={e.id} value={e.numero}>{e.numero} · {e.vigenciaInicio} a {e.vigenciaFim}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {/* Cada produto mostra a CTM aprovada (menor custo); só entram no mesmo TAA produtos da mesma CTM */}
              <ul className="divide-y rounded-lg border">
                {produtos.map((c) => {
                  const ctm = aprovadaDe(c)
                  const on = nomes.includes(c.nome)
                  const propria = ctm === contratante
                  const outra = !!dr && ctm !== dr
                  const ja = jaContratado(c.nome, ctm)
                  const bloqueado = propria || outra || !!ja
                  return (
                    <li key={c.nome}>
                      <label className={cn('flex items-center gap-3 px-3 py-2 text-sm', bloqueado ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/50', on && 'bg-muted/60')}>
                        <input type="checkbox" disabled={bloqueado} checked={on} onChange={() => setNomes(on ? nomes.filter((n) => n !== c.nome) : [...nomes, c.nome])} />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{c.nome}</span>
                          <span className="block text-xs text-muted-foreground">{c.area} · {c.modalidade} · {c.cargaHoraria} h · {brl(c.valor)}</span>
                        </span>
                        <span className="shrink-0 text-right text-xs">
                          <span className="block font-medium">SENAI-{ctm}</span>
                          <span className="block text-muted-foreground">{propria ? 'é a própria DR' : ja ? `já no ${ja.numero}` : outra ? 'outra CTM: outro TAA' : 'aprovada no edital'}</span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
              <div className={field}>
                <Label>CTM contratada</Label>
                <div className="flex h-9 items-center gap-1.5 rounded-md border bg-muted px-3 text-sm">
                  <Lock className="size-3.5 text-muted-foreground" /> {dr ? `SENAI-${dr} · aprovada no ${editalNum} para ${nomes.length} produto(s)` : 'Definida pelos produtos escolhidos'}
                </div>
              </div>
            </Group>

            <Group n={2} title={<>Gestor solicitante <Req /></>}>
              <div className="grid grid-cols-2 gap-3">
                <div className={field}>
                  <Label htmlFor="gestor">Nome</Label>
                  <Input id="gestor" value={gestor} onChange={(e) => setGestor(e.target.value)} />
                </div>
                <div className={field}>
                  <Label>Cargo</Label>
                  <Select value={cargo} onValueChange={(v) => setCargo(v as string)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{['Coordenador', 'Interlocutor', 'Gestor DN', 'Outro'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </Group>

            <Group n={3} title="Vigência e valor">
              <div className="grid grid-cols-3 gap-3">
                <div className={field}>
                  <Label htmlFor="inicio">Início <Req /></Label>
                  <Input id="inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                </div>
                <div className={field}>
                  <Label htmlFor="fim">Fim <Req /></Label>
                  <Input id="fim" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
                </div>
                <div className={field}>
                  <Label htmlFor="valor">Valor global <Req /></Label>
                  <Input
                    id="valor"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    className="font-medium tabular-nums"
                    value={valor && brl(valorNum)}
                    onChange={(e) => setValor(e.target.value)}
                  />
                </div>
              </div>
            </Group>

          </form>
          )}
        </div>

        <SheetFooter className="flex-row items-center justify-between border-t px-6 py-3">
          <span />
          <div className="flex gap-2">
            {salvo ? (
              <Button onClick={() => (reset(), onOpenChange(false))}>Concluir</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" form="novo-ta" disabled={!dr || !nomes.length}>
                  Salvar e avançar
                </Button>
              </>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function TermoDoc({
  contrato,
  numero,
  contratante,
  produtos,
  dr,
  inicio,
  fim,
  valor,
  className,
}: {
  contrato?: boolean
  numero: string
  contratante: string
  produtos: ProdutoTaa[]
  dr: string | null
  inicio: string
  fim: string
  valor: string
  className?: string
}) {
  return (
    <article
      className={cn(
        'w-[640px] max-w-full space-y-4 bg-white px-12 py-14 text-left font-serif text-[13px] leading-relaxed text-neutral-800 select-none',
        className,
      )}
    >
      <h4 className="text-center text-sm font-bold tracking-wide">{contrato ? 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS' : 'TERMO DE ACORDO ADMINISTRATIVO'} Nº {numero}</h4>
      <p>
        <b>CLÁUSULA PRIMEIRA — DO OBJETO.</b> O presente termo formaliza a contratação, pelo <Var>{nomeParte(contratante)}</Var>, do{' '}
        <Var>{dr ? `SENAI Departamento Regional de ${dr}` : 'Departamento Regional'}</Var> como CTM, para a execução de
        cursos a distância conforme o edital de credenciamento, mediante propostas comerciais posteriores, para os produtos:
      </p>
      <ul className="list-disc pl-6">
        {produtos.map((p) => <li key={p.nome}><Var>{p.nome}</Var> ({p.modalidade}, {p.cargaHoraria} h)</li>)}
      </ul>
      <p>
        <b>CLÁUSULA SEGUNDA — DA VIGÊNCIA.</b> Este termo vigora de <Var>{fmtData(inicio)}</Var> a{' '}
        <Var>{fmtData(fim)}</Var>.
      </p>
      <p>
        <b>CLÁUSULA TERCEIRA — DO VALOR.</b> O valor global estimado deste termo é de <Var>{valor || 'R$ ______'}</Var>,
        a ser executado conforme as propostas comerciais aceitas.
      </p>
      <p>
        <b>CLÁUSULA QUARTA — DAS ALTERAÇÕES.</b> Este termo não admite alteração após a assinatura. Mudanças de escopo
        devem ser feitas por novo instrumento.
      </p>
      <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
        {[nomeParte(contratante), dr ? `SENAI-${dr} (CTM)` : 'CTM'].map((parte) => (
          <div key={parte} className="border-t border-neutral-400 pt-2 font-semibold">
            {parte}
          </div>
        ))}
      </div>
    </article>
  )
}

function Group({ n, title, children }: { n: number; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] text-background">
          {n}
        </span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function Var({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-amber-100 px-1 font-sans font-medium text-amber-900">{children}</span>
}
