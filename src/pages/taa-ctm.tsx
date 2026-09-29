import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Eye, Lock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DataTable, PageHeader, Req, RowAction, type Column } from '@/components/wf'
import { aprovadaDe, taaDoEdital, nomeParte, useContratos, useDrs, useEditais, type Contrato } from '@/lib/mock'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'
import { cn } from '@/lib/utils'
import { SaldoTaa, TaaSheet } from './taa-sheet'
import { StatusTaaBadge, useFluxoTaa } from './taa-fluxo'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmt = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '—')

// TAAs da CTM (/taas-ctm): normalmente a CTM que ganhou o edital envia um TAA para cada DR específica, com os
// produtos em que ela é a aprovada; o Gestor da DR analisa. A CTM ajusta e reencaminha o que voltou, cancela o que
// enviou e analisa os TAAs que as DRs criaram com ela.
export default function TaaCtm() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const perfil = useProfile()
  const ctm = profileOf(perfil).dr?.sigla.replace('SENAI-', '') // Super admin: todas
  const { all } = useContratos()
  const rows = all.filter((c) => !ctm || c.dr === ctm)
  const fluxo = useFluxoTaa(ctm ? 'ctm' : 'admin')
  // Detalhes com rota própria (/taas-ctm/:id) para poder ser etapa de jornada.
  const { id: ver } = useParams()
  const setVer = (id: string | null) => navigate(id ? `/taas-ctm/${id}` : '/taas-ctm')
  const colunas: Column<Contrato>[] = [
    { header: 'Nº', value: (c) => c.numero, search: true, className: 'font-mono' },
    ...(!ctm ? [{ header: 'CTM', value: (c: Contrato) => `SENAI-${c.dr}`, filter: true }] : []),
    { header: 'DR', value: (c) => nomeParte(c.contratante), search: true, filter: true },
    { header: 'Criado por', value: (c) => (c.origem === 'CTM' ? 'CTM' : 'DR'), filter: true },
    { header: 'Saldo', value: (c) => (c.status === 'Aceito' ? 'sim' : '—'), className: 'text-right', cell: (c) => (c.status === 'Aceito' ? <SaldoTaa c={c} compacto /> : '—') },
    { header: 'Vigência', value: (c) => `${c.vigenciaInicio} a ${c.vigenciaFim}`, className: 'text-muted-foreground tabular-nums' },
    { header: 'Status', value: (c) => c.status, filter: true, cell: (c) => <StatusTaaBadge c={c} /> },
  ]
  const aberto = all.find((c) => c.id === ver) ?? null
  return (
    <>
      <PageHeader title="TAAs com as DRs" actions={ctm && <Button onClick={() => navigate('/taas-ctm/novo')}><Send /> Novo TAA</Button>} />
      <DataTable
        rows={rows}
        columns={colunas}
        searchPlaceholder="Buscar DR ou nº…"
        actions={(c) => (
          <>
            {fluxo.botoes(c)}
            <RowAction label="Visualizar" icon={Eye} onClick={() => (fluxo.abrir(c), setVer(c.id))} />
          </>
        )}
      />
      <TaaSheet taa={aberto} onClose={() => setVer(null)} rodape={aberto && fluxo.botoes(aberto, 'rodape')} />
      {ctm && <NovoTaaCtmSheet ctm={ctm} open={pathname === '/taas-ctm/novo'} onOpenChange={(v) => !v && navigate('/taas-ctm')} />}
      {fluxo.dialogos}
    </>
  )
}

