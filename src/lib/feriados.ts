// Feriados nacionais do Brasil por ano. No protótipo é a SIMULAÇÃO da resposta da API de feriados (sem chamada de rede):
// datas fixas + datas móveis calculadas a partir da Páscoa (Carnaval, Sexta-feira Santa, Corpus Christi).
export const FONTE_FERIADOS = {
  nome: 'BrasilAPI',
  site: 'brasilapi.com.br',
  endpoint: (ano: number | string) => `https://brasilapi.com.br/api/feriados/v1/${ano}`,
  descricao: 'API pública e gratuita que devolve os feriados nacionais oficiais de um ano (data, nome e tipo).',
}

const somar = (iso: string, dias: number) => {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

// Páscoa (algoritmo gregoriano anônimo).
const pascoa = (ano: number) => {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

export const feriadosNacionais = (ano: number): { data: string; nome: string }[] => {
  const p = pascoa(ano)
  return [
    [`${ano}-01-01`, 'Confraternização Universal'], [somar(p, -48), 'Carnaval'], [somar(p, -47), 'Carnaval'], [somar(p, -2), 'Sexta-feira Santa'],
    [`${ano}-04-21`, 'Tiradentes'], [`${ano}-05-01`, 'Dia do Trabalho'], [somar(p, 60), 'Corpus Christi'], [`${ano}-09-07`, 'Independência do Brasil'],
    [`${ano}-10-12`, 'Nossa Senhora Aparecida'], [`${ano}-11-02`, 'Finados'], [`${ano}-11-15`, 'Proclamação da República'],
    [`${ano}-11-20`, 'Dia da Consciência Negra'], [`${ano}-12-25`, 'Natal'],
  ].map(([data, nome]) => ({ data, nome })).sort((x, y) => x.data.localeCompare(y.data))
}
