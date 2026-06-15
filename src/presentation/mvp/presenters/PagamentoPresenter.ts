import { Pagamento } from '../../../domain/models';
import { PagamentoController } from '../../../application/api/controllers/PagamentoController';

export interface PagamentoView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onPagamentosCarregados(pagamentos: Pagamento[]): void;
  onPagamentoRegistrado(pagamento: Pagamento): void;
  onPagamentoPago(pagamento: Pagamento): void;
  onPagamentoRemovido(id: number): void;
}

export class PagamentoPresenter {
  private view: PagamentoView | null = null;

  constructor(private readonly pagamentoController: PagamentoController) {}

  attachView(view: PagamentoView) { this.view = view; }
  detachView() { this.view = null; }

  async carregarPagamentos(id_fornecedor: number) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const resposta = await this.pagamentoController.listar(id_fornecedor);
      if (!resposta.sucesso || !resposta.dados) {
        this.view.showError(resposta.erro ?? 'Erro ao carregar pagamentos.');
        return;
      }
      this.view.onPagamentosCarregados(resposta.dados);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao carregar pagamentos.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleRegistrar(id_fornecedor: number, valor: string, vencimento: string) {
    if (!this.view) return;
    const valorNum = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNum)) { this.view.showError('Valor invalido.'); return; }
    this.view.showLoading();
    try {
      const resposta = await this.pagamentoController.registrar(id_fornecedor, valorNum, vencimento);
      if (!resposta.sucesso || !resposta.dados) {
        this.view.showError(resposta.erro ?? 'Erro ao registrar pagamento.');
        return;
      }
      this.view.onPagamentoRegistrado(resposta.dados);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao registrar pagamento.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handlePagar(id_pagamento: number) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const resposta = await this.pagamentoController.pagar(id_pagamento);
      if (!resposta.sucesso || !resposta.dados) {
        this.view.showError(resposta.erro ?? 'Erro ao confirmar pagamento.');
        return;
      }
      this.view.onPagamentoPago(resposta.dados);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao confirmar pagamento.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleRemover(id_pagamento: number) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const resposta = await this.pagamentoController.remover(id_pagamento);
      if (!resposta.sucesso) {
        this.view.showError(resposta.erro ?? 'Erro ao remover pagamento.');
        return;
      }
      this.view.onPagamentoRemovido(id_pagamento);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao remover pagamento.');
    } finally {
      this.view.hideLoading();
    }
  }
}
