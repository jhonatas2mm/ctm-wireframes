import { Link, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Annotation, EmptyState, PageHeader, Placeholder, TextLines } from '@/components/wf'
import { itens } from '@/lib/mock'

export default function DetailPage() {
  const { id } = useParams()
  const item = itens.find((i) => i.id === id)
  if (!item) return <EmptyState title="Item não encontrado" />

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/itens" />}>Itens</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{item.nome}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        title={item.nome}
        description={`Responsável: ${item.responsavel} · Atualizado em ${item.atualizadoEm}`}
        actions={
          <>
            <Badge variant="outline">{item.status}</Badge>
            <Button variant="outline">
              <Pencil /> Editar
            </Button>
          </>
        }
      />
      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
        </TabsList>
        <TabsContent value="resumo" className="grid gap-4 pt-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <TextLines lines={5} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Mapa / imagem</CardTitle>
            </CardHeader>
            <CardContent>
              <Placeholder label="Imagem" className="aspect-video" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="historico" className="pt-4">
          <Annotation>Timeline com eventos do item, mais recente primeiro.</Annotation>
          <Placeholder label="Timeline" className="mt-4 h-48" />
        </TabsContent>
        <TabsContent value="anexos" className="pt-4">
          <EmptyState title="Sem anexos" description="Arraste arquivos para cá." />
        </TabsContent>
      </Tabs>
    </>
  )
}
