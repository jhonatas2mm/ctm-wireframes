// Dados falsos para os wireframes (seed). Troque à vontade.
import { useCollection } from './db'

export type Item = {
  id: string
  nome: string
  responsavel: string
  status: 'Ativo' | 'Pendente' | 'Arquivado'
  atualizadoEm: string
}

const nomes = ['Projeto Alfa', 'Contrato Beta', 'Pedido Gama', 'Cliente Delta', 'Proposta Épsilon', 'Tarefa Zeta']
const pessoas = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Rocha']
const status: Item['status'][] = ['Ativo', 'Pendente', 'Arquivado']

export const itens: Item[] = Array.from({ length: 24 }).map((_, i) => ({
  id: String(i + 1),
  nome: `${nomes[i % nomes.length]} ${i + 1}`,
  responsavel: pessoas[i % pessoas.length],
  status: status[i % status.length],
  atualizadoEm: new Date(2026, 8, 28 - i).toLocaleDateString('pt-BR'),
}))

// Coleções persistentes (ver src/lib/db.ts). Use nas telas em vez do array direto.
export const useItens = () => useCollection<Item>('itens', itens)
