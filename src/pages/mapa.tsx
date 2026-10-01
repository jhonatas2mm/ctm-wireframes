// Mapa Geral da Solução CTM - Componente React
// Gerado automaticamente a partir do Draw.io Mapa-geral-solucao-CTM.drawio

import { useState } from 'react'
import {
  modulos,
  fluxoPrincipal,
  integracoes,
  hierarquiaPerfis,
  perfisCTM,
  perfisDRSolicitante,
  fluxoPortfolio,
  fluxoContratos,
  fluxoPlanejamento,
  fluxoExecucao,
  fluxoAcompanhamento,
  arquiteturaIntegracoes,
  agrupadorUCs,
  fluxoFaturamento,
  tiposDR,
  legendaCores,
  paginas,
} from '@/lib/mapa-solucao'
import { cn } from '@/lib/utils'
import { ChevronRight, ArrowRight, Check, AlertTriangle, Info } from 'lucide-react'

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function MapaSolucao() {
  const [paginaAtiva, setPaginaAtiva] = useState('visao-geral')

  return (
    <div className="flex h-full bg-white text-slate-900">
      {/* Menu lateral com páginas */}
      <aside className="w-52 shrink-0 border-r border-slate-200 bg-slate-50 p-3 overflow-y-auto">
        <h2 className="font-bold text-sm mb-3 text-slate-900">📊 Mapa da Solução</h2>
        <nav className="space-y-0.5">
          {paginas.map((pagina) => (
            <button
              key={pagina.id}
              onClick={() => setPaginaAtiva(pagina.id)}
              className={cn(
                'w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors',
                paginaAtiva === pagina.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-200'
              )}
            >
              {pagina.nome}
            </button>
          ))}
        </nav>
      </aside>

      {/* Conteúdo da página */}
      <main className="flex-1 p-4 overflow-y-auto bg-white min-w-0">
        {paginaAtiva === 'visao-geral' && <PaginaVisaoGeral />}
        {paginaAtiva === 'usuarios-drs' && <PaginaUsuariosDRs />}
        {paginaAtiva === 'portfolio' && <PaginaPortfolio />}
        {paginaAtiva === 'contratos' && <PaginaContratos />}
        {paginaAtiva === 'planejamento' && <PaginaPlanejamento />}
        {paginaAtiva === 'execucao' && <PaginaExecucao />}
        {paginaAtiva === 'acompanhamento' && <PaginaAcompanhamento />}
        {paginaAtiva === 'integracoes' && <PaginaIntegracoes />}
        {paginaAtiva === 'agrupador' && <PaginaAgrupador />}
        {paginaAtiva === 'faturamento' && <PaginaFaturamento />}
      </main>
    </div>
  )
}

// ========================================
// PÁGINA 1: VISÃO GERAL
// ========================================

