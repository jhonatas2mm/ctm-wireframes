import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, GitBranchPlus, Plus } from 'lucide-react'
import { Popover } from '@base-ui/react/popover'
import { useState } from 'react'
import { NovaVersaoSheet, ProdutoSheet } from '@/pages/produto-sheets'
import { Button } from '@/components/ui/button'
import { NovoCursoDialog } from '@/pages/novo-curso-dialog'
import { DataTable, PageHeader, RowAction, type Column } from '@/components/wf'
import { chTotal, useCursosDr, useEditais, useProdutos } from '@/lib/mock'
import { EditalDetalhes } from '@/pages/edital-detalhes'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

type ProdutoDr = { id: string; codigo: string; nome: string; modalidade: string; area: string; cargaHoraria: number; propostas: number; valorMedio: number; versao: number; edital?: string }

// Versão fictícia (1 a 3) para os cursos vindos das propostas, estável por curso.
const versaoFicticia = (id: string) => ([...id].reduce((t, ch) => t + ch.charCodeAt(0), 0) % 3) + 1

// Visão rápida do curso (dados do catálogo), no botão Detalhes ao lado do nome.
function CursoDetalhes({ p }: { p: ProdutoDr }) {
  const itens: [string, string][] = [['Modalidade', p.modalidade], ['Área tecnológica', p.area], ['Carga horária', `${p.cargaHoraria} h`]]
  return (
    <Popover.Root>
      <Popover.Trigger render={<Button size="xs" variant="outline" className="border-neutral-300 bg-white font-normal text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800" />}>
        Detalhes
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={6} className="z-50">
          <Popover.Popup className="w-64 rounded-xl border bg-popover p-3 text-sm text-popover-foreground shadow-lg outline-none">
            <p className="mb-2 font-semibold">{p.nome}</p>
            <dl className="space-y-1.5">
              {itens.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

const colunas = (abrirEdital: (numero: string) => void): Column<ProdutoDr>[] => [
  {
    header: 'Curso', value: (p) => p.nome, search: true, className: 'font-medium',
    cell: (p) => (
      <span className="flex items-center gap-1.5">
        <span className="block max-w-72 truncate" title={p.nome}>{p.nome}</span>
        <CursoDetalhes p={p} />
      </span>
    ),
  },
  {
    header: 'Edital',
    value: (p) => p.edital ?? '—',
    search: true,
    filter: true,
    className: 'font-mono text-xs',
    cell: (p) => (p.edital ? <button type="button" className="underline underline-offset-2 hover:text-foreground/70" onClick={() => abrirEdital(p.edital!)}>{p.edital}</button> : '—'),
  },
  { header: 'Versão', value: (p) => `v${p.versao}`, filter: true, className: 'tabular-nums' },
  { header: 'CH', value: (p) => `${p.cargaHoraria} h`, className: 'text-right tabular-nums' },
  { header: 'Valor médio', value: (p) => brl(p.valorMedio), className: 'text-right tabular-nums' },
]

// Gestão de Portfólio (Supervisor): cursos que a DR oferta, consolidados das suas propostas.
export default function GestaoProdutos() {
  const { all } = useProdutos()
  const { all: criados } = useCursosDr()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const porCurso = new Map<string, ProdutoDr & { soma: number }>()
  for (const p of all)
    for (const c of p.cursos) {
      const x = porCurso.get(c.cursoId) ?? { id: c.cursoId, edital: p.edital, codigo: c.codigo, nome: c.nome, modalidade: c.modalidade, area: c.area, cargaHoraria: c.cargaHoraria, propostas: 0, valorMedio: 0, versao: versaoFicticia(c.cursoId), soma: 0 }
      x.propostas++
      x.soma += c.valorPrevisto
      x.valorMedio = x.soma / x.propostas
      porCurso.set(c.cursoId, x)
    }
  // Cursos criados aqui entram na lista sem propostas ainda. Só a versão mais recente de cada produto aparece;
  // as anteriores ficam no histórico (detalhes).
  const raiz = (c: (typeof criados)[number]) => c.origemId ?? c.id
  const atuais = criados.filter((c) => !criados.some((o) => raiz(o) === raiz(c) && (o.versao ?? 1) > (c.versao ?? 1)))
  const [ver, setVer] = useState<string | null>(null)
  const [versionar, setVersionar] = useState<string | null>(null)
  const [editalAberto, setEditalAberto] = useState<string | null>(null)
  const { all: editais } = useEditais()
  const linhas: ProdutoDr[] = [
    ...atuais.map((c) => ({ id: c.id, edital: c.edital, codigo: '—', nome: c.nome, modalidade: c.modalidade ?? '—', area: c.area ?? '—', cargaHoraria: c.cargaHorariaEdital ?? chTotal(c), propostas: 0, valorMedio: 0, versao: c.versao ?? 1 })),
    ...porCurso.values(),
  ]
  return (
    <>
      <PageHeader
        title="Gestão de Portfólio"
        description="Cursos ofertados pela sua DR."
        actions={<Button onClick={() => navigate('/gestao-produtos/novo')}><Plus /> Novo produto</Button>}
      />
      <NovoCursoDialog open={pathname === '/gestao-produtos/novo'} onOpenChange={(v) => !v && navigate('/gestao-produtos')} />
      <DataTable
        rows={linhas}
        columns={colunas(setEditalAberto)}
        searchPlaceholder="Buscar curso…"
        filters={[
          { label: 'Modalidade', values: (p) => [p.modalidade] },
          { label: 'Área tecnológica', values: (p) => [p.area] },
        ]}
        actions={(p) => {
          const temEstrutura = criados.some((c) => c.id === p.id)
          const semEstrutura = () => {}
          return (
            <>
              <RowAction label="Visualizar" icon={Eye} onClick={() => (temEstrutura ? setVer(p.id) : semEstrutura())} />
              <RowAction label="Nova versão" icon={GitBranchPlus} onClick={() => (temEstrutura ? setVersionar(p.id) : semEstrutura())} />
            </>
          )
        }}
      />
      <EditalDetalhes edital={editais.find((e) => e.numero === editalAberto) ?? null} onClose={() => setEditalAberto(null)} />
      <ProdutoSheet id={ver} onClose={() => setVer(null)} onNovaVersao={(id) => setVersionar(id)} />
      <NovaVersaoSheet id={versionar} onClose={() => setVersionar(null)} onSaved={(id) => ver && setVer(id)} />
    </>
  )
}
