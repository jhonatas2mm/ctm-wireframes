import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, RotateCcw, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useProfile } from '@/journey/profile'
import { profileOf } from '@/journey/profiles'
import { excedentesProposta } from '@/lib/cobranca'
import {
  HOJE, dataBr, nomeParte, periodoTurma, situacaoCronograma, situacaoDe, statusTurma, useContratos, useCursosDr, useProdutos, useTurmas,
} from '@/lib/mock'
import { cn } from '@/lib/utils'

// Agente inteligente: chat de IA (SIMULADO no protótipo) que abre na lateral direita empurrando a tela. Traz ações
// rápidas do dia a dia do perfil (pendências, prazos) e um roteiro de exemplo que se percorre só apertando "Enviar".
// As respostas são montadas com os dados fictícios do protótipo; nada é enviado a um modelo de verdade.

// Ícone animado (SVG): estrela que pulsa e faíscas que piscam (animações em src/index.css).
export function IconeAgente({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn('size-5', className)}>
      <path className="agente-estrela" d="M11 4.5 12.9 9.6 18 11.5 12.9 13.4 11 18.5 9.1 13.4 4 11.5 9.1 9.6Z" fill="currentColor" />
      <path className="agente-faisca" d="M18.5 3 19.2 4.8 21 5.5 19.2 6.2 18.5 8 17.8 6.2 16 5.5 17.8 4.8Z" fill="currentColor" />
      <circle className="agente-faisca agente-faisca-2" cx="18.5" cy="18.5" r="1.4" fill="currentColor" />
    </svg>
  )
}

// Botão do topo (à esquerda do avatar): mostra o rótulo ao carregar a tela e depois recolhe para só o ícone
// (o rótulo volta no hover).
export function AgenteBotao({ aberto, onClick }: { aberto: boolean; onClick: () => void }) {
  const [rotulo, setRotulo] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setRotulo(false), 4000)
    return () => clearTimeout(t)
  }, [])
  return (
    <Button
      type="button"
      variant="outline"
      data-agente-botao
      aria-pressed={aberto}
      aria-label="Agente inteligente"
      onClick={onClick}
      className={cn('group ml-auto shrink-0 gap-0 bg-transparent px-2.5 text-primary hover:text-primary dark:bg-transparent', aberto && 'border-primary bg-accent')}
    >
      <IconeAgente />
      <span className={cn('overflow-hidden whitespace-nowrap text-foreground transition-all duration-500 group-hover:ml-2 group-hover:max-w-40 group-hover:opacity-100', rotulo ? 'ml-2 max-w-40 opacity-100' : 'ml-0 max-w-0 opacity-0')}>
        Agente inteligente
      </span>
    </Button>
  )
}

type Item = { titulo: string; sub?: string; tom?: 'alerta' | 'ok'; to?: string }
type Msg = { de: 'usuario' | 'agente'; texto: string; itens?: Item[]; rascunho?: string; rodape?: string }
type Pergunta = { texto: string; resposta: () => Msg }

const somarDias = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }

