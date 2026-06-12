import { PagamentoServiceImpl } from '../../../domain/services/PagamentoService';
import { Pagamento } from '../../../domain/models';
import { ResultadoOperacao } from './ResultadoOperacao';

export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoServiceImpl) {}

  async registrar(id_fornecedor: number, valor: number, vencimento: string): Promise<ResultadoOperacao<Pagamento>> {
    try { return { sucesso: true, dados: await this.pagamentoService.registrar(id_fornecedor, valor, vencimento) }; }
    catch (e: any) { return { sucesso: false, erro: e.message }; }
  }

  async listar(id_fornecedor: number): Promise<ResultadoOperacao<Pagamento[]>> {
    try { return { sucesso: true, dados: await this.pagamentoService.listarPorFornecedor(id_fornecedor) }; }
    catch (e: any) { return { sucesso: false, erro: e.message }; }
  }

  async listarPorEvento(id_evento: number): Promise<ResultadoOperacao<Pagamento[]>> {
    try { return { sucesso: true, dados: await this.pagamentoService.listarPorEvento(id_evento) }; }
    catch (e: any) { return { sucesso: false, erro: e.message }; }
  }

  async pagar(id_pagamento: number): Promise<ResultadoOperacao<Pagamento>> {
    try { return { sucesso: true, dados: await this.pagamentoService.pagar(id_pagamento) }; }
    catch (e: any) { return { sucesso: false, erro: e.message }; }
  }

  async remover(id_pagamento: number): Promise<ResultadoOperacao> {
    try { await this.pagamentoService.remover(id_pagamento); return { sucesso: true }; }
    catch (e: any) { return { sucesso: false, erro: e.message }; }
  }
}