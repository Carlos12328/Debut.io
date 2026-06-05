import { PagamentoServiceImpl } from '../../../domain/services/PagamentoService';

export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoServiceImpl) {}

  async registrar(id_fornecedor: number, valor: number, vencimento: string) {
    try {
      const pagamento = await this.pagamentoService.registrar(id_fornecedor, valor, vencimento);
      return { sucesso: true, dados: pagamento };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  async listar(id_fornecedor: number) {
    try {
      const pagamentos = await this.pagamentoService.listarPorFornecedor(id_fornecedor);
      return { sucesso: true, dados: pagamentos };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  async pagar(id_pagamento: number) {
    try {
      const pagamento = await this.pagamentoService.pagar(id_pagamento);
      return { sucesso: true, dados: pagamento };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  async remover(id_pagamento: number) {
    try {
      await this.pagamentoService.remover(id_pagamento);
      return { sucesso: true };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }
}