// Conteúdo do agente para o perfil ativo: ações rápidas e roteiro de exemplo, a partir dos dados do protótipo.
function useConteudo() {
  const perfil = useProfile()
  const def = profileOf(perfil)
  const propostas = useProdutos().all
  const turmas = useTurmas().all
  const taas = useContratos().all
  const portfolio = useCursosDr().all
  const nome = (def.user?.nome ?? 'Maria Silva').split(' ')[0]
  const uf = def.dr?.sigla.replace('SENAI-', '')
  const grupo = def.grupo ?? 'CTM'

  if (grupo === 'DR solicitante') {
    const taasAnalisar = taas.filter((t) => t.contratante === uf && t.origem === 'CTM' && (t.status === 'Encaminhado' || t.status === 'Em análise'))
    const cronos = turmas.filter((t) => t.drContratante === uf && situacaoCronograma(t.cronograma) === 'Aguardando')
    const props = propostas.filter((p) => p.drContratante === uf && p.status === 'Aguardando')
    const pendencias = (): Msg => ({
      de: 'agente',
      texto: `${nome}, você tem ${taasAnalisar.length + cronos.length + props.length} pendência(s) com as CTMs:`,
      itens: [
        ...taasAnalisar.map((t) => ({ titulo: `TAA ${t.numero} para analisar`, sub: `CTM SENAI-${t.dr} · ${t.status}`, tom: 'alerta' as const, to: `/dashboard/${t.id}` })),
        ...cronos.map((t) => ({ titulo: `Validar o cronograma da ${t.codigo}`, sub: `Prazo ${t.cronograma?.prazo ? dataBr(t.cronograma.prazo) : '—'}; sem resposta, vale como validado`, tom: 'alerta' as const })),
        ...props.map((p) => ({ titulo: `Proposta ${p.numero} aguardando seu retorno`, sub: `CTM SENAI-${p.drOfertante}` })),
      ],
    })
    return {
      nome,
      acoes: [
        { texto: 'Quais são minhas pendências?', resposta: pendencias },
        { texto: 'Tenho TAA para analisar?', resposta: (): Msg => ({ de: 'agente', texto: taasAnalisar.length ? `Sim, ${taasAnalisar.length}:` : 'Nenhum TAA aguardando sua análise.', itens: taasAnalisar.map((t) => ({ titulo: `TAA ${t.numero}`, sub: `CTM SENAI-${t.dr} · ${t.edital ?? ''}`, to: `/dashboard/${t.id}` })) }) },
        { texto: 'Quais turmas precisam de atenção?', resposta: (): Msg => ({ de: 'agente', texto: 'Turmas com alunos que pedem atitude estão no seu Painel. Posso abrir:', itens: [{ titulo: 'Painel da DR', sub: 'Alunos sem acesso, média baixa, atividades não entregues', to: '/acompanhamento' }] }) },
      ] as Pergunta[],
      roteiro: [
        { texto: 'Bom dia! O que eu tenho para resolver hoje?', resposta: pendencias },
        { texto: 'Me resume o TAA que chegou da CTM.', resposta: (): Msg => { const t = taasAnalisar[0]; return t ? { de: 'agente', texto: `O TAA ${t.numero} veio da CTM SENAI-${t.dr} (edital ${t.edital ?? '—'}), com ${t.produtos?.length ?? 0} produto(s) e valor global de ${t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Você pode aceitar, retornar para ajuste ou recusar.`, itens: [{ titulo: `Abrir o TAA ${t.numero}`, to: `/dashboard/${t.id}` }] } : { de: 'agente', texto: 'Nenhum TAA aguardando sua análise agora.' } } },
        { texto: 'Obrigado! Me avisa se chegar algo novo.', resposta: (): Msg => ({ de: 'agente', texto: 'Combinado. Eu te aviso pelo sino quando chegar TAA, proposta ou cronograma para validar.', rodape: 'Simulação: no protótipo nenhum aviso é criado de verdade.' }) },
      ] as Pergunta[],
    }
  }

  if (grupo === 'DN') {
    const pendentes = portfolio.filter((c) => situacaoDe(c) === 'Aguardando')
    const resumo = (): Msg => ({ de: 'agente', texto: `${nome}, há ${pendentes.length} solicitação(ões) de portfólio aguardando a sua aprovação:`, itens: pendentes.map((c) => ({ titulo: `${c.nome} · v${c.versao ?? 1}`, sub: `CTM SENAI-${c.ctm} · ${(c.versao ?? 1) > 1 ? 'nova versão' : 'novo produto'}`, tom: 'alerta' as const, to: '/portfolio/aprovacoes' })) })
    return {
      nome,
      acoes: [
        { texto: 'O que está aguardando minha aprovação?', resposta: resumo },
        { texto: 'Quais TAAs estão em andamento?', resposta: (): Msg => { const em = taas.filter((t) => t.status !== 'Aceito' && t.status !== 'Cancelado'); return { de: 'agente', texto: `${em.length} TAA(s) em tramitação entre CTMs e DRs:`, itens: em.slice(0, 6).map((t) => ({ titulo: `TAA ${t.numero}`, sub: `CTM SENAI-${t.dr} → ${nomeParte(t.contratante)} · ${t.status}` })) } } },
      ] as Pergunta[],
      roteiro: [
        { texto: 'Bom dia! Tenho alguma aprovação pendente?', resposta: resumo },
        { texto: 'Obrigada, vou aprovar agora.', resposta: (): Msg => ({ de: 'agente', texto: 'Abrindo a Aprovação de portfólio para você.', itens: [{ titulo: 'Aprovação de portfólio', to: '/portfolio/aprovacoes' }] }) },
      ] as Pergunta[],
    }
  }

  // CTM (e Super admin): pendências da operação.
  const aguardando = propostas.filter((p) => p.status === 'Aguardando')
  const rascunhos = propostas.filter((p) => (p.status ?? 'Rascunho') === 'Rascunho')
  const aditivos = propostas.flatMap((p) => excedentesProposta(p, turmas).map((e) => ({ p, e })))
  const cronos = turmas.filter((t) => situacaoCronograma(t.cronograma) === 'Aguardando')
  const proximas = turmas.filter((t) => { const i = periodoTurma(t).inicio; return statusTurma(t) !== 'Cancelada' && i >= HOJE && i <= somarDias(HOJE, 21) })
  const taasCtm = taas.filter((t) => t.origem !== 'CTM' && (t.status === 'Encaminhado' || t.status === 'Em análise'))
  const pendencias = (): Msg => ({
    de: 'agente',
    texto: `Bom dia, ${nome}! Separei o que precisa de você hoje (${dataBr(HOJE)}):`,
    itens: [
      ...aditivos.map(({ p, e }) => ({ titulo: `Fazer aditivo na ${p.numero}`, sub: `${e.curso}: ${e.moodle} alunos no Moodle, ${e.proposta} na proposta`, tom: 'alerta' as const, to: `/produtos/${p.id}` })),
      ...taasCtm.map((t) => ({ titulo: `Analisar o TAA ${t.numero}`, sub: `Criado pelo ${nomeParte(t.contratante)}`, tom: 'alerta' as const, to: `/taas-ctm/${t.id}` })),
      ...cronos.map((t) => ({ titulo: `Cronograma da ${t.codigo} aguardando a DR`, sub: `Prazo ${t.cronograma?.prazo ? dataBr(t.cronograma.prazo) : '—'} · SENAI-${t.drContratante}`, to: `/oferta/${t.id}` })),
      ...aguardando.map((p) => ({ titulo: `Proposta ${p.numero} aguardando retorno`, sub: `SENAI-${p.drContratante}`, to: `/produtos/${p.id}` })),
      ...rascunhos.slice(0, 2).map((p) => ({ titulo: `Rascunho ${p.numero} parado`, sub: `SENAI-${p.drContratante}`, to: `/produtos/${p.id}` })),
    ],
  })
  const propostasAguardando = (): Msg => ({
    de: 'agente',
    texto: aguardando.length ? `${aguardando.length} proposta(s) aguardando o retorno da DR:` : 'Nenhuma proposta aguardando retorno.',
    itens: aguardando.map((p) => ({ titulo: p.numero, sub: `SENAI-${p.drContratante} · versão v${p.versao ?? 1} · ${p.cursos.map((c) => c.nome).join(', ')}`, to: `/produtos/${p.id}` })),
  })
  const turmasProximas = (): Msg => ({
    de: 'agente',
    texto: proximas.length ? `${proximas.length} turma(s) começam nas próximas 3 semanas:` : 'Nenhuma turma começa nas próximas 3 semanas.',
    itens: proximas.map((t) => {
      const sit = situacaoCronograma(t.cronograma)
      return { titulo: `${t.codigo} · ${t.cursos.join(', ')}`, sub: `Início ${dataBr(periodoTurma(t).inicio)} · cronograma ${sit.toLowerCase()}${!t.equipe ? ' · sem equipe' : ''}`, tom: sit === 'Validado' ? 'ok' as const : 'alerta' as const, to: `/oferta/${t.id}` }
    }),
  })
  const alvo = aguardando[0]
  return {
    nome,
    acoes: [
      { texto: 'Quais são minhas pendências de hoje?', resposta: pendencias },
      { texto: 'Propostas aguardando retorno da DR', resposta: propostasAguardando },
      { texto: 'Turmas que começam em breve', resposta: turmasProximas },
      { texto: 'Tem aditivo para fazer?', resposta: (): Msg => ({ de: 'agente', texto: aditivos.length ? `Sim, ${aditivos.length}. As salas do Moodle têm mais alunos do que a proposta:` : 'Nenhum aditivo pendente.', itens: aditivos.map(({ p, e }) => ({ titulo: p.numero, sub: `${e.curso}: +${e.moodle - e.proposta} aluno(s)`, tom: 'alerta' as const, to: `/produtos/${p.id}` })) }) },
    ] as Pergunta[],
    roteiro: [
      { texto: 'Bom dia! O que eu tenho de pendência hoje?', resposta: pendencias },
      { texto: 'Quais propostas estão aguardando retorno da DR?', resposta: propostasAguardando },
      {
        texto: alvo ? `Escreve um lembrete para o SENAI-${alvo.drContratante} sobre a ${alvo.numero}.` : 'Escreve um lembrete para a DR sobre a proposta.',
        resposta: (): Msg => ({
          de: 'agente',
          texto: 'Aqui está um rascunho. Revise antes de enviar:',
          rascunho: alvo
            ? `Olá, equipe do SENAI-${alvo.drContratante}!\n\nPassando para lembrar da proposta ${alvo.numero} (versão v${alvo.versao ?? 1}), de ${alvo.cursos.map((c) => c.nome).join(', ')}. Ficamos no aguardo do retorno de vocês para seguirmos com o cronograma das turmas.\n\nQualquer dúvida, estou à disposição.\n${def.user?.nome ?? ''}`
            : 'Olá! Passando para lembrar da proposta enviada. Ficamos no aguardo do retorno.',
          rodape: 'O agente só sugere o texto; o envio é feito por você.',
        }),
      },
      { texto: 'E as turmas que começam nas próximas semanas, falta alguma coisa?', resposta: turmasProximas },
      { texto: 'Obrigada! Me lembra amanhã às 9h de conferir de novo.', resposta: (): Msg => ({ de: 'agente', texto: 'Combinado: amanhã às 9h eu trago as pendências atualizadas.', rodape: 'Simulação: no protótipo o lembrete não é criado de verdade.' }) },
    ] as Pergunta[],
  }
}

