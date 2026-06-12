import { Pagamento } from '../models/pagamento';
import { PagamentoRepository } from '../../persistence/repositories';

export interface PagamentoService {
  registrar(id_fornecedor: number, valor: number, vencimento: string): Promise<Pagamento>;
  listarPorFornecedor(id_fornecedor: number): Promise<Pagamento[]>;
  listarPorEvento(id_evento: number): Promise<Pagamento[]>;
  pagar(id_pagamento: number): Promise<Pagamento>;
  remover(id_pagamento: number): Promise<void>;
}

export class PagamentoServiceImpl implements PagamentoService {
  constructor(private readonly pagamentoRepository: PagamentoRepository) {}

  async registrar(id_fornecedor: number, valor: number, vencimento: string): Promise<Pagamento> {
    if (!id_fornecedor) throw new Error('Fornecedor e obrigatorio.');
    if (valor <= 0) throw new Error('O valor deve ser maior que zero.');
    if (!vencimento) throw new Error('A data de vencimento e obrigatoria.');
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    if (new Date(vencimento) < hoje) throw new Error('A data de vencimento nao pode ser no passado.');
    return await this.pagamentoRepository.create({ id_pagamento: 0, id_fornecedor, valor, vencimento, status: 'pendente' });
  }

  async listarPorFornecedor(id_fornecedor: number): Promise<Pagamento[]> {
    return await this.pagamentoRepository.getByFornecedor(id_fornecedor);
  }

  async listarPorEvento(id_evento: number): Promise<Pagamento[]> {
    return await this.pagamentoRepository.getByEvento(id_evento);
  }

  async pagar(id_pagamento: number): Promise<Pagamento> {
    return await this.pagamentoRepository.update(id_pagamento, { status: 'pago' });
  }

  async remover(id_pagamento: number): Promise<void> {
    return await this.pagamentoRepository.remove(id_pagamento);
  }
}