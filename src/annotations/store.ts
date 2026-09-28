import { useEffect, useState } from 'react'
import type { Pin } from './types'

// Em dev, gravar escreve em annotations.json (plugin no vite.config). Publicado: só leitura.
export const canEdit = import.meta.env.DEV

export function usePins() {
  const [pins, setPins] = useState<Pin[]>([])
  useEffect(() => {
    fetch(`./annotations.json?t=${Date.now()}`)
      .then((r) => r.json())
      .then(setPins)
      .catch(() => setPins([]))
  }, [])
  const save = (next: Pin[]) => {
    setPins(next)
    if (canEdit)
      fetch('./annotations.json', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(next) })
  }
  return [pins, save] as const
}
