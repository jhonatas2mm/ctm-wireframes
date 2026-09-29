import { useSyncExternalStore } from 'react'

// "Banco" mockado: coleções salvas no localStorage do navegador, semeadas a partir de src/lib/mock.ts.
// O que for criado/editado no protótipo continua lá após recarregar. resetDb() volta ao seed.
//
//   const itens = useCollection('itens', seedItens)
//   itens.all / itens.get(id) / itens.add({...}) / itens.update(id, {...}) / itens.remove(id)

const PREFIX = 'ctm-db:'

// Auditoria em todo o sistema: todo registro guarda quem criou e quem alterou por último, com data e hora.
// O autor é o usuário do perfil ativo (definido pelo AppShell). Registros de exemplo = "Carga inicial".
export type Auditoria = { criadoPor: string; criadoEm: string; alteradoPor?: string; alteradoEm?: string }
let autorAtual = 'Sistema'
export const definirAutor = (nome: string) => { autorAtual = nome }
const CARGA: Auditoria = { criadoPor: 'Carga inicial', criadoEm: '2026-09-28T09:00:00' }
export const auditoriaDe = (x: unknown): Auditoria | undefined => (x && typeof x === 'object' && 'auditoria' in x ? (x as { auditoria: Auditoria }).auditoria : undefined)
const comAuditoria = <T,>(xs: T[]): T[] => xs.map((x) => (x && typeof x === 'object' && !('auditoria' in x) ? { ...x, auditoria: CARGA } : x))
const subs = new Set<() => void>()
const cache = new Map<string, { raw: string | null; value: unknown }>()
const notify = () => subs.forEach((f) => f())

// Outra aba/iframe mudou os dados (ex.: reset pela casca) → atualiza.
addEventListener('storage', (e) => {
  if (e.key === null || e.key.startsWith(PREFIX)) notify()
})

function read<T>(name: string, seed: T[]): T[] {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(PREFIX + name)
  } catch {
    /* sem storage: usa o seed */
  }
  const hit = cache.get(name)
  if (hit && hit.raw === raw) return hit.value as T[]
  let value: T[] = seed
  if (raw) {
    try {
      value = JSON.parse(raw)
    } catch {
      /* corrompido: usa o seed */
    }
  }
  value = comAuditoria(value)
  cache.set(name, { raw, value })
  return value
}

function write<T>(name: string, value: T[]) {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(value))
  } catch {
    /* ignore */
  }
  notify()
}

// Sem `only`: apaga tudo. Com `only`: só essas coleções (nome sem a versão, ex.: 'editais' pega 'editais-v7').
export function resetDb(only?: string[]) {
  const alvo = (k: string) => !only || only.some((n) => new RegExp(`^${PREFIX}${n}(-v\\d+)?$`).test(k))
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX) && alvo(k))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
  notify()
}

export function useCollection<T extends { id: string }>(name: string, seed: T[]) {
  const all = useSyncExternalStore(
    (f) => (subs.add(f), () => void subs.delete(f)),
    () => read(name, seed),
  )
  return {
    all,
    get: (id: string | undefined) => all.find((x) => x.id === id),
    add: (item: Omit<T, 'id'> & { id?: string }) => {
      const full = { ...item, id: item.id ?? crypto.randomUUID().slice(0, 8), auditoria: { criadoPor: autorAtual, criadoEm: new Date().toISOString() } } as unknown as T
      write(name, [full, ...read(name, seed)])
      return full
    },
    update: (id: string, patch: Partial<T>) =>
      write(name, read(name, seed).map((x) => (x.id === id ? { ...x, ...patch, auditoria: { ...(auditoriaDe(x) ?? CARGA), alteradoPor: autorAtual, alteradoEm: new Date().toISOString() } } : x))),
    remove: (id: string) => write(name, read(name, seed).filter((x) => x.id !== id)),
  }
}
