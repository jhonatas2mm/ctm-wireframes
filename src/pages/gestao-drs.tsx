import { useState } from 'react'
import { Eye, Pencil, Plus, Power, PowerOff } from 'lucide-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { NovaDrSheet } from './nova-dr-sheet'
import { Badge } from '@/components/ui/badge'
import { CopiaTexto, DataTable, PageHeader, RowAction, type Column, useConfirmar } from '@/components/wf'
import { useDrs, useEditais, useEscolas, type Dr } from '@/lib/mock'
import { DrSheet } from './dr-sheet'
import { EditarDrSheet } from './editar-dr-sheet'

// Gestão de DRs credenciadas (perfil DN): Departamentos Regionais, contatos e em quantos editais cada um está credenciado.
export default function GestaoDrs() {
  const { confirmar, dialogo } = useConfirmar()
  const { all, update } = useDrs()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { all: editais } = useEditais()
  const [params, setParams] = useSearchParams()
  const [verState, setVer] = useState<Dr | null>(null)
  // Detalhe aberto pela URL (?ver=RJ) para a jornada de validação de escolas
  const ver = verState ?? all.find((d) => d.uf === params.get('ver')) ?? null
  const fechar = () => (setVer(null), params.get('ver') && setParams({}, { replace: true }))
  const { all: escolas } = useEscolas()
  const escolasDe = (uf: string) => escolas.filter((e) => e.dr === uf)
  const [editar, setEditar] = useState<Dr | null>(null)
  const qtdEditais = (uf: string) => editais.filter((e) => e.drs.includes(uf)).length
  const colunas: Column<Dr>[] = [
    { header: 'DR', value: (d) => d.nome, search: true, className: 'font-medium' },
    { header: 'Região', value: (d) => d.regiao, filter: true },
    { header: 'Responsável', value: (d) => d.responsavel, search: true },
    { header: 'E-mail', value: (d) => d.email, search: true, className: 'text-muted-foreground', cell: (d) => <CopiaTexto texto={d.email} rotulo="Copiar e-mail" /> },
    { header: 'Telefone', value: (d) => d.telefone, className: 'text-muted-foreground tabular-nums', cell: (d) => <CopiaTexto texto={d.telefone} rotulo="Copiar telefone" /> },
    { header: 'Editais', value: (d) => qtdEditais(d.uf), className: 'text-right tabular-nums' },
    {
      header: 'Escolas', value: (d) => escolasDe(d.uf).length,
      cell: (d) => {
        const pend = escolasDe(d.uf).filter((e) => e.status === 'Aguardando validação').length
        return <span className="flex items-center gap-2 tabular-nums">{escolasDe(d.uf).length}{pend > 0 && <Badge variant="outline">{pend} aguardando validação</Badge>}</span>
      },
    },
    { header: 'Status', value: (d) => d.status, filter: true, cell: (d) => <Badge variant={d.status === 'Ativo' ? 'default' : 'outline'}>{d.status}</Badge> },
  ]
  return (
    <>
      <PageHeader title="Gestão de DRs" actions={<Button onClick={() => navigate('/drs/novo')}><Plus /> Novo DR credenciado</Button>} />
      <DataTable
        rows={all}
        columns={colunas}
        searchPlaceholder="Buscar DR, responsável ou e-mail…"
        actions={(d) => (
          <>
            <RowAction label="Visualizar" icon={Eye} onClick={() => setVer(d)} />
            <RowAction label="Editar" icon={Pencil} onClick={() => setEditar(d)} />
            {d.status === 'Ativo' ? (
              <RowAction
                label="Inativar"
                icon={PowerOff}
                destructive
                onClick={() => confirmar({ titulo: `Inativar ${d.nome}? Ela deixa de aparecer como opção em novos editais e TAAs.`, acao: 'Inativar', onConfirmar: () => { update(d.id, { status: 'Inativo' }) } })}
              />
            ) : (
              <RowAction label="Ativar" icon={Power} onClick={() => (update(d.id, { status: 'Ativo' }))} />
            )}
          </>
        )}
      />
      <DrSheet dr={ver} onClose={fechar} />
      <EditarDrSheet dr={editar} onClose={() => setEditar(null)} />
      <NovaDrSheet open={pathname === '/drs/novo'} onOpenChange={(v) => !v && navigate('/drs')} />
      {dialogo}
    </>
  )
}
