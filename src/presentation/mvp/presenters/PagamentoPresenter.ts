import { PagamentoController } from '../../../application/api/controllers/PagamentoController';
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

  constructor(
    private readonly pagamentoController: PagamentoController,
    private readonly id_fornecedor: number,
  ) {}

  attachView(view: PagamentoView) { this.view = view; }
  detachView() { this.view = null; }

  async carregarPagamentos() {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const r = await this.pagamentoController.listar(this.id_fornecedor);
      if (!r.sucesso) throw new Error(r.erro);
      this.view.onPagamentosCarregados(r.dados ?? []);
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao carregar pagamentos.'); }
    finally { this.view.hideLoading(); }
  }

  async handleRegistrar(valor: string, vencimento: string) {
    if (!this.view) return;
    const valorNum = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNum)) { this.view.showError('Valor invalido.'); return; }
    this.view.showLoading();
    try {
      const r = await this.pagamentoController.registrar(this.id_fornecedor, valorNum, vencimento);
      if (!r.sucesso || !r.dados) throw new Error(r.erro);
      this.view.onPagamentoRegistrado(r.dados);
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao registrar pagamento.'); }
    finally { this.view.hideLoading(); }
  }

  async handlePagar(id_pagamento: number) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const r = await this.pagamentoController.pagar(id_pagamento);
      if (!r.sucesso || !r.dados) throw new Error(r.erro);
      this.view.onPagamentoPago(r.dados);
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao confirmar pagamento.'); }
    finally { this.view.hideLoading(); }
  }

  async handleRemover(id_pagamento: number) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const r = await this.pagamentoController.remover(id_pagamento);
      if (!r.sucesso) throw new Error(r.erro);
      this.view.onPagamentoRemovido(id_pagamento);
    } catch (e: any) { this.view.showError(e.message ?? 'Erro ao remover pagamento.'); }
    finally { this.view.hideLoading(); }
  }
}