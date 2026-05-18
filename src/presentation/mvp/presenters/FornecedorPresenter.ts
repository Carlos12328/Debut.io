import { FornecedorService } from '../../../domain/services';
import { Fornecedor } from '../../../domain/models';

export interface FornecedorView {
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onFornecedoresCarregados(fornecedores: Fornecedor[]): void;
  onFornecedorCadastrado(fornecedor: Fornecedor): void;
  onFornecedorRemovido(id: number): void;
}

export class FornecedorPresenter {
  private view: FornecedorView | null = null;

  constructor(
    private readonly fornecedorService: FornecedorService,
    private readonly id_evento: number
  ) {}

  attachView(view: FornecedorView) { this.view = view; }
  detachView() { this.view = null; }

  async carregarFornecedores() {
    if (!this.view) return;
    this.view.showLoading();
    try {
      const lista = await this.fornecedorService.listar(this.id_evento);
      this.view.onFornecedoresCarregados(lista);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao carregar fornecedores.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleCadastrar(nome: string, tipo_servico: string, valor: string) {
    if (!this.view) return;
    const valorNum = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNum)) {
      this.view.showError('Valor inválido.');
      return;
    }
    this.view.showLoading();
    try {
      const fornecedor = await this.fornecedorService.cadastrar(this.id_evento, nome, tipo_servico, valorNum);
      this.view.onFornecedorCadastrado(fornecedor);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao cadastrar fornecedor.');
    } finally {
      this.view.hideLoading();
    }
  }

  async handleRemover(id_fornecedor: number) {
    if (!this.view) return;
    this.view.showLoading();
    try {
      await this.fornecedorService.remover(id_fornecedor);
      this.view.onFornecedorRemovido(id_fornecedor);
    } catch (error: any) {
      this.view.showError(error.message ?? 'Erro ao remover fornecedor.');
    } finally {
      this.view.hideLoading();
    }
  }
}
