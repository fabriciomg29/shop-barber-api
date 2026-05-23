export interface Produto {
  id: string
  nome: string
  marca: string
  estoque: number
  estoqueMinimo: number
  precoCusto: number
  precoVenda: number | null
  fornecedor: string
  ultimaCompra: string
  consumivel: boolean
  ativo: boolean
}
