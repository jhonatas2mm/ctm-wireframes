import { useSyncExternalStore } from 'react'

// Perfil ativo dentro do protótipo, enviado pela casca. Use nas telas:
//   const perfil = useProfile(); if (perfil === 'CTM: Gestor de oferta') …
// Fora da casca (aba aberta por "Abrir protótipo"), o perfil vem da URL (?perfil=).
let current = new URLSearchParams(location.search).get('perfil') ?? ''
const subs = new Set<() => void>()

addEventListener('message', (e: MessageEvent) => {
  if (e.origin === location.origin && e.data?.src === 'ctm-shell' && e.data.profile && e.data.profile !== current) {
    current = e.data.profile
    subs.forEach((f) => f())
  }
})

export function useProfile() {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => void subs.delete(f)),
    () => current,
  )
}
