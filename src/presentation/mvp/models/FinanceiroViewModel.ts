import { Fornecedor } from '../../../domain/models';

export interface FinanceiroFornecedorResumo {
  fornecedor: Fornecedor;
  totalPago: number;
  totalPendente: number;
  quantidadePagamentos: number;
}

export interface FinanceiroViewModel {
  resumos: FinanceiroFornecedorResumo[];
  totalGeralPago: number;
  totalGeralPendente: number;
}