// Novo TAA (CTM): edital → produtos em que a CTM é a aprovada → uma DR SENAI destinatária (um TAA por vez),
// com status "Encaminhado", que aparece para o Gestor da DR analisar.
function NovoTaaCtmSheet({ ctm, open, onOpenChange }: { ctm: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const db = useContratos()
  const editais = useEditais().all.filter((e) => e.cursos.some((c) => aprovadaDe(c) === ctm))
  const drs = useDrs().all.filter((d) => d.status === 'Ativo' && d.uf !== ctm)
  const [editalNum, setEditalNum] = useState<string | null>(null)
  const [nomes, setNomes] = useState<string[]>([])
  const [destinos, setDestinos] = useState<string[]>([])
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [valor, setValor] = useState('')
  const edital = editais.find((e) => e.numero === editalNum)
  const produtos = (edital?.cursos ?? []).filter((c) => aprovadaDe(c) === ctm)
  // Um TAA por edital para cada CTM × DR: DR que já tem TAA com esta CTM neste edital fica bloqueada
  const jaTem = (uf: string) => taaDoEdital(db.all, editalNum, ctm, uf)
  // Protótipo: já abre preenchido com dados de exemplo.
  useEffect(() => {
    if (!open) return
    const e = editais[0]
    setEditalNum(e?.numero ?? null)
    setNomes((e?.cursos ?? []).filter((c) => aprovadaDe(c) === ctm).slice(0, 2).map((c) => c.nome))
    setDestinos(['RS'].filter((uf) => drs.some((d) => d.uf === uf)))
    setInicio('2026-11-01')
    setFim('2027-10-31')
    setValor('40000000')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const valorNum = Number(valor.replace(/\D/g, '')) / 100
  const ano = new Date().getFullYear()
  const seq = db.all.filter((c) => c.numero.endsWith(`/${ano}`)).length + 1
  const numeros = destinos.map((_, i) => `${String(seq + i).padStart(3, '0')}/${ano}`)
  const escolhidos = produtos.filter((c) => nomes.includes(c.nome)).map(({ nome, area, modalidade, cargaHoraria, valor: v }) => ({ nome, area, modalidade, cargaHoraria, valor: v }))
  const enviar = () => {
    if (!destinos.length || !escolhidos.length) return
    const agora = new Date().toISOString()
    destinos.forEach((uf, i) => db.add({
      numero: numeros[i], contratante: uf, dr: ctm, edital: editalNum ?? undefined, produtos: escolhidos,
      vigenciaInicio: fmt(inicio), vigenciaFim: fmt(fim), valor: valorNum, status: 'Encaminhado', origem: 'CTM', enviadoEm: agora, historico: [{ quando: agora, texto: `Encaminhado ao SENAI-${uf}`, autor: 'CTM SENAI-' + ctm }],
    }))
    onOpenChange(false)
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-lg">Novo TAA</SheetTitle>
          <SheetDescription>Um TAA para cada DR escolhida. O Gestor de cada DR avalia (aceita ou recusa).</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>CTM</Label>
              <div className="flex h-9 items-center gap-1.5 rounded-md border bg-muted px-3 text-sm"><Lock className="size-3.5 text-muted-foreground" /> SENAI-{ctm}</div>
            </div>
            <div className="grid gap-1.5">
              <Label>Edital <Req /></Label>
              <Select value={editalNum} onValueChange={(v) => (setEditalNum(v as string), setNomes([]))}>
                <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => v ?? 'Selecione o edital'}</SelectValue></SelectTrigger>
                <SelectContent>{editais.map((e) => <SelectItem key={e.id} value={e.numero}>{e.numero}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <section className="grid gap-1.5">
            <Label>Produtos (em que a SENAI-{ctm} é a aprovada) <Req /></Label>
            <ul className="divide-y rounded-lg border bg-card">
              {produtos.map((c) => {
                const on = nomes.includes(c.nome)
                return (
                  <li key={c.nome}>
                    <label className={cn('flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50', on && 'bg-muted/60')}>
                      <input type="checkbox" checked={on} onChange={() => setNomes(on ? nomes.filter((n) => n !== c.nome) : [...nomes, c.nome])} />
                      <span className="min-w-0 flex-1"><span className="block font-medium">{c.nome}</span><span className="block text-xs text-muted-foreground">{c.area} · {c.modalidade} · {c.cargaHoraria} h</span></span>
                      <span className="text-xs tabular-nums">{brl(c.valor)}</span>
                    </label>
                  </li>
                )
              })}
              {!produtos.length && <li className="px-3 py-2 text-sm text-muted-foreground">Nenhum produto aprovado para esta CTM neste edital.</li>}
            </ul>
          </section>

          <section className="grid gap-1.5">
            <Label>DR destinatária <Req /></Label>
            {/* Um TAA por DR: escolhe uma só (as que já têm TAA desses produtos com esta CTM ficam indisponíveis) */}
            <Select value={destinos[0] ?? ''} onValueChange={(v) => v && setDestinos([String(v)])}>
              <SelectTrigger className="w-full"><SelectValue>{(v: string) => (v ? `SENAI-${v}` : 'Escolha a DR')}</SelectValue></SelectTrigger>
              <SelectContent>
                {drs.map((d) => {
                  const ja = jaTem(d.uf)
                  return <SelectItem key={d.uf} value={d.uf} disabled={!!ja}>SENAI-{d.uf}{ja && <span className="ml-2 text-xs text-muted-foreground">já tem o TAA {ja.numero} neste edital</span>}</SelectItem>
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">TAA é entre SENAI e SENAI. DRs que já têm TAA desses produtos com esta CTM ficam indisponíveis.</p>
          </section>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5"><Label>Início <Req /></Label><Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Fim <Req /></Label><Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Valor global (por TAA) <Req /></Label><Input inputMode="numeric" className="tabular-nums" value={valor && brl(valorNum)} onChange={(e) => setValor(e.target.value)} /></div>
          </div>
        </div>
        <SheetFooter className="flex-row items-center justify-between gap-4 border-t px-6 py-3">
          <span className="text-sm text-muted-foreground">{destinos.length ? `Nº ${numeros.join(', ')}` : 'Escolha a DR'}</span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button disabled={!destinos.length || !escolhidos.length} motivo={!escolhidos.length ? 'Selecione ao menos um produto' : 'Escolha a DR destinatária'} onClick={enviar}><Send /> Salvar e enviar TAA</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

