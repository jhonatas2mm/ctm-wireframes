import { useEffect, useReducer, useState } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { screens } from '@/screens'
import { kinds, type ToFrame, type ToShell } from './types'

type Msg = ToShell extends infer T ? (T extends ToShell ? Omit<T, 'src'> : never) : never
const post = (m: Msg) => parent.postMessage({ src: 'ctm-frame', ...m }, location.origin)

// Rotas estáticas antes das com parâmetro (/itens/novo antes de /itens/:id).
const patterns = screens.map((s) => s.path).sort((a, b) => Number(a.includes(':')) - Number(b.includes(':')))
const screenOf = (path: string) => patterns.find((p) => matchPath(p, path)) ?? path

function selectorFor(el: Element) {
  const parts: string[] = []
  let e: Element = el
  while (e !== document.body && e.parentElement) {
    const tag = e.tagName
    const idx = [...e.parentElement.children].filter((c) => c.tagName === tag).indexOf(e) + 1
    parts.unshift(`${tag.toLowerCase()}:nth-of-type(${idx})`)
    e = e.parentElement
  }
  return ['body', ...parts].join(' > ')
}

/** Camada de pinos dentro do protótipo. Só existe quando rodando dentro da casca. */
export function PinLayer() {
  const { pathname } = useLocation()
  const [st, setSt] = useState<Omit<ToFrame, 'src'>>({ profile: '', mode: 'off', pins: [], active: null })
  const [hover, setHover] = useState<DOMRect | null>(null)
  const [, redraw] = useReducer((x: number) => x + 1, 0)

  useEffect(() => post({ type: 'route', path: pathname, screen: screenOf(pathname) }), [pathname])

  useEffect(() => {
    const onMsg = (e: MessageEvent<ToFrame>) => {
      if (e.origin === location.origin && e.data?.src === 'ctm-shell') setSt(e.data)
    }
    addEventListener('message', onMsg)
    return () => removeEventListener('message', onMsg)
  }, [])

  // Reposiciona pinos quando a página rola, redimensiona ou muda.
  useEffect(() => {
    let raf = 0
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(redraw)
    }
    addEventListener('scroll', schedule, true)
    addEventListener('resize', schedule)
    const mo = new MutationObserver(schedule)
    mo.observe(document.body, { subtree: true, childList: true, attributes: true })
    return () => {
      removeEventListener('scroll', schedule, true)
      removeEventListener('resize', schedule)
      mo.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  // Modo "anotar": captura o clique antes do protótipo e devolve a âncora para a casca.
  useEffect(() => {
    if (st.mode !== 'add') return setHover(null)
    const valid = (t: EventTarget | null) =>
      t instanceof Element && !t.closest('[data-pin-layer]') ? t : null
    const onMove = (e: MouseEvent) => setHover(valid(e.target)?.getBoundingClientRect() ?? null)
    const onClick = (e: MouseEvent) => {
      const el = valid(e.target)
      if (!el) return
      e.preventDefault()
      e.stopPropagation()
      const r = el.getBoundingClientRect()
      post({ type: 'pick', selector: selectorFor(el), x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, px: e.clientX + scrollX, py: e.clientY + scrollY })
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && post({ type: 'cancel' })
    const block = (e: Event) => {
      if (valid(e.target)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('mousemove', onMove, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('pointerdown', block, true)
    document.addEventListener('mousedown', block, true)
    document.addEventListener('keydown', onKey)
    document.body.style.cursor = 'crosshair'
    return () => {
      document.removeEventListener('mousemove', onMove, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('pointerdown', block, true)
      document.removeEventListener('mousedown', block, true)
      document.removeEventListener('keydown', onKey)
      document.body.style.cursor = ''
    }
  }, [st.mode])

  // Pino "solto": elemento âncora sumiu → usa a posição de reserva e fica vermelho.
  const placed = st.pins.map((p) => {
    const el = document.querySelector(p.selector)
    const r = el?.getBoundingClientRect()
    if (r && (r.width || r.height)) return { p, left: r.left + p.x * r.width, top: r.top + p.y * r.height, orphan: false }
    return { p, left: (p.px ?? 24) - scrollX, top: (p.py ?? 24 + p.n * 32) - scrollY, orphan: true }
  })
  const orphanKey = placed.filter((x) => x.orphan && x.p.id !== 'draft').map((x) => x.p.id).join()
  useEffect(() => post({ type: 'orphans', ids: orphanKey ? orphanKey.split(',') : [] }), [orphanKey])

  if (st.mode === 'off') return null

  return (
    <div data-pin-layer className="pointer-events-none fixed inset-0 z-[9999]">
      {hover && (
        <div
          className="absolute rounded-sm outline-2 outline-blue-500 outline-dashed"
          style={{ left: hover.left, top: hover.top, width: hover.width, height: hover.height }}
        />
      )}
      {placed.map(({ p, left, top, orphan }) => {
        const active = st.active === p.id
        return (
          <div
            key={p.id}
            className="group absolute"
            style={{ left, top }}
          >
            <button
              onClick={() => post({ type: 'select', id: p.id })}
              className={cn(
                'pointer-events-auto flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full rounded-bl-none text-[11px] font-semibold text-white shadow-md ring-2 ring-white transition-transform',
                orphan ? 'bg-red-600' : kinds[p.kind].color,
                active && 'scale-125 ring-black',
              )}
            >
              {p.n || '+'}
            </button>
            {p.text && (
              <div
                className={cn(
                  'absolute top-3 left-3 hidden w-60 rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-lg group-hover:block',
                  active && 'block',
                )}
              >
                <p className="mb-1 font-semibold">
                  {kinds[p.kind].label}
                  {orphan && <span className="ml-1 font-normal text-red-600">· elemento não encontrado</span>}
                </p>
                <p className="whitespace-pre-wrap">{p.text}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
