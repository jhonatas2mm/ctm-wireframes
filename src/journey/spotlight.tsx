import { useEffect, useLayoutEffect, useState } from 'react'
import { ArrowRight, Sparkles, X } from 'lucide-react'

// Guia da jornada (dentro do protótipo): quando a casca troca de etapa pelo fluxograma, escurece a tela,
// deixa "vazado" o elemento em foco e mostra um cartão explicando o passo.
// Mensagem da casca: { src: 'ctm-guia', type: 'tour', tour: TourMsg | null }.
// focus: seletor CSS ou "text=Texto do botão" (procura o menor elemento clicável/título com esse texto).
export type TourMsg = { focus?: string; title: string; note?: string; index: number; total: number; profile?: string; color?: string; last: boolean }

function acharAlvo(focus?: string): HTMLElement | null {
  if (!focus) return null
  if (focus.startsWith('text=')) {
    const alvo = focus.slice(5).trim().toLowerCase()
    const cands = [...document.querySelectorAll<HTMLElement>('button, a, [role="button"], [role="tab"], th, h1, h2, h3, label, [data-slot="card"], section, [data-slot="data-table"]')]
      .filter((el) => el.offsetParent !== null && el.innerText.trim().toLowerCase().includes(alvo))
    // O menor elemento que contém o texto (evita marcar a página inteira).
    return cands.sort((a, b) => a.offsetWidth * a.offsetHeight - b.offsetWidth * b.offsetHeight)[0] ?? null
  }
  try {
    return document.querySelector<HTMLElement>(focus)
  } catch {
    return null
  }
}

export function Spotlight() {
  const [tour, setTour] = useState<TourMsg | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.src !== 'ctm-guia' || e.data.type !== 'tour') return
      setTour(e.data.tour)
      setRect(null)
    }
    addEventListener('message', on)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setTour(null)
    addEventListener('keydown', esc)
    return () => (removeEventListener('message', on), removeEventListener('keydown', esc))
  }, [])

  // Procura o alvo (a tela pode ainda estar renderizando) e acompanha rolagem/redimensionamento.
  useLayoutEffect(() => {
    if (!tour?.focus) return
    let tentativas = 0, el: HTMLElement | null = null
    const medir = () => el && setRect(el.getBoundingClientRect())
    const achar = setInterval(() => {
      el = acharAlvo(tour.focus)
      if (el || ++tentativas > 20) {
        clearInterval(achar)
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' })
          setTimeout(medir, 350)
        }
      }
    }, 100)
    addEventListener('scroll', medir, true)
    addEventListener('resize', medir)
    return () => (clearInterval(achar), removeEventListener('scroll', medir, true), removeEventListener('resize', medir))
  }, [tour])

  if (!tour) return null
  const cor = tour.color ?? '#E84910'
  const pad = 8
  const hole = rect && { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
  // Cartão abaixo do alvo; se não couber, acima; sem alvo, no centro.
  const cardW = 360
  const abaixo = hole && hole.top + hole.height + 220 < innerHeight
  const cardPos: React.CSSProperties = hole
    ? {
        left: Math.min(Math.max(16, hole.left), innerWidth - cardW - 16),
        ...(abaixo ? { top: hole.top + hole.height + 14 } : { bottom: innerHeight - hole.top + 14 }),
      }
    : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }

  const proxima = () => {
    setTour(null)
    parent.postMessage({ src: 'ctm-tour', type: 'next' }, location.origin)
  }

  return (
    <div className="fixed inset-0 z-[9998]" onClick={() => setTour(null)}>
      {hole ? (
        <div
          className="pointer-events-none absolute rounded-2xl transition-all duration-300"
          style={{ ...hole, boxShadow: `0 0 0 3px ${cor}, 0 0 0 9999px rgb(15 17 20 / 0.58)` }}
        >
          <span className="absolute inset-0 animate-ping rounded-2xl" style={{ boxShadow: `0 0 0 3px ${cor}`, opacity: 0.35 }} />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[rgb(15_17_20/0.58)]" />
      )}
      <div
        className="absolute rounded-2xl bg-white p-5 text-[#22272A] shadow-2xl"
        style={{ width: cardW, ...cardPos }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ background: cor }}>
            <Sparkles className="size-3.5" /> Etapa {tour.index + 1} de {tour.total}
          </span>
          <button type="button" aria-label="Fechar" onClick={() => setTour(null)} className="rounded-full p-1 text-[#617379] hover:bg-[#F5F5F7]">
            <X className="size-4" />
          </button>
        </div>
        <div className="text-base font-bold">{tour.title}</div>
        {tour.profile && <div className="text-xs text-[#617379]">Perfil: {tour.profile}</div>}
        {tour.note && <p className="mt-2 text-sm leading-relaxed text-[#3D4448]">{tour.note}</p>}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button type="button" onClick={() => setTour(null)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#617379] hover:bg-[#F5F5F7]">Entendi</button>
          {!tour.last && (
            <button type="button" onClick={proxima} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-white" style={{ background: cor }}>
              Próxima etapa <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
