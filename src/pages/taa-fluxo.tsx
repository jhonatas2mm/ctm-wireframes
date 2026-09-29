import { useState, type ReactNode } from 'react'
import { Check, ChevronDown, Paperclip, RotateCcw, Send, X, type LucideIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AttachField, Req, RowAction, useConfirmar } from '@/components/wf'
import { analisaDe, nomeParte, useContratos, vigenciaEncerrada, type Contrato, type Registro, type StatusContrato } from '@/lib/mock'
import { useAutor } from '@/lib/autor'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'

// Fluxo do TAA/contrato (status Encaminhado → Em análise → Retornado / Aceito / Cancelado), usado pela
// lista do contratante (Gestor da DR) e pela da CTM. Quem criou encaminha, ajusta e reencaminha ou cancela; a outra
// parte analisa: aceita, retorna para ajuste (motivo) ou cancela (motivo). Aceito: anexa o termo assinado.
// A CTM também muda o status direto, clicando no status da lista (statusMenu).
export type Papel = 'contratante' | 'ctm' | 'admin'

const cor: Record<StatusContrato, string> = {
  Encaminhado: 'bg-sky-100 text-sky-800',
  'Em análise': 'bg-amber-100 text-amber-800',
  'Retornado': 'bg-orange-100 text-orange-800',
  Aceito: 'bg-emerald-100 text-emerald-800',
  Cancelado: 'bg-muted text-muted-foreground',
}
export function StatusTaaBadge({ c }: { c: Contrato }) {
  return <Badge variant="secondary" className={cor[c.status]}>{c.status}{c.status === 'Aceito' && vigenciaEncerrada(c) ? ' · vigência encerrada' : ''}</Badge>
}

const statusesTaa: StatusContrato[] = ['Encaminhado', 'Em análise', 'Retornado', 'Aceito', 'Cancelado']
type Acao = { rotulo: string; icone: LucideIcon; principal?: boolean; fazer: () => void }
const iso = (br: string) => (br && br !== '—' ? br.split('/').reverse().join('-') : '')
const br = (i: string) => (i ? i.split('-').reverse().join('/') : '—')

