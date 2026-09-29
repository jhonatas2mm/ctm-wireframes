import { Component, type ReactNode } from 'react'
import { resetDb } from '@/lib/db'

// Barreira de erro: um erro numa parte da tela não derruba o protótipo inteiro (sem isso, a tela fica em branco).
// fallback: o que mostrar no lugar (padrão: aviso com o erro e o botão para restaurar os dados do protótipo).
export class BarreiraErro extends Component<{ children: ReactNode; fallback?: ReactNode; chave?: string }, { erro: Error | null; chave?: string; onde?: string }> {
  state: { erro: Error | null; chave?: string; onde?: string } = { erro: null, chave: this.props.chave }
  static getDerivedStateFromError(erro: Error) { return { erro } }
  // Troca de tela (chave) limpa o erro
  static getDerivedStateFromProps(p: { chave?: string }, s: { chave?: string }) { return p.chave !== s.chave ? { erro: null, chave: p.chave } : null }
  componentDidCatch(erro: Error, info: { componentStack?: string | null }) {
    console.error('[protótipo]', erro)
    // Onde quebrou (nomes dos componentes), para mostrar no aviso
    this.setState({ onde: (info.componentStack ?? '').split('\n').map((l) => l.trim().replace(/^at /, '').split(' ')[0]).filter(Boolean).slice(0, 4).join(' ← ') })
  }
  render() {
    if (!this.state.erro) return this.props.children
    if (this.props.fallback !== undefined) return this.props.fallback
    return (
      <div className="rounded-[1.25rem] border bg-card p-6">
        <p className="font-semibold">Esta tela encontrou um erro.</p>
        <p className="mt-1 font-mono text-xs break-all text-muted-foreground">{this.state.erro.message}</p>
        {this.state.onde && <p className="mt-1 font-mono text-[11px] break-all text-muted-foreground/80">em {this.state.onde}</p>}
        <p className="mt-3 text-sm text-muted-foreground">Costuma ser dado antigo salvo no navegador. Restaurar os dados volta o protótipo ao estado inicial.</p>
        <button type="button" className="mt-4 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted" onClick={() => { resetDb(); location.reload() }}>
          Restaurar dados e recarregar
        </button>
      </div>
    )
  }
}
