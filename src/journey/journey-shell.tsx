import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ExternalLink, MapPinPlus, MessageSquareText, Monitor, UserRound, RotateCcw, Lock, Smartphone, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { resetDb } from '@/lib/db'
import { journeys, type Journey, type Profile } from '@/journeys'
import { profileOf, profiles } from './profiles'
import { screens } from '@/screens'
import { AnnotationPanel } from '@/annotations/panel'
import { canEdit, usePins } from '@/annotations/store'
import type { Mode, Pin, PinKind, ToFrame, ToShell } from '@/annotations/types'

// Jornadas de um perfil: as da jornada dele ou com alguma etapa dele.
// Todas as jornadas aparecem para todos; o perfil vem de cada etapa.
const journeysOf = (_profile: Profile) => journeys

// Perfil sem jornadas: navega livre a partir da tela inicial.
const FREE: Journey = { id: '', title: 'Sem jornada', profile: '', steps: [{ title: 'Início', path: '/dashboard' }] }

// Estado da casca vive no hash (#p=<perfil>&j=<id>&s=<n>) para o link poder ser compartilhado já numa etapa.
function readHash() {
  const p = new URLSearchParams(location.hash.slice(1))
  const pid = profiles.find((x) => x.name === p.get('p'))?.name ?? journeys[0]?.profile ?? profiles[0].name
  const list = journeysOf(pid)
  const j = list.find((x) => x.id === p.get('j')) ?? list[0] ?? FREE
  const s = Math.min(Math.max(Number(p.get('s')) || 0, 0), j.steps.length - 1)
  return { pid, jid: j.id, step: s }
}

// Domínio fictício exibido na barra do navegador simulada.
const APP_HOST = 'app.ctm.com.br'

// Desktop é renderizado numa largura fixa e reduzido para caber (telas pequenas não espremem o layout).
const DESKTOP_WIDTH = 1440

