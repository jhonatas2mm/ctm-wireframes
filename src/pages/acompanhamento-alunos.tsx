import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, FileDown, ReceiptText, UserMinus, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, EmptyState, StatCard, type Column } from '@/components/wf'
import { HOJE, dataBr, useTurmas, type UcTurma } from '@/lib/mock'
import { alunosDaTurma, cicloBr, ciclosDe, fatura, janelaCiclo, situacaoNaUc, ucNoCiclo, type AlunoTurma } from '@/lib/alunos-turma'
import { cn } from '@/lib/utils'

// Relatório geral de acompanhamento dos alunos (substitui a planilha da CTM): por turma e ciclo financeiro, cada aluno com
// contato, status geral, saída formalizada e monitor; por UC do ciclo, a situação (ativo, suspenso, não integrado) e se
// fatura. É a base do nº de alunos do Relatório de cobrança. Turma e ciclo pela URL (?turma=&ciclo=).
const curto = (iso: string) => iso.slice(8) + '/' + iso.slice(5, 7)
const tomSituacao = { Ativo: 'text-foreground', Suspenso: 'text-amber-700', 'Não integrado nesta UC': 'text-muted-foreground' }

export function AcompanhamentoAlunos() {
  const [params, setParams] = useSearchParams()
  const turmas = useTurmas().all.filter((t) => t.fase !== 'Cancelada' && (t.escolas ?? []).length)
  const t = turmas.find((x) => x.id === params.get('turma')) ?? turmas[0]
  const ciclos = t ? ciclosDe([t]) : []
  const ciclo = ciclos.find((c) => c === params.get('ciclo')) ?? ciclos.find((c) => c >= HOJE.slice(0, 7)) ?? ciclos[0]
  const set = (k: string, v: string) => setParams((p) => { const n = new URLSearchParams(p); n.set('aba', 'acompanhamento'); n.set(k, v); if (k === 'turma') n.delete('ciclo'); return n }, { replace: true })
  if (!t || !ciclo) return <EmptyState title="Nenhuma turma com escolas e cronograma" />

  const alunos = alunosDaTurma(t)
  const ucs: UcTurma[] = t.modulos.flatMap((m) => m.unidades).filter((u) => ucNoCiclo(u, ciclo))
  const j = janelaCiclo(ciclo)
  const faturas = alunos.reduce((n, a) => n + ucs.filter((u) => fatura(a, u, ciclo)).length, 0)
  const suspensos = alunos.filter((a) => a.suspensoEm && a.status === 'Matriculado').length

  const colunas: Column<AlunoTurma>[] = [
    {
      header: 'Aluno', value: (a) => a.nome, search: true,
      cell: (a) => <span className="block min-w-48"><span className="block font-medium">{a.nome}</span><span className="block text-xs text-muted-foreground">{a.email} · {a.telefone}</span></span>,
    },
    { header: 'CPF', value: (a) => a.cpf, search: true, className: 'font-mono text-xs' },
    { header: 'Escola', value: (a) => a.escola, filter: true, cell: (a) => <span><span className="block">{a.escola}</span><span className="text-xs text-muted-foreground">{a.cidade}</span></span> },
    { header: 'Status geral', value: (a) => a.status, filter: true, cell: (a) => <Badge variant="outline">{a.status}</Badge> },
    { header: 'Data de saída', value: (a) => (a.dataSaida ? dataBr(a.dataSaida) : ''), cell: (a) => (a.dataSaida ? <span className="font-medium tabular-nums">{dataBr(a.dataSaida)}</span> : '—') },
    { header: 'Monitor', value: (a) => a.monitor ?? '', filter: true, cell: (a) => a.monitor ?? '—' },
    ...ucs.map((u): Column<AlunoTurma> => ({
      header: `${u.nome} (${curto(u.inicio)} a ${curto(u.fim)})`,
      value: (a) => `${situacaoNaUc(a, u).situacao} · ${fatura(a, u, ciclo) ? 'fatura' : 'não fatura'}`,
      filter: true,
      cell: (a) => {
        const s = situacaoNaUc(a, u)
        const f = fatura(a, u, ciclo)
        return (
          <span className="block min-w-36">
            <span className={cn('block text-sm', tomSituacao[s.situacao])}>{s.situacao}{s.desde && ` · ${curto(s.desde)}`}</span>
            <span className={cn('text-xs font-semibold', f ? 'text-emerald-700' : 'text-muted-foreground')}>{f ? 'Fatura' : 'Não fatura'}</span>
          </span>
        )
      },
    })),
  ]

  // Planilha (CSV) no formato da planilha da CTM
  const exportar = () => {
    const cab = ['Aluno', 'Grupo', 'CPF', 'E-mail', 'Telefone', 'Status geral', 'Data de saída', 'Monitor', ...ucs.flatMap((u) => [`UC ${u.nome}`, `Faturamento ${u.nome} ${dataBr(j.ini)} a ${dataBr(j.fim)}`])]
    const rows = alunos.map((a) => [a.nome, `${t.codigo} - ${a.escola}`, a.cpf, a.email, a.telefone, a.status, a.dataSaida ? dataBr(a.dataSaida) : '', a.monitor ?? '', ...ucs.flatMap((u) => { const s = situacaoNaUc(a, u); return [`${s.situacao}${s.desde ? ` - ${dataBr(s.desde)}` : ''}`, fatura(a, u, ciclo) ? 'SIM' : 'NÃO'] })])
    const csv = [cab, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
    Object.assign(document.createElement('a'), { href: url, download: `acompanhamento-${t.codigo.replace(/\W+/g, '-')}-${ciclo}.csv` }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 rounded-[1.25rem] border bg-card p-4">
        <div className="grid gap-1.5">
          <Label>Turma</Label>
          <Select value={t.id} onValueChange={(v) => set('turma', v as string)}>
            <SelectTrigger className="w-80"><SelectValue>{() => `${t.codigo} · ${t.cursos.join(', ')}`}</SelectValue></SelectTrigger>
            <SelectContent>{turmas.map((x) => <SelectItem key={x.id} value={x.id}>{x.codigo} · {x.cursos.join(', ')} · SENAI-{x.drContratante}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Ciclo financeiro <span className="font-normal text-muted-foreground">({dataBr(j.ini)} a {dataBr(j.fim)})</span></Label>
          <Select value={ciclo} onValueChange={(v) => set('ciclo', v as string)}>
            <SelectTrigger className="w-44"><SelectValue>{(v: string | null) => (v ? cicloBr(v) : '—')}</SelectValue></SelectTrigger>
            <SelectContent>{ciclos.map((c) => <SelectItem key={c} value={c}>{cicloBr(c)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={exportar}><FileDown /> Exportar planilha</Button>
          <Button variant="outline" nativeButton={false} render={<a href={`#/financeiro/cobranca/${t.propostaId}?ciclo=${ciclo}`} />}><ReceiptText /> Relatório de cobrança</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} tom="blue" label="Alunos" value={String(alunos.length)} hint={`${alunos.filter((a) => a.integrado).length} integrados no AVA`} />
        <StatCard icon={ReceiptText} tom="green" label="Faturamentos no ciclo" value={String(faturas)} hint={`aluno × UC · ${ucs.length} UC(s) no ciclo`} />
        <StatCard icon={UserMinus} tom="gray" label="Desistentes e trancados" value={String(alunos.filter((a) => a.status !== 'Matriculado').length)} />
        <StatCard icon={AlertTriangle} tom="amber" label="Suspensos sem formalização" value={String(suspensos)} hint="Seguem faturando: cobrar a formalização da DR" />
      </div>

      <DataTable rows={alunos} columns={colunas} searchPlaceholder="Buscar aluno ou CPF…" />
    </div>
  )
}
