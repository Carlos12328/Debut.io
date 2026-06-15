import { PagamentoServiceImpl } from '../../../domain/services/PagamentoService';
import { Pagamento } from '../../../domain/models';
import { ResultadoOperacao } from './ResultadoOperacao';

export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoServiceImpl) {}

  async registrar(id_fornecedor: number, valor: number, vencimento: string): Promise<ResultadoOperacao<Pagamento>> {
    try {
      const pagamento = await this.pagamentoService.registrar(id_fornecedor, valor, vencimento);
      return { sucesso: true, dados: pagamento };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  async listar(id_fornecedor: number): Promise<ResultadoOperacao<Pagamento[]>> {
    try {
      const pagamentos = await this.pagamentoService.listarPorFornecedor(id_fornecedor);
      return { sucesso: true, dados: pagamentos };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  async listarPorEvento(id_evento: number): Promise<ResultadoOperacao<Pagamento[]>> {
    try {
      const pagamentos = await this.pagamentoService.listarPorEvento(id_evento);
      return { sucesso: true, dados: pagamentos };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  async pagar(id_pagamento: number): Promise<ResultadoOperacao<Pagamento>> {
    try {
      const pagamento = await this.pagamentoService.pagar(id_pagamento);
      return { sucesso: true, dados: pagamento };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  async remover(id_pagamento: number): Promise<ResultadoOperacao> {
    try {
      await this.pagamentoService.remover(id_pagamento);
      return { sucesso: true };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }
}
