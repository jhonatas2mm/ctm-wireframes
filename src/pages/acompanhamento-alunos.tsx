import { useSearchParams } from 'react-router-dom'
import { FileDown, ReceiptText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CopiaTexto, DataTable, EmptyState, StatCard, type Column } from '@/components/wf'
import { HOJE, dataBr, useConfirmacoesDesistencia, useTurmas, type UcTurma } from '@/lib/mock'
import { aguardandoDr, alunosDaTurma, cicloBr, ciclosDe, fatura, janelaUc, matriculaNa, resumoAluno, situacaoNaUc, ucNoCiclo, type AlunoTurma } from '@/lib/alunos-turma'
import { cn } from '@/lib/utils'

// Relatório geral de acompanhamento dos alunos (substitui a planilha da CTM): por turma e ciclo financeiro, cada aluno com
// contato, status geral, saída formalizada e monitor; por UC do ciclo, a situação (ativo, suspenso, não integrado) e se
// fatura. É a base do nº de alunos do Relatório de cobrança. Turma e ciclo pela URL (?turma=&ciclo=).
const curto = (iso: string) => iso.slice(8) + '/' + iso.slice(5, 7)
const tomSituacao = { Ativo: 'text-foreground', Suspenso: 'text-amber-700', 'Desistente no Moodle': 'text-amber-700', Desistente: 'text-red-700', Trancado: 'text-muted-foreground', 'Não integrado nesta UC': 'text-muted-foreground' }

