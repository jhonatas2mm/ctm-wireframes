import { useState } from 'react'
import { CheckCircle2, Hourglass, RotateCcw, ShieldAlert, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DataTable, PageHeader, Req, RowAction, StatCard, type Column, useConfirmar } from '@/components/wf'
import { HOJE, dataBr, useConfirmacoesDesistencia, useTurmas, type Turma } from '@/lib/mock'
import { alunosDaTurma, type AlunoTurma } from '@/lib/alunos-turma'
import { useAutor } from '@/lib/autor'

// Confirmação de desistências (DR solicitante): a desistência chega do Moodle e a DR faz a dupla checagem — confirma
// (a saída vale e o aluno para de faturar) ou contesta (falha de integração: o aluno segue matriculado e faturando).
type Linha = AlunoTurma & { turma: Turma }
const situacao = (a: AlunoTurma) => (a.confirmacao === 'Aguardando DR' ? 'Aguardando confirmação' : a.confirmacao === 'Confirmada' ? 'Confirmada' : 'Contestada')

export default function Desistencias() {
  const autor = useAutor()
  const { confirmar, dialogo } = useConfirmar()
  const db = useConfirmacoesDesistencia()
  const turmas = useTurmas().all.filter((t) => t.fase !== 'Cancelada')
  const [contestar, setContestar] = useState<Linha | null>(null)
  const [motivo, setMotivo] = useState('')
  // Desistências vindas do Moodle (inclui as já decididas, para desfazer)
  const linhas: Linha[] = turmas.flatMap((t) => alunosDaTurma(t, db.all).filter((a) => a.desistenciaMoodle).map((a) => ({ ...a, turma: t })))
  const registrar = (a: Linha, s: 'Confirmada' | 'Contestada', m?: string) => {
    db.remove(a.id)
    db.add({ id: a.id, situacao: s, em: HOJE, por: autor, motivo: m })
  }
  const colunas: Column<Linha>[] = [
    { header: 'Aluno', value: (a) => a.nome, search: true, cell: (a) => <span><span className="block font-medium">{a.nome}</span><span className="text-xs text-muted-foreground">CPF {a.cpf}</span></span> },
    { header: 'Turma', value: (a) => a.turma.codigo, filter: true, cell: (a) => <span><Badge variant="secondary" className="font-mono">{a.turma.codigo}</Badge><span className="mt-0.5 block text-xs text-muted-foreground">{a.turma.cursos.join(', ')} · CTM SENAI-MG</span></span> },
    { header: 'Escola', value: (a) => a.escola, filter: true },
    { header: 'Desistência no Moodle', value: (a) => dataBr(a.desistenciaMoodle!), className: 'tabular-nums' },
    {
      header: 'Situação', value: situacao, filter: true,
      cell: (a) => (
        <span className="block">
          <Badge variant="outline">{situacao(a)}</Badge>
          {a.confirmacao !== 'Aguardando DR' && <span className="mt-0.5 block text-xs text-muted-foreground">{a.confirmacaoEm && dataBr(a.confirmacaoEm)}{a.confirmacaoPor && ` · ${a.confirmacaoPor}`}{a.motivoContestacao && ` · ${a.motivoContestacao}`}</span>}
        </span>
      ),
    },
  ]
  const n = (s: string) => linhas.filter((a) => situacao(a) === s).length
  return (
    <>
      <PageHeader title="Confirmação de desistências" />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={Hourglass} tom="amber" label="Aguardando confirmação" value={String(n('Aguardando confirmação'))} hint="O aluno segue faturando até a DR confirmar" />
        <StatCard icon={CheckCircle2} tom="green" label="Confirmadas" value={String(n('Confirmada'))} />
        <StatCard icon={ShieldAlert} tom="gray" label="Contestadas" value={String(n('Contestada'))} hint="Falha de integração com o Moodle" />
      </div>
      <DataTable
        rows={linhas}
        columns={colunas}
        searchPlaceholder="Buscar aluno ou CPF…"
        actions={(a) => a.confirmacao === 'Aguardando DR' ? (
          <>
            <RowAction label="Confirmar" icon={CheckCircle2} onClick={() => confirmar({
              titulo: `Confirmar a desistência de ${a.nome}?`,
              descricao: `A saída vale a partir de ${dataBr(a.desistenciaMoodle!)}: o aluno deixa de faturar nas UCs seguintes.`,
              acao: 'Confirmar desistência',
              onConfirmar: () => registrar(a, 'Confirmada'),
            })} />
            <RowAction label="Contestar" icon={XCircle} onClick={() => (setMotivo('O aluno segue frequentando: falha de integração com o Moodle.'), setContestar(a))} />
          </>
        ) : (
          <RowAction label="Desfazer" icon={RotateCcw} onClick={() => confirmar({ titulo: `Desfazer a decisão sobre ${a.nome}? Volta a aguardar confirmação.`, acao: 'Desfazer', onConfirmar: () => db.remove(a.id) })} />
        )}
      />
      <Dialog open={!!contestar} onOpenChange={(v) => !v && setContestar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contestar a desistência</DialogTitle>
            <DialogDescription>{contestar?.nome} · {contestar?.turma.codigo}. O aluno segue matriculado e a CTM verifica a integração com o Moodle.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5"><Label>Motivo <Req /></Label><Textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} /></div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setContestar(null)}>Cancelar</Button>
            <Button onClick={() => (contestar && registrar(contestar, 'Contestada', motivo.trim()), setContestar(null))}>Salvar contestação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogo}
    </>
  )
}
