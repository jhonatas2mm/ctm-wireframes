// Leitura leve do código-fonte (sem AST): o suficiente para achar botões, colunas, campos, handlers e chamadas.
// Tudo o que sai daqui carrega arquivo e linha, para virar evidência.

export class Arquivo {
  readonly inicios: number[] = [0]
  readonly path: string
  readonly text: string
  constructor(path: string, text: string) {
    this.path = path
    this.text = text
    for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) this.inicios.push(i + 1)
  }
  linha(idx: number) {
    let lo = 0, hi = this.inicios.length - 1
    while (lo < hi) {
      const m = (lo + hi + 1) >> 1
      if (this.inicios[m] <= idx) lo = m
      else hi = m - 1
    }
    return lo + 1
  }
  trecho(idx: number) {
    const l = this.linha(idx)
    return this.text.slice(this.inicios[l - 1], this.inicios[l] ?? this.text.length).trim().slice(0, 180)
  }
}

// Pula uma string ('…', "…" ou `…${…}…`) começando em i (na aspa); devolve o índice logo após o fechamento.
export function pularString(t: string, i: number): number {
  const q = t[i]
  i++
  while (i < t.length) {
    const c = t[i]
    if (c === '\\') { i += 2; continue }
    if (q === '`' && c === '$' && t[i + 1] === '{') { i = fechar(t, i + 1) + 1; continue }
    if (c === q) return i + 1
    if (q !== '`' && c === '\n') return i + 1
    i++
  }
  return i
}

// Índice do fechamento que casa com o abridor em i ({, ( ou [). Ignora strings e comentários.
export function fechar(t: string, i: number): number {
  const par: Record<string, string> = { '{': '}', '(': ')', '[': ']' }
  const pilha: string[] = [par[t[i]]]
  i++
  while (i < t.length && pilha.length) {
    const c = t[i]
    if (c === '"' || c === "'" || c === '`') { i = pularString(t, i); continue }
    if (c === '/' && t[i + 1] === '/') { const n = t.indexOf('\n', i); i = n < 0 ? t.length : n; continue }
    if (c === '/' && t[i + 1] === '*') { const n = t.indexOf('*/', i + 2); i = n < 0 ? t.length : n + 2; continue }
    if (par[c]) pilha.push(par[c])
    else if (c === pilha[pilha.length - 1]) pilha.pop()
    i++
  }
  return i - 1
}

export type Tag = { nome: string; inicio: number; fimAbertura: number; attrs: string; autoFechada: boolean }

// Tag JSX de abertura em i (no "<"). Atributos podem ter expressões com ">" dentro de chaves.
export function lerTag(t: string, i: number): Tag | null {
  const m = /^<([A-Za-z][\w.]*)/.exec(t.slice(i, i + 60))
  if (!m) return null
  let j = i + m[0].length
  const ini = j
  while (j < t.length) {
    const c = t[j]
    if (c === '{') { j = fechar(t, j) + 1; continue }
    if (c === '"' || c === "'") { j = pularString(t, j); continue }
    if (c === '>') return { nome: m[1], inicio: i, fimAbertura: j, attrs: t.slice(ini, j).replace(/\/\s*$/, ''), autoFechada: t[j - 1] === '/' }
    j++
  }
  return null
}

// Atributos de uma tag: valor bruto ("texto" sem aspas; {expr} sem chaves).
export function lerProps(attrs: string): Record<string, string> {
  const out: Record<string, string> = {}
  let i = 0
  while (i < attrs.length) {
    const c = attrs[i]
    if (/\s/.test(c)) { i++; continue }
    if (c === '{') { i = fechar(attrs, i) + 1; continue } // {...spread}
    const m = /^[\w:-]+/.exec(attrs.slice(i))
    if (!m) { i++; continue }
    const nome = m[0]
    i += nome.length
    if (attrs[i] !== '=') { out[nome] = 'true'; continue }
    i++
    const v = attrs[i]
    if (v === '"' || v === "'") { const f = pularString(attrs, i); out[nome] = attrs.slice(i + 1, f - 1); i = f }
    else if (v === '{') { const f = fechar(attrs, i); out[nome] = attrs.slice(i + 1, f).trim(); i = f + 1 }
    else i++
  }
  return out
}

// Conteúdo entre a tag de abertura e o fechamento correspondente (</Nome>).
export function filhos(t: string, tag: Tag): string {
  if (tag.autoFechada) return ''
  const abre = new RegExp(`<${tag.nome.replace('.', '\\.')}[\\s>/]`, 'g')
  const fecha = `</${tag.nome}>`
  let prof = 1, i = tag.fimAbertura + 1
  while (i < t.length) {
    const f = t.indexOf(fecha, i)
    if (f < 0) return t.slice(tag.fimAbertura + 1, Math.min(t.length, tag.fimAbertura + 600))
    abre.lastIndex = i
    let a: RegExpExecArray | null
    while ((a = abre.exec(t)) && a.index < f) {
      const tg = lerTag(t, a.index)
      if (tg && !tg.autoFechada) prof++
      abre.lastIndex = (tg?.fimAbertura ?? a.index) + 1
    }
    prof--
    if (prof === 0) return t.slice(tag.fimAbertura + 1, f)
    i = f + fecha.length
  }
  return ''
}

