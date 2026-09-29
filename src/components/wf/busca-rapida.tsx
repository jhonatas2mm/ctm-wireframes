import { useEffect, useMemo, useState } from 'react'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'
import { useNavigate } from 'react-router-dom'
import { Building2, CornerDownLeft, FileSignature, FileSpreadsheet, GraduationCap, LayoutGrid, Package, Search, UserRound, Users, Video, type LucideIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { screens } from '@/screens'
import {
  alertasAluno, situacaoAluno, statusTurmaEad,
  instrumentoDe, nomeParte, useAlunosEad, useContratos, useContratosCtm, useDrs, useEditais, useProdutos, useTurmasEad, useUsuarios,
} from '@/lib/mock'

// Busca rápida (⌘K / Ctrl+K): telas do menu + registros que o perfil enxerga.
// "Inteligente": ignora acentos e maiúsculas, aceita várias palavras em qualquer ordem
// e procura também por situação/motivo (ex.: "risco", "sem acesso", "evadido panvel").
type Item = { grupo: string; titulo: string; sub?: string; to: string; icon: LucideIcon; chaves?: string }

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function BuscaRapida({ telas }: { telas: string[] }) {
  const [aberta, setAberta] = useState(false)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const navigate = useNavigate()
  const pode = (p: string) => telas.includes(p)

  // Mesmo escopo das telas de acompanhamento: DR solicitante só vê a própria DR.
  const perfil = useProfile()
  const uf = perfil.startsWith('DR solicitante') ? profileOf(perfil).dr?.sigla.replace('SENAI-', '') : undefined
  const contratosCtm = useContratosCtm().all.filter((c) => !uf || c.dr === uf)
  const turmas = useTurmasEad().all.filter((t) => contratosCtm.some((c) => c.id === t.contratoId))
  const alunos = useAlunosEad().all.filter((a) => turmas.some((t) => t.id === a.turmaId))
  const editais = useEditais().all
  const propostas = useProdutos().all
  const drs = useDrs().all
  const taas = useContratos().all
  const usuarios = useUsuarios().all

  // Atalho global ⌘K / Ctrl+K
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setAberta((a) => !a)
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  const itens = useMemo<Item[]>(() => {
    const r: Item[] = screens.filter((s) => !s.hidden && pode(s.path)).map((s) => ({ grupo: 'Telas', titulo: s.title, to: s.path, icon: LayoutGrid }))
    const turmaDe = (id: string) => turmas.find((t) => t.id === id)
    if (pode('/alunos'))
      alunos.forEach((a) => {
        const t = turmaDe(a.turmaId)
        if (!t) return
        const emp = contratosCtm.find((c) => c.id === t.contratoId)?.empresa ?? ''
        r.push({ grupo: 'Alunos', titulo: a.nome, sub: `${situacaoAluno(a, t)} · ${t.codigo} · ${emp}`, to: `/alunos/${a.id}`, icon: UserRound, chaves: `${a.email} ${t.curso} ${alertasAluno(a, t).join(' ')}` })
      })
    if (pode('/turmas-ead'))
      turmas.forEach((t) => {
        const emp = contratosCtm.find((c) => c.id === t.contratoId)?.empresa ?? ''
        r.push({ grupo: 'Turmas', titulo: t.curso, sub: `${t.codigo} · ${emp} · ${statusTurmaEad(t)}`, to: `/turmas-ead/${t.id}`, icon: Video, chaves: t.tutor })
      })
    if (pode('/contratos'))
      contratosCtm.forEach((c) => r.push({ grupo: 'Contratos', titulo: c.empresa, sub: `${c.numero} · ${c.status}`, to: `/contratos/${c.id}`, icon: FileSignature, chaves: `${c.cnpj} ${c.cursos.join(' ')}` }))
    if (pode('/editais'))
      editais.forEach((e) => r.push({ grupo: 'Editais', titulo: e.numero, sub: `${e.cursos.length} cursos · ${e.vigenciaInicio} a ${e.vigenciaFim}`, to: '/editais', icon: FileSpreadsheet, chaves: `${e.cursos.map((c) => c.nome).join(' ')} ${e.drs.join(' ')}` }))
    if (pode('/produtos'))
      propostas.forEach((p) => r.push({ grupo: 'Propostas', titulo: p.numero, sub: `SENAI-${p.drContratante} · ${p.status ?? 'Rascunho'}`, to: `/produtos/${p.id}`, icon: Package, chaves: p.cursos.map((c) => c.nome).join(' ') }))
    if (pode('/dashboard'))
      taas.forEach((t) => r.push({ grupo: 'TAAs e contratos', titulo: `${instrumentoDe(t.contratante)} ${t.numero}`, sub: `${nomeParte(t.contratante)} → CTM SENAI-${t.dr} · ${t.status}`, to: `/dashboard/${t.id}`, icon: FileSignature }))
    if (pode('/drs'))
      drs.forEach((d) => r.push({ grupo: 'DRs', titulo: d.nome, sub: `SENAI-${d.uf} · ${d.status}`, to: '/drs', icon: Building2, chaves: `${d.responsavel} ${d.regiao}` }))
    if (pode('/admin/usuarios'))
      usuarios.forEach((u) => r.push({ grupo: 'Usuários', titulo: u.nome, sub: `${u.perfil} · ${u.email}`, to: `/admin/usuarios/${u.id}`, icon: Users }))
    return r
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telas.join(), alunos, turmas, contratosCtm, editais, propostas, drs, taas, usuarios])

  const resultados = useMemo(() => {
    const termos = norm(q).split(/\s+/).filter(Boolean)
    if (!termos.length) return itens.filter((i) => i.grupo === 'Telas')
    return itens
      .map((i) => {
        const titulo = norm(i.titulo), texto = norm(`${i.titulo} ${i.sub ?? ''} ${i.chaves ?? ''} ${i.grupo}`)
        if (!termos.every((t) => texto.includes(t))) return null
        // Relevância: começa com o termo > está no título > está no resto
        const score = termos.reduce((n, t) => n + (titulo.startsWith(t) ? 3 : titulo.includes(t) ? 2 : 1), 0)
        return { i, score }
      })
      .filter((x): x is { i: Item; score: number } => !!x)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map((x) => x.i)
  }, [q, itens])

  useEffect(() => setSel(0), [q])

  const ir = (i?: Item) => {
    if (!i) return
    setAberta(false)
    setQ('')
    navigate(i.to)
  }

  const grupos = [...new Set(resultados.map((r) => r.grupo))]

  return (
    <>
      <button
        type="button"
        onClick={() => setAberta(true)}
        className="flex h-9 w-full items-center gap-2 rounded-xl border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/20"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Buscar…</span>
        <kbd className="rounded-md border bg-muted px-1.5 font-sans text-[0.7rem] font-medium">⌘K</kbd>
      </button>

      <Dialog open={aberta} onOpenChange={setAberta}>
        <DialogContent className="top-[15%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}>
          <DialogTitle className="sr-only">Busca rápida</DialogTitle>
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') (e.preventDefault(), setSel((s) => Math.min(s + 1, resultados.length - 1)))
                if (e.key === 'ArrowUp') (e.preventDefault(), setSel((s) => Math.max(s - 1, 0)))
                if (e.key === 'Enter') ir(resultados[sel])
              }}
              placeholder="Busque por nome, código, empresa ou situação (ex.: “risco panvel”)"
              className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded-md border bg-muted px-1.5 text-[0.7rem] text-muted-foreground">Esc</kbd>
          </div>
          <div className="max-h-[55vh] overflow-y-auto p-2">
            {resultados.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nada encontrado para “{q}”.</p>}
            {grupos.map((g) => (
              <div key={g} className="mb-1">
                <div className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground">{g}</div>
                {resultados.filter((r) => r.grupo === g).map((r) => {
                  const idx = resultados.indexOf(r)
                  return (
                    <button
                      key={`${r.grupo}-${r.to}-${r.titulo}`}
                      type="button"
                      onMouseMove={() => setSel(idx)}
                      onClick={() => ir(r)}
                      className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left', idx === sel && 'bg-accent')}
                    >
                      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground', idx === sel && 'bg-card text-primary')}>
                        <r.icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{r.titulo}</div>
                        {r.sub && <div className="truncate text-xs text-muted-foreground">{r.sub}</div>}
                      </div>
                      {idx === sel && <CornerDownLeft className="size-4 text-muted-foreground" />}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="flex gap-4 border-t px-4 py-2 text-xs text-muted-foreground">
            <span>↑↓ navegar</span><span>↵ abrir</span><span>Esc fechar</span>
            <span className="ml-auto flex items-center gap-1"><GraduationCap className="size-3.5" /> Busca rápida</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
