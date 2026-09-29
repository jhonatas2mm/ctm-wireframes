import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Annotation, EmptyState, PageHeader, Placeholder, StatCard, TextLines } from '@/components/wf'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4 bg-card">{children}</div>
    </section>
  )
}

export default function Components() {
  return (
    <>
      <PageHeader title="Componentes" description="shadcn/ui (src/components/ui) + blocos de wireframe (src/components/wf)" />

      <Section title="Botões">
        <Button>Primário</Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destrutivo</Button>
        <Button variant="link">Link</Button>
        <Button disabled>Desabilitado</Button>
      </Section>

      <Section title="Badges e avatar">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Erro</Badge>
        <Avatar>
          <AvatarFallback>AS</AvatarFallback>
        </Avatar>
      </Section>

      <Section title="Inputs">
        <Input placeholder="Campo de texto" className="w-60" />
        <Label className="font-normal">
          <Checkbox /> Checkbox
        </Label>
        <Label className="font-normal">
          <Switch /> Switch
        </Label>
        <Progress value={60} className="w-40" />
      </Section>

      <Section title="Overlays e feedback">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Abrir modal</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar ação</DialogTitle>
              <DialogDescription>Essa ação não pode ser desfeita.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Cancelar</DialogClose>
              <DialogClose render={<Button />}>Confirmar</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>Abrir painel lateral</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Painel lateral para filtros ou detalhes rápidos.</SheetDescription>
            </SheetHeader>
            <TextLines lines={6} className="px-4" />
          </SheetContent>
        </Sheet>
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>Tooltip</TooltipTrigger>
          <TooltipContent>Texto de ajuda</TooltipContent>
        </Tooltip>
      </Section>

      <Alert>
        <AlertCircle />
        <AlertTitle>Alerta</AlertTitle>
        <AlertDescription>Mensagem informativa para o usuário.</AlertDescription>
      </Alert>

      <h2 className="pt-4 text-lg font-semibold">Blocos de wireframe</h2>
      <Annotation>Annotation — nota de intenção/regra. Liga/desliga pelo botão “Notas” no topo.</Annotation>
      <div className="grid gap-4 md:grid-cols-3">
        <Placeholder label="Placeholder (imagem, gráfico…)" className="h-40" />
        <div className="space-y-3 rounded-lg border p-4 bg-card">
          <p className="text-xs text-muted-foreground">TextLines</p>
          <TextLines lines={4} />
        </div>
        <div className="space-y-3 rounded-lg border p-4 bg-card">
          <p className="text-xs text-muted-foreground">Skeleton (loading)</p>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label="StatCard" value="1.234" hint="texto de apoio" />
        <EmptyState title="EmptyState" description="Quando não há dados." action={<Button size="sm">Ação</Button>} />
      </div>
    </>
  )
}
