// Dados falsos para os wireframes (seed). Cada coleção vira persistente com useCollection:
//
//   export type Produto = { id: string; nome: string }
//   const produtos: Produto[] = [{ id: '1', nome: 'Produto A' }]
//   export const useProdutos = () => useCollection<Produto>('produtos', produtos)
import { useCollection } from './db'

export { useCollection }
