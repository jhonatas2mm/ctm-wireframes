import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { Pin } from './types'

// Anotações compartilhadas no Supabase (projeto ctm-wireframes). Chave pública: a tabela
// `pins` permite ler, criar e excluir; editar só pelo painel do Supabase.
const supabase = createClient(
  'https://wbsrougffckahooleuzl.supabase.co',
  'sb_publishable_2fAPCwptNrKtWgaMChrbAQ_pg33p_PI',
)

export const canEdit = true // qualquer visitante cria anotações
export const canManage = false // editar bloqueado pela RLS
export const canDelete = true // qualquer visitante exclui

type Row = { id: string; data: Omit<Pin, 'id'> }
const toPin = (r: Row): Pin => ({ ...r.data, id: r.id })

export function usePins() {
  const [pins, setPins] = useState<Pin[]>([])
  useEffect(() => {
    const merge = (list: Pin[]) =>
      setPins((cur) => {
        const ids = new Set(cur.map((p) => p.id))
        return [...cur, ...list.filter((p) => !ids.has(p.id))]
      })
    supabase
      .from('pins')
      .select('id, data')
      .order('created_at')
      .then(({ data }) => data && merge((data as Row[]).map(toPin)))
    const channel = supabase
      .channel('pins')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pins' }, (e) => merge([toPin(e.new as Row)]))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pins' }, (e) =>
        setPins((cur) => cur.filter((p) => p.id !== (e.old as { id: string }).id)),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  const add = (pin: Pin) => {
    setPins((cur) => [...cur, pin])
    const { id, ...data } = pin
    supabase.from('pins').insert({ id, data }).then(({ error }) => error && console.error('Falha ao salvar anotação', error))
  }
  const remove = (id: string) => {
    setPins((cur) => cur.filter((p) => p.id !== id))
    supabase.from('pins').delete().eq('id', id).then(({ error }) => error && console.error('Falha ao excluir anotação', error))
  }
  return [pins, add, remove] as const
}

const AUTHOR_KEY = 'ctm-autor'
export const getAuthor = () => {
  try {
    return localStorage.getItem(AUTHOR_KEY) ?? ''
  } catch {
    return ''
  }
}
export const setAuthor = (name: string) => {
  try {
    localStorage.setItem(AUTHOR_KEY, name)
  } catch {
    /* sem storage */
  }
}
