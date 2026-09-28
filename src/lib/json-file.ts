import { useEffect, useState } from 'react'

// Em dev, salvar grava o arquivo na raiz do projeto (plugin no vite.config). Publicado: só leitura.
export const canEdit = import.meta.env.DEV

export function useJsonFile<T>(name: string, fallback: T) {
  const [data, setData] = useState<T>(fallback)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    fetch(`./${name}?t=${Date.now()}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [name])
  const save = (next: T) => {
    setData(next)
    if (canEdit)
      fetch(`./${name}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(next) })
  }
  return [data, save, loaded] as const
}
