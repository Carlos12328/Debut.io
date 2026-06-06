import { EntityId } from './usuario';

export type StatusPagamento = 'pendente' | 'pago';

export interface Pagamento {
  id_pagamento: EntityId;
  id_fornecedor: EntityId;
  valor: number;
  vencimento: string;
  status: StatusPagamento;
}
