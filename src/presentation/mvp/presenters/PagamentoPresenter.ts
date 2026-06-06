import { PagamentoService } from '../../../domain/services/PagamentoService';
import { Pagamento } from '../../../domain/models';

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

  constructor(private readonly pagamentoService: PagamentoService) {}

  attachView(view: PagamentoView) { this.view = view; }
  detachView() { this.view = null; }

  async handleRegistrar(id_fornecedor: number, valor: string, vencimento: string) {
    if (!this.view) return;
    const valorNum = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNum)) { this.view.showError('Valor invalido.'); return; }
    this.view.showLoading();
    try {
      const pagamento = await this.pagamentoService.registrar(id_fornecedor, valorNum, vencimento);
      this.view.onPagamentoRegistrado(pagamento);
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
      const pagamento = await this.pagamentoService.pagar(id_pagamento);
      this.view.onPagamentoPago(pagamento);
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
      await this.pagamentoService.remover(id_pagamento);
      this.view.onPagamentoRemovido(id_pagamento);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao remover pagamento.');
    } finally {
      this.view.hideLoading();
    }
  }
}
