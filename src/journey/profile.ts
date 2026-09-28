import { useSyncExternalStore } from 'react'

// Perfil ativo dentro do protótipo, enviado pela casca. Use nas telas:
//   const perfil = useProfile(); if (perfil === 'DR credenciada') …
let current = ''
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
