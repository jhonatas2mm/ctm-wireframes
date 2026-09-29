import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

// breadcrumb: padrão para telas internas. Itens com `to` viram link; o último é a página atual.
//   <PageHeader title="Gestão da proposta" breadcrumb={[{ label: 'Gestão de Contrato', to: '/produtos' }, { label: 'PC-MG-001/2026' }]} />
export type Crumb = { label: string; to?: string }

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: React.ReactNode
  description?: string
  actions?: ReactNode
  breadcrumb?: Crumb[]
}) {
  // O breadcrumb vai para a barra superior do AppShell (#topbar-slot).
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  useEffect(() => setSlot(document.getElementById('topbar-slot')), [])
  // Voltar: último item do breadcrumb que tem link.
  const voltar = breadcrumb?.filter((c) => c.to).at(-1)
  return (
    <div className="space-y-2">
      {breadcrumb && slot && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumb.map((c, i) => (
              <Fragment key={i}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {c.to ? <BreadcrumbLink render={<Link to={c.to} />}>{c.label}</BreadcrumbLink> : <BreadcrumbPage>{c.label}</BreadcrumbPage>}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>,
        slot,
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-2">
          {voltar && (
            <Button variant="ghost" size="icon" className="mt-0.5" aria-label={`Voltar para ${voltar.label}`} render={<Link to={voltar.to!} />}>
              <ArrowLeft />
            </Button>
          )}
          <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  )
}
