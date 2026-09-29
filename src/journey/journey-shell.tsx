import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, MapPinPlus, MessageSquareText, Sparkles, RotateCcw, Lock, Workflow, X, ChevronUp, Monitor } from 'lucide-react'
import { MapaProcesso } from '@/pages/processo'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TourMsg } from '@/journey/spotlight'
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

// Perfis agrupados (grupo/caixa em profiles.ts): CTM → Gestor de contrato, PCP, Gestor de oferta, Pedagógico, Tutor, Monitor; DR solicitante → SENAI.
const grupoDe = (nome: string) => profileOf(nome).grupo ?? nome
const subDe = (nome: string) => profileOf(nome).caixa ?? null
const grupos = [...new Set(profiles.map((p) => grupoDe(p.name)))]
const membros = (g: string) => profiles.filter((p) => grupoDe(p.name) === g)

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
const APP_HOST = 'ctm.com.br'

// Desktop é renderizado numa largura fixa (padrão de tela) e reduzido por inteiro para caber, mantendo as proporções.
// Em telas maiores, a moldura para nessa largura (centralizada) em vez de esticar.
// A largura (resolução) pode ser trocada na barra Design; fica lembrada no navegador.
const RESOLUCOES = [1280, 1366, 1440, 1600, 1920, 2560]
const RESOLUCAO_PADRAO = 1600

function ScaledFrame({ ref, src, scaled, largura }: { ref: React.Ref<HTMLIFrameElement>; src: string; scaled: boolean; largura: number }) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = box.current!
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const k = scaled && size.w ? Math.min(1, size.w / largura) : 1
  return (
    <div ref={box} className="relative min-h-0 flex-1 overflow-hidden">
      <iframe
        ref={ref}
        src={src}
        title="Protótipo"
        allow="fullscreen" // telas do protótipo podem pedir tela cheia (ex.: Mapa do processo)
        className="absolute top-0 left-0 origin-top-left"
        style={
          k < 1
            ? { width: largura, height: size.h / k, transform: `scale(${k})` }
            : { width: '100%', height: '100%' }
        }
      />
    </div>
  )
}

// O sistema não tem versão responsiva: o protótipo é sempre desktop (largura fixa, reduzida para caber).
const devices = [{ id: 'desktop', width: '100%' }] as const

