// Asterisco vermelho de campo obrigatório. Padrão em todos os formulários: <span>Rótulo <Req /></span>
export function Req() {
  return <span aria-hidden className="text-destructive ml-0.5">*</span>
}
