export interface FornecedorViewModel {
  id: number;
  idEvento: number;
  nome: string;
  tipoServico: string;
  valor: number;
  valorFormatado: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}
