import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Annotation, PageHeader, Placeholder, StatCard } from '@/components/wf'
import { useItens } from '@/lib/mock'
import { useProfile } from '@/journey/profile'

export default function Dashboard() {
  const perfil = useProfile()
  const { all: itens } = useItens()
  const count = (s: string) => String(itens.filter((i) => i.status === s).length)
  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Visão geral do dia · perfil ${perfil}`}
        actions={
          perfil !== 'Cliente' && (
          <Button nativeButton={false} render={<Link to="/itens/novo" />}>
            <Plus /> Novo item
          </Button>
          )
        }
      />
      <Annotation>Exemplo de perfil: “Novo item” não aparece para Cliente (useProfile).</Annotation>
      <Annotation>Os indicadores devem refletir apenas os itens do usuário logado.</Annotation>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={String(itens.length)} />
        <StatCard label="Ativos" value={count('Ativo')} />
        <StatCard label="Pendentes" value={count('Pendente')} />
        <StatCard label="Arquivados" value={count('Arquivado')} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <Placeholder label="Gráfico de linhas" className="h-64" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {itens.slice(0, 5).map((i) => (
              <Link key={i.id} to={`/itens/${i.id}`} className="flex items-center justify-between text-sm hover:underline">
                <span>{i.nome}</span>
                <Badge variant="outline">{i.status}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
