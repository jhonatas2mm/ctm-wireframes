export type PinKind = 'requisito' | 'regra' | 'observacao'

export type Pin = {
  id: string
  screen: string // padrão da rota (ex.: /itens/:id), para valer em todas as instâncias da tela
  selector: string // elemento clicado (só registro; a posição usa px/py)
  x: number // posição relativa dentro do elemento (0–1)
  y: number
  px?: number // posição na página (px) — é o que posiciona o pino
  py?: number
  kind: PinKind
  text: string
  author?: string // nome digitado por quem anotou
  createdAt: string
}

export const kinds: Record<PinKind, { label: string; color: string }> = {
  requisito: { label: 'Requisito', color: 'bg-blue-600' },
  regra: { label: 'Regra', color: 'bg-violet-600' },
  observacao: { label: 'Observação', color: 'bg-amber-500' },
}

export type Mode = 'add' | 'view' | 'off'

// Mensagens entre casca (shell) e protótipo (iframe).
export type ToFrame = { src: 'ctm-shell'; profile: string; mode: Mode; pins: (Pin & { n: number })[]; active: string | null }
export type ToShell =
  | { src: 'ctm-frame'; type: 'route'; path: string; screen: string }
  | { src: 'ctm-frame'; type: 'pick'; selector: string; x: number; y: number; px: number; py: number }
  | { src: 'ctm-frame'; type: 'orphans'; ids: string[] }
  | { src: 'ctm-frame'; type: 'select'; id: string }
  | { src: 'ctm-frame'; type: 'cancel' }