const literais = (expr: string) => [...expr.matchAll(/'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`$\n]*)`/g)].map((m) => m[1] ?? m[2] ?? m[3]).filter((s) => /\p{L}/u.test(s))
const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Texto visível de um trecho JSX: rótulo para exibir e padrão (regex) para casar com o texto real da tela.
// {expressões} viram as alternativas literais (ternários) ou um curinga.
export function textoJsx(src: string): { label: string; re: string } | null {
  let label = '', re = ''
  let i = 0
  const soma = (l: string, r: string) => { label += l; re += r }
  while (i < src.length) {
    const c = src[i]
    if (c === '<') {
      const tg = lerTag(src, i)
      if (tg) { i = tg.fimAbertura + 1; soma(' ', '\\s*'); continue }
      const f = src.indexOf('>', i)
      i = f < 0 ? src.length : f + 1
      soma(' ', '\\s*')
      continue
    }
    if (c === '{') {
      const f = fechar(src, i)
      const expr = src.slice(i + 1, f).trim()
      i = f + 1
      if (expr.startsWith('/*') || !expr) continue
      const lits = /^['"`]/.test(expr) || /\?[^:]+:/.test(expr) || /&&\s*['"`]/.test(expr) ? literais(expr) : []
      if (lits.length) soma(lits[0], `(?:${lits.map(escapar).join('|')})?`)
      else soma(' … ', '.*')
      continue
    }
    soma(c, /\s/.test(c) ? '\\s*' : escapar(c))
    i++
  }
  const l = label.replace(/\s+/g, ' ').replace(/(… )+/g, '… ').trim()
  if (!/\p{L}/u.test(l.replace(/…/g, ''))) return null
  return { label: l, re: re.replace(/(\\s\*)+/g, '\\s*').replace(/(\.\*)+/g, '.*') }
}

// Rótulo de um valor de prop ("texto" ou {`Excluir ${x}`} / {'x'}).
export function textoProp(v: string | undefined): { label: string; re: string } | null {
  if (!v) return null
  const s = v.trim()
  if (/^`[^`]*`$/.test(s)) {
    const corpo = s.slice(1, -1)
    const label = corpo.replace(/\$\{[^}]*\}/g, '…').trim()
    return /\p{L}/u.test(label) ? { label, re: corpo.split(/\$\{[^}]*\}/).map(escapar).join('.*') } : null
  }
  const lits = literais(s)
  if (/^['"]/.test(s) || !/[({]/.test(s)) {
    const t = /^['"]/.test(s) ? lits[0] ?? '' : s
    return /\p{L}/u.test(t) ? { label: t, re: escapar(t) } : null
  }
  return lits.length ? { label: lits[0], re: `(?:${lits.map(escapar).join('|')})` } : null
}

// Corpo de uma função/const local (para seguir um handler como onClick={salvar}).
export function corpoDe(t: string, nome: string): { corpo: string; idx: number } | null {
  const re = new RegExp(`(?:const|let)\\s+${nome}\\s*=\\s*(?:async\\s*)?(?:\\([^)]*\\)|\\w+)\\s*(?::[^=\\n]+)?=>\\s*|function\\s+${nome}\\s*\\(`)
  const m = re.exec(t)
  if (!m) return null
  let i = m.index + m[0].length
  if (m[0].startsWith('function')) {
    i = fechar(t, i - 1) + 1
    const a = t.indexOf('{', i)
    return a < 0 ? null : { corpo: t.slice(a, fechar(t, a) + 1), idx: m.index }
  }
  if (t[i] === '{' || t[i] === '(') return { corpo: t.slice(i, fechar(t, i) + 1), idx: m.index }
  const n = t.indexOf('\n', i)
  return { corpo: t.slice(i, n < 0 ? t.length : n), idx: m.index }
}

// Expande um handler seguindo chamadas de funções locais (até 2 níveis).
export function expandirHandler(t: string, expr: string, nivel = 0, vistos = new Set<string>()): string {
  if (nivel > 2) return expr
  let out = expr
  for (const m of expr.matchAll(/\b([a-z_]\w*)\s*\(|^\s*([a-z_]\w*)\s*$/gi)) {
    const nome = m[1] ?? m[2]
    if (vistos.has(nome) || /^(if|for|while|switch|return|set[A-Z]\w*|navigate|confirmar|useState|String|Number|Math|Date|JSON|Object|Array|filter|map|find|some|every|reduce|includes|slice|trim|replace|toLowerCase|push|concat)$/.test(nome)) continue
    vistos.add(nome)
    const c = corpoDe(t, nome)
    if (c) out += '\n' + expandirHandler(t, c.corpo, nivel + 1, vistos)
  }
  return out
}

// Condição que envolve um elemento JSX: {cond && <Tag…>} ou {cond ? <Tag…> : …}.
export function condicaoAntes(t: string, idx: number): string | null {
  const antes = t.slice(Math.max(0, idx - 240), idx)
  const m = /\{([^{}]*?)(&&|\?)\s*\(?\s*$/.exec(antes)
  if (!m) return null
  const c = m[1].replace(/\s+/g, ' ').trim()
  return c && c.length < 160 ? c : null
}

// Comentário (// …) logo acima de uma linha, juntando linhas seguidas.
export function comentarioAcima(arq: Arquivo, idx: number, maxPular = 0): string | null {
  const l0 = arq.linha(idx) - 1
  const linhas = arq.text.split('\n')
  const out: string[] = []
  let k = l0 - 1, pulos = 0
  while (k >= 0) {
    const s = linhas[k].trim()
    if (s.startsWith('//')) { out.unshift(s.replace(/^\/\/\s?/, '')); k--; continue }
    if (!out.length && pulos < maxPular && /^export type|^type /.test(s)) { pulos++; k--; continue }
    break
  }
  return out.length ? out.join(' ').replace(/\s+/g, ' ').trim() : null
}

export const primeiraFrase = (s: string, max = 110) => {
  const f = s.split(/(?<=[.;:])\s/)[0]
  return f.length > max ? f.slice(0, max - 1).trimEnd() + '…' : f
}
