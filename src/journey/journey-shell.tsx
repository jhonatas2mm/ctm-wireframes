import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Monitor, Route, Smartphone, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { journeys } from '@/journeys'

// Estado da casca vive no hash (#j=<id>&s=<n>) para o link poder ser compartilhado já numa etapa.
function readHash() {
  const p = new URLSearchParams(location.hash.slice(1))
  const j = journeys.find((x) => x.id === p.get('j')) ?? journeys[0]
  const s = Math.min(Math.max(Number(p.get('s')) || 0, 0), j.steps.length - 1)
  return { jid: j.id, step: s }
}

const devices = [
  { id: 'desktop', icon: Monitor, width: '100%' },
  { id: 'tablet', icon: Tablet, width: '820px' },
  { id: 'mobile', icon: Smartphone, width: '390px' },
] as const

export function JourneyShell() {
  const [{ jid, step }, setState] = useState(readHash)
  const [device, setDevice] = useState<(typeof devices)[number]['id']>('desktop')
  const [framePath, setFramePath] = useState<string | null>(null)
  const frame = useRef<HTMLIFrameElement>(null)

  const journey = journeys.find((j) => j.id === jid)!
  const current = journey.steps[step]
  // src fixo: trocar de etapa muda só o hash do iframe, sem recarregar.
  const [src] = useState(() => `./?frame=1#${current.path}`)

  const go = (id: string, s: number) => setState({ jid: id, step: s })

  useEffect(() => {
    history.replaceState(null, '', `#j=${jid}&s=${step}`)
    const win = frame.current?.contentWindow
    if (win) win.location.hash = current.path
  }, [jid, step, current.path])

  useEffect(() => {
    const onHash = () => setState(readHash())
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  // Acompanha a navegação feita dentro do protótipo (cliques do usuário).
  const onFrameLoad = () => {
    const win = frame.current?.contentWindow
    if (!win) return
    const sync = () => setFramePath(win.location.hash.slice(1) || '/')
    sync()
    win.addEventListener('hashchange', sync)
  }
  const offPath = framePath !== null && framePath !== current.path

  return (
    <div className="flex h-svh bg-muted/40 text-foreground">
      <aside className="flex w-72 shrink-0 flex-col border-r bg-background">
        <div className="flex items-center gap-2 border-b px-4 py-3 font-semibold">
          <Route className="size-4" /> Jornadas
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <nav className="space-y-1 p-2">
            {journeys.map((j) => {
              const active = j.id === jid
              return (
                <div key={j.id}>
                  <button
                    onClick={() => go(j.id, 0)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted',
                      active && 'bg-muted font-medium',
                    )}
                  >
                    <span className="truncate">{j.title}</span>
                    <Badge variant={active ? 'default' : 'secondary'} className="tabular-nums">
                      {j.steps.length} {j.steps.length === 1 ? 'etapa' : 'etapas'}
                    </Badge>
                  </button>
                  {active && (
                    <ol className="my-1 ml-4 space-y-0.5 border-l pl-2">
                      {j.steps.map((s, i) => (
                        <li key={i}>
                          <button
                            onClick={() => go(j.id, i)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted',
                              i === step && 'bg-muted font-medium text-foreground',
                            )}
                          >
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] tabular-nums">
                              {i + 1}
                            </span>
                            {s.title}
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )
            })}
          </nav>
        </ScrollArea>
        <a
          href="./?frame=1#/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 border-t px-4 py-3 text-xs text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="size-3.5" /> Abrir protótipo livre
        </a>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b bg-background px-4 py-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {journey.title} · Etapa {step + 1} de {journey.steps.length}
            </p>
            <p className="truncate text-sm font-medium">{current.title}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {devices.map((d) => (
              <Button
                key={d.id}
                size="icon-sm"
                variant={device === d.id ? 'secondary' : 'ghost'}
                aria-label={d.id}
                onClick={() => setDevice(d.id)}
              >
                <d.icon />
              </Button>
            ))}
          </div>
        </header>

        <div className="flex min-h-0 flex-1 justify-center overflow-auto p-4">
          <iframe
            ref={frame}
            src={src}
            onLoad={onFrameLoad}
            title="Protótipo"
            className="h-full rounded-lg border bg-background shadow-sm transition-[width]"
            style={{ width: devices.find((d) => d.id === device)!.width }}
          />
        </div>

        <footer className="flex items-center gap-3 border-t bg-background px-4 py-2">
          <Button variant="outline" size="sm" disabled={step === 0} onClick={() => go(jid, step - 1)}>
            <ChevronLeft /> Anterior
          </Button>
          <p className="min-w-0 flex-1 truncate text-center text-sm text-muted-foreground">
            {offPath ? (
              <button className="underline" onClick={() => (frame.current!.contentWindow!.location.hash = current.path)}>
                Fora do roteiro ({framePath}) — voltar para a etapa
              </button>
            ) : (
              current.note
            )}
          </p>
          <Button size="sm" disabled={step === journey.steps.length - 1} onClick={() => go(jid, step + 1)}>
            Próxima <ChevronRight />
          </Button>
        </footer>
      </main>
    </div>
  )
}