function ScaledFrame({ ref, src, scaled }: { ref: React.Ref<HTMLIFrameElement>; src: string; scaled: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = box.current!
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const k = scaled && size.w ? Math.min(1, size.w / DESKTOP_WIDTH) : 1
  return (
    <div ref={box} className="relative min-h-0 flex-1 overflow-hidden">
      <iframe
        ref={ref}
        src={src}
        title="Protótipo"
        className="absolute top-0 left-0 origin-top-left"
        style={
          k < 1
            ? { width: DESKTOP_WIDTH, height: size.h / k, transform: `scale(${k})` }
            : { width: '100%', height: '100%' }
        }
      />
    </div>
  )
}

const devices = [
  { id: 'desktop', icon: Monitor, width: '100%' },
  { id: 'tablet', icon: Tablet, width: '820px' },
  { id: 'mobile', icon: Smartphone, width: '390px' },
] as const

export function JourneyShell() {
  const [{ pid, jid, step }, setState] = useState(readHash)
  const [device, setDevice] = useState<(typeof devices)[number]['id']>('desktop')
  const [framePath, setFramePath] = useState<string | null>(null)
  const frame = useRef<HTMLIFrameElement>(null)

  // Anotações (pinos) ancoradas em elementos do protótipo.
  const [pins, addPin] = usePins()
  const [screen, setScreen] = useState('/dashboard')
  const [mode, setMode] = useState<Mode>('view')
  const [panel, setPanel] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [draft, setDraft] = useState<Pick<Pin, 'selector' | 'x' | 'y' | 'px' | 'py'> | null>(null)
  const [orphans, setOrphans] = useState<string[]>([])
  // Perfil escolhido no topo do menu filtra as jornadas; uma etapa pode forçar outro perfil.
  const visibleJourneys = journeysOf(pid)
  // Numeração por perfil que inicia a jornada (1ª etapa): 1, 2, 3… dentro de cada perfil, na ordem de src/journeys.ts.
  const inicio = (j: Journey) => j.steps[0]?.profile ?? j.profile
  const numero = (id: string) => {
    const j = journeys.find((x) => x.id === id)
    return j ? journeys.filter((x) => inicio(x) === inicio(j)).indexOf(j) + 1 : 0
  }
  const journey = visibleJourneys.find((j) => j.id === jid) ?? FREE
  const current = journey.steps[step] ?? journey.steps[0]
  // Etapas da jornada atual, lidas no listener de mensagens; e marcação de que a troca de etapa veio da navegação no protótipo.
  const stepsRef = useRef(journey.steps)
  stepsRef.current = journey.steps
  const doFrame = useRef(false)
  const profile = current.profile ?? pid
  const profileDef = profileOf(profile)
  const frameRef = useRef<HTMLDivElement>(null)
  // Topo mostra só o nome da área; a URL completa vai na barra do navegador simulada.
  const shownPath = framePath ?? current.path
  const areaName = screens.find((s) => s.path === screen)?.title ?? current.title
  const telaData = screens.find((s) => s.path === screen)?.data
  // src fixo: trocar de etapa muda só o hash do iframe, sem recarregar.
  const [src] = useState(() => `./?frame=1#${current.path}`)

  const go = (id: string, s: number) => setState({ pid, jid: id, step: s })
  const trocarPerfil = (p: Profile) => setState({ pid: p, jid: (journeys.find((j) => inicio(j) === p) ?? FREE).id, step: 0 })

  // Restaurar dados: confirma num diálogo próprio (confirm() nativo pode ser bloqueado), apaga o que o usuário
  // criou/alterou e recarrega a tela do protótipo, desfazendo também o estado da tela (modais abertas etc.).
  const [restaurar, setRestaurar] = useState<null | 'tela' | 'tudo'>(null)
  const confirmarRestauracao = () => {
    resetDb(restaurar === 'tela' ? telaData : undefined)
    frame.current?.contentWindow?.location.reload()
    setRestaurar(null)
  }

  // Atalhos: ← etapa anterior, → próxima (ignora quando o foco está num campo de texto).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return
      if (e.key === 'ArrowLeft' && step > 0) go(jid, step - 1)
      else if (e.key === 'ArrowRight' && step < journey.steps.length - 1) go(jid, step + 1)
      else return
      e.preventDefault()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    history.replaceState(null, '', `#p=${encodeURIComponent(pid)}&j=${jid}&s=${step}`)
    const win = frame.current?.contentWindow
    // Se a etapa mudou porque o usuário navegou dentro do protótipo, não reposiciona a tela.
    if (doFrame.current) doFrame.current = false
    else if (win) win.location.hash = current.path
  }, [pid, jid, step, current.path])

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
        // Destaque do fluxograma acompanha a tela vista: rota exata da etapa; senão, a mesma tela (padrão da rota).
        const steps = stepsRef.current
        const padrao = new RegExp(`^${m.screen.replace(/:[^/]+/g, '[^/]+')}$`)
        let i = steps.findIndex((x) => x.path === m.path)
        if (i < 0) i = steps.findIndex((x) => padrao.test(x.path))
        if (i >= 0) setState((st) => (st.step === i ? st : ((doFrame.current = true), { ...st, step: i })))
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

  const createPin = (kind: PinKind, text: string, author?: string) => {
    if (!draft) return
    const pin: Pin = { id: crypto.randomUUID(), screen, kind, text, author, createdAt: new Date().toISOString(), ...draft }
    addPin(pin)
    setDraft(null)
    setActive(pin.id)
  }


  // `dark` escurece os tokens só na casca; o protótipo no iframe não é afetado.
  return (
    <div className="shell-canvas dark flex h-svh text-foreground">
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 px-4 py-2">
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
            <Button size="sm" variant={panel ? 'secondary' : 'ghost'} onClick={() => setPanel(!panel)}>
              <MessageSquareText /> <span className="tabular-nums">{screenPins.length}</span>
            </Button>
            <span className="mx-1 h-4 w-px bg-border" />
            <Button size="sm" variant="ghost" render={<a href="./?frame=1#/" target="_blank" rel="noreferrer" />} nativeButton={false}>
              <ExternalLink /> Abrir protótipo livre
            </Button>
<DropdownMenu>
              <DropdownMenuTrigger render={<Button size="sm" variant="ghost" />}>
                <RotateCcw /> Restaurar dados
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dark w-56">
                <DropdownMenuItem
                  disabled={!telaData?.length}
                  onClick={() => setRestaurar('tela')}
                >
                  Somente desta tela
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setRestaurar('tudo')}
                >
                  Todo o protótipo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="mx-1 h-4 w-px bg-border" />
            {devices.map((d) => (
              <Button
                key={d.id}
                size="icon-sm"
                variant={device === d.id ? 'secondary' : 'ghost'}
                aria-label={d.id}
                // Versões responsivas desabilitadas por enquanto.
                disabled={d.id !== 'desktop'}
                onClick={() => setDevice(d.id)}
              >
                <d.icon />
              </Button>
            ))}
          </div>
        </header>

        {/* Mapa da jornada escolhida no select: etapas ligadas por setas */}
        <div className="mx-4 mb-3 flex shrink-0 items-center gap-3 rounded-lg border bg-card p-2">
          <div className="grid shrink-0 gap-1">
            <span className="pl-1 text-xs font-bold">Jornada</span>
            <Select value={jid} onValueChange={(v) => go(v as string, 0)}>
              <SelectTrigger size="sm" className="w-44 shrink-0">
                <SelectValue>{(v: string) => { const j = journeys.find((x) => x.id === v); return j ? `${numero(j.id)}. ${j.title}` : 'Jornada' }}</SelectValue>
              </SelectTrigger>
              <SelectContent className="dark min-w-72" alignItemWithTrigger={false}>
                {/* Agrupadas pelo perfil que inicia a jornada (perfil da 1ª etapa), na ordem dos perfis */}
                {profiles
                  .map((pf) => ({ pf, js: visibleJourneys.filter((j) => inicio(j) === pf.name) }))
                  .filter((g) => g.js.length)
                  .map(({ pf, js }, gi) => (
                    <SelectGroup key={pf.name}>
                      {gi > 0 && <SelectSeparator />}
                      <SelectLabel className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full" style={{ background: pf.color }} />
                        {pf.name}
                      </SelectLabel>
                      {js.map((j) => (
                        <SelectItem key={j.id} value={j.id}>
                          <span className="flex w-full items-center justify-between gap-3">
                            <span>{numero(j.id)}. {j.title}</span>
                            <span className="rounded bg-white/10 px-1.5 text-[10px] tabular-nums text-muted-foreground">{j.steps.length} {j.steps.length === 1 ? 'etapa' : 'etapas'}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {/* Só as etapas rolam na horizontal */}
          <div className="min-w-0 flex-1 overflow-x-auto rounded-md border bg-background px-2 py-1.5">
            <div className="flex w-max items-center gap-2 py-0.5">
              {journey.steps.map((st, i) => {
                const atual = i === step
                const cor = profileOf(st.profile ?? journey.profile).color
                return (
                  <div key={i} className="flex shrink-0 items-center gap-2">
                    {i > 0 && <ArrowRight className="size-4 text-muted-foreground" />}
                    <button
                      onClick={() => go(jid, i)}
                      title={st.note}
                      className={cn('flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors hover:brightness-125', atual ? 'font-medium text-white ring-2 ring-white/70' : 'text-foreground/85')}
                      // Preenchimento na cor do perfil: sólido na etapa atual, translúcido nas demais.
                      style={{ borderColor: cor, background: atual ? cor : `${cor}33` }}
                    >
                      <span className="whitespace-nowrap">{st.title}</span>
                      <span className="text-[10px] whitespace-nowrap opacity-70">{st.profile ?? journey.profile}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-h-0 flex-1 justify-center overflow-auto p-6">
            <div className="flex h-full flex-col transition-[width]" style={{ width: devices.find((d) => d.id === device)!.width }}>
            {/* Perfil da etapa atual, no canto superior esquerdo da tela */}
            <div className="flex items-end gap-2">
              {/* Troca de perfil: abre a 1ª jornada iniciada por ele, na 1ª etapa */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      className="flex items-center gap-1.5 rounded-t-md px-3 py-1 text-sm font-semibold text-white"
                      style={{ background: profileDef.color }}
                    />
                  }
                >
                  <UserRound className="size-3.5" /> {profile} <ChevronDown className="size-3.5 opacity-80" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="dark w-48">
                  {profiles.map((p) => (
                    <DropdownMenuItem key={p.name} onClick={() => trocarPerfil(p.name)}>
                      <span className="size-2 rounded-full" style={{ background: p.color }} />
                      {p.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Navegação entre etapas, com atalhos ← e → */}
              <div className="ml-auto flex items-center gap-2 pb-1.5">
                <Button variant="outline" size="sm" style={{ borderColor: profileDef.color, color: profileDef.color }} disabled={step === 0} onClick={() => go(jid, step - 1)}>
                  <ChevronLeft /> Anterior <kbd className="ml-1 rounded border border-current px-1 font-mono text-[10px] leading-4 opacity-70">←</kbd>
                </Button>
                <Button size="sm" className="text-white hover:opacity-90" style={{ background: profileDef.color }} disabled={step === journey.steps.length - 1} onClick={() => go(jid, step + 1)}>
                  Próxima <kbd className="ml-1 rounded border border-white/60 px-1 font-mono text-[10px] leading-4">→</kbd> <ChevronRight />
                </Button>
              </div>
            </div>
            <div
              ref={frameRef}
              className="flex min-h-0 flex-1 flex-col rounded-lg rounded-tl-none p-1 shadow-sm"
              style={{ background: profileDef.color }}
            >
              {/* Moldura na cor do perfil (canto sup. esq. reto, onde encosta o seletor); a tela dentro tem os 4 cantos arredondados. */}
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md bg-background">
              {/* Barra de navegador simulada */}
              <div className="flex shrink-0 items-center gap-3 border-b border-neutral-200 bg-neutral-100 px-3 py-1.5">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="size-2.5 rounded-full bg-[#febc2e]" />
                  <span className="size-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex gap-2 text-neutral-400">
                  <ChevronLeft className="size-4" />
                  <ChevronRight className="size-4" />
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-white px-3 py-1 text-xs text-neutral-500">
                  <Lock className="size-3 shrink-0" />
                  <span className="truncate">
                    {APP_HOST}
                    <span className="text-neutral-900">{shownPath}</span>
                  </span>
                </div>
              </div>
              <ScaledFrame ref={frame} src={src} scaled={device === 'desktop'} />
              </div>
            </div>
            </div>
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
                            onClose={() => setPanel(false)}
            />
          )}
        </div>

      </main>
      <Dialog open={!!restaurar} onOpenChange={(v) => !v && setRestaurar(null)}>
        <DialogContent className="dark sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{restaurar === 'tela' ? `Restaurar dados de “${areaName}”?` : 'Restaurar todo o protótipo?'}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {restaurar === 'tela'
              ? 'Tudo o que foi criado, editado ou decidido nesta tela volta ao estado inicial.'
              : 'Tudo o que foi criado, editado ou decidido em qualquer tela volta ao estado inicial.'}
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRestaurar(null)}>Cancelar</Button>
            <Button onClick={confirmarRestauracao}>Restaurar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