function PaginaVisaoGeral() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-blue-800">
        SISTEMA CTM NACIONAL - VISÃO GERAL DOS MÓDULOS
      </h1>

      {/* Grid de módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modulos.slice(0, 8).map((modulo) => (
          <ModuloCard key={modulo.id} modulo={modulo} />
        ))}
      </div>

      {/* Fluxo principal */}
      <div className="bg-slate-100 rounded-xl p-6 border-2 border-slate-300">
        <h3 className="text-lg font-bold text-blue-800 mb-4">
          ⬇️ FLUXO PRINCIPAL DO SISTEMA
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {fluxoPrincipal.map((etapa, index) => (
            <div key={etapa.id} className="flex items-center gap-2">
              <div
                className="px-3 py-2 rounded-lg text-xs font-bold text-center text-slate-800"
                style={{
                  backgroundColor: etapa.cor,
                  borderColor: etapa.corBorda,
                  borderWidth: 2,
                }}
              >
                {etapa.nome}
              </div>
              {index < fluxoPrincipal.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Integrações e Legenda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Integrações */}
        <div className="col-span-1">
          <h3 className="text-sm font-bold text-white bg-blue-800 px-3 py-1 rounded mb-3">
            🔗 INTEGRAÇÕES EXTERNAS
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {integracoes.map((int) => (
              <div
                key={int.id}
                className="p-2 rounded-lg text-xs"
                style={{
                  backgroundColor: int.cor,
                  borderColor: int.corBorda,
                  borderWidth: 1,
                  color: int.id === 'sge' ? 'white' : '#334155',
                }}
              >
                <div className="font-bold">{int.nome}</div>
                <div style={{ opacity: 0.85 }}>{int.descricao}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="col-span-1 bg-slate-100 rounded-xl p-4 border border-slate-300">
          <h3 className="text-sm font-bold mb-3 text-slate-800">🎨 LEGENDA DE CORES</h3>
          <div className="grid grid-cols-2 gap-2">
            {legendaCores.map((item) => (
              <div
                key={item.nome}
                className="px-2 py-1 rounded text-xs text-slate-700"
                style={{ backgroundColor: item.cor }}
              >
                {item.nome}
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de DR */}
        <div className="col-span-1 bg-amber-50 rounded-xl p-4 border border-amber-300">
          <h3 className="text-sm font-bold text-amber-800 mb-3">📌 TIPOS DE DR</h3>
          <div className="text-xs space-y-3 text-slate-700">
            <div>
              <div className="font-bold text-amber-900">{tiposDR.credenciada.nome}:</div>
              {tiposDR.credenciada.responsabilidades.map((r) => (
                <div key={r}>→ {r}</div>
              ))}
            </div>
            <div>
              <div className="font-bold text-amber-900">{tiposDR.contratante.nome}:</div>
              {tiposDR.contratante.responsabilidades.map((r) => (
                <div key={r}>→ {r}</div>
              ))}
            </div>
            <div className="text-amber-700 font-bold">{tiposDR.nota}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========================================
// PÁGINA 2: USUÁRIOS E DRs
// ========================================

function PaginaUsuariosDRs() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-blue-800">
        GESTÃO DE USUÁRIOS E DEPARTAMENTOS REGIONAIS
      </h1>

      {/* Linha 1: Administração + Gestão de DRs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coluna 1: Super Admin e DN */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-blue-800 bg-blue-100 px-3 py-1.5 rounded">
            🔑 ADMINISTRAÇÃO
          </h3>
          {hierarquiaPerfis.map((perfil) => (
            <div key={perfil.id} className="flex gap-3 items-start">
              <div
                className="px-3 py-2 rounded-lg text-white font-bold text-center min-w-[140px] text-sm"
                style={{ backgroundColor: perfil.cor }}
              >
                {perfil.icone} {perfil.nome.split('(')[0].trim()}
              </div>
              <div className="bg-blue-50 rounded-lg p-2 flex-1 border border-blue-200">
                <ul className="text-xs space-y-0.5 text-slate-700">
                  {perfil.responsabilidades.slice(0, 3).map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Coluna 2: Gestão de DRs resumida */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-green-800 bg-green-100 px-3 py-1.5 rounded">
            🏢 GESTÃO DE DRs
          </h3>
          <div className="bg-green-50 rounded-lg p-3 border border-green-300 text-xs flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="font-bold text-green-800 mb-1">📝 Cadastro</div>
                <ul className="text-slate-700 space-y-0.5">
                  <li>• CNPJ, Razão social</li>
                  <li>• Status: Ativo / Inativo</li>
                  <li>• Credenciamento por edital</li>
                </ul>
              </div>
              <div>
                <div className="font-bold text-green-800 mb-1">🏫 Escolas</div>
                <ul className="text-slate-700 space-y-0.5">
                  <li>• Vinculadas ao DR</li>
                  <li>• CNPJ, Endereço</li>
                  <li>• DR 1 : N Escolas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linha 2: Perfis CTM e DR Solicitante */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Perfis CTM */}
        <div className="border-2 border-cyan-300 rounded-lg p-4 bg-cyan-50/50">
          <div className="text-sm font-bold text-cyan-800 mb-3 flex items-center gap-2">
            <span className="bg-cyan-600 text-white px-2 py-0.5 rounded text-xs">CTM</span>
            Perfis da Central de Tutoria e Monitoria
          </div>
          <div className="space-y-2">
            {perfisCTM.map((perfil) => (
              <div
                key={perfil.id}
                className="px-4 py-2 rounded text-white text-sm font-medium flex items-center gap-2"
                style={{ backgroundColor: perfil.cor }}
              >
                <span>{perfil.icone}</span>
                <span>{perfil.nome.replace('CTM: ', '')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Perfis DR Solicitante */}
        <div className="border-2 border-emerald-300 rounded-lg p-4 bg-emerald-50/50">
          <div className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs">DR</span>
            Perfis do DR Solicitante
          </div>
          <div className="space-y-2">
            {perfisDRSolicitante.map((perfil) => (
              <div
                key={perfil.id}
                className="px-4 py-2 rounded text-white text-sm font-medium flex items-center gap-2"
                style={{ backgroundColor: perfil.cor }}
              >
                <span>{perfil.icone}</span>
                <span>{perfil.nome.replace('DR solicitante: ', '')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legenda rápida */}
      <div className="bg-slate-100 rounded-xl p-4 border border-slate-300">
        <div className="text-xs text-slate-600 flex flex-wrap gap-x-6 gap-y-2 justify-center">
          <span><strong>Super Admin:</strong> Acesso total, cadastra DRs e usuários</span>
          <span><strong>DN:</strong> Gerencia editais, aprova portfólio</span>
          <span><strong>CTM:</strong> Executa cursos, tutoria e monitoria</span>
          <span><strong>DR Solicitante:</strong> Demanda cursos, acompanha turmas</span>
        </div>
      </div>
    </div>
  )
}

// ========================================
// PÁGINA 3: PORTFÓLIO
// ========================================

function PaginaPortfolio() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-amber-800">
        GESTÃO DE PORTFÓLIO
      </h1>

      <div className="flex flex-col gap-4">
        {fluxoPortfolio.map((etapa, index) => (
          <div key={etapa.id} className="flex items-center gap-4">
            <div className="bg-amber-100 rounded-lg p-4 border-2 border-amber-400 flex-1">
              <div className="font-bold text-amber-800">{etapa.titulo}</div>
              <div className="text-sm text-slate-700">{etapa.descricao}</div>
              <div className="text-xs text-amber-600 mt-1">Ator: {etapa.ator}</div>
              {etapa.status && (
                <div className="text-xs mt-2 flex gap-2">
                  {etapa.status.split(' / ').map((s) => (
                    <span key={s} className="px-2 py-1 bg-amber-200 rounded text-amber-800">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {index < fluxoPortfolio.length - 1 && (
              <ChevronRight className="w-6 h-6 text-amber-500" />
            )}
          </div>
        ))}
      </div>

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-300">
        <h4 className="font-bold text-amber-800 mb-2">📋 Regras do Portfólio</h4>
        <ul className="text-sm space-y-1 text-slate-700">
          <li>• Cursos cadastrados com matriz curricular (módulos e UCs)</li>
          <li>• DR cadastra conforme áreas permitidas no edital vigente</li>
          <li>• Links dos materiais didáticos (Drive ou RD)</li>
          <li>• Versões do curso com histórico</li>
        </ul>
      </div>
    </div>
  )
}

// ========================================
// PÁGINA 4: CONTRATOS
// ========================================

function PaginaContratos() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-purple-800">
        GESTÃO DE CONTRATOS
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Editais */}
        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-400">
          <h4 className="font-bold text-purple-800 mb-3">📋 EDITAIS (DN)</h4>
          <p className="text-sm mb-3 text-slate-700">{fluxoContratos.editais.descricao}</p>
          <div className="text-xs space-y-1 text-slate-700">
            {fluxoContratos.editais.campos.map((campo) => (
              <div key={campo} className="flex items-center gap-1">
                <Check className="w-3 h-3 text-purple-600" />
                {campo}
              </div>
            ))}
          </div>
        </div>

        {/* TAAs */}
        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-400">
          <h4 className="font-bold text-purple-800 mb-3">📄 TAAs (DR)</h4>
          <p className="text-sm mb-3 text-slate-700">{fluxoContratos.taas.descricao}</p>
          <div className="text-xs space-y-1 mb-3 text-slate-700">
            {fluxoContratos.taas.campos.map((campo) => (
              <div key={campo} className="flex items-center gap-1">
                <Check className="w-3 h-3 text-purple-600" />
                {campo}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {fluxoContratos.taas.status.map((s) => (
              <span
                key={s}
                className={cn(
                  'text-xs px-2 py-1 rounded',
                  s === 'Aceito' && 'bg-green-200 text-green-800',
                  s === 'Cancelado' && 'bg-red-200 text-red-800',
                  s === 'Em análise' && 'bg-purple-200 text-purple-800'
                )}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Propostas */}
        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-400">
          <h4 className="font-bold text-purple-800 mb-3">📝 PROPOSTAS</h4>
          <p className="text-sm mb-3 text-slate-700">{fluxoContratos.propostas.descricao}</p>
          <div className="text-xs space-y-1 text-slate-700">
            {fluxoContratos.propostas.campos.map((campo) => (
              <div key={campo} className="flex items-center gap-1">
                <Check className="w-3 h-3 text-purple-600" />
                {campo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ========================================
// PÁGINA 5: PLANEJAMENTO
// ========================================

function PaginaPlanejamento() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-red-800">
        PLANEJAMENTO DA OFERTA
      </h1>

      <div className="bg-red-50 rounded-lg p-6 border-2 border-red-400">
        <h4 className="font-bold text-red-800 mb-3">
          {fluxoPlanejamento.criacaoOferta.titulo}
        </h4>
        <p className="text-sm mb-4 text-slate-700">{fluxoPlanejamento.criacaoOferta.descricao}</p>
        <ul className="text-sm space-y-2 text-slate-700">
          {fluxoPlanejamento.criacaoOferta.regras.map((regra) => (
            <li key={regra} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-red-600" />
              {regra}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-4 items-center justify-center">
        {fluxoPlanejamento.statusOferta.map((status, index) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className={cn(
                'px-4 py-2 rounded-lg font-bold',
                status === 'Confirmada SGE' && 'bg-green-200 text-green-800',
                status !== 'Confirmada SGE' && 'bg-red-200 text-red-800'
              )}
            >
              {status}
            </span>
            {index < fluxoPlanejamento.statusOferta.length - 1 && (
              <span className="text-slate-400">|</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ========================================
// PÁGINA 6: EXECUÇÃO
// ========================================

function PaginaExecucao() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-cyan-800">
        EXECUÇÃO POR UC
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(fluxoExecucao).map(([key, value]) => (
          <div key={key} className="bg-cyan-50 rounded-lg p-4 border-2 border-cyan-400">
            <h4 className="font-bold text-cyan-800 mb-2">{value.titulo}</h4>
            {'descricao' in value && <p className="text-sm text-slate-700">{value.descricao}</p>}
            {'papeis' in value && (
              <div className="flex flex-wrap gap-2 mt-2">
                {value.papeis.map((papel: string) => (
                  <span key={papel} className="px-2 py-1 bg-cyan-200 rounded text-xs text-cyan-800">
                    {papel}
                  </span>
                ))}
              </div>
            )}
            {'status' in value && (
              <div className="flex gap-2 mt-2">
                {value.status.map((s: string) => (
                  <span key={s} className="px-2 py-1 bg-cyan-200 rounded text-xs text-cyan-800">
                    {s}
                  </span>
                ))}
              </div>
            )}
            {'fluxo' in value && (
              <div className="flex items-center gap-2 mt-2">
                {value.fluxo.map((f: string, i: number) => (
                  <div key={f} className="flex items-center gap-1">
                    <span className="px-2 py-1 bg-cyan-200 rounded text-xs text-cyan-800">{f}</span>
                    {i < value.fluxo.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-cyan-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ========================================
// PÁGINA 7: ACOMPANHAMENTO
// ========================================

function PaginaAcompanhamento() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-pink-800">
        ACOMPANHAMENTO PEDAGÓGICO
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Integração */}
        <div className="bg-pink-50 rounded-lg p-4 border-2 border-pink-400">
          <h4 className="font-bold text-pink-800 mb-2">
            {fluxoAcompanhamento.integracaoAlunos.titulo}
          </h4>
          <p className="text-sm text-slate-700">{fluxoAcompanhamento.integracaoAlunos.descricao}</p>
          <div className="mt-2 text-xs bg-pink-200 px-2 py-1 rounded inline-block text-pink-800">
            Prazo: {fluxoAcompanhamento.integracaoAlunos.prazo}
          </div>
        </div>

        {/* Dados AVA */}
        <div className="bg-pink-50 rounded-lg p-4 border-2 border-pink-400">
          <h4 className="font-bold text-pink-800 mb-2">
            {fluxoAcompanhamento.dadosAVA.titulo}
          </h4>
          <div className="flex flex-wrap gap-2">
            {fluxoAcompanhamento.dadosAVA.metricas.map((m) => (
              <span key={m} className="px-2 py-1 bg-pink-200 rounded text-xs text-pink-800">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Ocorrências */}
        <div className="bg-pink-50 rounded-lg p-4 border-2 border-pink-400">
          <h4 className="font-bold text-pink-800 mb-2">
            {fluxoAcompanhamento.ocorrencias.titulo}
          </h4>
          <div className="flex gap-2">
            {fluxoAcompanhamento.ocorrencias.tipos.map((t) => (
              <span key={t} className="px-2 py-1 bg-pink-200 rounded text-xs text-pink-800">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Pesquisas */}
        <div className="bg-pink-50 rounded-lg p-4 border-2 border-pink-400">
          <h4 className="font-bold text-pink-800 mb-2">
            {fluxoAcompanhamento.pesquisas.titulo}
          </h4>
          <div className="space-y-2">
            {fluxoAcompanhamento.pesquisas.tipos.map((p) => (
              <div key={p.id} className="text-xs text-slate-700">
                <span className="font-bold text-pink-800">{p.nome}</span>
                <span className="text-pink-600"> — {p.momento}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ========================================
// PÁGINA 8: INTEGRAÇÕES
// ========================================

function PaginaIntegracoes() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">
        ARQUITETURA DE INTEGRAÇÕES
      </h1>

      {/* Fluxo de dados */}
      <div className="bg-slate-100 rounded-lg p-6 border border-slate-300">
        <h4 className="font-bold text-slate-800 mb-4">🔄 Fluxo de Dados</h4>
        <div className="space-y-3">
          {arquiteturaIntegracoes.fluxoDados.map((fluxo, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-200 rounded font-bold text-sm text-blue-800">
                {fluxo.origem}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-3 py-1 bg-green-200 rounded font-bold text-sm text-green-800">
                {fluxo.destino}
              </span>
              <span className="text-sm text-slate-600">— {fluxo.dados}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Regras de editabilidade */}
      <div className="bg-slate-100 rounded-lg p-6 border border-slate-300">
        <h4 className="font-bold text-slate-800 mb-4">🔒 Regras de Editabilidade</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(arquiteturaIntegracoes.regrasEditabilidade).map(([sistema, regra]) => (
            <div
              key={sistema}
              className={cn(
                'p-4 rounded-lg',
                regra.editavel ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400',
                'border-2'
              )}
            >
              <div className="font-bold text-slate-800">{sistema}</div>
              <div className="text-sm text-slate-700">{regra.descricao}</div>
              <div className="mt-2">
                {regra.editavel ? (
                  <span className="text-green-700 text-xs">✅ Editável</span>
                ) : (
                  <span className="text-red-700 text-xs">🔒 Somente leitura</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ========================================
// PÁGINA 9: AGRUPADOR
// ========================================

function PaginaAgrupador() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-indigo-800">
        AGRUPADOR DE UCs
      </h1>

      <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-400">
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-6 h-6 text-indigo-600 mt-1" />
          <p className="text-lg text-slate-800">{agrupadorUCs.objetivo}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-indigo-800 mb-3">📋 Regras</h4>
            <ul className="space-y-2">
              {agrupadorUCs.regras.map((regra) => (
                <li key={regra} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-indigo-600" />
                  {regra}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-indigo-800 mb-3">✨ Benefícios</h4>
            <ul className="space-y-2">
              {agrupadorUCs.beneficios.map((beneficio) => (
                <li key={beneficio} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-green-600" />
                  {beneficio}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========================================
// PÁGINA 10: FATURAMENTO
// ========================================

function PaginaFaturamento() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-emerald-800">
        FATURAMENTO
      </h1>

      {/* Cálculo base */}
      <div className="bg-emerald-50 rounded-lg p-6 border-2 border-emerald-400">
        <h4 className="font-bold text-emerald-800 mb-3">💰 Cálculo Base</h4>
        <div className="bg-white rounded p-4 font-mono text-lg text-center border border-emerald-300 text-slate-800">
          {fluxoFaturamento.calculoBase.formula}
        </div>
        <p className="text-sm text-emerald-700 mt-2">
          ℹ️ {fluxoFaturamento.calculoBase.regraAlunoAtivo}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alteração de situação */}
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-300">
          <h4 className="font-bold text-emerald-800 mb-2">📝 Alteração de Situação</h4>
          <p className="text-sm text-slate-700">{fluxoFaturamento.alteracaoSituacao.descricao}</p>
          <div className="flex gap-2 mt-2">
            {fluxoFaturamento.alteracaoSituacao.niveis.map((n) => (
              <span key={n} className="px-2 py-1 bg-emerald-200 rounded text-xs text-emerald-800">
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Ajustes */}
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-300">
          <h4 className="font-bold text-emerald-800 mb-2">⚖️ Ajustes</h4>
          <div className="flex gap-2 mb-2">
            {fluxoFaturamento.ajustes.tipos.map((t) => (
              <span key={t} className="px-2 py-1 bg-emerald-200 rounded text-xs text-emerald-800">
                {t}
              </span>
            ))}
          </div>
          <p className="text-xs text-emerald-700">{fluxoFaturamento.ajustes.obrigatorio}</p>
        </div>

        {/* Filtros */}
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-300">
          <h4 className="font-bold text-emerald-800 mb-2">🔍 Filtros de Visualização</h4>
          <div className="flex flex-wrap gap-2">
            {fluxoFaturamento.filtrosVisualizacao.map((f) => (
              <span key={f} className="px-2 py-1 bg-emerald-200 rounded text-xs text-emerald-800">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Relatório */}
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-300">
          <h4 className="font-bold text-emerald-800 mb-2">📊 Relatório de Cobrança</h4>
          <p className="text-sm text-slate-700">{fluxoFaturamento.relatorioCobranca.agrupamento}</p>
          <p className="text-xs text-emerald-700 mt-1">
            {fluxoFaturamento.relatorioCobranca.historico}
          </p>
        </div>
      </div>

      {/* Alerta */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-300 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
        <p className="text-sm text-amber-800">{fluxoFaturamento.reaproveitamento}</p>
      </div>
    </div>
  )
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================

function ModuloCard({
  modulo,
  className,
}: {
  modulo: (typeof modulos)[0]
  className?: string
}) {
  return (
    <div
      className={cn('rounded-xl p-4 border-2', className)}
      style={{
        backgroundColor: modulo.cor,
        borderColor: modulo.corBorda,
      }}
    >
      <div className="text-3xl text-center">{modulo.icone}</div>
      <h3
        className="text-sm font-bold text-center mt-2"
        style={{ color: modulo.corBorda }}
      >
        {modulo.nome}
      </h3>
      <ul className="mt-3 text-xs space-y-1 text-slate-700">
        {modulo.itens.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}
