// Fontes lidas pela análise: o próprio código do protótipo (texto bruto), as regras do fluxo e as instruções do projeto.
// Carregadas sob demanda (só quando a casca abre Inspecionar/Mapa do sistema), para não pesar no protótipo.
export type Fontes = { arquivos: Record<string, string>; fluxo: string; instrucoes: string }

let cache: Promise<Fontes> | null = null

export function carregarFontes(): Promise<Fontes> {
  cache ??= (async () => {
    const mods = import.meta.glob(['/src/**/*.ts', '/src/**/*.tsx', '!/src/trace/**', '!/src/components/ui/**'], { query: '?raw', import: 'default' })
    const entradas = await Promise.all(Object.entries(mods).map(async ([k, f]) => [k.replace(/^\//, ''), (await f()) as string] as const))
    const [fluxo, instrucoes] = await Promise.all([
      import('../../docs/fluxo.md?raw').then((m) => m.default as string),
      import('../../CLAUDE.md?raw').then((m) => m.default as string),
    ])
    return { arquivos: Object.fromEntries(entradas), fluxo, instrucoes }
  })()
  return cache
}