// Painel do chat (lateral direita, empurra o conteúdo).
export function AgentePainel({ aberto, onClose }: { aberto: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const perfil = useProfile()
  const { nome, acoes, roteiro } = useConteudo()
  const inicial: Msg = { de: 'agente', texto: `Olá, ${nome}! Sou o seu agente. Posso te ajudar com pendências, prazos e o andamento do seu dia. Escolha uma ação rápida ou siga o exemplo de jornada abaixo.` }
  const [msgs, setMsgs] = useState<Msg[]>([inicial])
  const [passo, setPasso] = useState(0)
  const [texto, setTexto] = useState(roteiro[0]?.texto ?? '')
  const [digitando, setDigitando] = useState(false)
  const fim = useRef<HTMLDivElement>(null)
  const reiniciar = () => { setMsgs([inicial]); setPasso(0); setTexto(roteiro[0]?.texto ?? ''); setDigitando(false) }
  // Troca de perfil na casca: recomeça a conversa com o conteúdo do novo perfil.
  useEffect(reiniciar, [perfil]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => fim.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), [msgs, digitando])

  const perguntar = (pergunta: string, resposta: () => Msg, proximo?: number) => {
    if (digitando || !pergunta.trim()) return
    setMsgs((m) => [...m, { de: 'usuario', texto: pergunta }])
    setDigitando(true)
    setTimeout(() => {
      setMsgs((m) => [...m, resposta()])
      setDigitando(false)
      if (proximo !== undefined) { setPasso(proximo); setTexto(roteiro[proximo]?.texto ?? '') }
    }, 900)
  }
  const enviar = () => {
    const doRoteiro = roteiro[passo]
    if (doRoteiro && texto.trim() === doRoteiro.texto) return perguntar(texto, doRoteiro.resposta, passo + 1)
    const acao = acoes.find((a) => a.texto.toLowerCase() === texto.trim().toLowerCase())
    perguntar(texto, acao?.resposta ?? (() => ({ de: 'agente', texto: 'No protótipo eu respondo às ações rápidas e ao exemplo de jornada. Em produção, esta pergunta iria para o modelo de IA com os dados do seu perfil.' })))
    setTexto(roteiro[passo]?.texto ?? '')
  }

  return (
    <aside className={cn('sticky top-0 h-svh shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out', aberto ? 'w-[26rem]' : 'w-0')} aria-hidden={!aberto}>
      <div className="flex h-full w-[26rem] flex-col p-3 pl-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.25rem] border bg-card">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-accent text-primary"><IconeAgente className="size-4.5" /></span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-sm font-semibold">Agente inteligente</p>
              <p className="text-xs text-muted-foreground">Respostas simuladas com os dados do protótipo</p>
            </div>
            <Button size="icon-sm" variant="ghost" aria-label="Recomeçar conversa" onClick={reiniciar}><RotateCcw /></Button>
            <Button size="icon-sm" variant="ghost" aria-label="Fechar agente" onClick={onClose}><X /></Button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.map((m, i) => <Bolha key={i} m={m} abrir={(to) => navigate(to)} />)}
            {digitando && (
              <div className="flex items-center gap-1 px-1 text-muted-foreground" aria-label="Digitando">
                {[0, 1, 2].map((k) => <span key={k} className="agente-digitando size-1.5 rounded-full bg-current" style={{ animationDelay: `${k * 0.15}s` }} />)}
              </div>
            )}
            {msgs.length === 1 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-muted-foreground">Ações rápidas</p>
                <div className="flex flex-wrap gap-1.5">
                  {acoes.map((a) => (
                    <button key={a.texto} type="button" onClick={() => perguntar(a.texto, a.resposta)} className="rounded-full border bg-card px-3 py-1.5 text-left text-xs hover:border-primary hover:bg-accent">
                      {a.texto}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={fim} />
          </div>

          <div className="border-t p-3">
            {passo < roteiro.length ? (
              <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-accent-foreground tabular-nums">Exemplo {passo + 1}/{roteiro.length}</span>
                É só apertar Enviar para seguir a jornada.
              </p>
            ) : (
              <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                Fim do exemplo de jornada.
                <button type="button" className="font-medium text-primary hover:underline" onClick={reiniciar}>Recomeçar</button>
              </p>
            )}
            <div className="flex items-end gap-2">
              <Textarea
                rows={2}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
                placeholder="Pergunte sobre suas pendências…"
                className="min-h-0 resize-none bg-white text-sm"
              />
              <Button size="icon" data-agente-enviar aria-label="Enviar" disabled={digitando || !texto.trim()} motivo={digitando ? 'Aguarde a resposta' : 'Digite uma pergunta'} onClick={enviar}><Send /></Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Bolha({ m, abrir }: { m: Msg; abrir: (to: string) => void }) {
  if (m.de === 'usuario') return <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground">{m.texto}</div>
  return (
    <div className="max-w-[95%] space-y-2">
      <div className="w-fit rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm">{m.texto}</div>
      {!!m.itens?.length && (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {m.itens.map((it, i) => (
            <li key={i} className="flex items-center gap-2 px-3 py-2">
              <span className={cn('size-2 shrink-0 rounded-full', it.tom === 'alerta' ? 'bg-amber-500' : it.tom === 'ok' ? 'bg-emerald-500' : 'bg-neutral-300')} />
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-sm font-medium">{it.titulo}</span>
                {it.sub && <span className="block text-xs text-muted-foreground">{it.sub}</span>}
              </span>
              {it.to && <Button size="icon-xs" variant="outline" aria-label={`Abrir ${it.titulo}`} className="text-primary" onClick={() => abrir(it.to!)}><ArrowUpRight /></Button>}
            </li>
          ))}
        </ul>
      )}
      {m.rascunho && <Rascunho texto={m.rascunho} />}
      {m.rodape && <p className="px-1 text-xs text-muted-foreground">{m.rodape}</p>}
    </div>
  )
}

function Rascunho({ texto }: { texto: string }): ReactNode {
  return <pre className="rounded-xl border bg-card px-3 py-2 font-sans text-sm whitespace-pre-wrap">{texto}</pre>
}