export function useFluxoTaa(papel: Papel) {
  const db = useContratos()
  const autor = useAutor()
  const eu = profileOf(useProfile()).user
  const { confirmar, dialogo } = useConfirmar()
  const [motivo, setMotivo] = useState<{ c: Contrato; tipo: 'ajuste' | 'recusa' } | null>(null)
  const [texto, setTexto] = useState('')
  const [ajustar, setAjustar] = useState<Contrato | null>(null)
  const [aj, setAj] = useState({ inicio: '', fim: '', valor: '', obs: '' })
  const [anexar, setAnexar] = useState<Contrato | null>(null)
  const [anexo, setAnexo] = useState<string[]>([])

  const mudar = (c: Contrato, patch: Partial<Contrato>, txt: string) =>
    db.update(c.id, { ...patch, historico: [{ quando: new Date().toISOString(), texto: txt, autor } as Registro, ...(c.historico ?? [])] })
  const souAnalista = (c: Contrato) => papel !== 'admin' && analisaDe(c) === papel
  const souCriador = (c: Contrato) => papel !== 'admin' && analisaDe(c) !== papel
  const nome = (c: Contrato) => `TAA ${c.numero}`

  const acoes = (c: Contrato): Acao[] => {
    const a: Acao[] = []
    if (souAnalista(c) && (c.status === 'Encaminhado' || c.status === 'Em análise')) {
      a.push({ rotulo: 'Aceitar', icone: Check, principal: true, fazer: () => confirmar({
        titulo: `Aceitar o ${nome(c)}?`,
        descricao: papel === 'contratante' ? `Contratação da CTM SENAI-${c.dr}. Depois, o termo é assinado fora do sistema e anexado.` : `Contratação por ${nomeParte(c.contratante)}. Depois, o termo é assinado fora do sistema e anexado.`,
        acao: 'Aceitar',
        // Aceite pelo Gestor da DR registra quem é o Gestor solicitante
        onConfirmar: () => mudar(c, { status: 'Aceito', ...(papel === 'contratante' ? { gestor: { nome: eu?.nome ?? autor, cargo: eu?.cargo ?? 'Coordenador' } } : {}) }, 'Aceito'),
      }) })
      a.push({ rotulo: 'Retornar para ajuste', icone: RotateCcw, fazer: () => (setTexto(''), setMotivo({ c, tipo: 'ajuste' })) })
      a.push({ rotulo: 'Cancelar', icone: X, fazer: () => (setTexto(''), setMotivo({ c, tipo: 'recusa' })) })
    }
    if (souCriador(c) && c.status === 'Retornado')
      a.push({ rotulo: 'Ajustar e reencaminhar', icone: Send, principal: true, fazer: () => (setAj({ inicio: iso(c.vigenciaInicio), fim: iso(c.vigenciaFim), valor: '', obs: '' }), setAjustar(c)) })
    if (souCriador(c) && (c.status === 'Encaminhado' || c.status === 'Em análise' || c.status === 'Retornado'))
      a.push({ rotulo: 'Cancelar', icone: X, fazer: () => confirmar({ titulo: `Cancelar o ${nome(c)}?`, acao: 'Cancelar', onConfirmar: () => mudar(c, { status: 'Cancelado', motivo: 'Cancelado por quem criou.' }, 'Cancelado por quem criou') }) })
    if (papel !== 'admin' && c.status === 'Aceito' && !c.anexoAssinado)
      a.push({ rotulo: 'Anexar assinado', icone: Paperclip, fazer: () => (setAnexo([`${c.numero.replace('/', '-')}-assinado.pdf`]), setAnexar(c)) })
    return a
  }

  // Botões: na linha da tabela só ícones (RowAction, com tooltip); no rodapé dos detalhes, com texto.
  const botoes = (c: Contrato, onde: 'linha' | 'rodape' = 'linha', depois?: () => void): ReactNode =>
    acoes(c).map((x) => onde === 'linha' ? (
      <RowAction key={x.rotulo} label={x.rotulo} icon={x.icone} onClick={() => (x.fazer(), depois?.())} />
    ) : (
      <Button key={x.rotulo} size="sm" variant={x.principal ? 'default' : 'outline'} onClick={() => (x.fazer(), depois?.())}>
        <x.icone /> {x.rotulo}
      </Button>
    ))
  // Ao abrir os detalhes, quem analisa tira o TAA de Encaminhado para Em análise.
  const abrir = (c: Contrato) => { if (souAnalista(c) && c.status === 'Encaminhado') mudar(c, { status: 'Em análise' }, 'Análise iniciada') }

  const dialogos = (
    <>
      {dialogo}
      <Dialog open={!!motivo} onOpenChange={(v) => !v && setMotivo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{motivo?.tipo === 'ajuste' ? 'Retornar para ajuste' : 'Cancelar'} · {motivo && nome(motivo.c)}</DialogTitle>
            <DialogDescription>{motivo?.tipo === 'ajuste' ? 'Quem criou vê o motivo, ajusta e reencaminha.' : 'O TAA fica Cancelado; quem criou vê o motivo.'}</DialogDescription>
          </DialogHeader>
          <label className="grid gap-1 text-xs">
            <span className="text-muted-foreground">Motivo <Req /></span>
            <Textarea rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={motivo?.tipo === 'ajuste' ? 'O que precisa mudar? (vigência, valor, produtos…)' : 'Por que o TAA será cancelado?'} />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMotivo(null)}>Voltar</Button>
            <Button onClick={() => {
              if (!motivo) return
              const t = texto.trim()
              if (motivo.tipo === 'ajuste') mudar(motivo.c, { status: 'Retornado', motivo: t }, `Retornado para ajuste${t ? `: ${t}` : ''}`)
              else mudar(motivo.c, { status: 'Cancelado', motivo: t }, `Cancelado${t ? `: ${t}` : ''}`)
              setMotivo(null)
            }}>{motivo?.tipo === 'ajuste' ? 'Retornar para ajuste' : 'Cancelar TAA'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!ajustar} onOpenChange={(v) => !v && setAjustar(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajustar e reencaminhar · {ajustar && nome(ajustar)}</DialogTitle>
            {ajustar?.motivo && <DialogDescription>Pedido de ajuste: {ajustar.motivo}</DialogDescription>}
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Início</Label><Input type="date" value={aj.inicio} onChange={(e) => setAj({ ...aj, inicio: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Fim</Label><Input type="date" value={aj.fim} onChange={(e) => setAj({ ...aj, fim: e.target.value })} /></div>
            </div>
            <div className="grid gap-1.5"><Label>O que foi ajustado</Label><Textarea rows={3} value={aj.obs} onChange={(e) => setAj({ ...aj, obs: e.target.value })} placeholder="Ex.: início alterado para 01/02/2027" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAjustar(null)}>Cancelar</Button>
            <Button onClick={() => {
              if (!ajustar) return
              mudar(ajustar, { status: 'Encaminhado', vigenciaInicio: br(aj.inicio), vigenciaFim: br(aj.fim), motivo: undefined, enviadoEm: new Date().toISOString() }, `Ajustado e reencaminhado${aj.obs.trim() ? `: ${aj.obs.trim()}` : ''}`)
              setAjustar(null)
            }}><Send /> Reencaminhar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!anexar} onOpenChange={(v) => !v && setAnexar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Anexar assinado · {anexar && nome(anexar)}</DialogTitle></DialogHeader>
          <AttachField value={anexo} onChange={setAnexo} label="Anexar termo assinado" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAnexar(null)}>Cancelar</Button>
            <Button onClick={() => (anexar && mudar(anexar, { anexoAssinado: anexo[0] ?? `${anexar.numero.replace('/', '-')}-assinado.pdf` }, 'Termo assinado anexado'), setAnexar(null))}>Salvar anexo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
  // Status clicável: escolhe o novo status (fica no histórico)
  const statusMenu = (c: Contrato) => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button type="button" className="inline-flex items-center gap-1 rounded-md outline-none focus-visible:ring-2" aria-label={`Mudar status do ${nome(c)}`} />}>
        <StatusTaaBadge c={c} /><ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {statusesTaa.filter((st) => st !== c.status).map((st) => (
          <DropdownMenuItem key={st} onClick={() => mudar(c, { status: st }, `Status alterado para ${st}`)}>{st}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
  return { botoes, abrir, dialogos, statusMenu }
}
