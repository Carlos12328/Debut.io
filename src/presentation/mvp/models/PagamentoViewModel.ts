export interface PagamentoViewModel {
  id: number;
  idFornecedor: number;
  valor: number;
  valorFormatado: string;
  vencimento: string;
  vencimentoFormatado: string;
  status: 'pendente' | 'pago';
  statusLabel: string;
  atrasado: boolean;
}