export function AcompanhamentoAlunos() {
  const [params, setParams] = useSearchParams()
  const conf = useConfirmacoesDesistencia().all
  const todas = useTurmas().all.filter((t) => t.fase !== 'Cancelada' && (t.escolas ?? []).length)
  // Filtro de DR solicitante (contratante): limita as turmas
  const drs = [...new Set(todas.map((t) => t.drContratante))].sort()
  const dr = drs.find((d) => d === params.get('dr')) ?? ''
  const turmas = dr ? todas.filter((t) => t.drContratante === dr) : todas
  const t = turmas.find((x) => x.id === params.get('turma')) ?? turmas[0]
  const ciclos = t ? ciclosDe([t]) : []
  const ciclo = ciclos.find((c) => c === params.get('ciclo')) ?? ciclos.find((c) => c >= HOJE.slice(0, 7)) ?? ciclos[0]
  const set = (k: string, v: string) => setParams((p) => { const n = new URLSearchParams(p); n.set('aba', 'acompanhamento'); n.set(k, v); if (k === 'dr') (n.delete('turma'), v || n.delete('dr')); if (k === 'turma' || k === 'dr') n.delete('ciclo'); return n }, { replace: true })
  if (!t || !ciclo) return <EmptyState title="Nenhuma turma com escolas e cronograma" />

  const alunos = alunosDaTurma(t, conf)
  const todasUcs: UcTurma[] = t.modulos.flatMap((m) => m.unidades)
  const ucs = todasUcs.filter((u) => ucNoCiclo(u, ciclo))
  const faturas = alunos.reduce((n, a) => n + ucs.filter((u) => fatura(a, u, ciclo)).length, 0)
  const suspensos = alunos.filter((a) => ucs.some((u) => matriculaNa(a, u).suspensoEm && matriculaNa(a, u).status === 'Matriculado')).length

  const colunas: Column<AlunoTurma>[] = [
    {
      header: 'Estudante', value: (a) => a.nome, search: true,
      cell: (a) => <span className="block min-w-48"><span className="block font-medium">{a.nome}</span><span className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground"><CopiaTexto texto={a.email} rotulo="Copiar e-mail" /><CopiaTexto texto={a.telefone} rotulo="Copiar telefone" /></span></span>,
    },
    { header: 'CPF', value: (a) => a.cpf, search: true, className: 'font-mono text-xs' },
    { header: 'Escola', quebra: true, value: (a) => a.escola, filter: true, cell: (a) => <span><span className="block">{a.escola}</span><span className="text-xs text-muted-foreground">{a.cidade}</span></span> },
    { header: 'Situação nas UCs', quebra: true, value: (a) => resumoAluno(a, todasUcs), filter: true, cell: (a) => <span className="block min-w-40 text-sm">{resumoAluno(a, todasUcs)}</span> },
    { header: 'Monitor', value: (a) => a.monitor ?? '', filter: true, cell: (a) => a.monitor ?? '—' },
    ...ucs.map((u): Column<AlunoTurma> => ({
      header: `${u.nome} · ciclo ${curto(janelaUc(u, ciclo).ini)} a ${curto(janelaUc(u, ciclo).fim)}`, quebra: true,
      value: (a) => `${situacaoNaUc(a, u).situacao} · ${fatura(a, u, ciclo) ? 'fatura' : 'não fatura'}`,
      filter: true,
      cell: (a) => {
        const s = situacaoNaUc(a, u)
        const f = fatura(a, u, ciclo)
        const m = s.matricula
        return (
          <span className="block min-w-36">
            <span className={cn('block text-sm', tomSituacao[s.situacao])}>{s.situacao}{s.desde && ` · ${curto(s.desde)}`}</span>
            {aguardandoDr(m) && <span className="block text-xs font-medium text-amber-700">Aguardando confirmação do DR</span>}
            {m.contestada && <span className="block text-xs text-muted-foreground">DR contestou a desistência (falha de integração)</span>}
            <span className={cn('text-xs font-semibold', f ? 'text-emerald-700' : 'text-muted-foreground')}>{f ? (s.situacao === 'Desistente' || s.situacao === 'Trancado' ? 'Fatura (sai no próximo ciclo da UC)' : 'Fatura') : 'Não fatura'}</span>
          </span>
        )
      },
    })),
  ]

  // Planilha (CSV) no formato da planilha da CTM
  const exportar = () => {
    const cab = ['Estudante', 'Grupo', 'CPF', 'E-mail', 'Telefone', 'Situação nas UCs', 'Monitor', ...ucs.flatMap((u) => [`UC ${u.nome}`, `Faturamento ${u.nome} ${dataBr(janelaUc(u, ciclo).ini)} a ${dataBr(janelaUc(u, ciclo).fim)}`])]
    const rows = alunos.map((a) => [a.nome, `${t.codigo} - ${a.escola}`, a.cpf, a.email, a.telefone, resumoAluno(a, todasUcs), a.monitor ?? '', ...ucs.flatMap((u) => { const s = situacaoNaUc(a, u); return [`${s.situacao}${s.desde ? ` - ${dataBr(s.desde)}` : ''}`, fatura(a, u, ciclo) ? 'SIM' : 'NÃO'] })])
    const csv = [cab, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
    Object.assign(document.createElement('a'), { href: url, download: `acompanhamento-${t.codigo.replace(/\W+/g, '-')}-${ciclo}.csv` }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 items-end gap-4 rounded-[1.25rem] border bg-card p-4">
        <div className="grid gap-1.5">
          <Label>DR solicitante</Label>
          <Select value={dr || 'todas'} onValueChange={(v) => set('dr', v === 'todas' ? '' : (v as string))}>
            <SelectTrigger className="w-full"><SelectValue>{() => (dr ? `SENAI-${dr}` : 'Todas os DRs')}</SelectValue></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas os DRs</SelectItem>
              {drs.map((d) => <SelectItem key={d} value={d}>SENAI-{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Turma</Label>
          <Select value={t.id} onValueChange={(v) => set('turma', v as string)}>
            <SelectTrigger className="w-full"><SelectValue>{() => `${t.codigo} · ${t.cursos.join(', ')}`}</SelectValue></SelectTrigger>
            <SelectContent>{turmas.map((x) => <SelectItem key={x.id} value={x.id}>{x.codigo} · {x.cursos.join(', ')} · SENAI-{x.drContratante}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Cobrança do mês <span className="font-normal text-muted-foreground">(cada UC no seu ciclo)</span></Label>
          <Select value={ciclo} onValueChange={(v) => set('ciclo', v as string)}>
            <SelectTrigger className="w-full"><SelectValue>{(v: string | null) => (v ? cicloBr(v) : '—')}</SelectValue></SelectTrigger>
            <SelectContent>{ciclos.map((c) => <SelectItem key={c} value={c}>{cicloBr(c)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="col-span-full flex gap-2">
          <Button variant="outline" onClick={exportar}><FileDown /> Exportar planilha</Button>
          <Button variant="outline" nativeButton={false} render={<a href={`#/financeiro/cobranca/${t.propostaId}?ciclo=${ciclo}`} />}><ReceiptText /> Relatório de cobrança</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard quebra label="Estudantes" value={String(alunos.length)} hint={`${alunos.filter((a) => a.integrado).length} integrados no AVA`} />
        <StatCard quebra label="Faturamentos no ciclo" value={String(faturas)} hint={`estudante × UC · ${ucs.length} UC(s) no ciclo`} />
        <StatCard quebra label="Estudantes com desistência ou trancamento" value={String(alunos.filter((a) => a.ucs.some((m) => m.status !== 'Matriculado')).length)} hint="Em ao menos uma UC; nas outras segue matriculado" />
        <StatCard quebra label="Desistências aguardando o DR" value={String(alunos.reduce((n, a) => n + a.ucs.filter(aguardandoDr).length, 0))} hint="Estudante × UC; seguem faturando até o DR confirmar" />
        <StatCard quebra label="Suspensos sem formalização" value={String(suspensos)} hint="Seguem faturando: cobrar a formalização do DR" />
      </div>

      <DataTable rows={alunos} columns={colunas} searchPlaceholder="Buscar estudante ou CPF…" />
    </div>
  )
}
