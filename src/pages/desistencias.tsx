import { useState } from 'react'
import { CheckCircle2, Hourglass, RotateCcw, ShieldAlert, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DataTable, PageHeader, Req, RowAction, StatCard, type Column, useConfirmar } from '@/components/wf'
import { HOJE, dataBr, useConfirmacoesDesistencia, useTurmas, type Turma } from '@/lib/mock'
import { alunosDaTurma, idConfirmacao, type AlunoTurma, type MatriculaUc } from '@/lib/alunos-turma'
import { useAutor } from '@/lib/autor'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'

// Confirmação de desistências (DR solicitante): a desistência chega do Moodle e a DR faz a dupla checagem — confirma
// POR UC (a saída vale naquela UC e o aluno para de faturar nela no próximo ciclo da UC) ou contesta (falha de integração:
// segue matriculado e faturando). O aluno pode estar matriculado numa UC e desistente em outra.
type Linha = AlunoTurma & { turma: Turma; m: MatriculaUc; key: string }
const situacao = (a: Linha) => (a.m.confirmacao === 'Aguardando DR' ? 'Aguardando' : a.m.confirmacao === 'Confirmada' ? 'Confirmada' : 'Contestada')

export default function Desistencias() {
  const autor = useAutor()
  // Gestor/Coordenador Escolar: só as escolas vinculadas ao perfil
  const escolas = profileOf(useProfile()).escolas
  const { confirmar, dialogo } = useConfirmar()
  const db = useConfirmacoesDesistencia()
  const turmas = useTurmas().all.filter((t) => t.fase !== 'Cancelada')
  const [contestar, setContestar] = useState<Linha | null>(null)
  const [motivo, setMotivo] = useState('')
  // Desistências vindas do Moodle (inclui as já decididas, para desfazer)
  const linhas: Linha[] = turmas.flatMap((t) => alunosDaTurma(t, db.all).filter((a) => !escolas || escolas.includes(a.escola)).flatMap((a) => a.ucs.filter((m) => m.confirmacao).map((m) => ({ ...a, id: idConfirmacao(a.id, m.uc), turma: t, m, key: idConfirmacao(a.id, m.uc) }))))
  const registrar = (a: Linha, s: 'Confirmada' | 'Contestada', m?: string) => {
    db.remove(a.key)
    db.add({ id: a.key, situacao: s, em: HOJE, por: autor, motivo: m })
  }
  const colunas: Column<Linha>[] = [
    { header: 'Estudante', value: (a) => a.nome, search: true, cell: (a) => <span><span className="block font-medium">{a.nome}</span><span className="text-xs text-muted-foreground">CPF {a.cpf}</span></span> },
    { header: 'Turma', value: (a) => a.turma.codigo, filter: true, cell: (a) => <span><Badge variant="secondary" className="font-mono">{a.turma.codigo}</Badge><span className="mt-0.5 block text-xs text-muted-foreground">{a.turma.cursos.join(', ')} · CTM SENAI-MG</span></span> },
    { header: 'Escola', value: (a) => a.escola, filter: true },
    { header: 'UC', value: (a) => a.m.uc, filter: true, className: 'font-medium' },
    { header: 'Desistência no Moodle', value: (a) => dataBr(a.m.desde!), className: 'tabular-nums' },
    {
      header: 'Situação', value: situacao, filter: true,
      cell: (a) => (
        <span className="block">
          <Badge variant="outline">{situacao(a)}</Badge>
          {a.m.confirmacao !== 'Aguardando DR' && <span className="mt-0.5 block text-xs text-muted-foreground">{a.m.confirmacaoEm && dataBr(a.m.confirmacaoEm)}{a.m.confirmacaoPor && ` · ${a.m.confirmacaoPor}`}{a.m.motivoContestacao && ` · ${a.m.motivoContestacao}`}</span>}
        </span>
      ),
    },
  ]
  const n = (s: string) => linhas.filter((a) => situacao(a) === s).length
  return (
    <>
      <PageHeader title="Confirmação de desistências" description={escolas ? `Escolas: ${escolas.join(', ')}` : undefined} />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={Hourglass} tom="amber" label="Aguardando confirmação" value={String(n('Aguardando'))} hint="O estudante segue faturando até a DR confirmar" />
        <StatCard icon={CheckCircle2} tom="green" label="Confirmadas" value={String(n('Confirmada'))} />
        <StatCard icon={ShieldAlert} tom="gray" label="Contestadas" value={String(n('Contestada'))} hint="Falha de integração com o Moodle" />
      </div>
      <DataTable
        rows={linhas}
        columns={colunas}
        searchPlaceholder="Buscar estudante ou CPF…"
        actions={(a) => a.m.confirmacao === 'Aguardando DR' ? (
          <>
            <RowAction label="Confirmar" icon={CheckCircle2} onClick={() => confirmar({
              titulo: `Confirmar a desistência de ${a.nome} na UC ${a.m.uc}?`,
              descricao: `Vale só para esta UC, a partir de ${dataBr(a.m.desde!)}: o estudante deixa de faturar nela a partir do próximo ciclo da UC. Nas outras UCs segue como está.`,
              acao: 'Confirmar desistência',
              onConfirmar: () => registrar(a, 'Confirmada'),
            })} />
            <RowAction label="Contestar" icon={XCircle} onClick={() => (setMotivo('O estudante segue frequentando: falha de integração com o Moodle.'), setContestar(a))} />
          </>
        ) : (
          <RowAction label="Desfazer" icon={RotateCcw} onClick={() => confirmar({ titulo: `Desfazer a decisão sobre ${a.nome}? Volta a aguardar confirmação.`, acao: 'Desfazer', onConfirmar: () => db.remove(a.key) })} />
        )}
      />
      <Dialog open={!!contestar} onOpenChange={(v) => !v && setContestar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contestar a desistência</DialogTitle>
            <DialogDescription>{contestar?.nome} · UC {contestar?.m.uc} · {contestar?.turma.codigo}. O estudante segue matriculado e a CTM verifica a integração com o Moodle.</DialogDescription>
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
