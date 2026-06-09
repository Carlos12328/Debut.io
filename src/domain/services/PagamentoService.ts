/**
 * PagamentoService.ts — Debut.io
 * src/domain/services/PagamentoService.ts
 *
 * CORREÇÕES APLICADAS:
 *   - listarPorFornecedor: estava chamando .list() (bug — retornava tudo)
 *     Corrigido para .getByFornecedor(id_fornecedor)
 *   - listarPorEvento: método novo, usa getByEvento() do repositório
 *     (JOIN direto Supabase — 1 query, sem loop N+1)
 */
import { Pagamento } from '../models/pagamento';
import { PagamentoRepository } from '../../persistence/repositories';

export interface PagamentoService {
  registrar(id_fornecedor: number, valor: number, vencimento: string): Promise<Pagamento>;

  /**
   * Lista pagamentos de um fornecedor específico.
   * CORREÇÃO: era .list() — retornava toda a tabela. Agora usa getByFornecedor().
   */
  listarPorFornecedor(id_fornecedor: number): Promise<Pagamento[]>;

  /**
   * Lista TODOS os pagamentos de um evento via JOIN com fornecedor.
   * Usa getByEvento() do repositório: SELECT *, fornecedor!inner(id_evento)
   * 1 única query — muito mais eficiente que loop por fornecedor.
   * Usado pelo FinanceiroPresenter para carregar o módulo financeiro completo.
   */
  listarPorEvento(id_evento: number): Promise<Pagamento[]>;

  pagar(id_pagamento: number): Promise<Pagamento>;
  remover(id_pagamento: number): Promise<void>;
}

export class PagamentoServiceImpl implements PagamentoService {
  constructor(private readonly pagamentoRepository: PagamentoRepository) {}

  async registrar(id_fornecedor: number, valor: number, vencimento: string): Promise<Pagamento> {
    if (!id_fornecedor) throw new Error('Fornecedor é obrigatório.');
    if (valor <= 0)     throw new Error('O valor deve ser maior que zero.');
    if (!vencimento)    throw new Error('A data de vencimento é obrigatória.');

    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    if (new Date(vencimento) < hoje)
      throw new Error('A data de vencimento não pode ser no passado.');

    return await this.pagamentoRepository.create({
      id_pagamento:  0,
      id_fornecedor,
      valor,
      vencimento,
      status:        'pendente',
    });
  }

  /**
   * ✅ CORRIGIDO: era this.pagamentoRepository.list() — bug grave.
   * Retornava toda a tabela sem filtro algum.
   */
  async listarPorFornecedor(id_fornecedor: number): Promise<Pagamento[]> {
    return await this.pagamentoRepository.getByFornecedor(id_fornecedor);
  }

  /**
   * ✅ NOVO: usa getByEvento() — JOIN direto no Supabase.
   * Substitui o loop N+1 que o FinanceiroPresenter fazia antes.
   */
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
