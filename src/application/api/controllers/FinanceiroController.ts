/**
 * FinanceiroController.ts — Debut.io
 * src/application/api/controllers/FinanceiroController.ts
 *
 * Camada de aplicação entre Presenter e PagamentoService.
 * Padrão idêntico ao FornecedorController.ts e CompromissoController.ts.
 */
import { PagamentoServiceImpl } from '../../../domain/services/PagamentoService';

export class FinanceiroController {
  constructor(private readonly pagamentoService: PagamentoServiceImpl) {}

  async registrar(id_fornecedor: number, valor: number, vencimento: string) {
    try {
      const p = await this.pagamentoService.registrar(id_fornecedor, valor, vencimento);
      return { sucesso: true, dados: p };
    } catch (e: any) { return { sucesso: false, erro: e.message }; }
  }

  async listarPorFornecedor(id_fornecedor: number) {
    try {
      const lista = await this.pagamentoService.listarPorFornecedor(id_fornecedor);
      return { sucesso: true, dados: lista };
    } catch (e: any) { return { sucesso: false, erro: e.message }; }
  }

  async pagar(id_pagamento: number) {
    try {
      const p = await this.pagamentoService.pagar(id_pagamento);
      return { sucesso: true, dados: p };
    } catch (e: any) { return { sucesso: false, erro: e.message }; }
  }

  async remover(id_pagamento: number) {
    try {
      await this.pagamentoService.remover(id_pagamento);
      return { sucesso: true };
    } catch (e: any) { return { sucesso: false, erro: e.message }; }
  }
}