export function JourneyShell() {
  const [{ pid, jid, step }, setState] = useState(readHash)
  const device: (typeof devices)[number]['id'] = 'desktop'
  const [framePath, setFramePath] = useState<string | null>(null)
  const frame = useRef<HTMLIFrameElement>(null)

  // Anotações (pinos) ancoradas em elementos do protótipo.
  const [pins, addPin, removePin] = usePins()
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
    return j ? journeys.filter((x) => grupoDe(inicio(x)) === grupoDe(inicio(j))).indexOf(j) + 1 : 0
  }
  // Sem jornada: abre a 1ª tela do menu do perfil.
  const inicial = screens.find((x) => !x.hidden && (!x.profiles || x.profiles.includes(pid)))?.path ?? '/dashboard'
  const journey = visibleJourneys.find((j) => j.id === jid) ?? { ...FREE, steps: [{ title: 'Início', path: inicial }] }
  const current = journey.steps[step] ?? journey.steps[0]
  // Etapas da jornada atual, lidas no listener de mensagens; e marcação de que a troca de etapa veio da navegação no protótipo.
  const stepsRef = useRef(journey.steps)
  stepsRef.current = journey.steps
  const doFrame = useRef(false)
  const navegouAte = useRef(0)
  const profile = current.profile ?? pid
  const profileDef = profileOf(profile)
  const frameRef = useRef<HTMLDivElement>(null)
  // Topo mostra só o nome da área; a URL completa vai na barra do navegador simulada.
  const shownPath = framePath ?? current.path
  const areaName = screens.find((s) => s.path === screen)?.title ?? current.title
  const telaData = screens.find((s) => s.path === screen)?.data
  // src fixo: trocar de etapa muda só o hash do iframe, sem recarregar.
  // Ao recarregar a página, volta para a tela em que o usuário estava no protótipo (se a etapa da casca é a mesma).
  const restaurada = useRef<string | null>((() => { try { const t = JSON.parse(sessionStorage.getItem('casca-tela') ?? 'null'); return t?.h === location.hash ? t.path as string : null } catch { return null } })())
  const [src] = useState(() => `./?frame=1#${restaurada.current ?? current.path}`)

  // Tela cheia: esconde topo e mapa da jornada (fica só perfil, Anterior/Próxima e o protótipo) e pede tela cheia ao navegador.
  const [cheia, setCheia] = useState(false)
  const alternarTelaCheia = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else if (cheia) setCheia(false)
    // Sem permissão para tela cheia do navegador (ex.: embutido), só esconde a casca.
    else document.documentElement.requestFullscreen().then(() => setCheia(true), () => setCheia(true))
  }
  useEffect(() => {
    const onChange = () => setCheia(!!document.fullscreenElement)
    addEventListener('fullscreenchange', onChange)
    return () => removeEventListener('fullscreenchange', onChange)
  }, [])

  const go = (id: string, s: number) => setState({ pid, jid: id, step: s })
  const [mapa, setMapa] = useState(false)
  // Painel de perfil/jornada minimizável (lembrado no navegador).
  const [largura, setLarguraState] = useState(() => { try { return Number(localStorage.getItem('resolucao-prototipo')) || RESOLUCAO_PADRAO } catch { return RESOLUCAO_PADRAO } })
  const setLargura = (v: number) => { setLarguraState(v); try { localStorage.setItem('resolucao-prototipo', String(v)) } catch { /* sem armazenamento */ } }
  // Largura da coluna lateral: dá para arrastar a borda, só para diminuir (mín. 200px, máx. = padrão 256px); lembrada no navegador.
  const LARG_PAINEL = 256, LARG_PAINEL_MIN = 200
  const [largPainel, setLargPainel] = useState(() => { try { return Math.min(LARG_PAINEL, Math.max(LARG_PAINEL_MIN, Number(localStorage.getItem('casca-largura-painel')) || LARG_PAINEL)) } catch { return LARG_PAINEL } })
  const arrastarPainel = (e: React.PointerEvent) => {
    e.preventDefault()
    const x0 = e.clientX, w0 = largPainel
    let w = w0
    const mover = (ev: PointerEvent) => { w = Math.min(LARG_PAINEL, Math.max(LARG_PAINEL_MIN, w0 + ev.clientX - x0)); setLargPainel(w) }
    const soltar = () => { removeEventListener('pointermove', mover); removeEventListener('pointerup', soltar); try { localStorage.setItem('casca-largura-painel', String(w)) } catch { /* sem armazenamento */ } }
    addEventListener('pointermove', mover)
    addEventListener('pointerup', soltar)
  }
  const [painelMin, setPainelMinState] = useState(() => { try { return localStorage.getItem('painel-jornada-min') !== '0' } catch { return true } })
  const setPainelMin = (v: boolean) => { setPainelMinState(v); try { localStorage.setItem('painel-jornada-min', v ? '1' : '0') } catch { /* sem armazenamento */ } }
  // Guia da jornada (overlay com foco + explicação), lembrado no navegador.
  // Desligado por padrão; só liga quando a pessoa clica (lembrado no navegador).
  const [guia, setGuiaState] = useState(() => { try { return localStorage.getItem('guia-jornada') === '1' } catch { return false } })
  const setGuia = (v: boolean) => { setGuiaState(v); try { localStorage.setItem('guia-jornada', v ? '1' : '0') } catch { /* sem armazenamento */ } }
  const trocarPerfil = (p: Profile) => setState({ pid: p, jid: (journeys.find((j) => inicio(j) === p) ?? journeys.find((j) => grupoDe(inicio(j)) === grupoDe(p)) ?? FREE).id, step: 0 })
  // Subperfil (ex.: CTM: Gestor de contrato): abre a jornada equivalente dele (mesmo título), na mesma etapa; senão, a 1ª dele.
  const trocarSubperfil = (p: Profile) => {
    const eq = journeys.find((j) => inicio(j) === p && j.title === journey.title)
    if (eq) setState({ pid: p, jid: eq.id, step: Math.min(step, eq.steps.length - 1) })
    else trocarPerfil(p)
  }
  const grupo = grupoDe(pid)

  // Restaurar dados: confirma num diálogo próprio (confirm() nativo pode ser bloqueado), apaga o que o usuário
  // criou/alterou e recarrega a tela do protótipo, desfazendo também o estado da tela (modais abertas etc.).
  const [restaurar, setRestaurar] = useState<null | 'tela' | 'tudo'>(null)
  const confirmarRestauracao = () => {
    resetDb(restaurar === 'tela' ? telaData : undefined)
    frame.current?.contentWindow?.location.reload()
    setRestaurar(null)
  }

  // Atalhos: ← etapa anterior, → próxima, F tela cheia (ignora quando o foco está num campo de texto).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return
      if (e.key === 'ArrowLeft' && step > 0) go(jid, step - 1)
      else if (e.key === 'ArrowRight' && step < journey.steps.length - 1) go(jid, step + 1)
      else if (e.key === 'f' || e.key === 'F') alternarTelaCheia()
      else if (e.key === 'Escape' && cheia && !document.fullscreenElement) setCheia(false)
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
    else if (restaurada.current) restaurada.current = null // recarregou: o protótipo já abre na tela salva
    else if (win) {
      // A casca mandou o protótipo para esta rota: ignora os ecos de rota por um instante (evita pular de etapa
      // quando a mesma rota aparece em mais de uma etapa ou quando uma modal fecha sozinha).
      navegouAte.current = Date.now() + 1500
      win.location.hash = current.path
      // Guia: ao navegar pelo fluxograma, destaca o foco da etapa e explica o passo (overlay no protótipo).
      if (guia && journey.id) {
        const tour: TourMsg = { focus: current.focus, title: current.title, note: current.note, index: step, total: journey.steps.length, profile, color: profileDef.color, last: step === journey.steps.length - 1 }
        const t = setTimeout(() => win.postMessage({ src: 'ctm-guia', type: 'tour', tour }, location.origin), 450)
        return () => clearTimeout(t)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid, jid, step, current.path])

  // "Próxima etapa" clicada no cartão do guia (dentro do protótipo).
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.src !== 'ctm-tour' || e.data.type !== 'next') return
      setState((st) => ({ ...st, step: Math.min(st.step + 1, stepsRef.current.length - 1) }))
    }
    addEventListener('message', on)
    return () => removeEventListener('message', on)
  }, [])

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
        try { sessionStorage.setItem('casca-tela', JSON.stringify({ h: location.hash, path: m.path })) } catch { /* sem armazenamento */ }
        setScreen(m.screen)
        if (Date.now() < navegouAte.current) return
        // Destaque do fluxograma acompanha a tela vista: rota exata da etapa; senão, a mesma tela (padrão da rota).
        const steps = stepsRef.current
        // Etapas podem ter query (ex.: ?aba=execucao); o protótipo informa só o caminho.
        const caminho = (p: string) => p.split('?')[0]
        const padrao = new RegExp(`^${m.screen.replace(/:[^/]+/g, '[^/]+')}$`)
        // A mesma rota pode aparecer em mais de uma etapa (ex.: a lista no início e, no fim, com o item criado; ou
        // várias etapas na mesma tela com ?aba=): escolhe a ocorrência mais próxima da etapa atual, preferindo as seguintes.
        const exatas = steps.map((x, k) => (caminho(x.path) === m.path ? k : -1)).filter((k) => k >= 0)
        const candidatas = exatas.length ? exatas : steps.map((x, k) => (padrao.test(caminho(x.path)) ? k : -1)).filter((k) => k >= 0)
        if (candidatas.length)
          setState((st) => {
            if (candidatas.includes(st.step)) return st
            const i = candidatas.find((k) => k > st.step) ?? candidatas[candidatas.length - 1]
            doFrame.current = true
            return { ...st, step: i }
          })
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
        {/* Coluna lateral da casca: ferramentas (Análise, Design) e a jornada (perfil, jornada, etapas em lista vertical). */}
        {!cheia && (painelMin ? (
          <aside className="flex w-12 shrink-0 flex-col items-center gap-1.5 border-r border-white/10 py-3">
            <Button size="icon-sm" variant="outline" aria-label="Expandir painel" title="Expandir painel" onClick={() => setPainelMin(false)}><ChevronRight /></Button>
            <span className="my-1 size-2 rounded-full" style={{ background: profileOf(pid).color }} title={pid} />
            <Button size="icon-sm" variant="outline" aria-label="Etapa anterior (←)" title="Etapa anterior (←)" disabled={step === 0} motivo="Esta é a primeira etapa" onClick={() => go(jid, step - 1)}><ChevronUp /></Button>
            <Button size="icon-sm" className="text-white hover:opacity-90" style={{ background: profileDef.color }} aria-label="Próxima etapa (→)" title="Próxima etapa (→)" disabled={step === journey.steps.length - 1} motivo="Esta é a última etapa" onClick={() => go(jid, step + 1)}><ChevronDown /></Button>
          </aside>
        ) : (
          <aside className="casca-painel relative flex shrink-0 flex-col gap-3 overflow-y-auto border-r border-white/10 p-3" style={{ width: largPainel }}>
            {/* Alça de redimensionar (só diminui a partir do padrão) */}
            <div role="separator" aria-label="Redimensionar painel" title="Arraste para diminuir o painel" onPointerDown={arrastarPainel} className="absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize hover:bg-white/20" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Protótipo CTM</span>
              <Button size="icon-xs" variant="outline" aria-label="Minimizar painel" title="Minimizar painel" onClick={() => setPainelMin(true)}><ChevronLeft /></Button>
            </div>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 rounded-lg border bg-card/60 p-2">
              <span className="px-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Jornada</span>
          {/* Dois selects: primeiro o perfil, depois as jornadas que esse perfil inicia */}
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2">
            <label className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1">
            <span className="pl-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Perfil</span>
            <Select value={grupo} onValueChange={(v) => v && trocarPerfil(membros(v as string)[0].name)}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue>
                  {(v: string) => (
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ background: membros(v)[0]?.color }} />
                      {v}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="dark min-w-56" alignItemWithTrigger={false} searchable={false}>
                {grupos.map((g) => {
                  const n = visibleJourneys.filter((j) => grupoDe(inicio(j)) === g).length
                  return (
                    <SelectItem key={g} value={g}>
                      <span className="flex w-full items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full" style={{ background: membros(g)[0]?.color }} />
                          {g}
                        </span>
                        <span className="shrink-0 rounded bg-white/10 px-1.5 text-[10px] tabular-nums text-muted-foreground">{n} {n === 1 ? 'jornada' : 'jornadas'}</span>
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            </label>
            <label className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1">
            <span className="pl-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Jornada</span>
            {(() => {
              const doPerfil = visibleJourneys.filter((j) => grupoDe(inicio(j)) === grupo)
              return (
                <Select value={doPerfil.some((j) => j.id === jid) ? jid : ''} onValueChange={(v) => v && go(v as string, 0)} disabled={!doPerfil.length}>
                  <SelectTrigger size="sm" className="w-full min-w-0">
                    <SelectValue className="truncate">{(v: string) => { const j = journeys.find((x) => x.id === v); return j ? `${numero(j.id)}. ${j.title}${subDe(inicio(j)) ? ` (${subDe(inicio(j))})` : ''}` : doPerfil.length ? 'Escolha a jornada' : 'Sem jornadas' }}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="dark w-max max-w-[36rem] min-w-72" alignItemWithTrigger={false} searchable={false}>
                    {doPerfil.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        <span className="flex w-full items-center justify-between gap-3">
                          <span className="whitespace-normal">{numero(j.id)}. {j.title}{subDe(inicio(j)) && <span className="ml-1.5 text-[10px] text-muted-foreground">({subDe(inicio(j))})</span>}</span>
                          <span className="shrink-0 rounded bg-white/10 px-1.5 text-[10px] tabular-nums text-muted-foreground">{j.steps.length} {j.steps.length === 1 ? 'etapa' : 'etapas'}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            })()}
            </label>
          </div>
              {/* Etapas em lista vertical */}
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1 rounded-md bg-background p-1.5">
                {journey.steps.map((st, i) => {
                  const atual = i === step
                  const cor = profileOf(st.profile ?? journey.profile).color
                  return (
                    <button
                      key={i}
                      onClick={() => go(jid, i)}
                      title={st.note}
                      className={cn('flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors hover:brightness-125', atual ? 'font-medium text-white' : 'text-foreground/85')}
                      // Preenchimento na cor do perfil: sólido na etapa atual, translúcido nas demais.
                      style={{ borderColor: cor, background: atual ? cor : `${cor}33` }}
                    >
                      <span className="w-4 shrink-0 text-[10px] tabular-nums opacity-70">{i + 1}</span>
                      <span className="min-w-0 flex-1">{st.title}<span className="block text-[10px] opacity-70">{st.profile ?? journey.profile}</span></span>
                    </button>
                  )
                })}
              </div>
              <div className="grid grid-cols-2 gap-1 [&>*]:w-full">
              <Button size="sm" variant="outline" className="w-full" aria-label="Etapa anterior (←)" title="Etapa anterior (←)" disabled={step === 0} motivo="Esta é a primeira etapa" onClick={() => go(jid, step - 1)}><ChevronLeft /> Anterior</Button>
              <Button size="sm" className="w-full text-white hover:opacity-90" style={{ background: profileDef.color }} aria-label="Próxima etapa (→)" title="Próxima etapa (→)" disabled={step === journey.steps.length - 1} motivo="Esta é a última etapa" onClick={() => go(jid, step + 1)}>Próxima <ChevronRight /></Button>
            </div>
            </div>
            <div className="casca-grupo grid gap-0.5 rounded-lg border bg-card/60 p-1.5">
              <span className="px-1.5 pt-0.5 pb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Análise</span>
              {/* Mapa do processo (BPMN): painel da casca, não é tela do protótipo */}
              <Button size="sm" variant="ghost" className={cn(mapa && 'bg-white text-neutral-900 hover:bg-white/90 hover:text-neutral-900')} onClick={() => setMapa(!mapa)}>
                <Workflow /> Mapa do processo
              </Button>
              {canEdit && (
                <Button
                  disabled={device !== 'desktop'} motivo="Disponível só na visão desktop"
                  title={device !== 'desktop' ? 'Anotações só na visão desktop' : 'Marcar um ponto da tela com um requisito, dúvida ou ajuste'}
                  size="sm"
                  variant="ghost"
                  className={cn(mode === 'add' && 'bg-white text-neutral-900 hover:bg-white/90 hover:text-neutral-900')}
                  onClick={() => setMode(mode === 'add' ? 'view' : 'add')}
                >
                  <MapPinPlus /> {mode === 'add' ? 'Clique na tela… (Esc)' : 'Anotar'}
                </Button>
              )}
              <Button size="sm" variant="ghost" className={cn(panel && 'bg-white text-neutral-900 hover:bg-white/90 hover:text-neutral-900')} title="Anotações desta tela" onClick={() => setPanel(!panel)}>
                <MessageSquareText /> Anotações <span className="tabular-nums text-muted-foreground">{screenPins.length}</span>
              </Button>
            </div>
            <div className="casca-grupo grid gap-0.5 rounded-lg border bg-card/60 p-1.5">
              <span className="px-1.5 pt-0.5 pb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Design</span>
              <Button size="sm" variant="ghost" className={cn(guia && 'bg-white text-neutral-900 hover:bg-white/90 hover:text-neutral-900')} title="Destacar o foco e explicar cada etapa ao navegar pelo fluxograma" onClick={() => setGuia(!guia)}>
                <Sparkles /> Etapas guiadas {guia ? 'ligadas' : 'desligadas'}
              </Button>
              <Button size="sm" variant="ghost" title="Abre o protótipo em nova aba, no perfil e na tela atuais" render={<a href={`./?frame=1&perfil=${encodeURIComponent(profile)}#${shownPath}`} target="_blank" rel="noreferrer" />} nativeButton={false}>
                <ExternalLink /> Abrir protótipo
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button size="sm" variant="ghost" title="Resolução considerada para o protótipo (a tela é reduzida por inteiro para caber)" />}>
                  <Monitor /> <span className="tabular-nums">{largura} px</span> <ChevronDown className="size-3.5 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="dark w-40">
                  {RESOLUCOES.map((r) => (
                    <DropdownMenuItem key={r} className={cn('tabular-nums', r === largura && 'font-semibold')} onClick={() => setLargura(r)}>
                      {r} px{r === RESOLUCAO_PADRAO && <span className="text-muted-foreground ml-auto text-xs font-normal">padrão</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button size="sm" variant="ghost" />}>
                  <RotateCcw /> Restaurar dados
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark w-56">
                  <DropdownMenuItem disabled={!telaData?.length} onClick={() => setRestaurar('tela')}>
                    Somente desta tela
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRestaurar('tudo')}>
                    Todo o protótipo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </aside>
        ))}
      <main className="flex min-w-0 flex-1 flex-col">

        <div className="flex min-h-0 flex-1">
          <div className={cn('flex min-h-0 flex-1 justify-center overflow-auto', cheia ? 'px-2 pt-1 pb-2' : 'p-4')}>
            <div className="flex h-full flex-col transition-[width]" style={{ width: devices.find((d) => d.id === device)!.width, maxWidth: largura + 28 }}>
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
                  <span className="font-normal opacity-80">Área:</span> {grupoDe(profile)} <ChevronDown className="size-3.5 opacity-80" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="dark w-48">
                  {grupos.map((g) => (
                    <DropdownMenuItem key={g} onClick={() => trocarPerfil(membros(g)[0].name)}>
                      <span className="size-2 rounded-full" style={{ background: membros(g)[0]?.color }} />
                      {g}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Subperfis do perfil (ex.: CTM → Gestor de contrato, Gestor de oferta), enfileirados; clicar seleciona */}
              {membros(grupoDe(profile)).length > 1 && (
                <span className="self-center pl-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Subperfil:</span>
              )}
              {membros(grupoDe(profile)).length > 1 &&
                membros(grupoDe(profile)).map((m) => {
                  const ativo = m.name === profile
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => !ativo && trocarSubperfil(m.name)}
                      title={m.avaliacao ? 'Em avaliação' : undefined}
                      className={cn('rounded-t-md border border-b-0 px-3 py-1 text-sm transition-colors', ativo ? 'font-semibold text-white' : 'hover:brightness-125', m.avaliacao && !ativo && 'border-dashed')}
                      style={ativo ? { background: m.color, borderColor: m.color } : { borderColor: `${m.color}88`, color: m.color, background: `${m.color}1a` }}
                    >
                      {subDe(m.name)}{m.avaliacao && <span className="ml-1 text-[10px] opacity-70">?</span>}
                    </button>
                  )
                })}
              {/* Navegação entre etapas, com atalhos ← e →: fica no painel de jornada; aqui só em tela cheia (painel escondido) */}
              {cheia && <div className="ml-auto flex items-center gap-2 pb-1.5">
                <span className="mr-1 text-xs text-muted-foreground">
                    {journey.title} · <span className="tabular-nums">{step + 1}/{journey.steps.length}</span> {current.title}
                  </span>
                <Button variant="outline" size="sm" style={{ borderColor: profileDef.color, color: profileDef.color }} disabled={step === 0} motivo="Esta é a primeira etapa" onClick={() => go(jid, step - 1)}>
                  <ChevronLeft /> Anterior <kbd className="ml-1 rounded border border-current px-1 font-mono text-[10px] leading-4 opacity-70">←</kbd>
                </Button>
                <Button size="sm" className="text-white hover:opacity-90" style={{ background: profileDef.color }} disabled={step === journey.steps.length - 1} motivo="Esta é a última etapa" onClick={() => go(jid, step + 1)}>
                  Próxima <kbd className="ml-1 rounded border border-white/60 px-1 font-mono text-[10px] leading-4">→</kbd> <ChevronRight />
                </Button>
              </div>}
            </div>
            {/* Monitor: moldura escura (separa o protótipo da casca), com a tela dentro e o pé embaixo.
                A faixa na cor do perfil no topo da tela liga a moldura às abas de perfil acima. */}
            <div
              ref={frameRef}
              className="flex min-h-0 flex-1 flex-col rounded-[1.25rem] rounded-tl-none bg-[#141518] p-2.5 shadow-[0_20px_40px_-12px_rgb(0_0_0/0.6),inset_0_0_0_1px_rgb(255_255_255/0.08)]"
            >
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md bg-background ring-1 ring-black">
              <div className="h-1 shrink-0" style={{ background: profileDef.color }} />
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
              <ScaledFrame ref={frame} src={src} scaled={device === 'desktop'} largura={largura} />
              </div>
            </div>
            {/* Pé do monitor (fora da tela cheia) */}
            {!cheia && (
              <div className="flex shrink-0 flex-col items-center" aria-hidden>
                <div className="h-3 w-24 bg-gradient-to-b from-[#0b0c0e] to-[#26282d]" />
                <div className="h-1.5 w-56 rounded-t-md rounded-b-sm bg-[#26282d] shadow-[0_4px_10px_rgb(0_0_0/0.5)]" />
              </div>
            )}
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
              onDelete={removePin}
              onCancelDraft={() => setDraft(null)}
                            onClose={() => setPanel(false)}
            />
          )}
        </div>

      </main>
      {/* Painel do Mapa do processo (da casca, sobre o protótipo) */}
      {mapa && (
        <div className="fixed inset-3 z-40 flex flex-col overflow-hidden rounded-xl border bg-background shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-2.5">
            <span className="flex items-center gap-2 text-sm font-semibold"><Workflow className="size-4" /> Mapa do processo</span>
            <Button size="icon-sm" variant="ghost" aria-label="Fechar mapa" onClick={() => setMapa(false)}><X /></Button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-4">
            <MapaProcesso
              preencher
              abrirTela={(path) => {
                const w = frame.current?.contentWindow
                if (w) w.location.hash = path
                setMapa(false)
              }}
            />
          </div>
        </div>
      )}
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
