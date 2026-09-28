import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, EyeOff, ExternalLink, MapPinPlus, MessageSquareText, Monitor, UserRound, ChevronDown, Route, Smartphone, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { journeys, profiles, type Profile } from '@/journeys'
import { AnnotationPanel } from '@/annotations/panel'
import { canEdit, usePins } from '@/annotations/store'
import type { Mode, Pin, PinKind, ToFrame, ToShell } from '@/annotations/types'

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

  // Anotações (pinos) ancoradas em elementos do protótipo.
  const [pins, savePins] = usePins()
  const [screen, setScreen] = useState('/dashboard')
  const [mode, setMode] = useState<Mode>('view')
  const [panel, setPanel] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [draft, setDraft] = useState<Pick<Pin, 'selector' | 'x' | 'y' | 'px' | 'py'> | null>(null)
  const [orphans, setOrphans] = useState<string[]>([])
  // Perfil definido na jornada/etapa; pode ser trocado manualmente (vale até mudar de etapa).
  const [profileOverride, setProfileOverride] = useState<Profile | null>(null)

  const journey = journeys.find((j) => j.id === jid)!
  const current = journey.steps[step]
  const plannedProfile = current.profile ?? journey.profile
  const profile = profileOverride ?? plannedProfile
  // src fixo: trocar de etapa muda só o hash do iframe, sem recarregar.
  const [src] = useState(() => `./?frame=1#${current.path}`)

  const go = (id: string, s: number) => {
    setState({ jid: id, step: s })
    setProfileOverride(null)
  }

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

  const screenPins = pins
    .filter((p) => p.screen === screen)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((p, i) => ({ ...p, n: i + 1 }))

  // Recebe do protótipo: rota atual, ponto clicado no modo anotar, pino selecionado.
  useEffect(() => {
    const onMsg = (e: MessageEvent<ToShell>) => {
      if (e.origin !== location.origin || e.data?.src !== 'ctm-frame') return
      const m = e.data
      if (m.type === 'route') {
        setFramePath(m.path)
        setScreen(m.screen)
        setDraft(null)
        setActive(null)
      } else if (m.type === 'pick') {
        setDraft({ selector: m.selector, x: m.x, y: m.y, px: m.px, py: m.py })
        setMode('view')
        setPanel(true)
      } else if (m.type === 'select') {
        setActive(m.id)
        setPanel(true)
      } else if (m.type === 'orphans') setOrphans(m.ids)
      else if (m.type === 'cancel') setMode('view')
    }
    addEventListener('message', onMsg)
    return () => removeEventListener('message', onMsg)
  }, [])

  // Envia ao protótipo o que desenhar.
  useEffect(() => {
    const draftPin = draft && { id: 'draft', screen, kind: 'requisito' as PinKind, text: '', createdAt: '', n: 0, ...draft }
    // Pinos só na visão desktop: nas outras o layout muda e as posições não batem.
    const msg: ToFrame = { src: 'ctm-shell', profile, mode: device === 'desktop' ? mode : 'off', pins: draftPin ? [...screenPins, draftPin] : screenPins, active }
    frame.current?.contentWindow?.postMessage(msg, location.origin)
  })

  const createPin = (kind: PinKind, text: string) => {
    if (!draft) return
    const pin: Pin = { id: crypto.randomUUID(), screen, kind, text, createdAt: new Date().toISOString(), ...draft }
    savePins([...pins, pin])
    setDraft(null)
    setActive(pin.id)
  }

  const offPath = framePath !== null && framePath !== current.path

  // `dark` escurece os tokens só na casca; o protótipo no iframe não é afetado.
  return (
    <div className="dark flex h-svh bg-black text-foreground">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-black">
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
                      {j.steps.length}
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
        <header className="flex flex-wrap items-center gap-3 border-b bg-black px-4 py-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {journey.title} · Etapa {step + 1} de {journey.steps.length}
            </p>
            <div className="flex items-center gap-2">
              <p className="truncate font-mono text-sm font-medium">{framePath ? screen : current.path}</p>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs hover:bg-muted"
                  aria-label="Trocar perfil"
                >
                  <UserRound className="size-3" />
                  <span className="text-muted-foreground">Perfil:</span>
                  <span className="font-medium">{profile}</span>
                  {profileOverride && profileOverride !== plannedProfile && (
                    <span className="text-amber-400" title={`Previsto na jornada: ${plannedProfile}`}>
                      *
                    </span>
                  )}
                  <ChevronDown className="size-3 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="dark">
                  <DropdownMenuGroup>
                  <DropdownMenuLabel>Ver tela como</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={profile} onValueChange={(v) => setProfileOverride(v as Profile)}>
                    {profiles.map((p) => (
                      <DropdownMenuRadioItem key={p} value={p}>
                        {p}
                        {p === plannedProfile && <span className="ml-auto text-[10px] text-muted-foreground">previsto</span>}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {canEdit && (
              <Button
                disabled={device !== 'desktop'}
                title={device !== 'desktop' ? 'Anotações só na visão desktop' : undefined}
                size="sm"
                variant={mode === 'add' ? 'default' : 'ghost'}
                onClick={() => setMode(mode === 'add' ? 'view' : 'add')}
              >
                <MapPinPlus /> {mode === 'add' ? 'Clique na tela… (Esc)' : 'Anotar'}
              </Button>
            )}
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={mode === 'off' ? 'Mostrar pinos' : 'Ocultar pinos'}
              onClick={() => setMode(mode === 'off' ? 'view' : 'off')}
            >
              {mode === 'off' ? <EyeOff /> : <Eye />}
            </Button>
            <Button size="sm" variant={panel ? 'secondary' : 'ghost'} onClick={() => setPanel(!panel)}>
              <MessageSquareText /> <span className="tabular-nums">{screenPins.length}</span>
            </Button>
            <span className="mx-1 h-4 w-px bg-border" />
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

        <div className="flex min-h-0 flex-1">
          <div className="flex min-h-0 flex-1 justify-center overflow-auto p-4">
            <iframe
              ref={frame}
              src={src}
              title="Protótipo"
              className="h-full rounded-lg border bg-background shadow-sm transition-[width]"
              style={{ width: devices.find((d) => d.id === device)!.width }}
            />
          </div>
          {panel && (
            <AnnotationPanel
              screen={screen}
              pins={screenPins}
              orphans={orphans}
              drafting={!!draft}
              active={active}
              onSelect={setActive}
              onCreate={createPin}
              onCancelDraft={() => setDraft(null)}
              onUpdate={(id, kind, text) => savePins(pins.map((p) => (p.id === id ? { ...p, kind, text } : p)))}
              onDelete={(id) => savePins(pins.filter((p) => p.id !== id))}
              onClose={() => setPanel(false)}
            />
          )}
        </div>

        <footer className="flex items-center gap-3 border-t bg-black px-4 py-2">
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
