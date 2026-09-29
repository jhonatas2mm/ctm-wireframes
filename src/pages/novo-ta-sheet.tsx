import { Req } from '@/components/wf'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Check, Download, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useContratos } from '@/lib/mock'

const UFS = 'AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO'.split(' ')
const fmtData = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '____/____/______')
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const PARTES = ['SENAI Departamento Nacional', 'SENAI Departamento Regional'] as const

// Termo de Acordo Administrativo (TAA): contrato guarda-chuva entre o DN e um DR.
// O texto do modelo é fixo (não editável); só os campos variáveis são preenchidos.
// onSalvar: onde gravar (padrão: TAAs do DN). Na Gestão de TAAs da DR, grava nos TAAs da DR.
type DadosTaa = { numero: string; dr: string; vigenciaInicio: string; vigenciaFim: string; valor: number }
export function NovoTaSheet({ open, onOpenChange, onSalvar, local = 'Gestão de TAA' }: { open: boolean; onOpenChange: (v: boolean) => void; onSalvar?: (d: DadosTaa) => void; local?: string }) {
  const db = useContratos()
  const [dr, setDr] = useState<string | null>(null)
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [valor, setValor] = useState('')
  const ano = new Date().getFullYear()
  const seq = db.all.filter((c) => c.numero.endsWith(`/${ano}`)).length + 1
  const numero = `${String(seq).padStart(3, '0')}/${ano}`
  const valorNum = Number(valor.replace(/\D/g, '')) / 100
  // Protótipo: já abre preenchido com dados de exemplo.
  useEffect(() => {
    if (!open) return
    setDr('BA')
    setInicio('2026-10-01')
    setFim('2027-09-30')
    setValor('42000000')
  }, [open])
  // Etapa 1: dados. Etapa 2: TAA salvo; baixa o documento com os dados para enviar (assinatura fora do sistema).
  const [salvo, setSalvo] = useState<{ numero: string; dr: string; inicio: string; fim: string; valor: string } | null>(null)
  const arquivo = salvo ? `TAA-${salvo.numero.replace('/', '-')}.docx` : ''

  const reset = () => {
    setSalvo(null)
    setDr(null)
    setInicio('')
    setFim('')
    setValor('')
  }

  const field = 'grid gap-1.5'
  return (
    <Sheet open={open} onOpenChange={(v) => (v || reset(), onOpenChange(v))}>
      <SheetContent className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-4xl">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg">Novo Termo de Acordo Administrativo</SheetTitle>
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
                  <p className="text-xs text-muted-foreground">Baixe e envie para assinatura. Depois, anexe o TAA assinado em {local}.</p>
                </div>
                <Button type="button" size="sm" onClick={() => {}}>
                  <Download /> Baixar TAA
                </Button>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <TermoDoc {...salvo} className="mx-auto shadow-sm" />
              </div>
            </div>
          ) : (
          <form
            id="novo-ta"
            className="h-full space-y-8 overflow-y-auto px-6 py-6"
            onSubmit={(e) => {
              e.preventDefault()
              const dados = { numero, dr: dr ?? '—', vigenciaInicio: fmtData(inicio), vigenciaFim: fmtData(fim), valor: valorNum }
              if (onSalvar) onSalvar(dados)
              else db.add({ ...dados, status: 'Em elaboração' })
              setSalvo({ numero, dr: dr ?? '—', inicio, fim, valor: brl(valorNum) })
            }}
          >
            <Group n={1} title={<>Departamento Regional <Req /></>}>
              <Select value={dr} onValueChange={(v) => setDr(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string | null) => (v ? `SENAI-${v}` : 'Selecione o DR')}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {UFS.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      SENAI-{uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Group>

            <Group n={2} title="Vigência e valor">
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
                <Button type="submit" form="novo-ta" >
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
  numero,
  dr,
  inicio,
  fim,
  valor,
  className,
}: {
  numero: string
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
      <h4 className="text-center text-sm font-bold tracking-wide">TERMO DE ACORDO ADMINISTRATIVO Nº {numero}</h4>
      <p>
        <b>CLÁUSULA PRIMEIRA — DO OBJETO.</b> O presente termo formaliza o acordo administrativo do{' '}
        <Var>{dr ? `SENAI Departamento Regional de ${dr}` : 'Departamento Regional'}</Var> à oferta nacional de cursos,
        conforme os itinerários formativos vigentes, mediante vinculação posterior de produtos a este instrumento.
      </p>
      <p>
        <b>CLÁUSULA SEGUNDA — DA VIGÊNCIA.</b> Este termo vigora de <Var>{fmtData(inicio)}</Var> a{' '}
        <Var>{fmtData(fim)}</Var>.
      </p>
      <p>
        <b>CLÁUSULA TERCEIRA — DO VALOR.</b> O valor global estimado deste termo é de <Var>{valor || 'R$ ______'}</Var>,
        a ser executado conforme os produtos vinculados.
      </p>
      <p>
        <b>CLÁUSULA QUARTA — DAS ALTERAÇÕES.</b> Este termo não admite alteração após a assinatura. Mudanças de escopo
        devem ser feitas por novo instrumento.
      </p>
      <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
        {PARTES.map((parte) => (
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
